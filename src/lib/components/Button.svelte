<script>
	let { 
		children, 
		type = "button", 
		variant = "primary", 
		loading = false, 
		disabled = false, 
		onclick,
		href = "",
		class: className = "",
		...rest
	} = $props();

	const commonClass = `btn btn-${variant} ${className}`;
</script>

{#if href}
	<a 
		{href} 
		class={commonClass}
		{...rest}
	>
		{@render children?.()}
	</a>
{:else}
	<button 
		{type} 
		disabled={disabled || loading} 
		{onclick}
		class={commonClass}
		{...rest}
	>
		{#if loading}
			<span class="spinner"></span>
		{/if}
		{@render children?.()}
	</button>
{/if}

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.75rem 1.5rem;
		border-radius: 6px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		border: 1px solid transparent;
		font-family: inherit;
		gap: 0.5rem;
		width: auto;
		text-decoration: none;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-primary {
		background-color: #2563eb;
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background-color: #1d4ed8;
	}

	.btn-danger {
		background-color: #ef4444;
		color: white;
	}

	.btn-danger:hover:not(:disabled) {
		background-color: #dc2626;
	}

	.btn-secondary {
		background-color: #f3f4f6;
		color: #374151;
		border-color: #d1d5db;
	}

	.btn-secondary:hover:not(:disabled) {
		background-color: #e5e7eb;
	}

	.btn-link {
		background: none;
		border: none;
		color: #2563eb;
		padding: 0.5rem;
		text-decoration: none;
		width: auto;
	}

	.btn-link:hover:not(:disabled) {
		text-decoration: underline;
	}

	/* Utility for full width */
	:global(.btn-full) {
		width: 100% !important;
	}

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid currentColor;
		border-bottom-color: transparent;
		border-radius: 50%;
		display: inline-block;
		animation: rotation 1s linear infinite;
	}

	@keyframes rotation {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
</style>
