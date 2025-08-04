<script lang="ts">
import { base } from '$app/paths';

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

// Voting method configuration state
let config: VotingConfig = {
  ballotType: null,
  limitedChoices: null,
  customLimit: 3,
  tabulationMethod: null,
  numberOfSeats: 100,
  hasParties: false,
  canVoteForParties: false,
  canVoteForCandidates: true,
  hasPrimaries: false,
  listType: null,
  mixedMember: false,
  singleWinnerProportion: 50,
  allowNegativeVotes: false,
  scoreMin: 0,
  scoreMax: 5
};

// Option definitions
const ballotTypes = [
  { id: 'choose-x', name: 'Choose X', description: 'Select a limited number of candidates' },
  { id: 'ranking', name: 'Ranked', description: 'Rank candidates in order of preference' },
  { id: 'score', name: 'Score', description: 'Give each candidate a numerical score' }
];

const limitedChoicesOptions = [
  { id: '1', name: 'Pick 1', description: 'Must select exactly 1 (FPTP)' },
  { id: 'custom', name: 'Custom limit', description: 'Set your own maximum' },
  { id: 'unlimited', name: 'As many as you like', description: 'No limit on selections (approval voting)' }
];

const rankedTabulationMethods = [
  { id: 'irv', name: 'IRV (Instant Runoff)', description: 'Eliminate lowest candidate, transfer votes' },
  { id: 'borda', name: 'Borda Count', description: 'Points based on ranking position' },
  { id: 'condorcet', name: 'Condorcet', description: 'Head-to-head winner if one exists' },
  { id: 'plurality', name: 'Plurality (First Choice)', description: 'Most first-place votes wins' },
  { id: 'stv', name: 'STV (Single Transferable Vote)', description: 'Proportional ranked choice voting' }
];

const approvalTabulationMethods = [
  { id: 'most-votes', name: 'Most Approvals', description: 'Candidate with most approvals wins' },
  { id: 'satisfaction-approval', name: 'Satisfaction Approval', description: 'Semi-proportional method - splits votes equally between approved candidates' },
  { id: 'pav', name: 'PAV (Proportional Approval)', description: 'Proportional method - splits votes between winning candidates' },
  { id: 'sequential-monroe', name: 'Sequential Monroe', description: 'Proportional method maximizing equal voter satisfaction' }
];

const partyBasedTabulationMethods = [
  { id: 'party-list-pr', name: 'Party List PR', description: 'Proportional seats by party vote share' },
  { id: 'mmp', name: 'MMP (Mixed Member Proportional)', description: 'Combines single-winner districts with party lists' }
];

const scoreTabulationMethods = [
  { id: 'highest-total', name: 'Highest Total Score', description: 'Sum all scores, highest wins' },
  { id: 'highest-average', name: 'Highest Average', description: 'Best average score wins' },
  { id: 'star', name: 'STAR Voting', description: 'Score then automatic runoff' },
  { id: 'majority-judgment', name: 'Majority Judgment', description: 'Based on median score' }
];



const listTypes = [
  { id: 'closed', name: 'Closed List', description: 'Voters vote for parties, party decides candidate order' },
  { id: 'open', name: 'Open List', description: 'Voters vote for individual candidates within parties' },
  { id: 'flexible', name: 'Flexible List', description: 'Voters can vote for party or individual candidates' }
];

// Computed properties
$: isRankedBallot = config.ballotType === 'ranking';
$: isApprovalBallot = config.ballotType === 'choose-x';
$: isScoreBallot = config.ballotType === 'score';
$: isMultiWinner = config.numberOfSeats > 1;

// Declare availableTabulationMethods
let availableTabulationMethods: any[] = [];

// Build available tabulation methods based on ballot type and party structure
$: {
  let methods: any[] = [];
  if (isRankedBallot) {
    methods = [...rankedTabulationMethods];
  } else if (isApprovalBallot) {
    methods = [...approvalTabulationMethods];
  } else if (isScoreBallot) {
    methods = [...scoreTabulationMethods];
  }
  
  // Add party-based methods if parties are enabled and multi-winner
  if (config.hasParties && isMultiWinner) {
    methods = [...methods, ...partyBasedTabulationMethods];
  }
  
  availableTabulationMethods = methods;
}

$: votingMethodName = generateVotingMethodName(config);
$: votingMethodSummary = generateVotingMethodSummary(config);
$: votingMethodCritique = generateVotingMethodCritique(config);
$: votingMethodScores = generateVotingMethodScores(config);

