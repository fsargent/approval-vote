<script lang="ts">
  import type { IVotingPatterns } from '$lib/server/report_types';
  import tooltip from '$lib/tooltip';

  interface Props {
    candidates: string[];
    votingPatterns: IVotingPatterns;
  }

  let { candidates, votingPatterns }: Props = $props();

  interface ApprovalMatrixRow {
    candidateName: string;
    isOverall: boolean;
    totalVoters: number;
    distributions: { [approvals: number]: { count: number; percentage: number } };
  }

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

  // Calculate approval matrix data as derived state
  const approvalMatrix = $derived(() => {
    const matrix: ApprovalMatrixRow[] = [];
    
    if (votingPatterns?.approvalDistribution && votingPatterns?.candidateApprovalDistributions) {
      // First, add the overall row
      const overallDistributions: { [approvals: number]: { count: number; percentage: number } } = {};
      const totalBallots = votingPatterns.totalBallots;
      Object.entries(votingPatterns.approvalDistribution).forEach(([approvals, count]) => {
        const approvalsNum = parseInt(approvals);
        overallDistributions[approvalsNum] = {
          count: count as number,
          percentage: ((count as number) / totalBallots) * 100
        };
      });

      matrix.push({
        candidateName: 'All Candidates',
        isOverall: true,
        totalVoters: totalBallots,
        distributions: overallDistributions
      });

      // Then add candidate-specific rows (already sorted by vote count)
      for (const candidateName of sortedCandidates()) {
        const candidateDistribution = votingPatterns.candidateApprovalDistributions[candidateName];
        
        if (!candidateDistribution) continue;
        
        // Calculate total voters for this candidate
        const totalVoters = Object.values(candidateDistribution).reduce((sum, count) => sum + count, 0);
        
        // Convert raw counts to percentage format
        const distributions: { [approvals: number]: { count: number; percentage: number } } = {};
        Object.entries(candidateDistribution).forEach(([approvals, count]) => {
          const approvalsNum = parseInt(approvals);
          distributions[approvalsNum] = {
            count: count,
            percentage: (count / totalVoters) * 100
          };
        });

        matrix.push({
          candidateName,
          isOverall: false,
          totalVoters,
          distributions
        });
      }
    }
    
    return matrix;
  });

  // Calculate max approvals as derived state
  const maxApprovals = $derived(() => {
    let max = 0;
    if (votingPatterns?.approvalDistribution) {
      Object.keys(votingPatterns.approvalDistribution).forEach(approvals => {
        max = Math.max(max, parseInt(approvals));
      });
    }
    return max;
  });

  // Generate tooltip content for matrix cells
  function generateMatrixCellTooltip(row: ApprovalMatrixRow, numApprovals: number): string {
    const data = row.distributions[numApprovals];
    if (!data) return '';
    
    return `${row.candidateName}: ${data.count.toLocaleString()} voters (${data.percentage.toFixed(1)}%) approved exactly ${numApprovals} candidate${numApprovals !== 1 ? 's' : ''}`;
  }


</script>

{#if approvalMatrix().length > 0}
{@const matrix = approvalMatrix()}
{@const maxApps = maxApprovals()}
<table>
  <tbody>
    <tr>
      <td></td>
      <td class="colsLabel" colspan={maxApps + 1}>Number of Candidates Approved</td>
    </tr>
    <tr>
      <td class="rowsLabel" rowspan={matrix.length + 1}><div>Candidate</div></td>
      <td></td>
      {#each Array.from({length: maxApps}, (_, i) => i + 1) as numApprovals}
        <td class="colLabel approval-col-label">
          <div>{numApprovals}</div>
        </td>
      {/each}
    </tr>
    {#each matrix as row, i}
      <tr class={row.isOverall ? 'overall-separator' : ''}>
        <td class="rowLabel">
          {row.candidateName}
          <div class="voter-count">({row.totalVoters.toLocaleString()} voters)</div>
        </td>
        {#each Array.from({length: maxApps}, (_, i) => i + 1) as numApprovals}
          <td
            class="entry"
            use:tooltip={row.distributions[numApprovals] ? generateMatrixCellTooltip(row, numApprovals) : null}
            style={row.distributions[numApprovals]
              ? `--percentage: ${row.distributions[numApprovals].percentage}`
              : ''}>
            {#if row.distributions[numApprovals]}
              {row.distributions[numApprovals].percentage.toFixed(1)}%
            {:else}
              —
            {/if}
          </td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>
{/if}

<style>
  /* Approval Distribution Matrix - based on ranked.vote style */
  table {
    font-size: 8pt;
    margin: auto;
    cursor: default;
  }

  .colLabel div {
    /* Keep column headers horizontal for approval distribution */
    margin: auto;
  }

  .colLabel {
    vertical-align: bottom;
  }

  .rowLabel {
    text-align: right;
  }

  .voter-count {
    font-size: 7pt;
    color: #666;
    margin-top: 2px;
  }

  .entry {
    height: 40px;
    width: 40px;
    font-size: 8pt;
    vertical-align: middle;
    text-align: center;
    color: black;
    /* Light mode: 0% = light background (95%), 100% = theme green (40%) */
    background: hsl(99, 41%, calc(95% - var(--percentage, 0) * 0.55%));
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

  /* Add spacing after "All Candidates" row */
  .overall-separator {
    border-bottom: 4px solid white;
  }

  .overall-separator td {
    border-bottom: 4px solid white;
  }

  /* Keep column headers horizontal for approval distribution */
  .approval-col-label div {
    transform: none;
    writing-mode: initial;
    text-align: center;
    margin: auto;
  }

  @media (prefers-color-scheme: dark) {
    .entry {
      color: white;
      /* Dark mode: 0% = dark background (15%), 100% = theme green (50%) */
      background: hsl(99, 41%, calc(15% + var(--percentage, 0) * 0.35%));
    }

    .voter-count {
      color: #999;
    }

    .colsLabel,
    .rowsLabel {
      color: #e0e0e0;
    }

    table {
      color: #e0e0e0;
    }

    .colLabel,
    .rowLabel {
      color: #e0e0e0;
    }

    .overall-separator {
      border-bottom-color: #1a1a1a;
    }

    .overall-separator td {
      border-bottom-color: #1a1a1a;
    }
  }
</style>
