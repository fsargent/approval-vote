<script lang="ts">
  import { resolve } from '$app/paths';
  import { onMount } from 'svelte';

  // Type definition for our config
  interface VotingConfig {
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

  interface VotingMethod {
    // Identity
    id: string;
    name: string;
    shortDescription: string;
    detailedCritique: string;
    // Requirements/Constraints
    ballotType: 'choose-x' | 'ranking' | 'score';
    choiceLimitation: '1' | 'custom' | 'unlimited' | 'any';
    minSeats: number;
    maxSeats: number | 'unlimited';
    // Voting Machine Compatibility
    votingMachineCompatibility: {
      existingMachines: boolean;
      description: string;
    };
    // Scoring
    scores: {
      proportionality: number;
      simplicity: number;
      honestStrategyResistance: number;
      strategicStraightforwardness: number;
      representation: number;
    };
    // Classification
    isProportional: boolean;
    isSemiProportional: boolean;
    category: 'plurality' | 'approval' | 'ranked' | 'score' | 'mixed';
    // Variants/Options
    hasVariants?: boolean;
    variants?: {
      listType?: boolean;
      mixedMember?: boolean;
    };
    // Critique fields
    ballotTypeCritique?: {
      [key: string]: string; // e.g., 'choose-x-1', 'choose-x-unlimited', 'ranking', 'score'
    };
    tabulationCritique?: string;
    proportionalityDetails?: string; // Only shown for multi-winner
    listTypeCritique?: {
      closed?: string;
      open?: string;
      flexible?: string;
    };
    primaryCritique?: {
      withPrimaries?: string;
      withoutPrimaries?: string;
    };
  }

  // Voting method configuration state
  let config: VotingConfig = {
    ballotType: 'choose-x',
    limitedChoices: '1',
    customLimit: 3,
    tabulationMethod: 'fptp',
    numberOfSeats: 1,
    hasParties: true, // Always assume parties exist
    canVoteForParties: true,
    canVoteForCandidates: true,
    hasPrimaries: false,
    listType: 'closed', // Default to closed list
    mixedMember: false,
    singleWinnerProportion: 50,
    allowNegativeVotes: false,
    scoreMin: 0,
    scoreMax: 5,
  };

  // Election type options
  const electionTypes = [
    {
      id: 'all',
      name: 'Show All',
      description: 'Show both single winner and multi winner elections',
    },
    {
      id: 'single',
      name: 'Single Winner',
      description: 'Choose one person for a role (President, Mayor, etc.)',
    },
    {
      id: 'multi',
      name: 'Multi Winner',
      description:
        'Choose multiple people for a body (Council, Parliament, etc.) or for Top X Primaries',
    },
  ];

  // Current election type filter
  let electionTypeFilter = 'all';

  // Helper to get election type from numberOfSeats
  function getElectionType(numberOfSeats: number): string {
    return numberOfSeats === 1 ? 'single' : 'multi';
  }

  // Helper to get the selected election type
  $: selectedElectionType = getElectionType(config.numberOfSeats);

  // Option definitions
  const ballotTypes = [
    { id: 'choose-x', name: 'Choose X', description: 'Pick candidates' },
    { id: 'ranking', name: 'Ranked', description: 'Rank candidates in order of preference' },
    { id: 'score', name: 'Score', description: 'Give each candidate a numerical score' },
  ];

  const limitedChoicesOptions = [
    { id: '1', name: 'Pick 1', description: 'Must select exactly 1 (FPTP)' },
    { id: 'custom', name: 'Custom limit', description: 'Set your own maximum' },
    {
      id: 'unlimited',
      name: 'As many as you like',
      description: 'No limit on selections (approval voting)',
    },
  ];

  const VOTING_METHODS: VotingMethod[] = [
    // Single-winner methods
    {
      id: 'fptp',
      name: 'First Past The Post',
      shortDescription: 'Most votes wins',
      detailedCritique:
        "Simple and familiar. Severe vote splitting, spoiler effects, doesn't capture full voter preferences.",
      ballotType: 'choose-x',
      choiceLimitation: '1',
      minSeats: 1,
      maxSeats: 1,
      votingMachineCompatibility: {
        existingMachines: true,
        description: 'Compatible with existing voting machines',
      },
      scores: {
        proportionality: 0,
        simplicity: 5,
        honestStrategyResistance: 0,
        strategicStraightforwardness: 0,
        representation: 1,
      },
      isProportional: false,
      isSemiProportional: false,
      category: 'plurality',
      ballotTypeCritique: {
        'choose-x-1':
          "**Strengths:** Simple and familiar. **Weaknesses:** Severe vote splitting, spoiler effects, doesn't capture full voter preferences.",
      },
      tabulationCritique:
        '**FPTP:** Simple but suffers from vote splitting and spoiler effects with multiple candidates.',
      proportionalityDetails:
        '**Non-Proportional Multi-Winner:** May lead to sweep victories and poor minority representation.',
    },
    {
      id: 'approval',
      name: 'Approval Voting',
      shortDescription: 'Approve any number of candidates',
      detailedCritique:
        'Simple, eliminates vote splitting, encourages honest voting. No preference intensity.',
      ballotType: 'choose-x',
      choiceLimitation: 'unlimited',
      minSeats: 1,
      maxSeats: 1,
      votingMachineCompatibility: {
        existingMachines: true,
        description: 'Compatible with existing voting machines',
      },
      scores: {
        proportionality: 0,
        simplicity: 5,
        honestStrategyResistance: 5,
        strategicStraightforwardness: 1,
        representation: 4,
      },
      isProportional: false,
      isSemiProportional: false,
      category: 'approval',
      ballotTypeCritique: {
        'choose-x-unlimited':
          '**Strengths:** Simple, eliminates vote splitting, encourages honest voting. **Weaknesses:** No preference intensity',
      },
      tabulationCritique:
        '**Most Approvals:** Simple and intuitive, encourages honest voting without strategic downsides.',
      proportionalityDetails:
        '**Non-Proportional Multi-Winner:** May lead to sweep victories and poor minority representation.',
    },
    {
      id: 'limited-voting-single',
      name: 'Limited Voting (Single Winner)',
      shortDescription: 'Pick up to X candidates, most votes wins',
      detailedCritique:
        'Voters can select up to a specified number of candidates (less than total candidates). The candidate with the most votes wins. Reduces vote splitting compared to FPTP.',
      ballotType: 'choose-x',
      choiceLimitation: 'custom',
      minSeats: 1,
      maxSeats: 1,
      votingMachineCompatibility: {
        existingMachines: true,
        description: 'Compatible with existing voting machines',
      },
      scores: {
        proportionality: 0,
        simplicity: 4,
        honestStrategyResistance: 2,
        strategicStraightforwardness: 2,
        representation: 3,
      },
      isProportional: false,
      isSemiProportional: false,
      category: 'approval',
      ballotTypeCritique: {
        'choose-x-custom':
          '**Strengths:** Reduces vote splitting compared to FPTP, allows some preference expression. **Weaknesses:** Arbitrary limit may not reflect true preferences, still susceptible to strategic voting.',
      },
      tabulationCritique:
        '**Limited Voting (Single Winner):** Allows voters to select multiple candidates but only elects one winner. Can reduce vote splitting when limit is greater than 1.',
      proportionalityDetails:
        '**Non-Proportional Multi-Winner:** May lead to sweep victories and poor minority representation.',
    },
    {
      id: 'irv',
      name: 'IRV (Instant Runoff)',
      shortDescription: 'Eliminate lowest, transfer votes',
      detailedCritique:
        'Eliminates some spoiler effects but not all. Can eliminate a candidate who is more popular than the winner.',
      ballotType: 'ranking',
      choiceLimitation: 'any',
      minSeats: 1,
      maxSeats: 1,
      votingMachineCompatibility: {
        existingMachines: false,
        description: 'Requires new voting machines and ballot software',
      },
      scores: {
        proportionality: 0,
        simplicity: 1,
        honestStrategyResistance: 3,
        strategicStraightforwardness: 4,
        representation: 4,
      },
      isProportional: false,
      isSemiProportional: false,
      category: 'ranked',
      ballotTypeCritique: {
        ranking:
          '**Strengths:** Captures preference order, eliminates spoiler effect. **Weaknesses:** Can be complex for voters, may have non-monotonic results.',
      },
      tabulationCritique:
        '**IRV:** Good at eliminating spoiler effects but can eliminate Condorcet winners and has center-squeeze problems.',
      proportionalityDetails:
        '**Non-Proportional Multi-Winner:** May lead to sweep victories and poor minority representation.',
    },
    {
      id: 'borda',
      name: 'Borda Count',
      shortDescription: 'Points based on ranking position',
      detailedCritique:
        'Rewards broadly acceptable candidates but highly vulnerable to strategic manipulation and compromise.',
      ballotType: 'ranking',
      choiceLimitation: 'any',
      minSeats: 1,
      maxSeats: 1,
      scores: {
        proportionality: 0,
        simplicity: 1,
        honestStrategyResistance: 0,
        strategicStraightforwardness: 0,
        representation: 3,
      },
      isProportional: false,
      isSemiProportional: false,
      category: 'ranked',
      ballotTypeCritique: {
        ranking:
          '**Strengths:** Captures preference order, eliminates spoiler effect. **Weaknesses:** Can be complex for voters, may have non-monotonic results.',
      },
      tabulationCritique:
        '**Borda:** Rewards broadly acceptable candidates but highly vulnerable to strategic nomination.',
      proportionalityDetails:
        '**Non-Proportional Multi-Winner:** May lead to sweep victories and poor minority representation.',
    },
    {
      id: 'condorcet',
      name: 'Condorcet',
      shortDescription: 'Head-to-head winner if exists',
      detailedCritique:
        'Theoretically optimal but can have no winner (Condorcet paradox) requiring complex tie-breaking.',
      ballotType: 'ranking',
      choiceLimitation: 'any',
      minSeats: 1,
      maxSeats: 1,
      scores: {
        proportionality: 0,
        simplicity: 1,
        honestStrategyResistance: 5,
        strategicStraightforwardness: 5,
        representation: 4,
      },
      isProportional: false,
      isSemiProportional: false,
      category: 'ranked',
      ballotTypeCritique: {
        ranking:
          '**Strengths:** Captures preference order, eliminates spoiler effect. **Weaknesses:** Can be complex for voters, may have non-monotonic results.',
      },
      tabulationCritique:
        '**Condorcet:** Elects the candidate who beats all others head-to-head, but may have no winner in some cases.',
      proportionalityDetails:
        '**Non-Proportional Multi-Winner:** May lead to sweep victories and poor minority representation.',
    },

    // Score voting single-winner
    {
      id: 'highest-total',
      name: 'Highest Total Score',
      shortDescription: 'Sum all scores, highest wins',
      detailedCritique:
        'Adds up all scores for each candidate - the candidate with the highest sum wins. Simple. Works best with many candidates and relatively few voters where expressivity helps prevent ties.',
      ballotType: 'score',
      choiceLimitation: 'any',
      minSeats: 1,
      maxSeats: 1,
      votingMachineCompatibility: {
        existingMachines: false,
        description: 'Requires new voting machines and ballot software',
      },
      scores: {
        proportionality: 0,
        simplicity: 4,
        honestStrategyResistance: 2,
        strategicStraightforwardness: 2,
        representation: 4,
      },
      isProportional: false,
      isSemiProportional: false,
      category: 'score',
      ballotTypeCritique: {
        score:
          '**Strengths:** Expresses preference intensity, highly expressive. **Weaknesses:** Normalization issues between voters. When Min/Maxed then becomes approval voting',
        'choose-x-custom':
          '**Strengths:** Reduces vote splitting compared to FPTP, allows some preference expression. **Weaknesses:** Arbitrary limit may not reflect true preferences.',
      },
      tabulationCritique:
        '**Highest Total:** Adds up all scores for each candidate - the candidate with the highest sum wins. Simple. Works best with many candidates and relatively few voters where expressivity helps prevent ties.',
      proportionalityDetails:
        '**Non-Proportional Multi-Winner:** May lead to sweep victories and poor minority representation.',
    },
    {
      id: 'star',
      name: 'STAR Voting',
      shortDescription: 'Score then automatic runoff',
      detailedCritique:
        'Combines benefits of score voting with runoff security, eliminating strategic concerns. The scoring phase works best with many candidates and relatively few voters, while the runoff provides decisive results.',
      ballotType: 'score',
      choiceLimitation: 'any',
      minSeats: 1,
      maxSeats: 1,
      votingMachineCompatibility: {
        existingMachines: false,
        description: 'Requires new voting machines and ballot software',
      },
      scores: {
        proportionality: 0,
        simplicity: 4,
        honestStrategyResistance: 3,
        strategicStraightforwardness: 4,
        representation: 4,
      },
      isProportional: false,
      isSemiProportional: false,
      category: 'score',
      ballotTypeCritique: {
        score:
          '**Strengths:** Expresses preference intensity, highly expressive. **Weaknesses:** Strategic voting concerns, normalization issues between voters.',
      },
      tabulationCritique:
        '**STAR:** Combines benefits of score voting with runoff security, eliminating strategic concerns. The scoring phase works best with many candidates and relatively few voters, while the runoff provides decisive results.',
      proportionalityDetails:
        '**Non-Proportional Multi-Winner:** May lead to sweep victories and poor minority representation.',
    },

    // Multi-winner methods
    {
      id: 'block-voting',
      name: 'Block Voting',
      shortDescription: 'Choose one, top candidates win multiple seats',
      detailedCritique:
        'Also called "Plurality-at-large". Voters choose one candidate, and the candidates with the most votes win seats. Simple but tends to give all seats to the most popular party or faction.',
      ballotType: 'choose-x',
      choiceLimitation: '1',
      minSeats: 2,
      maxSeats: 'unlimited',
      votingMachineCompatibility: {
        existingMachines: true,
        description: 'Compatible with existing voting machines',
      },
      scores: {
        proportionality: 0,
        simplicity: 5,
        honestStrategyResistance: 0,
        strategicStraightforwardness: 0,
        representation: 1,
      },
      isProportional: false,
      isSemiProportional: false,
      category: 'plurality',
      ballotTypeCritique: {
        'choose-x-1':
          "**Strengths:** Simple and familiar. **Weaknesses:** Severe vote splitting, spoiler effects, doesn't capture full voter preferences.",
      },
      tabulationCritique:
        '**Block Voting:** Simple plurality system for multiple seats. Tends to give all seats to the most popular party - very poor minority representation.',
      proportionalityDetails:
        '**Non-Proportional Multi-Winner:** May lead to sweep victories and poor minority representation.',
    },
    {
      id: 'block-approval',
      name: 'Block Approval Voting',
      shortDescription: 'Approve any number, top candidates win multiple seats',
      detailedCritique:
        'Simple extension of approval to multiple winners but provides no proportional representation.',
      ballotType: 'choose-x',
      choiceLimitation: 'unlimited',
      minSeats: 2,
      maxSeats: 'unlimited',
      votingMachineCompatibility: {
        existingMachines: true,
        description: 'Compatible with existing voting machines',
      },
      scores: {
        proportionality: 0,
        simplicity: 5,
        honestStrategyResistance: 5,
        strategicStraightforwardness: 1,
        representation: 2,
      },
      isProportional: false,
      isSemiProportional: false,
      category: 'approval',
      ballotTypeCritique: {
        'choose-x-unlimited':
          '**Strengths:** Simple, eliminates vote splitting, encourages honest voting. **Weaknesses:** No preference intensity',
      },
      tabulationCritique:
        '**Block Approval:** Simple extension of approval voting to multiple seats. Better minority representation than Block Voting.',
      proportionalityDetails:
        '**Non-Proportional Multi-Winner:** May lead to sweep victories and poor minority representation.',
    },
    {
      id: 'limited-voting',
      name: 'Limited Voting',
      shortDescription: 'Voters pick fewer candidates than seats available',
      detailedCritique:
        'Also called "Block Voting with limitations." Voters can select up to a specific number of candidates (less than the total seats). Candidates with the most votes win. Provides some minority representation but not fully proportional.',
      ballotType: 'choose-x',
      choiceLimitation: 'custom',
      minSeats: 2,
      maxSeats: 'unlimited',
      scores: {
        proportionality: 0,
        simplicity: 4,
        honestStrategyResistance: 1,
        strategicStraightforwardness: 2,
        representation: 3,
      },
      isProportional: false,
      isSemiProportional: true,
      category: 'approval',
      ballotTypeCritique: {
        'choose-x-custom':
          '**Strengths:** Reduces vote splitting compared to FPTP, allows some preference expression. **Weaknesses:** Arbitrary limit may not reflect true preferences, still susceptible to strategic voting.',
      },
      tabulationCritique:
        '**Limited Voting:** Provides some minority representation but not fully proportional. Strategic nomination is important.',
      proportionalityDetails:
        '**Semi-Proportional:** Provides some minority representation but not full proportional representation.',
    },
    {
      id: 'cumulative-voting',
      name: 'Cumulative Voting',
      shortDescription: 'Voters get points equal to seats and distribute them freely',
      detailedCritique:
        'Voters receive a number of points equal to the number of seats and can distribute them among candidates however they choose, including giving multiple points to the same candidate. Semi-proportional system that allows minority representation.',
      ballotType: 'choose-x',
      choiceLimitation: 'custom',
      minSeats: 2,
      maxSeats: 'unlimited',
      scores: {
        proportionality: 0,
        simplicity: 3,
        honestStrategyResistance: 1,
        strategicStraightforwardness: 2,
        representation: 3,
      },
      isProportional: false,
      isSemiProportional: true,
      category: 'approval',
      ballotTypeCritique: {
        'choose-x-custom':
          '**Strengths:** Reduces vote splitting compared to FPTP, allows some preference expression. **Weaknesses:** Arbitrary limit may not reflect true preferences, still susceptible to strategic voting.',
      },
      tabulationCritique:
        '**Cumulative Voting:** Allows voters to distribute points strategically. Semi-proportional system that can provide minority representation with proper strategy.',
      proportionalityDetails:
        '**Semi-Proportional:** Provides some minority representation but not full proportional representation.',
    },
    {
      id: 'sntv',
      name: 'SNTV (Single Non-Transferable Vote)',
      shortDescription: 'Semi-proportional for choose-one ballots',
      detailedCritique:
        'Semi-proportional method for choose-one ballots. Requires strategic nomination by parties to achieve proportionality - too many candidates splits the vote, too few wastes votes.',
      ballotType: 'choose-x',
      choiceLimitation: '1',
      minSeats: 2,
      maxSeats: 'unlimited',
      scores: {
        proportionality: 3,
        simplicity: 5,
        honestStrategyResistance: 2,
        strategicStraightforwardness: 2,
        representation: 3,
      },
      isProportional: false,
      isSemiProportional: true,
      category: 'approval',
      ballotTypeCritique: {
        'choose-x-1':
          "**Strengths:** Simple and familiar. **Weaknesses:** Severe vote splitting, spoiler effects, doesn't capture full voter preferences.",
      },
      tabulationCritique:
        '**SNTV:** Semi-proportional method for choose-one ballots. Requires strategic nomination by parties to achieve proportionality - too many candidates splits the vote, too few wastes votes.',
      proportionalityDetails:
        '**Semi-Proportional:** Provides some minority representation but not full proportional representation.',
    },
    {
      id: 'satisfaction-approval',
      name: 'Satisfaction Approval',
      shortDescription: 'Semi-proportional splits votes equally',
      detailedCritique:
        "Semi-proportional system that splits each vote equally between all approved candidates. More proportional than block voting but requires strategic coordination - voters must know how many seats their party deserves and vote for exactly that many candidates. Vulnerable to 'wipeout' if strategy fails.",
      ballotType: 'choose-x',
      choiceLimitation: 'unlimited',
      minSeats: 2,
      maxSeats: 'unlimited',
      scores: {
        proportionality: 3,
        simplicity: 5,
        honestStrategyResistance: 3,
        strategicStraightforwardness: 3,
        representation: 4,
      },
      isProportional: false,
      isSemiProportional: true,
      category: 'approval',
      ballotTypeCritique: {
        'choose-x-unlimited':
          '**Strengths:** Simple, eliminates vote splitting, encourages honest voting. **Weaknesses:** No preference intensity',
      },
      tabulationCritique:
        "**Satisfaction Approval:** Semi-proportional system that splits each vote equally between all approved candidates. More proportional than block voting but requires strategic coordination - voters must know how many seats their party deserves and vote for exactly that many candidates. Vulnerable to 'wipeout' if strategy fails.",
      proportionalityDetails:
        '**Semi-Proportional:** Provides some minority representation but not full proportional representation.',
    },
    {
      id: 'spav',
      name: 'SPAV (Sequential Proportional Approval)',
      shortDescription: 'Proportional approval using sequential selection',
      detailedCritique:
        'Sequential Proportional Approval Voting that encourages diverse representation. Much more practical to implement than the theoretical PAV optimization.',
      ballotType: 'choose-x',
      choiceLimitation: 'unlimited',
      minSeats: 2,
      maxSeats: 'unlimited',
      scores: {
        proportionality: 5,
        simplicity: 4,
        honestStrategyResistance: 3,
        strategicStraightforwardness: 3,
        representation: 5,
      },
      isProportional: true,
      isSemiProportional: false,
      category: 'approval',
      ballotTypeCritique: {
        'choose-x-unlimited':
          '**Strengths:** Simple, eliminates vote splitting, encourages honest voting. **Weaknesses:** No preference intensity',
      },
      tabulationCritique:
        '**SPAV:** Sequential Proportional Approval Voting that encourages diverse representation. Much more practical to implement than the theoretical PAV optimization.',
      proportionalityDetails:
        '**Proportional Representation:** Ensures fair party representation but may reduce local accountability.',
    },
    {
      id: 'stv',
      name: 'STV (Single Transferable Vote)',
      shortDescription: 'Proportional ranked choice voting',
      detailedCritique:
        'Provides proportional representation with ranked ballots, maintaining local representation while ensuring diversity.',
      ballotType: 'ranking',
      choiceLimitation: 'any',
      minSeats: 2,
      maxSeats: 'unlimited',
      scores: {
        proportionality: 5,
        simplicity: 1,
        honestStrategyResistance: 3,
        strategicStraightforwardness: 3,
        representation: 5,
      },
      isProportional: true,
      isSemiProportional: false,
      category: 'ranked',
      ballotTypeCritique: {
        ranking:
          '**Strengths:** Captures preference order, eliminates spoiler effect. **Weaknesses:** Can be complex for voters, may have non-monotonic results.',
      },
      tabulationCritique:
        '**STV:** Provides proportional representation with ranked ballots, maintaining local representation while ensuring diversity.',
      proportionalityDetails:
        '**Proportional Representation:** Ensures fair party representation but may reduce local accountability.',
    },
    {
      id: 'cpo-stv',
      name: 'CPO-STV',
      shortDescription: 'Condorcet-refined proportional ranked choice',
      detailedCritique:
        'Comparison of Pairs of Outcomes STV combines proportional representation with Condorcet-style optimality. More theoretically sound than traditional STV but significantly more complex to compute and explain.',
      ballotType: 'ranking',
      choiceLimitation: 'any',
      minSeats: 2,
      maxSeats: 'unlimited',
      scores: {
        proportionality: 5,
        simplicity: 1,
        honestStrategyResistance: 4,
        strategicStraightforwardness: 3,
        representation: 5,
      },
      isProportional: true,
      isSemiProportional: false,
      category: 'ranked',
      votingMachineCompatibility: {
        existingMachines: false,
        description: 'Requires specialized software for complex calculations',
      },
      ballotTypeCritique: {
        ranking:
          '**Strengths:** Captures preference order, eliminates spoiler effect. **Weaknesses:** Can be complex for voters, may have non-monotonic results.',
      },
      tabulationCritique:
        '**CPO-STV:** Uses Condorcet-style comparisons to find the optimal proportional outcome. More theoretically sound than standard STV but requires exponentially complex calculations.',
      proportionalityDetails:
        '**Proportional Representation:** Ensures optimal proportional outcomes by comparing all possible seat allocations, though at the cost of computational complexity.',
    },
    {
      id: 'schulze-stv',
      name: 'Schulze STV',
      shortDescription: 'Schulze method extended to proportional representation',
      detailedCritique:
        'Applies the Schulze method principles to multi-winner elections for proportional representation. Eliminates many strategic voting problems but is extremely complex to calculate and verify.',
      ballotType: 'ranking',
      choiceLimitation: 'any',
      minSeats: 2,
      maxSeats: 'unlimited',
      scores: {
        proportionality: 5,
        simplicity: 1,
        honestStrategyResistance: 5,
        strategicStraightforwardness: 4,
        representation: 5,
      },
      isProportional: true,
      isSemiProportional: false,
      category: 'ranked',
      votingMachineCompatibility: {
        existingMachines: false,
        description: 'Requires specialized software for very complex calculations',
      },
      ballotTypeCritique: {
        ranking:
          '**Strengths:** Captures preference order, eliminates spoiler effect. **Weaknesses:** Can be complex for voters, may have non-monotonic results.',
      },
      tabulationCritique:
        '**Schulze STV:** Extends the Schulze method to achieve proportional representation. Excellent theoretical properties but extremely complex implementation.',
      proportionalityDetails:
        '**Proportional Representation:** Provides optimal proportional representation using Schulze method principles, ensuring strong Condorcet-style criteria are met.',
    },
    {
      id: 'meek-stv',
      name: 'Meek STV',
      shortDescription: 'STV with iterative reweighting',
      detailedCritique:
        'Uses iterative reweighting instead of fractional vote transfers. More mathematically elegant than traditional STV and avoids some anomalies, but harder to verify by hand.',
      ballotType: 'ranking',
      choiceLimitation: 'any',
      minSeats: 2,
      maxSeats: 'unlimited',
      scores: {
        proportionality: 5,
        simplicity: 2,
        honestStrategyResistance: 4,
        strategicStraightforwardness: 3,
        representation: 5,
      },
      isProportional: true,
      isSemiProportional: false,
      category: 'ranked',
      votingMachineCompatibility: {
        existingMachines: false,
        description: 'Requires new software for iterative calculations',
      },
      ballotTypeCritique: {
        ranking:
          '**Strengths:** Captures preference order, eliminates spoiler effect. **Weaknesses:** Can be complex for voters, may have non-monotonic results.',
      },
      tabulationCritique:
        '**Meek STV:** Uses iterative reweighting instead of fractional transfers. More mathematically sound than traditional STV but requires computer calculation.',
      proportionalityDetails:
        '**Proportional Representation:** Achieves excellent proportional representation through continuous reweighting, avoiding some traditional STV anomalies.',
    },
    {
      id: 'pr-borda',
      name: 'PR-Borda',
      shortDescription: 'Proportional representation using Borda count',
      detailedCritique:
        'Allocates seats proportionally based on Borda count scores. Rewards consensus candidates and provides proportional representation, but highly vulnerable to strategic nomination and cloning.',
      ballotType: 'ranking',
      choiceLimitation: 'any',
      minSeats: 2,
      maxSeats: 'unlimited',
      scores: {
        proportionality: 4,
        simplicity: 1,
        honestStrategyResistance: 0,
        strategicStraightforwardness: 0,
        representation: 4,
      },
      isProportional: true,
      isSemiProportional: false,
      category: 'ranked',
      votingMachineCompatibility: {
        existingMachines: false,
        description: 'Requires new software for Borda calculations and proportional allocation',
      },
      ballotTypeCritique: {
        ranking:
          '**Strengths:** Captures preference order, eliminates spoiler effect. **Weaknesses:** Can be complex for voters, may have non-monotonic results.',
      },
      tabulationCritique:
        '**PR-Borda:** Calculates Borda scores and allocates seats proportionally. Simple concept but extremely vulnerable to strategic nomination and candidate cloning.',
      proportionalityDetails:
        '**Proportional Representation:** Provides proportional representation based on Borda scores, rewarding broadly acceptable candidates across party lines.',
    },
    {
      id: 'wright-stv',
      name: 'Wright STV',
      shortDescription: 'STV variant with refined transfer rules',
      detailedCritique:
        'A variant of STV that uses different vote transfer mechanisms to reduce some strategic voting opportunities. More complex than traditional STV but with better theoretical properties.',
      ballotType: 'ranking',
      choiceLimitation: 'any',
      minSeats: 2,
      maxSeats: 'unlimited',
      scores: {
        proportionality: 5,
        simplicity: 1,
        honestStrategyResistance: 4,
        strategicStraightforwardness: 3,
        representation: 5,
      },
      isProportional: true,
      isSemiProportional: false,
      category: 'ranked',
      votingMachineCompatibility: {
        existingMachines: false,
        description: 'Requires specialized software for refined transfer calculations',
      },
      ballotTypeCritique: {
        ranking:
          '**Strengths:** Captures preference order, eliminates spoiler effect. **Weaknesses:** Can be complex for voters, may have non-monotonic results.',
      },
      tabulationCritique:
        '**Wright STV:** Uses refined transfer rules to improve upon traditional STV. Better theoretical properties but more complex implementation and verification.',
      proportionalityDetails:
        '**Proportional Representation:** Achieves proportional representation with improved transfer mechanisms that reduce some strategic voting opportunities.',
    },
    {
      id: 'party-list-pr',
      name: 'Party List PR',
      shortDescription: 'Proportional seats by party vote share',
      detailedCritique:
        "Pure proportional representation where voters choose parties, and seats are allocated based on each party's share of the vote. Ensures fair representation but can reduce individual candidate accountability. Used in many European countries like Netherlands, Israel, and Finland.",
      ballotType: 'choose-x',
      choiceLimitation: 'any',
      minSeats: 2,
      maxSeats: 'unlimited',
      scores: {
        proportionality: 5,
        simplicity: 4,
        honestStrategyResistance: 4,
        strategicStraightforwardness: 3,
        representation: 5,
      },
      isProportional: true,
      isSemiProportional: false,
      category: 'mixed',
      hasVariants: true,
      variants: { listType: true },
      ballotTypeCritique: {
        'choose-x-1':
          "**Strengths:** Simple and familiar. **Weaknesses:** Severe vote splitting, spoiler effects, doesn't capture full voter preferences.",
        'choose-x-unlimited':
          '**Strengths:** Simple, eliminates vote splitting, encourages honest voting. **Weaknesses:** No preference intensity',
      },
      tabulationCritique:
        '**Party List PR:** Direct proportional representation where parties receive seats based on their vote share. Achieves excellent proportionality but may weaken the link between voters and individual representatives. Works best with diverse multi-party systems.',
      proportionalityDetails:
        '**Proportional Representation:** Ensures fair party representation but may reduce local accountability.',
      listTypeCritique: {
        closed:
          '**Closed Lists:** Give parties full control over candidate selection and ordering, which can strengthen party discipline but reduce voter choice.',
        open: '**Open Lists:** Allow voters to choose specific candidates within parties, increasing voter choice but potentially fragmenting party unity.',
        flexible:
          '**Flexible Lists:** Balance party control with voter choice, allowing both party and candidate votes to influence outcomes.',
      },
      primaryCritique: {
        withPrimaries:
          '**Primary Elections:** Increase voter choice and party democracy but can favor extreme candidates, reduce general election competitiveness, and increase campaign costs. May lead to more polarized candidates who appeal to party bases rather than general electorate.',
        withoutPrimaries:
          '**No Primaries:** Parties select candidates internally (conventions, appointments, etc.). This gives party leadership more control but may reduce grassroots democracy and voter input in candidate selection.',
      },
    },
    {
      id: 'mmp',
      name: 'MMP (Mixed Member Proportional)',
      shortDescription: 'Combines districts with party lists',
      detailedCritique:
        'Hybrid system combining local districts with party lists. Voters cast two ballots: one for a local representative and one for a party. Additional "top-up" seats ensure overall proportionality while preserving local representation. Successfully used in Germany, New Zealand, and Scotland.',
      ballotType: 'choose-x',
      choiceLimitation: 'any',
      minSeats: 2,
      maxSeats: 'unlimited',
      requiresParties: true,
      scores: {
        proportionality: 5,
        simplicity: 3,
        honestStrategyResistance: 4,
        strategicStraightforwardness: 3,
        representation: 5,
      },
      isProportional: true,
      isSemiProportional: false,
      category: 'mixed',
      hasVariants: true,
      variants: { listType: true, mixedMember: true },
      ballotTypeCritique: {
        'choose-x-1':
          "**Strengths:** Simple and familiar. **Weaknesses:** Severe vote splitting, spoiler effects, doesn't capture full voter preferences.",
        'choose-x-unlimited':
          '**Strengths:** Simple, eliminates vote splitting, encourages honest voting. **Weaknesses:** No preference intensity',
      },
      tabulationCritique:
        '**MMP:** Combines the best of both worlds - local accountability through districts and fair representation through proportional top-up seats. More complex to implement but provides excellent balance between local representation and proportionality. May create two classes of representatives.',
      proportionalityDetails:
        '**Proportional Representation:** Ensures fair party representation but may reduce local accountability.',
      listTypeCritique: {
        closed:
          '**Closed Lists:** Give parties full control over candidate selection and ordering, which can strengthen party discipline but reduce voter choice.',
        open: '**Open Lists:** Allow voters to choose specific candidates within parties, increasing voter choice but potentially fragmenting party unity.',
        flexible:
          '**Flexible Lists:** Balance party control with voter choice, allowing both party and candidate votes to influence outcomes.',
      },
      primaryCritique: {
        withPrimaries:
          '**Primary Elections:** Increase voter choice and party democracy but can favor extreme candidates, reduce general election competitiveness, and increase campaign costs. May lead to more polarized candidates who appeal to party bases rather than general electorate.',
        withoutPrimaries:
          '**No Primaries:** Parties select candidates internally (conventions, appointments, etc.). This gives party leadership more control but may reduce grassroots democracy and voter input in candidate selection.',
      },
    },
    {
      id: 'block-score',
      name: 'Block Score Voting',
      shortDescription: 'Highest total scores win multiple seats',
      detailedCritique:
        'Multi-winner extension of score voting where candidates with the highest total scores win seats. Simple but provides no proportional representation.',
      ballotType: 'score',
      choiceLimitation: 'any',
      minSeats: 2,
      maxSeats: 'unlimited',
      scores: {
        proportionality: 0,
        simplicity: 5,
        honestStrategyResistance: 2,
        strategicStraightforwardness: 2,
        representation: 2,
      },
      isProportional: false,
      isSemiProportional: false,
      category: 'score',
      ballotTypeCritique: {
        score:
          '**Strengths:** Expresses preference intensity, highly expressive. **Weaknesses:** Strategic voting concerns, normalization issues between voters.',
      },
      tabulationCritique:
        '**Block Score Voting:** Simple extension of score voting to multiple winners. Candidates with highest total scores win seats, but provides no proportional representation.',
      proportionalityDetails:
        '**Non-Proportional Multi-Winner:** May lead to sweep victories and poor minority representation.',
    },
    {
      id: 'equal-shares',
      name: 'Method of Equal Shares',
      shortDescription: 'Equal budget per voter',
      detailedCritique:
        "Ensures each voter gets an equal 'budget' of representation. Excellent proportionality and fairness, but complex for voters to understand. The detailed scoring works best with many candidates and relatively few voters.",
      ballotType: 'score',
      choiceLimitation: 'any',
      minSeats: 2,
      maxSeats: 'unlimited',
      scores: {
        proportionality: 5,
        simplicity: 3,
        honestStrategyResistance: 4,
        strategicStraightforwardness: 3,
        representation: 5,
      },
      isProportional: true,
      isSemiProportional: false,
      category: 'score',
      ballotTypeCritique: {
        score:
          '**Strengths:** Expresses preference intensity, highly expressive. **Weaknesses:** Strategic voting concerns, normalization issues between voters.',
      },
      tabulationCritique:
        "**Method of Equal Shares:** Ensures each voter gets an equal 'budget' of representation. Excellent proportionality and fairness, but complex for voters to understand. The detailed scoring works best with many candidates and relatively few voters.",
      proportionalityDetails:
        '**Proportional Representation:** Ensures fair party representation but may reduce local accountability.',
    },
    {
      id: 'pav',
      name: 'PAV (Proportional Approval Voting)',
      shortDescription: 'Optimal approval-based proportional representation',
      detailedCritique:
        'The theoretical optimum for proportional representation using approval ballots. Maximizes voter satisfaction but requires complex optimization algorithms that are computationally intensive for large elections.',
      ballotType: 'choose-x',
      choiceLimitation: 'unlimited',
      minSeats: 2,
      maxSeats: 'unlimited',
      scores: {
        proportionality: 5,
        simplicity: 2,
        honestStrategyResistance: 4,
        strategicStraightforwardness: 3,
        representation: 5,
      },
      isProportional: true,
      isSemiProportional: false,
      category: 'approval',
      ballotTypeCritique: {
        'choose-x-unlimited':
          '**Strengths:** Simple, eliminates vote splitting, encourages honest voting. **Weaknesses:** No preference intensity',
      },
      tabulationCritique:
        '**PAV:** The theoretical optimum for proportional representation using approval ballots. Maximizes voter satisfaction but requires complex optimization algorithms that are computationally intensive for large elections.',
      proportionalityDetails:
        '**Proportional Representation:** Ensures fair party representation but may reduce local accountability.',
    },
    {
      id: 'star-pr',
      name: 'STAR-PR',
      shortDescription: 'Proportional STAR voting',
      detailedCritique:
        'Extends STAR voting to multi-winner elections by using proportional allocation. Combines the benefits of score voting expressiveness with proportional representation, but adds complexity to the tabulation process.',
      ballotType: 'score',
      choiceLimitation: 'any',
      minSeats: 2,
      maxSeats: 'unlimited',
      scores: {
        proportionality: 5,
        simplicity: 3,
        honestStrategyResistance: 4,
        strategicStraightforwardness: 3,
        representation: 5,
      },
      isProportional: true,
      isSemiProportional: false,
      category: 'score',
      ballotTypeCritique: {
        score:
          '**Strengths:** Expresses preference intensity, highly expressive. **Weaknesses:** Strategic voting concerns, normalization issues between voters.',
      },
      tabulationCritique:
        '**STAR-PR:** Extends STAR voting to multi-winner elections by using proportional allocation. Combines the benefits of score voting expressiveness with proportional representation, but adds complexity to the tabulation process.',
      proportionalityDetails:
        '**Proportional Representation:** Ensures fair party representation but may reduce local accountability.',
    },
    {
      id: 'allocated-score',
      name: 'Allocated Score',
      shortDescription: 'Practical proportional score voting',
      detailedCritique:
        'A practical implementation of proportional score voting that allocates candidates based on weighted scores. Simpler than Method of Equal Shares while still achieving good proportionality.',
      ballotType: 'score',
      choiceLimitation: 'any',
      minSeats: 2,
      maxSeats: 'unlimited',
      scores: {
        proportionality: 4,
        simplicity: 4,
        honestStrategyResistance: 3,
        strategicStraightforwardness: 3,
        representation: 4,
      },
      isProportional: true,
      isSemiProportional: false,
      category: 'score',
      ballotTypeCritique: {
        score:
          '**Strengths:** Expresses preference intensity, highly expressive. **Weaknesses:** Strategic voting concerns, normalization issues between voters.',
      },
      tabulationCritique:
        "**Allocated Score:** A practical approach to proportional score voting that's easier to implement than Method of Equal Shares while maintaining good proportional outcomes.",
      proportionalityDetails:
        '**Proportional Representation:** Ensures fair party representation but may reduce local accountability.',
    },
    {
      id: 'range-voting',
      name: 'Range Voting',
      shortDescription: 'Pure score voting without runoff',
      detailedCritique:
        'Simple score voting where the candidate with the highest total score wins. More expressive than approval voting but vulnerable to strategic exaggeration and normalization issues between voters.',
      ballotType: 'score',
      choiceLimitation: 'any',
      minSeats: 1,
      maxSeats: 1,
      scores: {
        proportionality: 0,
        simplicity: 4,
        honestStrategyResistance: 2,
        strategicStraightforwardness: 2,
        representation: 4,
      },
      isProportional: false,
      isSemiProportional: false,
      category: 'score',
      ballotTypeCritique: {
        score:
          '**Strengths:** Expresses preference intensity, highly expressive. **Weaknesses:** Strategic voting concerns, normalization issues between voters.',
      },
      tabulationCritique:
        '**Range Voting:** Simple score voting where the candidate with the highest total score wins. More expressive than approval voting but vulnerable to strategic exaggeration and normalization issues between voters.',
      proportionalityDetails:
        '**Non-Proportional Multi-Winner:** May lead to sweep victories and poor minority representation.',
    },
    {
      id: '3-2-1-voting',
      name: '3-2-1 Voting',
      shortDescription: 'Score 3-2-1, advance top 2, pick winner',
      detailedCritique:
        'Voters score candidates as Good (3), OK (2), or Bad (1). The two highest-scoring candidates advance to a runoff based on who is rated higher by more voters. Simple to understand and resistant to tactical voting.',
      ballotType: 'score',
      choiceLimitation: 'any',
      minSeats: 1,
      maxSeats: 1,
      scores: {
        proportionality: 0,
        simplicity: 4,
        honestStrategyResistance: 4,
        strategicStraightforwardness: 3,
        representation: 4,
      },
      isProportional: false,
      isSemiProportional: false,
      category: 'score',
      ballotTypeCritique: {
        score:
          '**Strengths:** Expresses preference intensity, highly expressive. **Weaknesses:** Strategic voting concerns, normalization issues between voters.',
      },
      tabulationCritique:
        "**3-2-1 Voting:** Simple to understand and resistant to tactical voting. Uses a constrained score range that's easy for voters to grasp.",
      proportionalityDetails:
        '**Non-Proportional Multi-Winner:** May lead to sweep victories and poor minority representation.',
    },
    {
      id: 'majority-judgment',
      name: 'Majority Judgment',
      shortDescription: 'Winner has highest median score',
      detailedCritique:
        "Uses the median (middle) score for each candidate rather than totals or averages. Highly resistant to strategic manipulation since extreme scores don't affect the median. Can lead to ties requiring complex tie-breaking rules.",
      ballotType: 'score',
      choiceLimitation: 'any',
      minSeats: 1,
      maxSeats: 1,
      scores: {
        proportionality: 0,
        simplicity: 3,
        honestStrategyResistance: 2,
        strategicStraightforwardness: 1,
        representation: 4,
      },
      isProportional: false,
      isSemiProportional: false,
      category: 'score',
      ballotTypeCritique: {
        score:
          '**Strengths:** Expresses preference intensity, highly expressive. **Weaknesses:** Strategic voting concerns, normalization issues between voters.',
      },
      tabulationCritique:
        "**Majority Judgment:** Uses the median (middle) score for each candidate rather than totals or averages. This makes it highly resistant to strategic manipulation since extreme scores (very high or very low) don't affect the median. However, it can lead to ties when candidates have the same median, requiring complex tie-breaking rules. The detailed scoring is most valuable when there are many candidates to differentiate.",
      proportionalityDetails:
        '**Non-Proportional Multi-Winner:** May lead to sweep victories and poor minority representation.',
    },
    {
      id: 'top-two-runoff',
      name: 'Top-Two Runoff',
      shortDescription: 'Top 2 candidates advance to runoff election',
      detailedCritique:
        'Two-round system where if no candidate gets a majority, the top two candidates compete in a second election. Simple and familiar but can eliminate popular candidates in the first round.',
      ballotType: 'choose-x',
      choiceLimitation: '1',
      minSeats: 1,
      maxSeats: 1,
      scores: {
        proportionality: 0,
        simplicity: 4,
        honestStrategyResistance: 1,
        strategicStraightforwardness: 2,
        representation: 2,
      },
      isProportional: false,
      isSemiProportional: false,
      category: 'plurality',
      ballotTypeCritique: {
        'choose-x-1':
          "**Strengths:** Simple and familiar. **Weaknesses:** Severe vote splitting, spoiler effects, doesn't capture full voter preferences.",
      },
      tabulationCritique:
        "**Top-Two Runoff:** Ensures the winner has majority support in the final round, but can eliminate popular candidates who don't make the top two. Technically not a different tabulation method, but just block voting then FPTP",
      proportionalityDetails:
        '**Non-Proportional Multi-Winner:** May lead to sweep victories and poor minority representation.',
      votingMachineCompatibility: {
        existingMachines: true,
        description: 'Compatible with existing voting machines',
      },
    },
  ];

  const listTypes = [
    {
      id: 'closed',
      name: 'Closed List',
      description: 'Voters vote for parties, party decides candidate order',
    },
    {
      id: 'open',
      name: 'Open List',
      description: 'Voters vote for individual candidates within parties',
    },
    {
      id: 'flexible',
      name: 'Flexible List',
      description: 'Voters can vote for party or individual candidates',
    },
  ];

  // Computed properties
  $: isRankedBallot = config.ballotType === 'ranking';
  $: isApprovalBallot = config.ballotType === 'choose-x';
  $: isScoreBallot = config.ballotType === 'score';
  $: isMultiWinner = config.numberOfSeats > 1;

  // Declare availableTabulationMethods
  let availableTabulationMethods: any[] = [];

  // Get available methods based on current configuration
  function getAvailableMethods(config: VotingConfig): VotingMethod[] {
    return VOTING_METHODS.filter((method) => {
      // Ballot type match
      if (method.ballotType !== config.ballotType) return false;

      // Choice limitation compatibility
      if (method.choiceLimitation !== 'any' && method.choiceLimitation !== config.limitedChoices)
        return false;

      // Election type filter (if not 'all')
      if (electionTypeFilter !== 'all') {
        const currentElectionType = getElectionType(config.numberOfSeats);
        if (electionTypeFilter === 'single') {
          // Only show single winner methods
          if (method.minSeats > 1) return false;
        } else if (electionTypeFilter === 'multi') {
          // Only show multi winner methods
          if (method.maxSeats === 1) return false;
        }
      }

      // Seat count compatibility (skip when showing all elections)
      if (electionTypeFilter !== 'all') {
        if (
          config.numberOfSeats < method.minSeats ||
          (method.maxSeats !== 'unlimited' && config.numberOfSeats > method.maxSeats)
        )
          return false;
      }

      // No party requirements check - always assume parties exist
      return true;
    });
  }

  // Build available tabulation methods based on current config
  $: {
    // Include electionTypeFilter in reactive dependencies
    const methods = getAvailableMethods(config);
    electionTypeFilter; // Add to reactive dependencies
    // Convert to legacy format for compatibility with existing UI
    availableTabulationMethods = methods.map((m) => ({
      id: m.id,
      name: m.name,
      description: m.shortDescription,
    }));
  }

  $: votingMethodName = generateVotingMethodName(config);
  $: votingMethodSummary = generateVotingMethodSummary(config);
  $: votingMethodCritique = generateVotingMethodCritiqueFromData(config);
  $: votingMethodScores = generateVotingMethodScores(config);

  function generateVotingMethodName(config: VotingConfig) {
    // Fallback when no ballot type selected
    if (!config.ballotType) return 'Select a ballot type to begin';

    // Fallback when no tabulation method selected
    if (!config.tabulationMethod) {
      if (config.ballotType === 'choose-x') {
        if (config.limitedChoices === '1') return 'First Past The Post';
        if (config.limitedChoices === 'unlimited') return 'Approval Voting';
        if (config.limitedChoices === 'custom') return `Limited Voting (${config.customLimit})`;
      }
      return 'Select a tabulation method';
    }

    // Get the base method name from VOTING_METHODS
    const method = VOTING_METHODS.find((m) => m.id === config.tabulationMethod);
    if (!method) return 'Unknown Method';

    let name = method.name;

    // Add configuration-specific modifiers

    // Add list type modifier for party-based methods
    if (config.listType && ['party-list-pr', 'mmp'].includes(config.tabulationMethod)) {
      const listType = listTypes.find((l) => l.id === config.listType);
      if (listType) {
        name = `${listType.name} ${name}`;
      }
    }

    // Add mixed member proportion for MMP
    if (config.tabulationMethod === 'mmp' && config.mixedMember) {
      const districtPercent = config.singleWinnerProportion;
      const listPercent = 100 - districtPercent;
      name += ` (${districtPercent}% districts, ${listPercent}% list)`;
    }

    // Add custom limit for limited voting
    if (config.limitedChoices === 'custom' && config.customLimit !== 3) {
      if (!name.includes(`(${config.customLimit})`)) {
        name += ` (${config.customLimit})`;
      }
    }

    return name;
  }

  function generateVotingMethodSummary(config: VotingConfig) {
    if (!config.ballotType) return '';

    let summary = '';

    // Ballot description
    const ballotType = ballotTypes.find((b) => b.id === config.ballotType);
    if (ballotType) {
      summary += `**Ballot Type:** ${ballotType.description}`;

      if (config.ballotType === 'score') {
        summary += ` (${config.scoreMin} to ${config.scoreMax}`;
        if (config.allowNegativeVotes) summary += ', negative scores allowed';
        summary +=
          '). Score voting works best with many candidates and relatively few voters, where the expressivity helps prevent ties';
      }
      summary += '\n\n';
    }

    // Choice limitations
    if (config.limitedChoices && config.limitedChoices !== 'unlimited') {
      if (config.limitedChoices === 'custom') {
        summary += `**Choice Limit:** Maximum of ${config.customLimit} candidate${config.customLimit === 1 ? '' : 's'}\n\n`;
      } else {
        const limit = limitedChoicesOptions.find((l) => l.id === config.limitedChoices);
        if (limit) {
          summary += `**Choice Limit:** ${limit.description}\n\n`;
        }
      }
    }

    // Tabulation method
    if (config.tabulationMethod) {
      const method = availableTabulationMethods.find((m) => m.id === config.tabulationMethod);
      if (method) {
        summary += `**Tabulation:** ${method.description}\n\n`;
      }

      // Voting machine compatibility
      const fullMethod = VOTING_METHODS.find((m) => m.id === config.tabulationMethod);
      if (fullMethod && fullMethod.votingMachineCompatibility) {
        const icon = fullMethod.votingMachineCompatibility.existingMachines ? '✅' : '❌';
        summary += `**Voting Machines:** ${icon} ${fullMethod.votingMachineCompatibility.description}\n\n`;
      }
    }

    // Election size details
    if (config.numberOfSeats === 1) {
      summary += `**Single-Winner Election:** Electing 1 seat\n\n`;
    } else {
      summary += `**Multi-Winner Election:** Electing ${config.numberOfSeats} seats\n\n`;

      // Party structure - always assume parties exist for multi-winner elections
      let partyDesc = '**Party Structure:** Election has political parties. ';
      if (config.canVoteForParties && config.canVoteForCandidates) {
        partyDesc += 'Voters can choose both parties and individual candidates.';
      } else if (config.canVoteForParties) {
        partyDesc += 'Voters choose parties only.';
      } else if (config.canVoteForCandidates) {
        partyDesc += 'Voters choose individual candidates within parties.';
      }

      if (config.hasPrimaries) {
        partyDesc += ' Parties select candidates through primary elections.';
      } else {
        partyDesc +=
          ' Parties select candidates through internal processes (conventions, appointments, etc.).';
      }

      summary += partyDesc + '\n\n';

      // Add details for party-based tabulation methods
      if (['party-list-pr', 'mmp'].includes(config.tabulationMethod || '')) {
        // List type details
        if (config.listType) {
          const listType = listTypes.find((l) => l.id === config.listType);
          if (listType) {
            summary += `**List Type:** ${listType.description}\n\n`;
          }
        }

        // Mixed member details for MMP
        if (config.tabulationMethod === 'mmp' && config.mixedMember) {
          const districtPercent = config.singleWinnerProportion;
          const listPercent = 100 - districtPercent;
          summary += `**Mixed System:** ${districtPercent}% of seats elected in single-winner districts, ${listPercent}% from party lists to ensure proportionality\n\n`;
        }
      }
    }

    return summary.trim();
  }

  function generateVotingMethodCritiqueFromData(config: VotingConfig) {
    if (!config.ballotType || !config.tabulationMethod) return '';

    const method = VOTING_METHODS.find((m) => m.id === config.tabulationMethod);
    if (!method) return '';

    let critique = '';

    // Add ballot type critique
    if (method.ballotTypeCritique) {
      let ballotKey = config.ballotType;
      if (config.ballotType === 'choose-x') {
        ballotKey = `choose-x-${config.limitedChoices || 'unlimited'}`;
      }

      const ballotCritique =
        method.ballotTypeCritique[ballotKey] ||
        method.ballotTypeCritique[config.ballotType] ||
        method.ballotTypeCritique['choose-x-unlimited']; // fallback

      if (ballotCritique) {
        critique += '**Ballot Type Analysis:** ' + ballotCritique + '\n\n';
      }
    }

    // Add tabulation critique
    if (method.tabulationCritique) {
      critique += method.tabulationCritique + '\n\n';
    }

    // Add proportionality details for multi-winner
    if (config.numberOfSeats > 1 && method.proportionalityDetails) {
      critique += method.proportionalityDetails;

      // Add list type critique for party-based methods
      if (config.listType && method.listTypeCritique) {
        const listCritique =
          method.listTypeCritique[config.listType as keyof typeof method.listTypeCritique];
        if (listCritique) {
          critique += '\n\n' + listCritique;
        }
      }

      // Add mixed member critique for MMP
      if (config.tabulationMethod === 'mmp' && config.mixedMember) {
        critique += '\n\n';
        const districtPercent = config.singleWinnerProportion;
        if (districtPercent > 70) {
          critique +=
            '**High District Proportion:** Maintains strong local representation but may reduce proportionality effectiveness.';
        } else if (districtPercent < 30) {
          critique +=
            '**High List Proportion:** Maximizes proportionality but may weaken local representation and accountability.';
        } else {
          critique +=
            '**Balanced Mixed System:** Good compromise between local representation and proportionality.';
        }
      }

      // Add primary elections critique
      if (config.hasParties && method.primaryCritique) {
        critique += '\n\n';
        const primaryKey = config.hasPrimaries ? 'withPrimaries' : 'withoutPrimaries';
        const primaryCritique = method.primaryCritique[primaryKey];
        if (primaryCritique) {
          critique += primaryCritique;
        }
      }
    }

    return critique.trim();
  }

  function generateVotingMethodScores(config: VotingConfig) {
    const defaultScores = {
      proportionality: 0,
      simplicity: 0,
      honestStrategyResistance: 0,
      strategicStraightforwardness: 0,
      representation: 0,
    };

    if (!config.ballotType || !config.tabulationMethod) {
      return defaultScores;
    }

    // Find the method in our database
    const method = VOTING_METHODS.find((m) => m.id === config.tabulationMethod);
    if (!method) return defaultScores;

    // Start with the method's base scores
    const scores = { ...method.scores };

    // Special handling for multi-winner "block approval" which maps to most-votes logic
    if (config.numberOfSeats > 1 && config.tabulationMethod === 'block-approval') {
      scores.representation = 2; // Block voting has poor representation
    }

    // Adjust for choice limitations (FPTP override)
    if (config.limitedChoices === '1' && config.ballotType === 'choose-x') {
      scores.honestStrategyResistance = 0; // FPTP is extremely vulnerable to tactical voting
      scores.strategicStraightforwardness = 0; // FPTP requires heavy strategic thinking - worst case
      scores.representation = 1; // FPTP has terrible representation quality
    }

    // Single-winner methods can't be proportional
    if (config.numberOfSeats === 1) {
      scores.proportionality = 0;
    }

    return scores;
  }

  function isProportionalMethod(config: VotingConfig): boolean {
    if (config.numberOfSeats <= 1) return false;
    const method = VOTING_METHODS.find((m) => m.id === config.tabulationMethod);
    return method?.isProportional || false;
  }

  function isSemiProportionalMethod(config: VotingConfig): boolean {
    if (config.numberOfSeats <= 1) return false;
    const method = VOTING_METHODS.find((m) => m.id === config.tabulationMethod);
    return method?.isSemiProportional || false;
  }

  function selectElectionType(selectedType: string) {
    if (selectedType === 'single') {
      selectOption('numberOfSeats', 1);
    } else if (selectedType === 'multi') {
      // Default to a reasonable multi-winner size for method compatibility
      selectOption('numberOfSeats', 10);
    }
  }

  function selectElectionTypeFilter(filterType: string) {
    electionTypeFilter = filterType;
    // Update numberOfSeats based on filter to ensure compatibility
    if (filterType === 'single') {
      selectOption('numberOfSeats', 1);
    } else if (filterType === 'multi') {
      selectOption('numberOfSeats', 10);
    }
    // If 'all', keep current numberOfSeats
  }

  function selectOption(category: keyof VotingConfig, value: any) {
    (config as any)[category] = value;

    // Reset dependent options when changing ballot type
    if (category === 'ballotType') {
      config.tabulationMethod = null;
      if (value === 'choose-x') {
        config.limitedChoices = '1'; // Default to FPTP (Pick 1)
      }
    }

    // Auto-select FPTP when choosing "Pick 1"
    if (category === 'limitedChoices' && value === '1' && config.ballotType === 'choose-x') {
      config.tabulationMethod = config.numberOfSeats > 1 ? 'sntv' : 'fptp';
    }

    // Set default list type for party-based methods
    if (category === 'tabulationMethod' && ['party-list-pr', 'mmp'].includes(value)) {
      if (!config.listType) {
        config.listType = 'closed';
      }
    }

    // Auto-select appropriate tabulation for some ballot types
    if (category === 'ballotType') {
      if (value === 'choose-x') {
        config.tabulationMethod = config.numberOfSeats > 1 ? 'sntv' : 'fptp';
      } else if (value === 'score') {
        config.tabulationMethod = 'highest-total';
      } else if (value === 'ranking') {
        config.tabulationMethod = config.numberOfSeats > 1 ? 'stv' : 'irv';
      }
    }

    // Auto-select appropriate tabulation when changing number of seats
    if (category === 'numberOfSeats') {
      const isMulti = value > 1;
      if (config.ballotType === 'choose-x') {
        config.tabulationMethod = isMulti ? 'spav' : 'approval';
      } else if (config.ballotType === 'ranking') {
        config.tabulationMethod = isMulti ? 'stv' : 'irv';
      } else if (config.ballotType === 'score') {
        config.tabulationMethod = isMulti ? 'equal-shares' : 'highest-total';
      }

      // Reset multi-winner specific options for single-winner
      if (!isMulti) {
        config.listType = null;
        config.mixedMember = false;
        config.singleWinnerProportion = 50;
      }
    }
  }

  // Simple toggletip state management
  let activeTooltip: string | null = null;

  function toggleTooltip(id: string) {
    activeTooltip = activeTooltip === id ? null : id;
  }

  function closeTooltip() {
    activeTooltip = null;
  }

  // Close tooltip on escape key
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      closeTooltip();
    }
  }

  // Method comparison state
  let showComparison = false;
  let comparisonMethods: VotingMethod[] = [];

  function showMethodComparison(methodIds: string[]) {
    comparisonMethods = VOTING_METHODS.filter((m) => methodIds.includes(m.id));
    showComparison = true;
  }

  function closeComparison() {
    showComparison = false;
    comparisonMethods = [];
  }

  // Get suggested comparisons based on current method
  function getSuggestedComparisons(
    config: VotingConfig
  ): { title: string; methods: string[]; description: string }[] {
    const currentMethod = VOTING_METHODS.find((m) => m.id === config.tabulationMethod);
    if (!currentMethod) return [];

    // Get all methods available in current configuration
    const availableMethods = getAvailableMethods(config);
    const availableIds = availableMethods.map((m) => m.id);

    const suggestions = [];

    // Helper to filter suggested methods to only those available
    const filterAvailable = (methodIds: string[]) =>
      methodIds.filter((id) => availableIds.includes(id));

    // Proportional score methods
    const proportionalScoreMethods = filterAvailable([
      'equal-shares',
      'star-pr',
      'allocated-score',
      'pav',
    ]);
    if (
      proportionalScoreMethods.includes(config.tabulationMethod || '') &&
      proportionalScoreMethods.length > 1
    ) {
      suggestions.push({
        title: 'Proportional Score Methods',
        methods: proportionalScoreMethods,
        description:
          'All provide proportional representation with score/approval ballots but use different algorithms',
      });
    }

    // Multi-winner score methods (all types)
    const multiWinnerScoreMethods = filterAvailable([
      'block-score',
      'equal-shares',
      'star-pr',
      'allocated-score',
    ]);
    if (
      multiWinnerScoreMethods.includes(config.tabulationMethod || '') &&
      multiWinnerScoreMethods.length > 1
    ) {
      suggestions.push({
        title: 'Multi-Winner Score Methods',
        methods: multiWinnerScoreMethods,
        description:
          'Different approaches to multi-winner elections with score ballots - from simple block voting to complex proportional systems',
      });
    }

    // Single-winner score methods
    const singleWinnerScoreMethods = filterAvailable([
      'highest-total',
      'star',
      'range-voting',
      '3-2-1-voting',
      'majority-judgment',
    ]);
    if (
      singleWinnerScoreMethods.includes(config.tabulationMethod || '') &&
      singleWinnerScoreMethods.length > 1
    ) {
      suggestions.push({
        title: 'Single-Winner Score Methods',
        methods: singleWinnerScoreMethods,
        description:
          'Different ways to count score ballots - from simple totals to complex runoffs',
      });
    }

    // Single-winner choose-x methods
    const singleWinnerChooseXMethods = filterAvailable([
      'fptp',
      'approval',
      'limited-voting-single',
      'top-two-runoff',
    ]);
    if (
      singleWinnerChooseXMethods.includes(config.tabulationMethod || '') &&
      singleWinnerChooseXMethods.length > 1
    ) {
      suggestions.push({
        title: 'Single-Winner Choose-X Methods',
        methods: singleWinnerChooseXMethods,
        description: 'Different approaches to single-winner elections with choose-X ballots',
      });
    }

    // Approval-based proportional methods
    const approvalProportionalMethods = filterAvailable(['spav', 'pav', 'satisfaction-approval']);
    if (
      approvalProportionalMethods.includes(config.tabulationMethod || '') &&
      approvalProportionalMethods.length > 1
    ) {
      suggestions.push({
        title: 'Approval-Based Proportional Methods',
        methods: approvalProportionalMethods,
        description: 'Ways to achieve proportional representation using approval ballots',
      });
    }

    // Choose-X methods (all types - includes block voting, approval, etc.)
    const chooseXMethods = filterAvailable([
      'fptp',
      'approval',
      'limited-voting-single',
      'top-two-runoff',
      'block-voting',
      'block-approval',
      'limited-voting',
      'cumulative-voting',
      'sntv',
      'satisfaction-approval',
      'spav',
      'pav',
    ]);
    if (chooseXMethods.includes(config.tabulationMethod || '') && chooseXMethods.length > 1) {
      suggestions.push({
        title: 'Choose-X Methods',
        methods: chooseXMethods,
        description:
          'Different ways to count choose-X ballots - from simple plurality to complex proportional systems',
      });
    }

    // Multi-winner choose-X methods
    const multiWinnerChooseXMethods = filterAvailable([
      'block-voting',
      'block-approval',
      'limited-voting',
      'cumulative-voting',
      'sntv',
      'satisfaction-approval',
      'spav',
      'pav',
    ]);
    if (
      multiWinnerChooseXMethods.includes(config.tabulationMethod || '') &&
      multiWinnerChooseXMethods.length > 1
    ) {
      suggestions.push({
        title: 'Multi-Winner Choose-X Methods',
        methods: multiWinnerChooseXMethods,
        description:
          'Different approaches to multi-winner elections with choose-X ballots - from simple block voting to proportional systems',
      });
    }

    // Ranked methods
    const rankedMethods = filterAvailable(['irv', 'borda', 'condorcet', 'stv']);
    if (rankedMethods.includes(config.tabulationMethod || '') && rankedMethods.length > 1) {
      suggestions.push({
        title: 'Ranked Choice Methods',
        methods: rankedMethods,
        description: 'Different algorithms for counting ranked ballots',
      });
    }

    return suggestions;
  }
