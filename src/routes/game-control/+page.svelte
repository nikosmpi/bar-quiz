<script>
	import { onMount, onDestroy } from 'svelte';
	import { joinRoom, sendCommand, getSocket } from '$lib/socket-client';
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	
	import FlowSidebar from '$lib/components/game-control/FlowSidebar.svelte';
	import UserListSidebar from '$lib/components/game-control/UserListSidebar.svelte';
	import ProductionConsole from '$lib/components/game-control/ProductionConsole.svelte';
	import ItemPreview from '$lib/components/game-control/ItemPreview.svelte';
	import VideoControls from '$lib/components/game-control/VideoControls.svelte';
	import ReviewPanel from '$lib/components/game-control/ReviewPanel.svelte';

	let { data } = $props();

	let questions = $state(data.questions);
	let selectedIndex = $state(-1); // -1 for Intro, 0+ for questions/cards
	let liveIndex = $state(-2); // Tracks what is currently live on Display
	let isPreparing = $state(false); // Tracks if we are in preparation mode for a question
	let isReviewMode = $state(false);
	let reviewSelectionId = $state(null);
	
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
				isReviewMode = false;
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

	function handleReviewSelect(question) {
		reviewSelectionId = question.id;
		handleCommand('SHOW_CONTENT', { 
			id: question.id, 
			type: 'question',
			index: questions.findIndex(q => q.id === question.id),
			item: question,
			isReview: true
		});
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
		<FlowSidebar 
			{questions} 
			{selectedIndex} 
			{liveIndex} 
			{isReviewMode}
			onSelect={(i) => { selectedIndex = i; isReviewMode = false; }} 
			onToggleReviewMode={() => isReviewMode = !isReviewMode}
		/>

		<ProductionConsole 
			activeQuiz={data.activeQuiz} 
			activeQuizId={data.activeQuizId} 
			onShowLeaderboard={() => handleCommand('SHOW_LEADERBOARD')} 
			onResetGame={resetGame}
		>
			{#if isReviewMode}
				<ReviewPanel 
					{questions} 
					activeReviewId={reviewSelectionId}
					onSelectQuestion={handleReviewSelect}
					onRevealAnswer={() => handleCommand('SHOW_CORRECT_ANSWER')}
				/>
			{:else}
				<ItemPreview 
					{selectedItem} 
					{liveIndex} 
					{selectedIndex} 
					{dashboardTimer} 
					{isPreparing} 
					questionNumber={getQuestionNumber(selectedIndex)}
					onPrepare={prepareQuestion}
					onGoLive={goLive}
					onMarkCompleted={markCompleted}
				/>

				<VideoControls 
					{selectedItem} 
					onAction={sendVideoAction} 
				/>
			{/if}
		</ProductionConsole>

		<UserListSidebar 
			{connectedUsers} 
			{totalQuestions} 
			isQuestionLive={!isReviewMode && selectedItem.type === 'question' && liveIndex === selectedIndex} 
		/>

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

	.no-quiz-state { flex: 1; display: flex; align-items: center; justify-content: center; text-align: center; }
	.warn-icon { font-size: 3rem; display: block; margin-bottom: 1rem; }
</style>

