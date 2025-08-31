<script lang="ts">
  import { resolve } from '$app/paths';
  import Mermaid from '$lib/components/common/Mermaid.svelte';
  import { METHOD_FLOWCHARTS } from '$lib/flowcharts/index';
  import MethodsGallery from './components/MethodsGallery.svelte';
  import MethodScores from './components/MethodScores.svelte';
  import ComparisonModal from './components/ComparisonModal.svelte';
  import FiltersPanel from './components/FiltersPanel.svelte';
  import type { VotingMethod, VotingConfig } from '$lib/types/voting';
  const { data } = $props<{ data: { votingMethods: Record<string, VotingMethod> } }>();
  let VOTING_METHODS: Record<string, VotingMethod> = $derived(data.votingMethods);

  // Types come from $lib/types/voting

  // Voting method configuration state
  let config = $state<VotingConfig>({
    ballotType: null,
    limitedChoices: '1',
    customLimit: 3,
    tabulationMethod: null,
    numberOfSeats: 1,
    hasParties: true, // Always assume parties exist
    canVoteForParties: true,
    canVoteForCandidates: true,
    hasPrimaries: false,
    listType: null,
    mixedMember: false,
    singleWinnerProportion: 50,
    allowNegativeVotes: false,
    scoreMin: 0,
    scoreMax: 5,
  });

  // Election type options
  const electionTypes = [
    { id: 'all', name: 'Show All', description: 'Show both single winner and multi winner elections' },
    { id: 'single', name: 'Single Winner', description: 'Choose one person for a role (President, Mayor, etc.)' },
    { id: 'multi', name: 'Multi Winner', description: 'Choose multiple people for a body (Council, Parliament, etc.) or for Top X Primaries' },
  ];

  // Current election type filter (legacy, used only in summary calculations)
  let electionTypeFilter = $state('all');

  // Facet filters (independent of config until a method is selected)
  let electionFacet = $state<string[]>(['single', 'multi']); // default: show all
  let ballotFacetSelections = $state<string[]>(['choose-x', 'ranking', 'score']); // default: show all
  let choiceFacetSelections = $state<string[]>(['1', 'custom', 'unlimited']); // default: show all
  let partyFacetSelections = $state<string[]>(['party-required', 'no-party-required']);

  function toggleSelection(list: string[], value: string): string[] {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
  }

  // In-use facet (show only methods with real-world adoption)
  let inUseOnly = $state(false);

  // Helper to get the selected election type
  import { ballotTypes, limitedChoicesOptions, listTypes, getElectionType, getAvailableMethods, generateVotingMethodName as genName, generateVotingMethodSummary as genSummary, generateVotingMethodCritiqueFromData as genCritique, generateVotingMethodScores as genScores, isProportionalMethod as isProp, getSuggestedComparisons as getCompares } from '$lib/voting/builder-utils';
  let selectedElectionType = $derived(getElectionType(config.numberOfSeats));

  // Option definitions now imported from utils

  // Computed properties
  let isRankedBallot = $derived(config.ballotType === 'ranking');
  let isApprovalBallot = $derived(config.ballotType === 'choose-x');
  let isScoreBallot = $derived(config.ballotType === 'score');
  let isMultiWinner = $derived(config.numberOfSeats > 1);

  // Available tabulation methods derived from current config and filter
  let availableTabulationMethods: { id: string; name: string; description: string }[] = $derived.by(() => {
    const methodIds = getAvailableMethods(VOTING_METHODS, config, electionTypeFilter);
    return methodIds.map((id) => ({ id, name: VOTING_METHODS[id]?.name, description: VOTING_METHODS[id]?.shortDescription }));
  });

  // Filtering helpers now in utils

  // (legacy block removed; handled by $derived above)

  // Methods gallery filtering using facets
  type MethodListItem = { id: string; name: string; shortDescription: string; category: string; isProportional: boolean; isSemiProportional: boolean; ballotType: string; choiceLimitation: string; minSeats: number; maxSeats: number | 'unlimited', recommended?: boolean, redFlag?: boolean };
  let filteredMethods: MethodListItem[] = $derived.by(() => {
    const items = Object.entries(VOTING_METHODS as Record<string, VotingMethod>)
      .filter(([id, method]) => !!method && !!method.name)
      .filter(([_, method]) => matchesElectionFacet(method as VotingMethod))
      .filter(([_, method]) => matchesBallotFacet(method as VotingMethod))
      .filter(([_, method]) => matchesChoiceFacet(method as VotingMethod))
      .filter(([_, method]) => matchesPartyFacet(method as VotingMethod))
      .filter(([_, method]) => matchesInUseFacet(method as VotingMethod))
      .map(([id, method]) => ({
        id,
        name: (method as VotingMethod).name,
        shortDescription: (method as VotingMethod).shortDescription,
        category: (method as VotingMethod).category,
        isProportional: (method as VotingMethod).isProportional,
        isSemiProportional: (method as VotingMethod).isSemiProportional,
        ballotType: (method as VotingMethod).ballotType,
        choiceLimitation: (method as VotingMethod).choiceLimitation,
        minSeats: (method as VotingMethod).minSeats,
        maxSeats: (method as VotingMethod).maxSeats,
        recommended: ['star','approval','pav','spav','star-pr','equal-shares'].includes(id),
        redFlag: ['fptp','irv','block-voting','borda','pr-borda','cpo-stv','schulze-stv','meek-stv'].includes(id),
      })) as MethodListItem[];
    return items;
  });

  function matchesElectionFacet(method: VotingMethod): boolean {
    if (!electionFacet.length) return false; // none selected = show none
    const methodType = method.maxSeats === 1 ? 'single' : 'multi';
    return electionFacet.includes(methodType);
  }

  function matchesBallotFacet(method: VotingMethod): boolean {
    return ballotFacetSelections.length === 0 ? true : ballotFacetSelections.includes(method.ballotType);
  }

  function matchesChoiceFacet(method: VotingMethod): boolean {
    // Only applies to choose-x ballots; other ballots unaffected
    if (method.ballotType !== 'choose-x') return true;
    if (choiceFacetSelections.length === 0) return true;
    // Methods that accept any choice limit should always pass
    if (method.choiceLimitation === 'any') return true;
    return choiceFacetSelections.includes(method.choiceLimitation);
  }

  // Party requirement facet
  function matchesPartyFacet(method: VotingMethod): boolean {
    const requires = !!method.requiresParties;
    if (partyFacetSelections.length === 0) return true;
    if (requires && partyFacetSelections.includes('party-required')) return true;
    if (!requires && partyFacetSelections.includes('no-party-required')) return true;
    return false;
  }

  function matchesInUseFacet(method: VotingMethod): boolean {
    if (!inUseOnly) return true;
    return Array.isArray(method.usedBy) && method.usedBy.length > 0;
  }

  // (legacy reactive block removed; handled by $derived above)

  function selectMethod(methodId: string) {
    const method = VOTING_METHODS[methodId];
    if (!method) return;
    // Set core selections to match method
    config.tabulationMethod = methodId;
    config.ballotType = method.ballotType;
    if (method.ballotType === 'choose-x') {
      config.limitedChoices = method.choiceLimitation === 'any' ? 'unlimited' : method.choiceLimitation;
    } else {
      // ranking/score don't use limitedChoices
      config.limitedChoices = 'unlimited';
    }
    // Seats based on the method capability and current config
    if (method.maxSeats === 1) {
      config.numberOfSeats = 1;
    } else {
      const minSeats = typeof method.minSeats === 'number' ? method.minSeats : 2;
      config.numberOfSeats = config.numberOfSeats > 1 ? config.numberOfSeats : Math.max(2, minSeats);
    }
  }

  let votingMethodName = $derived(genName(VOTING_METHODS, config));
  let votingMethodSummary = $derived(genSummary(VOTING_METHODS, config, availableTabulationMethods));
  let votingMethodCritique = $derived(genCritique(VOTING_METHODS, config));
  let votingMethodScores = $derived(genScores(VOTING_METHODS, config));

  function generateVotingMethodName(config: VotingConfig) {
    // If no method selected yet
    if (!config.tabulationMethod) return 'Choose a voting method';

    // Ensure ballot type is set from method
    if (!config.ballotType) return 'Choose a voting method';

    // Fallback when no tabulation method selected
    if (!config.tabulationMethod) {
      if (config.ballotType === 'choose-x') {
        if (config.limitedChoices === '1') return 'First Past The Post';
        if (config.limitedChoices === 'unlimited') return 'Approval Voting';
        if (config.limitedChoices === 'custom') return `Limited Voting (${config.customLimit})`;
      }
      return 'Choose a voting method';
    }

    // Get the base method name from VOTING_METHODS
    const method = VOTING_METHODS[config.tabulationMethod || ''];
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
        if (config.allowNegativeVotes) summary += ', negative scores allowed. Negative values ';
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

    // Voting method
    if (config.tabulationMethod) {
      const method = availableTabulationMethods.find((m) => m.id === config.tabulationMethod);
      if (method) {
        summary += `**Voting Method:** ${method.description}\n\n`;
      }

      // Voting machine compatibility
      const fullMethod = VOTING_METHODS[config.tabulationMethod || ''];
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

    const method = VOTING_METHODS[config.tabulationMethod || ''];
    if (!method) return '';

    // Start with a titled overview from the method's detailed critique
    let critique = '';
    if (method.detailedCritique) {
      critique += '**Overview:** ' + method.detailedCritique + '\n\n';
    }

    // Ballot type critique removed to avoid duplication with description

    // Add tabulation critique
    if (method.tabulationCritique) {
      critique += method.tabulationCritique + '\n\n';
    }

    // Add proportionality details for multi-winner
    if (config.numberOfSeats > 1 && method.proportionalityDetails) {
      critique += method.proportionalityDetails;

      // Add general list methods section for party-based methods
      if (config.hasParties && ['party-list-pr', 'mmp'].includes(config.tabulationMethod || '')) {
        critique += '\n\n**List Method Types:**\n\n';
        critique += '**Open List:** Voters can choose specific candidates within a party. This maximizes voter choice and allows popular candidates to rise regardless of party ranking. However, it can lead to intra-party competition, potentially fragmenting party unity and making campaigns more expensive as candidates compete against their own party members.\n\n';
        critique += '**Closed List:** The party determines the order of candidates, and voters can only vote for the party as a whole. This strengthens party discipline and cohesion, ensures balanced representation (parties can guarantee diversity), and simplifies voting. However, it reduces voter choice and can lead to party elites having too much control over who gets elected.\n\n';
        critique += '**Hybrid/Flexible List:** Combines elements of both systems. Voters can either vote for the party (accepting its ranking) or for specific candidates. If enough voters choose a candidate, they can move up the list. This balances party cohesion with voter choice, though it adds complexity to both voting and vote counting.\n\n';

        // Add specific list type critique if available
        if (config.listType && method.listTypeCritique) {
          const listCritique =
            method.listTypeCritique[config.listType as keyof typeof method.listTypeCritique];
          if (listCritique) {
            critique += '**Your Selected ' + (config.listType === 'flexible' ? 'Flexible' : config.listType.charAt(0).toUpperCase() + config.listType.slice(1)) + ' List System:** ' + listCritique.replace(/^\*\*[^:]+:\*\*\s*/, '');
          }
        }
      } else if (config.listType && method.listTypeCritique) {
        // For non-party methods that still have list type critique
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
    const method = VOTING_METHODS[config.tabulationMethod || ''];
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

  const isProportionalMethod = (c: VotingConfig) => isProp(VOTING_METHODS, c);

  // Removed semi-proportional badge

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
  let activeTooltip = $state<string | null>(null);

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
  let showComparison = $state(false);
  // Store method IDs for comparison
  let comparisonMethodIds = $state<string[]>([]);

  function showMethodComparison(methodIds: string[]) {
    comparisonMethodIds = methodIds.filter(id => id in VOTING_METHODS);
    showComparison = true;
  }

  function closeComparison() {
    showComparison = false;
    comparisonMethodIds = [];
  }

  // Get suggested comparisons based on current method
  function getSuggestedComparisons(config: VotingConfig) {
    const availableIds = getAvailableMethods(VOTING_METHODS, config, electionTypeFilter);
    return getCompares(VOTING_METHODS, config, availableIds);
  }



  // Get current method's flowchart
  let currentMethod = $derived(VOTING_METHODS[config.tabulationMethod || '']);
  let currentFlowchart = $derived(currentMethod?.flowchart || (METHOD_FLOWCHARTS as any)[config.tabulationMethod || ''] || '');
  let currentUsedBy = $derived(currentMethod?.usedBy || []);
</script>

<svelte:head>
  <title>Voting Method Builder - Create Your Custom Voting System - approval.vote</title>
  <meta
    name="description"
    content="Interactive tool to design and analyze custom voting methods. Mix and match ballot types, voting methods, and multi-winner options to create your ideal voting system."
  />
</svelte:head>

<svelte:window onkeydown={handleKeydown} onclick={closeTooltip} />

<div class="container wide-builder">
  <div class="description">
    <h1>
      <a href="{resolve('/')}">approval.vote</a>
      //
      <strong>Voting Method Builder</strong>
    </h1>
    <p class="subtitle">Mix and match components to design your ideal voting system</p>
  </div>

  <div class="builder-layout">
    <!-- Configuration Panel -->
    <div class="config-panel">
      <FiltersPanel
        {activeTooltip}
        {toggleTooltip}
        electionFacet={electionFacet}
        ballotFacetSelections={ballotFacetSelections}
        choiceFacetSelections={choiceFacetSelections}
        partyFacetSelections={partyFacetSelections}
        inUseOnly={inUseOnly}
        updateElectionFacet={(v) => (electionFacet = v)}
        updateBallotFacetSelections={(v) => (ballotFacetSelections = v)}
        updateChoiceFacetSelections={(v) => (choiceFacetSelections = v)}
        updatePartyFacetSelections={(v) => (partyFacetSelections = v)}
        setInUseOnly={(v) => (inUseOnly = v)}
      />

      <!-- Party-Based Method Options removed; include explanation in descriptions instead -->
    </div>

    <!-- Methods Gallery Panel (middle column on desktop) -->
    <div class="gallery-panel">
      <MethodsGallery
        methods={filteredMethods.map(m => ({ id: m.id, name: m.name, shortDescription: m.shortDescription, isProportional: m.isProportional, recommended: m.recommended, redFlag: m.redFlag }))}
        selectedId={config.tabulationMethod}
        on:select={(e) => selectMethod(e.detail)}
      />
    </div>

    <!-- Details Panel (right column on desktop) -->
    <div class="details-panel">
      <div class="result-card">
        <h2 class="method-name">
          {votingMethodName}
          {#if isProportionalMethod(config)}
            <span
              class="proportional-badge"
              title="This is a proportional representation method that ensures fair party/group representation"
              >⚖️</span
            >
          {/if}
        </h2>

        {#if config.ballotType && config.tabulationMethod}
          <MethodScores
            scores={votingMethodScores}
            {activeTooltip}
            onToggle={(id) => toggleTooltip(id)}
          />
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

        {#if currentUsedBy.length}
          <div class="method-usedby">
            <h3>Used By</h3>
            <div class="flag-list">
              {#each currentUsedBy as place}
                <span class="flag" title={place.name}>{place.flag}</span>
              {/each}
            </div>
          </div>
        {/if}

        {#if currentFlowchart}
          <div class="method-flowchart">
            <h3>Counting Process</h3>
            <Mermaid code={currentFlowchart} />
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
                    onclick={() => showMethodComparison(suggestion.methods)}
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

<ComparisonModal
  visible={showComparison}
  methods={comparisonMethodIds}
  methodData={VOTING_METHODS}
  currentId={config.tabulationMethod}
  onClose={closeComparison}
  onSwitch={(id) => { selectMethod(id); closeComparison(); }}
/>

<style>
  .subtitle {
    font-size: 1.2rem;
    color: #777;
    margin-top: 0.5rem;
  }

  /* Wide container for desktop use */
  :global(.container.wide-builder) {
    max-width: 100vw;
    width: 100%;
    margin: 1.25rem auto;
    padding-left: clamp(1rem, 3vw, 2rem);
    padding-right: clamp(1rem, 3vw, 2rem);
    overflow-x: hidden; /* prevent horizontal overflow */
    box-sizing: border-box;
  }

  .builder-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    margin-top: 2rem;
  }

  @media (min-width: 1000px) {
    .builder-layout {
      grid-template-columns:
        clamp(260px, 22vw, 320px)
        minmax(360px, 1fr)
        clamp(300px, 39vw, 705px); /* 50% wider details panel on desktop */
      gap: clamp(0.75rem, 1.5vw, 1rem);
      align-items: start;
    }
  }

  /* filters styles moved to FiltersPanel */

  /* removed unused styles for previous option UI and legacy panels */

  .gallery-panel { min-height: 0; }
  .details-panel { position: sticky; top: 2rem; height: fit-content; min-width: 0; }
  .gallery-panel { min-width: 0; }

  /* gallery styles moved to MethodsGallery */

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

  /* score styles moved to MethodScores */

  

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

  .method-usedby { margin-bottom: 2rem; }
  .method-usedby h3 { margin: 0 0 0.5rem 0; color: #333; font-size: 1.1rem; }
  .flag-list { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .flag { font-size: 1.5rem; cursor: help; }

  .method-critique h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #333;
    font-size: 1.3rem;
  }

  .method-flowchart {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 6px;
    border-left: 4px solid #2563eb;
  }

  .method-flowchart h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #333;
    font-size: 1.3rem;
  }

  /* removed unused .flowchart-container styles */

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

  /* comparison styles moved to ComparisonModal */
</style>
