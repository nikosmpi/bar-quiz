<script>
	import favicon from '$lib/assets/favicon.svg';
	import Navigation from '$lib/components/Navigation.svelte';

	import { page } from '$app/stores';

	let { children } = $props();
	let isDisplayPage = $derived($page.url.pathname === '/display');
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<svelte:body class:no-scroll={isDisplayPage} />

<Navigation />

<main class:no-padding={isDisplayPage}>
	{@render children()}
</main>

<style>
	:global(html), :global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
		background-color: #f4f4f9;
		color: #333;
	}

	:global(body.no-scroll) {
		overflow: hidden;
		background-color: #000; /* Match display page background to avoid flickering */
	}

	main {
		padding: 1rem;
		padding-top: 5rem;
		min-height: calc(100vh - 6rem);
		display: block;
		margin: 0;
	}

	main.no-padding {
		padding: 0;
		padding-top: 0;
		margin: 0;
		min-height: 100vh;
	}
</style>
