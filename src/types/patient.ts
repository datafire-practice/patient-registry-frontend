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
