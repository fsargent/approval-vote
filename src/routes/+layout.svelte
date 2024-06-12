
<script>
	import { base } from '$app/paths';
</script>
<svelte:head>
	<link rel="stylesheet" href="{base}/style.css" />
	<link rel="icon" type="image/png" href="{base}/icons/icon.png" />
</svelte:head>
<main>
	<slot></slot>
</main>
