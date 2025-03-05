<script lang="ts">
  import { base } from "$app/paths";
  import VoteCounts from "$lib/components/report_components/VoteCounts.svelte";
  import type { IContestReport } from "$lib/server/report_types";

  interface Props {
    data: import("./$types").PageData;
  }

  let { data } = $props();
  let report: IContestReport = data.report;
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
    <VoteCounts {report} />
  </div>
</div>
