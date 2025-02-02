let position = 10;
let coins = 0;
let attempts = 0;
let wins = 0;
let gameOver = false;
let playerName = "";
let difficulty = "normal";
let moveCooldown = false; // Prevents spamming
let cooldownTime = 3; // Cooldown in seconds

const events = [
    { text: "Sherand skips you! You move back a spot.", effect: 1 },
    { text: "Anthony skips you! You move back a spot.", effect: 1 },
    { text: "Walter skips you! You move back a spot.", effect: 1 },
    { text: "Walter buys out the rest of the menu! You lose!", effect: "lose" },
    { text: "5 of your friends beg you to buy them the whole menu! You hesitate...", effect: 0 },
    { text: "Lunch is still cooking. You wait in frustration.", effect: 0 },
    { text: "Chicken burgers are finished. Everyone rushes past you! You move back 2 spots.", effect: 2 },
    { text: "The lunch price inflated mid-line. You pause for a moment.", effect: 0 },
    { text: "You found a shortcut! Move ahead 2 spots!", effect: -2 },
    { text: "You successfully move forward!", effect: -1 }
];

function startGame() {
    playerName = document.getElementById("player-name").value || "Player";
    difficulty = document.getElementById("difficulty").value;
    position = 10;
    coins = 0;
    attempts = 0;
    gameOver = false;
    moveCooldown = false;

    document.getElementById("start-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "block";

    document.getElementById("display-name").innerText = playerName;
    updateUI();
}

function attemptMove() {
    if (gameOver || moveCooldown) return;

    // Start cooldown
    moveCooldown = true;
    document.getElementById("event-log").innerText = `Wait ${cooldownTime} seconds before moving again.`;
    setTimeout(() => {
        moveCooldown = false;
        document.getElementById("event-log").innerText = "You can move again!";
    }, cooldownTime * 1000);

    let eventIndex = Math.floor(Math.random() * events.length);
    let event = events[eventIndex];

    if (event.effect === "lose") {
        document.getElementById("story").innerText = "Walter bought everything. You lose!";
        document.getElementById("event-log").innerText = event.text;
        gameOver = true;
        return;
    }

    position += event.effect; // Adjust position based on event effect

    // Prevent position from going below 1
    if (position < 1) {
        position = 1;
    }

    coins += 5;
    attempts++;

    document.getElementById("story").innerText = event.text;
    document.getElementById("event-log").innerText = "Event: " + event.text;
    updateUI();

    if (position === 1) {
        wins++;
        document.getElementById("story").innerText = playerName + " reached the front! You win!";
        gameOver = true;
    }
}

function openShop() {
    document.getElementById("shop").style.display = "block";
}

function closeShop() {
    document.getElementById("shop").style.display = "none";
}

function buyItem(item) {
    if (moveCooldown) return; // Prevent spamming shop purchases

    if (item === "bribe" && coins >= 10) {
        position -= 2;
        coins -= 10;
        document.getElementById("event-log").innerText = "You bribed someone! Moved ahead!";
    } else if (item === "emergency" && coins >= 15) {
        position -= 5;
        coins -= 15;
        document.getElementById("event-log").innerText = "You faked an emergency and rushed forward!";
    } else if (item === "stopWalter" && coins >= 20) {
        events.splice(events.findIndex(e => e.text.includes("Walter buys")), 1);
        coins -= 20;
        document.getElementById("event-log").innerText = "You stopped Walter from buying all the food!";
    } else {
        document.getElementById("event-log").innerText = "Not enough coins!";
        return;
    }

    // Prevent position from going below 1
    if (position < 1) {
        position = 1;
    }

    updateUI();
}

function giveUp() {
    document.getElementById("story").innerText = "You gave up. Maybe next time!";
    gameOver = true;
    updateUI();
}

function updateUI() {
    document.getElementById("position").innerText = position;
    document.getElementById("coins").innerText = coins;
    document.getElementById("attempts").innerText = attempts;
    document.getElementById("wins").innerText = wins;
    document.getElementById("progress-bar").style.width = ((10 - position) / 10) * 100 + "%";
}
