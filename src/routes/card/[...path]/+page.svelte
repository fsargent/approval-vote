<script lang="ts">
  import type { PageData } from "./$types";
  import type { IContestReport } from "$lib/server/report_types";
  import QRCode from "qrcode";
  import { onMount } from "svelte";

  export let data: PageData;
  const report: IContestReport = data.report;

  let qrCanvas: HTMLCanvasElement;

  onMount(() => {
    const url = `https://approval.vote/report/${data.path}`;
    QRCode.toCanvas(qrCanvas, url, {
      width: 48,
      margin: 0,
      color: {
        dark: "#666666",
        light: "#ffffff",
      },
    });
  });

  // Get all candidates and their approval percentages, sorted by votes
  const candidates = report.candidates
    .map((candidate) => ({
      name: candidate.name,
      percentage: ((candidate.votes / report.ballotCount) * 100).toFixed(1),
      votes: candidate.votes,
      winner: candidate.winner,
    }))
    .sort((a, b) => b.votes - a.votes);

  // Calculate dynamic sizes based on number of candidates
  $: headerHeight = Math.min(180, Math.max(120, 600 / (candidates.length + 2)));
  $: rowHeight = (600 - headerHeight) / candidates.length;
  // Adjusted font size calculation to be more generous in the middle range
  $: fontSize = Math.min(2.5, Math.max(1, 8 / candidates.length));
</script>

<div class="card">
  {#if report?.info && candidates.length > 0}
    <div class="header" style="height: {headerHeight}px">
      <div class="source-info">
        <div class="watermark">approval.vote</div>
        <canvas bind:this={qrCanvas} width="48" height="48"></canvas>
      </div>
      <div class="jurisdiction">{report.info.jurisdictionName}</div>
      <div class="office">{report.info.officeName}</div>
      <div class="election">
        {report.info.electionName} ({report.info.date.slice(0, 4)})
      </div>
    </div>
    <div class="results">
      {#each candidates as candidate, i}
        <div
          class="result-row"
          style="height: {rowHeight}px; font-size: {fontSize}rem;"
        >
          <div
            class="background-fill"
            style="width: {candidate.percentage}%"
            class:winner={candidate.winner}
          ></div>
          <div class="winner-stats" class:winner={candidate.winner}>
            <div class="candidate-name">{candidate.name}</div>
            <div class="percentage-container">
              <div class="percentage">{candidate.percentage}%</div>
              <div class="approval">approval</div>
            </div>
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
    padding: 1rem 2rem;
    text-align: center;
    background: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative; /* Added to ensure proper watermark positioning */
  }

  .results {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0; /* Removed horizontal padding */
  }

  .result-row {
    position: relative;
    display: flex;
    align-items: center;
  }

  .background-fill {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background-color: #666;
    opacity: 0.15;
    transition: width 0.5s ease-out;
  }

  .background-fill.winner {
    background-color: #437527;
  }

  .winner-stats {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0 2rem; /* Keep some padding for the text content */
    color: #666;
  }

  .winner-stats.winner {
    color: #437527;
  }

  .jurisdiction {
    font-size: 1.75em;
    font-weight: bold;
    color: #333;
    margin-bottom: 0.25rem;
  }

  .office {
    font-size: 1.25em;
    color: #444;
    margin-bottom: 0.25rem;
  }

  .election {
    font-size: 1.1em;
    color: #666;
  }

  .candidate-name {
    font-size: 1em;
    font-weight: bold;
    flex: 1;
    text-align: left;
  }

  .percentage-container {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    white-space: nowrap;
  }

  .percentage {
    font-size: 1.2em;
    font-weight: bold;
  }

  .approval {
    font-size: 0.7em;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .source-info {
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: flex;
    flex-direction: column; /* Changed to column layout */
    align-items: flex-end; /* Align items to the right */
    gap: 0.25rem; /* Reduced gap for vertical layout */
  }

  .watermark {
    font-size: 0.8rem;
    color: #666;
    opacity: 0.5;
    font-style: italic;
  }

  canvas {
    opacity: 0.5;
  }
</style>
