import type { VotingConfig, VotingMethod } from '$lib/types/voting';

export const ballotTypes = [
  { id: 'choose-x', name: 'Choose X', description: 'Pick candidates' },
  { id: 'ranking', name: 'Ranked', description: 'Rank candidates in order of preference' },
  { id: 'score', name: 'Score', description: 'Give each candidate a numerical score' },
];

export const limitedChoicesOptions = [
  { id: '1', name: 'Pick 1', description: 'Must select exactly 1 (FPTP)' },
  { id: 'custom', name: 'Custom limit', description: 'Set your own maximum' },
  {
    id: 'unlimited',
    name: 'As many as you like',
    description: 'No limit on selections (approval voting)',
  },
];

export const listTypes = [
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

export function getElectionType(numberOfSeats: number): string {
  return numberOfSeats === 1 ? 'single' : 'multi';
}

export function getAvailableMethods(
  methods: Record<string, VotingMethod>,
  config: VotingConfig,
  electionTypeFilter: string
): string[] {
  const isCompatibleWithBallotType = ([, method]: [string, VotingMethod]) =>
    method.ballotType === config.ballotType;

  const isCompatibleWithChoiceLimit = ([, method]: [string, VotingMethod]) =>
    method.choiceLimitation === 'any' || method.choiceLimitation === config.limitedChoices;

  const isCompatibleWithElectionType = ([, method]: [string, VotingMethod]) => {
    if (electionTypeFilter === 'all') return true;
    return electionTypeFilter === 'single' ? method.minSeats <= 1 : method.maxSeats !== 1;
  };

  const isCompatibleWithSeatCount = ([, method]: [string, VotingMethod]) => {
    if (electionTypeFilter === 'all') return true;
    return (
      config.numberOfSeats >= method.minSeats &&
      (method.maxSeats === 'unlimited' || config.numberOfSeats <= method.maxSeats)
    );
  };

  return Object.entries(methods)
    .filter(isCompatibleWithBallotType)
    .filter(isCompatibleWithChoiceLimit)
    .filter(isCompatibleWithElectionType)
    .filter(isCompatibleWithSeatCount)
    .map(([id]) => id);
}

export function generateVotingMethodName(
  methods: Record<string, VotingMethod>,
  config: VotingConfig
): string {
  if (!config.tabulationMethod || !config.ballotType) return 'Choose a voting method';
  const method = methods[config.tabulationMethod || ''];
  if (!method) return 'Unknown Method';

  let name = method.name;

  if (config.listType && ['party-list-pr', 'mmp'].includes(config.tabulationMethod)) {
    const listType = listTypes.find((l) => l.id === config.listType);
    if (listType) name = `${listType.name} ${name}`;
  }

  if (config.tabulationMethod === 'mmp' && config.mixedMember) {
    const districtPercent = config.singleWinnerProportion;
    const listPercent = 100 - districtPercent;
    name += ` (${districtPercent}% districts, ${listPercent}% list)`;
  }

  if (config.limitedChoices === 'custom' && config.customLimit !== 3) {
    if (!name.includes(`(${config.customLimit})`)) name += ` (${config.customLimit})`;
  }

  return name;
}

export function generateVotingMethodSummary(
  methods: Record<string, VotingMethod>,
  config: VotingConfig,
  availableTabulationMethods: { id: string; name: string; description: string }[]
): string {
  if (!config.ballotType) return '';
  let summary = '';

  const ballotType = ballotTypes.find((b) => b.id === config.ballotType);
  if (ballotType) {
    summary += `**Ballot Type:** ${ballotType.description}`;
    if (config.ballotType === 'score') {
      summary += ` (${config.scoreMin} to ${config.scoreMax}`;
      if (config.allowNegativeVotes) summary += ', negative scores allowed. Negative values ';
      summary +=
        '). Score voting works best with many candidates and relatively few voters, where the expressivity helps prevent ties';
    }
    summary += '\n\n';
  }

  if (config.limitedChoices && config.limitedChoices !== 'unlimited') {
    if (config.limitedChoices === 'custom') {
      summary += `**Choice Limit:** Maximum of ${config.customLimit} candidate${config.customLimit === 1 ? '' : 's'}\n\n`;
    } else {
      const limit = limitedChoicesOptions.find((l) => l.id === config.limitedChoices);
      if (limit) summary += `**Choice Limit:** ${limit.description}\n\n`;
    }
  }

  if (config.tabulationMethod) {
    const method = availableTabulationMethods.find((m) => m.id === config.tabulationMethod);
    if (method) summary += `**Voting Method:** ${method.description}\n\n`;

    const fullMethod = methods[config.tabulationMethod || ''];
    if (fullMethod && fullMethod.votingMachineCompatibility) {
      const icon = fullMethod.votingMachineCompatibility.existingMachines ? '✅' : '❌';
      summary += `**Voting Machines:** ${icon} ${fullMethod.votingMachineCompatibility.description}\n\n`;
    }
  }

  if (config.numberOfSeats === 1) {
    summary += `**Single-Winner Election:** Electing 1 seat\n\n`;
  } else {
    summary += `**Multi-Winner Election:** Electing ${config.numberOfSeats} seats\n\n`;
    let partyDesc = '**Party Structure:** Election has political parties. ';
    if (config.canVoteForParties && config.canVoteForCandidates)
      partyDesc += 'Voters can choose both parties and individual candidates.';
    else if (config.canVoteForParties) partyDesc += 'Voters choose parties only.';
    else if (config.canVoteForCandidates)
      partyDesc += 'Voters choose individual candidates within parties.';

    if (config.hasPrimaries) partyDesc += ' Parties select candidates through primary elections.';
    else
      partyDesc +=
        ' Parties select candidates through internal processes (conventions, appointments, etc.).';
    summary += partyDesc + '\n\n';

    if (['party-list-pr', 'mmp'].includes(config.tabulationMethod || '')) {
      if (config.listType) {
        const lt = listTypes.find((l) => l.id === config.listType);
        if (lt) summary += `**List Type:** ${lt.description}\n\n`;
      }
      if (config.tabulationMethod === 'mmp' && config.mixedMember) {
        const districtPercent = config.singleWinnerProportion;
        const listPercent = 100 - districtPercent;
        summary += `**Mixed System:** ${districtPercent}% of seats elected in single-winner districts, ${listPercent}% from party lists to ensure proportionality\n\n`;
      }
    }
  }

  return summary.trim();
}

export function generateVotingMethodCritiqueFromData(
  methods: Record<string, VotingMethod>,
  config: VotingConfig
): string {
  if (!config.ballotType || !config.tabulationMethod) return '';
  const method = methods[config.tabulationMethod || ''];
  if (!method) return '';

  let critique = '';
  if (method.detailedCritique) critique += '**Overview:** ' + method.detailedCritique + '\n\n';
  if (method.tabulationCritique) critique += method.tabulationCritique + '\n\n';

  if (config.numberOfSeats > 1 && method.proportionalityDetails) {
    critique += method.proportionalityDetails;
    if (config.hasParties && ['party-list-pr', 'mmp'].includes(config.tabulationMethod || '')) {
      critique += '\n\n**List Method Types:**\n\n';
      critique +=
        '**Open List:** Voters can choose specific candidates within a party. This maximizes voter choice and allows popular candidates to rise regardless of party ranking. However, it can lead to intra-party competition, potentially fragmenting party unity and making campaigns more expensive as candidates compete against their own party members.\n\n';
      critique +=
        '**Closed List:** The party determines the order of candidates, and voters can only vote for the party as a whole. This strengthens party discipline and cohesion, ensures balanced representation (parties can guarantee diversity), and simplifies voting. However, it reduces voter choice and can lead to party elites having too much control over who gets elected.\n\n';
      critique +=
        '**Hybrid/Flexible List:** Combines elements of both systems. Voters can either vote for the party (accepting its ranking) or for specific candidates. If enough voters choose a candidate, they can move up the list. This balances party cohesion with voter choice, though it adds complexity to both voting and vote counting.\n\n';
      if (config.listType && method.listTypeCritique) {
        const lc = method.listTypeCritique[config.listType as keyof typeof method.listTypeCritique];
        if (lc)
          critique +=
            '**Your Selected ' +
            (config.listType === 'flexible'
              ? 'Flexible'
              : config.listType.charAt(0).toUpperCase() + config.listType.slice(1)) +
            ' List System:** ' +
            lc.replace(/^\*\*[^:]+:\*\*\s*/, '');
      }
    } else if (config.listType && method.listTypeCritique) {
      const lc = method.listTypeCritique[config.listType as keyof typeof method.listTypeCritique];
      if (lc) critique += '\n\n' + lc;
    }

    if (config.tabulationMethod === 'mmp' && config.mixedMember) {
      critique += '\n\n';
      const districtPercent = config.singleWinnerProportion;
      if (districtPercent > 70)
        critique +=
          '**High District Proportion:** Maintains strong local representation but may reduce proportionality effectiveness.';
      else if (districtPercent < 30)
        critique +=
          '**High List Proportion:** Maximizes proportionality but may weaken local representation and accountability.';
      else
        critique +=
          '**Balanced Mixed System:** Good compromise between local representation and proportionality.';
    }

    if (config.hasParties && method.primaryCritique) {
      critique += '\n\n';
      const primaryKey = config.hasPrimaries ? 'withPrimaries' : 'withoutPrimaries';
      const pc = method.primaryCritique[primaryKey];
      if (pc) critique += pc;
    }
  }

  return critique.trim();
}

export function generateVotingMethodScores(
  methods: Record<string, VotingMethod>,
  config: VotingConfig
) {
  const defaultScores = {
    proportionality: 0,
    simplicity: 0,
    honestStrategyResistance: 0,
    strategicStraightforwardness: 0,
    representation: 0,
  };

  if (!config.ballotType || !config.tabulationMethod) return defaultScores;
  const method = methods[config.tabulationMethod || ''];
  if (!method) return defaultScores;
  const scores = { ...method.scores };

  if (config.numberOfSeats > 1 && config.tabulationMethod === 'block-approval') {
    scores.representation = 2;
  }
  if (config.limitedChoices === '1' && config.ballotType === 'choose-x') {
    scores.honestStrategyResistance = 0;
    scores.strategicStraightforwardness = 0;
    scores.representation = 1;
  }
  if (config.numberOfSeats === 1) scores.proportionality = 0;
  return scores;
}

export function isProportionalMethod(
  methods: Record<string, VotingMethod>,
  config: VotingConfig
): boolean {
  if (config.numberOfSeats <= 1) return false;
  const method = methods[config.tabulationMethod || ''];
  return method?.isProportional || false;
}

export function getSuggestedComparisons(
  methods: Record<string, VotingMethod>,
  config: VotingConfig,
  availableIds: string[]
): { title: string; methods: string[]; description: string }[] {
  const currentMethod = methods[config.tabulationMethod || ''];
  if (!currentMethod || !config.tabulationMethod) return [];
  const currentMethodId = config.tabulationMethod;

  const getMethodsWhere = (predicate: (method: VotingMethod) => boolean): string[] =>
    availableIds.filter((id) => predicate(methods[id] as VotingMethod));
  const getMethodsWithTag = (tag: string): string[] =>
    availableIds.filter((id) => (methods[id] as VotingMethod).tags?.includes(tag) || false);
  const getMethodsWithAnyTag = (tags: string[]): string[] =>
    availableIds.filter((id) =>
      tags.some((t) => (methods[id] as VotingMethod).tags?.includes(t) || false)
    );

  const possibleGroups = [
    {
      methods: getMethodsWhere((m) => m.ballotType === 'score' && m.isProportional),
      title: 'Proportional Score Methods',
      description:
        'All provide proportional representation with score/approval ballots but use different algorithms',
    },
    {
      methods: getMethodsWhere((m) => m.ballotType === 'score' && m.maxSeats !== 1),
      title: 'Multi-Winner Score Methods',
      description:
        'Different approaches to multi-winner elections with score ballots - from simple block voting to complex proportional systems',
    },
    {
      methods: getMethodsWhere((m) => m.ballotType === 'score' && m.maxSeats === 1),
      title: 'Single-Winner Score Methods',
      description: 'Different ways to count score ballots - from simple totals to complex runoffs',
    },
    {
      methods: getMethodsWhere((m) => m.ballotType === 'choose-x' && m.maxSeats === 1),
      title: 'Single-Winner Choose-X Methods',
      description: 'Different approaches to single-winner elections with choose-X ballots',
    },
    {
      methods: getMethodsWhere((m) => m.ballotType === 'choose-x' && m.isProportional),
      title: 'Approval-Based Proportional Methods',
      description: 'Ways to achieve proportional representation using approval ballots',
    },
    {
      methods: getMethodsWhere((m) => m.ballotType === 'choose-x'),
      title: 'Choose-X Methods',
      description:
        'Different ways to count choose-X ballots - from simple plurality to complex proportional systems',
    },
    {
      methods: getMethodsWhere((m) => m.ballotType === 'choose-x' && m.maxSeats !== 1),
      title: 'Multi-Winner Choose-X Methods',
      description:
        'Different approaches to multi-winner elections with choose-X ballots - from simple block voting to proportional systems',
    },
    {
      methods: getMethodsWhere((m) => m.ballotType === 'ranking'),
      title: 'Ranked Choice Methods',
      description: 'Different algorithms for counting ranked ballots',
    },
    {
      methods: getMethodsWhere((m) => m.isProportional),
      title: 'Proportional Methods',
      description: 'All methods that achieve proportional representation',
    },
    {
      methods: getMethodsWithTag('simple'),
      title: 'Simple Methods',
      description: 'Easy to understand and implement voting methods',
    },
    {
      methods: getMethodsWithTag('runoff'),
      title: 'Runoff-Based Methods',
      description: 'Methods that use some form of runoff or elimination process',
    },
    {
      methods: getMethodsWithTag('consensus'),
      title: 'Consensus-Building Methods',
      description: 'Methods that tend to elect broadly acceptable candidates',
    },
    {
      methods: getMethodsWithTag('proportional'),
      title: 'Proportional Methods (Tagged)',
      description: 'All methods tagged as proportional',
    },
    {
      methods: getMethodsWithAnyTag(['computationally-complex', 'optimization']),
      title: 'Computationally Complex Methods',
      description: 'Methods that require significant computation or optimization',
    },
  ];

  return possibleGroups.filter(
    (group) => group.methods.includes(currentMethodId) && group.methods.length > 1
  );
}
