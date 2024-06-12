<script lang='ts'>
  import { base } from '$app/paths';
  export let data;
  let report: IContestReport = data.report;
  import VoteCounts from '$lib/components/report_components/VoteCounts.svelte';
  import type { IContestReport } from "$lib/report_types";
</script>

<svelte:head>
  <link rel="stylesheet" href="{base}/card.css" />
</svelte:head>

<div class="card">
  <div class="electionHeader">
    <h1>
      <a href="{base}/">approval.vote</a>
      //
      <strong>{report.info.jurisdictionName}</strong>
      {report.info.officeName}
    </h1>
  </div>

  <div class="segment">
    <VoteCounts report={report} />
  </div>
</div>
