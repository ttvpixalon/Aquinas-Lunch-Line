let position = 10;
let coins = 0;
let attempts = 0;
let wins = 0;
let stamina = 5;
let gameOver = false;
let playerName = "";
let gameMode = "normal";
let moveCooldown = false;
let cooldownTime = 3;
let activeEffects = [];
let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

const events = [
    { text: "Sherand skips you! You move back a spot.", effect: 1 },
    { text: "Anthony skips you! You move back a spot.", effect: 1 },
    { text: "Walter skips you! You move back a spot.", effect: 1 },
    { text: "Walter buys out the rest of the menu! You lose!", effect: "lose" },
    { text: "Fire Drill! Everyone goes back to their original positions!", effect: "reset" },
    { text: "Food Poisoning Scare! The line stops for 3 turns.", effect: "pause" },
    { text: "You found a shortcut! Move ahead 2 spots!", effect: -2 },
    { text: "You successfully move forward!", effect: -1 },
    { text: "A teacher calls you to help! You lose 3 spots!", effect: 3 },
    { text: "A raffle winner is announced! Someone skips 5 spots!", effect: "raffle" },
    { text: "A prefect catches you! You are sent to the back!", effect: 10 }
];

function startGame() {
    playerName = document.getElementById("player-name").value || "Player";
    gameMode = document.getElementById("game-mode").value;
    position = 10;
    coins = 0;
    attempts = 0;
    stamina = 5;
    gameOver = false;
    moveCooldown = false;
    activeEffects = [];

    document.getElementById("start-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
    document.getElementById("display-name").innerText = playerName;

    loadPlayerStats();
    updateUI();
}

function attemptMove() {
    if (gameOver || moveCooldown || stamina <= 0) {
        if (stamina <= 0) {
            document.getElementById("event-log").innerText = "You're too tired to move! Resting...";
            stamina = 5;
            return;
        }
        return;
    }

    moveCooldown = true;
    document.getElementById("event-log").innerText = `Wait ${cooldownTime} seconds before moving again.`;
    setTimeout(() => {
        moveCooldown = false;
        document.getElementById("event-log").innerText = "You can move again!";
    }, cooldownTime * 1000);

    let event = events[Math.floor(Math.random() * events.length)];

    if (event.effect === "lose") {
        document.getElementById("story").innerText = "Walter bought everything. You lose!";
        document.getElementById("event-log").innerText = event.text;
        gameOver = true;
        return;
    } else if (event.effect === "reset") {
        position = 10;
    } else if (event.effect === "pause") {
        moveCooldown = true;
        setTimeout(() => {
            moveCooldown = false;
            document.getElementById("event-log").innerText = "The line is moving again!";
        }, 9000);
    } else if (event.effect === "raffle") {
        position = Math.max(position - 5, 1);
    } else {
        position += event.effect;
    }

    if (position < 1) position = 1;

    coins += 5;
    attempts++;
    stamina--;

    document.getElementById("story").innerText = event.text;
    document.getElementById("event-log").innerText = "Event: " + event.text;
    updateUI();

    if (position === 1) {
        wins++;
        savePlayerStats();
        updateLeaderboard(playerName, wins);
        document.getElementById("story").innerText = playerName + " reached the front! You win!";
        gameOver = true;
    }
}

function updateLeaderboard(name, winCount) {
    let player = leaderboard.find(p => p.name === name);
    if (player) {
        player.wins++;
        player.bestStreak = Math.max(player.bestStreak, player.wins);
        player.attempts += attempts;
    } else {
        leaderboard.push({ name, wins: winCount, bestStreak: winCount, attempts });
    }

    leaderboard.sort((a, b) => b.wins - a.wins);
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
    displayLeaderboard();
}

function displayLeaderboard() {
    let leaderboardBody = document.getElementById("leaderboard-body");
    leaderboardBody.innerHTML = "";
    leaderboard.forEach(player => {
        leaderboardBody.innerHTML += `<tr><td>${player.name}</td><td>${player.wins}</td><td>${player.bestStreak}</td><td>${player.attempts}</td></tr>`;
    });
}

function savePlayerStats() {
    localStorage.setItem(playerName, JSON.stringify({ wins, attempts }));
}

function loadPlayerStats() {
    let savedStats = JSON.parse(localStorage.getItem(playerName));
    if (savedStats) {
        wins = savedStats.wins;
        attempts = savedStats.attempts;
    }
    displayLeaderboard();
}

function updateUI() {
    document.getElementById("position").innerText = position;
    document.getElementById("coins").innerText = coins;
    document.getElementById("stamina").innerText = stamina;
    document.getElementById("attempts").innerText = attempts;
    document.getElementById("wins").innerText = wins;
    document.getElementById("progress-bar").style.width = ((10 - position) / 10) * 100 + "%";
}

/* SHOP SYSTEM */
function toggleShop() {
    let shop = document.getElementById("shop");
    shop.style.display = (shop.style.display === "none" || shop.style.display === "") ? "block" : "none";
}

function buyItem(item) {
    if (!shopItems[item]) return;

    let itemData = shopItems[item];

    if (coins < itemData.cost) {
        showNotification("Not enough coins!", "red");
        return;
    }

    coins -= itemData.cost;

    if (typeof itemData.effect === "number") {
        position += itemData.effect;
    } else if (itemData.effect === "teacher") {
        position = 2;
    } else if (itemData.effect === "front") {
        position = 1;
    } else if (itemData.effect === "blockSkips") {
        events = events.filter(e => !e.text.includes("skips"));
    } else if (itemData.effect === "doubleMove") {
        activeEffects.push("Speed Boost (3 turns)");
    } else if (itemData.effect === "stealth") {
        activeEffects.push("Stealth Mode (2 turns)");
    }

    updateUI();
    showNotification(`Purchased: ${itemData.description}`, "green");
}

/* NOTIFICATIONS */
function showNotification(message, color) {
    let notification = document.getElementById("purchase-notification");
    notification.innerText = message;
    notification.style.background = color;
    notification.style.display = "block";
    setTimeout(() => { notification.style.display = "none"; }, 2000);
}
