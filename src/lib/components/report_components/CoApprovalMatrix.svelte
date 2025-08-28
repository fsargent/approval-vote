<script lang="ts">
  import type { ICoApprovalData, IVotingPatterns } from '$lib/server/report_types';
  import tooltip from '$lib/tooltip';
  
  interface Props {
    coApprovals: ICoApprovalData[];
    candidates: string[];
    votingPatterns?: IVotingPatterns;
    type: 'chart' | 'matrix';
  }
  
  let { coApprovals, candidates, votingPatterns, type }: Props = $props();
  
  // Build matrix data structure to match ranked.vote's CandidatePairTable format
  interface MatrixEntry {
    frac: number;
    numerator: number;
    denominator: number;
  }
  
  const matrixData = {
    rows: candidates.map((_, i) => i),
    cols: candidates.map((_, i) => i),
    entries: candidates.map((candA, i) => 
      candidates.map((candB, j) => {
        if (i === j) return null;
        
        const entry = coApprovals.find(ca => 
          ca.candidateA.toLowerCase() === candA.toLowerCase() && 
          ca.candidateB.toLowerCase() === candB.toLowerCase()
        );
        
        return entry ? {
          frac: entry.coApprovalRate / 100,
          numerator: entry.coApprovalCount,
          denominator: Math.round(entry.coApprovalCount / (entry.coApprovalRate / 100))
        } : null;
      })
    )
  };

  // Create approval distribution data for bar chart
  let approvalDistribution = $state<{ approvals: number; count: number; percentage: number }[]>([]);
  if (votingPatterns?.approvalDistribution) {
    const totalBallots = votingPatterns.totalBallots;
    approvalDistribution = Object.entries(votingPatterns.approvalDistribution)
      .map(([approvals, count]) => ({
        approvals: parseInt(approvals),
        count: count as number,
        percentage: (count as number / totalBallots) * 100
      }))
      .sort((a, b) => a.approvals - b.approvals);
  }

  // Color function adapted from ranked.vote but using green theme
  function smooth(low: number, high: number, frac: number): number {
    return low * (1 - frac) + high * frac;
  }

  let maxFrac = Math.max(
    ...matrixData.entries.map((row) => Math.max(...row.map((d) => (d ? d.frac : 0))))
  );

  function fracToColor(frac: number): string {
    frac = frac / maxFrac;
    // Use #437527 as base color and vary lightness
    const baseColor = '#437527';
    // Convert to lighter/darker versions based on frac
    const lightness = smooth(97, 65, frac); // From very light to medium
    return `hsl(99, 41%, ${lightness}%)`; // Green hue with varying lightness
  }

  function getCandidate(index: number) {
    return { name: candidates[index] };
  }

  function generateTooltip(row: number, col: number, entry: MatrixEntry): string {
    return `
      Of the <strong>${entry.denominator.toLocaleString()}</strong> voters
      who approved <strong>${candidates[row]}</strong>, <strong>${Math.round(entry.frac * 1000) / 10}%</strong>
      (<strong>${entry.numerator.toLocaleString()}</strong>) also approved
      <strong>${candidates[col]}</strong>.
    `;
  }

  function generateBarTooltip(item: any): string {
    return `<strong>${item.percentage.toFixed(1)}%</strong> (<strong>${item.count.toLocaleString()}</strong> ballots) approved <strong>${item.approvals}</strong> candidate${item.approvals !== 1 ? 's' : ''}.`;
  }
</script>

{#if type === 'chart' && approvalDistribution.length > 0}
<!-- Approval Distribution Chart -->
<div class="chart-container">
  {#each approvalDistribution as item}
    <div class="bar-container">
      <div 
        class="bar" 
        style="height: {Math.max(2, item.percentage * 3)}px;"
        use:tooltip={generateBarTooltip(item)}>
        <div class="bar-label">{item.percentage.toFixed(1)}%</div>
      </div>
      <div class="bar-axis-label">
        {item.approvals} candidate{item.approvals !== 1 ? 's' : ''}
      </div>
    </div>
  {/each}
</div>
{:else if type === 'matrix'}
<!-- Co-Approval Matrix using ranked.vote's table structure -->
<table>
  <tbody>
    <tr>
      <td></td>
      <td class="colsLabel" colspan={matrixData.cols.length + 1}>Also Approved Candidate</td>
    </tr>
    <tr>
      <td class="rowsLabel" rowspan={matrixData.rows.length + 1}><div>Approved Candidate</div></td>
      <td></td>
      {#each matrixData.cols as col}
        <td class="colLabel">
          <div>{getCandidate(col).name}</div>
        </td>
      {/each}
    </tr>
    {#each matrixData.rows as row, i}
      <tr>
        <td class="rowLabel">{getCandidate(row).name}</td>
        {#each matrixData.entries[i] as entry, j}
          <td
            use:tooltip={(entry) ? generateTooltip(row, matrixData.cols[j], entry) : null}
            class="entry"
            style={entry ? `background: ${fracToColor(entry.frac)}` : ''}>
            {#if entry}{Math.round(entry.frac * 1000) / 10}%{/if}
          </td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>
{/if}

<style>
  /* Approval Distribution Bar Chart */
  
  .chart-container {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 8px;
    padding: 1rem;
    min-height: 200px;
  }
  
  .bar-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 60px;
  }
  
  .bar {
    background-color: #437527;
    min-height: 2px;
    width: 40px;
    position: relative;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    transition: all 0.3s ease;
  }
  
  .bar:hover {
    background-color: #3a6622;
  }
  
  .bar-label {
    position: absolute;
    top: -25px;
    font-size: 8pt;
    font-weight: 600;
    color: #333;
    white-space: nowrap;
  }
  
  .bar-axis-label {
    margin-top: 8px;
    font-size: 7pt;
    color: #666;
    text-align: center;
    line-height: 1.2;
  }

  /* Co-Approval Matrix - exact ranked.vote style */
  table {
    font-size: 8pt;
    margin: auto;
    cursor: default;
  }

  .colLabel div {
    transform: rotate(180deg);
    writing-mode: vertical-lr;
    margin: auto;
  }

  .colLabel {
    vertical-align: bottom;
  }

  .rowLabel {
    text-align: right;
  }

  .entry {
    height: 40px;
    width: 40px;
    font-size: 8pt;
    vertical-align: middle;
    text-align: center;
    color: black;
  }

  .colsLabel {
    text-align: center;
    font-size: 10pt;
    font-weight: bold;
    padding-bottom: 20px;
  }

  .rowsLabel {
    font-size: 10pt;
    font-weight: bold;
    padding-right: 20px;
  }

  .rowsLabel div {
    transform: rotate(180deg);
    writing-mode: vertical-lr;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .chart-container {
      gap: 4px;
    }
    
    .bar-container {
      min-width: 40px;
    }
    
    .bar {
      width: 30px;
    }
  }
</style>
