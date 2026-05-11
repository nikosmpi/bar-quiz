<script>
	import Button from '../Button.svelte';

	let { 
		questions = [], 
		selectedIndex = -1, 
		liveIndex = -2, 
		isReviewMode = false,
		onSelect = () => {},
		onToggleReviewMode = () => {}
	} = $props();
</script>

<aside class="sidebar flow-sidebar">
	<div class="sidebar-header">
		<div class="brand">
			<span class="dot"></span>
			<h2>Quiz Flow</h2>
		</div>
	</div>
	<nav class="flow-nav">
		<button 
			class="nav-item intro-item" 
			class:active={selectedIndex === -1 && !isReviewMode}
			class:is-live={liveIndex === -1}
			onclick={() => onSelect(-1)}
		>
			<span class="type-icon">🏠</span>
			<div class="item-meta">
				<span class="label">Εισαγωγή</span>
				<div class="sub-meta">
					<span class="type-text">Intro</span>
					{#if liveIndex === -1}<span class="live-tag small">LIVE</span>{/if}
				</div>
			</div>
		</button>

		<div class="nav-divider">Περιεχόμενο Quiz</div>

		{#each questions as item, i}
			<button 
				class="nav-item" 
				class:active={selectedIndex === i && !isReviewMode}
				class:is-live={liveIndex === i}
				class:completed={item.status === 'completed'}
				onclick={() => onSelect(i)}
			>
				<span class="type-icon">
					{#if item.status === 'completed'}
						✅
					{:else}
						{item.type === 'card' ? '📋' : '❓'}
					{/if}
				</span>
				<div class="item-meta">
					<span class="label">{item.text}</span>
					<div class="sub-meta">
						<span class="type-text">{item.type === 'card' ? 'Κάρτα' : 'Ερώτηση'}</span>
						{#if liveIndex === i}
							<span class="live-tag small">LIVE</span>
						{:else if item.status === 'completed'}
							<span class="done-tag">DONE</span>
						{/if}
					</div>
				</div>
			</button>
		{/each}

		<div class="nav-divider">Τέλος Quiz</div>

		<button 
			class="nav-item review-item" 
			class:active={isReviewMode}
			onclick={onToggleReviewMode}
		>
			<span class="type-icon">💡</span>
			<div class="item-meta">
				<span class="label">Απαντήσεις</span>
				<div class="sub-meta">
					<span class="type-text">Review Mode</span>
				</div>
			</div>
		</button>
	</nav>
</aside>

<style>
	.sidebar { width: 300px; background: white; color: #1e293b; display: flex; flex-direction: column; border-right: 1px solid #e2e8f0; }
	.sidebar-header { padding: 1.25rem; background: #fff; border-bottom: 1px solid #f1f5f9; }
	.sidebar-header h2 { margin: 0; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 800; }
	
	.brand { display: flex; align-items: center; gap: 0.75rem; }
	.dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 8px rgba(16, 185, 129, 0.4); }

	.flow-nav { flex: 1; overflow-y: auto; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.4rem; }
	.nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border: 1px solid transparent; border-radius: 10px; background: #f8fafc; color: #475569; cursor: pointer; text-align: left; transition: all 0.2s; width: 100%; border-radius: 12px; }
	.nav-item:hover { background: #f1f5f9; color: #1e293b; }
	.nav-item.active { background: #eff6ff; border-color: #bfdbfe; color: #2563eb; }
	.nav-item.is-live { border-right: 4px solid #ef4444; }
	.nav-item.completed { opacity: 0.8; }
	
	.item-meta { flex: 1; }
	.item-meta .label { font-size: 0.9rem; font-weight: 600; color: #334155; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
	.sub-meta { display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem; }
	.type-text { font-size: 0.65rem; color: #94a3b8; font-weight: bold; text-transform: uppercase; }
	.live-tag { font-size: 0.55rem; background: #ef4444; color: white; padding: 1px 4px; border-radius: 4px; font-weight: 900; }
	.done-tag { font-size: 0.55rem; background: #10b981; color: white; padding: 1px 4px; border-radius: 4px; font-weight: 900; }
	.nav-divider { padding: 1.25rem 0.5rem 0.5rem; font-size: 0.65rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }

	.review-item.active { background: #fef3c7; border-color: #fcd34d; color: #92400e; }
	.review-item.active .type-text { color: #b45309; }

	@media (max-width: 1400px) {
		.sidebar { width: 260px; }
	}
</style>
