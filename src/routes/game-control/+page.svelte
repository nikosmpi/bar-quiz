<script>
	import { onMount } from 'svelte';
	import { joinRoom, sendCommand } from '$lib/socket-client';
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import Badge from '$lib/components/Badge.svelte';

	let { data } = $props();

	let selectedIndex = $state(-1); // -1 for Intro, 0+ for questions/cards
	let liveIndex = $state(-2); // Tracks what is currently live on Display
	
	let selectedItem = $derived(selectedIndex === -1 ? { type: 'intro', text: 'Αρχική Σελίδα (Intro)' } : data.questions[selectedIndex]);

	onMount(() => {
		if (data.activeQuizId) {
			joinRoom(data.activeQuizId);
		}
	});

	function handleCommand(command, payload = {}) {
		if (data.activeQuizId) {
			sendCommand(data.activeQuizId, command, payload);
		}
	}

	function sendVideoAction(action, value = 0) {
		handleCommand('VIDEO_CONTROL', { action, value });
	}

	function goLive() {
		liveIndex = selectedIndex;
		if (selectedIndex === -1) {
			handleCommand('SHOW_INTRO');
		} else {
			handleCommand('SHOW_CONTENT', { 
				id: selectedItem.id, 
				type: selectedItem.type,
				index: selectedIndex 
			});
		}
	}
</script>