</script>

<svelte:head>
  <title>Voting Method Builder - Create Your Custom Voting System - approval.vote</title>
  <meta
    name="description"
    content="Interactive tool to design and analyze custom voting methods. Mix and match ballot types, tabulation methods, and multi-winner options to create your ideal voting system."
  />
</svelte:head>

<svelte:window on:keydown={handleKeydown} on:click={closeTooltip} />

<div class="container wide-builder">
  <div class="description">
    <h1>Voting Method Builder</h1>
    <p class="subtitle">Mix and match components to design your ideal voting system</p>
  </div>

  <div class="builder-layout">
    <!-- Configuration Panel -->
    <div class="config-panel">
      <!-- Ballot Type Section -->
      <section class="config-section">
        <h2>📝 Ballot Type</h2>
        <p class="section-description">How do voters express their preferences?</p>
        <div class="option-grid">
          {#each ballotTypes as option}
            <button
              class="option-button"
              class:selected={config.ballotType === option.id}
              on:click={() => selectOption('ballotType', option.id)}
            >
              <div class="option-name">{option.name}</div>
              <div class="option-description">{option.description}</div>
            </button>
          {/each}
        </div>

        {#if config.ballotType === 'score'}
          <div class="sub-options">
            <label>
              Score Range:
              <input
                type="number"
                bind:value={config.scoreMin}
                min="-10"
                max="0"
                style="width: 60px;"
              />
              to
              <input
                type="number"
                bind:value={config.scoreMax}
                min="1"
                max="10"
                style="width: 60px;"
              />
            </label>
            <label>
              <input type="checkbox" bind:checked={config.allowNegativeVotes} />
              Allow negative scores
            </label>
          </div>
        {/if}
      </section>

      <!-- Limited Choices Section -->
      {#if config.ballotType === 'choose-x'}
        <section class="config-section">
          <h2>🔢 Choice Limitations</h2>
          <p class="section-description">How many candidates can voters select?</p>
          <div class="option-grid">
            {#each limitedChoicesOptions as option}
              <button
                class="option-button small"
                class:selected={config.limitedChoices === option.id}
                on:click={() => selectOption('limitedChoices', option.id)}
              >
                <div class="option-name">{option.name}</div>
                <div class="option-description">{option.description}</div>
              </button>
            {/each}
          </div>

          {#if config.limitedChoices === 'custom'}
            <div class="sub-options">
              <label>
                Custom maximum:
                <input
                  type="number"
                  bind:value={config.customLimit}
                  min="1"
                  max="20"
                  style="width: 80px;"
                />
                candidate{config.customLimit === 1 ? '' : 's'}
              </label>
            </div>
          {/if}
        </section>
      {/if}

      <!-- Election Type Section -->
      <section class="config-section">
        <h2>🏛️ Election Type</h2>
        <p class="section-description">Are you electing one person or multiple people?</p>
        <div class="option-grid">
          {#each electionTypes as option}
            <button
              class="option-button small"
              class:selected={electionTypeFilter === option.id}
              on:click={() => selectElectionTypeFilter(option.id)}
            >
              <div class="option-name">{option.name}</div>
              <div class="option-description">{option.description}</div>
            </button>
          {/each}
        </div>
      </section>

      <!-- Tabulation Method Section -->
      {#if config.ballotType}
        <section class="config-section">
          <h2>🔢 Tabulation Method</h2>
          <p class="section-description">How are votes counted to determine winners?</p>
          <div class="option-grid">
            {#each availableTabulationMethods as option}
              <button
                class="option-button"
                class:selected={config.tabulationMethod === option.id}
                on:click={() => selectOption('tabulationMethod', option.id)}
              >
                <div class="option-name">{option.name}</div>
                <div class="option-description">{option.description}</div>
              </button>
            {/each}
          </div>
        </section>
      {/if}

      <!-- Party-Based Method Options -->
      {#if config.tabulationMethod && ['party-list-pr', 'mmp'].includes(config.tabulationMethod)}
        <section class="config-section">
          <h2>🗳️ Party-Based Method Options</h2>

          <!-- List Type Options -->
          <div class="sub-options">
            <p><strong>List Type:</strong></p>
            <div class="option-grid">
              {#each listTypes as option}
                <button
                  class="option-button small"
                  class:selected={config.listType === option.id}
                  on:click={() => selectOption('listType', option.id)}
                >
                  <div class="option-name">{option.name}</div>
                  <div class="option-description">{option.description}</div>
                </button>
              {/each}
            </div>
          </div>

          <!-- Mixed Member Proportional Options -->
          {#if config.tabulationMethod === 'mmp'}
            <div class="sub-options">
              <div class="toggle-section">
                <label class="toggle-label">
                  <input type="checkbox" bind:checked={config.mixedMember} />
                  <span class="toggle-text">Enable mixed member system</span>
                </label>
              </div>

              {#if config.mixedMember}
                <div class="slider-section">
                  <label>
                    Single-winner seats: <strong>{config.singleWinnerProportion}%</strong>
                    <input
                      type="range"
                      bind:value={config.singleWinnerProportion}
                      min="0"
                      max="100"
                      step="5"
                      class="proportion-slider"
                    />
                    <div class="slider-labels">
                      <span>All List (0%)</span>
                      <span>Mixed (50%)</span>
                      <span>All Districts (100%)</span>
                    </div>
                  </label>
                </div>
              {/if}
            </div>
          {/if}
        </section>
      {/if}
    </div>

    <!-- Results Panel -->
    <div class="results-panel">
      <div class="result-card">
        <h2 class="method-name">
          {votingMethodName}
          {#if isProportionalMethod(config)}
            <span
              class="proportional-badge"
              title="This is a proportional representation method that ensures fair party/group representation"
              >⚖️</span
            >
          {:else if isSemiProportionalMethod(config)}
            <span
              class="proportional-badge"
              title="This is a semi-proportional method that provides some fairness but not full proportional representation"
              >⚖️✨</span
            >
          {/if}
        </h2>

        {#if config.ballotType && config.tabulationMethod}
          <div class="method-scores">
            <h3>System Analysis</h3>
            <div class="score-grid">
              <div class="score-item">
                <div class="score-bar-container">
                  <div class="score-label-container">
                    <span
                      class="score-label clickable"
                      on:click={(e) => {
                        e.stopPropagation();
                        toggleTooltip('proportionality');
                      }}>Proportionality</span
                    >
                  </div>
                  <div class="score-bar">
                    <div
                      class="score-fill"
                      data-score={votingMethodScores.proportionality}
                      style="width: {(votingMethodScores.proportionality / 5) * 100}%"
                    ></div>
                    <span class="score-value">{votingMethodScores.proportionality}/5</span>
                  </div>
                </div>
                {#if activeTooltip === 'proportionality'}
                  <div class="info-panel">
                    How well the election results reflect the proportion of support for different
                    groups or parties - higher scores mean seats are allocated more fairly based on
                    vote share
                  </div>
                {/if}
              </div>
              <div class="score-item">
                <div class="score-bar-container">
                  <div class="score-label-container">
                    <span
                      class="score-label clickable"
                      on:click={(e) => {
                        e.stopPropagation();
                        toggleTooltip('simplicity');
                      }}>Voter Simplicity</span
                    >
                  </div>
                  <div class="score-bar">
                    <div
                      class="score-fill"
                      data-score={votingMethodScores.simplicity}
                      style="width: {(votingMethodScores.simplicity / 5) * 100}%"
                    ></div>
                    <span class="score-value">{votingMethodScores.simplicity}/5</span>
                  </div>
                </div>
                {#if activeTooltip === 'simplicity'}
                  <div class="info-panel">
                    How easy it is for voters to understand and use the voting method - considers
                    ballot complexity, cognitive load, and learning curve
                  </div>
                {/if}
              </div>
              <div class="score-item">
                <div class="score-bar-container">
                  <div class="score-label-container">
                    <span
                      class="score-label clickable"
                      on:click={(e) => {
                        e.stopPropagation();
                        toggleTooltip('honest-resistance');
                      }}>Honest Strategy Resistance</span
                    >
                  </div>
                  <div class="score-bar">
                    <div
                      class="score-fill"
                      data-score={votingMethodScores.honestStrategyResistance}
                      style="width: {(votingMethodScores.honestStrategyResistance / 5) * 100}%"
                    ></div>
                    <span class="score-value">{votingMethodScores.honestStrategyResistance}/5</span>
                  </div>
                </div>
                {#if activeTooltip === 'honest-resistance'}
                  <div class="info-panel">
                    How well the method resists dishonest strategies where you support a
                    less-preferred candidate more than a preferred one - higher scores mean less
                    incentive for tactical voting
                  </div>
                {/if}
              </div>
              <div class="score-item">
                <div class="score-bar-container">
                  <div class="score-label-container">
                    <span
                      class="score-label clickable"
                      on:click={(e) => {
                        e.stopPropagation();
                        toggleTooltip('quality');
                      }}>Representation Quality</span
                    >
                  </div>
                  <div class="score-bar">
                    <div
                      class="score-fill"
                      data-score={votingMethodScores.representation}
                      style="width: {(votingMethodScores.representation / 5) * 100}%"
                    ></div>
                    <span class="score-value">{votingMethodScores.representation}/5</span>
                  </div>
                </div>
                {#if activeTooltip === 'quality'}
                  <div class="info-panel">
                    How well the elected candidates actually represent the preferences and will of
                    the electorate - considers broad support, minority representation, and whether
                    outcomes reflect voter intent
                  </div>
                {/if}
              </div>
              <div class="score-item">
                <div class="score-bar-container">
                  <div class="score-label-container">
                    <span
                      class="score-label clickable"
                      on:click={(e) => {
                        e.stopPropagation();
                        toggleTooltip('straightforwardness');
                      }}>Strategic Straightforwardness</span
                    >
                  </div>
                  <div class="score-bar">
                    <div
                      class="score-fill"
                      data-score={votingMethodScores.strategicStraightforwardness}
                      style="width: {(votingMethodScores.strategicStraightforwardness / 5) * 100}%"
                    ></div>
                    <span class="score-value"
                      >{votingMethodScores.strategicStraightforwardness}/5</span
                    >
                  </div>
                </div>
                {#if activeTooltip === 'straightforwardness'}
                  <div class="info-panel">
                    How easy it is to vote your true preferences without needing to consider
                    strategy or candidate viability - higher scores mean less mental burden on
                    voters
                  </div>
                {/if}
              </div>
            </div>
          </div>
        {/if}

        {#if votingMethodSummary}
          <div class="method-summary">
            {@html votingMethodSummary
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\n\n/g, '<br><br>')}
          </div>
        {/if}

        {#if votingMethodCritique}
          <div class="method-critique">
            <h3>Detailed Analysis</h3>
            {@html votingMethodCritique
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\n\n/g, '<br><br>')}
          </div>
        {/if}

        {#if config.ballotType}
          <!-- Method Comparison Suggestions -->
          {#if config.tabulationMethod && getSuggestedComparisons(config).length > 0}
            <div class="comparison-suggestions">
              <h3>🤔 Confused about similar methods?</h3>
              {#each getSuggestedComparisons(config) as suggestion}
                <div class="comparison-suggestion">
                  <button
                    class="compare-button"
                    on:click={() => showMethodComparison(suggestion.methods)}
                  >
                    Compare {suggestion.title}
                  </button>
                  <p class="suggestion-description">{suggestion.description}</p>
                </div>
              {/each}
            </div>
          {/if}

          <div class="method-actions">
            <a href="{resolve('/about-approval-voting')}" class="action-link">Learn about voting systems</a
            >
            <a
              href="https://github.com/fsargent/approval-vote/issues"
              target="_blank"
              rel="noopener noreferrer"
              class="action-link github-link">Found something wrong? File an issue on GitHub</a
            >
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<!-- Method Comparison Modal -->
{#if showComparison}
  <div
    class="comparison-overlay"
    role="button"
    tabindex="0"
    on:click={closeComparison}
    on:keydown={(e) => e.key === 'Escape' && closeComparison()}
  >
    <div
      class="comparison-modal"
      role="dialog"
      tabindex="-1"
      aria-labelledby="comparison-title"
      on:click={(e) => e.stopPropagation()}
      on:keydown={(e) => e.stopPropagation()}
    >
      <div class="comparison-header">
        <h2 id="comparison-title">Method Comparison</h2>
        <button class="close-button" on:click={closeComparison}>×</button>
      </div>

      <div class="comparison-content">
        <div class="comparison-grid">
          {#each comparisonMethods as method}
            <div class="comparison-card" class:current={method.id === config.tabulationMethod}>
              <div class="card-header">
                <h3>{method.name}</h3>
                {#if method.id === config.tabulationMethod}
                  <span class="current-badge">Current</span>
                {/if}
              </div>

              <div class="method-summary-compact">
                <p><strong>What it does:</strong> {method.shortDescription}</p>
              </div>

              <div class="score-comparison">
                <div class="score-row">
                  <span class="score-name">Proportionality</span>
                  <div class="score-bar-small">
                    <div
                      class="score-fill-small"
                      style="width: {(method.scores.proportionality / 5) * 100}%"
                    ></div>
                  </div>
                  <span class="score-num">{method.scores.proportionality}/5</span>
                </div>
                <div class="score-row">
                  <span class="score-name">Simplicity</span>
                  <div class="score-bar-small">
                    <div
                      class="score-fill-small"
                      style="width: {(method.scores.simplicity / 5) * 100}%"
                    ></div>
                  </div>
                  <span class="score-num">{method.scores.simplicity}/5</span>
                </div>
                <div class="score-row">
                  <span class="score-name">Honest Strategy</span>
                  <div class="score-bar-small">
                    <div
                      class="score-fill-small"
                      style="width: {(method.scores.honestStrategyResistance / 5) * 100}%"
                    ></div>
                  </div>
                  <span class="score-num">{method.scores.honestStrategyResistance}/5</span>
                </div>
                <div class="score-row">
                  <span class="score-name">Straightforward</span>
                  <div class="score-bar-small">
                    <div
                      class="score-fill-small"
                      style="width: {(method.scores.strategicStraightforwardness / 5) * 100}%"
                    ></div>
                  </div>
                  <span class="score-num">{method.scores.strategicStraightforwardness}/5</span>
                </div>
                <div class="score-row">
                  <span class="score-name">Representation</span>
                  <div class="score-bar-small">
                    <div
                      class="score-fill-small"
                      style="width: {(method.scores.representation / 5) * 100}%"
                    ></div>
                  </div>
                  <span class="score-num">{method.scores.representation}/5</span>
                </div>
              </div>

              <div class="method-details">
                <p><strong>Key Trade-offs:</strong> {method.detailedCritique.split('.')[0]}.</p>
              </div>

              {#if method.votingMachineCompatibility}
                <div class="compatibility-compact">
                  <span class="compatibility-label">Voting Machines:</span>
                  <span
                    class="compatibility-value"
                    class:compatible={method.votingMachineCompatibility.existingMachines}
                    class:incompatible={!method.votingMachineCompatibility.existingMachines}
                  >
                    {method.votingMachineCompatibility.existingMachines
                      ? 'Compatible'
                      : 'Requires New Machines'}
                  </span>
                </div>
              {/if}

              {#if method.id !== config.tabulationMethod}
                <button
                  class="switch-method-button"
                  on:click={() => {
                    selectOption('tabulationMethod', method.id);
                    closeComparison();
                  }}
                >
                  Switch to this method
                </button>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .subtitle {
    font-size: 1.2rem;
    color: #777;
    margin-top: 0.5rem;
  }

  /* Wide container for desktop use */
  :global(.container.wide-builder) {
    max-width: 1400px;
    margin: 1.25rem auto;
    padding: 0 2rem;
  }

  @media (min-width: 1600px) {
    :global(.container.wide-builder) {
      max-width: 1600px;
    }
  }

  .builder-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    margin-top: 2rem;
  }

  @media (min-width: 1000px) {
    .builder-layout {
      grid-template-columns: 1fr 450px;
      gap: 3rem;
    }
  }

  @media (min-width: 1400px) {
    .builder-layout {
      grid-template-columns: 1fr 500px;
      gap: 4rem;
    }
  }

  .config-section {
    margin-bottom: 2.5rem;
    padding: 1.5rem;
    background: #f9f9f9;
    border-radius: 8px;
    border-left: 4px solid #437527;
  }

  .config-section h2 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    color: #333;
  }

  .section-description {
    margin-bottom: 1rem;
    color: #666;
    font-style: italic;
  }

  .option-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.75rem;
  }

  .option-grid .option-button.small {
    min-height: auto;
  }

  .option-button {
    background: white;
    border: 2px solid #ddd;
    border-radius: 6px;
    padding: 1rem;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 80px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .option-button:hover {
    border-color: #437527;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .option-button.selected {
    border-color: #437527;
    background: #f0f8ec;
    box-shadow: 0 2px 8px rgba(67, 117, 39, 0.2);
  }

  .option-name {
    font-weight: bold;
    color: #333;
    margin-bottom: 0.25rem;
  }

  .option-description {
    font-size: 0.9rem;
    color: #666;
    line-height: 1.3;
  }

  .sub-options {
    margin-top: 1rem;
    padding: 1rem;
    background: white;
    border-radius: 4px;
    border: 1px solid #ddd;
  }

  .sub-options label {
    display: block;
    margin-bottom: 0.75rem;
    color: #555;
  }

  .sub-options input[type='number'] {
    margin: 0 0.5rem;
    padding: 0.25rem;
    border: 1px solid #ccc;
    border-radius: 3px;
  }

  .toggle-section {
    margin: 1rem 0;
  }

  .toggle-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-weight: 500;
  }

  .toggle-label input[type='checkbox'] {
    margin-right: 0.5rem;
    transform: scale(1.2);
  }

  .toggle-text {
    color: #333;
  }

  .slider-section {
    margin-top: 1rem;
    padding: 1rem;
    background: #f5f5f5;
    border-radius: 4px;
  }

  .proportion-slider {
    width: 100%;
    margin: 0.5rem 0;
    accent-color: #437527;
  }

  .slider-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: #666;
    margin-top: 0.25rem;
  }

  .results-panel {
    position: sticky;
    top: 2rem;
    height: fit-content;
  }

  .result-card {
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .method-name {
    color: #437527;
    margin-top: 0;
    margin-bottom: 1.5rem;
    font-size: 1.8rem;
    line-height: 1.2;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .proportional-badge {
    font-size: 1.3rem;
    cursor: help;
  }

  .method-scores {
    background: #f1f5f9;
    padding: 1.5rem;
    border-radius: 8px;
    border-left: 4px solid #0ea5e9;
    margin-bottom: 1.5rem;
  }

  .method-scores h3 {
    margin-top: 0;
    color: #0ea5e9;
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }

  .score-grid {
    display: grid;
    gap: 1rem;
  }

  .score-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .score-label-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 200px;
    flex-shrink: 0;
  }

  .score-label {
    font-weight: 500;
    color: #475569;
    font-size: 0.95rem;
  }

  .score-label.clickable {
    cursor: help;
    transition: border-bottom 0.2s ease;
    user-select: none;
    border-bottom: 1px dashed #94a3b8;
    padding-bottom: 1px;
  }

  .score-label.clickable:hover {
    border-bottom: 1px dashed #475569;
  }

  .info-button {
    background: none;
    border: none;
    color: #0ea5e9;
    cursor: pointer;
    font-size: 0.875rem;
    padding: 2px;
    margin: 0;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .info-button:hover,
  .info-button:focus {
    background: #e0f2fe;
    outline: 2px solid #0ea5e9;
    outline-offset: 1px;
  }

  .info-panel {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 0.75rem;
    font-size: 0.875rem;
    line-height: 1.4;
    color: #475569;
    margin-top: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .score-bar-container {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .score-bar {
    flex: 1;
    height: 24px;
    background: #e2e8f0;
    border-radius: 12px;
    position: relative;
    overflow: hidden;
  }

  .score-fill {
    height: 100%;
    border-radius: 12px;
    transition: all 0.3s ease;
  }

  :global(.score-fill[data-score='0']) {
    background: #ef4444;
  } /* Red */
  :global(.score-fill[data-score='1']) {
    background: #f97316;
  } /* Orange-red */
  :global(.score-fill[data-score='2']) {
    background: #f59e0b;
  } /* Orange */
  :global(.score-fill[data-score='3']) {
    background: #eab308;
  } /* Yellow */
  :global(.score-fill[data-score='4']) {
    background: #84cc16;
  } /* Light green */
  :global(.score-fill[data-score='5']) {
    background: #10b981;
  } /* Green */

  .score-value {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.875rem;
    font-weight: 600;
    color: #1e293b;
  }

  .method-summary {
    margin-bottom: 2rem;
    line-height: 1.5;
    color: #555;
  }

  .method-critique {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 6px;
    border-left: 4px solid #437527;
  }

  .method-critique h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #333;
    font-size: 1.3rem;
  }

  .method-actions {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .action-link {
    color: #0ea5e9;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .action-link:hover {
    text-decoration: underline;
  }

  .github-link {
    color: #6b7280;
    font-size: 0.85rem;
  }

  .github-link:hover {
    color: #374151;
  }

  /* Comparison features */
  .comparison-suggestions {
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .comparison-suggestions h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #0369a1;
    font-size: 1.1rem;
  }

  .comparison-suggestion {
    margin-bottom: 1rem;
  }

  .compare-button {
    background: #0ea5e9;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 0.5rem;
  }

  .compare-button:hover {
    background: #0284c7;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .suggestion-description {
    margin: 0;
    font-size: 0.9rem;
    color: #374151;
    font-style: italic;
  }

  .comparison-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .comparison-modal {
    background: white;
    border-radius: 12px;
    max-width: 1200px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .comparison-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;
    border-radius: 12px 12px 0 0;
  }

  .comparison-header h2 {
    margin: 0;
    color: #1e293b;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 2rem;
    color: #64748b;
    cursor: pointer;
    padding: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
  }

  .close-button:hover {
    background: #e2e8f0;
    color: #334155;
  }

  .comparison-content {
    padding: 2rem;
  }

  .comparison-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .comparison-card {
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    padding: 1.5rem;
    transition: all 0.3s ease;
  }

  .comparison-card.current {
    border-color: #10b981;
    background: #f0fdf4;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .card-header h3 {
    margin: 0;
    color: #1e293b;
    font-size: 1.1rem;
  }

  .current-badge {
    background: #10b981;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .method-summary-compact {
    margin-bottom: 1rem;
  }

  .method-summary-compact p {
    margin: 0;
    font-size: 0.9rem;
    color: #475569;
    line-height: 1.4;
  }

  .score-comparison {
    margin-bottom: 1rem;
  }

  .score-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .score-name {
    font-size: 0.8rem;
    color: #64748b;
    min-width: 110px;
    font-weight: 500;
  }

  .score-bar-small {
    flex: 1;
    height: 16px;
    background: #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
  }

  .score-fill-small {
    height: 100%;
    background: #0ea5e9;
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  .score-num {
    font-size: 0.8rem;
    font-weight: 600;
    color: #1e293b;
    min-width: 30px;
  }

  .method-details {
    margin-bottom: 1rem;
  }

  .method-details p {
    margin: 0;
    font-size: 0.9rem;
    color: #475569;
    line-height: 1.4;
  }

  .switch-method-button {
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
  }

  .switch-method-button:hover {
    background: #5048e5;
    transform: translateY(-1px);
  }

  .compatibility-compact {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }

  .compatibility-label {
    font-weight: 500;
    color: #64748b;
  }

  .compatibility-value {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .compatibility-value.compatible {
    background: #dcfce7;
    color: #15803d;
  }

  .compatibility-value.incompatible {
    background: #fef3c7;
    color: #d97706;
  }

  @media (max-width: 768px) {
    .comparison-modal {
      margin: 0.5rem;
      max-height: 95vh;
    }

    .comparison-content {
      padding: 1rem;
    }

    .comparison-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
