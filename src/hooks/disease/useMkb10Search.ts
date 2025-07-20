import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import {
  API_ENDPOINTS,
  PAGINATION,
  ERROR_MESSAGES,
} from "../../utils/constants";
import type { Mkb10DictionaryItem } from "../../types";

interface UseMkb10SearchResult {
  mkb10Options: Mkb10DictionaryItem[];
  loadingMkb10: boolean;
  mkb10Error: string | null;
  listboxRef: React.RefObject<HTMLUListElement | null>;
  handleScroll: (event: React.SyntheticEvent<Element, Event>) => void;
  handleSearchChange: (
    _event: React.SyntheticEvent<Element, Event>,
    value: string
  ) => void;
  handleAutocompleteOpen: () => void;
  resetMkb10Search: () => void;
}

export const useMkb10Search = (): UseMkb10SearchResult => {
  const [mkb10Options, setMkb10Options] = useState<Mkb10DictionaryItem[]>([]);
  const [loadingMkb10, setLoadingMkb10] = useState<boolean>(false);
  const [mkb10Page, setMkb10Page] = useState<number>(0);
  const [hasMoreMkb10, setHasMoreMkb10] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mkb10Error, setMkb10Error] = useState<string | null>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const scrollPositionRef = useRef<number>(0);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMkb10 = useCallback(
    async (
      page: number,
      search: string = "",
      reset: boolean = false
    ): Promise<void> => {
      setLoadingMkb10(true);
      setMkb10Error(null);
      try {
        const url: string = `${
          API_ENDPOINTS.MKB10_DICTIONARY
        }?page=${page}&size=${PAGINATION.MKB10_PAGE_SIZE}${
          search ? `&search=${encodeURIComponent(search)}` : ""
        }`;

        const response = await axios.get(url);

        if (reset || page === 0) {
          setMkb10Options(response.data.content);
        } else {
          setMkb10Options((prev) => [...prev, ...response.data.content]);
        }

        setHasMoreMkb10(
          (page + 1) * PAGINATION.MKB10_PAGE_SIZE < response.data.totalElements
        );
      } catch (error) {
        console.error("Error fetching MKB10 dictionary:", error);
        if (axios.isAxiosError(error)) {
          if (error.code === "ERR_NETWORK" || error.response?.status === 503) {
            setMkb10Error(ERROR_MESSAGES.SERVICE_UNAVAILABLE);
          } else {
            setMkb10Error(
              error.response?.data?.message || ERROR_MESSAGES.UNKNOWN_ERROR
            );
          }
        } else {
          setMkb10Error(ERROR_MESSAGES.UNKNOWN_ERROR);
        }
      } finally {
        setLoadingMkb10(false);
      }
    },
    []
  );

  useEffect((): void => {
    fetchMkb10(0, "", true);
  }, [fetchMkb10]);

  useEffect((): void => {
    if (
      !loadingMkb10 &&
      listboxRef.current &&
      scrollPositionRef.current !== 0
    ) {
      listboxRef.current.scrollTop = scrollPositionRef.current;
      scrollPositionRef.current = 0;
    }
  }, [loadingMkb10, mkb10Options]);

  const handleScroll = useCallback(
    (event: React.SyntheticEvent<Element, Event>): void => {
      const listboxNode = event.currentTarget as HTMLUListElement;
      if (
        listboxNode.scrollTop + listboxNode.clientHeight >=
          listboxNode.scrollHeight - 5 &&
        !loadingMkb10 &&
        hasMoreMkb10
      ) {
        scrollPositionRef.current = listboxNode.scrollTop;
        const nextPage: number = mkb10Page + 1;
        setMkb10Page(nextPage);
        fetchMkb10(nextPage, searchQuery);
      }
    },
    [loadingMkb10, hasMoreMkb10, mkb10Page, searchQuery, fetchMkb10]
  );

  const handleSearchChange = useCallback(
    (_event: React.SyntheticEvent<Element, Event>, value: string): void => {
      setSearchQuery(value);

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        setMkb10Page(0);
        fetchMkb10(0, value, true);
      }, 300);
    },
    [fetchMkb10]
  );

  const handleAutocompleteOpen = useCallback((): void => {
    if (mkb10Options.length === 0 || (mkb10Page === 0 && searchQuery === "")) {
      fetchMkb10(0, "", true);
    }
  }, [fetchMkb10, mkb10Options.length, mkb10Page, searchQuery]);

  const resetMkb10Search = useCallback((): void => {
    setMkb10Options([]);
    setLoadingMkb10(false);
    setMkb10Page(0);
    setHasMoreMkb10(true);
    setSearchQuery("");
    setMkb10Error(null);
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, []);

  return {
    mkb10Options,
    loadingMkb10,
    mkb10Error,
    listboxRef,
    handleScroll,
    handleSearchChange,
    handleAutocompleteOpen,
    resetMkb10Search,
  };
};