<div class="game-control-dashboard">
	{#if data.activeQuizId}
		<aside class="sidebar">
			<div class="sidebar-header">
				<div class="brand">
					<span class="dot"></span>
					<h2>Quiz Flow</h2>
				</div>
			</div>
			<nav class="flow-nav">
				<button 
					class="nav-item intro-item" 
					class:active={selectedIndex === -1}
					class:is-live={liveIndex === -1}
					onclick={() => selectedIndex = -1}
				>
					<span class="icon">🏠</span>
					<div class="item-meta">
						<span class="label">Εισαγωγή</span>
						{#if liveIndex === -1}<span class="live-tag">LIVE</span>{/if}
					</div>
				</button>

				<div class="nav-divider">Περιεχόμενο Quiz</div>

				{#each data.questions as item, i}
					<button 
						class="nav-item" 
						class:active={selectedIndex === i}
						class:is-live={liveIndex === i}
						class:type-card={item.type === 'card'}
						onclick={() => selectedIndex = i}
					>
						<span class="type-icon">{item.type === 'card' ? '📋' : '❓'}</span>
						<div class="item-meta">
							<span class="label">{item.text}</span>
							<div class="sub-meta">
								<span class="type-text">{item.type === 'card' ? 'Κάρτα' : 'Ερώτηση'}</span>
								{#if liveIndex === i}<span class="live-tag small">LIVE</span>{/if}
							</div>
						</div>
					</button>
				{/each}
			</nav>
		</aside>

		<main class="main-panel">
			<header class="panel-header">
				<div class="header-info">
					<h1>{data.activeQuiz?.name || 'Έλεγχος Παιχνιδιού'}</h1>
					<p class="quiz-id">Production Console • ID: {data.activeQuizId}</p>
				</div>
				<div class="header-actions">
					<Button onclick={() => handleCommand('SHOW_LEADERBOARD')} variant="secondary">📊 Leaderboard</Button>
					<Button onclick={() => handleCommand('RESET_GAME')} variant="danger">🔄 Reset</Button>
				</div>
			</header>

			<div class="control-grid">
				<section class="preview-section">
					<Card class="preview-card">
						<div class="preview-top">
							<Badge variant={selectedItem.type === 'intro' ? 'default' : (selectedItem.type === 'card' ? 'primary' : 'success')}>
								{selectedItem.type === 'intro' ? 'INTRO' : (selectedItem.type === 'card' ? 'CARD' : 'QUESTION')}
							</Badge>
							{#if liveIndex === selectedIndex}
								<span class="live-indicator">● LIVE ΤΩΡΑ</span>
							{/if}
						</div>
						
						<h2 class="preview-title">{selectedItem.text}</h2>

						<div class="preview-content-box">
							{#if selectedItem.type === 'intro'}
								<div class="info-block">
									<p>Εμφάνιση της αρχικής σελίδας με QR Code για τη σύνδεση των παικτών.</p>
									<div class="preview-specs">
										<span><strong>Title:</strong> {data.homeTitle}</span>
										<span><strong>Subtitle:</strong> {data.homeSubtitle}</span>
									</div>
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
										<span><strong>Points:</strong> {selectedItem.points}</span>
										<span><strong>Time:</strong> {selectedItem.timeLimit}s</span>
									</div>
									<div class="options-preview-grid">
										{#each selectedItem.options as opt}
											<div class="opt-item" class:is-correct={opt.isCorrect}>
												<span class="bullet"></span>
												{opt.text}
											</div>
										{/each}
									</div>
								</div>
							{/if}
						</div>

						<div class="main-action">
							<button class="mega-live-btn" class:is-live={liveIndex === selectedIndex} onclick={goLive}>
								<span class="bolt">⚡</span>
								{liveIndex === selectedIndex ? 'ΑΝΑΝΕΩΣΗ LIVE' : 'ΕΜΦΑΝΙΣΗ ΣΤΗΝ ΟΘΟΝΗ'}
							</button>
						</div>
					</Card>
				</section>

				<section class="media-controls-section">
					{#if selectedItem.type === 'card' && (selectedItem.mediaType === 'video' || selectedItem.mediaType === 'video_file')}
						<Card title="Video Controller" class="media-card">
							<div class="video-console">
								<div class="console-row main-controls">
									<button class="ctrl-btn stop" onclick={() => sendVideoAction('stop')} title="Stop & Reset">⏹</button>
									<button class="ctrl-btn seek" onclick={() => sendVideoAction('seek', -10)} title="Back 10s">⏪</button>
									<button class="ctrl-btn play-pause" onclick={() => sendVideoAction('play')} title="Play">▶️</button>
									<button class="ctrl-btn play-pause" onclick={() => sendVideoAction('pause')} title="Pause">⏸</button>
									<button class="ctrl-btn seek" onclick={() => sendVideoAction('seek', 10)} title="Forward 10s">⏩</button>
								</div>
								<div class="console-row audio-controls">
									<button class="audio-btn mute" onclick={() => sendVideoAction('mute')}>🔇 Mute</button>
									<button class="audio-btn unmute" onclick={() => sendVideoAction('unmute')}>🔊 Unmute (100%)</button>
								</div>
							</div>
						</Card>
					{:else}
						<div class="no-media-msg">
							<p>Δεν υπάρχουν διαθέσιμα media controls για αυτό το στοιχείο.</p>
						</div>
					{/if}
				</section>
			</div>
		</main>
	{:else}
		<div class="no-quiz-state">
			<Card class="warning-card">
				<span class="warn-icon">⚠️</span>
				<p>Δεν υπάρχει ενεργό quiz "στον αέρα".</p>
				<Button href="/admin/intro-page" variant="primary">Επιλογή Quiz</Button>
			</Card>
		</div>
	{/if}
</div>

<style>
	:global(body) { background: #f8fafc; }

	.game-control-dashboard {
		display: flex;
		height: calc(100vh - 5rem);
		background: #f8fafc;
		font-family: 'Inter', system-ui, sans-serif;
	}

	/* Sidebar - Refactored to Light Theme */
	.sidebar {
		width: 320px;
		background: white;
		color: #1e293b;
		display: flex;
		flex-direction: column;
		border-right: 1px solid #e2e8f0;
	}

	.sidebar-header { 
		padding: 1.5rem; 
		background: #fff; 
		border-bottom: 1px solid #f1f5f9;
	}
	.brand { display: flex; align-items: center; gap: 0.75rem; }
	.dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 8px rgba(16, 185, 129, 0.4); }
	.brand h2 { margin: 0; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700; }

	.flow-nav { flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }

	.nav-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		border: 1px solid transparent;
		border-radius: 12px;
		background: #f8fafc;
		color: #475569;
		cursor: pointer;
		text-align: left;
		transition: all 0.2s;
	}

	.nav-item:hover { background: #f1f5f9; color: #1e293b; }
	.nav-item.active { background: #eff6ff; border-color: #bfdbfe; color: #2563eb; }
	
	.nav-item.active .label { color: #1e40af; }
	.nav-item.is-live { border-right: 4px solid #ef4444; }

	.nav-item .icon, .nav-item .type-icon { font-size: 1.25rem; }
	.item-meta { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
	.item-meta .label { font-size: 0.9rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	
	.sub-meta { display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem; }
	.type-text { font-size: 0.7rem; color: #94a3b8; font-weight: bold; text-transform: uppercase; }
	
	.live-tag { font-size: 0.6rem; background: #ef4444; color: white; padding: 1px 4px; border-radius: 4px; font-weight: 900; }
	.live-tag.small { font-size: 0.55rem; }

	.nav-divider { padding: 1.5rem 0.5rem 0.5rem; font-size: 0.7rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }

	/* Main Panel */
	.main-panel { flex: 1; display: flex; flex-direction: column; padding: 2rem 3rem; overflow-y: auto; }

	.panel-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 3rem; }
	.panel-header h1 { margin: 0; font-size: 2.2rem; color: #0f172a; font-weight: 800; }
	.quiz-id { margin: 0.5rem 0 0; color: #64748b; font-weight: 500; font-size: 0.9rem; }

	.header-actions { display: flex; gap: 1rem; }

	.control-grid { display: grid; grid-template-columns: 1fr 350px; gap: 2rem; align-items: start; }

	/* Preview Card */
	:global(.preview-card) { border-radius: 20px !important; box-shadow: 0 10px 25px -3px rgba(0,0,0,0.05) !important; border: 1px solid #e2e8f0 !important; }
	
	.preview-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
	.live-indicator { color: #ef4444; font-weight: 800; font-size: 0.8rem; animation: blink 1s infinite; }
	@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

	.preview-title { font-size: 1.8rem; color: #1e293b; margin: 0 0 1.5rem; line-height: 1.2; }

	.preview-content-box { background: #f8fafc; border-radius: 16px; padding: 1.5rem; border: 1px solid #f1f5f9; margin-bottom: 2rem; min-height: 180px; }

	.preview-specs { display: flex; gap: 1.5rem; font-size: 0.85rem; color: #64748b; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #e2e8f0; }

	.explanation-box { color: #475569; line-height: 1.6; }
	.explanation-box p { margin: 0.5rem 0 0; }

	.options-preview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
	.opt-item { padding: 1rem; background: white; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 0.9rem; display: flex; align-items: center; gap: 0.75rem; color: #475569; }
	.opt-item.is-correct { background: #f0fdf4; border-color: #4ade80; color: #166534; font-weight: 600; }
	.bullet { width: 8px; height: 8px; border-radius: 50%; background: #cbd5e1; }
	.is-correct .bullet { background: #22c55e; }

	.mega-live-btn {
		width: 100%;
		padding: 1.5rem;
		background: #2563eb;
		color: white;
		border: none;
		border-radius: 12px;
		font-size: 1.25rem;
		font-weight: 800;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		transition: all 0.2s;
		box-shadow: 0 4px 14px 0 rgba(37,99,235,0.39);
	}

	.mega-live-btn:hover { background: #1d4ed8; transform: translateY(-2px); }
	.mega-live-btn.is-live { background: #ef4444; box-shadow: 0 4px 14px 0 rgba(239,68,68,0.39); }
	.mega-live-btn.is-live:hover { background: #dc2626; }

	/* Video Controls */
	.video-console { display: flex; flex-direction: column; gap: 1.5rem; }
	.console-row { display: flex; gap: 0.5rem; justify-content: center; }

	.ctrl-btn {
		width: 50px;
		height: 50px;
		border-radius: 50%;
		border: none;
		background: #334155;
		color: white;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.2rem;
		transition: all 0.2s;
	}

	.ctrl-btn:hover { background: #475569; transform: scale(1.1); }
	.ctrl-btn.play-pause { width: 60px; height: 60px; background: #10b981; font-size: 1.5rem; }
	.ctrl-btn.stop { background: #ef4444; }

	.audio-controls { flex-direction: column; }
	.audio-btn { padding: 0.75rem; border-radius: 8px; border: 1px solid #334155; background: #1e293b; color: white; cursor: pointer; font-weight: 600; font-size: 0.85rem; }
	.audio-btn:hover { background: #334155; }
	.audio-btn.unmute { background: #2563eb; border-color: #2563eb; }

	.no-media-msg { padding: 2rem; text-align: center; color: #94a3b8; font-size: 0.9rem; border: 2px dashed #e2e8f0; border-radius: 16px; }

	.no-quiz-state { flex: 1; display: flex; align-items: center; justify-content: center; text-align: center; }
	.warn-icon { font-size: 4rem; display: block; margin-bottom: 1.5rem; }

	@media (max-width: 1100px) {
		.control-grid { grid-template-columns: 1fr; }
		.sidebar { width: 260px; }
	}
</style>
