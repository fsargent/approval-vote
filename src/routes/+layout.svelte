
<script lang="ts">
	import { base } from '$app/paths';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>
<svelte:head>
	<link rel="stylesheet" href="{base}/style.css" />
	<link rel="icon" type="image/png" href="{base}/icons/icon.png" />

	<!-- Add these meta tags -->
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="robots" content="index, follow" />
	<meta name="author" content="Felix Sargent" />
	<meta name="keywords" content="approval voting, election results, voting systems, democracy, electoral reform" />

	<!-- Open Graph defaults (can be overridden in specific pages) -->
	<meta property="og:site_name" content="approval.vote" />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>
<main>
	{@render children?.()}
</main>