function generateVotingMethodName(config: VotingConfig) {
  if (!config.ballotType) return "Select a ballot type to begin";
  
  let name = "";
  

  
  // Multi-winner naming
  if (config.numberOfSeats > 1) {
    // Check if using party-based tabulation method
    if (['party-list-pr', 'mmp'].includes(config.tabulationMethod || '')) {
      const method = [...partyBasedTabulationMethods].find(m => m.id === config.tabulationMethod);
      if (method) {
        name = method.name;
        
        // Add list type modifier
        if (config.listType) {
          const listType = listTypes.find(l => l.id === config.listType);
          if (listType) {
            name = `${listType.name} ${name}`;
          }
        }
        
        // Add mixed member modifier for MMP
        if (config.tabulationMethod === 'mmp' && config.mixedMember) {
          const districtPercent = config.singleWinnerProportion;
          const listPercent = 100 - districtPercent;
          name += ` (${districtPercent}% districts, ${listPercent}% list)`;
        }
      }
    } else {
      // Non-proportional multi-winner
      if (config.ballotType === 'choose-x') {
        if (config.limitedChoices === '1') {
          name = "Block Voting (FPTP)";
        } else if (config.limitedChoices === 'unlimited') {
          name = "Block Approval Voting";
        } else if (config.limitedChoices === 'custom') {
          name = `Block Voting (${config.customLimit})`;
        } else {
          name = "Block Voting (Limited)";
        }
      } else if (config.ballotType === 'ranking') {
        name = "Block Voting (Ranked)";
      } else if (config.ballotType === 'score') {
        name = "Block Score Voting";
      }
    }
  } else {
    // Single winner naming
    if (config.ballotType === 'choose-x') {
      if (config.limitedChoices === '1') {
        name = "First Past The Post";
      } else if (config.limitedChoices === 'unlimited') {
        name = "Approval Voting";
      } else if (config.limitedChoices === 'custom') {
        name = `Limited Voting (${config.customLimit})`;
      } else {
        name = "Limited Voting";
      }
    } else if (config.ballotType === 'ranking' && config.tabulationMethod) {
      const method = rankedTabulationMethods.find(m => m.id === config.tabulationMethod);
      name = method ? method.name : "Ranked Choice";
    } else if (config.ballotType === 'score' && config.tabulationMethod) {
      const method = scoreTabulationMethods.find(m => m.id === config.tabulationMethod);
      name = method ? method.name : "Score Voting";
    }
  }
  
  // Add modifiers
  if (config.limitedChoices && config.limitedChoices !== 'unlimited') {
    const limit = limitedChoicesOptions.find(l => l.id === config.limitedChoices);
    if (limit && !name.includes(limit.name)) {
      name += ` (${limit.name})`;
    }
  }
  
  return name || "Custom Voting Method";
}

