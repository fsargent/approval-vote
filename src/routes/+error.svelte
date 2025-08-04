<script>
	import { page } from '$app/stores';
	import { base } from '$app/paths';

	const dev = process.env.NODE_ENV === 'development';

	function refreshPage() {
		window.location.reload();
	}

	function getErrorMessage(status, message) {
		switch (status) {
			case 404:
				return "The page you're looking for doesn't exist.";
			case 500:
				return "Something went wrong on our end. This might be a temporary issue - try refreshing the page.";
			case 503:
				return "The service is temporarily unavailable. Please try again in a moment.";
			default:
				return message || "An unexpected error occurred.";
		}
	}

	function getErrorTitle(status) {
		switch (status) {
			case 404:
				return "Page Not Found";
			case 500:
				return "Server Error";
			case 503:
				return "Service Unavailable";
			default:
				return `Error ${status}`;
		}
	}
</script>

<svelte:head>
	<title>{getErrorTitle($page.status)} - approval.vote</title>
	<meta name="description" content="An error occurred while loading this page." />
</svelte:head>

<div class="container">
	<div class="error-page">
		<div class="error-content">
			<h1 class="error-title">{getErrorTitle($page.status)}</h1>
			<p class="error-message">{getErrorMessage($page.status, $page.error?.message)}</p>
			<div class="error-actions">
				<button on:click={refreshPage} class="refresh-button">
					🔄 Refresh Page
				</button>
				<a href="{base}/" class="home-link">
					← Back to Home
				</a>
			</div>

			{#if dev && $page.error?.message}
				<details class="error-details">
					<summary>Technical Details</summary>
					<pre>{$page.error.message}</pre>
					{#if $page.error?.stack}
						<pre>{$page.error.stack}</pre>
					{/if}
				</details>
			{/if}
		</div>
	</div>
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
	}

	.error-page {
		text-align: center;
		padding: 3rem 1rem;
	}

	.error-content {
		background: #f8f9fa;
		border-radius: 8px;
		padding: 2rem;
		border: 1px solid #e9ecef;
	}

	.error-title {
		font-size: 2.5rem;
		margin-bottom: 1rem;
		color: #dc3545;
		font-weight: 600;
	}

	.error-message {
		font-size: 1.1rem;
		margin-bottom: 2rem;
		color: #6c757d;
		line-height: 1.5;
	}

	.error-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
		margin-bottom: 2rem;
	}

	.refresh-button {
		background: #437527;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 4px;
		font-size: 1rem;
		cursor: pointer;
		transition: background-color 0.2s;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.refresh-button:hover {
		background: #365a1f;
	}

	.home-link {
		background: #6c757d;
		color: white;
		padding: 0.75rem 1.5rem;
		border-radius: 4px;
		text-decoration: none;
		font-size: 1rem;
		transition: background-color 0.2s;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.home-link:hover {
		background: #545b62;
		text-decoration: none;
	}

	.error-details {
		margin-top: 2rem;
		text-align: left;
		background: #f1f3f4;
		border-radius: 4px;
		padding: 1rem;
	}

	.error-details summary {
		cursor: pointer;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}

	.error-details pre {
		background: #fff;
		padding: 1rem;
		border-radius: 4px;
		border: 1px solid #dee2e6;
		overflow-x: auto;
		font-size: 0.875rem;
		margin: 0.5rem 0;
	}

	@media (max-width: 640px) {
		.error-actions {
			flex-direction: column;
			align-items: center;
		}

		.refresh-button,
		.home-link {
			width: 100%;
			max-width: 200px;
			justify-content: center;
		}
	}
</style>
