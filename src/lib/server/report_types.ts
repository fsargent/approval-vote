export type CandidateId = number;
export type Allocatee = CandidateId;

// index.json

export interface IReportIndex {
  elections: IElectionIndexEntry[];
}

export interface IReportIndexByYear {
  [year: string]: IElectionIndexEntry[];
}

export interface IElectionIndexEntry {
  path: string;
  jurisdictionName: string;
  electionName: string;
  date: string;
  contests: IContestIndexEntry[];
}

export interface IContestIndexEntry {
  office: string;
  officeName: string;
  name: string;
  winners: string;
  numCandidates: number;
}

// report.json

export interface IContestReport {
  info: IElectionInfo;
  ballotCount: number;
  candidates: ICandidate[];
  winners: CandidateId[];
  condorcet?: CandidateId;
  numCandidates: number;
}

export interface IElectionInfo {
  name: string;
  date: string;
  dataFormat: string;
  tabulation: string;
  jurisdictionPath: string;
  electionPath: string;
  office: string;
  loaderParams?: { [param: string]: string };
  jurisdictionName: string;
  officeName: string;
  electionName: string;
  website?: string;
  notes?: string;
  hidden?: boolean;
}

export interface ICandidate {
  name: string;
  writeIn?: boolean;
  votes: number;
  winner?: boolean;
}
