import React from "react";
import { PatientTable } from "../components";

const RegistryPage: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: "rgb(226 234 255)",
        minHeight: "100vh",
      }}
    >
      <PatientTable />
    </div>
  );
};

export default RegistryPage;
