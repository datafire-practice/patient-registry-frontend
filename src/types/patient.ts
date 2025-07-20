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
}

export interface PatientFormData {
  lastName: string;
  firstName: string;
  middleName?: string;
  gender: "М" | "Ж";
  birthDate: string;
  insuranceNumber: string;
}

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

export interface Mkb10DictionaryItem {
  code: string;
  name: string;
}

export interface Mkb10DictionaryResponse {
  content: Mkb10DictionaryItem[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
