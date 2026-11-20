const party = [
  { name: "Fighter", icon: "🛡️", hp: 50, maxHp: 50, mp: 0, maxMp: 0, atk: 14, mag: 0, defending: false },
  { name: "Thief",   icon: "🗡️", hp: 40, maxHp: 40, mp: 0, maxMp: 0, atk: 12, mag: 0, defending: false },
  { name: "W.Mage",  icon: "✨", hp: 32, maxHp: 32, mp: 20, maxMp: 20, atk: 5, mag: 18, defending: false },
  { name: "B.Mage",  icon: "🔥", hp: 28, maxHp: 28, mp: 20, maxMp: 20, atk: 4, mag: 22, defending: false }
];

const enemy = {
  name: "Dark Knight",
  hp: 120,
  maxHp: 120,
  atk: 16
};

let currentTurn = 0;
let battleOver = false;

function updateUI(logText) {
  if (logText) {
    document.getElementById("battle-log").textContent = logText;
  }

  // Update Enemy
  document.getElementById("enemy-name").textContent = enemy.name;
  document.getElementById("enemy-hp").textContent = Math.max(0, enemy.hp);
  document.getElementById("enemy-max-hp").textContent = enemy.maxHp;

  // Update Party Sprites & Stats
  const partyZone = document.getElementById("party-zone");
  const statsZone = document.getElementById("party-stats");
  partyZone.innerHTML = "";
  statsZone.innerHTML = "";

  party.forEach((hero, index) => {
    const isTurn = !battleOver && index === currentTurn;
    const isDead = hero.hp <= 0;

    // Sprite
    const sprite = document.createElement("div");
    sprite.className = `hero-sprite ${isTurn ? "active-turn" : ""} ${isDead ? "dead" : ""}`;
    sprite.textContent = `${hero.icon} ${hero.name}`;
    partyZone.appendChild(sprite);

    // Stat row
    const row = document.createElement("div");
    row.className = "stat-row";
    row.innerHTML = `
      <span>${hero.name}</span>
      <span>HP ${Math.max(0, hero.hp)}/${hero.maxHp} | MP ${hero.mp}/${hero.maxMp}</span>
    `;
    statsZone.appendChild(row);
  });

  // Update Command Header & Buttons
  const activeHero = party[currentTurn];
  const turnHeader = document.getElementById("active-member-name");
  const buttons = document.querySelectorAll("#command-box button");

  if (battleOver) {
    turnHeader.textContent = "Battle Ended";
    buttons.forEach(btn => (btn.disabled = true));
  } else {
    turnHeader.textContent = `${activeHero.name}'s Turn`;
    buttons[0].disabled = false; // Attack
    buttons[1].disabled = activeHero.mp < 5 || activeHero.mag === 0; // Fire
    buttons[2].disabled = activeHero.mp < 5 || activeHero.name !== "W.Mage"; // Cure
    buttons[3].disabled = false; // Defend
  }
}

function playerAction(type) {
  if (battleOver) return;

  const hero = party[currentTurn];
  hero.defending = false;
  let message = "";

  if (type === "attack") {
    const dmg = hero.atk + Math.floor(Math.random() * 5);
    enemy.hp -= dmg;
    message = `${hero.name} attacks for ${dmg} damage!`;
  } else if (type === "magic") {
    hero.mp -= 5;
    const dmg = hero.mag + Math.floor(Math.random() * 8);
    enemy.hp -= dmg;
    message = `${hero.name} casts FIRE for ${dmg} damage!`;
  } else if (type === "heal") {
    hero.mp -= 5;
    // Heal lowest HP living ally
    const target = party
      .filter(h => h.hp > 0)
      .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
    const healAmt = hero.mag;
    target.hp = Math.min(target.maxHp, target.hp + healAmt);
    message = `${hero.name} casts CURE on ${target.name} (+${healAmt} HP)!`;
  } else if (type === "defend") {
    hero.defending = true;
    message = `${hero.name} takes a defensive stance.`;
  }

  // Check Victory
  if (enemy.hp <= 0) {
    battleOver = true;
    updateUI(`${message} The ${enemy.name} is defeated! Victory!`);
    return;
  }

  advanceTurn(message);
}

function advanceTurn(lastMessage) {
  // Find next living party member
  let nextTurn = currentTurn + 1;
  while (nextTurn < party.length && party[nextTurn].hp <= 0) {
    nextTurn++;
  }

  if (nextTurn < party.length) {
    currentTurn = nextTurn;
    updateUI(lastMessage);
  } else {
    // Enemy's Turn
    updateUI(lastMessage);
    setTimeout(enemyTurn, 900);
  }
}

function enemyTurn() {
  const livingHeroes = party.filter(h => h.hp > 0);
  if (livingHeroes.length === 0) return;

  const target = livingHeroes[Math.floor(Math.random() * livingHeroes.length)];
  let dmg = enemy.atk + Math.floor(Math.random() * 6);
  if (target.defending) dmg = Math.floor(dmg / 2);

  target.hp -= dmg;
  let message = `${enemy.name} strikes ${target.name} for ${dmg} damage!`;

  // Check Party Wipe
  if (party.every(h => h.hp <= 0)) {
    battleOver = true;
    updateUI(`${message} The Light Warriors have fallen...`);
    return;
  }

  // Reset to first living party member
  currentTurn = party.findIndex(h => h.hp > 0);
  updateUI(message);
}

// Start game
updateUI("A Dark Knight blocks your path!");

