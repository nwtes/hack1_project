function gameTimer(durationInSeconds, onTick) {
  return new Promise(resolve => {
    let timeLeft = durationInSeconds;

    
    if (onTick) onTick(timeLeft);

    const interval = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        if (onTick) onTick(0);
        clearInterval(interval);
        resolve();
      } else {
        if (onTick) onTick(timeLeft);
      }
    }, 1000);
  });
}

async function startGame() {
  console.log("Game started");
  //Game start logic  
  await gameTimer(10, (t) => {
    console.log(`Time left: ${t}s`);
  });
  //Game end logic
  console.log("Game ended — stop gameplay here.");
}

startGame();
