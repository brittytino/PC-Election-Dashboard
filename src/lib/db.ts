import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface CandidateDB extends DBSchema {
  candidates: {
    key: string;
    value: {
      id: string;
      name: string;
      position: string;
      department: string;
      shift: number;
      year: number;
      photo: string;
      appliedAt: Date;
      regNo: string;
      email: string;
    };
    indexes: { 'by-department': string; 'by-position': string };
  };
  ratings: {
    key: string;
    value: {
      id: string;
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
        attitude: number;
        adaptability: number;
        overallImpression: number;
      };
      remarks: string;
      ratedAt: Date;
    };
    indexes: { 'by-candidate': string; 'by-interviewer': string };
  };
  nominees: {
    key: string;
    value: {
      id: string;
      name: string;
      email: string;
      regNo: string;
      shift: number;
      department: string;
      position: string;
      votes: number;
      nominatedAt: Date;
    };
    indexes: { 'by-position': string; 'by-regNo': string };
  };
  votes: {
    key: string;
    value: {
      id: string;
      nomineeId: string;
      position: string;
      voterRegNo: string;
      votedAt: Date;
    };
    indexes: { 'by-nominee': string; 'by-voter': string };
  };
}

let db: IDBPDatabase<CandidateDB>;

export async function initDB() {
  db = await openDB<CandidateDB>('interview-db', 2, {
    upgrade(db, oldVersion, newVersion) {
      if (oldVersion < 1) {
        const candidateStore = db.createObjectStore('candidates', {
          keyPath: 'id',
        });
        candidateStore.createIndex('by-department', 'department');
        candidateStore.createIndex('by-position', 'position');

        const ratingsStore = db.createObjectStore('ratings', {
          keyPath: 'id',
        });
        ratingsStore.createIndex('by-candidate', 'candidateId');
        ratingsStore.createIndex('by-interviewer', 'interviewer');
      }
      
      if (oldVersion < 2) {
        const nomineesStore = db.createObjectStore('nominees', {
          keyPath: 'id',
        });
        nomineesStore.createIndex('by-position', 'position');
        nomineesStore.createIndex('by-regNo', 'regNo');

        const votesStore = db.createObjectStore('votes', {
          keyPath: 'id',
        });
        votesStore.createIndex('by-nominee', 'nomineeId');
        votesStore.createIndex('by-voter', 'voterRegNo');
      }
    },
  });
  return db;
}

export async function addCandidate(candidate: CandidateDB['candidates']['value']) {
  if (!db) await initDB();
  return db.add('candidates', candidate);
}

export async function getCandidates() {
  if (!db) await initDB();
  return db.getAll('candidates');
}

export async function getCandidate(id: string) {
  if (!db) await initDB();
  return db.get('candidates', id);
}

export async function addRating(rating: CandidateDB['ratings']['value']) {
  if (!db) await initDB();
  return db.add('ratings', rating);
}

export async function getRatings() {
  if (!db) await initDB();
  return db.getAll('ratings');
}

export async function getRatingsByCandidate(candidateId: string) {
  if (!db) await initDB();
  const index = db.transaction('ratings').store.index('by-candidate');
  return index.getAll(candidateId);
}

export async function getRatingsByInterviewer(interviewer: string) {
  if (!db) await initDB();
  const index = db.transaction('ratings').store.index('by-interviewer');
  return index.getAll(interviewer);
}

export async function addNominee(nominee: CandidateDB['nominees']['value']) {
  if (!db) await initDB();
  return db.add('nominees', nominee);
}

export async function getNominees() {
  if (!db) await initDB();
  return db.getAll('nominees');
}

export async function getNomineesByPosition(position: string) {
  if (!db) await initDB();
  const index = db.transaction('nominees').store.index('by-position');
  return index.getAll(position);
}

export async function updateNominee(nominee: CandidateDB['nominees']['value']) {
  if (!db) await initDB();
  return db.put('nominees', nominee);
}

export async function deleteNominee(id: string) {
  if (!db) await initDB();
  return db.delete('nominees', id);
}

export async function addVote(vote: CandidateDB['votes']['value']) {
  if (!db) await initDB();
  
  // Add vote record
  await db.add('votes', vote);
  
  // Update nominee votes count
  const nominee = await db.get('nominees', vote.nomineeId);
  if (nominee) {
    nominee.votes = (nominee.votes || 0) + 1;
    await db.put('nominees', nominee);
  }
  
  return true;
}

export async function getVotes() {
  if (!db) await initDB();
  return db.getAll('votes');
}

export async function hasVoted(voterRegNo: string, position: string) {
  if (!db) await initDB();
  const votes = await db.getAll('votes');
  return votes.some(vote => vote.voterRegNo === voterRegNo && vote.position === position);
}
