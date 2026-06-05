const storageKey = "cyclops-button-community-state-v3";
const legacyStorageKey = "cyclops-button-community-state-v2";

const characterEggCost = 750;
const rerollCost = 200;
const lootCrateCost = 300;
const marketFee = 0.05;
const shardsPerEth = 12000;

const raceSprites = {
  normal: "assets/NormalForward.png",
  elemental: "assets/ElementalForward.png",
  wood: "assets/WoodForward.png",
  stone: "assets/StoneForward.png",
  metal: "assets/MetalForward.png",
};

const loadouts = [
  {
    id: "rookie-visor",
    name: "Rookie Visor",
    access: "Starter",
    energy: 500,
    regen: 20.83,
    steal: 0.2,
    description:
      "The safe starter rig. It holds 500 energy, regenerates 20.83 energy per hour, refills in about 24 hours, and starts at 0.20 base extraction before class, stats, loot, and upgrades.",
  },
  {
    id: "neon-courier",
    name: "Neon Courier",
    access: "Crate",
    energy: 1000,
    regen: 41.67,
    steal: 1.0,
    description:
      "The balanced runner. It holds 1,000 energy, regenerates 41.67 energy per hour, refills in about 24 hours, and starts at 1.00 base extraction for a clean all-day profile.",
  },
  {
    id: "cargo-bruiser",
    name: "Cargo Bruiser",
    access: "Crate",
    energy: 1500,
    regen: 33.33,
    steal: 0.75,
    description:
      "The deep-session tank. It holds 1,500 energy, regenerates 33.33 energy per hour, refills in about 45 hours, and starts at 0.75 base extraction for longer but slower sessions.",
  },
  {
    id: "arcade-racketeer",
    name: "Arcade Racketeer",
    access: "Crate",
    energy: 500,
    regen: 20.83,
    steal: 1.8,
    description:
      "The burst raider. It holds 500 energy, regenerates 20.83 energy per hour, refills in about 24 hours, and starts at 1.80 base extraction for short high-impact bursts.",
  },
  {
    id: "glitch-runner",
    name: "Glitch Runner",
    access: "Crate",
    energy: 600,
    regen: 58.33,
    steal: 1.0,
    description:
      "The frequent-check-in build. It holds 600 energy, regenerates 58.33 energy per hour, refills in about 10.3 hours, and starts at 1.00 base extraction for multiple daily loops.",
  },
  {
    id: "patch-prophet",
    name: "Patch Prophet",
    access: "Rare crate",
    energy: 880,
    regen: 36.67,
    steal: 1.25,
    description:
      "The efficient quest-style all-rounder. It holds 880 energy, regenerates 36.67 energy per hour, refills in about 24 hours, and starts at 1.25 base extraction without demanding constant check-ins.",
  },
  {
    id: "wrong-warp-pilot",
    name: "Wrong-Warp Pilot",
    access: "Rare crate",
    energy: 800,
    regen: 33.33,
    steal: 1.5,
    description:
      "The aggressive specialist. It holds 800 energy, regenerates 33.33 energy per hour, refills in about 24 hours, and starts at 1.50 base extraction for offense-focused builds.",
  },
];

