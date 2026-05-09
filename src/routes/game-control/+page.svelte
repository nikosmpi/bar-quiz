<script>
	import { onMount, onDestroy } from 'svelte';
	import { joinRoom, sendCommand, getSocket } from '$lib/socket-client';
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import UserAvatar from '$lib/components/UserAvatar.svelte';

	let { data } = $props();

	let questions = $state(data.questions);
	let selectedIndex = $state(-1); // -1 for Intro, 0+ for questions/cards
	let liveIndex = $state(-2); // Tracks what is currently live on Display
	let isPreparing = $state(false); // Tracks if we are in preparation mode for a question
	
	let connectedUsers = $state([]); // Real-time users list
	let dashboardTimer = $state(0); // Synced timer for auto-completion
	let timerInterval;

	let totalQuestions = $derived(questions.filter(q => q.type === 'question').length);
	let selectedItem = $derived(selectedIndex === -1 ? { type: 'intro', text: 'Αρχική Σελίδα (Intro)' } : questions[selectedIndex]);

	onMount(() => {
		if (data.activeQuizId) {
			joinRoom(data.activeQuizId);
			
			const socket = getSocket();
			// Listen for users in the room
			socket.on('room-users-update', (users) => {
				console.log('Users update received:', users);
				connectedUsers = users;
			});
		}
	});

	onDestroy(() => {
		if (timerInterval) clearInterval(timerInterval);
	});

	async function updateItemStatus(questionId, status) {
		if (!questionId) return;
		try {
			await fetch('/api/game/update-status', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ questionId, status })
			});
			// Update local state to reflect DB change
			const idx = questions.findIndex(q => q.id === questionId);
			if (idx !== -1) questions[idx].status = status;
		} catch (err) {
			console.error('Failed to update status:', err);
		}
	}

	function handleCommand(command, payload = {}) {
		if (data.activeQuizId) {
			sendCommand(data.activeQuizId, command, payload);
		}
	}

	async function resetGame() {
		if (!confirm('Είστε σίγουροι ότι θέλετε να κάνετε reset; Όλα τα status και οι απαντήσεις θα διαγραφούν!')) return;
		
		try {
			const res = await fetch('/api/game/reset', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ quizId: data.activeQuizId })
			});
			
			if (res.ok) {
				// Update local state
				questions = questions.map(q => ({ ...q, status: 'pending' }));
				selectedIndex = -1;
				liveIndex = -2;
				isPreparing = false;
				if (timerInterval) clearInterval(timerInterval);
				dashboardTimer = 0;
				
				// Notify others
				handleCommand('RESET_GAME');
				handleCommand('SHOW_INTRO');
				alert('Το Quiz έγινε reset επιτυχώς!');
			}
		} catch (err) {
			console.error('Reset failed:', err);
		}
	}

	function selectNext() {
		if (selectedIndex < questions.length - 1) {
			selectedIndex += 1;
		}
	}

	function startDashboardTimer(duration, questionId) {
		if (timerInterval) clearInterval(timerInterval);
		dashboardTimer = duration;
		
		timerInterval = setInterval(async () => {
			if (dashboardTimer > 0) {
				dashboardTimer -= 1;
			} else {
				clearInterval(timerInterval);
				// Automatically mark as completed when time runs out
				await updateItemStatus(questionId, 'completed');
				selectNext();
			}
		}, 1000);
	}

	function sendVideoAction(action, value = 0) {
		handleCommand('VIDEO_CONTROL', { action, value });
	}

	async function prepareQuestion() {
		isPreparing = true;
		await updateItemStatus(selectedItem.id, 'preparing');
		handleCommand('PREPARE_QUESTION', { 
			index: selectedIndex,
			number: getQuestionNumber(selectedIndex),
			item: selectedItem
		});
	}

	async function goLive() {
		liveIndex = selectedIndex;
		isPreparing = false;
		
		if (selectedIndex === -1) {
			handleCommand('SHOW_INTRO');
			if (timerInterval) clearInterval(timerInterval);
			dashboardTimer = 0;
		} else {
			await updateItemStatus(selectedItem.id, 'active');
			handleCommand('SHOW_CONTENT', { 
				id: selectedItem.id, 
				type: selectedItem.type,
				index: selectedIndex,
				item: selectedItem
			});

			// If it's a question, start the dashboard timer (5s countdown + timeLimit)
			if (selectedItem.type === 'question') {
				// Total time = 5s (display countdown) + question limit
				startDashboardTimer(selectedItem.timeLimit + 5, selectedItem.id);
			} else {
				if (timerInterval) clearInterval(timerInterval);
				dashboardTimer = 0;
			}
		}
	}

	async function markCompleted() {
		if (selectedIndex >= 0) {
			if (timerInterval) clearInterval(timerInterval);
			dashboardTimer = 0;
			await updateItemStatus(selectedItem.id, 'completed');
			selectNext();
		}
	}

	function getQuestionNumber(index) {
		const questionsBefore = questions.slice(0, index + 1).filter(q => q.type === 'question');
		return questionsBefore.length;
	}

	// Reset preparation state when selection changes
	$effect(() => {
		if (selectedIndex !== liveIndex) {
			isPreparing = false;
		}
	});
