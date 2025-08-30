<script lang="ts">
  import type { IVotingPatterns } from '$lib/server/report_types';
  
  import tippy from 'tippy.js';
  import type { Props as TippyProps } from 'tippy.js';
  import { followCursor } from 'tippy.js';
  import 'tippy.js/themes/light-border.css';
  import 'tippy.js/dist/tippy.css';

  interface Props {
    candidates: string[];
    votingPatterns: IVotingPatterns;
  }

  let { candidates, votingPatterns }: Props = $props();

  function tooltip(elem: Element, content: string | null): void {
    if (content === null) {
      return;
    }
    let props: TippyProps = {
      ...({} as any as TippyProps),
      content,
      allowHTML: true,
      theme: 'light-border',
      plugins: [followCursor],
      followCursor: true,
    };
    tippy(elem, props);
  }

  // Chart dimensions (same as VoteCounts)
  const outerHeight = 24;
  const innerHeight = 14;
  const labelSpace = 130;
  const width = 600;

  // Calculate Anyone But data
  const chartData = $derived(() => {
    if (!votingPatterns?.anyoneButAnalysis) return null;
    
    const totalExclusions = Object.values(votingPatterns.anyoneButAnalysis).reduce((sum, count) => sum + count, 0);
    const totalBallots = votingPatterns.totalBallots || 0;
    
    if (totalExclusions === 0) return null;
    
    // Create data array and sort by exclusion count (descending)
    const data = candidates.map(candidateName => ({
      name: candidateName,
      exclusionCount: votingPatterns.anyoneButAnalysis![candidateName] || 0,
      exclusionRate: totalExclusions > 0 ? ((votingPatterns.anyoneButAnalysis![candidateName] || 0) / totalExclusions) * 100 : 0,
      overallRate: totalBallots > 0 ? ((votingPatterns.anyoneButAnalysis![candidateName] || 0) / totalBallots) * 100 : 0
    })).sort((a, b) => b.exclusionCount - a.exclusionCount);
    
    const maxExclusions = Math.max(...data.map(d => d.exclusionCount));
    const scale = (width - labelSpace - 50) / maxExclusions;
    
    return {
      data,
      totalExclusions,
      totalBallots,
      maxExclusions,
      scale
    };
  });

  const height = $derived(() => {
    const data = chartData();
    return data ? outerHeight * data.data.length : 0;
  });
</script>

{#if chartData()}
  {@const data = chartData()}
  <div class="anyone-but-chart">
    <div class="chart-title">Anyone but...</div>
    <svg width="100%" viewBox={`0 0 ${width} ${height()}`}>
      <g transform={`translate(${labelSpace} 0)`}>
        {#each data.data as candidate, i}
          <g transform={`translate(0 ${outerHeight * (i + 0.5)})`}>
            <text font-size="90%" text-anchor="end" dominant-baseline="middle">
              {candidate.name}
            </text>
            <g transform={`translate(5 ${-innerHeight / 2 - 1})`}>
              <rect
                class="exclusions"
                height={innerHeight}
                width={data.scale * candidate.exclusionCount}
                use:tooltip={`<strong>${candidate.name}</strong> was excluded by <strong>${candidate.exclusionCount.toLocaleString()}</strong> voters who approved all other candidates, ${candidate.overallRate.toFixed(1)}% of all ballots cast.`}
              />
            </g>
            <text font-size="90%" dominant-baseline="middle" x={10 + data.scale * candidate.exclusionCount}>
              {candidate.exclusionRate.toFixed(1)}%
            </text>
          </g>
        {/each}
      </g>
    </svg>
  </div>
{:else}
  <div class="no-data">
    No "Anyone But" voting patterns detected (no ballots with exactly N-1 approvals)
  </div>
{/if}

<style>
  .anyone-but-chart {
    padding-top: 30px;
  }
  
  .chart-title {
    font-size: 10pt;
    font-weight: bold;
    text-align: center;
    margin-bottom: 15px;
    color: #666;
  }
  
  /* Same styling as VoteCounts */
  .exclusions {
    fill: #437527;
  }
  
  .no-data {
    text-align: center;
    color: #666;
    font-style: italic;
    padding: 20px;
    font-size: 10pt;
  }

  @media (prefers-color-scheme: dark) {
    .chart-title {
      color: #b0b0b0;
    }

    .no-data {
      color: #999;
    }

    text {
      fill: #e0e0e0;
    }
  }
</style>
