const storageKey = "cyclops-button-community-state-v4";
const legacyStorageKeys = ["cyclops-button-community-state-v3", "cyclops-button-community-state-v2"];

const characterEggCost = 750;
const rerollCost = 200;
const lootCrateCost = 300;
const marketFee = 0.05;
const shardsPerEth = 12000;
const lootAssetRoot = "assets/item-concepts-cyclops/individual";

const raceSprites = {
  normal: "assets/NormalForward.png",
  elemental: "assets/ElementalForward.png",
  wood: "assets/WoodForward.png",
  stone: "assets/StoneForward.png",
  metal: "assets/MetalForward.png",
};

const classes = [
  {
    id: "mage",
    name: "Mage",
    bonus: "+2 Arcana",
    style: "Sorcery",
    statMods: { health: 0, violence: 0, power: 2, harmony: 0 },
    description: "Leans toward magical burst damage and breaking through Spirit-based defense.",
  },
  {
    id: "warrior",
    name: "Warrior",
    bonus: "+2 Might",
    style: "Bloodlust",
    statMods: { health: 0, violence: 2, power: 0, harmony: 0 },
    description: "Leans toward direct physical pressure and the strongest Might scaling.",
  },
  {
    id: "knight",
    name: "Knight",
    bonus: "+20 Health",
    style: "Fortify",
    statMods: { health: 20, violence: 0, power: 0, harmony: 0 },
    description: "Leans toward survival, defensive attacks, and repeated self-healing.",
  },
  {
    id: "shaman",
    name: "Shaman",
    bonus: "+2 Spirit",
    style: "Attune",
    statMods: { health: 0, violence: 0, power: 0, harmony: 2 },
    description: "Leans toward acting early, healing, energy recovery, and Spirit defense.",
  },
  {
    id: "rogue",
    name: "Rogue",
    bonus: "+1 Might, +1 Spirit",
    style: "Bloodlust or Attune",
    statMods: { health: 0, violence: 1, power: 0, harmony: 1 },
    description: "Begins as a physical and Spirit hybrid that can become aggressive or evasive.",
  },
  {
    id: "ranger",
    name: "Ranger",
    bonus: "+6 Health, +1 Might, +1 Spirit",
    style: "Any style",
    statMods: { health: 6, violence: 1, power: 0, harmony: 1 },
    description: "Begins with a broad spread and can be trained toward any combat style.",
  },
];

const combatStyles = [
  {
    id: "fortify",
    name: "Fortify",
    poweredBy: "Health",
    favoredClass: "Knight",
    selection: "Chosen when Health / 10 is the highest ability score.",
    bio: "The defensive style. The Character uses its race's Guard attack, deals damage from Health and Might, then restores Health after every attack.",
    result: "Best for surviving long fights. More Health improves durability, healing, and max button energy, but Health is divided by 10 when choosing the style.",
  },
  {
    id: "bloodlust",
    name: "Bloodlust",
    poweredBy: "Might",
    favoredClass: "Warrior",
    selection: "Chosen when Might is the highest ability score.",
    bio: "The physical offense style. The Character uses its race's Rush attack and converts Might into heavy direct damage. Arcana adds a smaller secondary bonus.",
    result: "Best for straightforward damage and click income. Bloodlust does not heal, increase initiative, or improve defense.",
  },
  {
    id: "sorcery",
    name: "Sorcery",
    poweredBy: "Arcana",
    favoredClass: "Mage",
    selection: "Chosen when Arcana is the highest ability score.",
    bio: "The magical offense style. Arcana is the stat; Sorcery is the combat style it unlocks. The Character uses its race's Burst attack, with Spirit adding secondary damage.",
    result: "Best for magical burst. High Arcana also reduces the protection an enemy receives when its Spirit is higher than your Arcana.",
  },
  {
    id: "attune",
    name: "Attune",
    poweredBy: "Spirit",
    favoredClass: "Shaman",
    selection: "Chosen when Spirit is the highest ability score.",
    bio: "The tempo and sustain style. The Character uses its race's Omen attack, deals Spirit-based damage, and restores Health after every attack.",
    result: "Best for acting earlier, healing, resisting low-Arcana attackers, refilling button energy, and improving lucky-signal chance.",
  },
];

const affinities = [
  {
    id: "normal",
    name: "Normal",
    color: "#d8c3a7",
    sprite: raceSprites.normal,
    access: "Starter",
    best: "Stable first pick",
    energy: 1000,
    regen: 41.67,
    steal: 1,
    description: "Balanced button economy with a 24-hour base refill. Beats Elemental in combat.",
  },
  {
    id: "elemental",
    name: "Elemental",
    color: "#8fd3ff",
    sprite: raceSprites.elemental,
    access: "Random hatch",
    best: "Burst extraction",
    energy: 500,
    regen: 20.83,
    steal: 1.8,
    description: "Small energy pool with the highest base extraction. Beats Metal in combat.",
  },
  {
    id: "wood",
    name: "Wood",
    color: "#55ef85",
    sprite: raceSprites.wood,
    access: "Random hatch",
    best: "Fast recovery",
    energy: 600,
    regen: 58.33,
    steal: 1,
    description: "Refills in about 10.3 hours for frequent play sessions. Beats Stone in combat.",
  },
  {
    id: "stone",
    name: "Stone",
    color: "#c5aa74",
    sprite: raceSprites.stone,
    access: "Random hatch",
    best: "Long sessions",
    energy: 1500,
    regen: 33.33,
    steal: 0.75,
    description: "Largest energy pool with slower extraction and a 45-hour base refill. Beats Normal in combat.",
  },
  {
    id: "metal",
    name: "Metal",
    color: "#b7c3d0",
    sprite: raceSprites.metal,
    access: "Random hatch",
    best: "Aggressive balance",
    energy: 800,
    regen: 33.33,
    steal: 1.5,
    description: "Strong base extraction with a full-day refill profile. Beats Wood in combat.",
  },
];

const classIdMap = {
  "signal-mage": "mage",
  "visor-warrior": "warrior",
  "bay-knight": "knight",
  "glitch-shaman": "shaman",
};

const affinityIdMap = {
  fire: "elemental",
  water: "elemental",
  arcane: "normal",
};

const rarities = [
  { name: "common", weight: 45, mult: 1, bonus: 0, color: "#92979c" },
  { name: "uncommon", weight: 25, mult: 1.08, bonus: 1, color: "#55ef85" },
  { name: "rare", weight: 18, mult: 1.18, bonus: 2, color: "#5ea9ff" },
  { name: "epic", weight: 9, mult: 1.38, bonus: 4, color: "#b879ff" },
  { name: "legendary", weight: 3, mult: 1.72, bonus: 7, color: "#f3c94c" },
];

const lootCategories = [
  {
    id: "lens",
    name: "Lens",
    primary: "steal",
    label: "Extraction",
    unit: "x",
    variants: [
      { name: "Cracked Red Visor Lens", image: `${lootAssetRoot}/lenses/cracked-red-visor-lens.png` },
      { name: "Gold Targeting Monocle", image: `${lootAssetRoot}/lenses/gold-targeting-monocle.png` },
      { name: "Portal Prism Lens", image: `${lootAssetRoot}/lenses/portal-prism-lens.png` },
      { name: "Obsidian Scope Lens", image: `${lootAssetRoot}/lenses/obsidian-scope-lens.png` },
      { name: "All-Seeing Relic Lens", image: `${lootAssetRoot}/lenses/all-seeing-relic-lens.png` },
    ],
    ranges: {
      common: [0.02, 0.05],
      uncommon: [0.05, 0.08],
      rare: [0.08, 0.12],
      epic: [0.12, 0.18],
      mythic: [0.18, 0.24],
      legendary: [0.24, 0.3],
      ancient: [0.3, 0.32],
    },
  },
  {
    id: "boots",
    name: "Boots",
    primary: "regen",
    label: "Regen",
    unit: "/h",
    variants: [
      { name: "Arcade Runner Boots", image: `${lootAssetRoot}/boots/arcade-runner-boots.png` },
      { name: "Bay Technician Boots", image: `${lootAssetRoot}/boots/bay-technician-boots.png` },
      { name: "Portal-Step Greaves", image: `${lootAssetRoot}/boots/portal-step-greaves.png` },
      { name: "Metal-Race Combat Boots", image: `${lootAssetRoot}/boots/metal-race-combat-boots.png` },
      { name: "Tournament Champion Boots", image: `${lootAssetRoot}/boots/tournament-champion-boots.png` },
    ],
    ranges: {
      common: [1, 2],
      uncommon: [2, 4],
      rare: [4, 7],
      epic: [7, 11],
      mythic: [11, 15],
      legendary: [15, 20],
      ancient: [20, 22],
    },
  },
  {
    id: "core",
    name: "Core",
    primary: "energy",
    label: "Max energy",
    unit: "",
    variants: [
      { name: "Salvaged Visor Battery", image: `${lootAssetRoot}/cores/salvaged-visor-battery.png` },
      { name: "Portal Reactor Core", image: `${lootAssetRoot}/cores/portal-reactor-core.png` },
      { name: "Arena Heart Core", image: `${lootAssetRoot}/cores/arena-heart-core.png` },
      { name: "Singularity Eye Core", image: `${lootAssetRoot}/cores/singularity-eye-core.png` },
    ],
    ranges: {
      common: [20, 50],
      uncommon: [50, 100],
      rare: [100, 175],
      epic: [175, 250],
      mythic: [250, 325],
      legendary: [325, 400],
      ancient: [400, 450],
    },
  },
  {
    id: "charm",
    name: "Charm",
    primary: "luck",
    label: "Signal multiplier",
    unit: "x",
    variants: [
      { name: "Iron Eye Token", image: `${lootAssetRoot}/charms/iron-eye-token.png` },
      { name: "Red Visor Pendant", image: `${lootAssetRoot}/charms/red-visor-pendant.png` },
      { name: "Portal Shard Charm", image: `${lootAssetRoot}/charms/portal-shard-charm.png` },
      { name: "Tournament Mark Medallion", image: `${lootAssetRoot}/charms/tournament-mark-medallion.png` },
      { name: "Orbital Eye Charm", image: `${lootAssetRoot}/charms/orbital-eye-charm.png` },
    ],
    ranges: {
      common: [0.1, 0.3],
      uncommon: [0.3, 0.6],
      rare: [0.6, 1.0],
      epic: [1.0, 1.6],
      mythic: [1.6, 2.4],
      legendary: [2.4, 3.4],
      ancient: [3.4, 5.0],
    },
  },
  {
    id: "relic",
    name: "Relic",
    primary: "farm",
    label: "Bay yield",
    unit: "%",
    variants: [
      { name: "Scratched Visor Token", image: `${lootAssetRoot}/relics/scratched-visor-token.png` },
      { name: "Miniature Button Shrine", image: `${lootAssetRoot}/relics/miniature-button-shrine.png` },
      { name: "Framed Portal Fragment", image: `${lootAssetRoot}/relics/framed-portal-fragment.png` },
      { name: "Tournament Mark Tablet", image: `${lootAssetRoot}/relics/tournament-mark-tablet.png` },
      { name: "Crown Visor Artifact", image: `${lootAssetRoot}/relics/crown-visor-artifact.png` },
    ],
    ranges: {
      common: [0.1, 0.25],
      uncommon: [0.25, 0.5],
      rare: [0.5, 0.85],
      epic: [0.85, 1.3],
      mythic: [1.3, 1.9],
      legendary: [1.9, 2.7],
      ancient: [2.7, 3.5],
    },
  },
];

const lootRarities = [
  { name: "common", weight: 35, color: "#a9a7a0", sideRolls: 1, sideScale: 1, durability: 100, repair: 0.2, scrap: 0.08, market: 0.95 },
  { name: "uncommon", weight: 35, color: "#55ef85", sideRolls: 1, sideScale: 2, durability: 120, repair: 0.3, scrap: 0.12, market: 1.35 },
  { name: "rare", weight: 20, color: "#6ea8d9", sideRolls: 1, sideScale: 3, durability: 150, repair: 0.45, scrap: 0.22, market: 2.25 },
  { name: "epic", weight: 7.7, color: "#b879ff", sideRolls: 2, sideScale: 5, durability: 190, repair: 0.7, scrap: 0.45, market: 4.6 },
  { name: "mythic", weight: 2, color: "#ff7fb7", sideRolls: 2, sideScale: 7, durability: 240, repair: 1.1, scrap: 1, market: 9.8 },
  { name: "legendary", weight: 0.25, color: "#f3c94c", sideRolls: 3, sideScale: 10, durability: 300, repair: 1.8, scrap: 2.5, market: 24 },
  { name: "ancient", weight: 0.05, color: "#f4f1e6", sideRolls: 3, sideScale: 14, durability: 380, repair: 2.6, scrap: 5, market: 48 },
];

const trainingOptions = [
  {
    id: "health",
    label: "Health",
    stat: "health",
    safeGain: 10,
    modGain: 20,
    intenseGain: 40,
    role: "Survival and energy capacity",
    plain: "Train Health when you want to survive longer in battle and store more button presses before running empty.",
    lightImpact: "One Light session adds 10 battle Health, 20 max energy, and 1 point to the Fortify selection score.",
    caution: "Health does not increase energy refill speed or shards earned per press.",
    description: "Each point gives +1 battle Health and +2 maximum button energy.",
    battleFormula: "Fortify score = Health / 10. Fortify base damage = Health x 0.10 + Might x 0.90, then heals round(Health x 0.04).",
  },
  {
    id: "violence",
    label: "Might",
    stat: "violence",
    safeGain: 1,
    modGain: 2,
    intenseGain: 4,
    role: "Physical damage and click income",
    plain: "Train Might when you want physical attacks to hit harder while also earning slightly more shards from every press.",
    lightImpact: "One Light session adds 1 Bloodlust score, 2.10 Bloodlust base damage, 0.035 extraction, and about 0.007 shards per press.",
    caution: "Might does not increase max energy, refill speed, initiative, or healing.",
    description: "Each point gives +0.035 extraction, worth +0.007 base shards per press.",
    battleFormula: "Bloodlust score = Might. Bloodlust base damage = Might x 2.10 + Arcana x 0.45. Might also adds 0.90 base damage to Fortify.",
  },
  {
    id: "power",
    label: "Arcana",
    stat: "power",
    safeGain: 1,
    modGain: 2,
    intenseGain: 4,
    role: "Spell damage and mixed economy",
    plain: "Train Arcana when you want strong spell attacks plus a small increase to both energy refill and shards per press.",
    lightImpact: "One Light session adds 1 Sorcery score, 2.05 Sorcery base damage, 0.20 energy per hour, and about 0.0036 shards per press.",
    caution: "Arcana is flexible, but Spirit refills energy faster and Might increases click income faster.",
    description: "Each point gives +0.20 energy/hour and +0.018 extraction, worth +0.0036 base shards per press.",
    battleFormula: "Sorcery score = Arcana. Sorcery base damage = Arcana x 2.05 + Spirit x 0.35. Arcana also helps break through an enemy's Spirit defense.",
  },
  {
    id: "harmony",
    label: "Spirit",
    stat: "harmony",
    safeGain: 1,
    modGain: 2,
    intenseGain: 4,
    role: "Speed, healing, defense, and recovery",
    plain: "Train Spirit when you want to act earlier, heal with Attune, resist low-Arcana attackers, refill energy faster, and find lucky signals more often.",
    lightImpact: "One Light session adds 1 Attune score, 1 initiative, 0.70 energy per hour, and about 0.009 percentage points to lucky-signal chance.",
    caution: "Spirit helps several systems, but it gives less direct attack damage than Might or Arcana.",
    description: "Each point gives +0.70 energy/hour and +0.015x to the lucky-signal multiplier.",
    battleFormula: "Attune score = Spirit. Attune base damage = Spirit x 1.65 + Arcana x 0.55, then heals round(Spirit x 0.35). Spirit also helps determine who attacks first.",
  },
];

