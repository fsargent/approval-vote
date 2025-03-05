<script lang="ts">
  import type { PageData } from "./$types";
  import type { IContestReport } from "$lib/server/report_types";

  export let data: PageData;
  const report: IContestReport = data.report;

  // Get winner's approval percentage
  const winner = report.candidates.find((c) => c.winner);
  const winnerPercentage = winner
    ? ((winner.votes / report.ballotCount) * 100).toFixed(1)
    : null;
</script>

<div class="card">
  {#if report?.info && winner && winnerPercentage}
    <div class="background-fill" style="width: {winnerPercentage}%"></div>
    <div class="content">
      <div class="jurisdiction">{report.info.jurisdictionName}</div>
      <div class="office">{report.info.officeName}</div>
      <div class="election">
        {report.info.electionName} ({report.info.date.slice(0, 4)})
      </div>
      <div class="winner-stats">
        <div class="winner-name">{winner.name}</div>
        <div class="percentage">{winnerPercentage}%</div>
        <div class="approval">approval</div>
      </div>
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
  }

  .background-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background-color: #437527;
    opacity: 0.15;
    transition: width 0.5s ease-out;
  }

  .content {
    position: relative;
    z-index: 1;
    height: 100%;
    padding: 3rem;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
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
    margin-bottom: 3rem;
  }

  .winner-stats {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .winner-name {
    font-size: 3rem;
    font-weight: bold;
    color: #437527;
    margin-bottom: 1rem;
  }

  .percentage {
    font-size: 6rem;
    font-weight: bold;
    color: #437527;
    line-height: 1;
    margin-bottom: 0.5rem;
  }

  .approval {
    font-size: 2rem;
    color: #437527;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
</style>
