
export function calculateAverageScores(ratings: any[]) {
  if (ratings.length === 0) return null;
  
  // Initialize all possible parameters to avoid type errors
  const initialScores: {[key: string]: number} = {
    presentation: 0,
    communication: 0,
    visionAndMission: 0,
    achievements: 0,
    leadership: 0,
    problemSolving: 0,
    teamwork: 0,
    creativityAndInnovation: 0,
    motivationAndPassion: 0,
    professionalism: 0,
  };
  
  // Count occurrences of each parameter
  const counts: {[key: string]: number} = {};
  Object.keys(initialScores).forEach(key => {
    counts[key] = 0;
  });
  
  // Sum up all scores
  const totalScores = ratings.reduce((acc, rating) => {
    Object.entries(rating.scores).forEach(([key, value]) => {
      // Make sure the key exists in our initial scores
      if (key in acc) {
        acc[key] += Number(value);
        counts[key]++;
      }
    });
    return acc;
  }, {...initialScores});
  
  // Calculate averages
  const averageScores: {[key: string]: number} = {};
  Object.keys(totalScores).forEach(key => {
    averageScores[key] = counts[key] > 0 ? totalScores[key] / counts[key] : 0;
  });
  
  return averageScores;
}

export function calculateOverallAverage(ratings: any[]) {
  const avgScores = calculateAverageScores(ratings);
  if (!avgScores) return 0;
  
  let sum = 0;
  let count = 0;
  
  Object.entries(avgScores).forEach(([_, value]) => {
    if (value > 0) {
      sum += value;
      count++;
    }
  });
  
  return count > 0 ? sum / count : 0;
}