const trainingModes = [
  { id: "light", label: "Light", chance: 1, gainKey: "safeGain", description: "Costs 1 TP and always succeeds." },
  { id: "moderate", label: "Moderate", chance: 0.45, gainKey: "modGain", description: "Costs 1 TP with a 45% success roll; failure gives no stat." },
  { id: "intense", label: "Intense", chance: 0.15, gainKey: "intenseGain", description: "Costs 1 TP with a 15% success roll; failure gives no stat." },
];

const allocations = [
  { name: "Presale", percent: 35, amount: "35,000,000", color: "#f3c94c" },
  { name: "Play-to-Earn", percent: 25, amount: "25,000,000", color: "#55ef85" },
  { name: "Liquidity", percent: 17.5, amount: "17,500,000", color: "#6ea8d9" },
  { name: "Referral and Growth", percent: 12.5, amount: "12,500,000", color: "#b879ff" },
  { name: "Treasury", percent: 5, amount: "5,000,000", color: "#d7a321" },
  { name: "Team", percent: 5, amount: "5,000,000", color: "#51606a" },
];

const contracts = [
  ["CYCLOPS token", "0x19C9...56A9"],
  ["Egg hatchery", "0x8CaA...06fF"],
  ["Loot crate", "0x7C0a...4441"],
  ["Marketplace", "0x3971...2884"],
  ["Character registry", "0xEBcA...1B11"],
  ["Treasury", "0xd612...989B"],
  ["Vesting", "0x2c8e...15E1"],
];

const chapters = [
  {
    id: "character-loop",
    title: "Character loop",
    summary: "Players begin with one Egg. Eggs hatch random Characters with race, class, rarity, and stats.",
    facts: [
      ["Starter", "1 free Egg"],
      ["Roster", "Multiple Characters"],
      ["Active", "1 clicking Character"],
      ["Reroll", "Destroys active"],
    ],
    body: [
      "A Character is the core playable unit. It controls clicker output and carries battle progression.",
      "Race owns the button profile, sprite, and combat matchup. Class supplies starting combat-stat bonuses. Rarity, training, and loot add visible numerical bonuses.",
      "Only one Character can be active at a time. The active Character powers the visor button.",
    ],
  },
  {
    id: "loot",
    title: "Loot",
    summary: "Loot crates roll one item. Category fixes the primary stat, rarity controls the range, and side rolls add combat stats.",
    facts: [
      ["Crate", "300 shards"],
      ["Equip", "1 item per Character"],
      ["Durability", "Item bonus scales with condition"],
      ["Sinks", "Repair, scrap, market fees"],
    ],
    body: [
      "Items should not be pure chaos. A Lens always rolls extraction, Boots always roll regen, a Core always rolls max energy, a Charm always rolls a signal multiplier, and a Relic always rolls bay yield.",
      "The random part is rarity, exact stat value, durability ceiling, and combat side rolls. That gives buyers a readable market while preserving chase value.",
      "Loot above zero durability works. Below 50% durability it contributes 60% of its listed bonuses. At zero durability it stays in inventory but contributes nothing until repaired.",
    ],
    kind: "loot",
  },
  {
    id: "classes",
    title: "Classes",
    summary: "Classes are combat roles. They add starting stats but do not secretly multiply button output.",
    facts: classes.map((item) => [item.name, item.bonus]),
    body: [
      "Mage starts with Arcana, Warrior with Might, Knight with Health, and Shaman with Spirit. Rogue and Ranger begin as hybrid roles.",
      "A Wood Ranger and Wood Shaman share the same Wood button profile and matchup. Their class bonuses only change starting combat stats and the training path they reach fastest.",
    ],
    kind: "classes",
  },
  {
    id: "affinities",
    title: "Races",
    summary: "Race sets the Character's button economy, sprite, and combat matchup.",
    facts: [
      ["Normal", "Beats Elemental"],
      ["Elemental", "Beats Metal"],
      ["Metal", "Beats Wood"],
      ["Wood", "Beats Stone"],
      ["Stone", "Beats Normal"],
    ],
    body: [
      "Each race has one readable base profile: maximum energy, hourly regeneration, and extraction. Training, account upgrades, and loot are added on top.",
      "A favorable matchup multiplies final attack damage by 1.16. A disadvantage multiplies it by 0.90. Neutral matchups use 1.00.",
      "Race art is currently shared by battle sprites. The enemy uses the forward-facing PNG, and your active Character uses the same sprite mirrored until dedicated player-side sheets are ready.",
    ],
    kind: "affinities",
  },
  {
    id: "training",
    title: "Training",
    summary: "Battles grant training points. Training increases Health, Might, Arcana, or Spirit with exact clicker and combat effects.",
    facts: [
      ["Light", "100% success"],
      ["Moderate", "45% success"],
      ["Intense", "15% success"],
      ["Cost", "1 TP per attempt"],
    ],
    body: [
      "Health gives +1 battle Health and +2 max energy per point. Might gives +0.035 extraction per point. Arcana gives +0.20 energy/hour and +0.018 extraction per point. Spirit gives +0.70 energy/hour and +0.015x lucky-signal multiplier per point.",
      "The combat ability is whichever score is highest: Health / 10 for Fortify, Might for Bloodlust, Arcana for Sorcery, or Spirit for Attune.",
      "Final damage is round((ability base - defense pressure + a random 4 to 12) x race matchup). Defense pressure is max(0, defender Spirit - attacker Arcana) x 0.18.",
      "Every attempt costs 1 TP. Light always succeeds and has the best average gain. Moderate and Intense are high-roll options: they can grant more at once, but failed training consumes the TP with no stat increase.",
    ],
  },
  {
    id: "battle",
    title: "Duels and the Mark",
    summary: "Duels are safe and grant TP. Fight 11 is a lethal tournament where the winner earns the Mark.",
    facts: [
      ["Duels", "Fights 1-10"],
      ["Festival", "Fight 11"],
      ["Tournament", "8 enter, 1 survives"],
      ["Reward", "The Mark"],
    ],
    body: [
      "Duels level the Character's battle record and grant one training point whether it wins or loses.",
      "On the 11th fight, the Character enters a multi-round tournament. If it loses, it becomes dead and can no longer click or train. If it wins, it survives, becomes Marked, and the account records a Mark for future use.",
    ],
  },
  {
    id: "systems",
    title: "Game systems",
    summary: "The clicker, roster, training room, arena, bay yield, loot crates, marketplace, quests, leaderboard, and profile all share one local state.",
    facts: [
      ["Press", "Costs 1 energy"],
      ["Bay", "8 hour offline cap"],
      ["Loot", "Character-bound items"],
      ["Market", "Shards and ETH simulation"],
    ],
    body: [
      "This alpha keeps progress in browser localStorage while the economy, sink ratios, market behavior, and contract-facing screens are designed.",
    ],
  },
  {
    id: "market",
    title: "Marketplace",
    summary: "The market simulates players buying and selling loot for shards or ETH before production contracts exist.",
    facts: [
      ["Currencies", "Shards and ETH"],
      ["Fee", "5%"],
      ["Seller tools", "List, cancel, settle"],
      ["Demand", "65% fill chance per tick"],
    ],
    body: [
      "Shard listings create an in-game liquidity loop. ETH listings model premium trades without requiring live wallet actions in the alpha.",
      "The fee gives the economy a sink: shard sales burn part of the gross sale, while ETH sales model marketplace take-rate without touching contracts.",
    ],
  },
  {
    id: "tokenomics",
    title: "Cyclops tokenomics",
    summary: "100M fixed CYCLOPS supply split across presale, play-to-earn, liquidity, growth, treasury, and team.",
    facts: [
      ["Supply", "100,000,000"],
      ["Presale", "35%"],
      ["Play-to-Earn", "25%"],
      ["Liquidity", "17.5%"],
    ],
    body: [
      "Shards are the game currency used for Eggs, loot crates, repairs, upgrades, bay levels, and marketplace trades.",
      "Production token and claim mechanics should be finalized only after the economy model, audit requirements, disclosures, and contract boundaries are locked.",
    ],
    kind: "tokenomics",
  },
  {
    id: "contracts",
    title: "Audit plan",
    summary: "Production wallet and contract flows should stay gated until audits, terms, and deployment addresses are final.",
    facts: contracts.slice(0, 4),
    body: [
      "This alpha is useful for tuning math and UX before irreversible wallet actions exist. Contract addresses shown here are planning labels, not deployment claims.",
    ],
    kind: "contracts",
  },
  {
    id: "terms",
    title: "Terms",
    summary: "This is experimental high-risk entertainment software in alpha.",
    facts: [
      ["Nature", "Entertainment software"],
      ["Risk", "No return promise"],
      ["Control", "Wallet owner responsible"],
      ["Audit", "Wallet actions gated"],
    ],
    body: [
      "Game balances, item rolls, fees, training odds, marketplace demand, and rewards are design variables until production terms are finalized.",
      "Wallet actions should be enabled only after audit review, public disclosures, and final contract deployment.",
    ],
  },
];

const mockPlayers = [
  { name: "@cyclops", character: "Elemental", className: "Warrior", total: 128000, steal: 2.8 },
  { name: "0x8f...21", character: "Metal", className: "Rogue", total: 84000, steal: 3.1 },
  { name: "0xa4...90", character: "Wood", className: "Mage", total: 72000, steal: 2.2 },
  { name: "0x57...ca", character: "Stone", className: "Knight", total: 63400, steal: 1.9 },
  { name: "@visorcrew", character: "Normal", className: "Shaman", total: 58150, steal: 2.4 },
  { name: "0xd1...44", character: "Wood", className: "Ranger", total: 21400, steal: 1.1 },
];

const questDefs = [
  { id: "first-press", title: "First Visor Ping", target: 25, metric: "clicks", reward: 25, text: "Press the visor button 25 times." },
  { id: "first-character", title: "First Character", target: 1, metric: "characters", reward: 50, text: "Mint your first Character." },
  { id: "shard-cache", title: "Shard Cache", target: 500, metric: "earned", reward: 80, text: "Extract 500 total shards." },
  { id: "training-room", title: "Training Room", target: 3, metric: "training", reward: 120, text: "Complete 3 training attempts." },
  { id: "duelist", title: "Duelist", target: 5, metric: "duels", reward: 160, text: "Fight 5 safe Duels." },
  { id: "marked", title: "Marked Survivor", target: 1, metric: "marks", reward: 500, text: "Win a tournament and earn the Mark." },
  { id: "burnt-offerings", title: "Burnt Offerings", target: 1000, metric: "burned", reward: 160, text: "Burn 1,000 shards in upgrades." },
  { id: "bay-hand", title: "Bay Technician", target: 3, metric: "bay", reward: 200, text: "Reach bay level 3." },
];

const defaultState = {
  shards: 900,
  totalEarned: 900,
  totalClicks: 0,
  burned: 0,
  energy: 0,
  accountLevel: 1,
  characterEggs: 1,
  charactersMinted: 0,
  activeCharacterId: null,
  characters: [],
  levels: { maxEnergy: 0, regen: 0, steal: 0 },
  farmLevel: 0,
  lootCratesOpened: 0,
  ethBalance: 0.08,
  referrals: 0,
  questRewards: [],
  inventory: [],
  marketListings: [],
  marketSales: 0,
  totalDuels: 0,
  totalTraining: 0,
  marks: [],
  battleScene: null,
  battleLog: ["System ready. Hatch your starter Egg to mint a Character."],
  chat: [
    { name: "operator", text: "Eggs mint Characters. Loot crates roll items. The market is live in simulation." },
    { name: "builder", text: "Characters are the core loop: hatch, train, equip, click, battle, Mark." },
  ],
  lastTick: Date.now(),
};

let state = loadState();
let activeChapter = chapters[0].id;
let activeDocFilter = "";
let battleAnimationTimer = null;
let audioContext = null;
let soundEnabled = localStorage.getItem("cyclops-button-sound") !== "off";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved) return normalizeState(saved);

    const legacyKey = legacyStorageKeys.find((key) => localStorage.getItem(key));
    const legacy = legacyKey ? JSON.parse(localStorage.getItem(legacyKey)) : null;
    if (legacy) {
      return normalizeState({
        ...structuredClone(defaultState),
        ...legacy,
        shards: legacy.shards || legacy.totalEarned || defaultState.shards,
        totalEarned: legacy.totalEarned || defaultState.totalEarned,
        totalClicks: legacy.totalClicks || 0,
        burned: legacy.burned || 0,
        farmLevel: legacy.farmLevel || 0,
        characterEggs: legacy.characterEggs ?? legacy.characterCrates ?? 1,
        lootCratesOpened: legacy.lootCratesOpened ?? legacy.crates ?? 0,
        inventory: legacy.inventory || [],
        questRewards: legacy.questRewards || [],
        chat: legacy.chat || defaultState.chat,
      });
    }
  } catch {
    return structuredClone(defaultState);
  }
  return structuredClone(defaultState);
}

function normalizeState(saved) {
  const next = {
    ...structuredClone(defaultState),
    ...saved,
    levels: { ...defaultState.levels, ...(saved.levels || {}) },
    characterEggs: saved.characterEggs ?? saved.characterCrates ?? defaultState.characterEggs,
    lootCratesOpened: saved.lootCratesOpened ?? saved.crates ?? 0,
    inventory: (saved.inventory || []).map(normalizeLootItem).filter(Boolean),
    characters: (saved.characters || []).map((character, index) => normalizeCharacter(character, index)),
    battleLog: saved.battleLog?.length ? saved.battleLog.slice(-40) : defaultState.battleLog,
    battleScene: null,
    marks: saved.marks || [],
    marketListings: (saved.marketListings || []).map(normalizeMarketListing).filter(Boolean),
    chat: (saved.chat || defaultState.chat).filter((message) => ["operator", "builder", "you"].includes(message.name)),
  };
  if (!next.chat.length) next.chat = structuredClone(defaultState.chat);
  next.marks = next.marks.map((mark) => {
    const character = next.characters.find((entry) => entry.id === mark.characterId);
    return character ? { ...mark, characterName: character.name } : mark;
  });
  next.characters.forEach((character) => {
    if (!next.inventory.some((item) => item.id === character.equippedLootId)) character.equippedLootId = null;
  });
  if (!next.marketListings.length) {
    next.marketListings = createMarketListings(8);
  }
  if (!next.characters.some((character) => character.id === next.activeCharacterId && character.state !== "dead")) {
    const fallback = next.characters.find((character) => character.state !== "dead");
    next.activeCharacterId = fallback?.id || null;
  }
  return next;
}

