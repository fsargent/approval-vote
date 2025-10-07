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
  winners: string[];
  numCandidates: number;
  ballotCount: number;
  sumVotes: number;
}

// report.json

export interface IContestReport {
  info: IElectionInfo;
  ballotCount: number;
  candidates: ICandidate[];
  winners: CandidateId[];
  condorcet?: CandidateId;
  numCandidates: number;
  coApprovals?: ICoApprovalData[];
  votingPatterns?: IVotingPatterns;
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

export interface ICoApprovalData {
  candidateA: string;
  candidateB: string;
  coApprovalCount: number;
  coApprovalRate: number;
}

export interface IVotingPatterns {
  totalBallots: number;
  bulletVotingCount: number;
  bulletVotingRate: number;
  fullApprovalCount: number;
  fullApprovalRate: number;
  averageApprovalsPerBallot: number;
  mostCommonCombination: string[];
  approvalDistribution: { [key: number]: number };
  candidateApprovalDistributions?: { [candidateName: string]: { [approvals: number]: number } };
  anyoneButAnalysis?: { [candidateName: string]: number };
  // Cross-race voting behavior fields
  multiApprovalVoters?: number;
  multiApprovalRate?: number;
  singleApprovalOnlyVoters?: number;
  singleApprovalOnlyRate?: number;
}

// Cross-race co-approval data type (used internally for processing)
export interface ICrossRaceCoApprovalData {
  candidateA: string;
  candidateB: string;
  contestA: string;
  contestB: string;
  coApprovalCount: number;
  coApprovalRate: number;
}
