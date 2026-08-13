export interface SubSeed {
  name: string;
  phone: string;
  email: string;
  division: string[];
  subjects: string[];
  additionalInfo: string;
  hrApproved: boolean;
  needsApproval: boolean;
  photo?: string | null;
}

export interface TeacherSeed {
  name: string;
  subject: string;
  room: string;
  email: string;
  phone: string;
  photo?: string | null;
}

export interface AdminSeed {
  name: string;
  email: string;
  phone: string;
}
