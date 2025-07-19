export interface Mkb10 {
  code: string;
  name: string;
}

export interface Disease {
  id: number;
  mkb10: Mkb10;
  startDate: string;
  endDate?: string | null;
  prescriptions: string;
  sickLeaveIssued: boolean;
}

export interface Patient {
  id: number;
  lastName: string;
  firstName: string;
  middleName?: string;
  gender: "М" | "Ж";
  birthDate: string;
  insuranceNumber: string;
  diseases?: Disease[];
}

export interface PatientFormData {
  lastName: string;
  firstName: string;
  middleName?: string;
  gender: "М" | "Ж";
  birthDate: string;
  insuranceNumber: string;
}

export interface PageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface PatientsApiResponse {
  content: Patient[];
  page: PageInfo;
}
