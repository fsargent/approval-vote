<script type="ts">
  import type { ICandidate, IContestReport } from "$lib/server/report_types";
  export let report: IContestReport;

  import tippy from 'tippy.js';
  import type { Props } from 'tippy.js';
  import { followCursor } from 'tippy.js';
  import 'tippy.js/themes/light-border.css';
  import 'tippy.js/dist/tippy.css';

  function tooltip(elem: Element, content: string | null): void {
    if (content === null) {
      return;
    }
    let props: Props = {
      ...({} as any as Props),
      content,
      allowHTML: true,
      theme: 'light-border',
      plugins: [followCursor],
      followCursor: true,
    };
    tippy(elem, props);
  }

  const outerHeight = 24;
  const innerHeight = 14;
  const labelSpace = 130;
  const width = 600;

  const candidates: ICandidate[] = report.candidates;
  const maxVotes: number = Math.max(
    ...candidates.map((candidate) => candidate.votes)
  );
  const ballotsCast: number = report.ballotCount;
  const scale = (width - labelSpace - 50) / maxVotes;

  const height = outerHeight * candidates.length;
</script>

<svg width="100%" viewBox={`0 0 ${width} ${height}`}>
  <g transform={`translate(${labelSpace} 0)`}>
    {#each candidates as candidate, i}
      <g
        class={candidate.winner === true ? '' : 'eliminated'}
        transform={`translate(0 ${outerHeight * (i + 0.5)})`}
      >
        <text font-size="90%" text-anchor="end" dominant-baseline="middle">
          {candidate.name}
        </text>
        <g transform={`translate(5 ${-innerHeight / 2 - 1})`}>
          <rect
            class="votes"
            height={innerHeight}
            width={scale * candidate.votes}
            use:tooltip={`<strong>${candidate.name}</strong>
            received <strong>${candidate.votes.toLocaleString()}</strong> votes, ${(
              (candidate.votes / ballotsCast) *
              100
            ).toFixed(1)}% of the total ballots cast.</g>`}
          />
        </g>
        <text
          font-size="90%"
          dominant-baseline="middle"
          x={10 + scale * candidate.votes}
        >
          {((candidate.votes / ballotsCast) * 100).toFixed(1)}%</text
        >
      </g>
    {/each}
  </g>
</svg>

<style>
  .votes {
    fill: #437527;
  }

  .eliminated {
    opacity: 30%;
  }
</style>
