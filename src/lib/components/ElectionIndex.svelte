<script type="ts">
  import { base } from '$app/paths';
  import { getIndex } from '$lib/reports';
  import type { IElectionIndexEntry } from "$lib/report_types";

  let index = getIndex();
  let electionsByYear = new Map<number, IElectionIndexEntry[]>();

  index.elections.forEach((e) => {
    let year = parseInt(e.date.split('-')[0]);
    if (!electionsByYear.has(year)) {
      electionsByYear.set(year, []);
    }
    electionsByYear.get(year)?.push(e);
  });

  electionsByYear = new Map([...electionsByYear].sort((a, b) => b[0] - a[0]));
</script>

{#each [...electionsByYear] as [year, elections]}
  <div class="yearSection">
    <h2>{year}</h2>
    <div class="electionSection">
      {#each elections as election}
        <div class="electionHeader">
          <h3>
            <strong>{election.jurisdictionName}</strong>
            {election.electionName}
          </h3>
        </div>
        {#each election.contests as contest}
          <div class="race">
            <a href="{base}/report/{election.path}/{contest.office}">
              <div class="title">
                <strong>{contest.officeName}</strong>
                {contest.winners}
              </div>
              <div class="meta">
                <strong>{contest.numCandidates}</strong>
                candidates
              </div>
            </a>
          </div>
        {/each}
      {/each}
    </div>
  </div>
{/each}