</script>

<div class="game-control-dashboard">
	{#if data.activeQuizId}
		<!-- Left Sidebar: Quiz Flow -->
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

				{#each questions as item, i}
					<button 
						class="nav-item" 
						class:active={selectedIndex === i}
						class:is-live={liveIndex === i}
						class:completed={item.status === 'completed'}
						onclick={() => selectedIndex = i}
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
			</nav>
		</aside>

		<!-- Middle: Production Console -->
		<main class="main-panel">
			<header class="panel-header">
				<div class="header-info">
					<h1>{data.activeQuiz?.name || 'Έλεγχος Παιχνιδιού'}</h1>
					<p class="quiz-id">Production Console • ID: {data.activeQuizId}</p>
				</div>
				<div class="header-actions">
					<Button onclick={() => handleCommand('SHOW_LEADERBOARD')} variant="secondary">📊 Leaderboard</Button>
					<Button onclick={resetGame} variant="danger">🔄 Reset</Button>
				</div>
			</header>

			<div class="control-stack">
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
										<span><strong>Question #:</strong> {getQuestionNumber(selectedIndex)}</span>
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
									<button class="mega-live-btn prep" onclick={prepareQuestion}>
										<span class="icon">⏳</span> ΠΡΟΕΤΟΙΜΑΣΙΑ
									</button>
								{:else}
									<button class="mega-live-btn" class:is-live={liveIndex === selectedIndex && !isPreparing} onclick={goLive}>
										<span class="bolt">⚡</span>
										{liveIndex === selectedIndex && !isPreparing ? 'ΑΝΑΝΕΩΣΗ LIVE' : 'ΕΜΦΑΝΙΣΗ ΣΤΗΝ ΟΘΟΝΗ'}
									</button>
								{/if}
							</div>
							
							{#if selectedIndex >= 0}
								<button class="complete-btn" onclick={markCompleted} title="Σήμανση ως ολοκληρωμένο">
									✓ ΟΛΟΚΛΗΡΩΣΗ
								</button>
							{/if}
						</div>
					</Card>
				</section>

				<section class="video-controls-section">
					{#if selectedItem.type === 'card' && (selectedItem.mediaType === 'video' || selectedItem.mediaType === 'video_file')}
						<Card class="video-control-card">
							<div class="video-console-horizontal">
								<div class="console-label">VIDEO CONTROL</div>
								<div class="console-buttons">
									<button class="v-btn stop" onclick={() => sendVideoAction('stop')} title="Stop">⏹</button>
									<button class="v-btn seek" onclick={() => sendVideoAction('seek', -10)} title="-10s">⏪</button>
									<button class="v-btn play" onclick={() => sendVideoAction('play')} title="Play">▶️</button>
									<button class="v-btn pause" onclick={() => sendVideoAction('pause')} title="Pause">⏸</button>
									<button class="v-btn seek" onclick={() => sendVideoAction('seek', 10)} title="+10s">⏩</button>
								</div>
								<div class="console-audio">
									<button class="v-btn mute" onclick={() => sendVideoAction('mute')} title="Mute">🔇</button>
									<button class="v-btn unmute" onclick={() => sendVideoAction('unmute')} title="Unmute (100%)">🔊</button>
								</div>
							</div>
						</Card>
					{/if}
				</section>
			</div>
		</main>

		<!-- Right Sidebar: Connected Users -->
		<aside class="sidebar users-sidebar">
			<div class="sidebar-header">
				<h2>Συνδεδεμένοι ({connectedUsers.length})</h2>
			</div>
			<div class="users-list">
				{#if connectedUsers.length === 0}
					<p class="empty-users">Αναμονή για παίκτες...</p>
				{:else}
					{#each connectedUsers as user}
						<div class="user-row" class:user-answered={user.answeredCurrent}>
							<UserAvatar {user} size="32px" />
							<div class="user-info-row">
								<span class="user-name">{user.username || user.name}</span>
								<div class="user-stats">
									<span class="stat-count">{user.answerCount || 0} / {totalQuestions}</span>
									<span class="stat-label">απαντήσεις</span>
								</div>
							</div>
							<div class="user-participation-status">
								{#if user.answeredCurrent}
									<span class="status-answered" title="Απάντησε">✅</span>
								{:else if selectedItem.type === 'question' && liveIndex === selectedIndex}
									<span class="status-thinking" title="Σκέφτεται...">⏳</span>
								{/if}
							</div>
							<span class="user-status-dot"></span>
						</div>
					{/each}
				{/if}
			</div>
		</aside>

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

	.game-control-dashboard { display: flex; height: calc(100vh - 5rem); background: #f8fafc; font-family: 'Inter', system-ui, sans-serif; }

	/* Sidebars */
	.sidebar { width: 300px; background: white; color: #1e293b; display: flex; flex-direction: column; }
	.sidebar-header { padding: 1.25rem; background: #fff; border-bottom: 1px solid #f1f5f9; }
	.sidebar-header h2 { margin: 0; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 800; }
	
	.flow-sidebar { border-right: 1px solid #e2e8f0; }
	.users-sidebar { border-left: 1px solid #e2e8f0; }

	.brand { display: flex; align-items: center; gap: 0.75rem; }
	.dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 8px rgba(16, 185, 129, 0.4); }

	.flow-nav { flex: 1; overflow-y: auto; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.4rem; }
	.nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border: 1px solid transparent; border-radius: 10px; background: #f8fafc; color: #475569; cursor: pointer; text-align: left; transition: all 0.2s; }
	.nav-item:hover { background: #f1f5f9; color: #1e293b; }
	.nav-item.active { background: #eff6ff; border-color: #bfdbfe; color: #2563eb; }
	.nav-item.is-live { border-right: 4px solid #ef4444; }
	.nav-item.completed { opacity: 0.8; }
	
	.item-meta .label { font-size: 0.9rem; font-weight: 600; color: #334155; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
	.sub-meta { display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem; }
	.type-text { font-size: 0.65rem; color: #94a3b8; font-weight: bold; text-transform: uppercase; }
	.live-tag { font-size: 0.55rem; background: #ef4444; color: white; padding: 1px 4px; border-radius: 4px; font-weight: 900; }
	.done-tag { font-size: 0.55rem; background: #10b981; color: white; padding: 1px 4px; border-radius: 4px; font-weight: 900; }
	.nav-divider { padding: 1.25rem 0.5rem 0.5rem; font-size: 0.65rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }

	/* Users List */
	.users-list { flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
	.user-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: #f8fafc; border-radius: 12px; border: 1px solid #f1f5f9; transition: all 0.2s; }
	.user-row:hover { background: white; border-color: #e2e8f0; transform: translateY(-1px); box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
	.user-row.user-answered { border-color: #4ade80; background: #f0fdf4; }
	
	.user-info-row { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; }
	.user-name { font-size: 0.9rem; font-weight: 700; color: #1e293b; }
	
	.user-stats { display: flex; align-items: center; gap: 0.35rem; }
	.stat-count { font-size: 0.75rem; font-weight: 800; color: #2563eb; background: #eff6ff; padding: 0 0.4rem; border-radius: 4px; }
	.stat-label { font-size: 0.7rem; color: #64748b; font-weight: 600; text-transform: lowercase; }

	.user-participation-status { font-size: 1.2rem; margin-right: 0.5rem; }
	.status-thinking { display: inline-block; animation: rotate 2s infinite linear; }
	@keyframes rotate { from { transform: rotate(0); } to { transform: rotate(360deg); } }

	.user-status-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 6px rgba(34, 197, 94, 0.4); }
	.empty-users { text-align: center; color: #94a3b8; font-size: 0.8rem; margin-top: 2rem; }

	/* Main Panel */
	.main-panel { flex: 1; display: flex; flex-direction: column; padding: 2rem 2.5rem; overflow-y: auto; background: #f8fafc; }
	.panel-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
	.panel-header h1 { margin: 0; font-size: 2rem; color: #0f172a; font-weight: 800; line-height: 1.1; }
	.quiz-id { margin: 0.5rem 0 0; color: #64748b; font-weight: 500; font-size: 0.85rem; }

	.control-stack { display: flex; flex-direction: column; gap: 1.5rem; max-width: 900px; margin: 0 auto; width: 100%; }

	/* Preview Card */
	.preview-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
	.status-indicators { display: flex; gap: 1rem; align-items: center; }
	.live-indicator { color: #ef4444; font-weight: 800; font-size: 0.75rem; animation: blink 1s infinite; }
	.live-timer-badge { background: #0f172a; color: white; padding: 0.2rem 0.6rem; border-radius: 6px; font-weight: 900; font-size: 0.8rem; border: 1px solid #2563eb; }
	.prep-indicator { color: #f59e0b; font-weight: 800; font-size: 0.75rem; }
	.completed-badge { background: #dcfce7; color: #166534; font-size: 0.65rem; font-weight: 900; padding: 0.25rem 0.6rem; border-radius: 6px; }
	@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

	.preview-title { font-size: 1.5rem; color: #1e293b; margin: 0 0 1.25rem; line-height: 1.2; }
	.preview-content-box { background: #f8fafc; border-radius: 12px; padding: 1.25rem; border: 1px solid #f1f5f9; margin-bottom: 1.5rem; min-height: 150px; }
	.preview-specs { display: flex; gap: 1.25rem; font-size: 0.8rem; color: #64748b; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid #e2e8f0; }

	.options-preview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
	.opt-item { padding: 0.75rem; background: white; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; color: #475569; }
	.opt-item.is-correct { background: #f0fdf4; border-color: #4ade80; color: #166534; font-weight: 600; }

	.main-action-group { display: flex; gap: 1rem; }
	.primary-actions { flex: 1; }
	.mega-live-btn { width: 100%; padding: 1.25rem; background: #2563eb; color: white; border: none; border-radius: 10px; font-size: 1.1rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 1rem; transition: all 0.2s; box-shadow: 0 4px 12px rgba(37,99,235,0.2); }
	.mega-live-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 15px rgba(37,99,235,0.3); }
	.mega-live-btn.prep { background: #f59e0b; }
	.mega-live-btn.is-live { background: #ef4444; }

	.complete-btn { padding: 0 1.5rem; background: #f1f5f9; color: #475569; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
	.complete-btn:hover { background: #10b981; color: white; border-color: #10b981; }

	/* Video Controls */
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

	.no-quiz-state { flex: 1; display: flex; align-items: center; justify-content: center; text-align: center; }
	.warn-icon { font-size: 3rem; display: block; margin-bottom: 1rem; }

	@media (max-width: 1400px) {
		.sidebar { width: 260px; }
	}
</style>
