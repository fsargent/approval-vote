<script lang="ts">
  import type { ICoApprovalData, IVotingPatterns } from '$lib/server/report_types';
  import tooltip from '$lib/tooltip';

  interface Props {
    coApprovals: ICoApprovalData[];
    candidates: string[];
    votingPatterns?: IVotingPatterns;
  }

  let { coApprovals, candidates, votingPatterns }: Props = $props();

  // Sort candidates by vote count (descending) for consistent ordering
  const sortedCandidates = $derived(() => {
    if (votingPatterns?.candidateApprovalDistributions) {
      const candidatesWithVotes = candidates.map(candidateName => {
        const candidateDistribution = votingPatterns.candidateApprovalDistributions?.[candidateName];
        const candidateVotes = candidateDistribution
          ? Object.values(candidateDistribution).reduce((sum, count) => sum + count, 0)
          : 0;
        return { name: candidateName, votes: candidateVotes };
      }).sort((a, b) => b.votes - a.votes);
      return candidatesWithVotes.map(c => c.name);
    } else {
      return [...candidates];
    }
  });

  // Build matrix data structure
  interface MatrixEntry {
    frac: number;
    numerator: number;
    denominator: number;
  }

  const matrixData = $derived(() => ({
    rows: sortedCandidates().map((_, i) => i),
    cols: sortedCandidates().map((_, i) => i),
    entries: sortedCandidates().map((candA, i) =>
      sortedCandidates().map((candB, j) => {
        if (i === j) return null;

        const entry = coApprovals.find(ca =>
          ca.candidateA.toLowerCase() === candA.toLowerCase() &&
          ca.candidateB.toLowerCase() === candB.toLowerCase()
        );

        return entry ? {
          frac: entry.coApprovalRate / 100, // Convert percentage to fraction for color calculation
          numerator: entry.coApprovalCount,
          denominator: Math.round(entry.coApprovalCount / (entry.coApprovalRate / 100))
        } : null;
      })
    )
  }));

  const maxFrac = $derived(() => {
    let max = 0;
    matrixData().entries.forEach(row => {
      row.forEach(entry => {
        if (entry && entry.frac > max) {
          max = entry.frac;
        }
      });
    });
    return max;
  });

  // Color function adapted from ranked.vote but using green theme
  function smooth(low: number, high: number, frac: number): number {
    return low * (1 - frac) + high * frac;
  }

  function fracToColor(frac: number): string {
    const normalizedFrac = maxFrac() > 0 ? frac / maxFrac() : 0;
    // Use #437527 as base color and vary lightness
    const lightness = smooth(97, 65, normalizedFrac); // From very light to medium
    return `hsl(99, 41%, ${lightness}%)`; // Green hue with varying lightness
  }

  function generateTooltip(candA: string, candB: string, entry: MatrixEntry): string {
    const percentage = (entry.frac * 100).toFixed(1);
    return `${percentage}% of ${candA} voters also approved ${candB} (${entry.numerator.toLocaleString()} of ${entry.denominator.toLocaleString()})`;
  }
</script>

<table>
  <tbody>
    <tr>
      <td></td>
      <td class="colsLabel" colspan={sortedCandidates().length}>Also approved</td>
    </tr>
    <tr>
      <td class="rowsLabel" rowspan={sortedCandidates().length + 1}><div>Approved</div></td>
      <td></td>
      {#each sortedCandidates() as candidate, j}
        <td class="colLabel">
          <div>{candidate}</div>
        </td>
      {/each}
    </tr>
    {#each sortedCandidates() as candidateA, i}
      <tr>
        <td class="rowLabel">{candidateA}</td>
        {#each sortedCandidates() as candidateB, j}
          {@const entry = matrixData().entries[i][j]}
          <td
            class="entry"
            use:tooltip={entry ? generateTooltip(candidateA, candidateB, entry) : null}
            style={entry ? `background: ${fracToColor(entry.frac)}` : ''}>
            {#if entry}
              {Math.round(entry.frac * 1000) / 10}%
            {:else}
              —
            {/if}
          </td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>

<style>
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
</style>