const classes = [
  {
    id: "mage",
    name: "Mage",
    bonus: "+15% regen, +2 Power",
    regen: 1.15,
    steal: 1,
    energy: 1,
    luck: 1,
    statMods: { health: 0, violence: 0, power: 2, harmony: 0 },
    description: "Channels Power into faster recovery and spell-heavy battle turns.",
  },
  {
    id: "warrior",
    name: "Warrior",
    bonus: "+15% steal, +2 Violence",
    regen: 1,
    steal: 1.15,
    energy: 1,
    luck: 1,
    statMods: { health: 0, violence: 2, power: 0, harmony: 0 },
    description: "Hits harder in Duels and extracts more shards through direct pressure.",
  },
  {
    id: "knight",
    name: "Knight",
    bonus: "+15% max energy, +20 HP",
    regen: 1,
    steal: 1,
    energy: 1.15,
    luck: 1,
    statMods: { health: 20, violence: 0, power: 0, harmony: 0 },
    description: "Protects a larger energy pool and survives longer in tournament brackets.",
  },
  {
    id: "shaman",
    name: "Shaman",
    bonus: "1.4x lucky signals, +2 Harmony",
    regen: 1,
    steal: 1,
    energy: 1,
    luck: 1.4,
    statMods: { health: 0, violence: 0, power: 0, harmony: 2 },
    description: "Reads omens, improves lucky signal odds, and favors sustain-heavy battle turns.",
  },
  {
    id: "rogue",
    name: "Rogue",
    bonus: "+10% steal, 1.18x lucky signals, +1 Violence",
    regen: 1,
    steal: 1.1,
    energy: 1,
    luck: 1.18,
    statMods: { health: 0, violence: 1, power: 0, harmony: 1 },
    description: "Trades raw bulk for marketable burst, lucky spikes, and quick pressure.",
  },
  {
    id: "ranger",
    name: "Ranger",
    bonus: "+8% regen, +8% max energy, +1 Harmony",
    regen: 1.08,
    steal: 1,
    energy: 1.08,
    luck: 1.08,
    statMods: { health: 6, violence: 1, power: 0, harmony: 1 },
    description: "Balances exploration stats, steady recovery, and flexible race matchups.",
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
    description: "Beats Elemental. Neutral bodies have no trick damage, but their consistency makes them hard to punish.",
  },
  {
    id: "elemental",
    name: "Elemental",
    color: "#8fd3ff",
    sprite: raceSprites.elemental,
    access: "Egg roll",
    best: "Spell pressure",
    description: "Beats Metal. Elemental bodies convert Power into explosive turns and strong recovery pressure.",
  },
  {
    id: "wood",
    name: "Wood",
    color: "#55ef85",
    sprite: raceSprites.wood,
    access: "Egg roll",
    best: "Growth and sustain",
    description: "Beats Stone. Wood bodies reward Harmony, longer fights, and Ranger-style tempo play.",
  },
  {
    id: "stone",
    name: "Stone",
    color: "#c5aa74",
    sprite: raceSprites.stone,
    access: "Egg roll",
    best: "Tank brackets",
    description: "Beats Normal. Stone bodies are slow but durable, making close tournament rounds safer.",
  },
  {
    id: "metal",
    name: "Metal",
    color: "#b7c3d0",
    sprite: raceSprites.metal,
    access: "Egg roll",
    best: "Reliable strikes",
    description: "Beats Wood. Metal bodies sharpen Violence turns and punish sustain-heavy opponents.",
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
  { name: "common", weight: 58, mult: 1, bonus: 0, color: "#a9a7a0" },
  { name: "rare", weight: 27, mult: 1.18, bonus: 2, color: "#6ea8d9" },
  { name: "epic", weight: 12, mult: 1.38, bonus: 4, color: "#b879ff" },
  { name: "legendary", weight: 3, mult: 1.72, bonus: 7, color: "#f3c94c" },
];

const traitPool = [
  { name: "Chrome Body", slot: "Body", statMods: { health: 12, violence: 0, power: 0, harmony: 0 } },
  { name: "Cracked Stone Body", slot: "Body", statMods: { health: 8, violence: 1, power: 0, harmony: 0 } },
  { name: "Overclocked Eye", slot: "Eye", statMods: { health: 0, violence: 0, power: 2, harmony: 0 } },
  { name: "Redline Eye", slot: "Eye", statMods: { health: 0, violence: 2, power: 0, harmony: 0 } },
  { name: "Static Mouth", slot: "Mouth", statMods: { health: 0, violence: 1, power: 1, harmony: 0 } },
  { name: "Calm Mouth", slot: "Mouth", statMods: { health: 0, violence: 0, power: 0, harmony: 2 } },
  { name: "Signal Bloom", slot: "Signal", statMods: { health: 0, violence: 0, power: 1, harmony: 1 } },
  { name: "Arena Instinct", slot: "Instinct", statMods: { health: 6, violence: 1, power: 0, harmony: 0 } },
  { name: "Mirror Omen", slot: "Instinct", statMods: { health: 0, violence: 0, power: 0, harmony: 3 } },
];

const lootCategories = [
  {
    id: "lens",
    name: "Lens",
    primary: "steal",
    label: "Extraction",
    unit: "x",
    names: ["Redline Lens", "Signal Monocle", "Glare Prism", "Vault Eye", "Obsidian Scope"],
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
    names: ["Neon Boots", "Bay Runners", "Static Treads", "Pulse Greaves", "Wrong-Warp Boots"],
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
    names: ["Battery Core", "Sunken Reactor", "Chrome Heart", "Overdrive Cell", "Mark Engine"],
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
    label: "Lucky signal",
    unit: "%",
    names: ["Mirror Charm", "Glass Omen", "One-Eyed Coin", "Signal Halo", "Festival Token"],
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
    names: ["Bay Relic", "Green Talisman", "Archive Key", "Circuit Idol", "Portal Fragment"],
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
    label: "Weight Room",
    stat: "health",
    safeGain: 10,
    modGain: 20,
    intenseGain: 40,
    description: "Raises HP for battles and adds 2 max energy per HP to the clicker.",
  },
  {
    id: "power",
    label: "Sacred Flame",
    stat: "power",
    safeGain: 1,
    modGain: 2,
    intenseGain: 4,
    description: "Raises battle spell pressure, adds 0.2 energy regen per hour, and adds 0.018 extraction per Power.",
  },
  {
    id: "harmony",
    label: "Meditation",
    stat: "harmony",
    safeGain: 1,
    modGain: 2,
    intenseGain: 4,
    description: "Raises sustain and reflection builds, adds 0.7 energy regen per hour, and improves lucky signal odds.",
  },
  {
    id: "violence",
    label: "Combat Drills",
    stat: "violence",
    safeGain: 1,
    modGain: 2,
    intenseGain: 4,
    description: "Raises battle strike pressure and adds 0.035 extraction per Violence.",
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
    summary: "Players begin with one Egg. Eggs hatch random Characters with loadout, race, class, rarity, traits, and stats.",
    facts: [
      ["Starter", "1 free Egg"],
      ["Roster", "Multiple Characters"],
      ["Active", "1 clicking Character"],
      ["Reroll", "Destroys active"],
    ],
    body: [
      "A Character is the core playable unit. It controls clicker output and carries battle progression.",
      "Each Character has a loadout for clicker stats, a race for battle matchups and sprite identity, a class for clicker and battle bias, traits for stat boosts, and a lifecycle state.",
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
      ["Durability", "Power scales with condition"],
      ["Sinks", "Repair, scrap, market fees"],
    ],
    body: [
      "Items should not be pure chaos. A Lens always rolls extraction, Boots always roll regen, a Core always rolls max energy, a Charm always rolls lucky signal, and a Relic always rolls bay yield.",
      "The random part is rarity, exact stat value, durability ceiling, and combat side rolls. That gives buyers a readable market while preserving chase value.",
      "Loot above zero durability works. Below 50% durability it contributes 60% power. At zero durability it stays in inventory but contributes nothing until repaired.",
    ],
    kind: "loot",
  },
  {
    id: "loadouts",
    title: "Loadouts",
    summary: "Loadouts are the clicker body plan. They set energy pool, regen profile, and base shard extraction.",
    facts: [
      ["Energy", "How long a session lasts"],
      ["Regen", "How fast energy returns"],
      ["Steal", "Shard extraction per press"],
    ],
    body: [
      "Loadout numbers are the Character's clicker base before class bonuses, trained stats, account upgrades, loot, party bonus, and lucky signals are applied.",
      "Energy is the number of presses a Character can spend. Regen is the hourly refill rate. Base extraction feeds the final shard reward per press.",
    ],
    kind: "loadouts",
  },
  {
    id: "classes",
    title: "Classes",
    summary: "Classes add one strong clicker bias and one battle-stat bias.",
    facts: classes.map((item) => [item.name, item.bonus]),
    body: [
      "Mage helps energy regen and Power. Warrior helps shard extraction and Violence. Knight helps energy max and HP. Shaman helps lucky signals and Harmony. Rogue and Ranger add hybrid RPG paths for market and race builds.",
      "Classes are the profession layer. A Wood Ranger and a Wood Shaman share race matchup rules, but their training priorities and clicker outputs diverge.",
    ],
    kind: "classes",
  },
  {
    id: "affinities",
    title: "Races",
    summary: "Races create battle matchup edges and determine the placeholder battle sprite used for the Character.",
    facts: [
      ["Normal", "Beats Elemental"],
      ["Elemental", "Beats Metal"],
      ["Metal", "Beats Wood"],
      ["Wood", "Beats Stone"],
      ["Stone", "Beats Normal"],
    ],
    body: [
      "Races do not change the clicker directly yet. They matter in Duels and tournaments, where matchup edges can swing close fights.",
      "Race art is currently shared by battle sprites. The enemy uses the forward-facing PNG, and your active Character uses the same sprite mirrored until dedicated player-side sheets are ready.",
    ],
    kind: "affinities",
  },
  {
    id: "training",
    title: "Training",
    summary: "Battles grant training points. Training increases HP, Violence, Power, or Harmony with different risk tiers.",
    facts: [
      ["Light", "100% success"],
      ["Moderate", "45% success"],
      ["Intense", "15% success"],
      ["Cost", "1 TP per attempt"],
    ],
    body: [
      "Weight Room trains HP, which improves survival and max energy. Combat Drills train Violence, which improves strike pressure and extraction. Sacred Flame trains Power, which improves spell pressure, regen, and extraction. Meditation trains Harmony, which improves sustain, regen, and lucky signals.",
      "Every attempt costs 1 TP. Light training always succeeds. Moderate and intense training can fail, and failed training consumes the TP with no stat increase.",
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
  { name: "@cyclops", character: "Neon Courier", className: "Warrior", total: 128000, steal: 2.8 },
  { name: "0x8f...21", character: "Arcade Racketeer", className: "Rogue", total: 84000, steal: 3.1 },
  { name: "0xa4...90", character: "Glitch Runner", className: "Mage", total: 72000, steal: 2.2 },
  { name: "0x57...ca", character: "Cargo Bruiser", className: "Knight", total: 63400, steal: 1.9 },
  { name: "@visorcrew", character: "Patch Prophet", className: "Shaman", total: 58150, steal: 2.4 },
  { name: "0xd1...44", character: "Rookie Visor", className: "Ranger", total: 21400, steal: 1.1 },
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

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved) return normalizeState(saved);

    const legacy = JSON.parse(localStorage.getItem(legacyStorageKey));
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
    characters: (saved.characters || []).map(normalizeCharacter),
    battleLog: saved.battleLog?.length ? saved.battleLog.slice(-40) : defaultState.battleLog,
    battleScene: null,
    marks: saved.marks || [],
    marketListings: (saved.marketListings || []).map(normalizeMarketListing).filter(Boolean),
    chat: (saved.chat || defaultState.chat).filter((message) => ["operator", "builder", "you"].includes(message.name)),
  };
  if (!next.chat.length) next.chat = structuredClone(defaultState.chat);
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

function normalizeCharacter(character) {
  const normalizedClassId = classIdMap[character.classId] || character.classId || classes[0].id;
  const normalizedAffinityId = affinityIdMap[character.affinityId] || character.affinityId || affinities[0].id;
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
    ...character,
    classId: normalizedClassId,
    affinityId: normalizedAffinityId,
    traits: (character.traits || []).map(normalizeTrait),
    trainedStats: { health: 0, violence: 0, power: 0, harmony: 0, ...(character.trainedStats || {}) },
  };
}

function normalizeTrait(trait) {
  if (!trait) return trait;
  const slot = trait.slot?.startsWith("Equip") ? "Instinct" : trait.slot;
  const nameMap = {
    "Arena Kit": "Arena Instinct",
    "Mirror Charm": "Mirror Omen",
  };
  return {
    ...trait,
    slot,
    name: nameMap[trait.name] || trait.name,
  };
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function getActiveCharacter() {
  return state.characters.find((character) => character.id === state.activeCharacterId) || null;
}

function getLoadout(id) {
  return loadouts.find((item) => item.id === id) || loadouts[0];
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
  return rarities.find((item) => item.name === name) || rarities[0];
}

function getLootCategory(id) {
  return lootCategories.find((item) => item.id === id) || lootCategories[0];
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
  for (const trait of character.traits || []) {
    for (const [stat, value] of Object.entries(trait.statMods || {})) {
      stats[stat] += value;
    }
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
    return { maxEnergy: 0, regen: 0, steal: 0, reward: 0, partyBonus: 1, luck: 0, characterStats: getCharacterStats(null) };
  }
  const loadout = getLoadout(character.loadoutId);
  const classInfo = getClass(character.classId);
  const battleStats = getCharacterStats(character);
  const loot = getLootBonuses(character);
  const maxEnergy = Math.round((loadout.energy + state.levels.maxEnergy * 80 + loot.energy + battleStats.health * 2) * classInfo.energy);
  const regen = (loadout.regen + state.levels.regen * 7 + loot.regen + battleStats.harmony * 0.7 + battleStats.power * 0.2) * classInfo.regen;
  const steal = (loadout.steal + state.levels.steal * 0.18 + loot.steal + battleStats.violence * 0.035 + battleStats.power * 0.018) * classInfo.steal;
  const partyBonus = state.referrals >= 2 ? 1.018 : 1;
  const reward = 0.2 * steal * partyBonus;
  const luck = classInfo.luck + loot.luck + battleStats.harmony * 0.015;
  return { maxEnergy, regen, steal, reward, partyBonus, luck, characterStats: battleStats, loot };
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

function loadoutRefillHours(loadout) {
  return loadout.regen <= 0 ? 0 : loadout.energy / loadout.regen;
}

function loadoutMetricLine(loadout) {
  return `${fmt(loadout.energy)} energy | ${fmt(loadout.regen, 2)} energy/h | ~${fmt(loadoutRefillHours(loadout), 1)}h refill | ${fmt(loadout.steal, 2)} base extraction`;
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
  const target = $(`[data-view="${route}"]`) ? route : "home";
  $$(".view").forEach((view) => view.classList.toggle("is-active", view.dataset.view === target));
  $$("[data-route-link]").forEach((link) => link.classList.toggle("is-active", link.dataset.routeLink === target));
  $("#topNav").classList.remove("is-open");
  $("#navToggle").setAttribute("aria-expanded", "false");
  if (location.hash.slice(1) !== target) {
    history.replaceState(null, "", `#${target}`);
  }
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
  window.addEventListener("hashchange", () => routeTo(location.hash.slice(1) || "home"));
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
  $("#openCrate").addEventListener("click", openLootCrate);
  $("#settleMarket").addEventListener("click", settleMarket);
  $("#copyReferral").addEventListener("click", copyReferral);
  $("#chatForm").addEventListener("submit", sendChat);
  $("#openCharacterEgg").addEventListener("click", openCharacterEgg);
  $("#buyCharacterEgg").addEventListener("click", buyCharacterEgg);
  $("#rerollActive").addEventListener("click", rerollActiveCharacter);
  $("#duelButton").addEventListener("click", fightNextBattle);
  $("#practiceButton").addEventListener("click", practiceBattle);
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
  const luckyChance = 0.00582 * stats.luck;
  let note = `${character.name} extracted +${fmt(gain, 2)} shards.`;
  if (Math.random() < luckyChance) {
    const lucky = 2 + Math.random() * 38;
    gain += lucky;
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
  return {
    id: item.id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())),
    name: item.name || `${rarity.name.toUpperCase()} ${randomFrom(category.names)}`,
    categoryId: category.id,
    category: category.name,
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
  const range = category.ranges[rarity.name];
  const primaryValue = randomBetween(range, category.primary === "energy" ? 0 : 2);
  const quality = Math.max(0, Math.min(1, (primaryValue - range[0]) / Math.max(0.0001, range[1] - range[0])));
  return normalizeLootItem({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    name: `${rarity.name.toUpperCase()} ${randomFrom(category.names)}`,
    categoryId: category.id,
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
  const loadout = weightedLoadout(rarity);
  const classInfo = randomFrom(classes);
  const affinity = randomFrom(affinities);
  const traits = rollTraits(rarity);
  state.charactersMinted += 1;
  const serial = String(state.charactersMinted).padStart(3, "0");
  return normalizeCharacter({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    name: `${rarity.name.toUpperCase()}-${serial}`,
    loadoutId: loadout.id,
    classId: classInfo.id,
    affinityId: affinity.id,
    rarity: rarity.name,
    traits,
    mintedAt: Date.now(),
  });
}

function weightedLoadout(rarity) {
  const regular = loadouts.slice(0, 5);
  const rare = loadouts.slice(5);
  if (rarity.name === "epic" || rarity.name === "legendary") return Math.random() < 0.5 ? randomFrom(rare) : randomFrom(loadouts);
  if (rarity.name === "rare") return Math.random() < 0.25 ? randomFrom(rare) : randomFrom(loadouts);
  return randomFrom(regular);
}

function rollTraits(rarity) {
  const count = rarity.name === "legendary" ? 4 : rarity.name === "epic" ? 3 : 2;
  const pool = [...traitPool];
  const traits = [];
  for (let index = 0; index < count; index += 1) {
    const trait = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    const scaled = {};
    for (const [stat, value] of Object.entries(trait.statMods)) {
      scaled[stat] = Math.round(value * rarity.mult);
    }
    traits.push({ ...trait, statMods: scaled });
  }
  return traits;
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
    showToast(`Training success: +${gain} ${labelStat(stat)}.`);
  } else {
    addBattleLog(`${character.name} failed ${mode.label} ${option.label}. TP lost.`);
    showToast("Training failed. TP lost.");
  }
  saveState();
  render();
}

function labelStat(stat) {
  return stat === "health" ? "HP" : stat[0].toUpperCase() + stat.slice(1);
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
  $("#crateResult").innerHTML = `<strong>${item.name}</strong><br>${item.rarity} ${item.category}: ${formatLootPrimary(item)} | ${formatSideStats(item)}`;
  saveState();
  render();
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
  const loadout = randomFrom(loadouts);
  const classInfo = randomFrom(classes);
  const affinity = randomFrom(affinities);
  return normalizeCharacter({
    id: `ai-${Date.now()}-${Math.random()}`,
    name: `${randomFrom(["STATIC", "RIVAL", "GHOST", "NOISE", "NULL"])}-${Math.floor(Math.random() * 900 + 100)}`,
    loadoutId: loadout.id,
    classId: classInfo.id,
    affinityId: affinity.id,
    rarity: rarity.name,
    traits: rollTraits(rarity),
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
      text: `${attacker.name} used ${attack.name} for ${attack.damage} damage${attack.heal ? ` and recovered ${attack.heal} HP` : ""}.`,
      leftHp,
      rightHp,
    });
  }

  const winnerSide = leftHp === rightHp ? (leftStats.harmony >= rightStats.harmony ? "left" : "right") : leftHp > rightHp ? "left" : "right";
  const win = winnerSide === "left";
  const reason = `${win ? left.name : right.name} finished with ${fmt(win ? leftHp : rightHp)} HP after ${events.length} turns.`;
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
  return { name: attackNameForAbility(ability, attacker.affinityId), damage, heal };
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
  const advance = () => {
    if (!state.battleScene) return;
    if (state.battleScene.index < state.battleScene.events.length - 1) {
      state.battleScene.index += 1;
      renderArena();
      battleAnimationTimer = window.setTimeout(advance, 760);
      return;
    }
    state.battleScene.running = false;
    renderArena();
  };
  battleAnimationTimer = window.setTimeout(advance, 760);
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
    ["Balance", money(state.shards)],
    ["Total earned", money(state.totalEarned)],
    ["Energy", stats.maxEnergy ? `${fmt(state.energy)} / ${fmt(stats.maxEnergy)}` : "No Character"],
    ["Regen", `${fmt(stats.regen, 2)}/h`],
    ["Extract", `${fmt(stats.steal, 2)}x`],
  ]
    .map(([label, value]) => `<div class="stat-pill"><span>${label}</span><strong>${value}</strong></div>`)
    .join("");
  $("#energyBar").style.width = `${energyPct}%`;
  $("#energyLabel").textContent = stats.maxEnergy ? `Energy: ${fmt(state.energy)} / ${fmt(stats.maxEnergy)}` : "Energy: no active Character";
  $("#rewardLabel").textContent = character ? `${fmt(stats.reward, 2)} per press` : "Hatch an Egg first";
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
}

function renderActiveCharacter() {
  const character = getActiveCharacter();
  if (!character) {
    $("#activeCharacterPanel").innerHTML = `
      <div class="empty-state">
        <strong>No active Character</strong>
        <p>Hatch your starter Egg in Characters, then select a living Character for clicking.</p>
      </div>
    `;
    $("#buildSummary").innerHTML = "";
    return;
  }
  $("#activeCharacterPanel").innerHTML = renderCharacterMini(character);
  const loadout = getLoadout(character.loadoutId);
  const classInfo = getClass(character.classId);
  const affinity = getAffinity(character.affinityId);
  const stats = getCharacterStats(character);
  const loot = getEquippedLoot(character);
  $("#buildSummary").innerHTML = [
    ["Loadout", `${loadout.name}: ${loadout.description}`],
    ["Class", `${classInfo.name}: ${classInfo.description}`],
    ["Race", `${affinity.name}: ${affinity.description}`],
    ["Loot", loot ? `${loot.name}: ${formatLootPrimary(loot)} | ${formatSideStats(loot)} | ${loot.durability}/${loot.maxDurability}` : "No loot equipped"],
    ["Battle stats", `HP ${fmt(stats.health)} | V ${fmt(stats.violence)} | P ${fmt(stats.power)} | H ${fmt(stats.harmony)}`],
    ["Bay", `${fmt(getFarmCps(), 3)} shards/sec`],
  ]
    .map(([label, value]) => `<div class="summary-row"><span>${label}</span><strong>${value}</strong></div>`)
    .join("");
}

function renderSystems() {
  const character = getActiveCharacter();
  const stats = getStats();
  const loot = getEquippedLoot(character);
  const systems = [
    ["Characters", "Eggs hatch random Characters into your roster.", `${state.characters.length} owned`],
    ["Active clicker", "One living Character powers the visor button.", character ? character.name : "None"],
    ["Energy", "Energy comes from loadout, class, HP, Harmony, Power, loot, and upgrades.", `${fmt(stats.regen, 2)}/h`],
    ["Training", "Duels grant TP. Training increases HP, Violence, Power, or Harmony.", `${state.totalTraining} attempts`],
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
}

function renderTraining() {
  const active = getActiveCharacter();
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

  const stats = getCharacterStats(active);
  $("#trainingCharacterPanel").innerHTML = `
    ${renderCharacterMini(active)}
    <div class="character-stat-grid">
      <span>HP <strong>${fmt(stats.health)}</strong></span>
      <span>V <strong>${fmt(stats.violence)}</strong></span>
      <span>P <strong>${fmt(stats.power)}</strong></span>
      <span>H <strong>${fmt(stats.harmony)}</strong></span>
    </div>
    <div class="trait-list">
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
  $("#trainingPanel").innerHTML = trainingOptions
    .map(
      (option) => `
      <article class="training-card">
        <h3>${option.label}</h3>
        <p>${option.description}</p>
        <p class="training-detail">Light is guaranteed. Moderate and intense are bigger rolls that still cost TP if they miss.</p>
        ${trainingModes
          .map(
            (mode) => `
            <button class="button compact" type="button" data-train-stat="${option.stat}" data-train-mode="${mode.id}" ${
              character.trainingPoints < 1 ? "disabled" : ""
            }>
              ${mode.label}: +${option[mode.gainKey]} (${Math.round(mode.chance * 100)}%)
            </button>
            <small>${mode.description}</small>
          `,
          )
          .join("")}
      </article>
    `,
    )
    .join("");
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
  $$("[data-select-character]").forEach((button) => {
    button.addEventListener("click", () => selectCharacter(button.dataset.selectCharacter));
  });
}

function renderCharacterCard(character) {
  const active = character.id === state.activeCharacterId;
  const rarity = getRarity(character.rarity);
  const loadout = getLoadout(character.loadoutId);
  const stats = getCharacterStats(character);
  const loot = getEquippedLoot(character);
  return `
    <article class="character-card ${active ? "is-active" : ""} ${character.state === "dead" ? "is-dead" : ""}">
      ${renderCharacterMini(character)}
      <div class="character-stat-grid">
        <span>HP <strong>${fmt(stats.health)}</strong></span>
        <span>V <strong>${fmt(stats.violence)}</strong></span>
        <span>P <strong>${fmt(stats.power)}</strong></span>
        <span>H <strong>${fmt(stats.harmony)}</strong></span>
      </div>
      <p>${loadout.description}</p>
      <p class="metric-line">${loadoutMetricLine(loadout)}</p>
      <div class="trait-list">
        ${(character.traits || []).map((trait) => `<span>${trait.slot}: ${trait.name}</span>`).join("")}
      </div>
      <div class="loot-chip ${loot ? "" : "is-empty"}">
        <span>Loot</span>
        <strong>${loot ? loot.name : "None equipped"}</strong>
        <small>${loot ? `${formatLootPrimary(loot)} | ${formatSideStats(loot)} | ${loot.durability}/${loot.maxDurability}` : "Equip one item from the Loot tab."}</small>
      </div>
      <button class="button compact ${active ? "secondary" : "primary"}" type="button" data-select-character="${character.id}" ${
        character.state === "dead" ? "disabled" : ""
      }>
        ${active ? "Active" : "Select"}
      </button>
      <span class="rarity" style="color:${rarity.color}">${character.rarity}</span>
    </article>
  `;
}

function renderCharacterMini(character) {
  const loadout = getLoadout(character.loadoutId);
  const classInfo = getClass(character.classId);
  const affinity = getAffinity(character.affinityId);
  return `
    <div class="character-mini">
      <div class="character-sprite ${character.marked ? "is-marked" : ""}" style="--affinity:${affinity.color}">
        <img src="${escapeHtml(getRaceSprite(character.affinityId))}" alt="" loading="lazy" />
      </div>
      <div>
        <h3>${character.name}</h3>
        <p>${loadout.name} | ${classInfo.name} | <span style="color:${affinity.color}">${affinity.name}</span></p>
        <p>${character.state.toUpperCase()} | Fights ${character.fightCount}/11 | TP ${character.trainingPoints} | ${character.duelWins}-${character.duelLosses}</p>
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
          <h2>Loadouts, races, and classes</h2>
        </div>
        <button class="button compact" type="button" data-close-modal>Close</button>
      </div>
      <p class="body-copy">
        This mirrors the picker-style reference while preserving our Egg loop. Eggs roll these parts into Characters;
        your roster selection decides which full combination powers the button.
      </p>
      <h3>Loadouts</h3>
      <div class="guide-grid">${loadouts.map((item) => renderLoadoutGuideCard(item, active)).join("")}</div>
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

function renderLoadoutGuideCard(loadout, active) {
  const selected = active?.loadoutId === loadout.id;
  return `
    <article class="guide-card ${selected ? "selected" : ""}">
      <div class="guide-icon visor-icon" aria-hidden="true"><span></span></div>
      <strong>${loadout.name}</strong>
      <small>${loadout.access} / ${loadoutBestUse(loadout)}</small>
      <small>${loadoutMetricLine(loadout)}</small>
      <p>${loadout.description}</p>
      <button class="button compact ${selected ? "secondary" : "primary"}" type="button" disabled>${selected ? "Active roll" : "Egg roll"}</button>
    </article>
  `;
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
      <small>${raceMatchupLine(race.id)}</small>
      <p>${race.description}</p>
      <button class="button compact ${selected ? "secondary" : "primary"}" type="button" disabled>${selected ? "Active race" : "Egg roll"}</button>
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
      <small>${classStatLine(classInfo)}</small>
      <p>${classInfo.description}</p>
      <button class="button compact ${selected ? "secondary" : "primary"}" type="button" disabled>${selected ? "Active class" : "Egg roll"}</button>
    </article>
  `;
}

function loadoutBestUse(loadout) {
  const uses = {
    "rookie-visor": "starter rhythm",
    "neon-courier": "balanced all-day play",
    "cargo-bruiser": "long sessions",
    "arcade-racketeer": "burst extraction",
    "glitch-runner": "multiple check-ins",
    "patch-prophet": "quest efficiency",
    "wrong-warp-pilot": "aggressive runs",
  };
  return uses[loadout.id] || "flexible play";
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

function classStatLine(classInfo) {
  const stats = Object.entries(classInfo.statMods || {})
    .filter(([, value]) => value)
    .map(([stat, value]) => `+${value} ${labelStat(stat)}`);
  return stats.length ? stats.join(" / ") : "No flat stat bonus";
}

function getCharacterLine(character) {
  return `${getLoadout(character.loadoutId).name} | ${getClass(character.classId).name} | ${getAffinity(character.affinityId).name} | ${character.rarity}`;
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
    : "Idle";
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
  return `
    <div class="battle-stage ${activeClass}">
      ${renderBattleFighter(scene.left, leftHp, "left")}
      <div class="battle-vs">
        <span>${scene.label}</span>
        <strong>VS</strong>
      </div>
      ${renderBattleFighter(scene.right, rightHp, "right")}
    </div>
    <div class="battle-action-text">${escapeHtml(event.text)}</div>
  `;
}

function renderBattleFighter(actor, hp, side) {
  const hpPct = actor.hpMax ? Math.max(0, Math.min(100, (hp / actor.hpMax) * 100)) : 0;
  return `
    <div class="battle-fighter ${side}">
      <div class="battle-sprite-card" style="--affinity:${actor.affinityColor}">
        <img class="battle-sprite-img" src="${escapeHtml(actor.spriteSrc || raceSprites.normal)}" alt="" loading="lazy" />
      </div>
      <div>
        <h4>${actor.name}</h4>
        <p>${actor.affinityName} ${actor.className}</p>
      </div>
      <div class="hp-track"><span style="width:${hpPct}%"></span></div>
      <small>${fmt(hp)} / ${fmt(actor.hpMax)} HP</small>
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
      ${chapter.kind === "loadouts" ? renderLoadoutDocs() : ""}
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

function renderLoadoutDocs() {
  return `
    <div class="breed-grid">
      ${loadouts
        .map(
          (loadout) => `
          <div class="breed-item">
            <span>${loadout.access}</span>
            <strong>${loadout.name}</strong>
            <p>${loadout.description}</p>
            <p>${loadoutMetricLine(loadout)}</p>
          </div>
        `,
        )
        .join("")}
    </div>
  `;
}

function renderClassDocs() {
  return `
    <div class="class-grid">
      ${classes
        .map(
          (item) => `
          <div class="class-item">
            <span>${item.bonus}</span>
            <strong>${item.name}</strong>
            <p>${item.description}</p>
            <p>${classStatLine(item)}</p>
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
          <div class="class-item">
            <span>${item.name}</span>
            <strong>${item.label}</strong>
            <p>${Object.entries(item.ranges)
              .map(([rarity, range]) => `${rarity}: ${range[0]}-${range[1]}${item.unit}`)
              .join(" | ")}</p>
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
      character: character ? getLoadout(character.loadoutId).name : "No Character",
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
          <span class="rarity" style="color:${item.color}">${item.rarity}</span>
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
      <span class="rarity" style="color:${item.color}">${item.rarity}</span>
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
      <span class="rarity" style="color:${item.color}">${item.rarity}</span>
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

function boot() {
  initNavigation();
  initTheme();
  initControls();
  routeTo(location.hash.slice(1) || "home");
  window.setInterval(render, 5000);
}

boot();