function normalizeCharacter(character, index = 0) {
  const {
    loadoutId: _legacyLoadoutId,
    title: _legacyTitle,
    traits: _legacyTraits,
    ...savedCharacter
  } = character;
  const normalizedClassId = classIdMap[character.classId] || character.classId || classes[0].id;
  const normalizedAffinityId = affinityIdMap[character.affinityId] || character.affinityId || affinities[0].id;
  const rarityName = getRarity(character.rarity).name;
  const isAiCharacter = String(character.id || "").startsWith("ai-");
  const canonicalName = /^[A-Z]+-\d{3,}$/.test(String(character.name || ""));
  const name = isAiCharacter || canonicalName ? character.name : `${rarityName.toUpperCase()}-${String(index + 1).padStart(3, "0")}`;
  return {
    trainingPoints: 1,
    trainedStats: { health: 0, violence: 0, power: 0, harmony: 0 },
    fightCount: 0,
    duelWins: 0,
    duelLosses: 0,
    streak: 0,
    state: "idle",
    marked: false,
    equippedLootId: null,
    lootPressCounter: 0,
    ...savedCharacter,
    name,
    rarity: rarityName,
    classId: normalizedClassId,
    affinityId: normalizedAffinityId,
    trainedStats: { health: 0, violence: 0, power: 0, harmony: 0, ...(character.trainedStats || {}) },
  };
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function getActiveCharacter() {
  return state.characters.find((character) => character.id === state.activeCharacterId) || null;
}

function getClass(id) {
  const mapped = classIdMap[id] || id;
  return classes.find((item) => item.id === mapped) || classes[0];
}

function getAffinity(id) {
  const mapped = affinityIdMap[id] || id;
  return affinities.find((item) => item.id === mapped) || affinities[0];
}

function getRaceSprite(id) {
  return getAffinity(id).sprite || raceSprites.normal;
}

function getRarity(name) {
  const normalized = String(name || "").toLowerCase();
  return rarities.find((item) => item.name === normalized) || rarities[0];
}

function getLootCategory(id) {
  return lootCategories.find((item) => item.id === id) || lootCategories[0];
}

function hashString(value) {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function getLootVariant(category, name, seed) {
  const normalizedName = String(name || "").toLowerCase();
  const exact = category.variants.find((variant) => normalizedName.includes(variant.name.toLowerCase()));
  if (exact) return exact;
  return category.variants[hashString(seed || normalizedName || category.id) % category.variants.length];
}

function getLootRarity(name) {
  const normalized = name === "special" ? "uncommon" : name;
  return lootRarities.find((item) => item.name === normalized) || lootRarities[0];
}

function getEquippedLoot(character) {
  if (!character?.equippedLootId) return null;
  return state.inventory.find((item) => item.id === character.equippedLootId) || null;
}

function lootDurabilityScale(item) {
  if (!item || item.durability <= 0) return 0;
  const ratio = item.durability / item.maxDurability;
  return ratio >= 0.5 ? 1 : 0.6;
}

function getLootBonuses(character) {
  const item = getEquippedLoot(character);
  const bonuses = {
    steal: 0,
    regen: 0,
    energy: 0,
    luck: 0,
    farm: 0,
    combat: { health: 0, violence: 0, power: 0, harmony: 0 },
    item,
  };
  if (!item) return bonuses;
  const scale = lootDurabilityScale(item);
  bonuses[item.primaryStat] += item.primaryValue * scale;
  for (const [stat, value] of Object.entries(item.sideStats || {})) {
    bonuses.combat[stat] += Math.round(value * scale);
  }
  return bonuses;
}

function getCharacterStats(character) {
  if (!character) return { health: 0, violence: 0, power: 0, harmony: 0 };
  const classInfo = getClass(character.classId);
  const rarity = getRarity(character.rarity);
  const loot = getLootBonuses(character);
  const stats = {
    health: 50 + rarity.bonus * 4,
    violence: 5 + rarity.bonus,
    power: 5 + rarity.bonus,
    harmony: 5 + rarity.bonus,
  };

  for (const [stat, value] of Object.entries(classInfo.statMods)) {
    stats[stat] += value;
  }
  for (const [stat, value] of Object.entries(character.trainedStats || {})) {
    stats[stat] += value;
  }
  for (const [stat, value] of Object.entries(loot.combat)) {
    stats[stat] += value;
  }
  return stats;
}

function getStats() {
  const character = getActiveCharacter();
  if (!character || character.state === "dead") {
    return {
      maxEnergy: 0,
      regen: 0,
      steal: 0,
      reward: 0,
      partyBonus: 1,
      luck: 0,
      luckyChance: 0,
      characterStats: getCharacterStats(null),
    };
  }
  const race = getAffinity(character.affinityId);
  const battleStats = getCharacterStats(character);
  const loot = getLootBonuses(character);
  const maxEnergy = Math.round(race.energy + state.levels.maxEnergy * 80 + loot.energy + battleStats.health * 2);
  const regen = race.regen + state.levels.regen * 7 + loot.regen + battleStats.harmony * 0.7 + battleStats.power * 0.2;
  const steal = race.steal + state.levels.steal * 0.18 + loot.steal + battleStats.violence * 0.035 + battleStats.power * 0.018;
  const partyBonus = state.referrals >= 2 ? 1.018 : 1;
  const reward = 0.2 * steal * partyBonus;
  const luck = 1 + loot.luck + battleStats.harmony * 0.015;
  const luckyChance = 0.00582 * luck;
  return { maxEnergy, regen, steal, reward, partyBonus, luck, luckyChance, characterStats: battleStats, loot };
}

function tick() {
  const now = Date.now();
  const elapsedSeconds = Math.max(0, Math.min((now - state.lastTick) / 1000, 8 * 60 * 60));
  state.lastTick = now;
  const stats = getStats();
  state.energy = Math.min(stats.maxEnergy, state.energy + (stats.regen / 3600) * elapsedSeconds);
  const bayGain = getFarmCps() * elapsedSeconds;
  if (bayGain > 0) {
    state.shards += bayGain;
    state.totalEarned += bayGain;
  }
  saveState();
}

function getFarmCps() {
  const character = getActiveCharacter();
  const loot = getLootBonuses(character);
  const base = state.farmLevel === 0 ? 0 : 0.018 * state.farmLevel ** 1.22;
  return base * (1 + loot.farm / 100);
}

function fmt(value, digits = 0) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

function money(value) {
  return `${fmt(value, value < 1000 ? 2 : 0)} shards`;
}

function raceRefillHours(race) {
  return race.regen <= 0 ? 0 : race.energy / race.regen;
}

function raceMetricLine(race) {
  return `${fmt(race.energy)} base energy | ${fmt(race.regen, 2)} energy/h | ~${fmt(raceRefillHours(race), 1)}h refill | ${fmt(race.steal, 2)} base extraction`;
}

function costFor(type) {
  const level = state.levels[type] || 0;
  const base = { maxEnergy: 120, regen: 150, steal: 180 }[type];
  return Math.round(base * 1.58 ** level);
}

function farmCost() {
  return Math.round(320 * 1.72 ** state.farmLevel);
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

function addBattleLog(message) {
  state.battleLog.unshift(message);
  state.battleLog = state.battleLog.slice(0, 40);
}

function routeTo(route) {
  const target = $(`[data-view="${route}"]`) ? route : "play";
  $$(".view").forEach((view) => view.classList.toggle("is-active", view.dataset.view === target));
  $$("[data-route-link]").forEach((link) => link.classList.toggle("is-active", link.dataset.routeLink === target));
  $("#topNav").classList.remove("is-open");
  $("#navToggle").setAttribute("aria-expanded", "false");
  $("#moreNav")?.classList.remove("is-open");
  $("#moreToggle")?.setAttribute("aria-expanded", "false");
  if (location.hash.slice(1) !== target) {
    history.replaceState(null, "", `#${target}`);
  }
  playSfx("navigate");
  render();
}

function initNavigation() {
  $$("[data-route-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      routeTo(link.dataset.routeLink);
    });
  });
  $("#navToggle").addEventListener("click", () => {
    const nav = $("#topNav");
    const open = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", open);
    $("#navToggle").setAttribute("aria-expanded", String(open));
  });
  $("#moreToggle").addEventListener("click", () => {
    const nav = $("#moreNav");
    const open = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", open);
    $("#moreToggle").setAttribute("aria-expanded", String(open));
  });
  window.addEventListener("hashchange", () => routeTo(location.hash.slice(1) || "play"));
}

function initTheme() {
  const saved = localStorage.getItem("cyclops-button-theme") || "dark";
  document.documentElement.dataset.theme = saved;
  $("#themeToggle").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("cyclops-button-theme", next);
  });
}

function initControls() {
  $("#pressButton").addEventListener("click", pressButton);
  $("#quickPress").addEventListener("click", pressButton);
  $("#openCharacterGuide").addEventListener("click", openCharacterGuide);
  $("#resetRun").addEventListener("click", () => {
    state = normalizeState(structuredClone(defaultState));
    saveState();
    render();
    showToast("Local run reset.");
  });
  $("#docSearch").addEventListener("input", (event) => {
    activeDocFilter = event.target.value.trim().toLowerCase();
    renderDocs();
  });
  $("#buyFarm").addEventListener("click", buyFarm);
  $("#buyFarmMain").addEventListener("click", buyFarm);
  $("#openCrate").addEventListener("click", openLootCrate);
  $("#settleMarket").addEventListener("click", settleMarket);
  $("#copyReferral").addEventListener("click", copyReferral);
  $("#chatForm").addEventListener("submit", sendChat);
  $("#openCharacterEgg").addEventListener("click", openCharacterEgg);
  $("#buyCharacterEgg").addEventListener("click", buyCharacterEgg);
  $("#rerollActive").addEventListener("click", rerollActiveCharacter);
  $("#duelButton").addEventListener("click", fightNextBattle);
  $("#practiceButton").addEventListener("click", practiceBattle);
  $("#devAddShards").addEventListener("click", addDevShards);
  $("#soundToggle").addEventListener("click", toggleSound);
  renderSoundToggle();
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem("cyclops-button-sound", soundEnabled ? "on" : "off");
  renderSoundToggle();
  if (soundEnabled) playSfx("confirm");
}

function renderSoundToggle() {
  const button = $("#soundToggle");
  if (!button) return;
  button.setAttribute("aria-pressed", String(soundEnabled));
  button.textContent = soundEnabled ? "Sound" : "Muted";
}

function getAudioContext() {
  if (!soundEnabled) return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  audioContext ||= new AudioContextClass();
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

function playTone(frequency, duration, type = "square", volume = 0.035, delay = 0, endFrequency = null) {
  const context = getAudioContext();
  if (!context) return;
  const start = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function playSfx(name) {
  if (!soundEnabled) return;
  if (name === "press") {
    playTone(92, 0.085, "square", 0.045, 0, 62);
    playTone(420, 0.055, "triangle", 0.025, 0.02, 620);
  } else if (name === "lucky") {
    [620, 780, 980].forEach((frequency, index) => playTone(frequency, 0.15, "square", 0.025, index * 0.055));
  } else if (name === "attack") {
    playTone(155, 0.12, "sawtooth", 0.035, 0, 72);
    playTone(510, 0.06, "square", 0.018, 0.055, 180);
  } else if (name === "hit") {
    playTone(74, 0.16, "square", 0.05, 0, 42);
  } else if (name === "victory") {
    [392, 523, 659, 784].forEach((frequency, index) => playTone(frequency, 0.2, "square", 0.025, index * 0.08));
  } else if (name === "purchase") {
    playTone(310, 0.08, "square", 0.025);
    playTone(465, 0.11, "square", 0.025, 0.07);
  } else if (name === "confirm") {
    playTone(440, 0.09, "triangle", 0.025, 0, 660);
  } else if (name === "navigate") {
    playTone(240, 0.04, "square", 0.012);
  }
}

function addDevShards() {
  state.shards += 1000;
  $("#topNav").classList.remove("is-open");
  $("#navToggle").setAttribute("aria-expanded", "false");
  saveState();
  render();
  showToast("DEV: added 1,000 test shards.");
}

function pressButton() {
  tick();
  const character = getActiveCharacter();
  if (!character || character.state === "dead") {
    $("#lastPressNote").textContent = "Hatch a Character Egg and select a living Character before pressing.";
    showToast("No active living Character.");
    render();
    return;
  }
  if (state.energy < 1) {
    $("#lastPressNote").textContent = "Energy is empty. Let regen work or train a better Character.";
    showToast("Out of energy.");
    render();
    return;
  }

  const stats = getStats();
  state.energy -= 1;
  let gain = stats.reward;
  const luckyChance = stats.luckyChance;
  let luckySignal = false;
  let note = `${character.name} extracted +${fmt(gain, 2)} shards.`;
  if (Math.random() < luckyChance) {
    const lucky = 2 + Math.random() * 38;
    gain += lucky;
    luckySignal = true;
    note = `${character.name} hit a lucky signal: +${fmt(gain, 2)} total.`;
  }
  state.shards += gain;
  state.totalEarned += gain;
  state.totalClicks += 1;
  character.lootPressCounter = (character.lootPressCounter || 0) + 1;
  if (character.lootPressCounter % 25 === 0) {
    damageEquippedLoot(character, 1);
  }
  state.lastTick = Date.now();
  $("#lastPressNote").textContent = note;
  saveState();
  render();
  playSfx(luckySignal ? "lucky" : "press");
  animatePress(gain, luckySignal);
}

function animatePress(gain, luckySignal) {
  const button = $("#pressButton");
  const effects = $("#pressEffects");
  if (!button || !effects) return;
  button.classList.remove("is-pressed");
  void button.offsetWidth;
  button.classList.add("is-pressed");
  window.setTimeout(() => button.classList.remove("is-pressed"), 130);
  const float = document.createElement("span");
  float.className = `press-float${luckySignal ? " is-lucky" : ""}`;
  float.textContent = `+${fmt(gain, 2)}${luckySignal ? " Lucky signal" : ""}`;
  effects.appendChild(float);
  window.setTimeout(() => float.remove(), 950);
}

function buyUpgrade(type) {
  tick();
  const cost = costFor(type);
  if (state.shards < cost) {
    showToast(`Need ${money(cost)}.`);
    return;
  }
  state.shards -= cost;
  state.burned += cost;
  state.levels[type] += 1;
  saveState();
  render();
  playSfx("purchase");
  showToast("Upgrade bought and shards burned.");
}

function buyFarm() {
  tick();
  const cost = farmCost();
  if (state.shards < cost) {
    showToast(`Need ${money(cost)}.`);
    return;
  }
  state.shards -= cost;
  state.burned += cost;
  state.farmLevel += 1;
  saveState();
  render();
  playSfx("purchase");
  showToast("Bay level bought.");
}

function weightedPick(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items[0];
}

function randomFrom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomBetween([min, max], digits = 2) {
  const value = min + Math.random() * (max - min);
  return Number(value.toFixed(digits));
}

function normalizeLootItem(item) {
  if (!item) return null;
  const slotMap = { cape: "lens", boots: "boots", hat: "core", ring: "charm", amulet: "relic" };
  const categoryId = item.categoryId || slotMap[item.slot] || slotMap[item.stat] || "lens";
  const category = getLootCategory(categoryId);
  const rarity = getLootRarity(item.rarity);
  const range = category.ranges[rarity.name];
  const primaryValue = Number(item.primaryValue ?? item.value ?? randomBetween(range, category.primary === "energy" ? 0 : 2));
  const quality = item.quality ?? Math.max(0, Math.min(1, (primaryValue - range[0]) / Math.max(0.0001, range[1] - range[0])));
  const normalizedItemName = String(item.name || "").toLowerCase();
  const knownVariant = category.variants.find((entry) => normalizedItemName.includes(entry.name.toLowerCase()));
  const variant = knownVariant || getLootVariant(category, item.name, item.id);
  return {
    id: item.id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())),
    name: knownVariant ? item.name : `${rarity.name.toUpperCase()} ${variant.name}`,
    categoryId: category.id,
    category: category.name,
    image: variant.image,
    primaryStat: item.primaryStat || category.primary,
    primaryValue,
    sideStats: { ...(item.sideStats || {}) },
    rarity: rarity.name,
    color: item.color || rarity.color,
    durability: Math.max(0, Math.min(item.durability ?? rarity.durability, item.maxDurability ?? rarity.durability)),
    maxDurability: item.maxDurability || rarity.durability,
    quality,
    mintedAt: item.mintedAt || Date.now(),
  };
}

