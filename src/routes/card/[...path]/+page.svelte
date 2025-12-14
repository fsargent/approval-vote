<script lang="ts">
  import type { PageData } from './$types';
  import type { IContestReport } from '$lib/server/report_types';
  import QRCode from 'qrcode';
  import { onMount } from 'svelte';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const report = $derived(data.report);

  let qrCanvas = $state<HTMLCanvasElement | undefined>(undefined);

  onMount(() => {
    if (!qrCanvas) return;
    const url = `https://approval.vote/report/${data.path}`;
    QRCode.toCanvas(qrCanvas, url, {
      width: 120,
      margin: 1,
      color: {
        dark: '#666666',
        light: '#ffffff',
      },
    });
  });

  // Get all candidates and their approval percentages, sorted by votes
  const candidates = $derived(report.candidates
    .map((candidate) => ({
      name: candidate.name,
      percentage: ((candidate.votes / report.ballotCount) * 100).toFixed(1),
      votes: candidate.votes,
      winner: candidate.winner,
    }))
    .sort((a, b) => b.votes - a.votes));

  // Calculate dynamic sizes based on number of candidates
  const headerHeight = $derived(Math.min(180, Math.max(120, 630 / (candidates.length + 2))));
  const rowHeight = $derived((630 - headerHeight) / candidates.length);
  // Adjusted font size calculation to be more generous in the middle range
  const fontSize = $derived(Math.min(2.5, Math.max(1, 8 / candidates.length)));
</script>

<div class="card">
  {#if report?.info && candidates.length > 0}
    <div class="header" style="height: {headerHeight}px">
      <canvas bind:this={qrCanvas} width="120" height="120" class="qr-code"></canvas>
      <div class="header-content">
        <div class="brand">Approval.Vote</div>
        <div class="election-info">
          <div class="jurisdiction">{report.info.jurisdictionName}</div>
          {#if report.info.officeName !== report.info.jurisdictionName}
            <div class="office">{report.info.officeName}</div>
          {/if}
          <div class="election">
            {report.info.electionName} ({report.info.date.slice(0, 4)})
          </div>
        </div>
      </div>
    </div>
    <div class="results">
      {#each candidates as candidate, i}
        <div class="result-row" style="height: {rowHeight}px; font-size: {fontSize}rem;">
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
    height: 630px;
    background: white;
    position: relative;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
  }

  .header {
    padding: 1rem 2rem;
    background: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    flex-shrink: 0;
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 2rem;
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
    padding: 0 2rem;
    color: #666;
  }

  .winner-stats.winner {
    color: #437527;
  }

  .brand {
    font-size: 3.5em;
    font-weight: 800;
    color: #437527;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    flex-shrink: 0;
    line-height: 1;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }

  .election-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    justify-content: center;
    padding-left: 1rem;
    border-left: 3px solid #437527;
  }

  .jurisdiction {
    font-size: 1.9em;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 0.3rem;
    letter-spacing: -0.01em;
    line-height: 1.2;
  }

  .office {
    font-size: 1.35em;
    font-weight: 500;
    color: #2d2d2d;
    margin-bottom: 0.3rem;
    letter-spacing: 0.01em;
    line-height: 1.3;
  }

  .election {
    font-size: 1.15em;
    font-weight: 400;
    color: #666;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    font-size: 0.95em;
    opacity: 0.85;
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

  .qr-code {
    position: absolute;
    top: 1rem;
    right: 1rem;
    opacity: 0.5;
  }
</style>
