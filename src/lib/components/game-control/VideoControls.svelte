<script>
	import Card from '../Card.svelte';

	let { 
		selectedItem = {}, 
		onAction = () => {} 
	} = $props();

	function sendAction(action, value = 0) {
		onAction(action, value);
	}
</script>

{#if selectedItem.type === 'card' && (selectedItem.mediaType === 'video' || selectedItem.mediaType === 'video_file')}
	<section class="video-controls-section">
		<Card class="video-control-card">
			<div class="video-console-horizontal">
				<div class="console-label">VIDEO CONTROL</div>
				<div class="console-buttons">
					<button class="v-btn stop" onclick={() => sendAction('stop')} title="Stop">⏹</button>
					<button class="v-btn seek" onclick={() => sendAction('seek', -10)} title="-10s">⏪</button>
					<button class="v-btn play" onclick={() => sendAction('play')} title="Play">▶️</button>
					<button class="v-btn pause" onclick={() => sendAction('pause')} title="Pause">⏸</button>
					<button class="v-btn seek" onclick={() => sendAction('seek', 10)} title="+10s">⏩</button>
				</div>
				<div class="console-audio">
					<button class="v-btn mute" onclick={() => sendAction('mute')} title="Mute">🔇</button>
					<button class="v-btn unmute" onclick={() => sendAction('unmute')} title="Unmute (100%)">🔊</button>
				</div>
			</div>
		</Card>
	</section>
{/if}

<style>
	.video-controls-section { margin-top: 1.5rem; }
	:global(.video-control-card) { padding: 1rem !important; background: #0f172a !important; color: white !important; border: none !important; }
	.video-console-horizontal { display: flex; align-items: center; justify-content: space-between; gap: 2rem; }
	.console-label { font-size: 0.7rem; font-weight: 900; color: #475569; letter-spacing: 1px; }
	.console-buttons { display: flex; gap: 0.5rem; align-items: center; }
	
	.v-btn { width: 42px; height: 42px; border-radius: 10px; border: none; background: #1e293b; color: white; cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
	.v-btn:hover { background: #334155; transform: scale(1.05); }
	.v-btn.play { background: #10b981; width: 50px; height: 50px; font-size: 1.2rem; }
	.v-btn.stop { color: #ef4444; }
	
	.console-audio { display: flex; gap: 0.5rem; }
	.v-btn.unmute { background: #3b82f6; width: auto; padding: 0 1rem; font-size: 0.8rem; font-weight: 700; }
</style>
