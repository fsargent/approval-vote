<script type="ts">
  import { base } from '$app/paths'
  import type { IElectionIndexEntry } from '$lib/server/report_types'
  /** @type {import('./$types').PageData} */
  export let data
  let index = data.index
</script>

<title>approval.vote: detailed reports on approval voting elections.</title>

<div class="wide container">
  <div class="row">
    <div class="leftCol">
      <div class="description">
        <h1>approval.vote</h1>
        : detailed reports on approval voting elections.
      </div>
      <p>
        In an <a href="https://en.wikipedia.org/wiki/Approval_Voting">
          Approval Voting election</a
        > voters can pick all the candidates that they like, which produces more
        data on voter preferences than pick-one elections.
      </p>

      <p>
        <strong>approval.vote</strong> is a project of
        <a href="https://felixsargent.com">Felix Sargent</a>. It is a fork of
        <a href="https://paulbutler.org">Paul Butler's</a>
        <a href="https://ranked.vote">ranked.vote</a>. It is non-partisan and
        has received no outside funding. For more information, see
        <a href="{base}/about">the about page</a>.
      </p>
    </div>

    <div class="rightCol">
      {#each [...index] as [year, elections]}
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
                  <div class="race-content">
                    <div class="title">
                      <strong>{contest.officeName}</strong>
                      {#each contest.winners as winner, i}
                        <span class="winner">{winner}{i == contest.winners.length-1 ? '' : ', '}</span>
                      {/each}
                    </div>
                    <div class="meta">
                      <strong>{contest.numCandidates}</strong> candidates
                    </div>
                  </div>
                </a>
              </div>
              {/each}
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
