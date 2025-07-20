import { Mkb10 } from "./mkb10";

export interface Disease {
  id: number;
  mkb10: Mkb10;
  startDate: string;
  endDate?: string | null;
  prescriptions: string;
  sickLeaveIssued: boolean;
}

export interface DiseaseFormData {
  patient: {
    id: number;
  };
  mkb10: {
    code: string;
    name: string;
  };
  startDate: string;
  endDate?: string | null;
  prescriptions: string;
  sickLeaveIssued: boolean;
}
