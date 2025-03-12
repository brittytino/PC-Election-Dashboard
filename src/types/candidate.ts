
export interface Candidate {
  id: string;
  name: string;
  position: string;
  department: string;
  shift: string;
  year: number;
  photo: string;
  appliedAt: Date;
}

export interface Rating {
  candidateId: string;
  interviewer: string;
  scores: {
    presentation: number;
    communication: number;
    technicalSkills: number;
    problemSolving: number;
    teamwork: number;
    leadership: number;
    initiative: number;
    adaptability: number;
    workEthic: number;
    overallFit: number;
  };
  remarks: string;
  ratedAt: Date;
}

export const DEPARTMENTS = [
  'Engineering',
  'Marketing',
  'Sales',
  'Human Resources',
  'Finance',
  'Operations'
] as const;

export const POSITIONS = [
  'Software Engineer',
  'Product Manager',
  'Marketing Specialist',
  'Sales Representative',
  'HR Manager'
] as const;

export const SHIFTS = ['Morning', 'Afternoon', 'Night'] as const;
