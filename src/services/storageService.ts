// Define types for our stored data
export interface StoredUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'interviewer';
}

export interface StoredCandidate {
  id: number;
  name: string;
  email: string;
  regNo: string;
  shift: string;
  department: string;
  year: number;
  position: string;
}

export interface StoredRating {
  id: string;
  candidateId: string | number;
  interviewer: string;
  scores: {
    presentation: number;
    communication: number;
    visionAndMission: number;
    achievements: number;
    leadership: number;
    problemSolving: number;
    teamwork: number;
    creativityAndInnovation: number;
    motivationAndPassion: number;
    professionalism: number;
  };
  remarks: string;
  ratedAt: Date | string;
}

// Storage keys
const STORAGE_KEYS = {
  USERS: 'interview_system_users',
  CANDIDATES: 'interview_system_candidates',
  RATINGS: 'interview_system_ratings',
  CURRENT_USER: 'interview_system_current_user',
};

// Initial data to preload
const initialUsers: StoredUser[] = [
  {
    id: 1,
    name: "Admin",
    email: "admin@srcas.ac.in",
    password: "admin123",
    role: "admin"
  },
  {
    id: 2,
    name: "Interviewer 1",
    email: "interviewer1@srcas.ac.in",
    password: "club123",
    role: "interviewer"
  },
  {
    id: 3,
    name: "Interviewer 2",
    email: "interviewer2@srcas.ac.in",
    password: "club123",
    role: "interviewer"
  },
  {
    id: 4,
    name: "Interviewer 3",
    email: "interviewer3@srcas.ac.in",
    password: "club123",
    role: "interviewer"
  }
];

const initialCandidates: StoredCandidate[] = [
  {
    id: 1,
    name: "NILASHREE G",
    email: "23107104@srcas.ac.in",
    regNo: "23107104",
    shift: "2",
    department: "BSC IT",
    year: 3,
    position: "Vice Chairman"
  },
  {
    id: 2,
    name: "Ayyappadas TV",
    email: "tvayyappadas@gmail.com",
    regNo: "24129008",
    shift: "2",
    department: "BSC CT",
    year: 2,
    position: "Joint Secretary"
  },
  {
    id: 3,
    name: "Dharsini S",
    email: "24128017@srcas.ac.in",
    regNo: "24128017",
    shift: "2",
    department: "BSC CS AI DS",
    year: 2,
    position: "Joint Secretary"
  },
  {
    id: 4,
    name: "Dhananjay R S",
    email: "24106078@srcas.ac.in",
    regNo: "24106078",
    shift: "2",
    department: "BSC Computer Science",
    year: 2,
    position: "Joint Secretary"
  },
  {
    id: 5,
    name: "Sri Thraishika S",
    email: "24128062@srcas.ac.in",
    regNo: "24128062",
    shift: "2",
    department: "BSC CS AI DS",
    year: 2,
    position: "Joint Secretary"
  },
  {
    id: 6,
    name: "Choudhry",
    email: "24107078@srcas.ac.in",
    regNo: "24107078",
    shift: "2",
    department: "BSC IT",
    year: 2,
    position: "Joint Secretary"
  },
  {
    id: 7,
    name: "Samrutha S",
    email: "samruthasenthilkumar06@gmail.com",
    regNo: "24127056",
    shift: "1",
    department: "BSC CS DA",
    year: 2,
    position: "Secretary"
  },
  {
    id: 8,
    name: "KAVIYAN S",
    email: "skaviyan004@gmail.com",
    regNo: "24127034",
    shift: "1",
    department: "BSC CS DA",
    year: 2,
    position: "Secretary"
  },
  {
    id: 9,
    name: "Kavinraj J S",
    email: "kaviee2507@gmail.com",
    regNo: "24127033",
    shift: "1",
    department: "BSC CS DA",
    year: 2,
    position: "Secretary"
  },
  {
    id: 10,
    name: "Sarath P",
    email: "23107116@srcas.ac.in",
    regNo: "23107116",
    shift: "2",
    department: "BSC IT",
    year: 3,
    position: "Vice Chairman"
  },
  {
    id: 11,
    name: "Mathivathani AG",
    email: "mathianand1036@gmail.com",
    regNo: "24129029",
    shift: "2",
    department: "BSC CT",
    year: 2,
    position: "Joint Secretary"
  },
  {
    id: 12,
    name: "Pravin B",
    email: "23127035@srcas.ac.in",
    regNo: "23127035",
    shift: "1",
    department: "BSC CS DA",
    year: 3,
    position: "Chairman"
  },
  {
    id: 13,
    name: "Kaniskha C",
    email: "23128025@srcas.ac.in",
    regNo: "23128025",
    shift: "2",
    department: "BSC CS AI DS",
    year: 3,
    position: "Vice Chairman"
  },
  {
    id: 14,
    name: "Choudhry",
    email: "24107078@srcas.ac.in",
    regNo: "24107078",
    shift: "2",
    department: "BSC IT",
    year: 2,
    position: "Joint Secretary"
  },
  {
    id: 15,
    name: "Samrutha S",
    email: "samruthasenthilkumar06@gmail.com",
    regNo: "24127056",
    shift: "1",
    department: "BSC CS DA",
    year: 2,
    position: "Secretary"
  }
];

