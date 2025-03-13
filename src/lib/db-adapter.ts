
import { 
  getCandidate as getStoredCandidate,
  getCandidates as getStoredCandidates,
  addRating as addStoredRating,
  getRatings as getStoredRatings,
  getRatingsByCandidate as getStoredRatingsByCandidate,
  StoredRating
} from '@/services/storageService';

// This adapter file provides backward compatibility with 
// the existing db.ts functions but uses localStorage

export const getCandidate = async (id: string) => {
  return getStoredCandidate(id);
};

export const getCandidates = async () => {
  return getStoredCandidates();
};

export const addRating = async (rating: StoredRating) => {
  return addStoredRating(rating);
};

export const getRatings = async () => {
  return getStoredRatings();
};

export const getRatingsByCandidate = async (candidateId: string) => {
  return getStoredRatingsByCandidate(candidateId);
};
