export interface UsedBy {
  code: string; // country or jurisdiction code
  name: string; // display name for tooltip
  flag: string; // emoji
}

export interface VotingMethod {
  name: string;
  shortDescription: string;
  detailedCritique: string;
  ballotType: 'choose-x' | 'ranking' | 'score';
  choiceLimitation: '1' | 'custom' | 'unlimited' | 'any';
  minSeats: number;
  maxSeats: number | 'unlimited';
  votingMachineCompatibility?: { existingMachines: boolean; description: string };
  scores: {
    proportionality: number;
    simplicity: number;
    honestStrategyResistance: number;
    strategicStraightforwardness: number;
    representation: number;
  };
  isProportional: boolean;
  isSemiProportional: boolean;
  category: 'plurality' | 'approval' | 'ranked' | 'score' | 'mixed';
  hasVariants?: boolean;
  variants?: { listType?: boolean; mixedMember?: boolean };
  tabulationCritique?: string;
  proportionalityDetails?: string;
  listTypeCritique?: { closed?: string; open?: string; flexible?: string };
  primaryCritique?: { withPrimaries?: string; withoutPrimaries?: string };
  flowchart?: string;
  tags?: string[];
  requiresParties?: boolean;
  usedBy?: UsedBy[];
}

export interface VotingConfig {
  ballotType: string | null;
  limitedChoices: string | null;
  customLimit: number;
  tabulationMethod: string | null;
  numberOfSeats: number;
  hasParties: boolean;
  canVoteForParties: boolean;
  canVoteForCandidates: boolean;
  hasPrimaries: boolean;
  listType: string | null;
  mixedMember: boolean;
  singleWinnerProportion: number;
  allowNegativeVotes: boolean;
  scoreMin: number;
  scoreMax: number;
}
