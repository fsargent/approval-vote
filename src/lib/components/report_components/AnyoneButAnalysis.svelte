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
    
    const totalBallots = votingPatterns.totalBallots || 0;
    
    // Create data array and sort by exclusion count (descending)
    const data = candidates.map(candidateName => {
      const analysis = votingPatterns.anyoneButAnalysis![candidateName];
      if (!analysis || typeof analysis === 'number') {
        // Legacy format: just a number
        const exclusionCount = typeof analysis === 'number' ? analysis : 0;
        return {
          name: candidateName,
          exclusionCount,
          exclusionRate: totalBallots > 0 ? (exclusionCount / totalBallots) * 100 : 0,
          overallRate: totalBallots > 0 ? (exclusionCount / totalBallots) * 100 : 0
        };
      } else {
        // New format: object with exclusionCount, exclusionRate, overallRate
        return {
          name: candidateName,
          exclusionCount: analysis.exclusionCount || 0,
          exclusionRate: (analysis.exclusionRate || 0) * 100, // Convert from decimal to percentage
          overallRate: (analysis.overallRate || 0) * 100 // Convert from decimal to percentage
        };
      }
    }).sort((a, b) => b.exclusionCount - a.exclusionCount);
    
    const totalExclusions = data.reduce((sum, item) => sum + item.exclusionCount, 0);
    
    if (totalExclusions === 0) return null;
    
    // Scale based on 100% of total ballots (same as VoteCounts)
    const scale = (width - labelSpace - 50) / totalBallots;
    
    return {
      data,
      totalExclusions,
      totalBallots,
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
        <!-- 100% reference line -->
        <line
          x1={data.scale * data.totalBallots}
          y1={0}
          x2={data.scale * data.totalBallots}
          y2={height()}
          stroke="#666"
          stroke-width="1"
          stroke-dasharray="2,2"
          opacity="0.5"
        />
        {#each data.data as candidate, i}
          {@const tooltipContent = `<strong>${candidate.name}</strong><br/>
              <strong>${candidate.exclusionCount.toLocaleString()}</strong> ballots excluded this candidate<br/>
              ${candidate.overallRate.toFixed(1)}% of all ballots cast`}
          <g transform={`translate(0 ${outerHeight * (i + 0.5)})`}>
            <text
              font-size="90%"
              text-anchor="end"
              dominant-baseline="middle"
              use:tooltip={tooltipContent}
            >
              {candidate.name}
            </text>
            <g transform={`translate(5 ${-innerHeight / 2 - 1})`}>
              <rect
                class="exclusions"
                height={innerHeight}
                width={data.scale * candidate.exclusionCount}
                use:tooltip={tooltipContent}
              />
            </g>
            <text font-size="90%" dominant-baseline="middle" x={10 + data.scale * candidate.exclusionCount}>
              {candidate.overallRate.toFixed(1)}%
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