function createLootItem() {
  const category = randomFrom(lootCategories);
  const rarity = weightedPick(lootRarities);
  const variant = randomFrom(category.variants);
  const range = category.ranges[rarity.name];
  const primaryValue = randomBetween(range, category.primary === "energy" ? 0 : 2);
  const quality = Math.max(0, Math.min(1, (primaryValue - range[0]) / Math.max(0.0001, range[1] - range[0])));
  return normalizeLootItem({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    name: `${rarity.name.toUpperCase()} ${variant.name}`,
    categoryId: category.id,
    image: variant.image,
    primaryStat: category.primary,
    primaryValue,
    sideStats: rollLootSideStats(rarity),
    rarity: rarity.name,
    color: rarity.color,
    durability: rarity.durability,
    maxDurability: rarity.durability,
    quality,
    mintedAt: Date.now(),
  });
}

function rollLootSideStats(rarity) {
  const stats = {};
  const pool = ["health", "violence", "power", "harmony"];
  for (let index = 0; index < rarity.sideRolls; index += 1) {
    const stat = randomFrom(pool);
    const floor = stat === "health" ? 4 : 1;
    const ceiling = stat === "health" ? 9 : 3;
    stats[stat] = (stats[stat] || 0) + Math.ceil(randomBetween([floor, ceiling], 0) * rarity.sideScale);
  }
  return stats;
}

function damageEquippedLoot(character, amount) {
  const item = getEquippedLoot(character);
  if (!item || item.durability <= 0) return;
  item.durability = Math.max(0, item.durability - amount);
}

function repairCost(item) {
  const rarity = getLootRarity(item.rarity);
  const missing = Math.max(0, item.maxDurability - item.durability);
  return Math.ceil((missing / item.maxDurability) * lootCrateCost * rarity.repair);
}

function scrapValue(item) {
  const rarity = getLootRarity(item.rarity);
  const durabilityFactor = 0.4 + 0.6 * (item.durability / item.maxDurability);
  const qualityFactor = 0.75 + item.quality * 0.5;
  return Math.max(1, Math.round(lootCrateCost * rarity.scrap * durabilityFactor * qualityFactor));
}

function marketShardValue(item) {
  const rarity = getLootRarity(item.rarity);
  const durabilityFactor = 0.7 + 0.3 * (item.durability / item.maxDurability);
  const qualityFactor = 0.85 + item.quality * 0.4;
  return Math.max(20, Math.round(lootCrateCost * rarity.market * durabilityFactor * qualityFactor));
}

function marketEthValue(item) {
  return Number((marketShardValue(item) / shardsPerEth).toFixed(4));
}

function normalizeMarketListing(listing) {
  const item = normalizeLootItem(listing.item);
  if (!item) return null;
  const currency = listing.currency === "eth" ? "eth" : "shards";
  return {
    id: listing.id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())),
    seller: listing.seller || "market-maker",
    currency,
    price: Number(listing.price || (currency === "eth" ? marketEthValue(item) : marketShardValue(item))),
    item,
    createdAt: listing.createdAt || Date.now(),
  };
}

function createMarketListings(count = 8) {
  return Array.from({ length: count }, (_, index) => {
    const item = createLootItem();
    const currency = index % 3 === 0 ? "eth" : "shards";
    return normalizeMarketListing({
      seller: randomFrom(["0x7b...CYC", "visor.labs", "one-eye.eth", "baydesk", "0xMARK...11"]),
      currency,
      price: currency === "eth" ? marketEthValue(item) : marketShardValue(item),
      item,
    });
  });
}

function formatLootPrimary(item) {
  const category = getLootCategory(item.categoryId);
  const value = item.primaryStat === "energy" ? fmt(item.primaryValue) : fmt(item.primaryValue, 2);
  return `+${value}${category.unit} ${category.label}`;
}

function formatSideStats(item) {
  const entries = Object.entries(item.sideStats || {});
  if (!entries.length) return "No combat side roll";
  return entries.map(([stat, value]) => `+${value} ${labelStat(stat)}`).join(" | ");
}

function createCharacter() {
  const rarity = weightedPick(rarities);
  const classInfo = randomFrom(classes);
  const affinity = randomFrom(affinities);
  state.charactersMinted += 1;
  const serial = String(state.charactersMinted).padStart(3, "0");
  return normalizeCharacter({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    name: `${rarity.name.toUpperCase()}-${serial}`,
    classId: classInfo.id,
    affinityId: affinity.id,
    rarity: rarity.name,
    mintedAt: Date.now(),
  });
}

function openCharacterEgg() {
  if (state.characterEggs < 1) {
    showToast("Buy a Character Egg first.");
    return;
  }
  const character = createCharacter();
  state.characterEggs -= 1;
  state.characters.unshift(character);
  state.activeCharacterId = character.id;
  state.energy = getStatsForCharacter(character).maxEnergy;
  $("#characterEggResult").innerHTML = `<strong>${character.name}</strong><br>${getCharacterLine(character)}`;
  addBattleLog(`${character.name} hatched from a Character Egg.`);
  saveState();
  render();
  playSfx("victory");
  showToast(`${character.name} hatched.`);
}

function buyCharacterEgg() {
  if (state.shards < characterEggCost) {
    showToast(`Need ${money(characterEggCost)}.`);
    return;
  }
  state.shards -= characterEggCost;
  state.burned += characterEggCost;
  state.characterEggs += 1;
  saveState();
  render();
  playSfx("purchase");
  showToast("Character Egg bought.");
}

function rerollActiveCharacter() {
  const character = getActiveCharacter();
  if (!character) {
    showToast("No active Character to reroll.");
    return;
  }
  if (character.marked) {
    showToast("Marked Characters cannot be rerolled.");
    return;
  }
  if (state.shards < rerollCost) {
    showToast(`Need ${money(rerollCost)}.`);
    return;
  }
  character.state = "dead";
  character.deathReason = "Rerolled";
  state.shards -= rerollCost;
  state.burned += rerollCost;
  const replacement = createCharacter();
  state.characters.unshift(replacement);
  state.activeCharacterId = replacement.id;
  state.energy = getStatsForCharacter(replacement).maxEnergy;
  addBattleLog(`${character.name} was destroyed by reroll. ${replacement.name} replaced it.`);
  saveState();
  render();
  showToast("Active Character rerolled.");
}

function selectCharacter(id) {
  const character = state.characters.find((entry) => entry.id === id);
  if (!character || character.state === "dead") return;
  state.activeCharacterId = id;
  state.energy = Math.min(state.energy, getStatsForCharacter(character).maxEnergy);
  saveState();
  render();
  playSfx("confirm");
  showToast(`${character.name} selected.`);
}

function getStatsForCharacter(character) {
  const previous = state.activeCharacterId;
  state.activeCharacterId = character.id;
  const stats = getStats();
  state.activeCharacterId = previous;
  return stats;
}

function trainCharacter(stat, modeId) {
  const character = getActiveCharacter();
  if (!character || character.state === "dead") {
    showToast("Select a living Character first.");
    return;
  }
  if (character.trainingPoints < 1) {
    showToast("No training points. Fight Duels to earn TP.");
    return;
  }
  const option = trainingOptions.find((entry) => entry.stat === stat);
  const mode = trainingModes.find((entry) => entry.id === modeId);
  if (!option || !mode) return;

  character.trainingPoints -= 1;
  state.totalTraining += 1;
  const success = Math.random() <= mode.chance;
  if (success) {
    const gain = option[mode.gainKey];
    character.trainedStats[stat] += gain;
    addBattleLog(`${character.name} completed ${mode.label} ${option.label}: +${gain} ${labelStat(stat)}.`);
    playSfx("victory");
    showToast(`Training success: +${gain} ${labelStat(stat)}.`);
  } else {
    addBattleLog(`${character.name} failed ${mode.label} ${option.label}. TP lost.`);
    playSfx("hit");
    showToast("Training failed. TP lost.");
  }
  saveState();
  render();
}

function labelStat(stat) {
  return {
    health: "Health",
    violence: "Might",
    power: "Arcana",
    harmony: "Spirit",
  }[stat] || stat;
}

function statEffectLine(stat, stats) {
  if (stat === "health") return `Battle Health ${fmt(stats.health)} | +${fmt(stats.health * 2)} max energy`;
  if (stat === "violence") return `+${fmt(stats.violence * 0.035, 3)} extraction`;
  if (stat === "power") return `+${fmt(stats.power * 0.2, 2)} energy/h | +${fmt(stats.power * 0.018, 3)} extraction`;
  if (stat === "harmony") return `+${fmt(stats.harmony * 0.7, 2)} energy/h | +${fmt(stats.harmony * 0.015, 3)}x signal`;
  return "";
}

const characterStatKeys = ["health", "violence", "power", "harmony"];

function renderCharacterStatGrid(character) {
  const stats = getCharacterStats(character);
  const trained = character.trainedStats || {};
  return `
    <div class="character-stat-grid">
      ${characterStatKeys
        .map(
          (stat) => `
          <span>
            <small>${labelStat(stat)}</small>
            <strong>${fmt(stats[stat])}</strong>
            <em>${statEffectLine(stat, stats)}</em>
            <i>Trained +${fmt(trained[stat] || 0)}</i>
          </span>
        `,
        )
        .join("")}
    </div>
  `;
}

function getCharacterStatSources(character, stat) {
  const rarity = getRarity(character.rarity);
  const classInfo = getClass(character.classId);
  const loot = getLootBonuses(character);
  const base = stat === "health" ? 50 : 5;
  const rarityBonus = rarity.bonus * (stat === "health" ? 4 : 1);
  const classBonus = classInfo.statMods[stat] || 0;
  const trainingBonus = character.trainedStats?.[stat] || 0;
  const lootBonus = loot.combat[stat] || 0;
  return {
    base,
    rarityBonus,
    classBonus,
    trainingBonus,
    lootBonus,
    total: base + rarityBonus + classBonus + trainingBonus + lootBonus,
  };
}

