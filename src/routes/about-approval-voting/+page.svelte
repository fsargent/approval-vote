<script>
  import { resolve } from '$app/paths';

  // Interactive voting example state
  let fptpVote = $state('');
  let approvalVotes = $state([]);

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
</script>

<svelte:head>
  <title>About Approval Voting - approval.vote</title>
  <meta
    name="description"
    content="Learn about approval voting, how it compares to other voting systems, and its academic foundations."
  />
</svelte:head>

<div class="container">
  <div class="description">
    <h1>
    <a href="{resolve('/')}">approval.vote</a>
    //
    <strong>About Approval Voting</strong>
  </h1>
  </div>

  <p>
    <a href="https://en.wikipedia.org/wiki/Approval_Voting">Approval Voting</a> is a voting system where
    voters can select as many candidates as they approve of, and the candidate with the most votes wins.
    This simple change from traditional voting methods has profound implications for democracy.
  </p>

  <h2>How Approval Voting Works</h2>
  <p>
    In approval voting, each voter can vote for (approve of) any number of candidates. You can vote
    for just one candidate, or you can vote for multiple candidates if you approve of them. The
    candidate who receives the most approval votes wins the election.
  </p>

  <p>
    This system encourages voters to express their true preferences rather than strategically voting
    for a "lesser evil" to avoid helping their least favorite candidate win.
  </p>

  <h2>Try Approval Voting</h2>
  <p>See how approval voting works compared to traditional voting:</p>

  <div class="voting-comparison">
    <div class="voting-system">
      <h3>Traditional Voting (FPTP)</h3>
      <p>Vote for exactly one candidate. The candidate with the most votes wins.</p>

      <div class="voting-example">
        <h4>Your Vote:</h4>
        <div class="radio-group">
          {#each candidates as candidate}
            <label class="radio-option">
              <input type="radio" name="fptp" value={candidate.id} bind:group={fptpVote} />
              <span class="radio-label">
                <strong>{candidate.name}</strong>
                <span class="party">({candidate.party})</span>
              </span>
            </label>
          {/each}
        </div>
      </div>
    </div>

    <div class="voting-system">
      <h3>Approval Voting</h3>
      <p>
        Vote for any number of candidates you approve of. The candidate with the most votes wins.
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
  </div>

  <div class="system-comparison">
    <h3>Key Differences</h3>
    <table class="comparison-table">
      <thead>
        <tr>
          <th>Aspect</th>
          <th>Traditional Voting</th>
          <th>Approval Voting</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Voter Expression</strong></td>
          <td>Limited - only one choice</td>
          <td>Flexible - approve any number</td>
        </tr>
        <tr>
          <td><strong>Strategic Voting</strong></td>
          <td>High - "lesser evil" voting common</td>
          <td>Low - vote sincerely</td>
        </tr>
        <tr>
          <td><strong>Simplicity</strong></td>
          <td>Very simple</td>
          <td>Very simple</td>
        </tr>
        <tr>
          <td><strong>Cost</strong></td>
          <td>Low</td>
          <td>Low</td>
        </tr>
        <tr>
          <td><strong>Consensus Building</strong></td>
          <td>Encourages polarization</td>
          <td>Encourages broad appeal</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h2>Advantages of Approval Voting</h2>
  <ul>
    <li><strong>Simplicity:</strong> Easy to understand and implement</li>
    <li><strong>Cost-effective:</strong> Works with existing voting equipment</li>
    <li><strong>Reduces strategic voting:</strong> Voters can express true preferences</li>
    <li><strong>Prevents vote splitting:</strong> Similar candidates don't hurt each other</li>
    <li><strong>Encourages consensus:</strong> Candidates must appeal to broader coalitions</li>
  </ul>

  <h2>Academic Foundations</h2>
  <p>
    Approval voting has a rich history and is supported by a significant body of academic research.
    Here are some of the key papers that have shaped our understanding of this voting method:
  </p>

  <div class="academic-papers">
    <ul class="paper-list">
      <li>
        <span class="paper-title">
          <strong
            >Brams, S. J., & Fishburn, P. C. (1978). <a href="https://www.jstor.org/stable/1955105"
              >Approval Voting</a
            >. <i>American Political Science Review, 72</i>(3), 831–847.</strong
          >
        </span>
        <p class="paper-description">
          This is considered the seminal paper that introduced and formalized the concept of
          approval voting.
        </p>
      </li>
      <li>
        <span class="paper-title">
          <strong
            >Brams, S. J., & Fishburn, P. C. (1983). <a
              href="https://link.springer.com/book/10.1007/978-1-4612-5436-9"
              ><i>Approval Voting</i></a
            >. Birkhäuser.</strong
          >
        </span>
        <p class="paper-description">
          A comprehensive book that expands on their original paper, providing a detailed analysis
          of the properties and potential effects of approval voting.
        </p>
      </li>
      <li>
        <span class="paper-title">
          <strong
            >Weber, R. J. (1995). <a href="https://www.jstor.org/stable/2138378">Approval Voting</a
            >. <i>Journal of Economic Perspectives, 9</i>(1), 39–49.</strong
          >
        </span>
        <p class="paper-description">
          A paper that reviews the history and properties of approval voting, comparing it favorably
          to plurality and Borda count systems.
        </p>
      </li>
      <li>
        <span class="paper-title">
          <strong
            >Brams, S. J., & Fishburn, P. C. (2005). <a
              href="https://link.springer.com/article/10.1007/s00355-005-0021-3"
              >Going from theory to practice: the mixed success of approval voting</a
            >. <i>Social Choice and Welfare, 25</i>(2-3), 457–474.</strong
          >
        </span>
        <p class="paper-description">
          This paper discusses the practical applications and challenges of implementing approval
          voting in real-world scenarios.
        </p>
      </li>
      <li>
        <span class="paper-title">
          <strong
            >Fishburn, P. C., & Brams, S. J. (1981). <a
              href="https://link.springer.com/article/10.1007/BF00127265"
              >Approval voting, Condorcet's principle, and runoff elections</a
            >. <i>Public Choice, 36</i>(1), 89–114.</strong
          >
        </span>
        <p class="paper-description">
          An article that explores the relationship between approval voting and the Condorcet
          criterion, arguing its superiority in certain respects to runoff elections.
        </p>
      </li>
      <li>
        <span class="paper-title">
          <strong
            >Ahn, D. S., & Oliveros, S. (2012). <a href="https://doi.org/10.1016/j.jet.2011.10.007"
              >Approval voting and scoring rules with common values</a
            >. <i>Journal of Economic Theory, 147</i>(2), 773-790.</strong
          >
        </span>
        <p class="paper-description">
          This research delves into the efficiency of approval voting compared to other scoring
          rules in elections where voters have common, but privately known, values.
        </p>
      </li>
      <li>
        <span class="paper-title">
          <strong
            >Laslier, J. F., & Sanver, R. M. (Eds.). (2010). <a
              href="https://link.springer.com/book/10.1007/978-3-642-02839-7"
              ><i>Handbook on Approval Voting</i></a
            >. Springer.</strong
          >
        </span>
        <p class="paper-description">
          A collection of essays from various authors that covers many facets of approval voting,
          from theoretical to practical considerations.
        </p>
      </li>
      <li>
        <span class="paper-title">
          <strong
            >Brams, S. J., & Kilgour, D. M. (2014). <a
              href="https://link.springer.com/chapter/10.1007/978-3-319-05158-1_18"
              >Satisfaction Approval Voting</a
            >. In <i>Voting Power and Procedures</i> (pp. 323-346). Springer, Cham.</strong
          >
        </span>
        <p class="paper-description">
          This work introduces a variant of approval voting that aims to maximize voter
          satisfaction.
        </p>
      </li>
    </ul>
  </div>

  <div class="cta-section">
    <h2>Explore More Voting Systems</h2>
    <p>
      Learn about proportional representation with approval voting principles, or see how approval
      voting compares to ranked choice voting.
    </p>
    <div class="cta-buttons">
      <a href="{resolve('/fair-share-voting')}" class="cta-button">Fair Share Voting</a>
      <a href="{resolve('/rcv-vs-approval')}" class="cta-button">RCV vs Approval Voting</a>
    </div>
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
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    margin: 2rem 0;
  }

  @media (min-width: 768px) {
    .voting-comparison {
      grid-template-columns: repeat(2, 1fr);
    }
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

  .radio-group,
  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .radio-option,
  .checkbox-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .radio-option:hover,
  .checkbox-option:hover {
    background: #e9ecef;
  }

  .radio-label,
  .checkbox-label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .party {
    font-size: 0.875rem;
    color: #6c757d;
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

  .academic-papers {
    margin: 2rem 0;
  }

  .paper-list {
    list-style: none;
    padding: 0;
  }

  .paper-list li {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #437527;
  }

  .paper-title {
    display: block;
    margin-bottom: 0.5rem;
  }

  .paper-title a {
    color: #437527;
    text-decoration: none;
  }

  .paper-title a:hover {
    text-decoration: underline;
  }

  .paper-description {
    margin: 0.5rem 0 0 0;
    font-size: 0.9rem;
    color: #6c757d;
    line-height: 1.4;
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

  .cta-buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
    margin-top: 1rem;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .description h1 {
      color: #e0e0e0;
    }

    .voting-system {
      background: #2a2a2a;
      border-color: #555;
    }

    .voting-system h3 {
      color: #5a8a37;
    }

    .radio-option:hover,
    .checkbox-option:hover {
      background: #555;
    }

    .party {
      color: #999;
    }

    .comparison-table th {
      background: #5a8a37;
      color: white;
    }

    .comparison-table tr:nth-child(even) {
      background: #2a2a2a;
    }

    .comparison-table td {
      border-color: #555;
    }

    .paper-list li {
      background: #2a2a2a;
      border-left-color: #5a8a37;
    }

    .paper-title a {
      color: #5a8a37;
    }

    .paper-description {
      color: #999;
    }

    .cta-section {
      background: #2a2a2a;
      border-color: #555;
    }

    .cta-button {
      background: #5a8a37;
      color: white;
    }

    .cta-button:hover {
      background: #4a7327;
    }

    h2 {
      border-bottom-color: #555;
    }
  }

  @media (max-width: 768px) {
    .voting-comparison {
      grid-template-columns: 1fr;
    }

    .comparison-table {
      font-size: 0.8rem;
    }

    .comparison-table th,
    .comparison-table td {
      padding: 0.5rem;
    }
  }
</style>
