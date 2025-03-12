
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
    creativity: number;
    adaptability: number;
    initiative: number;
    overall: number;
  };
  remarks: string;
  ratedAt: Date;
}

export type Department = 'Engineering' | 'Design' | 'Marketing' | 'Sales' | 'HR';
export type Position = 'Software Engineer' | 'UI Designer' | 'Marketing Manager' | 'Sales Representative' | 'HR Manager';
export type Shift = 'Morning' | 'Afternoon' | 'Night';
