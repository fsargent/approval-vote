
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

	<!-- Preload critical font files -->
	<link
		rel="preload"
		href="https://fonts.gstatic.com/s/sourcesanspro/v22/6xK3dSBYKcSV-LCoeQqfX1RYOo3qOK7l.woff2"
		as="font"
		type="font/woff2"
		crossorigin
	/>

	<!-- Your existing meta tags -->
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="robots" content="index, follow" />
	<meta name="author" content="Felix Sargent" />
	<meta name="keywords" content="approval voting, election results, voting systems, democracy, electoral reform" />

	<!-- Open Graph defaults -->
	<meta property="og:site_name" content="approval.vote" />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>
<main>
	{@render children?.()}
</main>