function renderStatSourceTable(character) {
  return `
    <div class="stat-source-table">
      <div class="stat-source-heading">
        <strong>Where the totals come from</strong>
        <span>Base + rarity + class + training + equipped loot</span>
      </div>
      ${characterStatKeys
        .map((stat) => {
          const source = getCharacterStatSources(character, stat);
          return `
            <div class="stat-source-row">
              <strong>${labelStat(stat)} ${fmt(source.total)}</strong>
              <span>${fmt(source.base)} base + ${fmt(source.rarityBonus)} rarity + ${fmt(source.classBonus)} class + ${fmt(
                source.trainingBonus,
              )} training + ${fmt(source.lootBonus)} loot</span>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderRaceProfile(race) {
  return `
    <div class="race-profile" style="--affinity:${race.color}">
      <div>
        <span>Race profile</span>
        <strong>${race.name}: ${race.best}</strong>
      </div>
      <p>${race.description}</p>
      <small>${raceMetricLine(race)} | ${raceMatchupLine(race.id)}</small>
    </div>
  `;
}

function renderClassProfile(classInfo) {
  return `
    <div class="class-profile">
      <div>
        <span>Class profile</span>
        <strong>${classInfo.name}: ${classInfo.bonus}</strong>
      </div>
      <p>${classInfo.description}</p>
      <small>Starts closer to ${classInfo.style}.</small>
    </div>
  `;
}

function renderCurrentOutput(character) {
  const stats = getStatsForCharacter(character);
  return `
    <div class="current-output">
      <span><small>Max energy</small><strong>${fmt(stats.maxEnergy)}</strong></span>
      <span><small>Regen / hour</small><strong>${fmt(stats.regen, 2)}</strong></span>
      <span><small>Extraction</small><strong>${fmt(stats.steal, 3)}</strong></span>
      <span><small>Shards / press</small><strong>${fmt(stats.reward, 3)}</strong></span>
      <span><small>Lucky signal</small><strong>${fmt(stats.luckyChance * 100, 3)}%</strong></span>
    </div>
  `;
}

function clickerFormulaRows(character) {
  const race = getAffinity(character.affinityId);
  const battleStats = getCharacterStats(character);
  const loot = getLootBonuses(character);
  const stats = getStatsForCharacter(character);
  return [
    [
      "Max energy",
      `${fmt(race.energy)} race + ${fmt(state.levels.maxEnergy * 80)} upgrades + ${fmt(loot.energy)} Core + ${fmt(
        battleStats.health * 2,
      )} from Health = ${fmt(stats.maxEnergy)}`,
    ],
    [
      "Regen / hour",
      `${fmt(race.regen, 2)} race + ${fmt(state.levels.regen * 7, 2)} upgrades + ${fmt(loot.regen, 2)} Boots + ${fmt(
        battleStats.harmony * 0.7,
        2,
      )} Spirit + ${fmt(battleStats.power * 0.2, 2)} Arcana = ${fmt(stats.regen, 2)}`,
    ],
    [
      "Extraction",
      `${fmt(race.steal, 3)} race + ${fmt(state.levels.steal * 0.18, 3)} upgrades + ${fmt(loot.steal, 3)} Lens + ${fmt(
        battleStats.violence * 0.035,
        3,
      )} Might + ${fmt(battleStats.power * 0.018, 3)} Arcana = ${fmt(stats.steal, 3)}`,
    ],
    ["Shards / press", `0.20 x ${fmt(stats.steal, 3)} extraction x ${fmt(stats.partyBonus, 3)} party = ${fmt(stats.reward, 3)}`],
    [
      "Lucky signal",
      `0.582% x (1 + ${fmt(loot.luck, 3)} Charm + ${fmt(battleStats.harmony * 0.015, 3)} Spirit) = ${fmt(
        stats.luckyChance * 100,
        3,
      )}%`,
    ],
  ];
}

function getAbilityScores(character) {
  if (!character) return [];
  const stats = getCharacterStats(character);
  return [
    { ability: "Fortify", stat: "Health", score: stats.health / 10, note: `${fmt(stats.health)} Health / 10` },
    { ability: "Bloodlust", stat: "Might", score: stats.violence, note: `${fmt(stats.violence)} Might` },
    { ability: "Sorcery", stat: "Arcana", score: stats.power, note: `${fmt(stats.power)} Arcana` },
    { ability: "Attune", stat: "Spirit", score: stats.harmony, note: `${fmt(stats.harmony)} Spirit` },
  ];
}

function renderStatPrimer(character) {
  const scores = getAbilityScores(character);
  const preferred = scores.length ? [...scores].sort((left, right) => right.score - left.score)[0] : null;
  return `
    <section class="stat-primer">
      <div class="stat-primer-head">
        <div>
          <p class="eyebrow">Start here</p>
          <h3>What the numbers actually mean</h3>
        </div>
        <span class="pill">Plain-language guide</span>
      </div>

      <div class="stat-system-note">
        <strong>Every stat has two jobs.</strong>
        <span>It changes the clicker economy and it changes autobattle behavior. Race supplies the base button profile. Class only gives the Character a starting stat bonus.</span>
      </div>

      <h4>Button terms</h4>
      <div class="stat-glossary">
        <div><strong>Max energy</strong><span>How many presses you can store. One press costs 1 energy.</span></div>
        <div><strong>Regen / hour</strong><span>How much spent energy returns each hour.</span></div>
        <div><strong>Extraction</strong><span>The income rating. Every 1.00 extraction becomes 0.20 base shards per press.</span></div>
        <div><strong>Shards / press</strong><span>The amount you actually receive from a normal button press.</span></div>
        <div><strong>Lucky signal</strong><span>The chance for a press to add a random bonus of 2 to 40 shards.</span></div>
      </div>

      <h4>Choose a stat by the result you want</h4>
      <div class="stat-role-grid">
        ${trainingOptions
          .map(
            (option) => `
            <article class="stat-role">
              <div>
                <span>${option.role}</span>
                <h5>${option.label}</h5>
              </div>
              <p>${option.plain}</p>
              <strong>${option.lightImpact}</strong>
              <small>${option.caution}</small>
            </article>
          `,
          )
          .join("")}
      </div>

      <div class="ability-explainer">
        <div>
          <span>How autobattle chooses a move</span>
          <h4>The highest ability score becomes the Character's attack style.</h4>
          <p>Health is divided by 10 because Health uses larger numbers. The Character does not choose from four moves each turn; it repeatedly uses the ability with the highest score.</p>
          <p>The selection score only chooses the move. Damage is calculated afterward from that move's formula, enemy defense, a random 4 to 12, and the race matchup.</p>
        </div>
        ${
          character
            ? `
              <div class="ability-score-list">
                ${scores
                  .map(
                    (entry) => `
                    <div class="${entry.ability === preferred.ability ? "is-leading" : ""}">
                      <span>${entry.ability} from ${entry.stat}</span>
                      <strong>${fmt(entry.score, 1)}</strong>
                      <small>${entry.note}</small>
                    </div>
                  `,
                  )
                  .join("")}
              </div>
              <p class="ability-result"><strong>${character.name} currently uses ${preferred.ability}</strong> because ${preferred.note} gives the highest selection score of ${fmt(preferred.score, 1)}.</p>
            `
            : `<p class="ability-result">Hatch and select a Character to see its four live ability scores compared here.</p>`
        }
      </div>

      <h4>Combat style bios</h4>
      <div class="combat-style-grid">${combatStyles.map((style) => renderCombatStyleCard(style)).join("")}</div>
    </section>
  `;
}

function renderCombatStyleCard(style, modifier = "") {
  return `
    <article class="combat-style-card ${modifier}">
      <div>
        <span>${style.poweredBy}-powered</span>
        <h5>${style.name}</h5>
      </div>
      <strong>${style.selection}</strong>
      <p>${style.bio}</p>
      <small>${style.result}</small>
      <em>Natural class: ${style.favoredClass}</em>
    </article>
  `;
}

function openLootCrate() {
  tick();
  if (state.shards < lootCrateCost) {
    showToast(`Need ${money(lootCrateCost)} for a loot crate.`);
    return;
  }
  state.shards -= lootCrateCost;
  state.burned += lootCrateCost;
  state.lootCratesOpened += 1;
  const item = createLootItem();
  state.inventory.unshift(item);
  const character = getActiveCharacter();
  if (character && !character.equippedLootId) character.equippedLootId = item.id;
  $("#crateResult").innerHTML = `
    <div class="crate-loot-result">
      ${renderLootVisual(item, "is-crate")}
      <div>
        <strong>${item.name}</strong>
        <span>${item.rarity} ${item.category}: ${formatLootPrimary(item)} | ${formatSideStats(item)}</span>
      </div>
    </div>
  `;
  saveState();
  render();
  playSfx("victory");
  showToast(`${item.name} rolled.`);
}

function equipItem(id) {
  const character = getActiveCharacter();
  if (!character || character.state === "dead") {
    showToast("Select a living Character before equipping loot.");
    return;
  }
  const item = state.inventory.find((entry) => entry.id === id);
  if (!item) return;
  character.equippedLootId = item.id;
  saveState();
  render();
  playSfx("confirm");
  showToast(`${item.name} equipped to ${character.name}.`);
}

function repairLoot(id) {
  const item = state.inventory.find((entry) => entry.id === id);
  if (!item) return;
  const cost = repairCost(item);
  if (cost <= 0) {
    showToast("Loot is already fully repaired.");
    return;
  }
  if (state.shards < cost) {
    showToast(`Need ${money(cost)} to repair.`);
    return;
  }
  state.shards -= cost;
  state.burned += cost;
  item.durability = item.maxDurability;
  saveState();
  render();
  playSfx("purchase");
  showToast(`${item.name} repaired.`);
}

function scrapLoot(id) {
  const item = state.inventory.find((entry) => entry.id === id);
  if (!item) return;
  const value = scrapValue(item);
  state.inventory = state.inventory.filter((entry) => entry.id !== id);
  state.characters.forEach((character) => {
    if (character.equippedLootId === id) character.equippedLootId = null;
  });
  state.shards += value;
  state.totalEarned += value;
  saveState();
  render();
  showToast(`${item.name} scrapped for ${money(value)}.`);
}

function listLoot(id, currency) {
  const item = state.inventory.find((entry) => entry.id === id);
  if (!item) return;
  state.inventory = state.inventory.filter((entry) => entry.id !== id);
  state.characters.forEach((character) => {
    if (character.equippedLootId === id) character.equippedLootId = null;
  });
  state.marketListings.unshift(
    normalizeMarketListing({
      seller: "you",
      currency,
      price: currency === "eth" ? marketEthValue(item) : marketShardValue(item),
      item,
    }),
  );
  saveState();
  render();
  showToast(`${item.name} listed for ${currency === "eth" ? "ETH" : "shards"}.`);
}

function cancelListing(id) {
  const listing = state.marketListings.find((entry) => entry.id === id && entry.seller === "you");
  if (!listing) return;
  state.marketListings = state.marketListings.filter((entry) => entry.id !== id);
  state.inventory.unshift(listing.item);
  saveState();
  render();
  showToast(`${listing.item.name} returned to inventory.`);
}

function buyMarketListing(id) {
  const listing = state.marketListings.find((entry) => entry.id === id);
  if (!listing || listing.seller === "you") return;
  if (listing.currency === "eth") {
    if (state.ethBalance < listing.price) {
      showToast(`Need ${fmt(listing.price, 4)} ETH.`);
      return;
    }
    state.ethBalance = Number((state.ethBalance - listing.price).toFixed(4));
  } else {
    if (state.shards < listing.price) {
      showToast(`Need ${money(listing.price)}.`);
      return;
    }
    state.shards -= listing.price;
    state.burned += Math.round(listing.price * marketFee);
  }
  state.marketListings = state.marketListings.filter((entry) => entry.id !== id);
  state.inventory.unshift(listing.item);
  state.marketListings.push(...createMarketListings(1));
  saveState();
  render();
  showToast(`Bought ${listing.item.name}.`);
}

function settleMarket() {
  let sold = 0;
  for (const listing of [...state.marketListings]) {
    if (listing.seller !== "you") continue;
    if (Math.random() > 0.65) continue;
    state.marketListings = state.marketListings.filter((entry) => entry.id !== listing.id);
    const proceeds = Number((listing.price * (1 - marketFee)).toFixed(listing.currency === "eth" ? 4 : 0));
    if (listing.currency === "eth") {
      state.ethBalance = Number((state.ethBalance + proceeds).toFixed(4));
    } else {
      state.shards += proceeds;
      state.totalEarned += proceeds;
      state.burned += Math.round(listing.price * marketFee);
    }
    sold += 1;
  }
  if (!sold) {
    state.marketListings.push(...createMarketListings(1));
    showToast("No buyer filled your listings this tick.");
  } else {
    state.marketSales += sold;
    showToast(`${sold} listing${sold === 1 ? "" : "s"} sold.`);
  }
  saveState();
  render();
}

function practiceBattle() {
  const character = getActiveCharacter();
  if (!character || character.state === "dead") {
    showToast("Select a living Character first.");
    return;
  }
  if (state.battleScene?.running) {
    showToast("Battle animation is still running.");
    return;
  }
  const opponent = createAiCharacter(character.fightCount + 1);
  const result = resolveBattle(character, opponent);
  addBattleLog(`Practice: ${character.name} ${result.win ? "beat" : "lost to"} ${opponent.name}. No TP or record change.`);
  saveState();
  render();
  playBattleScene(buildBattleScene(character, opponent, result, "Practice"));
}

function fightNextBattle() {
  const character = getActiveCharacter();
  if (!character || character.state === "dead") {
    showToast("Select a living Character first.");
    return;
  }
  if (state.battleScene?.running) {
    showToast("Battle animation is still running.");
    return;
  }
  if (character.marked) {
    showToast("This Character already holds the Mark.");
    return;
  }
  const nextFight = character.fightCount + 1;
  if (nextFight >= 11) {
    runTournament(character);
    return;
  }
  runDuel(character, nextFight);
}

function runDuel(character, fightNumber) {
  const opponent = createAiCharacter(fightNumber);
  const result = resolveBattle(character, opponent);
  damageEquippedLoot(character, 2);
  character.fightCount += 1;
  character.trainingPoints += 1;
  state.totalDuels += 1;
  if (result.win) {
    character.duelWins += 1;
    character.streak += 1;
  } else {
    character.duelLosses += 1;
    character.streak = 0;
  }
  addBattleLog(
    `Duel ${fightNumber}: ${character.name} ${result.win ? "defeated" : "lost to"} ${opponent.name}. ${result.reason} +1 TP.`,
  );
  saveState();
  render();
  playBattleScene(buildBattleScene(character, opponent, result, `Duel ${fightNumber}`));
  showToast(result.win ? "Duel won. +1 TP." : "Duel lost. +1 TP.");
}

function runTournament(character) {
  damageEquippedLoot(character, 12);
  const entrants = [character, ...Array.from({ length: 7 }, (_, index) => createAiCharacter(11 + index))];
  let round = entrants;
  const lines = [`Festival begins: ${character.name} enters the 8-Character bracket.`];
  let lastPlayerScene = null;
  while (round.length > 1) {
    const nextRound = [];
    for (let index = 0; index < round.length; index += 2) {
      const left = round[index];
      const right = round[index + 1];
      const result = resolveBattle(left, right);
      const winner = result.win ? left : right;
      const loser = result.win ? right : left;
      nextRound.push(winner);
      lines.push(`${winner.name} eliminated ${loser.name}.`);
      if (left.id === character.id || right.id === character.id) {
        lastPlayerScene = buildBattleScene(left, right, result, "Tournament");
      }
      if (loser.id === character.id) {
        character.state = "dead";
        character.deathReason = "Lost in the Festival";
        character.fightCount += 1;
        state.activeCharacterId = state.characters.find((entry) => entry.state !== "dead" && entry.id !== character.id)?.id || null;
        addBattleLog(lines.join(" "));
        saveState();
        render();
        if (lastPlayerScene) playBattleScene(lastPlayerScene);
        showToast(`${character.name} died in the Festival.`);
        return;
      }
    }
    round = nextRound;
  }

  character.marked = true;
  character.state = "marked";
  character.fightCount += 1;
  character.trainingPoints += 3;
  const mark = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    characterId: character.id,
    characterName: character.name,
    earnedAt: Date.now(),
  };
  state.marks.unshift(mark);
  lines.push(`${character.name} survived and earned the Mark.`);
  addBattleLog(lines.join(" "));
  saveState();
  render();
  if (lastPlayerScene) playBattleScene(lastPlayerScene);
  showToast("Festival won. The Mark is yours.");
}

function createAiCharacter(seed) {
  const rarity = seed > 10 && Math.random() < 0.3 ? rarities[1] : weightedPick(rarities);
  const classInfo = randomFrom(classes);
  const affinity = randomFrom(affinities);
  return normalizeCharacter({
    id: `ai-${Date.now()}-${Math.random()}`,
    name: `${randomFrom(["STATIC", "RIVAL", "GHOST", "NOISE", "NULL"])}-${Math.floor(Math.random() * 900 + 100)}`,
    classId: classInfo.id,
    affinityId: affinity.id,
    rarity: rarity.name,
    trainedStats: {
      health: Math.floor(seed * 7 * Math.random()),
      violence: Math.floor(seed * Math.random()),
      power: Math.floor(seed * Math.random()),
      harmony: Math.floor(seed * Math.random()),
    },
  });
}

function resolveBattle(left, right) {
  const leftStats = getCharacterStats(left);
  const rightStats = getCharacterStats(right);
  let leftHp = Math.max(1, leftStats.health);
  let rightHp = Math.max(1, rightStats.health);
  const leftMaxHp = leftHp;
  const rightMaxHp = rightHp;
  const leftStarts = leftStats.harmony + Math.random() * 8 >= rightStats.harmony + Math.random() * 8;
  const turnOrder = leftStarts ? ["left", "right"] : ["right", "left"];
  const events = [];

  for (let turn = 0; turn < 14 && leftHp > 0 && rightHp > 0; turn += 1) {
    const side = turnOrder[turn % 2];
    const attacker = side === "left" ? left : right;
    const defender = side === "left" ? right : left;
    const attack = createBattleAttack(attacker, defender);
    if (side === "left") {
      rightHp = Math.max(0, rightHp - attack.damage);
      leftHp = Math.min(leftMaxHp, leftHp + attack.heal);
    } else {
      leftHp = Math.max(0, leftHp - attack.damage);
      rightHp = Math.min(rightMaxHp, rightHp + attack.heal);
    }
    events.push({
      side,
      ability: attack.ability,
      damage: attack.damage,
      heal: attack.heal,
      text: `${attacker.name} used ${attack.name} for ${attack.damage} damage${attack.heal ? ` and recovered ${attack.heal} Health` : ""}.`,
      leftHp,
      rightHp,
    });
  }

  const winnerSide = leftHp === rightHp ? (leftStats.harmony >= rightStats.harmony ? "left" : "right") : leftHp > rightHp ? "left" : "right";
  const win = winnerSide === "left";
  const reason = `${win ? left.name : right.name} finished with ${fmt(win ? leftHp : rightHp)} Health after ${events.length} turns.`;
  events.push({
    side: winnerSide,
    text: `${win ? left.name : right.name} wins the exchange.`,
    leftHp,
    rightHp,
    final: true,
  });
  return { win, leftScore: leftHp, rightScore: rightHp, reason, events, leftMaxHp, rightMaxHp };
}

