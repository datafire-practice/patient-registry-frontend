import React from "react";
import { Container, Box, Typography, Link } from "@mui/material";

interface PatientTableErrorStateProps {
  error: string;
  onRefresh: () => void;
}

export const PatientTableErrorState: React.FC<PatientTableErrorStateProps> = ({
  error,
  onRefresh,
}) => {
  return (
    <Container
      maxWidth={false}
      sx={{
        py: 3,
        width: { xs: "100%", lg: "1440px", xl: "1920px" },
        px: { xs: 2, lg: 3 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "200px",
          gap: "16px",
        }}
      >
        <Typography
          variant="h6"
          color="error"
          sx={{ fontSize: { xs: "1rem", lg: "1.25rem" } }}
        >
          {error.split("Обновить")[0]}
          <Link
            component="button"
            variant="h6"
            onClick={onRefresh}
            sx={{
              color: "error.main",
              textDecoration: "underline",
              fontSize: { xs: "1rem", lg: "1.25rem" },
            }}
          >
            Обновить
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};
