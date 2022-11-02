<script>
  import VoteCounts from '../../../src/components/report_components/VoteCounts.svelte';
import { base } from '$app/paths';



let FargoApproves = {
  "info": {
    "name": "Prop D",
    "date": "2020-11-03",
    "jurisdictionPath": "us/mo/stl",
    "electionPath": "2020/11",
    "office": "Prop D",
    "officeName": "Prop D",
    "jurisdictionName": "St Louis, MO",
    "electionName": "Prop D",
    "website": "https://www.stlouis-mo.gov/government/departments/board-election-commissioners/documents/election-results/upload/Nov20-Final-Official-Summary.pdf",
    "notes": ""
  },
  "ballotCount": 128202,
  "candidates": [
    {
      "name": "No",
      "votes": 87369,
      "winner": true
    },
    {
      "name": "Yes",
      "votes": 40833	,
      "winner": false
    }
  ],
  "winners": [0],
  "numberOfWinners": 1,
  "condorcet": 0,
  "numCandidates": 2
}



</script>

<title>About approval.vote</title>

<div class="container">
<div class="description">
  <h1>About <a href="{base}/">approval.vote</a></h1>
</div>

<p>
  <a href="https://en.wikipedia.org/wiki/Approval_Voting">
    Approval Voting elections
  </a>
  produce a lot of data about voter preferences. Typically, this information is
  made available by election boards in specialized file formats and requires
  processing to interpret. The purpose of approval.vote is to increase transparency into these
  elections by creating detailed and intuitive reports about them.
</p>

<p>
  Approval voting is a voting system that allows voters to vote for as many
  candidates as they like. It is a simple and intuitive system that
  produces results that are easy to understand and verify.
</p>

<p>
  All reports are generated from the raw ballot data, rather than using the
  official tabulation. As a result, the reports also serve as an independent
  tabulation of the results that can be reproduced using published source code.
</p>

<p>
  approval.vote is maintained by
   <a href="https://felixsargent.com">Felix Sargent</a>. It is a fork from the original work of <a href="https://paulbutler.org">Paul Butler's</a> <a href="https://ranked.vote">ranked.vote</a>.
  It is non-partisan and has received no outside funding.
</p>

<h2>License</h2>

<p>
  This website and the data pipeline behind it (including the tabulator) are
  <a href="https://github.com/electionscience/approval-vote">open source</a> and liberally licensed. Website content and generated reports may
  be freely distributed with attribution under the <a href="https://creativecommons.org/licenses/by/2.0/">CC-BY</a> license.
</p>

<h2>Colophon</h2>

<p>
  This website, including
  visualizations, was created with <a href="https://svelte.dev/">Svelte</a>, and is hosted on <a href="https://github.com/electionscience/approval-vote">Github Pages</a>.
  The font is <a href="https://github.com/adobe-fonts/source-sans-pro">Source Sans Pro</a>.
</p>

</div>