function createBattleAttack(attacker, defender) {
  const stats = getCharacterStats(attacker);
  const defenderStats = getCharacterStats(defender);
  const ability = getSpecialAbility(stats);
  const matchup = affinityMultiplier(attacker.affinityId, defender.affinityId);
  const defensePressure = Math.max(0, defenderStats.harmony - stats.power) * 0.18;
  const bases = {
    Fortify: stats.health * 0.1 + stats.violence * 0.9,
    Bloodlust: stats.violence * 2.1 + stats.power * 0.45,
    Sorcery: stats.power * 2.05 + stats.harmony * 0.35,
    Attune: stats.harmony * 1.65 + stats.power * 0.55,
  };
  const damage = Math.max(2, Math.round((bases[ability] - defensePressure + 4 + Math.random() * 8) * matchup));
  const heal = ability === "Attune" ? Math.max(0, Math.round(stats.harmony * 0.35)) : ability === "Fortify" ? Math.max(0, Math.round(stats.health * 0.04)) : 0;
  return { name: attackNameForAbility(ability, attacker.affinityId), ability, damage, heal };
}

function attackNameForAbility(ability, affinityId) {
  const affinity = getAffinity(affinityId).name;
  const names = {
    Fortify: `${affinity} Guard`,
    Bloodlust: `${affinity} Rush`,
    Sorcery: `${affinity} Burst`,
    Attune: `${affinity} Omen`,
  };
  return names[ability] || `${affinity} Strike`;
}

function getSpecialAbility(stats) {
  const values = [
    ["Fortify", stats.health / 10],
    ["Bloodlust", stats.violence],
    ["Sorcery", stats.power],
    ["Attune", stats.harmony],
  ].sort((a, b) => b[1] - a[1]);
  return values[0][0];
}

function affinityMultiplier(attackerId, defenderId) {
  const attacker = affinityIdMap[attackerId] || attackerId;
  const defender = affinityIdMap[defenderId] || defenderId;
  const wins = {
    normal: "elemental",
    elemental: "metal",
    metal: "wood",
    wood: "stone",
    stone: "normal",
  };
  if (wins[attacker] === defender) return 1.16;
  if (wins[defender] === attacker) return 0.9;
  return 1;
}

function buildBattleScene(left, right, result, label) {
  return {
    label,
    index: 0,
    running: false,
    left: battleActor(left, result.leftMaxHp),
    right: battleActor(right, result.rightMaxHp),
    events: result.events,
    winner: result.win ? "left" : "right",
  };
}

function battleActor(character, hpMax) {
  const classInfo = getClass(character.classId);
  const affinity = getAffinity(character.affinityId);
  const stats = getCharacterStats(character);
  return {
    id: character.id,
    name: character.name,
    className: classInfo.name,
    affinityName: affinity.name,
    affinityColor: affinity.color,
    spriteSrc: getRaceSprite(character.affinityId),
    hpMax: hpMax || stats.health,
  };
}

function playBattleScene(scene) {
  window.clearTimeout(battleAnimationTimer);
  state.battleScene = { ...scene, running: true, index: 0 };
  renderArena();
  playSfx("attack");
  const advance = () => {
    if (!state.battleScene) return;
    if (state.battleScene.index < state.battleScene.events.length - 1) {
      state.battleScene.index += 1;
      renderArena();
      const event = state.battleScene.events[state.battleScene.index];
      playSfx(event.final ? "victory" : event.damage ? "hit" : "attack");
      battleAnimationTimer = window.setTimeout(advance, 920);
      return;
    }
    state.battleScene.running = false;
    renderArena();
  };
  battleAnimationTimer = window.setTimeout(advance, 920);
}

function claimQuest(id) {
  const quest = questDefs.find((entry) => entry.id === id);
  if (!quest || state.questRewards.includes(id) || questProgress(quest).progress < 1) return;
  state.questRewards.push(id);
  state.shards += quest.reward;
  state.totalEarned += quest.reward;
  saveState();
  render();
  showToast(`Quest reward claimed: ${money(quest.reward)}.`);
}

function questMetric(quest) {
  const stats = getStats();
  const values = {
    clicks: state.totalClicks,
    characters: state.characters.length,
    earned: state.totalEarned,
    training: state.totalTraining,
    duels: state.totalDuels,
    marks: state.marks.length,
    burned: state.burned,
    bay: state.farmLevel,
    steal: stats.steal,
  };
  return values[quest.metric] || 0;
}

function questProgress(quest) {
  const current = questMetric(quest);
  return { current, progress: Math.min(1, current / quest.target) };
}

function copyReferral() {
  const code = getReferralCode();
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code).then(
      () => showToast("Referral code copied."),
      () => showToast(code),
    );
  } else {
    showToast(code);
  }
}

function getReferralCode() {
  return `CYCLOPS-${Math.round(state.totalEarned + state.totalClicks + state.characters.length).toString(36).toUpperCase().padStart(5, "0")}`;
}

function sendChat(event) {
  event.preventDefault();
  const input = $("#chatInput");
  const text = input.value.trim();
  if (!text) return;
  state.chat.push({ name: "you", text });
  state.chat = state.chat.slice(-24);
  input.value = "";
  saveState();
  renderProfile();
}

function render() {
  tick();
  renderStats();
  renderActiveCharacter();
  renderSystems();
  renderCharacters();
  renderTraining();
  renderArena();
  renderDocs();
  renderLeaderboard();
  renderQuests();
  renderShop();
  renderInventory();
  renderMarket();
  renderProfile();
}

function renderStats() {
  const stats = getStats();
  const character = getActiveCharacter();
  const energyPct = stats.maxEnergy ? Math.max(0, Math.min(100, (state.energy / stats.maxEnergy) * 100)) : 0;
  $("#statsRail").innerHTML = [
    ["Energy", stats.maxEnergy ? `${fmt(state.energy)} / ${fmt(stats.maxEnergy)}` : "No Character", "is-energy"],
    ["Regen / hour", `${fmt(stats.regen, 2)}`, "is-regen"],
    ["Extraction", `${fmt(stats.steal, 3)}`, "is-extraction"],
    ["Shards / press", character ? fmt(stats.reward, 3) : "0.000", "is-reward"],
    ["Shards", fmt(state.shards, 2), "is-shards"],
  ]
    .map(([label, value, className]) => `<div class="hud-stat ${className}"><span>${label}</span><strong>${value}</strong></div>`)
    .join("");
  $("#energyBar").style.width = `${energyPct}%`;
  $("#energyLabel").textContent = stats.maxEnergy ? `Energy: ${fmt(state.energy)} / ${fmt(stats.maxEnergy)}` : "Energy: no active Character";
  $("#rewardLabel").textContent = character ? `${fmt(stats.reward, 3)} shards / press` : "Hatch an Egg first";
  $("#playStageMeta").innerHTML = [
    ["Wallet", "0xCYC...LOCAL"],
    ["Character", character ? character.name : "None"],
    ["Race", character ? getAffinity(character.affinityId).name : "Unrolled"],
    ["Class", character ? getClass(character.classId).name : "Unrolled"],
    ["Rank", `#${Math.max(1, 777 - Math.floor(state.totalEarned / 120))}`],
  ]
    .map(([label, value]) => `<span><small>${label}</small>${value}</span>`)
    .join("");
  $("#pressButton").disabled = !character || character.state === "dead" || state.energy < 1;
  $("#quickPress").disabled = !character || character.state === "dead" || state.energy < 1;
  $("#quickBalance").textContent = money(state.shards);
  $("#quickEnergy").textContent = stats.maxEnergy ? `Energy ${fmt(state.energy)} / ${fmt(stats.maxEnergy)}` : "Hatch an Egg";
  $("#bayLevelMain").textContent = `Level ${state.farmLevel}`;
  $("#bayYieldMain").textContent = `${fmt(getFarmCps(), 3)} shards/sec`;
  $("#buyFarmMain").textContent = `Upgrade Bay - ${money(farmCost())}`;
  $("#buyFarmMain").disabled = state.shards < farmCost();
}

function renderActiveCharacter() {
  const character = getActiveCharacter();
  if (!character) {
    $("#activeCharacterPanel").innerHTML = `
      <button class="empty-character-cta" type="button" data-hatch-shortcut>
        <strong>No active Character</strong>
        <span>Hatch your starter Egg to power the button.</span>
        <em>Hatch Character</em>
      </button>
    `;
    $("#buildSummary").innerHTML = "";
    $("#stageCharacterSprite").className = "stage-character-art is-empty";
    $("#stageCharacterSprite").innerHTML = `
      <button class="empty-character-portal" type="button" data-hatch-shortcut>
        <strong>Hatch Character</strong>
        <span>Open your starter Egg</span>
      </button>
    `;
    $("#mainFightProgress").innerHTML = renderMainFightProgress(null);
    $("#mainEquippedLoot").innerHTML = renderMainEquippedLoot(null);
    bindHatchShortcuts();
    return;
  }
  const classInfo = getClass(character.classId);
  const affinity = getAffinity(character.affinityId);
  const rarity = getRarity(character.rarity);
  const loot = getEquippedLoot(character);
  $("#activeCharacterPanel").style.setProperty("--rarity", rarity.color);
  $("#activeCharacterPanel").innerHTML = renderCharacterMini(character);
  $("#stageCharacterSprite").className = "stage-character-art";
  $("#stageCharacterSprite").style.setProperty("--stage-affinity", affinity.color);
  $("#stageCharacterSprite").style.setProperty("--rarity", rarity.color);
  $("#stageCharacterSprite").innerHTML = `<img src="${escapeHtml(getRaceSprite(character.affinityId))}" alt="${escapeHtml(
    `${affinity.name} ${classInfo.name} ${character.name}`,
  )}" />`;
  $("#mainFightProgress").innerHTML = renderMainFightProgress(character);
  $("#mainEquippedLoot").innerHTML = renderMainEquippedLoot(character);
  $("#buildSummary").innerHTML = `
    ${renderRaceProfile(affinity)}
    ${renderCharacterStatGrid(character)}
    ${renderCurrentOutput(character)}
    <div class="formula-list">
      ${clickerFormulaRows(character)
        .map(([label, value]) => `<div class="formula-row"><span>${label}</span><strong>${value}</strong></div>`)
        .join("")}
    </div>
    <div class="summary-row"><span>Class</span><strong>${classInfo.name}: ${classInfo.bonus}. ${classInfo.description}</strong></div>
    <div class="summary-row"><span>Loot</span><strong>${
      loot ? `${loot.name}: ${formatLootPrimary(loot)} | ${formatSideStats(loot)} | ${loot.durability}/${loot.maxDurability}` : "No loot equipped"
    }</strong></div>
    <div class="summary-row"><span>Bay</span><strong>${fmt(getFarmCps(), 3)} shards/sec</strong></div>
  `;
}

function bindHatchShortcuts() {
  $$("[data-hatch-shortcut]").forEach((button) => {
    button.addEventListener("click", () => {
      routeTo("characters");
      window.requestAnimationFrame(() => {
        $("#openCharacterEgg")?.focus();
        $("#openCharacterEgg")?.classList.add("is-attention");
        window.setTimeout(() => $("#openCharacterEgg")?.classList.remove("is-attention"), 1400);
      });
    });
  });
}

function renderMainFightProgress(character) {
  const fights = character ? Math.min(character.fightCount, 10) : 0;
  const nextLabel = character?.marked ? "Marked" : fights >= 10 ? "Tournament ready" : `${fights} / 10 Duels`;
  return `
    <div class="stage-status-heading">
      <span>Battle path</span>
      <strong>${nextLabel}</strong>
    </div>
    <div class="duel-pips" aria-label="${fights} of 10 Duels completed">
      ${Array.from({ length: 10 }, (_, index) => `<i class="${index < fights ? "is-filled" : ""}"></i>`).join("")}
      <i class="is-tournament" title="Fight 11: Tournament"></i>
    </div>
    <small>${character ? `${character.trainingPoints} TP | Record ${character.duelWins}-${character.duelLosses}` : "Select a Character to battle"}</small>
  `;
}

function renderMainEquippedLoot(character) {
  const loot = getEquippedLoot(character);
  if (!loot) {
    return `
      <div class="stage-status-heading"><span>Equipped loot</span><strong>None</strong></div>
      <small>Equip one item from Loot.</small>
    `;
  }
  const durabilityPct = loot.maxDurability ? Math.max(0, Math.min(100, (loot.durability / loot.maxDurability) * 100)) : 0;
  return `
    <div class="stage-status-heading"><span>Equipped loot</span><strong>${loot.durability}/${loot.maxDurability}</strong></div>
    <div class="loot-stage-row">
      ${renderLootVisual(loot, "is-stage")}
      <div>
        <strong>${loot.name}</strong>
        <small>${formatLootPrimary(loot)}</small>
        <div class="durability-track"><span style="width:${durabilityPct}%"></span></div>
      </div>
    </div>
  `;
}

function renderSystems() {
  const character = getActiveCharacter();
  const stats = getStats();
  const loot = getEquippedLoot(character);
  const systems = [
    ["Characters", "Eggs hatch random Characters into your roster.", `${state.characters.length} owned`],
    ["Active clicker", "One living Character powers the visor button.", character ? character.name : "None"],
    ["Energy", "Race supplies the base. Health, Spirit, Arcana, loot, and upgrades add to it.", `${fmt(stats.regen, 2)}/h`],
    ["Training", "Duels grant TP. Training increases Health, Might, Arcana, or Spirit.", `${state.totalTraining} attempts`],
    ["Arena", "Fights 1-10 are safe Duels. Fight 11 is the tournament.", `${state.totalDuels} duels`],
    ["Mark", "Tournament winners survive and earn a persistent Mark.", `${state.marks.length} marks`],
    ["Bay", "Offline-style yield accrues locally, capped at 8 hours per tick.", `${fmt(getFarmCps(), 3)} cps`],
    ["Loot", "One loot item can be equipped to the active Character.", loot ? loot.name : `${state.inventory.length} owned`],
    ["Market", "Buy and sell loot for shards or simulated ETH.", `${state.marketListings.length} listings`],
  ];
  $("#systemGrid").innerHTML = systems
    .map(([title, text, value]) => `<article class="system-card"><h3>${title}</h3><p>${text}</p><strong>${value}</strong></article>`)
    .join("");
}

function renderCharacters() {
  $("#characterEggPill").textContent = `${state.characterEggs} Eggs`;
  $("#openCharacterEgg").disabled = state.characterEggs < 1;
  $("#buyCharacterEgg").textContent = `Buy Egg - ${money(characterEggCost)}`;
  const active = getActiveCharacter();
  $("#rerollActive").disabled = !active || active.state === "dead" || active.marked || state.shards < rerollCost;
  renderCharacterGrid();
  renderPlayRoster();
  $$("[data-select-character]").forEach((button) => {
    button.addEventListener("click", () => selectCharacter(button.dataset.selectCharacter));
  });
}

function renderPlayRoster() {
  const root = $("#playRoster");
  if (!root) return;
  if (!state.characters.length) {
    root.innerHTML = `
      <a class="roster-empty" href="#characters" data-route-link="characters">
        Hatch your starter Egg to add the first Character.
      </a>
    `;
    root.querySelector("[data-route-link]")?.addEventListener("click", (event) => {
      event.preventDefault();
      routeTo("characters");
    });
    return;
  }
  root.innerHTML = state.characters
    .map((character) => {
      const affinity = getAffinity(character.affinityId);
      const classInfo = getClass(character.classId);
      const active = character.id === state.activeCharacterId;
      return `
        <button class="roster-slot ${active ? "is-active" : ""} ${character.state === "dead" ? "is-dead" : ""}"
          type="button" data-select-character="${character.id}" style="--rarity:${getRarity(character.rarity).color}"
          ${character.state === "dead" ? "disabled" : ""}>
          <img src="${escapeHtml(getRaceSprite(character.affinityId))}" alt="" loading="lazy" />
          <span>
            <strong>${character.name}</strong>
            <small style="color:${affinity.color}">${affinity.name} ${classInfo.name}</small>
          </span>
        </button>
      `;
    })
    .join("");
}

