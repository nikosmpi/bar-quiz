<script>
	import Card from '../Card.svelte';
	import Badge from '../Badge.svelte';

	let { 
		selectedItem = {}, 
		liveIndex = -2, 
		selectedIndex = -1, 
		dashboardTimer = 0, 
		isPreparing = false,
		questionNumber = 0,
		onPrepare = () => {},
		onGoLive = () => {},
		onMarkCompleted = () => {}
	} = $props();
</script>

<section class="preview-section">
	<Card class="preview-card">
		<div class="preview-top">
			<Badge variant={selectedItem.type === 'intro' ? 'default' : (selectedItem.type === 'card' ? 'primary' : 'success')}>
				{selectedItem.type.toUpperCase()}
			</Badge>
			<div class="status-indicators">
				{#if liveIndex === selectedIndex && dashboardTimer > 0}
					<span class="live-timer-badge">⏱ {dashboardTimer}s</span>
				{/if}
				{#if liveIndex === selectedIndex && !isPreparing}
					<span class="live-indicator">● LIVE ΤΩΡΑ</span>
				{:else if isPreparing}
					<span class="prep-indicator">⏳ ΠΡΟΕΤΟΙΜΑΣΙΑ...</span>
				{/if}
				{#if selectedItem.status === 'completed'}
					<span class="completed-badge">ΟΛΟΚΛΗΡΩΘΗΚΕ</span>
				{/if}
			</div>
		</div>
		
		<h2 class="preview-title">{selectedItem.text}</h2>

		<div class="preview-content-box">
			{#if selectedItem.type === 'intro'}
				<div class="info-block">
					<p>Εμφάνιση της αρχικής σελίδας με QR Code για τη σύνδεση των παικτών.</p>
				</div>
			{:else if selectedItem.type === 'card'}
				<div class="info-block">
					<div class="preview-specs">
						<span><strong>Layout:</strong> {selectedItem.template}</span>
						{#if selectedItem.mediaType !== 'none'}
							<span><strong>Media:</strong> {selectedItem.mediaType}</span>
						{/if}
					</div>
					{#if selectedItem.explanation}
						<div class="explanation-box">
							<strong>Περιεχόμενο:</strong>
							<p>{selectedItem.explanation}</p>
						</div>
					{/if}
				</div>
			{:else if selectedItem.type === 'question'}
				<div class="info-block">
					<div class="preview-specs">
						<span><strong>Question #:</strong> {questionNumber}</span>
						<span><strong>Points:</strong> {selectedItem.points}</span>
						<span><strong>Time:</strong> {selectedItem.timeLimit}s</span>
					</div>
					<div class="options-preview-grid">
						{#each selectedItem.options || [] as opt}
							<div class="opt-item" class:is-correct={opt.isCorrect}>
								<span class="bullet"></span>
								{opt.text}
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<div class="main-action-group">
			<div class="primary-actions">
				{#if selectedItem.type === 'question' && !isPreparing && liveIndex !== selectedIndex}
					<button class="mega-live-btn prep" onclick={onPrepare}>
						<span class="icon">⏳</span> ΠΡΟΕΤΟΙΜΑΣΙΑ
					</button>
				{:else}
					<button class="mega-live-btn" class:is-live={liveIndex === selectedIndex && !isPreparing} onclick={onGoLive}>
						<span class="bolt">⚡</span>
						{liveIndex === selectedIndex && !isPreparing ? 'ΑΝΑΝΕΩΣΗ LIVE' : 'ΕΜΦΑΝΙΣΗ ΣΤΗΝ ΟΘΟΝΗ'}
					</button>
				{/if}
			</div>
			
			{#if selectedIndex >= 0}
				<button class="complete-btn" onclick={onMarkCompleted} title="Σήμανση ως ολοκληρωμένο">
					✓ ΟΛΟΚΛΗΡΩΣΗ
				</button>
			{/if}
		</div>
	</Card>
</section>

<style>
	.preview-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
	.status-indicators { display: flex; gap: 1rem; align-items: center; }
	.live-indicator { color: #ef4444; font-weight: 800; font-size: 0.75rem; animation: blink 1s infinite; }
	.live-timer-badge { background: #0f172a; color: white; padding: 0.2rem 0.6rem; border-radius: 6px; font-weight: 900; font-size: 0.8rem; border: 1px solid #2563eb; }
	.prep-indicator { color: #f59e0b; font-weight: 800; font-size: 0.75rem; }
	.completed-badge { background: #dcfce7; color: #166534; font-size: 0.65rem; font-weight: 900; padding: 0.25rem 0.6rem; border-radius: 6px; }
	@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

	.preview-title { font-size: 1.5rem; color: #1e293b; margin: 0 0 1.25rem; line-height: 1.2; font-weight: 800; }
	.preview-content-box { background: #f8fafc; border-radius: 12px; padding: 1.25rem; border: 1px solid #f1f5f9; margin-bottom: 1.5rem; min-height: 150px; }
	.preview-specs { display: flex; gap: 1.25rem; font-size: 0.8rem; color: #64748b; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid #e2e8f0; }

	.options-preview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
	.opt-item { padding: 0.75rem; background: white; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; color: #475569; }
	.opt-item.is-correct { background: #f0fdf4; border-color: #4ade80; color: #166534; font-weight: 600; }
	.bullet { width: 8px; height: 8px; border-radius: 50%; background: #cbd5e1; }
	.is-correct .bullet { background: #4ade80; }

	.main-action-group { display: flex; gap: 1rem; }
	.primary-actions { flex: 1; }
	.mega-live-btn { width: 100%; padding: 1.25rem; background: #2563eb; color: white; border: none; border-radius: 10px; font-size: 1.1rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 1rem; transition: all 0.2s; box-shadow: 0 4px 12px rgba(37,99,235,0.2); }
	.mega-live-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 15px rgba(37,99,235,0.3); }
	.mega-live-btn.prep { background: #f59e0b; }
	.mega-live-btn.is-live { background: #ef4444; }

	.complete-btn { padding: 0 1.5rem; background: #f1f5f9; color: #475569; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
	.complete-btn:hover { background: #10b981; color: white; border-color: #10b981; }

	.explanation-box p { margin: 0.5rem 0 0; color: #475569; font-size: 0.9rem; line-height: 1.4; }
</style>
