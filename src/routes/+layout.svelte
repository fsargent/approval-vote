<script lang="ts">
  import { resolve } from '$app/paths';
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
</script>

<svelte:head>
  <!-- Preload font CSS first -->
  <link rel="preload" href="{resolve('/fonts.css')}" as="style" />
  <link rel="stylesheet" href="{resolve('/fonts.css')}" />

  <!-- Regular CSS after fonts are handled -->
  <link rel="stylesheet" href="{resolve('/style.css')}" />
  <link rel="icon" type="image/png" href="{resolve('/icons/icon.png')}" />

  <!-- Rest of your head content -->
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="index, follow" />
  <meta name="author" content="Felix Sargent" />
  <meta
    name="keywords"
    content="approval voting, election results, voting systems, democracy, electoral reform"
  />

  <!-- Open Graph defaults -->
  <meta property="og:site_name" content="approval.vote" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
</svelte:head>
<main>
  {@render children?.()}
</main>
