document.addEventListener("DOMContentLoaded", () => {
  const gameContainer = document.getElementById("game-container");
  const playButton = document.getElementById("play-button");
  const saveButton = document.getElementById("save-button");
  const loadButton = document.getElementById("load-button");
  const fileInput = document.getElementById("file-input");
  const levelSelect = document.getElementById("level-select");

  const colors = [
    "red",
    "blue",
    "green",
    "yellow",
    "orange",
    "purple",
    "pink",
    "brown",
    "cyan",
    "magenta",
    "lime",
    "teal",
    "indigo",
    "violet",
    "gold",
    "silver",
    "maroon",
    "navy",
    "olive",
    "coral",
  ];
  const tubes = [];
  let selectedTube = null;
  let levelCount = 1;

  function chooseLevel(level) {
    levelCount = level;
    document.getElementById("level-count").textContent = levelCount;
  }

  levelSelect.addEventListener("change", (event) => {
    const selectedLevel = parseInt(event.target.value, 10);
    chooseLevel(selectedLevel);
  });

  function checkGameState() {
    const allSameColor = (tube) => {
      const waters = Array.from(tube.children);
      return (
        waters.length === 4 &&
        waters.every(
          (water) =>
            water.style.backgroundColor === waters[0].style.backgroundColor
        )
      );
    };

    let completedTubes = 0;
    tubes.forEach((tube) => {
      if (allSameColor(tube)) {
        completedTubes++;
      }
    });
    document.getElementById("completed-tubes-count").textContent =
      completedTubes;

    if (
      tubes.every((tube) => tube.childElementCount === 0 || allSameColor(tube))
    ) {
      if (levelCount === 10) {
        alert("恭喜!你已經完成所有挑戰!!");
      } else {
        alert("你已經完成本關卡!");
        levelCount++;
        document.getElementById("level-count").textContent = levelCount;
        document.getElementById("completed-tubes-count").textContent = 0;
        chooseLevel(levelCount);
        createTubes();
        fillTubes();
      }
    }
  }

  function pourWater(fromTube, toTube) {
    let fromWater = fromTube.querySelector(".water:last-child");
    let toWater = toTube.querySelector(".water:last-child");

    if (!toWater) {
      const color = fromWater ? fromWater.style.backgroundColor : null;
      while (
        fromWater &&
        fromWater.style.backgroundColor === color &&
        toTube.childElementCount < 4
      ) {
        toTube.appendChild(fromWater);
        fromWater = fromTube.querySelector(".water:last-child");
      }
    } else {
      while (
        fromWater &&
        fromWater.style.backgroundColor === toWater.style.backgroundColor &&
        toTube.childElementCount < 4
      ) {
        toTube.appendChild(fromWater);
        fromWater = fromTube.querySelector(".water:last-child");
        toWater = toTube.querySelector(".water:last-child");
      }
    }
    checkGameState();
  }

  function selectTube(tube) {
    if (selectedTube) {
      if (selectedTube !== tube) {
        pourWater(selectedTube, tube);
      }
      selectedTube.classList.remove("selected");
      selectedTube = null;
    } else {
      selectedTube = tube;
      tube.classList.add("selected");
    }
  }

  function createTubes() {
    gameContainer.innerHTML = "";
    tubes.length = 0;

    for (let i = 0; i < levelCount + 1; i++) {
      const tube = document.createElement("div");
      tube.classList.add("tube");
      tube.addEventListener("click", () => selectTube(tube));
      gameContainer.appendChild(tube);
      tubes.push(tube);
    }

    for (let i = 0; i < 2; i++) {
      const emptyTube = document.createElement("div");
      emptyTube.classList.add("tube");
      emptyTube.addEventListener("click", () => selectTube(emptyTube));
      gameContainer.appendChild(emptyTube);
      tubes.push(emptyTube);
    }
  }

  function fillTubes() {
    const gameColors = colors.slice(0, Math.min(levelCount + 1, colors.length));
    const waterBlocks = [];

    gameColors.forEach((color) => {
      for (let i = 0; i < 4; i++) {
        waterBlocks.push(color);
      }
    });

    waterBlocks.sort(() => 0.5 - Math.random());

    let blockIndex = 0;
    tubes.slice(0, levelCount + 1).forEach((tube) => {
      for (let i = 0; i < 4; i++) {
        if (blockIndex < waterBlocks.length) {
          const water = document.createElement("div");
          water.classList.add("water");
          water.style.backgroundColor = waterBlocks[blockIndex];
          water.style.height = "20%";
          tube.appendChild(water);
          blockIndex++;
        }
      }
    });
  }

  function saveGame() {
    const gameState = {
      levelCount,
      tubes: tubes.map((tube) => {
        return Array.from(tube.children).map(
          (water) => water.style.backgroundColor
        );
      }),
    };

    const json = JSON.stringify(gameState, null, 2);
    const blob = new Blob([json], { type: "application/json" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `waterpz${String(levelCount).padStart(2, "0")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function loadGame(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const gameState = JSON.parse(e.target.result);

        levelCount = gameState.levelCount;
        document.getElementById("level-count").textContent = levelCount;

        tubes.length = 0;
        gameContainer.innerHTML = "";

        gameState.tubes.forEach((tubeColors) => {
          const tube = document.createElement("div");
          tube.classList.add("tube");
          tube.addEventListener("click", () => selectTube(tube));

          tubeColors.forEach((color) => {
            const water = document.createElement("div");
            water.classList.add("water");
            water.style.backgroundColor = color;
            water.style.height = "20%";
            tube.appendChild(water);
          });

          gameContainer.appendChild(tube);
          tubes.push(tube);
        });

        document.getElementById("completed-tubes-count").textContent = 0;
      } catch (error) {
        alert("讀取檔案失敗，請確認檔案格式正確！");
      }
    }; 

    reader.readAsText(file);
  }

  playButton.addEventListener("click", () => {
    tubes.length = 0;
    createTubes();
    fillTubes();
  });

  saveButton.addEventListener("click", saveGame);
  loadButton.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", loadGame);
});