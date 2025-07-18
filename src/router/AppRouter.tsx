import React from "react";
import { Routes, Route } from "react-router-dom";
import RegistryPage from "../pages/RegistryPage";

const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<RegistryPage />} />
      <Route path="/registry" element={<RegistryPage />} />
    </Routes>
  );
};

export default AppRouter;
