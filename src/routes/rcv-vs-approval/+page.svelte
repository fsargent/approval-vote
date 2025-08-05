<script>
  import { resolve } from '$app/paths';

  // Interactive voting example state
  let approvalVotes = $state([]);

  // Simple RCV state - track selected cells as "candidateId-rank"
  let selectedCells = $state(new Set());

  // Ballot validation state
  let ballotError = $state(null);
  let ballotInterpretation = $state(null);

  const candidates = [
    { id: 'alice', name: 'Alice Johnson', party: 'Progressive' },
    { id: 'bob', name: 'Bob Smith', party: 'Conservative' },
    { id: 'charlie', name: 'Charlie Davis', party: 'Independent' },
    { id: 'diana', name: 'Diana Wilson', party: 'Moderate' },
  ];

  function handleApprovalVote(candidateId) {
    const index = approvalVotes.indexOf(candidateId);
    if (index > -1) {
      approvalVotes = approvalVotes.filter((id) => id !== candidateId);
    } else {
      approvalVotes = [...approvalVotes, candidateId];
    }
  }

  function handleRankClick(candidateId, rank) {
    const cellKey = `${candidateId}-${rank}`;

    // Toggle: if this cell is selected, unselect it; otherwise select it
    if (selectedCells.has(cellKey)) {
      selectedCells.delete(cellKey);
    } else {
      selectedCells.add(cellKey);
    }

    // Trigger reactivity and validate
    selectedCells = new Set(selectedCells);
    validateBallot();
  }

  function clearAllRankings() {
    selectedCells = new Set();
    ballotError = null;
    ballotInterpretation = null;
  }

  function isCellSelected(candidateId, rank) {
    return selectedCells.has(`${candidateId}-${rank}`);
  }

  function getCandidatesAtRank(rank) {
    const candidates = [];
    for (const cellKey of selectedCells) {
      const [candidateId, cellRank] = cellKey.split('-');
      if (parseInt(cellRank) === rank) {
        candidates.push(candidateId);
      }
    }
    return candidates;
  }

  function getRanksForCandidate(candidateId) {
    const ranks = [];
    for (const cellKey of selectedCells) {
      const [cellCandidateId, rank] = cellKey.split('-');
      if (cellCandidateId === candidateId) {
        ranks.push(parseInt(rank));
      }
    }
    return ranks.sort((a, b) => a - b);
  }

  function validateBallot() {
    if (selectedCells.size === 0) {
      ballotError = null;
      ballotInterpretation = null;
      return;
    }

    // Parse all selections
    const selections = Array.from(selectedCells).map((cellKey) => {
      const [candidateId, rank] = cellKey.split('-');
      return {
        candidateId,
        rank: parseInt(rank),
        candidateName: candidates.find((c) => c.id === candidateId)?.name,
      };
    });

    // Check for candidates ranked multiple times
    const candidateRanks = {};
    selections.forEach(({ candidateId, rank }) => {
      if (!candidateRanks[candidateId]) candidateRanks[candidateId] = [];
      candidateRanks[candidateId].push(rank);
    });

    const candidatesWithMultipleRanks = Object.entries(candidateRanks)
      .filter(([_, ranks]) => ranks.length > 1)
      .map(([candidateId, ranks]) => ({
        id: candidateId,
        name: candidates.find((c) => c.id === candidateId)?.name,
        ranks: ranks.sort((a, b) => a - b),
      }));

    if (candidatesWithMultipleRanks.length > 0) {
      const candidate = candidatesWithMultipleRanks[0];
      ballotError = `${candidate.name} is ranked multiple times! In San Francisco RCV, we will only count your first ranking (${candidate.ranks[0]}) and disregard all others.`;
      ballotInterpretation = {
        valid: false,
        message: `Your ballot would only count ${candidate.name} at rank ${candidate.ranks[0]}, other rankings would be disregarded.`,
        duplicateCandidate: candidate,
      };
      return;
    }

    // Check for multiple candidates at same rank
    const rankCounts = {};
    selections.forEach(({ rank }) => {
      rankCounts[rank] = (rankCounts[rank] || 0) + 1;
    });

    const duplicateRanks = Object.entries(rankCounts)
      .filter(([_, count]) => count > 1)
      .map(([rank, _]) => parseInt(rank));

    if (duplicateRanks.length > 0) {
      const firstDuplicateRank = Math.min(...duplicateRanks);
      ballotError = `Multiple candidates at rank ${firstDuplicateRank}! In San Francisco RCV, if you mark multiple candidates at the same rank, that rank and all following ranks are discarded.`;
      ballotInterpretation = {
        valid: false,
        message: `Your ballot would be exhausted due to multiple candidates at rank ${firstDuplicateRank}.`,
        exhaustedAt: firstDuplicateRank,
      };
      return;
    }

    // Check for skipped ranks
    const usedRanks = Object.keys(rankCounts)
      .map((r) => parseInt(r))
      .sort((a, b) => a - b);
    const expectedRanks = Array.from({ length: usedRanks.length }, (_, i) => i + 1);

    if (JSON.stringify(usedRanks) !== JSON.stringify(expectedRanks)) {
      ballotError =
        'Skipped ranks detected! In RCV, you should rank candidates consecutively starting from 1.';
      ballotInterpretation = {
        valid: false,
        message: 'Your ballot would be exhausted due to skipped ranks.',
        exhaustedAt: usedRanks.find((r) => !expectedRanks.includes(r)),
      };
      return;
    }

    // Valid ballot
    ballotError = null;
    ballotInterpretation = {
      valid: true,
      message: 'Your ballot is valid and would be counted normally.',
      validRanks: usedRanks,
    };
  }
