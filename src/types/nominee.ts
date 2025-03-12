
export interface Nominee {
  id: string;
  name: string;
  email: string;
  regNo: string;
  shift: number;
  department: string;
  position: string;
  votes: number;
  nominatedAt: Date;
}

export interface Vote {
  id: string;
  nomineeId: string;
  position: string;
  voterRegNo: string;
  votedAt: Date;
}

export type Position = 'Chairman' | 'Vice Chairman' | 'Secretary' | 'Joint Secretary';

export const departments = [
  'CS', 
  'IT', 
  'CS CS', 
  'CS DA', 
  'AI DS', 
  'CT', 
  'DCFS', 
  'BCA', 
  'CYB SEC'
];

export const positions: Position[] = [
  'Chairman',
  'Vice Chairman',
  'Secretary',
  'Joint Secretary'
];

export const positionRules = {
  'Chairman': { shift: 1, year: 3 },
  'Vice Chairman': { shift: 2, year: 3 },
  'Secretary': { shift: 1, year: 2 },
  'Joint Secretary': { shift: 2, year: 2 }
};

export function getYearFromRegNo(regNo: string): number {
  if (regNo.startsWith('23')) {
    return 3;
  } else if (regNo.startsWith('24')) {
    return 2;
  }
  return 1; // Default or first year
}

export function isEligibleForPosition(position: Position, shift: number, regNo: string): boolean {
  const year = getYearFromRegNo(regNo);
  const rules = positionRules[position];
  
  return rules.shift === shift && rules.year === year;
}
