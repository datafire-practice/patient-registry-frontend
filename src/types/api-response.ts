import { Patient } from "./patient";
import { Disease } from "./disease";
import { Mkb10DictionaryItem } from "./mkb10";

export interface PatientsApiResponse {
  content: Patient[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface DiseasesApiResponse {
  content: Disease[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface Mkb10DictionaryResponse {
  content: Mkb10DictionaryItem[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
