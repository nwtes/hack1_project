let globalTimeleft = 60;
let timerIntervalId = null;

function gameTimer(onTick) {
  return new Promise(resolve => {
    if (timerIntervalId) clearInterval(timerIntervalId);
    timerIntervalId = setInterval(() => {
      if (globalTimeleft <= 0) {
        clearInterval(timerIntervalId);
        timerIntervalId = null;
        resolve("TIMEOUT");
        return;
      }

      if (onTick) onTick(globalTimeleft);
      const timer = document.getElementById('timerDisplay');
      if (timer) timer.textContent = globalTimeleft;
      const score = document.getElementById('scoreDisplay');
      if (score) score.textContent = ("Your score: " + (typeof userScore === 'number' ? userScore : 0));
      globalTimeleft--;
    }, 1000);
  });
}

function waitForAnswer(){
  return new Promise(resolve => {
    clickResolver = (val) => {
      clickResolver = null;
      resolve(val);
    };
  });
}
function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function startGame() {
  if (isGameStarted) return;
  isGameStarted = true;
  const timerPromise = gameTimer((t) => console.log(t));
  if (card) card.classList.add('show');
  const score = document.getElementById('scoreDisplay');
  if (score) score.classList.add('show');
  console.log("Game started");
  while(globalTimeleft > 0 && isGameStarted) {
    const qA = generateRandomQuestion();
    const question = qA[0];
    currentAnswer = qA[1];
    const cardText = document.getElementById("card-text");
    if (cardText) cardText.textContent = question;
    const result = await Promise.race(
      [
        waitForAnswer(),
        timerPromise
      ]
    );
    if(result === currentAnswer){
      //Add correct answer visual feedback: {Animation for score increase, timer increase,and right country click}
      console.log("Correct!");
      globalTimeleft += 4;
      userScore = (typeof userScore === 'number' ? userScore : 0) + 300;
    } else if (result == "TIMEOUT"){
      //Add end game animtaion for final score display
      endGame();
      console.log("time ended");
      break;
    } else {
      //Add incorrect answer visual feedback: {Animation for score decrease, timer decrease,and incorrect country click}
      globalTimeleft = Math.max(0, globalTimeleft - 4);
      if(globalTimeleft == 0) endGame();
    }
  }
}
function endGame(){
  if (timerIntervalId) { clearInterval(timerIntervalId); timerIntervalId = null; }
  const score = document.getElementById('scoreDisplay');
  if (score) score.classList.remove('show');
  if (card) card.classList.remove('show');
  console.log("Game ended — stop gameplay here.");
  isGameStarted = false;
  userScore = 0;
  globalTimeleft = 60;
  const timer = document.getElementById('timerDisplay');
  if (timer) timer.textContent = globalTimeleft;
  if (clickResolver) { clickResolver("TIMEOUT"); clickResolver = null; } 
}