function renderTraining() {
  const active = getActiveCharacter();
  $("#statPrimer").innerHTML = renderStatPrimer(active && active.state !== "dead" ? active : null);
  $("#trainingPointPill").textContent = `${active?.trainingPoints || 0} TP`;
  if (!active || active.state === "dead") {
    $("#trainingCharacterPanel").innerHTML = `
      <div class="empty-state">
        <strong>No living active Character</strong>
        <p>Select a living Character from the roster before training.</p>
      </div>
    `;
    renderTrainingPanel(null);
    return;
  }

  $("#trainingCharacterPanel").innerHTML = `
    ${renderCharacterMini(active)}
    ${renderCharacterStatGrid(active)}
    ${renderStatSourceTable(active)}
    ${renderCurrentOutput(active)}
    <div class="record-list">
      <span>TP: ${active.trainingPoints}</span>
      <span>Record: ${active.duelWins}-${active.duelLosses}</span>
      <span>Fight ${active.fightCount}/11</span>
    </div>
  `;
  renderTrainingPanel(active);
}

function renderTrainingPanel(character) {
  if (!character || character.state === "dead") {
    $("#trainingPanel").innerHTML = `<div class="empty-state"><strong>No living active Character</strong><p>Select a living Character to train.</p></div>`;
    return;
  }
  const stats = getCharacterStats(character);
  $("#trainingPanel").innerHTML = `
    <div class="training-economy-note">
      <strong>Training odds</strong>
      <span>Every attempt costs 1 TP. Light is the best average return. Moderate and Intense are riskier shortcuts that can gain more at once, but average less per TP.</span>
    </div>
    ${trainingOptions
    .map(
      (option) => `
      <article class="training-card">
        <div class="training-card-head">
          <div>
            <span>${option.role}</span>
            <h3>${option.label}</h3>
          </div>
          <strong>${fmt(stats[option.stat])}</strong>
        </div>
        <p>${option.plain}</p>
        <p class="training-light-impact">${option.lightImpact}</p>
        <details class="training-math">
          <summary>Show exact math</summary>
          <p>${option.description}</p>
          <p class="training-formula">${option.battleFormula}</p>
        </details>
        <p class="training-detail">Every attempt costs 1 TP. A failed roll gives zero.</p>
        ${trainingModes
          .map(
            (mode) => `
            <button class="button compact" type="button" data-train-stat="${option.stat}" data-train-mode="${mode.id}" ${
              character.trainingPoints < 1 ? "disabled" : ""
            }>
              ${mode.label}: +${option[mode.gainKey]} (${Math.round(mode.chance * 100)}%)
            </button>
            <small>${mode.description} Average gain: ${fmt(option[mode.gainKey] * mode.chance, 2)} ${option.label} per TP.</small>
          `,
          )
          .join("")}
      </article>
    `,
    )
    .join("")}
  `;
  $$("[data-train-stat]").forEach((button) => {
    button.addEventListener("click", () => trainCharacter(button.dataset.trainStat, button.dataset.trainMode));
  });
}

function renderCharacterGrid() {
  if (!state.characters.length) {
    $("#characterGrid").innerHTML = `
      <article class="character-card">
        <div class="empty-state">
          <strong>No Characters yet</strong>
          <p>Hatch the starter Egg to mint your first Character.</p>
        </div>
      </article>
    `;
    return;
  }
  $("#characterGrid").innerHTML = state.characters.map(renderCharacterCard).join("");
}

function renderCharacterCard(character) {
  const active = character.id === state.activeCharacterId;
  const rarity = getRarity(character.rarity);
  const race = getAffinity(character.affinityId);
  const classInfo = getClass(character.classId);
  const loot = getEquippedLoot(character);
  return `
    <article class="character-card ${active ? "is-active" : ""} ${character.state === "dead" ? "is-dead" : ""}"
      style="--rarity:${rarity.color}">
      ${renderCharacterMini(character)}
      ${renderRaceProfile(race)}
      ${renderClassProfile(classInfo)}
      ${renderCharacterStatGrid(character)}
      ${renderCurrentOutput(character)}
      <div class="loot-chip ${loot ? "has-loot" : "is-empty"}">
        ${loot ? renderLootVisual(loot, "is-chip") : ""}
        <div class="loot-chip-content">
          <span>Loot</span>
          <strong>${loot ? loot.name : "None equipped"}</strong>
          <small>${loot ? `${formatLootPrimary(loot)} | ${formatSideStats(loot)} | ${loot.durability}/${loot.maxDurability}` : "Equip one item from the Loot tab."}</small>
        </div>
      </div>
      <button class="button compact ${active ? "secondary" : "primary"}" type="button" data-select-character="${character.id}" ${
        character.state === "dead" ? "disabled" : ""
      }>
        ${active ? "Active" : "Select"}
      </button>
      <span class="rarity" style="color:${rarity.color};border-color:${rarity.color}">${character.rarity}</span>
    </article>
  `;
}

function renderCharacterMini(character) {
  const classInfo = getClass(character.classId);
  const affinity = getAffinity(character.affinityId);
  const rarity = getRarity(character.rarity);
  const lifecycle = character.state === "dead" ? "DEAD | " : character.marked || character.state === "marked" ? "MARKED | " : "";
  return `
    <div class="character-mini">
      <div class="character-sprite ${character.marked ? "is-marked" : ""}"
        style="--affinity:${affinity.color};--rarity:${rarity.color}">
        <img src="${escapeHtml(getRaceSprite(character.affinityId))}" alt="" loading="lazy" />
      </div>
      <div>
        <h3>${character.name}</h3>
        <p><span style="color:${affinity.color}">${affinity.name}</span> ${classInfo.name}</p>
        <p>${lifecycle}Fights ${character.fightCount}/11 | TP ${character.trainingPoints} | ${character.duelWins}-${character.duelLosses}</p>
      </div>
    </div>
  `;
}

function openCharacterGuide() {
  const root = $("#modalRoot");
  const active = getActiveCharacter();
  root.classList.remove("hidden");
  root.innerHTML = `
    <div class="modal">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Character guide</p>
          <h2>Stats, races, and classes</h2>
        </div>
        <button class="button compact" type="button" data-close-modal>Close</button>
      </div>
      <p class="body-copy">
        Stats determine the Character's clicker bonuses and battle behavior. Race owns the base button profile and
        matchup. Class only supplies starting combat stats.
      </p>
      <h3>Stats in plain English</h3>
      <div class="guide-grid">${trainingOptions.map((item) => renderTrainingGuideCard(item)).join("")}</div>
      <h3>Combat styles</h3>
      <div class="combat-style-grid">${combatStyles.map((style) => renderCombatStyleCard(style, "is-guide")).join("")}</div>
      <h3>Races</h3>
      <div class="guide-grid">${affinities.map((item) => renderRaceGuideCard(item, active)).join("")}</div>
      <h3>Classes</h3>
      <div class="guide-grid">${classes.map((item) => renderClassGuideCard(item, active)).join("")}</div>
    </div>
  `;
  $$("[data-close-modal]").forEach((button) => button.addEventListener("click", closeModal));
  root.removeEventListener("click", closeModalFromBackdrop);
  root.addEventListener("click", closeModalFromBackdrop);
}

function closeModalFromBackdrop(event) {
  if (event.target === $("#modalRoot")) closeModal();
}

function closeModal() {
  const root = $("#modalRoot");
  root.removeEventListener("click", closeModalFromBackdrop);
  root.classList.add("hidden");
  root.innerHTML = "";
}

function renderRaceGuideCard(race, active) {
  const selected = Boolean(active && getAffinity(active.affinityId).id === race.id);
  return `
    <article class="guide-card ${selected ? "selected" : ""}">
      <div class="guide-icon race-icon" style="--affinity:${race.color}" aria-hidden="true">
        <img src="${escapeHtml(race.sprite)}" alt="" loading="lazy" />
      </div>
      <strong>${race.name}</strong>
      <small>${race.access} / ${race.best}</small>
      <small>${raceMetricLine(race)}</small>
      <small>${raceMatchupLine(race.id)}</small>
      <p>${race.description}</p>
      <button class="button compact ${selected ? "secondary" : "primary"}" type="button" disabled>${selected ? "Active race" : "Random hatch"}</button>
    </article>
  `;
}

function renderClassGuideCard(classInfo, active) {
  const selected = Boolean(active && getClass(active.classId).id === classInfo.id);
  return `
    <article class="guide-card ${selected ? "selected" : ""}">
      <div class="guide-icon class-icon" aria-hidden="true">${classInfo.name.slice(0, 1)}</div>
      <strong>${classInfo.name}</strong>
      <small>${classInfo.bonus}</small>
      <small>Favors ${classInfo.style}</small>
      <p>${classInfo.description}</p>
      <button class="button compact ${selected ? "secondary" : "primary"}" type="button" disabled>${selected ? "Active class" : "Random hatch"}</button>
    </article>
  `;
}

function renderTrainingGuideCard(option) {
  return `
    <article class="guide-card">
      <strong>${option.label}</strong>
      <small>${option.role}</small>
      <p>${option.plain}</p>
      <small>${option.lightImpact}</small>
      <p>${option.caution}</p>
      <small>Light +${option.safeGain} at 100% | Moderate +${option.modGain} at 45% | Intense +${option.intenseGain} at 15%</small>
    </article>
  `;
}

function raceMatchupLine(id) {
  const wins = {
    normal: "beats Elemental",
    elemental: "beats Metal",
    metal: "beats Wood",
    wood: "beats Stone",
    stone: "beats Normal",
  };
  return wins[id] || "neutral matchup";
}

function getCharacterLine(character) {
  return `${getAffinity(character.affinityId).name} | ${getClass(character.classId).name} | ${character.rarity}`;
}

function renderArena() {
  const character = getActiveCharacter();
  const nextFight = character ? character.fightCount + 1 : 1;
  const battleRunning = Boolean(state.battleScene?.running);
  $("#fightCounterPill").textContent = character ? `${Math.min(character.fightCount, 10)} / 10 duels` : "No Character";
  $("#duelButton").disabled = battleRunning || !character || character.state === "dead" || character.marked;
  $("#practiceButton").disabled = battleRunning || !character || character.state === "dead";
  $("#duelButton").textContent = nextFight >= 11 ? "Enter tournament" : "Fight next Duel";
  $("#battlePrep").innerHTML = character ? renderBattlePrep(character) : `<div class="empty-state"><strong>No active Character</strong><p>Select a living Character before entering the Arena.</p></div>`;
  $("#battleStage").innerHTML = renderBattleStage(character);
  $("#markPill").textContent = state.marks.length ? `${state.marks.length} Mark${state.marks.length === 1 ? "" : "s"}` : "No Mark";
  $("#battleRoundPill").textContent = state.battleScene
    ? `${state.battleScene.label} ${Math.min(state.battleScene.index + 1, state.battleScene.events.length)}/${state.battleScene.events.length}`
    : "No battle";
  $("#markPanel").innerHTML = state.marks.length
    ? state.marks.map((mark) => `<div class="mark-card"><strong>The Mark</strong><p>${mark.characterName} won the tournament.</p></div>`).join("")
    : `<p class="body-copy">No tournament wins yet. Fight 11 is where the Mark is earned.</p>`;
  $("#battleLog").innerHTML = state.battleLog.map((entry) => `<article>${escapeHtml(entry)}</article>`).join("");
}

function renderBattleStage(character) {
  const scene = state.battleScene;
  if (!scene) {
    if (!character) {
      return `<div class="empty-state"><strong>No battle loaded</strong><p>Select a Character, then start a Duel or practice fight.</p></div>`;
    }
    const actor = battleActor(character);
    const preview = {
      label: "Ready",
      left: actor,
      right: {
        name: "Next Rival",
        className: "Unknown",
        affinityName: "???",
        affinityColor: "#a9a7a0",
        spriteSrc: raceSprites.normal,
        hpMax: actor.hpMax,
      },
      events: [{ side: "left", text: "Start a Duel to watch attacks resolve here.", leftHp: actor.hpMax, rightHp: actor.hpMax }],
      index: 0,
    };
    return renderBattleScene(preview);
  }
  return renderBattleScene(scene);
}

function renderBattleScene(scene) {
  const event = scene.events[scene.index] || scene.events[0];
  const leftHp = event.leftHp ?? scene.left.hpMax;
  const rightHp = event.rightHp ?? scene.right.hpMax;
  const activeClass = event.final ? "is-final" : event.side === "left" ? "is-attacking-left" : "is-attacking-right";
  const abilityClass = `ability-${String(event.ability || "strike").toLowerCase()}`;
  const targetSide = event.side === "left" ? "right" : "left";
  return `
    <div class="battle-stage ${activeClass} ${abilityClass}">
      <div class="battle-scanlines" aria-hidden="true"></div>
      ${renderBattleFighter(scene.left, leftHp, "left", targetSide === "left" && !event.final)}
      <div class="battle-vs">
        <span>${scene.label}</span>
        <strong>VS</strong>
      </div>
      <div class="battle-projectile" aria-hidden="true"></div>
      <div class="battle-impact" aria-hidden="true"></div>
      ${event.damage && !event.final ? `<strong class="battle-damage ${targetSide}">-${event.damage}</strong>` : ""}
      ${event.heal && !event.final ? `<strong class="battle-heal ${event.side}">+${event.heal}</strong>` : ""}
      ${renderBattleFighter(scene.right, rightHp, "right", targetSide === "right" && !event.final)}
    </div>
    <div class="battle-action-text">${escapeHtml(event.text)}</div>
  `;
}

function renderBattleFighter(actor, hp, side, isHit = false) {
  const hpPct = actor.hpMax ? Math.max(0, Math.min(100, (hp / actor.hpMax) * 100)) : 0;
  return `
    <div class="battle-fighter ${side} ${isHit ? "is-hit" : ""}">
      <div class="battle-sprite-card" style="--affinity:${actor.affinityColor}">
        <img class="battle-sprite-img" src="${escapeHtml(actor.spriteSrc || raceSprites.normal)}" alt="" loading="lazy" />
      </div>
      <div>
        <h4>${actor.name}</h4>
        <p>${actor.affinityName} ${actor.className}</p>
      </div>
      <div class="hp-track"><span style="width:${hpPct}%"></span></div>
      <small>${fmt(hp)} / ${fmt(actor.hpMax)} Health</small>
    </div>
  `;
}

function renderBattlePrep(character) {
  const stats = getCharacterStats(character);
  const ability = getSpecialAbility(stats);
  const affinity = getAffinity(character.affinityId);
  return `
    ${renderCharacterMini(character)}
    <div class="doc-facts">
      <div class="fact-box"><span>Next</span><strong>${character.fightCount + 1 >= 11 ? "Tournament" : `Duel ${character.fightCount + 1}`}</strong></div>
      <div class="fact-box"><span>Ability</span><strong>${ability}</strong></div>
      <div class="fact-box"><span>Race</span><strong style="color:${affinity.color}">${affinity.name}</strong></div>
      <div class="fact-box"><span>TP</span><strong>${character.trainingPoints}</strong></div>
    </div>
  `;
}

