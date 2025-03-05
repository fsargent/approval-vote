
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
</svelte:head>
<main>
	{@render children?.()}
</main>
