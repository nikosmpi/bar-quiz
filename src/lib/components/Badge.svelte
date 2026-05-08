<script>
	let { children, variant = "default" } = $props();
</script>

<span class="badge badge-{variant}">
	{@render children?.()}
</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		padding: 0.25rem 0.6rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	.badge-default {
		background-color: #f3f4f6;
		color: #374151;
	}

	.badge-admin {
		background-color: #fee2e2;
		color: #991b1b;
	}

	.badge-quizmaster {
		background-color: #fef3c7;
		color: #92400e;
	}

	.badge-player {
		background-color: #dcfce7;
		color: #166534;
	}

	.badge-primary {
		background-color: #dbeafe;
		color: #1e40af;
	}
</style>
