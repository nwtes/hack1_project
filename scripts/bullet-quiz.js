let globalTimeleft = 60;
function gameTimer(onTick) {
  return new Promise(resolve => {
    const interval = setInterval(() => {
      if (globalTimeleft <= 0) {
        clearInterval(interval);
        resolve("TIMEOUT");
        return;
      }

      if (onTick) onTick(globalTimeleft);
      document.getElementById('timerDisplay').textContent = globalTimeleft
      scoreBar.textContent = ("Your score: " + userScore)
      globalTimeleft--;
    }, 1000);
  });
}
function waitForAnswer(){
  return new Promise(resolve => {
    clickResolver = resolve;
  })
}
function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms))
}
async function startGame() {
  isGameStarted = true;
  let quesiton;
  const timerPromise = gameTimer((t) => console.log(t))
  if (card) card.classList.add('show')
  if(scoreBar) scoreBar.classList.add('show')
  console.log("Game started");
  while(globalTimeleft > 0 && isGameStarted) {
    qA = generateRandomQuestion()
    quesiton = qA[0]
    currentAnswer = qA[1]
    document.getElementById("card-text").textContent = quesiton;
    const result = await Promise.race(
      [
        waitForAnswer(),
        timerPromise
      ]
    )
    if(result === currentAnswer){
      alert("You are correct!")
      globalTimeleft += 4
      userScore += 300
    }else if (result == "TIMEOUT"){
      endGame()
      alert("time ended")
      break
    }else{
      globalTimeleft -= 4
    }
  }
}
function endGame(){
  scoreBar.classList.remove('show')
  card.classList.remove('show')
  console.log("Game ended — stop gameplay here.");
  isGameStarted = false;
  userScore = 0
  globalTimeleft = 60;
  document.getElementById('timerDisplay').textContent = globalTimeleft
}

