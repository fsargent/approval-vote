import type { VotingMethod } from '$lib/types/voting';

// Store methods as a dictionary for optimal access patterns
export const VOTING_METHODS: Record<string, VotingMethod> = {
  // Single-winner methods
  fptp: {
    name: 'First Past The Post',
    shortDescription: 'Most votes wins',
    detailedCritique:
      'First Past The Post (FPTP) is the most widely used voting system globally, where voters select one candidate and the candidate with the most votes wins. While its simplicity makes it easy to understand and implement, FPTP suffers from severe limitations that can undermine democratic representation. The system is highly susceptible to vote splitting, where similar candidates divide their shared voter base, potentially allowing a less popular candidate to win. This creates the spoiler effect, forcing voters to strategically vote for a "lesser evil" rather than their true preference. FPTP tends to produce two-party dominance over time, as voters abandon third parties to avoid wasting their votes. In multi-candidate races, winners can have surprisingly low vote shares - sometimes under 30% - meaning the majority of voters preferred someone else. The system also leads to gerrymandering concerns and can produce highly disproportionate results when used for legislative elections.',
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

    tabulationCritique:
      '**FPTP:** Simple but suffers from vote splitting and spoiler effects with multiple candidates.',
    proportionalityDetails:
      '**Non-Proportional Multi-Winner:** May lead to sweep victories and poor minority representation.',
    tags: ['simple', 'plurality', 'majoritarian', 'single-mark'],
  },
  approval: {
    name: 'Approval Voting',
    shortDescription: 'Approve any number of candidates',
    detailedCritique:
      "Approval Voting represents a minimal yet powerful reform to plurality voting, allowing voters to select as many candidates as they approve of, with the candidate receiving the most approvals winning. This elegantly simple change eliminates the spoiler effect entirely - voters can support both their favorite candidate and a more viable alternative without harming either. The system encourages honest voting since supporting additional candidates never hurts those you've already selected. Studies and real-world implementations show Approval Voting tends to elect broadly acceptable consensus candidates rather than polarizing figures. It requires no new voting equipment, as it uses the same ballots as plurality voting. The main limitation is the lack of preference expression - you cannot indicate that you prefer one approved candidate over another. However, this simplicity is also a strength, making the system transparent and easy to understand. Approval Voting has been successfully used by the UN, various professional societies, and the cities of Fargo and St. Louis.",
    usedBy: [
      { code: 'US-ND', name: 'Fargo (USA)', flag: '🇺🇸' },
      { code: 'US-MO', name: 'St. Louis (USA)', flag: '🇺🇸' },
      { code: 'UN', name: 'United Nations (various committees)', flag: '🇺🇳' },
    ],
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

    tabulationCritique:
      '**Most Approvals:** Simple and intuitive, encourages honest voting without strategic downsides.',
    proportionalityDetails:
      '**Non-Proportional Multi-Winner:** May lead to sweep victories and poor minority representation.',
    tags: ['simple', 'consensus', 'binary-choice', 'spoiler-free'],
  },
  'limited-voting-single': {
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

    tabulationCritique:
      '**Limited Voting (Single Winner):** Allows voters to select multiple candidates but only elects one winner. Can reduce vote splitting when limit is greater than 1.',
    proportionalityDetails:
      '**Non-Proportional Multi-Winner:** May lead to sweep victories and poor minority representation.',
  },
  irv: {
    name: 'IRV / RCV (Instant Runoff)',
    shortDescription: 'Eliminate lowest, transfer votes',
    detailedCritique:
      'Instant Runoff Voting (IRV), also called Ranked Choice Voting (RCV) or Alternate Vote (AV, in the UK). Allows voters to rank candidates in order of preference. If no candidate receives a majority of first-choice votes, the candidate with the fewest votes is eliminated and their voters\' ballots are transferred to their next choice. This process continues until someone has a majority. While IRV does eliminate the most basic spoiler effects between similar candidates, it suffers from several paradoxes that can produce counterintuitive results. The system can eliminate centrist candidates who would beat any other candidate head-to-head (the "center squeeze" problem), and in some cases, getting more first-choice votes can actually cause a candidate to lose (non-monotonicity). IRV is also vulnerable to strategic voting - "bullet voting" (only ranking one candidate) can sometimes help your favorite candidate. The sequential elimination process makes results difficult to predict and can take days to tabulate in close races. Despite these flaws, IRV does ensure majority support (among remaining candidates) and allows voters to express preferences.',
    usedBy: [
      { code: 'AU', name: 'Australia (House of Representatives)', flag: '🇦🇺' },
      { code: 'IE', name: 'Ireland (Presidential elections)', flag: '🇮🇪' },
      { code: 'US', name: 'Multiple US cities', flag: '🇺🇸' },
    ],
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

    tabulationCritique:
      '**IRV:** Good at eliminating spoiler effects but can eliminate Condorcet winners and has center-squeeze problems.',
    proportionalityDetails:
      '**Non-Proportional Multi-Winner:** May lead to sweep victories and poor minority representation.',
    flowchart: `flowchart TD
    A["Start: Count first-choice votes"] --> B{"Any candidate has<br/>majority (>50%)?"}
    B -->|Yes| C["Winner: Candidate with majority"]
    B -->|No| D["Identify candidate with<br/>fewest first-choice votes"]
    D --> E["Eliminate candidate<br/>with fewest votes"]
    E --> F["Transfer votes to voters'<br/>next ranked choice"]
    F --> G["Recount all remaining votes"]
    G --> H{"Any candidate has<br/>majority (>50%)?"}
    H -->|Yes| I["Winner: Candidate with majority"]
    H -->|No| J{"Only 2 candidates<br/>remain?"}
    J -->|Yes| K["Winner: Candidate with<br/>more votes"]
    J -->|No| D

    style A fill:#e1f5fe
    style C fill:#c8e6c9
    style I fill:#c8e6c9
    style K fill:#c8e6c9`,
    tags: ['ranked', 'runoff', 'instant-runoff', 'elimination', 'transfers'],
  },
  borda: {
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
    votingMachineCompatibility: {
      existingMachines: false,
      description: 'Requires new voting machines and ballot software',
    },
    tabulationCritique:
      '**Borda:** Rewards broadly acceptable candidates but highly vulnerable to strategic nomination.',
    proportionalityDetails:
      '**Non-Proportional Multi-Winner:** May lead to sweep victories and poor minority representation.',
    tags: ['ranked', 'positional', 'compromise', 'strategic-vulnerable', 'summable'],
  },
  condorcet: {
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
    votingMachineCompatibility: {
      existingMachines: false,
      description: 'Requires new voting machines and ballot software',
    },
    tabulationCritique:
      '**Condorcet:** Elects the candidate who beats all others head-to-head, but may have no winner in some cases.',
    proportionalityDetails:
      '**Non-Proportional Multi-Winner:** May lead to sweep victories and poor minority representation.',
    tags: ['ranked', 'condorcet-compliant', 'pairwise', 'head-to-head', 'complex'],
  },

  // Score voting single-winner
  'highest-total': {
    name: 'Score Voting',
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

    tabulationCritique:
      '**Highest Total:** Adds up all scores for each candidate - the candidate with the highest sum wins. Simple. Works best with many candidates and relatively few voters where expressivity helps prevent ties.',
    proportionalityDetails:
      '**Non-Proportional Multi-Winner:** May lead to sweep victories and poor minority representation.',
    tags: ['score', 'cardinal', 'expressive', 'simple', 'summable'],
  },
  star: {
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

    tabulationCritique:
      '**STAR:** Combines benefits of score voting with runoff security, eliminating strategic concerns. The scoring phase works best with many candidates and relatively few voters, while the runoff provides decisive results.',
    proportionalityDetails:
      '**Non-Proportional Multi-Winner:** May lead to sweep victories and poor minority representation.',
    tags: ['score', 'cardinal', 'hybrid', 'runoff', 'two-phase', 'consensus', 'spoiler-resistant'],
  },

  // Multi-winner methods
  'block-voting': {
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

    tabulationCritique:
      '**Block Voting:** Simple plurality system for multiple seats. Tends to give all seats to the most popular party - very poor minority representation.',
    proportionalityDetails:
      '**Non-Proportional Multi-Winner:** May lead to sweep victories and poor minority representation.',
    tags: ['simple', 'majoritarian', 'plurality', 'single-mark', 'bloc-voting', 'sweep-prone'],
  },
  'block-approval': {
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

    tabulationCritique:
      '**Block Approval:** Simple extension of approval voting to multiple seats. Better minority representation than Block Voting.',
    proportionalityDetails:
      '**Non-Proportional Multi-Winner:** May lead to sweep victories and poor minority representation.',
  },
  'limited-voting': {
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
    votingMachineCompatibility: {
      existingMachines: true,
      description: 'Compatible with existing voting machines',
    },

    tabulationCritique:
      '**Limited Voting:** Provides some minority representation but not fully proportional. Strategic nomination is important.',
    proportionalityDetails:
      '**Semi-Proportional:** Provides some minority representation but not full proportional representation.',
  },
  'cumulative-voting': {
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
    votingMachineCompatibility: {
      existingMachines: true,
      description: 'Compatible with existing voting machines',
    },

    tabulationCritique:
      '**Cumulative Voting:** Allows voters to distribute points strategically. Semi-proportional system that can provide minority representation with proper strategy.',
    proportionalityDetails:
      '**Semi-Proportional:** Provides some minority representation but not full proportional representation.',
  },
  sntv: {
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
    votingMachineCompatibility: {
      existingMachines: true,
      description: 'Compatible with existing voting machines',
    },

    tabulationCritique:
      '**SNTV:** Semi-proportional method for choose-one ballots. Requires strategic nomination by parties to achieve proportionality - too many candidates splits the vote, too few wastes votes.',
    proportionalityDetails:
      '**Semi-Proportional:** Provides some minority representation but not full proportional representation.',
  },
  'satisfaction-approval': {
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
    votingMachineCompatibility: {
      existingMachines: true,
      description: 'Compatible with existing voting machines',
    },
    tabulationCritique:
      "**Satisfaction Approval:** Semi-proportional system that splits each vote equally between all approved candidates. More proportional than block voting but requires strategic coordination - voters must know how many seats their party deserves and vote for exactly that many candidates. Vulnerable to 'wipeout' if strategy fails.",
    proportionalityDetails:
      '**Semi-Proportional:** Provides some minority representation but not full proportional representation.',
  },
  spav: {
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
    tabulationCritique:
      '**SPAV:** Sequential Proportional Approval Voting that encourages diverse representation. Much more practical to implement than the theoretical PAV optimization.',
    proportionalityDetails:
      '**Proportional Representation:** Ensures fair party representation but may reduce local accountability.',
  },
  stv: {
    name: 'STV (Single Transferable Vote)',
    shortDescription: 'Proportional ranked choice voting',
    detailedCritique:
      'Provides proportional representation with ranked ballots, maintaining local representation while ensuring diversity.',
    usedBy: [
      { code: 'IE', name: 'Ireland (Dáil Éireann)', flag: '🇮🇪' },
      { code: 'MT', name: 'Malta', flag: '🇲🇹' },
      { code: 'AU', name: 'Australia (Senate)', flag: '🇦🇺' },
    ],
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
    tabulationCritique:
      '**STV:** Provides proportional representation with ranked ballots, maintaining local representation while ensuring diversity.',
    proportionalityDetails:
      '**Proportional Representation:** Ensures fair party representation but may reduce local accountability.',
    tags: [
      'proportional',
      'ranked',
      'transfers',
      'quota-based',
      'complex',
      'candidate-based',
      'surplus-transfer',
    ],
  },
  'cpo-stv': {
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
    tabulationCritique:
      '**CPO-STV:** Uses Condorcet-style comparisons to find the optimal proportional outcome. More theoretically sound than standard STV but requires exponentially complex calculations.',
    proportionalityDetails:
      '**Proportional Representation:** Ensures optimal proportional outcomes by comparing all possible seat allocations, though at the cost of computational complexity.',
  },
  'schulze-stv': {
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
    tabulationCritique:
      '**Schulze STV:** Extends the Schulze method to achieve proportional representation. Excellent theoretical properties but extremely complex implementation.',
    proportionalityDetails:
      '**Proportional Representation:** Provides optimal proportional representation using Schulze method principles, ensuring strong Condorcet-style criteria are met.',
  },
  'meek-stv': {
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
    tabulationCritique:
      '**Meek STV:** Uses iterative reweighting instead of fractional transfers. More mathematically sound than traditional STV but requires computer calculation.',
    proportionalityDetails:
      '**Proportional Representation:** Achieves excellent proportional representation through continuous reweighting, avoiding some traditional STV anomalies.',
  },
  'pr-borda': {
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
    tabulationCritique:
      '**PR-Borda:** Calculates Borda scores and allocates seats proportionally. Simple concept but extremely vulnerable to strategic nomination and candidate cloning.',
    proportionalityDetails:
      '**Proportional Representation:** Provides proportional representation based on Borda scores, rewarding broadly acceptable candidates across party lines.',
  },
  'wright-stv': {
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
    tabulationCritique:
      '**Wright STV:** Uses refined transfer rules to improve upon traditional STV. Better theoretical properties but more complex implementation and verification.',
    proportionalityDetails:
      '**Proportional Representation:** Achieves proportional representation with improved transfer mechanisms that reduce some strategic voting opportunities.',
  },
  'party-list-pr': {
    name: 'Party List PR',
    shortDescription:
      'Proportional seats by party vote share. Can use Open Lists (voters pick candidates within a party) or Closed Lists (party sets candidate order).',
    detailedCritique:
      "Pure proportional representation where voters choose parties, and seats are allocated based on each party's share of the vote. Can be Open List (voters choose specific candidates within a party, increasing voter choice but potentially creating intra‑party competition), Closed List (party decides candidate order, strengthening cohesion but reducing voter choice), or Flexible/Hybrid List (voters may either accept party order or elevate specific candidates). Ensures fair representation but can reduce individual candidate accountability. Used in many European countries like the Netherlands, Israel, and Finland.",
    requiresParties: true,
    usedBy: [
      { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
      { code: 'IL', name: 'Israel', flag: '🇮🇱' },
      { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
    ],
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
  mmp: {
    name: 'MMP (Mixed Member Proportional)',
    shortDescription:
      'Combines districts with party lists. Party lists may be Open or Closed depending on implementation.',
    detailedCritique:
      'Hybrid system combining local districts with party lists. Voters cast two ballots: one for a local representative and one for a party. Party lists can be Open (voters can select candidates within the party) or Closed (party sets the order). Additional "top-up" seats ensure overall proportionality while preserving local representation. Successfully used in Germany, New Zealand, and Scotland.',
    requiresParties: true,
    ballotType: 'choose-x',
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
    category: 'mixed',
    hasVariants: true,
    variants: { listType: true, mixedMember: true },
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
  'block-score': {
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
    tabulationCritique:
      '**Block Score Voting:** Simple extension of score voting to multiple winners. Candidates with highest total scores win seats, but provides no proportional representation.',
    proportionalityDetails:
      '**Non-Proportional Multi-Winner:** May lead to sweep victories and poor minority representation.',
  },
  'equal-shares': {
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
    tabulationCritique:
      "**Method of Equal Shares:** Ensures each voter gets an equal 'budget' of representation. Excellent proportionality and fairness, but complex for voters to understand. The detailed scoring works best with many candidates and relatively few voters.",
    proportionalityDetails:
      '**Proportional Representation:** Ensures fair party representation but may reduce local accountability.',
  },
  pav: {
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
    tabulationCritique:
      '**PAV:** The theoretical optimum for proportional representation using approval ballots. Maximizes voter satisfaction but requires complex optimization algorithms that are computationally intensive for large elections.',
    proportionalityDetails:
      '**Proportional Representation:** Ensures fair party representation but may reduce local accountability.',
    tags: [
      'proportional',
      'approval',
      'optimization',
      'theoretically-optimal',
      'computationally-complex',
      'np-hard',
    ],
  },
  'star-pr': {
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
    tabulationCritique:
      '**STAR-PR:** Extends STAR voting to multi-winner elections by using proportional allocation. Combines the benefits of score voting expressiveness with proportional representation, but adds complexity to the tabulation process.',
    proportionalityDetails:
      '**Proportional Representation:** Ensures fair party representation but may reduce local accountability.',
  },
  'allocated-score': {
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
    tabulationCritique:
      "**Allocated Score:** A practical approach to proportional score voting that's easier to implement than Method of Equal Shares while maintaining good proportional outcomes.",
    proportionalityDetails:
      '**Proportional Representation:** Ensures fair party representation but may reduce local accountability.',
  },
  'range-voting': {
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
    tabulationCritique:
      '**Range Voting:** Simple score voting where the candidate with the highest total score wins. More expressive than approval voting but vulnerable to strategic exaggeration and normalization issues between voters.',
    proportionalityDetails:
      '**Non-Proportional Multi-Winner:** May lead to sweep victories and poor minority representation.',
  },
  '3-2-1-voting': {
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
    tabulationCritique:
      "**3-2-1 Voting:** Simple to understand and resistant to tactical voting. Uses a constrained score range that's easy for voters to grasp.",
    proportionalityDetails:
      '**Non-Proportional Multi-Winner:** May lead to sweep victories and poor minority representation.',
  },
  'majority-judgment': {
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
    tabulationCritique:
      "**Majority Judgment:** Uses the median (middle) score for each candidate rather than totals or averages. This makes it highly resistant to strategic manipulation since extreme scores (very high or very low) don't affect the median. However, it can lead to ties when candidates have the same median, requiring complex tie-breaking rules. The detailed scoring is most valuable when there are many candidates to differentiate.",
    proportionalityDetails:
      '**Non-Proportional Multi-Winner:** May lead to sweep victories and poor minority representation.',
  },
  'top-two-runoff': {
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
    tabulationCritique:
      "**Top-Two Runoff:** Ensures the winner has majority support in the final round, but can eliminate popular candidates who don't make the top two. Technically not a different tabulation method, but just block voting then FPTP",
    proportionalityDetails:
      '**Non-Proportional Multi-Winner:** May lead to sweep victories and poor minority representation.',
    votingMachineCompatibility: {
      existingMachines: true,
      description: 'Compatible with existing voting machines',
    },
  },
};