// Initialize storage with default data if it doesn't exist
export const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.CANDIDATES)) {
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(initialCandidates));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.RATINGS)) {
    localStorage.setItem(STORAGE_KEYS.RATINGS, JSON.stringify([]));
  }
};

// Generic get function
export const getStoredData = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

// Generic set function
export const setStoredData = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// User specific functions
export const getUsers = (): StoredUser[] => {
  return getStoredData<StoredUser[]>(STORAGE_KEYS.USERS, []);
};

export const authenticateUser = (email: string, password: string): StoredUser | null => {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    // Store current user in localStorage (without password)
    const { password: _, ...safeUser } = user;
    setStoredData(STORAGE_KEYS.CURRENT_USER, safeUser);
  }
  return user || null;
};

export const getCurrentUser = () => {
  return getStoredData(STORAGE_KEYS.CURRENT_USER, null);
};

export const logoutUser = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

// Candidate functions
export const getCandidates = (): StoredCandidate[] => {
  return getStoredData<StoredCandidate[]>(STORAGE_KEYS.CANDIDATES, []);
};

export const getCandidate = (id: string | number): StoredCandidate | undefined => {
  const candidates = getCandidates();
  return candidates.find(c => c.id.toString() === id.toString());
};

// Rating functions
export const getRatings = (): StoredRating[] => {
  return getStoredData<StoredRating[]>(STORAGE_KEYS.RATINGS, []);
};

export const addRating = (rating: StoredRating): void => {
  const ratings = getRatings();
  ratings.push(rating);
  setStoredData(STORAGE_KEYS.RATINGS, ratings);
};

export const getRatingsByCandidate = (candidateId: string | number): StoredRating[] => {
  const ratings = getRatings();
  return ratings.filter(r => r.candidateId.toString() === candidateId.toString());
};

export const getRatingsByInterviewer = (interviewer: string): StoredRating[] => {
  const ratings = getRatings();
  return ratings.filter(r => r.interviewer === interviewer);
};

// Data export and import functions
export const exportData = (): string => {
  const data = {
    users: getUsers(),
    candidates: getCandidates(),
    ratings: getRatings()
  };
  return JSON.stringify(data);
};

export const importData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    
    // Validate the structure of the data
    if (!data.users || !data.candidates || !data.ratings) {
      return false;
    }
    
    // Store the data
    setStoredData(STORAGE_KEYS.USERS, data.users);
    setStoredData(STORAGE_KEYS.CANDIDATES, data.candidates);
    setStoredData(STORAGE_KEYS.RATINGS, data.ratings);
    
    return true;
  } catch (error) {
    console.error("Failed to import data:", error);
    return false;
  }
};
