import React from "react";
import { Box, CircularProgress } from "@mui/material";

interface GlobalLoadingIndicatorProps {
  loading: boolean;
}

export const GlobalLoadingIndicator: React.FC<GlobalLoadingIndicatorProps> = ({
  loading,
}) => {
  if (!loading) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.1)",
        zIndex: 9999,
      }}
    >
      <CircularProgress size={60} />
    </Box>
  );
};
