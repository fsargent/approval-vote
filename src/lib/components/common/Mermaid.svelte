<script lang="ts">
  import { onMount } from 'svelte';
  import mermaid from 'mermaid';

  export let code: string | undefined;

  let container: HTMLElement;

  let initialized = false;
  function initMermaid() {
    if (initialized) return;
    mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });
    initialized = true;
  }

  async function render() {
    if (!code || !container) return;
    try {
      const { svg } = await mermaid.render(`flowchart-${Date.now()}`, code);
      container.innerHTML = svg;
    } catch (err) {
      container.innerHTML = '<p style="margin:0;color:#6b7280">Error rendering flowchart</p>';
    }
  }

  onMount(() => {
    initMermaid();
    render();
  });

  $: if (code) {
    initMermaid();
    render();
  }
</script>

{#if code}
  <div class="flowchart-container" bind:this={container}></div>
{/if}

<style>
  .flowchart-container {
    text-align: center;
    overflow-x: auto;
    padding: 1rem 0;
  }
  .flowchart-container :global(svg) {
    max-width: 100%;
    height: auto;
  }
</style>


