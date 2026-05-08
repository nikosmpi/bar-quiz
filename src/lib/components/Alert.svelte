<script>
	let { type = "info", children, message = "" } = $props();
</script>

<div class="alert alert-{type}">
	{#if children}
		{@render children()}
	{:else}
		{message}
	{/if}
</div>

<style>
	.alert {
		padding: 1rem;
		border-radius: 6px;
		margin-bottom: 1.5rem;
		font-size: 0.95rem;
		line-height: 1.5;
	}

	.alert-success {
		background-color: #ecfdf5;
		color: #065f46;
		border: 1px solid #a7f3d0;
	}

	.alert-error {
		background-color: #fef2f2;
		color: #991b1b;
		border: 1px solid #fecaca;
	}

	.alert-info {
		background-color: #eff6ff;
		color: #1e40af;
		border: 1px solid #bfdbfe;
	}
</style>
