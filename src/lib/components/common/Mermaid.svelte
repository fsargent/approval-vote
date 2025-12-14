<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    code?: string;
  }

  let { code }: Props = $props();

  let container = $state<HTMLElement | undefined>(undefined);
  let mermaidLoaded = $state(false);
  let mermaid: any;

  async function loadMermaid() {
    if (mermaidLoaded) return mermaid;
    try {
      const mermaidModule = await import('mermaid');
      mermaid = mermaidModule.default;
      mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });
      mermaidLoaded = true;
      return mermaid;
    } catch (err) {
      console.error('Failed to load Mermaid:', err);
      return null;
    }
  }

  async function render() {
    if (!code || !container) return;
    try {
      const mermaidInstance = await loadMermaid();
      if (!mermaidInstance) {
        container.innerHTML = '<p style="margin:0;color:#6b7280">Error loading flowchart renderer</p>';
        return;
      }
      const { svg } = await mermaidInstance.render(`flowchart-${Date.now()}`, code);
      container.innerHTML = svg;
    } catch (err) {
      container.innerHTML = '<p style="margin:0;color:#6b7280">Error rendering flowchart</p>';
    }
  }

  onMount(() => {
    render();
  });

  $effect(() => {
    if (code) {
      render();
    }
  });
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