</script>

<svelte:head>
  <title>RCV vs Approval Voting - approval.vote</title>
  <meta
    name="description"
    content="Compare Ranked Choice Voting (RCV) and Approval Voting systems, their advantages, disadvantages, and real-world examples."
  />
</svelte:head>

<div class="container">
  <div class="description">
    <h1>RCV vs Approval Voting</h1>
  </div>

  <p>
    Both Ranked Choice Voting (RCV) and Approval Voting are alternatives to First Past the Post
    (FPTP) that aim to improve democratic outcomes. However, they have different approaches,
    advantages, and disadvantages. Let's compare them side by side.
  </p>

  <h2>Interactive Comparison</h2>
  <p>Try both voting systems with the same set of candidates to see how they differ:</p>

  <div class="voting-comparison">
    <div class="voting-system approval-section">
      <h3>Approval Voting</h3>
      <p>
        Vote for any number of candidates you approve of.<br /> The candidate with the most votes wins.
      </p>

      <div class="voting-example">
        <h4>Your Vote:</h4>
        <div class="checkbox-group">
          {#each candidates as candidate}
            <label class="checkbox-option">
              <input
                type="checkbox"
                value={candidate.id}
                checked={approvalVotes.includes(candidate.id)}
                onchange={() => handleApprovalVote(candidate.id)}
              />
              <span class="checkbox-label">
                <strong>{candidate.name}</strong>
                <span class="party">({candidate.party})</span>
              </span>
            </label>
          {/each}
        </div>
      </div>
    </div>

    <div class="voting-system rcv-section">
      <h3>Ranked Choice Voting (RCV)</h3>
      <p>
        Rank candidates in order of preference. Click the circles to rank candidates. If no
        candidate gets a majority, the last-place candidate is eliminated and their votes are
        redistributed.
      </p>

      <div class="voting-example">
        <h4>Your Vote:</h4>

        <div class="ballot-table">
          <table class="rcv-ballot">
            <thead>
              <tr>
                <th class="candidate-header">Candidate</th>
                <th class="rank-header">1st Choice</th>
                <th class="rank-header">2nd Choice</th>
                <th class="rank-header">3rd Choice</th>
                <th class="rank-header">4th Choice</th>
              </tr>
            </thead>
            <tbody>
              {#each candidates as candidate}
                <tr class="candidate-row">
                  <td class="candidate-info">
                    <strong>{candidate.name}</strong>
                    <span class="party">({candidate.party})</span>
                  </td>
                  {#each [1, 2, 3, 4] as rank}
                    <td class="rank-cell">
                      <button
                        class="rank-button"
                        class:selected={isCellSelected(candidate.id, rank)}
                        onclick={() => handleRankClick(candidate.id, rank)}
                        title="Click to rank {candidate.name} as choice #{rank}"
                      >
                        <span class="rank-number">{rank}</span>
                      </button>
                    </td>
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>

          <div class="ballot-instructions">
            <p>
              <strong>Instructions:</strong> Click circles to rank candidates. You can select any combination
              - the system will show you any ballot errors.
            </p>
            <button class="clear-ranking-btn" onclick={clearAllRankings}>Clear All Rankings</button>
          </div>

          {#if ballotError}
            <div class="ballot-error">
              <div class="error-icon">⚠️</div>
              <div class="error-content">
                <h5>Ballot Error</h5>
                <p>{ballotError}</p>
                {#if ballotInterpretation}
                  <div class="interpretation">
                    <strong>How your ballot would be interpreted:</strong>
                    <p>{ballotInterpretation.message}</p>
                    {#if ballotInterpretation.exhaustedAt}
                      <p>Ballot exhausted at rank {ballotInterpretation.exhaustedAt}.</p>
                    {/if}
                  </div>
                {/if}
              </div>
            </div>
          {/if}

          {#if ballotInterpretation && !ballotError}
            <div class="ballot-valid">
              <div class="valid-icon">✅</div>
              <div class="valid-content">
                <h5>Valid Ballot</h5>
                <p>{ballotInterpretation.message}</p>
                <p>Your rankings: {ballotInterpretation.validRanks.join(', ')}</p>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <div class="system-comparison">
    <h3>Key Differences</h3>
    <table class="comparison-table">
      <thead>
        <tr>
          <th>Aspect</th>
          <th>Approval Voting</th>
          <th>Ranked Choice Voting</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Voter Expression</strong></td>
          <td>Flexible - approve any number</td>
          <td>Detailed - rank all preferences</td>
        </tr>
        <tr>
          <td><strong>Strategic Voting</strong></td>
          <td>Low - vote sincerely</td>
          <td>Medium - some strategic ranking</td>
        </tr>
        <tr>
          <td><strong>Simplicity</strong></td>
          <td>Very simple</td>
          <td>More complex</td>
        </tr>
        <tr>
          <td><strong>Cost</strong></td>
          <td>Low</td>
          <td>Higher (special equipment)</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h2>Rebuttals to Common RCV Critiques of Approval Voting</h2>

  <h3>1. "RCV Guarantees Majority Support"</h3>
  <p>
    <strong>RCV Claim:</strong> RCV ensures the winner has majority support by eliminating candidates
    until someone gets 50%+1 votes.
  </p>
  <p>
    <strong>Reality:</strong> RCV cannot guarantee majority support when a true majority doesn't exist.
    Instead, it artificially manufactures "majority" support by discarding votes until the remaining
    ballots form a majority. This process often eliminates the most broadly acceptable candidate.
  </p>
  <p>
    The <a href="https://ranked.vote/report/us/ak/2022/08/cd" target="_blank"
      >2022 Alaska Special Election</a
    > perfectly illustrates this problem:
  </p>
  <ul>
    <li><strong>Mary Peltola (D)</strong> won with 51.4% in the final round</li>
    <li>
      <strong>Nick Begich (R)</strong> was eliminated first, despite being the Condorcet winner
    </li>
    <li><strong>Sarah Palin (R)</strong> had strong first-choice support but was polarizing</li>
  </ul>
  <p>
    The pairwise preferences show that <strong>Begich was the Condorcet winner</strong>—he would
    have beaten both Peltola and Palin in head-to-head matchups. However, RCV eliminated him first
    because he had the fewest first-choice votes. This demonstrates how RCV can elect a candidate
    with less broad support than a centrist.
  </p>
  <p>
    In approval voting, voters could have approved of multiple candidates they found acceptable.
    Begich, as a moderate Republican, likely would have received approval from both conservative
    voters (who preferred him over Peltola) and some moderate Democrats (who preferred him over
    Palin), giving him a chance to win based on broad acceptability rather than being eliminated due
    to lack of first-choice support.
  </p>

  <h3>2. "Approval Voting Encourages Bullet Voting"</h3>
  <p>
    <strong>RCV Claim:</strong> In approval voting, most voters will vote for one candidate, which is
    just like First Past the Post.
  </p>
  <p>
    <strong>Reality:</strong>When people "vote for one" in approval voting, they're voting for their
    sincere favorite, not strategically avoiding a "lesser evil." This is actually more honest than
    RCV's strategic ranking.
  </p>
  <p>
    In approval voting, voters can express their true preferences without fear of "wasting" their
    vote. If you only like one candiate, you don't have to worry about your vote 'splitting' the
    election and helping your least favorite candidate win.
  </p>

  <h3>3. "RCV Provides More Expressiveness"</h3>
  <p>
    <strong>RCV Claim:</strong> RCV allows voters to express detailed preferences through ranking, making
    it more expressive than approval voting.
  </p>
  <p>
    <strong>Reality:</strong> The law of large numbers ensures that election results converge to the
    true preferences of the electorate regardless of how much detail is captured on individual
    ballots. As noted by
    <a href="https://electionscience.org/education/differences" target="_blank">Election Science</a
    >, "the more voters there are, the more likely the election result is to reflect the true
    preferences of the electorate."
  </p>
  <p>
    Furthermore, ranking doesn't capture the distance between candidates. A voter might rank
    Candidate A as 1st and Candidate B as 2nd, but this doesn't tell us whether they strongly prefer
    A over B or only slightly prefer A. If true expressiveness were the goal, systems like <a
      href="https://electionscience.org/education/approval-voting-vs-rcv"
      target="_blank">score voting</a
    > would be superior, as they allow voters to express intensity of preference.
  </p>
  <p>
    Approval voting strikes the right balance: it captures the essential information (which
    candidates are acceptable) while remaining simple enough for voters to understand and use
    correctly. The complexity of RCV's ranking system doesn't translate to better election outcomes.
  </p>

  <h2>Advantages of Approval Voting Over RCV</h2>

  <ul>
    <li><strong>Simplicity:</strong> Much easier to understand and implement</li>
    <li><strong>Cost-effective:</strong> Works with existing voting equipment</li>
    <li><strong>No center squeeze:</strong> Moderates can win based on broad acceptability</li>
    <li><strong>Reduces strategic voting:</strong> Voters can express true preferences</li>
    <li><strong>Prevents vote splitting:</strong> Similar candidates don't hurt each other</li>
    <li><strong>Encourages consensus:</strong> Candidates must appeal to broader coalitions</li>
  </ul>

  <div class="cta-section">
    <h2>Explore Real Election Results</h2>
    <p>
      See how approval voting performs in actual elections with detailed analysis and data from
      real-world races.
    </p>
    <a href="{resolve('/')}" class="cta-button">View Election Results</a>
  </div>
</div>

<style>
  .container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem;
  }

  .description {
    margin-bottom: 2rem;
  }

  .description h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: #437527;
  }

  h2 {
    font-size: 1.8rem;
    margin: 2rem 0 1rem 0;
    color: #437527;
    border-bottom: 2px solid #e9ecef;
    padding-bottom: 0.5rem;
  }

  h3 {
    font-size: 1.4rem;
    margin: 1.5rem 0 1rem 0;
    color: #437527;
  }

  h4 {
    font-size: 1.1rem;
    margin: 1rem 0 0.5rem 0;
    color: #6c757d;
  }

  p {
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  ul {
    margin-bottom: 1.5rem;
  }

  li {
    margin-bottom: 0.5rem;
    line-height: 1.5;
  }

  .voting-comparison {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    margin: 2rem 0;
  }

  .approval-section {
    max-width: 600px;
    margin: 0 auto;
  }

  .rcv-section {
    width: 100%;
    max-width: 100%;
  }

  .voting-system {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 1.5rem;
  }

  .voting-system h3 {
    margin-top: 0;
    color: #437527;
  }

  .voting-example {
    margin-top: 1rem;
  }

  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .checkbox-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .checkbox-option:hover {
    background: #e9ecef;
  }

  .checkbox-label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .party {
    font-size: 0.875rem;
    color: #6c757d;
  }

  /* RCV Ballot Table Styles */
  .ballot-table {
    margin: 1rem 0;
  }

  .rcv-ballot {
    width: 100%;
    max-width: 1000px;
    border-collapse: collapse;
    border: 2px solid #dee2e6;
    background: white;
    font-size: 0.9rem;
    table-layout: fixed;
  }

  .rcv-ballot th {
    background: #437527;
    color: white;
    padding: 0.75rem;
    text-align: center;
    font-weight: 600;
    border: 1px solid #365a1f;
  }

  .rcv-ballot td {
    padding: 0.75rem;
    border: 1px solid #dee2e6;
    text-align: center;
    vertical-align: middle;
  }

  .candidate-header {
    text-align: left !important;
  }

  .candidate-info {
    text-align: left;
  }

  .candidate-info strong {
    display: block;
    margin-bottom: 0.25rem;
  }

  .party {
    font-size: 0.8rem;
    color: #6c757d;
  }

  .rank-cell {
    padding: 0.5rem !important;
  }

  .rank-button {
    width: 40px;
    height: 40px;
    border: 2px solid #dee2e6;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .rank-button:hover {
    border-color: #437527;
    background: #f8fff8;
  }

  .rank-button.selected {
    background: #437527;
    color: white;
    border-color: #365a1f;
  }

  .rank-number {
    font-weight: 600;
  }

  .ballot-instructions {
    margin-top: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 6px;
    border: 1px solid #e9ecef;
  }

  .ballot-instructions p {
    margin: 0 0 1rem 0;
    font-size: 0.9rem;
  }

  .clear-ranking-btn {
    background: #6c757d;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    transition: background-color 0.2s;
  }

  .clear-ranking-btn:hover {
    background: #545b62;
  }

  /* Ballot Validation Styles */
  .ballot-error,
  .ballot-valid {
    margin-top: 1rem;
    padding: 1rem;
    border-radius: 6px;
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .ballot-error {
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24;
  }

  .ballot-valid {
    background: #d4edda;
    border: 1px solid #c3e6cb;
    color: #155724;
  }

  .error-icon,
  .valid-icon {
    font-size: 1.2rem;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  .error-content,
  .valid-content {
    flex: 1;
  }

  .error-content h5,
  .valid-content h5 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    font-weight: 600;
  }

  .error-content p,
  .valid-content p {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .interpretation {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }

  .interpretation strong {
    display: block;
    margin-bottom: 0.25rem;
  }

  .system-comparison {
    margin: 3rem 0;
  }

  .comparison-table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
    font-size: 0.9rem;
  }

  .comparison-table th,
  .comparison-table td {
    padding: 0.75rem;
    text-align: left;
    border: 1px solid #dee2e6;
  }

  .comparison-table th {
    background: #437527;
    color: white;
    font-weight: 600;
  }

  .comparison-table tr:nth-child(even) {
    background: #f8f9fa;
  }

  .cta-section {
    text-align: center;
    margin: 3rem 0;
    padding: 2rem;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
  }

  .cta-button {
    display: inline-block;
    background: #437527;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    text-decoration: none;
    font-weight: 600;
    transition: background-color 0.2s;
  }

  .cta-button:hover {
    background: #365a1f;
    text-decoration: none;
  }

  @media (max-width: 768px) {
    /* Remove container padding on mobile to maximize width for voting sections */
    .container {
      padding: 1rem 0;
    }

    .voting-comparison {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    /* Let voting systems use full width on mobile */
    .voting-system {
      padding: 1rem;
      margin: 0;
      border-radius: 0;
      border-left: none;
      border-right: none;
    }

    /* Add padding back to all non-voting content */
    .description,
    .system-comparison,
    .cta-section,
    h2,
    h3,
    p:not(.voting-system p),
    ul:not(.voting-system ul) {
      padding-left: 1rem;
      padding-right: 1rem;
    }

    /* Override for voting system content to remove extra padding */
    .voting-system h3,
    .voting-system p {
      padding-left: 0;
      padding-right: 0;
    }

    .comparison-table {
      font-size: 0.8rem;
      margin: 0 1rem;
    }

    .comparison-table th,
    .comparison-table td {
      padding: 0.5rem;
    }

    /* Mobile RCV Ballot Fixes */
    .ballot-table {
      overflow-x: auto;
      margin: 1rem 0;
    }

    .rcv-ballot {
      font-size: 0.75rem;
      min-width: 440px; /* Reduced further due to candidate column compression */
      table-layout: fixed; /* Force consistent column widths */
    }

    /* Set specific width for candidate column */
    .candidate-header {
      width: 140px !important; /* Reduced from 180px to minimize white space */
    }

    /* Ensure candidate info stays left aligned */
    .candidate-info {
      text-align: left !important;
      padding: 0.4rem 0.5rem !important;
    }

    .rcv-ballot th,
    .rcv-ballot td {
      padding: 0.4rem 0.25rem;
    }

    /* Compress rank cells significantly */
    .rank-cell {
      padding: 0.25rem 0.1rem !important;
      width: 50px; /* Fixed narrow width */
      text-align: center;
    }

    .rank-button {
      width: 32px;
      height: 32px;
      font-size: 0.7rem;
      margin: 0 auto; /* Ensure centering */
    }

    .candidate-info strong {
      font-size: 0.8rem;
    }

    .candidate-info .party {
      font-size: 0.65rem;
    }

    .rank-header {
      font-size: 0.7rem;
      padding: 0.4rem 0.1rem !important;
      width: 50px; /* Match cell width */
    }
  }
</style>
