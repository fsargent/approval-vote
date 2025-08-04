<script lang="ts">
  import { base } from "$app/paths";
  import type { IElectionIndexEntry } from "$lib/server/report_types";

  interface Props {
    data: import("./$types").PageData;
  }

  let { data }: Props = $props();
  let index = data.index;

  // Calculate total statistics (using reduce to avoid mutation warnings)
  const stats = Array.from(index).reduce(
    (acc, [_, elections]) => {
      elections.forEach(election => {
        election.contests.forEach(contest => {
          acc.totalRaces++;
          acc.totalApprovals += contest.sumVotes || 0;
          acc.totalBallots += contest.ballotCount || 0;
        });
      });
      return acc;
    },
    { totalRaces: 0, totalApprovals: 0, totalBallots: 0 }
  );

  const { totalRaces, totalApprovals, totalBallots } = stats;
  const avgApprovalsPerBallot = totalBallots > 0
    ? (totalApprovals / totalBallots).toFixed(1)
    : "0.0";
</script>

<svelte:head>
  <title>approval.vote: detailed reports on approval voting elections.</title>
  <meta
    name="description"
    content="Explore detailed reports and analysis of approval voting elections. See how voters express their preferences when they can choose multiple candidates."
  />

  <!-- Open Graph Tags -->
  <meta
    property="og:title"
    content="approval.vote: detailed reports on approval voting elections"
  />
  <meta
    property="og:description"
    content="Explore detailed reports and analysis of approval voting elections. See how voters express their preferences when they can choose multiple candidates."
  />
  <meta property="og:url" content="https://approval.vote" />
  <meta
    property="og:image"
    content="https://approval.vote/icons/icon-512x512.png"
  />

  <!-- Twitter Tags -->
  <meta name="twitter:title" content="approval.vote: Election Analysis" />
  <meta
    name="twitter:description"
    content="Explore detailed reports and analysis of approval voting elections."
  />
  <meta
    name="twitter:image"
    content="https://approval.vote/icons/icon-512x512.png"
  />
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "approval.vote",
      "description": "Detailed reports on approval voting elections",
      "url": "https://approval.vote",
      "author": {
        "@type": "Person",
        "name": "Felix Sargent",
        "url": "https://felixsargent.com"
      }
    }
  </script>
</svelte:head>

<div class="wide container">
  <div class="row">
    <div class="leftCol">
      <div class="description">
        <h1>approval.vote</h1>
        : detailed reports on approval voting elections.
      </div>
      <p>
        With <a href="{base}/approval-voting">
          Approval Voting</a
        > voters can choose as many candidates as they like, and the one receiving
        the most votes wins.
      </p>

      <p>
        This site contains detailed reports on <strong>{totalRaces}</strong> approval voting races.
        Across all elections, voters selected an average of <strong>{avgApprovalsPerBallot}</strong> candidates per ballot.
      </p>

      <p>
        <strong>approval.vote</strong> is a project of
        <a href="https://felixsargent.com">Felix Sargent</a>. It is a fork of
        <a href="https://paulbutler.org">Paul Butler's</a>
        <a href="https://ranked.vote">ranked.vote</a>. It is non-partisan and
        has received no outside funding.</p>
        <p>For more information, see
        <a href="{base}/about">the about page</a>, learn about <a href="{base}/approval-voting">approval voting</a>, or compare
        <a href="{base}/rcv-vs-approval">RCV vs approval voting</a>.
      </p>

      <p>
        View the source code on
        <a href="https://github.com/electionscience/approval-vote">GitHub</a>.
      </p>
    </div>

    <div class="rightCol">
      {#each [...index] as [year, elections]}
        <div class="yearSection">
          <h2>{year}</h2>
          <div class="electionSection">
            {#each elections as election}
              <div class="electionHeader">
                <h3>
                  <strong>{election.jurisdictionName}</strong>
                  {election.electionName}
                </h3>
              </div>
              {#each election.contests as contest}
                <div class="race">
                  <a href="{base}/report/{election.path}/{contest.office}">
                    <div class="race-content">
                      <div class="title">
                        <strong>{contest.officeName}</strong>
                        {#each contest.winners as winner, i}
                          <span class="winner"
                            >{winner}{i == contest.winners.length - 1
                              ? ""
                              : ", "}</span
                          >
                        {/each}
                      </div>
                      <div class="meta">
                        <strong>{contest.numCandidates}</strong> candidates
                      </div>
                    </div>
                  </a>
                </div>
              {/each}
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
