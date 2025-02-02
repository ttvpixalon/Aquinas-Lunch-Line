let position = 10;
let coins = 0;
let attempts = 0;
let wins = 0;
let stamina = 5; // Limits movement before resting
let gameOver = false;
let playerName = "";
let gameMode = "normal";
let moveCooldown = false;
let cooldownTime = 3;

const events = [
    { text: "Sherand skips you! You move back a spot.", effect: 1 },
    { text: "Anthony skips you! You move back a spot.", effect: 1 },
    { text: "Walter skips you! You move back a spot.", effect: 1 },
    { text: "Walter buys out the rest of the menu! You lose!", effect: "lose" },
    { text: "Fire Drill! Everyone goes back to their original positions!", effect: "reset" },
    { text: "Food Poisoning Scare! The line stops for 3 turns.", effect: "pause" },
    { text: "The lunch price inflated mid-line. You hesitate...", effect: 0 },
    { text: "You found a shortcut! Move ahead 2 spots!", effect: -2 },
    { text: "You successfully move forward!", effect: -1 },
    { text: "A teacher calls you to help! You lose 3 spots!", effect: 3 },
    { text: "A raffle winner is announced! Someone skips 5 spots!", effect: "raffle" },
    { text: "A prefect catches you! You are sent to the back!", effect: 10 }
];

const leaderboard = [];

function startGame() {
    playerName = document.getElementById("player-name").value || "Player";
    gameMode = document.getElementById("game-mode").value;
    position = 10;
    coins = 0;
    attempts = 0;
    stamina = 5;
    gameOver = false;
    moveCooldown = false;

    document.getElementById("start-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
    document.getElementById("display-name").innerText = playerName;

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
        updateLeaderboard(playerName, wins);
        document.getElementById("story").innerText = playerName + " reached the front! You win!";
        gameOver = true;
    }
}

function updateLeaderboard(name, winCount) {
    let player = leaderboard.find(p => p.name === name);
    if (player) {
        player.wins++;
    } else {
        leaderboard.push({ name, wins: winCount });
    }

    leaderboard.sort((a, b) => b.wins - a.wins);
    displayLeaderboard();
}

function displayLeaderboard() {
    let leaderboardBody = document.getElementById("leaderboard-body");
    leaderboardBody.innerHTML = "";
    leaderboard.forEach(player => {
        leaderboardBody.innerHTML += `<tr><td>${player.name}</td><td>${player.wins}</td></tr>`;
    });
}

function openShop() {
    document.getElementById("shop").style.display = "block";
}

function closeShop() {
    document.getElementById("shop").style.display = "none";
}

function buyItem(item) {
    if (moveCooldown) return;

    if (item === "bribe" && coins >= 25) {
        position -= 2;
        coins -= 25;
    } else if (item === "emergency" && coins >= 50) {
        position -= 5;
        coins -= 50;
    } else if (item === "stopWalter" && coins >= 75) {
        events.splice(events.findIndex(e => e.text.includes("Walter buys")), 1);
        coins -= 75;
    } else if (item === "teacher" && coins >= 100) {
        position = 2;
        coins -= 100;
    } else if (item === "lunchPass" && coins >= 150) {
        position = 1;
        coins -= 150;
    } else if (item === "securityBribe" && coins >= 80) {
        events = events.filter(e => !e.text.includes("skips"));
        coins -= 80;
    } else if (item === "fakePass" && coins >= 50) {
        if (Math.random() < 0.5) {
            position -= 3;
        } else {
            position += 5;
        }
        coins -= 50;
    } else if (item === "sneakyFriend" && coins >= 40) {
        position -= 1;
        coins -= 40;
    } else if (item === "speedBoost" && coins >= 30) {
        position -= 2;
        coins -= 30;
    } else if (item === "stealthMode" && coins >= 60) {
        moveCooldown = true;
        setTimeout(() => moveCooldown = false, 6000);
        coins -= 60;
    } else if (item === "chaosMode" && coins >= 90) {
        events = events.map(e => ({ ...e, effect: e.effect * -1 }));
        coins -= 90;
    } else {
        document.getElementById("event-log").innerText = "Not enough coins!";
        return;
    }

    if (position < 1) position = 1;
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
    document.getElementById("stamina").innerText = stamina;
    document.getElementById("attempts").innerText = attempts;
    document.getElementById("wins").innerText = wins;
    document.getElementById("progress-bar").style.width = ((10 - position) / 10) * 100 + "%";
}
