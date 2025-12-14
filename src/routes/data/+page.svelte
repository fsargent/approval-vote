<script lang="ts">
  import { onMount } from 'svelte';

  let datasetteLoaded = $state(false);
  let iframeRef: HTMLIFrameElement;

  onMount(() => {
    // Datasette Lite loads asynchronously
    datasetteLoaded = true;
  });
</script>

<svelte:head>
  <title>Database Explorer - approval.vote</title>
  <meta
    name="description"
    content="Explore the approval.vote election database using Datasette Lite"
  />
</svelte:head>

<div class="container">
  <h1>Database Explorer</h1>
  <p>
    Explore the approval.vote election database using Datasette Lite. This is a client-side SQLite
    explorer that runs entirely in your browser.
  </p>

  {#if datasetteLoaded}
    <iframe
      bind:this={iframeRef}
      src="https://lite.datasette.io/?url=https://approval.vote/data.sqlite3"
      style="width: 100%; height: 800px; border: 1px solid #ddd; border-radius: 4px;"
      title="Datasette Lite Database Explorer"
    ></iframe>
  {:else}
    <div class="loading">Loading Datasette Lite...</div>
  {/if}

  <div class="info">
    <h2>About this database</h2>
    <p>
      This database contains election reports, candidate vote counts, co-approval matrices, and
      voting pattern analysis for approval voting elections.
    </p>
    <p>
      <strong>Note:</strong> Datasette Lite downloads the entire database file to your browser. The
      database is approximately 41KB compressed.
    </p>
  </div>
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  h1 {
    margin-bottom: 1rem;
  }

  .info {
    margin-top: 2rem;
    padding: 1.5rem;
    background: #f5f5f5;
    border-radius: 4px;
  }

  .info h2 {
    margin-top: 0;
    font-size: 1.2em;
  }

  .loading {
    text-align: center;
    padding: 2rem;
    color: #666;
  }

  @media (prefers-color-scheme: dark) {
    .info {
      background: #2a2a2a;
    }
  }
</style>