function renderDocs() {
  const filtered = chapters.filter((chapter) => {
    const haystack = `${chapter.title} ${chapter.summary} ${chapter.body.join(" ")}`.toLowerCase();
    return haystack.includes(activeDocFilter);
  });
  if (!filtered.some((chapter) => chapter.id === activeChapter)) {
    activeChapter = filtered[0]?.id || chapters[0].id;
  }
  $("#chapterLinks").innerHTML = filtered
    .map(
      (chapter) =>
        `<button type="button" class="${chapter.id === activeChapter ? "is-active" : ""}" data-chapter="${chapter.id}">${chapter.title}</button>`,
    )
    .join("");
  $$("#chapterLinks button").forEach((button) => {
    button.addEventListener("click", () => {
      activeChapter = button.dataset.chapter;
      renderDocs();
    });
  });

  const chapter = chapters.find((entry) => entry.id === activeChapter) || filtered[0] || chapters[0];
  $("#docsContent").innerHTML = renderChapter(chapter);
}

function renderChapter(chapter) {
  return `
    <article class="doc-chapter">
      <p class="eyebrow">Chapter</p>
      <h3>${chapter.title}</h3>
      <p>${chapter.summary}</p>
      <div class="doc-facts">
        ${chapter.facts.map(([label, value]) => `<div class="fact-box"><span>${label}</span><strong>${value}</strong></div>`).join("")}
      </div>
      ${chapter.body.map((text) => `<p>${text}</p>`).join("")}
      ${chapter.kind === "tokenomics" ? renderTokenomics() : ""}
      ${chapter.kind === "contracts" ? renderContracts() : ""}
      ${chapter.kind === "classes" ? renderClassDocs() : ""}
      ${chapter.kind === "affinities" ? renderAffinityDocs() : ""}
      ${chapter.kind === "loot" ? renderLootDocs() : ""}
    </article>
  `;
}

function renderTokenomics() {
  return `
    <div class="allocation-bar" aria-label="CYCLOPS allocation bar">
      ${allocations
        .map((item) => `<span class="allocation-segment" style="width:${item.percent}%; background:${item.color}"></span>`)
        .join("")}
    </div>
    <div class="allocation-grid">
      ${allocations
        .map((item) => `<div class="allocation-item"><span>${item.percent}%</span><strong>${item.name}</strong><p>${item.amount} CYCLOPS</p></div>`)
        .join("")}
    </div>
  `;
}

function renderContracts() {
  return `
    <div class="contract-grid">
      ${contracts.map(([label, value]) => `<div class="contract-item"><span>${label}</span><strong>${value}</strong></div>`).join("")}
    </div>
  `;
}

function renderClassDocs() {
  return `
    <h4>Combat styles</h4>
    <div class="combat-style-grid">${combatStyles.map((style) => renderCombatStyleCard(style, "is-doc")).join("")}</div>
    <h4>Classes</h4>
    <div class="class-grid">
      ${classes
        .map(
          (item) => `
          <div class="class-item">
            <span>${item.bonus}</span>
            <strong>${item.name}</strong>
            <p>Favors ${item.style}</p>
            <p>${item.description}</p>
          </div>
        `,
        )
        .join("")}
    </div>
  `;
}

function renderAffinityDocs() {
  return `
    <div class="class-grid">
      ${affinities
        .map(
          (item) => `
          <div class="class-item race-doc-item">
            <div class="guide-icon race-icon" style="--affinity:${item.color}" aria-hidden="true">
              <img src="${escapeHtml(item.sprite)}" alt="" loading="lazy" />
            </div>
            <span style="color:${item.color}">${item.name}</span>
            <strong>${raceMatchupLine(item.id)}</strong>
            <p>${raceMetricLine(item)}</p>
            <p>${item.description}</p>
          </div>
        `,
        )
        .join("")}
    </div>
  `;
}

function renderLootDocs() {
  return `
    <div class="class-grid">
      ${lootCategories
        .map(
          (item) => `
          <div class="class-item loot-doc-item">
            ${renderLootVisual({ name: item.variants[0].name, image: item.variants[0].image }, "is-doc")}
            <div>
              <span>${item.name}</span>
              <strong>${item.label}</strong>
              <p>${Object.entries(item.ranges)
                .map(([rarity, range]) => `${rarity}: ${range[0]}-${range[1]}${item.unit}`)
                .join(" | ")}</p>
            </div>
          </div>
        `,
        )
        .join("")}
    </div>
    <div class="allocation-grid">
      ${lootRarities
        .map(
          (item) => `
          <div class="allocation-item">
            <span style="color:${item.color}">${item.weight}%</span>
            <strong>${item.name}</strong>
            <p>${item.durability} durability | ${item.sideRolls} combat side roll${item.sideRolls === 1 ? "" : "s"}</p>
          </div>
        `,
        )
        .join("")}
    </div>
  `;
}

function renderLeaderboard() {
  const stats = getStats();
  const character = getActiveCharacter();
  const players = [
    ...mockPlayers,
    {
      name: "you",
      character: character ? getAffinity(character.affinityId).name : "No Character",
      className: character ? getClass(character.classId).name : "-",
      total: state.totalEarned,
      steal: stats.steal,
      player: true,
    },
  ].sort((a, b) => b.total - a.total);

  $("#podium").innerHTML = players
    .slice(0, 3)
    .map(
      (player, index) => `
      <article class="podium-card">
        <p class="eyebrow">#${index + 1}</p>
        <h3>${player.name}</h3>
        <p>${player.character} ${player.className}</p>
        <strong>${fmt(player.total)} shards</strong>
      </article>
    `,
    )
    .join("");

  $("#leaderboardBody").innerHTML = players
    .map(
      (player, index) => `
      <tr class="${player.player ? "is-player" : ""}">
        <td>#${index + 1}</td>
        <td>${player.name}</td>
        <td>${player.character}</td>
        <td>${player.className}</td>
        <td>${fmt(player.total)}</td>
        <td>${fmt(player.steal, 2)}x</td>
      </tr>
    `,
    )
    .join("");
}

function renderQuests() {
  $("#questGrid").innerHTML = questDefs
    .map((quest) => {
      const { current, progress } = questProgress(quest);
      const claimed = state.questRewards.includes(quest.id);
      const complete = progress >= 1;
      return `
        <article class="quest-card">
          <div>
            <span class="pill">${claimed ? "Claimed" : complete ? "Ready" : "In progress"}</span>
            <h3>${quest.title}</h3>
            <p>${quest.text}</p>
          </div>
          <div class="progress-track"><span style="width:${progress * 100}%"></span></div>
          <p>${fmt(current, quest.metric === "steal" ? 2 : 0)} / ${fmt(quest.target, quest.metric === "steal" ? 2 : 0)}</p>
          <button class="button compact ${complete && !claimed ? "primary" : ""}" type="button" data-quest="${quest.id}" ${
            complete && !claimed ? "" : "disabled"
          }>
            ${claimed ? "Reward claimed" : `Claim ${quest.reward}`}
          </button>
        </article>
      `;
    })
    .join("");
  $$("[data-quest]").forEach((button) => {
    button.addEventListener("click", () => claimQuest(button.dataset.quest));
  });
}

function renderShop() {
  const upgrades = [
    ["maxEnergy", "Max energy", "+80 base energy per level"],
    ["regen", "Regen rate", "+7 energy per hour per level"],
    ["steal", "Extraction", "+0.18x extract per level"],
  ];
  $("#burnedPill").textContent = `${fmt(state.burned)} burned`;
  $("#farmPill").textContent = `Level ${state.farmLevel}`;
  $("#buyFarm").textContent = `Buy bay level - ${money(farmCost())}`;
  $("#lootCratePrice").textContent = money(lootCrateCost);
  $("#upgradeList").innerHTML = upgrades
    .map(([type, name, text]) => {
      const cost = costFor(type);
      return `
        <div class="upgrade-row">
          <div>
            <strong>${name} level ${state.levels[type]}</strong>
            <small>${text}</small>
          </div>
          <button class="button compact" type="button" data-upgrade="${type}">${money(cost)}</button>
        </div>
      `;
    })
    .join("");
  $$("[data-upgrade]").forEach((button) => {
    button.addEventListener("click", () => buyUpgrade(button.dataset.upgrade));
  });
}

function renderInventory() {
  const active = getActiveCharacter();
  const equipped = getEquippedLoot(active);
  $("#lootStats").innerHTML = [
    ["Owned loot", state.inventory.length],
    ["Equipped", equipped ? equipped.name : "None"],
    ["Crates opened", state.lootCratesOpened],
    ["Repair sink", `${fmt(state.burned)} burned`],
  ]
    .map(([label, value]) => `<div class="stat-pill"><span>${label}</span><strong>${value}</strong></div>`)
    .join("");
  if (!state.inventory.length) {
    $("#inventoryGrid").innerHTML = `
      <article class="gear-card">
        <span class="rarity">Empty</span>
        <h3>No loot yet</h3>
        <p>Open a loot crate or buy from the market to get your first item.</p>
      </article>
    `;
    return;
  }
  $("#inventoryGrid").innerHTML = state.inventory
    .map((item) => {
      const equipped = active?.equippedLootId === item.id;
      const repair = repairCost(item);
      const durabilityPct = Math.round((item.durability / item.maxDurability) * 100);
      return `
        <article class="gear-card ${equipped ? "is-equipped" : ""}">
          <div class="gear-card-top">
            ${renderLootVisual(item, "is-card")}
            <span class="rarity" style="color:${item.color}">${item.rarity}</span>
          </div>
          <h3>${item.name}</h3>
          <p>${item.category} | ${formatLootPrimary(item)}</p>
          <p>${formatSideStats(item)}</p>
          <div class="durability-track"><span style="width:${durabilityPct}%"></span></div>
          <p>Durability ${item.durability}/${item.maxDurability} | Scrap ${money(scrapValue(item))}</p>
          <button class="button compact ${equipped ? "secondary" : "primary"}" type="button" data-equip="${item.id}">
            ${equipped ? "Equipped" : "Equip"}
          </button>
          <button class="button compact" type="button" data-repair-loot="${item.id}" ${repair <= 0 ? "disabled" : ""}>
            Repair ${repair > 0 ? money(repair) : "full"}
          </button>
          <button class="button compact" type="button" data-list-loot="${item.id}" data-currency="shards">List shards</button>
          <button class="button compact" type="button" data-list-loot="${item.id}" data-currency="eth">List ETH</button>
          <button class="button compact danger" type="button" data-scrap-loot="${item.id}">Scrap</button>
        </article>
      `;
    })
    .join("");
  $$("[data-equip]").forEach((button) => button.addEventListener("click", () => equipItem(button.dataset.equip)));
  $$("[data-repair-loot]").forEach((button) => button.addEventListener("click", () => repairLoot(button.dataset.repairLoot)));
  $$("[data-scrap-loot]").forEach((button) => button.addEventListener("click", () => scrapLoot(button.dataset.scrapLoot)));
  $$("[data-list-loot]").forEach((button) => {
    button.addEventListener("click", () => listLoot(button.dataset.listLoot, button.dataset.currency));
  });
}

function renderMarket() {
  if (!$("#marketGrid")) return;
  const owned = state.marketListings.filter((listing) => listing.seller === "you");
  const external = state.marketListings.filter((listing) => listing.seller !== "you").slice(0, 12);
  $("#marketStats").innerHTML = [
    ["Shards", money(state.shards)],
    ["ETH", `${fmt(state.ethBalance, 4)} ETH`],
    ["Your listings", owned.length],
    ["Sales filled", state.marketSales],
  ]
    .map(([label, value]) => `<div class="stat-pill"><span>${label}</span><strong>${value}</strong></div>`)
    .join("");
  $("#marketGrid").innerHTML = external.map(renderMarketListing).join("");
  $("#playerListings").innerHTML = owned.length
    ? owned.map(renderPlayerListing).join("")
    : `<article class="gear-card"><span class="rarity">Empty</span><h3>No active listings</h3><p>List loot from your inventory for shards or ETH.</p></article>`;
  $$("[data-buy-listing]").forEach((button) => button.addEventListener("click", () => buyMarketListing(button.dataset.buyListing)));
  $$("[data-cancel-listing]").forEach((button) => button.addEventListener("click", () => cancelListing(button.dataset.cancelListing)));
}

function renderMarketListing(listing) {
  const item = listing.item;
  return `
    <article class="gear-card">
      <div class="gear-card-top">
        ${renderLootVisual(item, "is-card")}
        <span class="rarity" style="color:${item.color}">${item.rarity}</span>
      </div>
      <h3>${item.name}</h3>
      <p>${item.category} | ${formatLootPrimary(item)}</p>
      <p>${formatSideStats(item)}</p>
      <p>Durability ${item.durability}/${item.maxDurability} | Seller ${listing.seller}</p>
      <button class="button compact primary" type="button" data-buy-listing="${listing.id}">
        Buy ${listing.currency === "eth" ? `${fmt(listing.price, 4)} ETH` : money(listing.price)}
      </button>
    </article>
  `;
}

function renderPlayerListing(listing) {
  const item = listing.item;
  return `
    <article class="gear-card is-equipped">
      <div class="gear-card-top">
        ${renderLootVisual(item, "is-card")}
        <span class="rarity" style="color:${item.color}">${item.rarity}</span>
      </div>
      <h3>${item.name}</h3>
      <p>${item.category} | ${formatLootPrimary(item)}</p>
      <p>Listed for ${listing.currency === "eth" ? `${fmt(listing.price, 4)} ETH` : money(listing.price)}</p>
      <button class="button compact" type="button" data-cancel-listing="${listing.id}">Cancel listing</button>
    </article>
  `;
}

function renderProfile() {
  const stats = getStats();
  const character = getActiveCharacter();
  $("#profileStats").innerHTML = [
    ["Wallet", "Alpha player"],
    ["Active Character", character ? character.name : "None"],
    ["Roster", `${state.characters.length} Characters`],
    ["Marks", state.marks.length],
    ["Balance", money(state.shards)],
    ["ETH sim", `${fmt(state.ethBalance, 4)} ETH`],
    ["Total clicks", fmt(state.totalClicks)],
    ["Total earned", money(state.totalEarned)],
    ["Energy max", fmt(stats.maxEnergy)],
    ["Claimable", `${fmt(Math.min(state.totalEarned * 0.08, 25000), 2)} model CYCLOPS`],
  ]
    .map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`)
    .join("");
  $("#referralCode").textContent = getReferralCode();
  $("#claimCopy").textContent =
    "Claim math is modeled here for economy planning. Wallet transactions should stay gated until contracts, audit reports, terms, and operator disclosures are final.";
  $("#chatLog").innerHTML = state.chat
    .map((message) => `<div class="chat-message"><strong>${message.name}</strong><span>${escapeHtml(message.text)}</span></div>`)
    .join("");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

function renderLootVisual(item, modifier = "") {
  if (!item?.image) return "";
  return `
    <span class="loot-visual ${modifier}" aria-hidden="true">
      <img src="${escapeHtml(item.image)}" alt="" loading="lazy" />
    </span>
  `;
}

function boot() {
  initNavigation();
  initTheme();
  initControls();
  saveState();
  routeTo(location.hash.slice(1) || "play");
  window.setInterval(render, 5000);
}

boot();