function generateVotingMethodSummary(config: VotingConfig) {
  if (!config.ballotType) return "";
  
  let summary = "";
  
  // Ballot description
  const ballotType = ballotTypes.find(b => b.id === config.ballotType);
  if (ballotType) {
    summary += `**Ballot Type:** ${ballotType.description}`;
    
    if (config.ballotType === 'score') {
      summary += ` (${config.scoreMin} to ${config.scoreMax}`;
      if (config.allowNegativeVotes) summary += ', negative scores allowed';
      summary += ')';
    }
    summary += '\n\n';
  }
  
  // Choice limitations
  if (config.limitedChoices && config.limitedChoices !== 'unlimited') {
    if (config.limitedChoices === 'custom') {
      summary += `**Choice Limit:** Maximum of ${config.customLimit} candidate${config.customLimit === 1 ? '' : 's'}\n\n`;
    } else {
      const limit = limitedChoicesOptions.find(l => l.id === config.limitedChoices);
      if (limit) {
        summary += `**Choice Limit:** ${limit.description}\n\n`;
      }
    }
  }
  
  // Tabulation method
  if (config.tabulationMethod) {
    const method = availableTabulationMethods.find(m => m.id === config.tabulationMethod);
    if (method) {
      summary += `**Tabulation:** ${method.description}\n\n`;
    }
  }
  
  // Election size details
  if (config.numberOfSeats === 1) {
    summary += `**Single-Winner Election:** Electing 1 seat\n\n`;
  } else {
    summary += `**Multi-Winner Election:** Electing ${config.numberOfSeats} seats\n\n`;
    
    // Party structure
    if (config.hasParties) {
      let partyDesc = "**Party Structure:** Election has political parties. ";
      if (config.canVoteForParties && config.canVoteForCandidates) {
        partyDesc += "Voters can choose both parties and individual candidates.";
      } else if (config.canVoteForParties) {
        partyDesc += "Voters choose parties only.";
      } else if (config.canVoteForCandidates) {
        partyDesc += "Voters choose individual candidates within parties.";
      }
      
      if (config.hasPrimaries) {
        partyDesc += " Parties select candidates through primary elections.";
      } else {
        partyDesc += " Parties select candidates through internal processes (conventions, appointments, etc.).";
      }
      
      summary += partyDesc + '\n\n';
    } else {
      summary += "**Party Structure:** Non-partisan election - candidates run independently\n\n";
    }
    
    // Add details for party-based tabulation methods
    if (['party-list-pr', 'mmp'].includes(config.tabulationMethod || '')) {
      // List type details
      if (config.listType) {
        const listType = listTypes.find(l => l.id === config.listType);
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

function generateVotingMethodCritique(config: VotingConfig) {
  if (!config.ballotType) return "";
  
  let critique = "";
  
  // Ballot type critique
  switch (config.ballotType) {
    case 'choose-x':
      if (config.limitedChoices === '1') {
        critique += "**Strengths:** Simple and familiar. **Weaknesses:** Severe vote splitting, spoiler effects, doesn't capture full voter preferences.";
      } else if (config.limitedChoices === 'unlimited') {
        critique += "**Strengths:** Simple, eliminates vote splitting, encourages honest voting. **Weaknesses:** No preference intensity, potential for bullet voting.";
      } else {
        critique += "**Strengths:** Reduces vote splitting compared to FPTP, allows some preference expression. **Weaknesses:** Arbitrary limit may not reflect true preferences, still susceptible to strategic voting.";
      }
      break;
    case 'ranking':
      critique += "**Strengths:** Captures preference order, eliminates spoiler effect. **Weaknesses:** Can be complex for voters, may have non-monotonic results.";
      break;
    case 'score':
      critique += "**Strengths:** Expresses preference intensity, highly expressive. **Weaknesses:** Strategic voting concerns, normalization issues between voters.";
      break;

  }
  
  critique += "\n\n";
  
  // Tabulation critique
  if (config.tabulationMethod) {
    switch (config.tabulationMethod) {
      case 'irv':
        critique += "**IRV:** Good at eliminating spoiler effects but can eliminate Condorcet winners and has center-squeeze problems.";
        break;
      case 'borda':
        critique += "**Borda:** Rewards broadly acceptable candidates but highly vulnerable to strategic nomination.";
        break;
      case 'condorcet':
        critique += "**Condorcet:** Elects the candidate who beats all others head-to-head, but may have no winner in some cases.";
        break;
      case 'plurality':
        critique += "**Plurality:** Simple but suffers from vote splitting and spoiler effects with multiple candidates.";
        break;
      case 'most-votes':
        critique += "**Most Approvals:** Simple and intuitive, encourages honest voting without strategic downsides.";
        break;
      case 'satisfaction-approval':
        critique += "**Satisfaction Approval:** Semi-proportional system that splits each vote equally between all approved candidates. More proportional than block voting but requires strategic coordination - voters must know how many seats their party deserves and vote for exactly that many candidates. Vulnerable to 'wipeout' if strategy fails.";
        break;
      case 'pav':
        critique += "**PAV:** Proportional approval voting that encourages diverse representation, but can be computationally complex.";
        break;
      case 'sequential-monroe':
        critique += "**Sequential Monroe:** Maximizes equal voter satisfaction across all seats, ensuring minority representation.";
        break;
      case 'stv':
        critique += "**STV:** Provides proportional representation with ranked ballots, maintaining local representation while ensuring diversity.";
        break;
      case 'highest-total':
        critique += "**Highest Total:** Simple sum of scores, but may favor candidates with broader but shallow support.";
        break;
      case 'highest-average':
        critique += "**Highest Average:** Rewards quality over quantity of support, but can be skewed by few very high scores.";
        break;
      case 'star':
        critique += "**STAR:** Combines benefits of score voting with runoff security, but relatively new and untested at scale.";
        break;
      case 'majority-judgment':
        critique += "**Majority Judgment:** Based on median scores, resistant to tactical voting but can have tie-breaking complexity.";
        break;
    }
    critique += "\n\n";
  }
  
  // Multi-winner critique
  if (config.numberOfSeats > 1) {
    if (['party-list-pr', 'mmp', 'pav', 'sequential-monroe', 'stv'].includes(config.tabulationMethod || '')) {
      critique += "**Proportional Representation:** Ensures fair party representation but may reduce local accountability.";
      
      // List type critique
      if (config.listType) {
        critique += "\n\n";
        switch (config.listType) {
          case 'closed':
            critique += "**Closed Lists:** Give parties full control over candidate selection and ordering, which can strengthen party discipline but reduce voter choice.";
            break;
          case 'open':
            critique += "**Open Lists:** Allow voters to choose specific candidates within parties, increasing voter choice but potentially fragmenting party unity.";
            break;
          case 'flexible':
            critique += "**Flexible Lists:** Balance party control with voter choice, allowing both party and candidate votes to influence outcomes.";
            break;
        }
      }
      
      // Mixed member critique
      if (config.tabulationMethod === 'mmp' && config.mixedMember) {
        critique += "\n\n";
        const districtPercent = config.singleWinnerProportion;
        if (districtPercent > 70) {
          critique += "**High District Proportion:** Maintains strong local representation but may reduce proportionality effectiveness.";
        } else if (districtPercent < 30) {
          critique += "**High List Proportion:** Maximizes proportionality but may weaken local representation and accountability.";
        } else {
          critique += "**Balanced Mixed System:** Good compromise between local representation and proportionality.";
        }
      }
    } else {
      critique += "**Non-Proportional Multi-Winner:** May lead to sweep victories and poor minority representation.";
    }
    
    // Primary elections critique
    if (config.hasParties) {
      critique += "\n\n";
      if (config.hasPrimaries) {
        critique += "**Primary Elections:** Increase voter choice and party democracy but can favor extreme candidates, reduce general election competitiveness, and increase campaign costs. May lead to more polarized candidates who appeal to party bases rather than general electorate.";
      } else {
        critique += "**No Primaries:** Parties select candidates internally (conventions, appointments, etc.). This gives party leadership more control but may reduce grassroots democracy and voter input in candidate selection.";
      }
    }
  }
  
  return critique.trim();
}

function generateVotingMethodScores(config: VotingConfig) {
  const scores = {
    proportionality: 0,
    simplicity: 0,
    strategyResistance: 0,
    representation: 0
  };

  if (!config.ballotType || !config.tabulationMethod) {
    return scores;
  }

  // Base scores by ballot type
  switch (config.ballotType) {
    case 'choose-x':
      scores.simplicity = 5; // Very simple to vote
      scores.strategyResistance = 3; // Moderate strategy resistance
      break;
    case 'ranking':
      scores.simplicity = 3; // Moderate complexity
      scores.strategyResistance = 4; // Good strategy resistance
      break;
    case 'score':
      scores.simplicity = 4; // Fairly simple
      scores.strategyResistance = 3; // Moderate strategy resistance
      break;
  }

  // Adjust based on tabulation method
  switch (config.tabulationMethod) {
    case 'most-votes':
      scores.representation = config.numberOfSeats > 1 ? 2 : 4;
      break;
    case 'satisfaction-approval':
      scores.proportionality = 3; // Semi-proportional
      scores.representation = 4;
      break;
    case 'pav':
    case 'sequential-monroe':
    case 'stv':
    case 'party-list-pr':
      scores.proportionality = 5; // Fully proportional
      scores.representation = 5;
      break;
    case 'mmp':
      scores.proportionality = 5; // Fully proportional
      scores.representation = 5;
      scores.simplicity = Math.max(1, scores.simplicity - 1); // Slightly more complex
      break;
    case 'irv':
      scores.representation = 4;
      break;
    case 'borda':
      scores.strategyResistance = 2; // Vulnerable to strategy
      scores.representation = 3;
      break;
    case 'star':
      scores.strategyResistance = 4;
      scores.representation = 4;
      break;
  }

  // Adjust for multi-winner vs single-winner
  if (config.numberOfSeats === 1) {
    scores.proportionality = 0; // Single-winner can't be proportional
  }

  // Adjust for choice limitations
  if (config.limitedChoices === '1' && config.ballotType === 'choose-x') {
    scores.strategyResistance = 2; // FPTP is highly strategic
  }

  return scores;
}

function isProportionalMethod(config: VotingConfig): boolean {
  const proportionalMethods = ['pav', 'sequential-monroe', 'stv', 'party-list-pr', 'mmp'];
  return config.numberOfSeats > 1 && proportionalMethods.includes(config.tabulationMethod || '');
}

function isSemiProportionalMethod(config: VotingConfig): boolean {
  return config.numberOfSeats > 1 && config.tabulationMethod === 'satisfaction-approval';
}

function selectOption(category: keyof VotingConfig, value: any) {
  (config as any)[category] = value;
  
  // Reset dependent options when changing ballot type
  if (category === 'ballotType') {
    config.tabulationMethod = null;
    if (value === 'choose-x') {
      config.limitedChoices = 'unlimited'; // Default to approval voting
    }
  }
  
  // Auto-select appropriate tabulation for some ballot types
  if (category === 'ballotType') {
    if (value === 'choose-x') {
      config.tabulationMethod = config.numberOfSeats > 1 ? 'pav' : 'most-votes';
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
      config.tabulationMethod = isMulti ? 'pav' : 'most-votes';
    } else if (config.ballotType === 'ranking') {
      config.tabulationMethod = isMulti ? 'stv' : 'irv';
    }
    
    // Reset multi-winner specific options for single-winner
    if (!isMulti) {
      config.hasParties = false;
      config.canVoteForParties = false;
      config.canVoteForCandidates = true;
      config.hasPrimaries = false;
      config.listType = null;
      config.mixedMember = false;
      config.singleWinnerProportion = 50;
    }
  }
  
  // Reset party-based tabulation when parties are disabled
  if (category === 'hasParties' && !value) {
    if (['party-list-pr', 'mmp'].includes(config.tabulationMethod || '')) {
      // Revert to appropriate non-party method
      if (config.ballotType === 'choose-x' && config.numberOfSeats > 1) {
        config.tabulationMethod = 'pav';
      } else if (config.ballotType === 'ranking' && config.numberOfSeats > 1) {
        config.tabulationMethod = 'stv';
      }
    }
    config.listType = null;
    config.mixedMember = false;
  }
}





function validatePartyVoting() {
  // Ensure at least one voting option is enabled
  if (config.hasParties && !config.canVoteForParties && !config.canVoteForCandidates) {
    config.canVoteForCandidates = true;
  }
}

// Reset primaries when parties are disabled
$: if (!config.hasParties) {
  config.hasPrimaries = false;
}
</script>

<svelte:head>
  <title>Voting Method Builder - Create Your Custom Voting System - approval.vote</title>
  <meta name="description" content="Interactive tool to design and analyze custom voting methods. Mix and match ballot types, tabulation methods, and multi-winner options to create your ideal voting system." />
</svelte:head>

<div class="container wide-builder">
  <div class="description">
    <h1>Voting Method Builder</h1>
    <p class="subtitle">Mix and match components to design your ideal voting system</p>
  </div>

  <div class="builder-layout">
    <!-- Configuration Panel -->
    <div class="config-panel">
      
      <!-- Election Size Section (moved to top) -->
      <section class="config-section">
        <h2>🏛️ Election Size</h2>
        <p class="section-description">How many seats are being elected?</p>
        <div class="slider-section">
          <label>
            Number of seats to elect: <strong>{config.numberOfSeats}</strong>
            <input 
              type="range" 
              bind:value={config.numberOfSeats} 
              min="1" 
              max="500" 
              step="1"
              class="seats-slider"
              on:input={() => selectOption('numberOfSeats', config.numberOfSeats)}
            >
            <div class="slider-labels">
              <span>Single (1)</span>
              <span>Small Council (5)</span>
              <span>Parliament (100)</span>
              <span>Large Assembly (500)</span>
            </div>
          </label>
        </div>
      </section>
      
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
              <input type="number" bind:value={config.scoreMin} min="-10" max="0" style="width: 60px;"> 
              to 
              <input type="number" bind:value={config.scoreMax} min="1" max="10" style="width: 60px;">
            </label>
            <label>
              <input type="checkbox" bind:checked={config.allowNegativeVotes}>
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
                <input type="number" bind:value={config.customLimit} min="1" max="20" style="width: 80px;">
                candidate{config.customLimit === 1 ? '' : 's'}
              </label>
            </div>
          {/if}
        </section>
      {/if}

      <!-- Party Structure Section -->
      <section class="config-section">
        <h2>🏛️ Party Structure</h2>
        <p class="section-description">Are candidates organized into political parties?</p>
        <div class="toggle-section">
          <label class="toggle-label">
            <input type="checkbox" bind:checked={config.hasParties}>
            <span class="toggle-text">Election has political parties</span>
          </label>
        </div>
        
        {#if config.hasParties}
          <div class="sub-options">
            <p><strong>What can voters choose?</strong></p>
            <div class="voting-targets">
              <label class="toggle-label">
                <input type="checkbox" bind:checked={config.canVoteForParties} on:change={validatePartyVoting}>
                <span class="toggle-text">Vote for parties</span>
              </label>
              <label class="toggle-label">
                <input type="checkbox" bind:checked={config.canVoteForCandidates} on:change={validatePartyVoting}>
                <span class="toggle-text">Vote for individual candidates</span>
              </label>
            </div>
            
            <div class="primaries-section">
              <label class="toggle-label">
                <input type="checkbox" bind:checked={config.hasPrimaries}>
                <span class="toggle-text">Parties hold primary elections</span>
              </label>
              {#if config.hasPrimaries}
                <p class="primary-description">Parties use primary elections to select their candidates before the general election.</p>
              {/if}
            </div>
          </div>
        {/if}
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
                  <input type="checkbox" bind:checked={config.mixedMember}>
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
                    >
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
            <span class="proportional-badge" title="This is a proportional representation method that ensures fair party/group representation">⚖️</span>
          {:else if isSemiProportionalMethod(config)}
            <span class="proportional-badge" title="This is a semi-proportional method that provides some fairness but not full proportional representation">⚖️✨</span>
          {/if}
        </h2>
        
        {#if config.ballotType && config.tabulationMethod}
          <div class="method-scores">
            <h3>System Analysis</h3>
            <div class="score-grid">
              <div class="score-item">
                <span class="score-label">Proportionality</span>
                <div class="score-bar">
                  <div class="score-fill" style="width: {(votingMethodScores.proportionality / 5) * 100}%"></div>
                  <span class="score-value">{votingMethodScores.proportionality}/5</span>
                </div>
              </div>
              <div class="score-item">
                <span class="score-label">Voter Simplicity</span>
                <div class="score-bar">
                  <div class="score-fill" style="width: {(votingMethodScores.simplicity / 5) * 100}%"></div>
                  <span class="score-value">{votingMethodScores.simplicity}/5</span>
                </div>
              </div>
              <div class="score-item">
                <span class="score-label">Strategy Resistance</span>
                <div class="score-bar">
                  <div class="score-fill" style="width: {(votingMethodScores.strategyResistance / 5) * 100}%"></div>
                  <span class="score-value">{votingMethodScores.strategyResistance}/5</span>
                </div>
              </div>
              <div class="score-item">
                <span class="score-label">Representation Quality</span>
                <div class="score-bar">
                  <div class="score-fill" style="width: {(votingMethodScores.representation / 5) * 100}%"></div>
                  <span class="score-value">{votingMethodScores.representation}/5</span>
                </div>
              </div>
            </div>
          </div>
        {/if}
        
        {#if votingMethodSummary}
          <div class="method-summary">
            {@html votingMethodSummary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n\n/g, '<br><br>')}
          </div>
        {/if}
        
        {#if votingMethodCritique}
          <div class="method-critique">
            <h3>Detailed Analysis</h3>
            {@html votingMethodCritique.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n\n/g, '<br><br>')}
          </div>
        {/if}
        
        {#if config.ballotType}
          <div class="method-actions">
            <a href="{base}/about-approval-voting" class="action-link">Learn about voting systems</a>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

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
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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

  .sub-options input[type="number"] {
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

  .toggle-label input[type="checkbox"] {
    margin-right: 0.5rem;
    transform: scale(1.2);
  }

  .toggle-text {
    color: #333;
  }





  .voting-targets {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .primaries-section {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #ddd;
  }

  .primary-description {
    margin-top: 0.5rem;
    margin-left: 1.5rem;
    font-size: 0.9rem;
    color: #666;
    font-style: italic;
  }

  .slider-section {
    margin-top: 1rem;
    padding: 1rem;
    background: #f5f5f5;
    border-radius: 4px;
  }

  .proportion-slider, .seats-slider {
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
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
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
    align-items: center;
    gap: 1rem;
  }

  .score-label {
    min-width: 140px;
    font-weight: 500;
    color: #475569;
    font-size: 0.95rem;
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
    background: linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #10b981 100%);
    border-radius: 12px;
    transition: width 0.3s ease;
  }

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
    text-align: center;
    padding-top: 1.5rem;
    border-top: 1px solid #eee;
  }

  .action-link {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background: #437527;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    font-weight: 500;
    transition: background-color 0.2s ease;
  }

  .action-link:hover {
    background: #365a1f;
    color: white;
  }
</style>