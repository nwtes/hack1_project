/**
 * bullet-quiz.js
 *
 * Quick timed quiz engine used by the demo. This file provides a
 * small game loop built on a timer Promise and a click resolver that
 * the map interaction code resolves when the user clicks a country.
 *
 * Responsibilities:
 * - Manage countdown timer and tick updates
 * - Orchestrate question loop (generate question, wait for click or timeout)
 * - Provide visual hooks (timerEffect) for UI animations
 *
 * Globals referenced (provided by other files):
 * - generateRandomQuestion(): returns [questionText, answerText]
 * - clickResolver: function assigned when waiting for an answer (resolved by map click)
 * - card, userScore, isGameStarted, currentAnswer, infoAboutCountries, etc.
 */
let globalTimeleft = 60;
let timerIntervalId = null;
const correctSound = new Audio('./sounds/correct.mp3')
const wrongSound = new Audio('./sounds/wrong.mp3')

/**
 * Start a ticking timer that updates the UI each second.
 * Returns a Promise that resolves with the string "TIMEOUT" when the
 * countdown reaches zero. Caller must keep a reference if they want to
 * race against it.
 *
 * @param {(secondsLeft:number)=>void} [onTick] - optional callback called each second before decrement
 * @returns {Promise<string>} resolves to "TIMEOUT" when time runs out
 */
function gameTimer(onTick) {
  return new Promise(resolve => {
    if (timerIntervalId) clearInterval(timerIntervalId);
    timerIntervalId = setInterval(() => {
      if (globalTimeleft <= 0) {
        clearInterval(timerIntervalId);
        timerIntervalId = null;
        resolve('TIMEOUT');
        return;
      }

      if (onTick) onTick(globalTimeleft);
      const timer = document.getElementById('timerDisplay');
      if (timer) timer.textContent = globalTimeleft;
      const score = document.getElementById('scoreDisplay');
      if (score) score.textContent = ('Your score: ' + (typeof userScore === 'number' ? userScore : 0));
      globalTimeleft--;
    }, 1000);
  });
}

/**
 * waitForAnswer
 * Returns a Promise that resolves when the map click handler calls
 * the globally assigned `clickResolver`. This function installs a
 * temporary resolver and ensures it is cleared after use.
 *
 * @returns {Promise<string>} resolves with the clicked answer or custom token
 */
function waitForAnswer() {
  return new Promise(resolve => {
    clickResolver = (val) => {
      clickResolver = null;
      resolve(val);
    };
  });
}
/**
 * sleep
 * Small helper returning a Promise that resolves after ms milliseconds.
 * Useful for brief delays during async flows.
 *
 * @param {number} ms - milliseconds to wait
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * startGame
 * Main async game loop for a timed round. It starts a timer and then
 * repeatedly generates a question and waits for either a user's answer
 * via the map click (resolved by `clickResolver`) or the timer promise
 * to resolve. The loop updates `userScore` and `globalTimeleft`.
 */
async function startGame() {
  if (isGameStarted) return;
  isGameStarted = true;
  // ensure any previous end-of-round modal is closed
  try { const prev = document.getElementById('endGameModal'); if (prev) prev.remove(); } catch (e) {}
  const timerPromise = gameTimer();
  try { document.body.classList.add('in-quiz'); } catch (e) {}
  if (card) card.classList.add('show');
  if(showBtn) showBtn.style.display = 'none';
  const score = document.getElementById('scoreDisplay');
  if (score) score.classList.add('show');
  while (globalTimeleft > 0 && isGameStarted) {
    const qA = generateRandomQuestion();
    const question = qA[0];
    currentAnswer = qA[1];
    const cardText = document.getElementById('card-text');
    if (cardText) cardText.textContent = question;
    const result = await Promise.race([waitForAnswer(), timerPromise]);
    if (result === currentAnswer) {
      timerEffect(true);
      correctSound.currentTime = 0;
      correctSound.play();
      globalTimeleft += 4;
      userScore = (typeof userScore === 'number' ? userScore : 0) + 300;
    } else if (result == 'TIMEOUT') {
      endGame();
      break;
    } else {
      globalTimeleft = Math.max(0, globalTimeleft - 4);
      timerEffect(false);
      wrongSound.currentTime = 0;
      wrongSound.play();
      if (globalTimeleft == 0) endGame();
    }
  }
}

/**
 * endGame
 * Stop the timer, reset visible UI for the round and clear any pending
 * click resolver so the game loop can fully terminate.
 */
function endGame() {
  // capture final score before reset
  const finalScore = (typeof userScore === 'number') ? userScore : 0;
  if (timerIntervalId) { clearInterval(timerIntervalId); timerIntervalId = null; }
  const score = document.getElementById('scoreDisplay');
  if (score) score.classList.remove('show');
  if (card) card.classList.remove('show');
  if (showBtn) showBtn.style.display = 'block';
  try { document.body.classList.remove('in-quiz'); } catch (e) {}
  isGameStarted = false;
  // reset counters
  userScore = 0;
  globalTimeleft = 60;
  const timer = document.getElementById('timerDisplay');
  if (timer) timer.textContent = globalTimeleft;
  if (clickResolver) { clickResolver('TIMEOUT'); clickResolver = null; }

  // show a simple modal with the final score and actions
  try {
    let modal = document.getElementById('endGameModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'endGameModal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="endGameTitle">
          <h2 id="endGameTitle">Round complete</h2>
          <p id="endGameScore">Your score: ${finalScore}</p>
          <div class="modal-actions">
            <button id="playAgainBtn" class="timer-btn">Play again</button>
            <button id="closeModalBtn" class="timer-btn">Close</button>
          </div>
        </div>`;
      document.body.appendChild(modal);

      const playAgain = document.getElementById('playAgainBtn');
      const closeModal = document.getElementById('closeModalBtn');
      playAgain.addEventListener('click', () => {
        try { modal.remove(); } catch (e) {}
        setTimeout(() => { startGame(); }, 120);
      });
      closeModal.addEventListener('click', () => { try { modal.remove(); } catch (e) {} });
    } else {
      const scoreEl = document.getElementById('endGameScore');
      if (scoreEl) scoreEl.textContent = 'Your score: ' + finalScore;
      modal.style.display = 'block';
    }
  } catch (err) {
    console.warn('endGame modal failed', err);
  }
}

/**
 * timerEffect
 * Show a transient +4/-4 badge under the timer. This is a non-critical UI
 * helper and will silently no-op if the DOM element is not present.
 *
 * @param {boolean} correct - true to show +4 (green), false to show -4 (red)
 */
function timerEffect(correct) {
  try {
    const d = document.getElementById('timerDelta');
    if (!d) return;

    d.classList.remove('positive', 'negative', 'show');
    d.textContent = correct ? '+4' : '-4';
    d.classList.add(correct ? 'positive' : 'negative');

    void d.offsetWidth;
    d.classList.add('show');

    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      d.classList.remove('show');
      d.removeEventListener('animationend', onEnd);
      clearTimeout(fallback);
    };
    const onEnd = () => cleanup();
    d.addEventListener('animationend', onEnd);

    const fallback = setTimeout(cleanup, 900);
  } catch (err) {
    console.warn('timerEffect error', err);
  }
}