<script lang="ts">
  import type { PageData } from "./$types";
  import type { IContestReport } from "$lib/server/report_types";

  export let data: PageData;
  const report: IContestReport = data.report;

  // Get all winners and their approval percentages, sorted by percentage
  const winners = report.candidates
    .filter((c) => c.winner)
    .map(winner => ({
      name: winner.name,
      percentage: ((winner.votes / report.ballotCount) * 100).toFixed(1),
      votes: winner.votes // Keep votes for sorting
    }))
    .sort((a, b) => b.votes - a.votes); // Sort by votes in descending order
</script>

<div class="card">
  {#if report?.info && winners.length > 0}
    <div class="header">
      <div class="jurisdiction">{report.info.jurisdictionName}</div>
      <div class="office">{report.info.officeName}</div>
      <div class="election">
        {report.info.electionName} ({report.info.date.slice(0, 4)})
      </div>
    </div>
    <div class="results">
      {#each winners as winner, i}
        <div class="result-row">
          <div
            class="background-fill"
            style="width: {winner.percentage}%"
          ></div>
          <div class="winner-stats">
            <div class="winner-name">{winner.name}</div>
            <div class="percentage">{winner.percentage}%</div>
            <div class="approval">approval</div>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="content">
      <p>Election not found</p>
    </div>
  {/if}
</div>

<style>
  .card {
    width: 1200px;
    height: 600px;
    background: white;
    position: relative;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
  }

  .header {
    padding: 2rem 3rem;
    text-align: center;
    background: white;
  }

  .results {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .result-row {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .background-fill {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background-color: #437527;
    opacity: 0.15;
    transition: width 0.5s ease-out;
  }

  .winner-stats {
    position: relative;
    z-index: 1;
    text-align: center;
  }

  .jurisdiction {
    font-size: 2.5rem;
    font-weight: bold;
    color: #333;
    margin-bottom: 0.5rem;
  }

  .office {
    font-size: 2rem;
    color: #444;
    margin-bottom: 0.25rem;
  }

  .election {
    font-size: 1.5rem;
    color: #666;
    margin-bottom: 0.5rem;
  }

  .winner-name {
    font-size: 2.5rem;
    font-weight: bold;
    color: #437527;
    margin-bottom: 0.5rem;
  }

  .percentage {
    font-size: 4rem;
    font-weight: bold;
    color: #437527;
    line-height: 1;
    margin-bottom: 0.25rem;
  }

  .approval {
    font-size: 1.5rem;
    color: #437527;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
</style>
