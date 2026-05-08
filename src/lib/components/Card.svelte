<script>
	let { children, title, footer, class: className = "" } = $props();
</script>

<div class="card {className}">
	{#if title}
		<div class="card-header">
			<h2>{title}</h2>
		</div>
	{/if}
	
	<div class="card-body">
		{@render children?.()}
	</div>

	{#if footer}
		<div class="card-footer">
			{@render footer()}
		</div>
	{/if}
</div>

<style>
	.card {
		background: white;
		border-radius: 8px;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		border: 1px solid #e5e7eb;
		overflow: hidden;
		width: 100%;
	}

	.card-header {
		padding: 1.25rem 1.5rem;
		border-bottom: 1px solid #e5e7eb;
		background-color: #f9fafb;
	}

	.card-header h2 {
		margin: 0;
		font-size: 1.1rem;
		color: #111827;
	}

	.card-body {
		padding: 1.5rem;
	}

	.card-footer {
		padding: 1rem 1.5rem;
		border-top: 1px solid #e5e7eb;
		background-color: #f9fafb;
	}
</style>
