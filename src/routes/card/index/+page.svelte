<script lang="ts">
  import { resolve } from '$app/paths';
  import type { IElectionIndexEntry } from '$lib/server/report_types';
  import QRCode from 'qrcode';
  import { onMount } from 'svelte';

  interface Props {
    data: { index: Map<string, IElectionIndexEntry[]> };
  }

  let { data }: Props = $props();
  const indexArray = $derived(Array.from(data.index));

  // Calculate total statistics
  const stats = $derived(indexArray.reduce(
    (acc, [_, elections]) => {
      elections.forEach((election) => {
        election.contests.forEach((contest) => {
          acc.totalRaces++;
          acc.totalApprovals += contest.sumVotes || 0;
          acc.totalBallots += contest.ballotCount || 0;
        });
      });
      return acc;
    },
    { totalRaces: 0, totalApprovals: 0, totalBallots: 0 }
  ));

  const totalRaces = $derived(stats.totalRaces);
  const totalApprovals = $derived(stats.totalApprovals);
  const totalBallots = $derived(stats.totalBallots);
  const avgApprovalsPerBallot = $derived(
    totalBallots > 0 ? (totalApprovals / totalBallots).toFixed(1) : '0.0'
  );

  let qrCanvas = $state<HTMLCanvasElement | undefined>(undefined);

  onMount(() => {
    if (!qrCanvas) return;
    const url = `https://approval.vote/`;
    QRCode.toCanvas(qrCanvas, url, {
      width: 80,
      margin: 1,
      color: {
        dark: '#666666',
        light: '#ffffff',
      },
    });
  });
</script>

<div class="card">
  <div class="header">
    <div class="watermark">approval.vote</div>
      <canvas bind:this={qrCanvas} width="80" height="80" class="qr-code"></canvas>
    <div class="title">approval.vote</div>
    <div class="subtitle">Detailed reports on approval voting elections</div>
  </div>
  <div class="stats">
    <div class="stat-row">
      <div class="stat-label">Total Races</div>
      <div class="stat-value">{totalRaces.toLocaleString()}</div>
    </div>
    <div class="stat-row">
      <div class="stat-label">Total Ballots</div>
      <div class="stat-value">{totalBallots.toLocaleString()}</div>
    </div>
    <div class="stat-row">
      <div class="stat-label">Total Approvals</div>
      <div class="stat-value">{totalApprovals.toLocaleString()}</div>
    </div>
    <div class="stat-row highlight">
      <div class="stat-label">Avg Approvals per Ballot</div>
      <div class="stat-value">{avgApprovalsPerBallot}</div>
    </div>
  </div>
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
    padding: 1.5rem 2rem;
    text-align: center;
    background: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    border-bottom: 2px solid #437527;
    flex-shrink: 0;
  }

  .title {
    font-size: 2.5em;
    font-weight: bold;
    color: #437527;
    margin-bottom: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .subtitle {
    font-size: 1.2em;
    color: #666;
  }

  .stats {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    padding: 1.5rem 3rem;
    gap: 1rem;
    overflow: hidden;
  }

  .stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #f9f9f9;
    border-radius: 8px;
    border-left: 4px solid #437527;
    flex-shrink: 0;
  }

  .stat-row.highlight {
    background: #f0f7ed;
    border-left-width: 6px;
  }

  .stat-label {
    font-size: 1.2em;
    color: #333;
    font-weight: 600;
  }

  .stat-value {
    font-size: 2em;
    font-weight: bold;
    color: #437527;
  }

  .watermark {
    position: absolute;
    top: 0.75rem;
    left: 1rem;
    font-size: 0.7rem;
    color: #666;
    opacity: 0.4;
    font-style: italic;
  }

  .qr-code {
    position: absolute;
    top: 0.75rem;
    right: 1rem;
    opacity: 0.4;
    width: 80px;
    height: 80px;
  }
</style>
