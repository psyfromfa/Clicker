const BALANCE = window.CYCLOPS_BALANCE;
const STORAGE_KEY = "cyclops-space-pirates-state-v1";
const LEGACY_STORAGE_KEY = "cyclops-button-community-state-v4";
const STAT_IDS = BALANCE.stats.map((stat) => stat.id);

let state;
let currentRoute = "play";
let toastTimer = null;
let battleTimer = null;
let trainingResultTimer = null;
let audioContext = null;
let musicTrack = null;
let musicRetryBound = false;
let soundEnabled = localStorage.getItem("cyclops-button-sound") !== "off";
let musicEnabled = localStorage.getItem("cyclops-button-music") !== "off";
const MUSIC_SRC = "assets/StockTune-Galactic%20Banjo%20Sunset_1781048615.mp3";
const MIN_MUSIC_VOLUME = 0.04;
const DEFAULT_MUSIC_VOLUME = 0.08;
const MAX_MUSIC_VOLUME = 0.45;
const SFX_VOLUME_MULTIPLIER = 1.65;
const SPRITE_ASSET_VERSION = "20260609-reverted";
let musicVolume = DEFAULT_MUSIC_VOLUME;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function uid(prefix = "id") {
  const value = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${value}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function readMusicVolumeSetting() {
  const storedPercent = Number(localStorage.getItem("cyclops-button-music-volume"));
  if (!Number.isFinite(storedPercent)) return DEFAULT_MUSIC_VOLUME;
  if (storedPercent < MIN_MUSIC_VOLUME * 100) return DEFAULT_MUSIC_VOLUME;
  return clamp(storedPercent / 100, MIN_MUSIC_VOLUME, MAX_MUSIC_VOLUME);
}

musicVolume = readMusicVolumeSetting();

function fmt(value, digits = 0) {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function bucks(value) {
  return `${fmt(value, value < 10 ? 2 : 0)} Space Bucks`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function randomFrom(items, random = Math.random) {
  return items[Math.floor(random() * items.length)];
}

function weightedPick(items, random = Math.random) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = random() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items.at(-1);
}

function hashString(value) {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed) {
  let value = hashString(seed);
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function emptyStats() {
  return { health: 0, strength: 0, dexterity: 0, spirit: 0, sorcery: 0 };
}

function getRace(id) {
  return BALANCE.races.find((race) => race.id === id) || BALANCE.races[0];
}

function getClass(id) {
  return BALANCE.classes.find((classInfo) => classInfo.id === id) || BALANCE.classes[0];
}

function getRarity(id) {
  return BALANCE.rarities.find((rarity) => rarity.id === id) || BALANCE.rarities[0];
}

function getItemType(id) {
  return BALANCE.itemTypes.find((type) => type.id === id) || BALANCE.itemTypes[0];
}

function getItemRarity(id) {
  return BALANCE.itemRarities.find((rarity) => rarity.id === id) || BALANCE.itemRarities[0];
}

function getRecruitSprite(character, variant = "field") {
  if (!character) return "assets/cyclops-idle.png";
  const race = getRace(character.raceId);
  const classInfo = getClass(character.classId);
  const allowedVariant = ["field", "player", "opponent"].includes(variant) ? variant : "field";
  return `assets/recruit-sprites/${classInfo.id}/${race.id}-${allowedVariant}.png?v=${SPRITE_ASSET_VERSION}`;
}

function getBayLevel(level = state?.bayLevel || 0) {
  const exact = BALANCE.bayLevels.find((entry) => entry.level === level);
  if (exact) return exact;
  return level > BALANCE.bayLevels.at(-1).level ? BALANCE.bayLevels.at(-1) : BALANCE.bayLevels[0];
}

function createDefaultState() {
  return {
    version: BALANCE.version,
    bucks: 0,
    totalBucks: 0,
    totalClicks: 0,
    tutorialStage: 0,
    tutorialEnergy: BALANCE.tutorial.reserveEnergy,
    firstVoyagePaid: false,
    bayLevel: 0,
    charactersMinted: 0,
    characters: [],
    activeCharacterId: null,
    inventory: [],
    salvage: 0,
    standardCratesOpened: 0,
    salvageCratesOpened: 0,
    starterCrateOpened: false,
    marketListings: [],
    playerListings: [],
    marketSales: 0,
    ethBalance: 0.08,
    marks: [],
    legends: [],
    fallen: [],
    totalBattles: 0,
    totalTraining: 0,
    battleHistory: [],
    trainingHistory: [],
    questClaims: [],
    battleLog: ["The cargo deck is quiet. Something valuable is locked inside that crate."],
    battleScene: null,
    lastTick: Date.now(),
  };
}

function normalizeStats(stats = {}) {
  return {
    health: Number(stats.health || 0),
    strength: Number(stats.strength || 0),
    dexterity: Number(stats.dexterity || 0),
    spirit: Number(stats.spirit || 0),
    sorcery: Number(stats.sorcery || 0),
  };
}

function normalizeCharacter(character, index = 0) {
  const rarity = getRarity(character.rarity);
  return {
    id: character.id || uid("crew"),
    name: character.name || `${rarity.name.toUpperCase()}-${String(index + 1).padStart(3, "0")}`,
    raceId: getRace(character.raceId).id,
    classId: getClass(character.classId).id,
    rarity: rarity.id,
    rarityStats: normalizeStats(character.rarityStats),
    trainedStats: normalizeStats(character.trainedStats),
    energy: Math.max(0, Number(character.energy || 0)),
    baySlot: Number.isInteger(character.baySlot) ? character.baySlot : null,
    trainingPoints: Math.max(0, Number(character.trainingPoints || 0)),
    careerFights: Math.max(0, Number(character.careerFights || 0)),
    wins: Math.max(0, Number(character.wins || 0)),
    losses: Math.max(0, Number(character.losses || 0)),
    state: ["active", "retired", "fallen"].includes(character.state) ? character.state : "active",
    equippedItemId: character.equippedItemId || null,
    pressWear: Math.max(0, Number(character.pressWear || 0)),
    createdAt: character.createdAt || Date.now(),
  };
}

function normalizeItem(item) {
  const rarity = getItemRarity(item.rarity);
  const type = getItemType(item.typeId);
  return {
    id: item.id || uid("item"),
    name: item.name || `${rarity.name} ${type.name}`,
    typeId: type.id,
    rarity: rarity.id,
    image: item.image || type.variants[0][1],
    primaryStat: item.primaryStat || type.stat,
    primaryValue: Math.max(0, Number(item.primaryValue || 1)),
    sideStats: normalizeStats(item.sideStats),
    durability: clamp(Number(item.durability ?? rarity.durability), 0, Number(item.maxDurability || rarity.durability)),
    maxDurability: Number(item.maxDurability || rarity.durability),
    salvageValueOverride: item.salvageValueOverride || null,
    tutorialBroken: Boolean(item.tutorialBroken),
    createdAt: item.createdAt || Date.now(),
  };
}

function normalizeListing(listing) {
  return {
    id: listing.id || uid("listing"),
    seller: listing.seller || "cargo.exchange",
    currency: listing.currency === "eth" ? "eth" : "bucks",
    price: Math.max(0, Number(listing.price || 0)),
    item: normalizeItem(listing.item),
  };
}

function normalizeState(saved) {
  const next = {
    ...createDefaultState(),
    ...saved,
    characters: (saved.characters || []).map(normalizeCharacter),
    inventory: (saved.inventory || []).map(normalizeItem),
    marketListings: (saved.marketListings || []).map(normalizeListing),
    playerListings: (saved.playerListings || []).map(normalizeListing),
    battleHistory: Array.isArray(saved.battleHistory) ? saved.battleHistory : [],
    trainingHistory: Array.isArray(saved.trainingHistory) ? saved.trainingHistory : [],
    battleScene: null,
    marks: saved.marks || [],
    legends: saved.legends || [],
    fallen: saved.fallen || [],
    questClaims: saved.questClaims || [],
  };

  next.characters.forEach((character) => {
    const itemExists = next.inventory.some((item) => item.id === character.equippedItemId);
    if (!itemExists) character.equippedItemId = null;
    character.energy = Math.min(character.energy, getMaxEnergy(character, next.inventory));
  });

  const level = getBayLevel(next.bayLevel);
  const usedSlots = new Set();
  next.characters.forEach((character) => {
    if (character.state !== "active" || character.baySlot === null || character.baySlot >= level.slots || usedSlots.has(character.baySlot)) {
      character.baySlot = null;
      return;
    }
    usedSlots.add(character.baySlot);
  });

  if (!next.characters.some((character) => character.id === next.activeCharacterId && character.state === "active" && character.baySlot !== null)) {
    next.activeCharacterId = next.characters.find((character) => character.state === "active" && character.baySlot !== null)?.id || null;
  }

  if (next.tutorialStage === 9 && !next.firstVoyagePaid) {
    const requiredBucks = next.bayLevel < 2 ? getBayLevel(2).cost + BALANCE.economy.baseHireCost : BALANCE.economy.baseHireCost;
    const bonus = Math.max(BALANCE.tutorial.firstVoyageBonus, requiredBucks - next.bucks);
    next.bucks += bonus;
    next.totalBucks += bonus;
    next.firstVoyagePaid = true;
  }

  if (!next.marketListings.length) next.marketListings = createMarketListings(8);
  return next;
}

function migrateLegacy(legacy) {
  if (!legacy.characters?.length) return normalizeState(createDefaultState());
  const next = createDefaultState();
  next.bucks = Number(legacy.shards || 0);
  next.totalBucks = Number(legacy.totalEarned || legacy.shards || 0);
  next.totalClicks = Number(legacy.totalClicks || 0);
  next.tutorialStage = 9;
  next.tutorialEnergy = 0;
  next.bayLevel = clamp(Math.max(1, Number(legacy.farmLevel || 1)), 1, 5);
  next.charactersMinted = Number(legacy.charactersMinted || legacy.characters?.length || 0);
  next.salvage = 0;
  next.standardCratesOpened = Number(legacy.lootCratesOpened || 0);
  next.ethBalance = Number(legacy.ethBalance || 0.08);
  next.totalBattles = Number(legacy.totalDuels || 0);
  next.totalTraining = Number(legacy.totalTraining || 0);

  const raceMap = { normal: "beast", elemental: "magic", wood: "wood", stone: "stone", metal: "metal" };
  next.characters = (legacy.characters || []).map((character, index) => {
    const oldState = character.state === "dead" ? "fallen" : character.marked || character.state === "marked" ? "retired" : "active";
    return normalizeCharacter({
      id: character.id,
      name: character.name,
      raceId: raceMap[character.affinityId] || "beast",
      classId: character.classId,
      rarity: character.rarity,
      trainedStats: {
        health: character.trainedStats?.health || 0,
        strength: character.trainedStats?.violence || 0,
        dexterity: 0,
        spirit: character.trainedStats?.harmony || 0,
        sorcery: character.trainedStats?.power || 0,
      },
      trainingPoints: character.trainingPoints || 0,
      careerFights: Math.min(10, character.fightCount || 0),
      wins: character.duelWins || 0,
      losses: character.duelLosses || 0,
      state: oldState,
      equippedItemId: character.equippedLootId,
      createdAt: character.mintedAt,
    }, index);
  });

  const typeMap = { lens: "weapon", boots: "charm", core: "armor", charm: "scanner", relic: "focus" };
  next.inventory = (legacy.inventory || []).map((item) => {
    const type = getItemType(typeMap[item.categoryId] || "weapon");
    const sideStats = {
      health: item.sideStats?.health || 0,
      strength: item.sideStats?.violence || 0,
      dexterity: 0,
      spirit: item.sideStats?.harmony || 0,
      sorcery: item.sideStats?.power || 0,
    };
    return normalizeItem({
      id: item.id,
      name: item.name,
      typeId: type.id,
      rarity: item.rarity,
      image: item.image,
      primaryStat: type.stat,
      primaryValue: Math.max(1, Math.round(Number(item.primaryValue || 1))),
      sideStats,
      durability: item.durability,
      maxDurability: item.maxDurability,
      createdAt: item.mintedAt,
    });
  });

  const slots = getBayLevel(next.bayLevel).slots;
  let slot = 0;
  next.characters.forEach((character) => {
    if (character.state === "retired") next.legends.push(character.id);
    if (character.state === "fallen") next.fallen.push(character.id);
    if (character.state === "active" && slot < slots) {
      character.baySlot = slot;
      character.energy = slot === 0 ? Math.min(Number(legacy.energy || 0), getMaxEnergy(character, next.inventory)) : Math.ceil(getMaxEnergy(character, next.inventory) * 0.25);
      slot += 1;
    }
  });
  next.activeCharacterId = next.characters.find((character) => character.state === "active" && character.baySlot !== null)?.id || null;
  next.marks = legacy.marks || [];
  next.marketListings = createMarketListings(8);
  next.battleLog = ["Legacy run converted to the Space Pirates ruleset."];
  return normalizeState(next);
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved) return normalizeState(saved);
    const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY));
    if (legacy) return migrateLegacy(legacy);
  } catch {
    return normalizeState(createDefaultState());
  }
  return normalizeState(createDefaultState());
}

function saveState() {
  tick();
  const snapshot = { ...state, battleScene: null };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

function getActiveCharacter() {
  return state.characters.find((character) => character.id === state.activeCharacterId) || null;
}

function getEquippedItem(character) {
  if (!character?.equippedItemId) return null;
  return state.inventory.find((item) => item.id === character.equippedItemId) || null;
}

function getCharacterStats(character, inventory = state.inventory) {
  if (!character) return { health: 0, strength: 0, dexterity: 0, spirit: 0, sorcery: 0 };
  const stats = { health: 10, strength: 10, dexterity: 10, spirit: 10, sorcery: 10 };
  const race = getRace(character.raceId);
  const classInfo = getClass(character.classId);
  const item = inventory.find((entry) => entry.id === character.equippedItemId);
  const sources = [race.bonuses, classInfo.bonuses, character.rarityStats, character.trainedStats];
  sources.forEach((source) => {
    STAT_IDS.forEach((stat) => {
      stats[stat] += Number(source?.[stat] || 0);
    });
  });
  if (item && item.durability > 0) {
    stats[item.primaryStat] += item.primaryValue;
    STAT_IDS.forEach((stat) => {
      stats[stat] += Number(item.sideStats?.[stat] || 0);
    });
  }
  return stats;
}

function getMaxEnergy(character, inventory = state?.inventory || []) {
  return 15 + getCharacterStats(character, inventory).health;
}

function getCrateMetrics(character) {
  const stats = getCharacterStats(character);
  return {
    stats,
    reward: 1 + Math.max(0, stats.strength - 10) * 0.02 + Math.max(0, stats.sorcery - 10) * 0.02,
    criticalChance: clamp(0.05 + Math.max(0, stats.dexterity - 10) * 0.005, 0.05, 0.25),
    preserveChance: clamp(0.02 + Math.max(0, stats.spirit - 10) * 0.005, 0.02, 0.15),
  };
}

function getShipEnergy() {
  if (state.tutorialStage < 2 && !state.characters.length) {
    return { current: state.tutorialEnergy, max: BALANCE.tutorial.reserveEnergy, recovery: 0, crew: 0 };
  }
  const stationed = state.characters.filter((character) => character.state === "active" && character.baySlot !== null);
  return stationed.reduce(
    (result, character) => {
      result.current += character.energy;
      result.max += getMaxEnergy(character);
      result.crew += 1;
      return result;
    },
    { current: 0, max: 0, recovery: stationed.length * getBayLevel().recoveryPerHour, crew: 0 },
  );
}

function recoveryRateText(ratePerHour, unit = "recruit") {
  if (!ratePerHour) return unit ? `0.0 Energy/sec/${unit}` : "0.0 / sec";
  const ratePerSecond = ratePerHour / 3600;
  const value = fmt(ratePerSecond, ratePerSecond % 1 ? 1 : 0);
  return unit ? `${value} Energy/sec/${unit}` : `${value} / sec`;
}

function tick() {
  const now = Date.now();
  const elapsedHours = clamp((now - Number(state.lastTick || now)) / 3600000, 0, 168);
  const rate = getBayLevel().recoveryPerHour;
  if (elapsedHours > 0 && rate > 0) {
    state.characters.forEach((character) => {
      if (character.state !== "active" || character.baySlot === null) return;
      character.energy = Math.min(getMaxEnergy(character), character.energy + elapsedHours * rate);
    });
  }
  state.lastTick = now;
}

function getHireCost() {
  const activeCount = state.characters.filter((character) => character.state === "active").length;
  if (!state.characters.length && state.tutorialStage <= 2) return BALANCE.tutorial.firstRecruitCost;
  return BALANCE.economy.baseHireCost + Math.max(0, activeCount - 1) * BALANCE.economy.hireCostStep;
}

function createRarityStats(rarity, random = Math.random) {
  const result = emptyStats();
  for (let index = 0; index < rarity.bonusPoints; index += 1) {
    result[randomFrom(STAT_IDS, random)] += 1;
  }
  return result;
}

function createCharacter(options = {}) {
  const random = options.random || Math.random;
  const rarity = options.rarity ? getRarity(options.rarity) : weightedPick(BALANCE.rarities, random);
  const race = options.raceId ? getRace(options.raceId) : randomFrom(BALANCE.races, random);
  const classInfo = options.classId ? getClass(options.classId) : randomFrom(BALANCE.classes, random);
  if (options.register !== false) state.charactersMinted += 1;
  const serial = options.register === false ? Math.floor(random() * 900 + 100) : state.charactersMinted;
  const character = normalizeCharacter({
    id: uid("crew"),
    name: `${rarity.name.toUpperCase()}-${String(serial).padStart(3, "0")}`,
    raceId: race.id,
    classId: classInfo.id,
    rarity: rarity.id,
    rarityStats: createRarityStats(rarity, random),
    energy: 0,
    createdAt: Date.now(),
  }, Math.max(0, serial - 1));
  character.energy = options.fullEnergy ? getMaxEnergy(character) : Math.ceil(getMaxEnergy(character) * 0.25);
  return character;
}

function createItem(options = {}) {
  const random = options.random || Math.random;
  const type = options.typeId ? getItemType(options.typeId) : randomFrom(BALANCE.itemTypes, random);
  const rarity = options.rarity ? getItemRarity(options.rarity) : weightedPick(BALANCE.itemRarities, random);
  const variant = randomFrom(type.variants, random);
  const primaryValue = options.primaryValue || Math.floor(rarity.primary[0] + random() * (rarity.primary[1] - rarity.primary[0] + 1));
  const sideStats = emptyStats();
  for (let index = 0; index < rarity.sideRolls; index += 1) {
    const available = STAT_IDS.filter((stat) => stat !== type.stat);
    sideStats[randomFrom(available, random)] += 1;
  }
  return normalizeItem({
    id: uid("item"),
    name: options.name || `${rarity.name} ${variant[0]}`,
    typeId: type.id,
    rarity: rarity.id,
    image: options.image || variant[1],
    primaryStat: type.stat,
    primaryValue,
    sideStats: options.sideStats || sideStats,
    durability: options.durability ?? rarity.durability,
    maxDurability: options.maxDurability || rarity.durability,
    salvageValueOverride: options.salvageValueOverride,
    tutorialBroken: options.tutorialBroken,
  });
}

function createMarketListings(count) {
  return Array.from({ length: count }, (_, index) => {
    const item = createItem();
    const rarity = getItemRarity(item.rarity);
    const currency = index % 4 === 0 ? "eth" : "bucks";
    const price = currency === "eth" ? Number((rarity.marketBase / BALANCE.economy.bucksPerEth).toFixed(4)) : rarity.marketBase;
    return normalizeListing({
      seller: randomFrom(["void.runner", "0xCARGO", "redvisor.eth", "bay-seven", "starboard.market"]),
      currency,
      price,
      item,
    });
  });
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function addBattleLog(message) {
  state.battleLog.unshift(message);
  state.battleLog = state.battleLog.slice(0, 40);
}

function recordBattleHistory({ label, kind, left, right, result, rewards = {}, gearWear = 0 }) {
  state.battleHistory.unshift({
    id: uid("fight"),
    label,
    kind,
    createdAt: Date.now(),
    outcome: result.win ? "win" : "loss",
    left: {
      name: left.name,
      race: getRace(left.raceId).name,
      className: getClass(left.classId).name,
      maxHp: result.leftMaxHp,
    },
    right: {
      name: right.name,
      race: getRace(right.raceId).name,
      className: getClass(right.classId).name,
      maxHp: result.rightMaxHp,
    },
    rewards: {
      bucks: Number(rewards.bucks || 0),
      salvage: Number(rewards.salvage || 0),
      trainingPoints: Number(rewards.trainingPoints || 0),
      gearWear: Number(gearWear || 0),
    },
    events: result.events.map((event, index) => ({
      turn: event.final ? null : index + 1,
      side: event.side,
      action: event.action || (event.final ? "result" : "ready"),
      damage: Number(event.damage || 0),
      healing: Number(event.healing || 0),
      critical: Boolean(event.critical),
      advantage: Boolean(event.advantage),
      leftHp: Number(event.leftHp),
      rightHp: Number(event.rightHp),
      text: event.text,
      final: Boolean(event.final),
    })),
  });
  state.battleHistory = state.battleHistory.slice(0, 50);
}

function showTrainingResult({ success, characterName, statName, modeName, gain }) {
  const root = $("#trainingResult");
  if (!root) return;
  root.className = `training-result-popup ${success ? "is-success" : "is-failure"}`;
  root.innerHTML = `
    <small>${escapeHtml(modeName)} training</small>
    <strong>${success ? `+${gain} ${escapeHtml(statName)}` : "Training failed"}</strong>
    <span>${escapeHtml(characterName)} ${success ? "improved permanently." : "spent 1 TP with no stat gain."}</span>`;
  clearTimeout(trainingResultTimer);
  trainingResultTimer = setTimeout(() => {
    root.className = "training-result-popup hidden";
  }, 3200);
}

function tutorialMessage() {
  if (isTutorialBattleLocked()) {
    return ["Battle in progress.", "Watch the first battle finish before opening Training."];
  }
  const messages = [
    ["The ship is dark, all you can see is a faint glow from a nearby crate.", "Spend your energy to loot the crate."],
    ["Crew terminal unlocked.", "Open Crew and hire your first recruit for 10 Space Bucks."],
    ["A recruit cannot work from the hallway.", "Assign your new recruit to the Crew Bay."],
    ["Your recruit is ready.", "Open cargo until you have 20 Space Bucks for the Starter Crate."],
    ["The Shop terminal just came online.", "Buy the one-time Starter Crate for 20 Space Bucks."],
    ["Every recruit can equip one item.", "Equip the new item from the Gear screen."],
    ["Broken equipment still has value.", "Dismantle the damaged tutorial item to recover Salvage."],
    ["The Arena terminal is receiving challengers.", "Complete one battle to earn a Training Point."],
    ["Training converts battle experience into permanent stats.", "Spend 1 TP using Light, Moderate, or Intense training."],
    ["Crew Bay upgrade available.", "Open Shop and upgrade the Crew Bay to Level 2."],
    ["There is room for another bunk.", "Open Crew and hire your second recruit."],
    ["Build the crew, not a waiting room.", "Assign the new recruit to the empty Bay slot."],
  ];
  return messages[state.tutorialStage] || null;
}

function setTutorialStage(stage, message) {
  state.tutorialStage = Math.max(state.tutorialStage, stage);
  if (message) showToast(message);
  saveState();
  renderAll();
}

function pressCargo() {
  tick();
  if (state.tutorialStage < BALANCE.tutorial.completedStage && ![0, 3].includes(state.tutorialStage)) {
    showTutorialBlockedMessage();
    return;
  }
  if (state.tutorialStage === 0 && !state.characters.length) {
    if (state.tutorialEnergy < 1) return;
    state.tutorialEnergy -= 1;
    state.bucks += 1;
    state.totalBucks += 1;
    state.totalClicks += 1;
    const finalPress = state.tutorialEnergy < 1;
    if (finalPress) {
      state.tutorialStage = 1;
      addBattleLog("The reserve is empty. The Crew terminal is ready for hiring.");
    }
    saveState();
    renderAll();
    animatePress(1, false, false);
    playSfx(finalPress ? "unlock" : "press");
    if (finalPress) showToast("Crew hiring unlocked.");
    return;
  }

  const character = getActiveCharacter();
  if (!character || character.state !== "active" || character.baySlot === null) {
    showToast("Assign a recruit to the Bay and make them active.");
    return;
  }
  if (character.energy < 1) {
    const replacement = state.characters.find(
      (entry) => entry.state === "active" && entry.baySlot !== null && entry.energy >= 1 && entry.id !== character.id,
    );
    showToast(replacement ? `${character.name} is tired. Switch to another Bay recruit.` : "The stationed crew is tired. Energy recovers over time.");
    return;
  }

  const metrics = getCrateMetrics(character);
  const preserved = Math.random() < metrics.preserveChance;
  const critical = Math.random() < metrics.criticalChance;
  if (!preserved) character.energy -= 1;
  let gain = metrics.reward * (critical ? 2 : 1);
  let salvageFound = false;
  if (critical && Math.random() < 0.5) {
    state.salvage += 1;
    salvageFound = true;
  }

  state.bucks += gain;
  state.totalBucks += gain;
  state.totalClicks += 1;
  character.pressWear += 1;
  if (character.pressWear >= 10) {
    character.pressWear -= 10;
    damageItem(getEquippedItem(character), 1);
  }

  if (state.tutorialStage === 3 && state.bucks >= BALANCE.tutorial.starterCrateCost) {
    state.tutorialStage = 4;
    showToast("Starter Crate unlocked in the Shop.");
  }

  saveState();
  renderAll();
  animatePress(gain, critical, preserved);
  playSfx(critical ? "lucky" : "press");
}

function hireRecruit() {
  const cost = getHireCost();
  if (state.bucks < cost) {
    showToast(`Need ${bucks(cost)}.`);
    return;
  }
  state.bucks -= cost;
  const character = createCharacter({ fullEnergy: true });
  state.characters.unshift(character);
  if (state.tutorialStage === 1) state.tutorialStage = 2;
  else if (state.tutorialStage === 10) state.tutorialStage = 11;
  addBattleLog(`${character.name}, a ${getRace(character.raceId).name} ${getClass(character.classId).name}, joined the crew.`);
  saveState();
  renderAll();
  playSfx("purchase");
  showToast(`${character.name} hired. Assign them to the Bay.`);
}

function assignToBay(characterId) {
  const character = state.characters.find((entry) => entry.id === characterId);
  if (!character || character.state !== "active") return;
  if (character.baySlot !== null) {
    state.activeCharacterId = character.id;
    saveState();
    renderAll();
    showToast(`${character.name} is now active.`);
    return;
  }

  const onboardingAssignment = state.tutorialStage === 2;
  const secondRecruitAssignment = state.tutorialStage === 11;
  if (state.bayLevel === 0 && onboardingAssignment) state.bayLevel = 1;
  const level = getBayLevel();
  const occupied = new Set(state.characters.filter((entry) => entry.baySlot !== null).map((entry) => entry.baySlot));
  const slot = Array.from({ length: level.slots }, (_, index) => index).find((index) => !occupied.has(index));
  if (slot === undefined) {
    showToast("The Bay is full. Upgrade it or remove another recruit.");
    return;
  }
  character.baySlot = slot;
  state.activeCharacterId = character.id;
  if (onboardingAssignment) state.tutorialStage = 3;
  else if (secondRecruitAssignment) state.tutorialStage = BALANCE.tutorial.completedStage;
  saveState();
  if (onboardingAssignment || secondRecruitAssignment) routeTo("play");
  else renderAll();
  playSfx("confirm");
  showToast(
    secondRecruitAssignment
      ? `${character.name} assigned. The opening voyage is complete.`
      : `${character.name} assigned to Bay Slot ${slot + 1}.`,
  );
}

function removeFromBay(characterId) {
  const character = state.characters.find((entry) => entry.id === characterId);
  if (!character || character.baySlot === null) return;
  character.baySlot = null;
  if (state.activeCharacterId === character.id) {
    state.activeCharacterId = state.characters.find((entry) => entry.state === "active" && entry.baySlot !== null)?.id || null;
  }
  saveState();
  renderAll();
  showToast(`${character.name} moved to reserve crew.`);
}

function selectCharacter(characterId) {
  const character = state.characters.find((entry) => entry.id === characterId);
  if (!character || character.state !== "active") return;
  if (character.baySlot === null) {
    showToast("Only recruits assigned to the Bay can work the cargo deck.");
    return;
  }
  state.activeCharacterId = character.id;
  saveState();
  renderAll();
  playSfx("confirm");
}

function upgradeBay() {
  if (state.bayLevel < 1) {
    showToast("Hire and assign the first recruit to activate the Bay.");
    return;
  }
  const next = getBayLevel(state.bayLevel + 1);
  if (!next || next.level === state.bayLevel) {
    showToast("The Bay is at its current maximum level.");
    return;
  }
  if (state.marks.length < next.marks) {
    showToast(`Bay Level ${next.level} requires ${next.marks} Mark${next.marks === 1 ? "" : "s"}.`);
    return;
  }
  if (state.bucks < next.cost) {
    showToast(`Need ${bucks(next.cost)}.`);
    return;
  }
  state.bucks -= next.cost;
  state.bayLevel = next.level;
  const tutorialUpgrade = state.tutorialStage === 9 && next.level === 2;
  if (tutorialUpgrade) state.tutorialStage = 10;
  saveState();
  if (tutorialUpgrade) routeTo("play");
  else renderAll();
  playSfx("purchase");
  showToast(tutorialUpgrade ? "Bay Level 2 unlocked. Hire your second recruit." : `Bay upgraded to Level ${next.level}.`);
}

function openStarterCrate() {
  if (state.starterCrateOpened) {
    showToast("The one-time Starter Crate has already been opened.");
    return;
  }
  if (state.bucks < BALANCE.tutorial.starterCrateCost) {
    showToast(`Need ${bucks(BALANCE.tutorial.starterCrateCost)}.`);
    return;
  }
  state.bucks -= BALANCE.tutorial.starterCrateCost;
  const starter = createItem({ rarity: "common" });
  const broken = createItem({
    rarity: "common",
    typeId: "armor",
    name: "Broken Cargo Plate",
    durability: 0,
    maxDurability: 100,
    salvageValueOverride: 5,
    tutorialBroken: true,
  });
  state.inventory.unshift(starter, broken);
  state.starterCrateOpened = true;
  state.tutorialStage = Math.max(state.tutorialStage, 5);
  saveState();
  routeTo("loot");
  renderAll();
  playSfx("victory");
  showToast(`${starter.name} found. Equip it to continue.`);
}

function openStandardCrate(source = "bucks") {
  if (source === "salvage") {
    if (state.salvage < BALANCE.salvagePerCrate) {
      showToast(`Need ${BALANCE.salvagePerCrate} Salvage.`);
      return;
    }
    state.salvage -= BALANCE.salvagePerCrate;
    state.salvageCratesOpened += 1;
  } else {
    if (state.bucks < BALANCE.economy.standardCrateCost) {
      showToast(`Need ${bucks(BALANCE.economy.standardCrateCost)}.`);
      return;
    }
    state.bucks -= BALANCE.economy.standardCrateCost;
    state.standardCratesOpened += 1;
  }
  const item = createItem();
  state.inventory.unshift(item);
  saveState();
  renderAll();
  playSfx("victory");
  showToast(`${item.name} found.`);
}

function equipItem(itemId) {
  const character = getActiveCharacter();
  const item = state.inventory.find((entry) => entry.id === itemId);
  if (!character || !item) {
    showToast("Select an active Bay recruit first.");
    return;
  }
  state.characters.forEach((entry) => {
    if (entry.equippedItemId === item.id) entry.equippedItemId = null;
  });
  character.equippedItemId = item.id;
  character.energy = Math.min(character.energy, getMaxEnergy(character));
  if (state.tutorialStage === 5 && !item.tutorialBroken) state.tutorialStage = 6;
  saveState();
  renderAll();
  playSfx("confirm");
  showToast(`${item.name} equipped to ${character.name}.`);
}

function unequipItem(itemId) {
  const character = state.characters.find((entry) => entry.equippedItemId === itemId);
  if (!character) return;
  character.equippedItemId = null;
  character.energy = Math.min(character.energy, getMaxEnergy(character));
  saveState();
  renderAll();
  playSfx("confirm");
}

function damageItem(item, amount) {
  if (!item || item.durability <= 0) return;
  item.durability = Math.max(0, item.durability - amount);
}

function repairCost(item) {
  const rarity = getItemRarity(item.rarity);
  const missingRatio = 1 - item.durability / item.maxDurability;
  return Math.ceil(rarity.repairFull * missingRatio);
}

function repairItem(itemId) {
  const item = state.inventory.find((entry) => entry.id === itemId);
  if (!item) return;
  const cost = repairCost(item);
  if (cost <= 0) {
    showToast("That item is already fully repaired.");
    return;
  }
  if (state.bucks < cost) {
    showToast(`Need ${bucks(cost)}.`);
    return;
  }
  state.bucks -= cost;
  item.durability = item.maxDurability;
  saveState();
  renderAll();
  playSfx("purchase");
  showToast(`${item.name} repaired.`);
}

function dismantleValue(item) {
  if (item.salvageValueOverride) return item.salvageValueOverride;
  const rarity = getItemRarity(item.rarity);
  return Math.round(rarity.salvageBase * (1 + item.durability / item.maxDurability));
}

function openDismantleConfirmation(itemId) {
  const item = state.inventory.find((entry) => entry.id === itemId);
  if (!item) return;
  const root = $("#modalRoot");
  root.innerHTML = `
    <div class="modal-card quick-rules">
      <p class="eyebrow">Confirm salvage</p>
      <h2>Dismantle this gear?</h2>
      <p>${escapeHtml(item.name)} will be permanently destroyed for ${dismantleValue(item)} Salvage.</p>
      <div class="panel-actions">
        <button class="button danger" data-action="confirm-dismantle" data-id="${item.id}">Are you sure?</button>
        <button class="button" data-action="close-modal">Cancel</button>
      </div>
    </div>`;
  root.classList.remove("hidden");
  playSfx("panel");
}

function dismantleItem(itemId) {
  const item = state.inventory.find((entry) => entry.id === itemId);
  if (!item) return;
  const value = dismantleValue(item);
  state.characters.forEach((character) => {
    if (character.equippedItemId === item.id) character.equippedItemId = null;
  });
  state.inventory = state.inventory.filter((entry) => entry.id !== item.id);
  state.salvage += value;
  if (item.tutorialBroken && state.tutorialStage === 6) state.tutorialStage = 7;
  closeModal();
  saveState();
  renderAll();
  playSfx("salvage");
  showToast(`${item.name} dismantled for ${value} Salvage.`);
}

function listItem(itemId, currency) {
  const item = state.inventory.find((entry) => entry.id === itemId);
  if (!item) return;
  const equipped = state.characters.some((character) => character.equippedItemId === item.id);
  if (equipped) {
    showToast("Unequip the item before listing it.");
    return;
  }
  const rarity = getItemRarity(item.rarity);
  const price = currency === "eth" ? Number((rarity.marketBase / BALANCE.economy.bucksPerEth).toFixed(4)) : rarity.marketBase;
  state.inventory = state.inventory.filter((entry) => entry.id !== item.id);
  state.playerListings.unshift(normalizeListing({ seller: "you", currency, price, item }));
  saveState();
  renderAll();
  playSfx("purchase");
  showToast(`${item.name} listed.`);
}

function cancelListing(listingId) {
  const listing = state.playerListings.find((entry) => entry.id === listingId);
  if (!listing) return;
  state.playerListings = state.playerListings.filter((entry) => entry.id !== listingId);
  state.inventory.unshift(listing.item);
  saveState();
  renderAll();
  playSfx("confirm");
}

function buyListing(listingId) {
  const listing = state.marketListings.find((entry) => entry.id === listingId);
  if (!listing) return;
  if (listing.currency === "eth") {
    if (state.ethBalance < listing.price) {
      showToast("Not enough simulated ETH.");
      return;
    }
    state.ethBalance -= listing.price;
  } else {
    if (state.bucks < listing.price) {
      showToast(`Need ${bucks(listing.price)}.`);
      return;
    }
    state.bucks -= listing.price;
  }
  state.marketListings = state.marketListings.filter((entry) => entry.id !== listing.id);
  state.inventory.unshift(listing.item);
  saveState();
  renderAll();
  playSfx("purchase");
}

function settleMarket() {
  let sales = 0;
  state.playerListings = state.playerListings.filter((listing) => {
    if (Math.random() >= 0.65) return true;
    const payout = listing.price * (1 - BALANCE.economy.marketFee);
    if (listing.currency === "eth") state.ethBalance += payout;
    else state.bucks += payout;
    sales += 1;
    return false;
  });
  state.marketSales += sales;
  saveState();
  renderAll();
  playSfx(sales ? "purchase" : "failure");
  showToast(sales ? `${sales} listing${sales === 1 ? "" : "s"} sold after the 5% fee.` : "No buyers this market tick.");
}

function combatRating(character) {
  const stats = getCharacterStats(character);
  return Math.round((50 + stats.health * 5) / 5 + stats.strength * 2 + stats.dexterity * 1.5 + stats.spirit * 1.5 + stats.sorcery * 2);
}

function combatCriticalChance(stats) {
  return clamp(0.05 + Math.max(0, stats.dexterity - 10) * 0.005, 0.05, 0.35);
}

function raceMultiplier(attackerRaceId, defenderRaceId) {
  return getRace(attackerRaceId).strongAgainst === defenderRaceId ? BALANCE.combat.raceAdvantage : 1;
}

function baseStrikeDamage(attackerStats, defenderStats) {
  return Math.max(1, 8 + attackerStats.strength * 1.2 - defenderStats.health * 0.3);
}

function baseCastDamage(attackerStats, defenderStats) {
  return Math.max(1, 8 + attackerStats.sorcery * 1.2 - defenderStats.spirit * 0.3);
}

function createOpponent(character, scale = 1, seed = Date.now()) {
  const random = seededRandom(`${character.id}-${seed}-${scale}`);
  const opponent = createCharacter({
    random,
    rarity: character.rarity,
    fullEnergy: false,
    register: false,
  });
  opponent.id = `ai-${uid("rival")}`;
  opponent.name = `${randomFrom(["VOID", "NOVA", "RIVAL", "GHOST", "RAIDER"], random)}-${Math.floor(random() * 900 + 100)}`;
  opponent.baySlot = null;
  opponent.energy = 0;

  const targetRating = combatRating(character) * scale;
  let guard = 0;
  while (combatRating(opponent) < targetRating && guard < 80) {
    opponent.trainedStats[randomFrom(STAT_IDS, random)] += 1;
    guard += 1;
  }
  return opponent;
}

function chooseAttack(attackerStats, defenderStats) {
  return baseStrikeDamage(attackerStats, defenderStats) >= baseCastDamage(attackerStats, defenderStats) ? "strike" : "cast";
}

function resolveBattle(left, right, options = {}) {
  const random = seededRandom(options.seed || `${left.id}-${right.id}-${Date.now()}`);
  const leftStats = getCharacterStats(left);
  const rightStats = getCharacterStats(right);
  const leftMaxHp = 50 + leftStats.health * 5;
  const rightMaxHp = 50 + rightStats.health * 5;
  let leftHp = clamp(options.leftStartHp ?? leftMaxHp, 1, leftMaxHp);
  let rightHp = clamp(options.rightStartHp ?? rightMaxHp, 1, rightMaxHp);
  let leftHealed = false;
  let rightHealed = false;
  const events = [];
  const leftStarts =
    leftStats.dexterity === rightStats.dexterity ? random() >= 0.5 : leftStats.dexterity > rightStats.dexterity;
  const order = leftStarts ? ["left", "right"] : ["right", "left"];

  for (let turn = 0; turn < BALANCE.combat.maxTurns && leftHp > 0 && rightHp > 0; turn += 1) {
    const side = order[turn % 2];
    const attacker = side === "left" ? left : right;
    const defender = side === "left" ? right : left;
    const attackerStats = side === "left" ? leftStats : rightStats;
    const defenderStats = side === "left" ? rightStats : leftStats;
    const attackerHp = side === "left" ? leftHp : rightHp;
    const attackerMaxHp = side === "left" ? leftMaxHp : rightMaxHp;
    const alreadyHealed = side === "left" ? leftHealed : rightHealed;

    if (!alreadyHealed && attackerHp / attackerMaxHp <= BALANCE.combat.healThreshold) {
      const healing = Math.round(5 + attackerStats.spirit);
      if (side === "left") {
        leftHp = Math.min(leftMaxHp, leftHp + healing);
        leftHealed = true;
      } else {
        rightHp = Math.min(rightMaxHp, rightHp + healing);
        rightHealed = true;
      }
      events.push({
        side,
        action: "recover",
        damage: 0,
        healing,
        leftHp,
        rightHp,
        text: `${attacker.name} recovered ${healing} HP.`,
      });
      continue;
    }

    const action = chooseAttack(attackerStats, defenderStats);
    const base = action === "strike" ? baseStrikeDamage(attackerStats, defenderStats) : baseCastDamage(attackerStats, defenderStats);
    const advantage = raceMultiplier(attacker.raceId, defender.raceId);
    const variance = 0.95 + random() * 0.1;
    const critical = random() < combatCriticalChance(attackerStats);
    const damage = Math.max(
      1,
      Math.round(base * advantage * variance * (critical ? BALANCE.combat.criticalMultiplier : 1)),
    );
    if (side === "left") rightHp = Math.max(0, rightHp - damage);
    else leftHp = Math.max(0, leftHp - damage);
    events.push({
      side,
      action,
      damage,
      healing: 0,
      critical,
      advantage: advantage > 1,
      leftHp,
      rightHp,
      text: `${attacker.name} used ${action === "strike" ? "Strike" : "Cast"} for ${damage} damage${critical ? " (CRITICAL)" : ""}${advantage > 1 ? " (ADVANTAGE)" : ""}.`,
    });
  }

  const leftRatio = leftHp / leftMaxHp;
  const rightRatio = rightHp / rightMaxHp;
  const winnerSide =
    leftHp <= 0
      ? "right"
      : rightHp <= 0
        ? "left"
        : leftRatio === rightRatio
          ? leftStats.dexterity >= rightStats.dexterity
            ? "left"
            : "right"
          : leftRatio > rightRatio
            ? "left"
            : "right";
  events.push({
    side: winnerSide,
    final: true,
    leftHp,
    rightHp,
    text: `${winnerSide === "left" ? left.name : right.name} wins with ${winnerSide === "left" ? leftHp : rightHp} HP remaining.`,
  });
  return {
    win: winnerSide === "left",
    winnerSide,
    leftHp,
    rightHp,
    leftMaxHp,
    rightMaxHp,
    events,
  };
}

function battleActor(character, hpMax) {
  const side = character.id?.startsWith("ai-") ? "opponent" : "player";
  return {
    id: character.id,
    name: character.name,
    race: getRace(character.raceId).name,
    className: getClass(character.classId).name,
    sprite: getRecruitSprite(character, side),
    color: getRarity(character.rarity).color,
    hpMax,
  };
}

function buildBattleScene(left, right, result, label) {
  return {
    label,
    index: 0,
    running: false,
    left: battleActor(left, result.leftMaxHp),
    right: battleActor(right, result.rightMaxHp),
    events: result.events,
    winner: result.winnerSide,
  };
}

function playBattleScene(scene) {
  clearTimeout(battleTimer);
  state.battleScene = { ...scene, running: true, index: 0 };
  renderArena();
  const advance = () => {
    if (!state.battleScene?.running) return;
    state.battleScene.index += 1;
    const event = state.battleScene.events[state.battleScene.index - 1];
    if (event && !event.final) playSfx(event.action === "recover" ? "recover" : "attack");
    if (event?.damage) setTimeout(() => playSfx("hit"), 180);
    renderBattleStage();
    if (state.battleScene.index >= state.battleScene.events.length) {
      state.battleScene.running = false;
      playSfx("victory");
      renderAll();
      return;
    }
    battleTimer = setTimeout(advance, BALANCE.combat.eventDuration);
  };
  battleTimer = setTimeout(advance, BALANCE.combat.openingDelay);
}

function damageEquippedForBattle(character, amount) {
  damageItem(getEquippedItem(character), amount);
}

function fightDuel(practice = false) {
  const character = getActiveCharacter();
  if (!character || character.state !== "active") {
    showToast("Select an active recruit first.");
    return;
  }
  if (state.battleScene?.running) {
    showToast("The current battle is still playing.");
    return;
  }
  if (!practice && character.careerFights >= BALANCE.combat.maxCareerFights) {
    openTournamentConfirmation();
    return;
  }

  const fightNumber = character.careerFights + 1;
  const scale = practice ? 1 : 0.92 + fightNumber * 0.008;
  const opponent = createOpponent(character, scale, `${state.totalBattles}-${fightNumber}-${practice}`);
  const result = resolveBattle(character, opponent, { seed: `${character.id}-${opponent.id}-${state.totalBattles}` });
  const rewards = { bucks: 0, salvage: 0, trainingPoints: 0 };
  if (!practice) {
    character.careerFights += 1;
    character.trainingPoints += 1;
    state.totalBattles += 1;
    damageEquippedForBattle(character, 2);
    rewards.bucks = BALANCE.combat.careerBuckReward;
    rewards.trainingPoints = 1;
    state.bucks += rewards.bucks;
    state.totalBucks += rewards.bucks;
    if (result.win) {
      character.wins += 1;
      state.salvage += 1;
      rewards.salvage = 1;
    } else {
      character.losses += 1;
    }
    if (state.tutorialStage === 7) state.tutorialStage = 8;
    addBattleLog(
      `Fight ${fightNumber}: ${character.name} ${result.win ? "defeated" : "lost to"} ${opponent.name}. +${rewards.bucks} Bucks, +1 TP${result.win ? ", +1 Salvage" : ""}.`,
    );
  } else {
    addBattleLog(`Practice: ${character.name} ${result.win ? "defeated" : "lost to"} ${opponent.name}. No rewards or career use.`);
  }
  recordBattleHistory({
    label: practice ? "AI Practice" : `Career Fight ${fightNumber}`,
    kind: practice ? "practice" : "career",
    left: character,
    right: opponent,
    result,
    rewards,
    gearWear: practice ? 0 : 2,
  });
  saveState();
  renderAll();
  playBattleScene(buildBattleScene(character, opponent, result, practice ? "Practice" : `Career Fight ${fightNumber}`));
  showToast(
    practice
      ? "Practice complete."
      : `Fight complete. +${rewards.bucks} Bucks, +1 TP${result.win ? ", +1 Salvage" : ""}.`,
  );
}

function openTournamentConfirmation() {
  const character = getActiveCharacter();
  if (!character || character.careerFights < BALANCE.combat.maxCareerFights) return;
  const root = $("#modalRoot");
  root.innerHTML = `
    <div class="modal-card tournament-warning">
      <p class="eyebrow">Permanent career ending</p>
      <h2>Enter the three-round tournament?</h2>
      <p>${escapeHtml(character.name)} leaves the playable roster after this tournament.</p>
      <ul>
        <li>A loss makes the recruit permanently Fallen.</li>
        <li>A victory retires them into the Hall of Legends and awards one Mark.</li>
        <li>Equipped gear safely returns to inventory.</li>
      </ul>
      <div class="panel-actions">
        <button class="button danger" data-action="confirm-tournament">Enter tournament</button>
        <button class="button" data-action="close-modal">Cancel</button>
      </div>
    </div>`;
  root.classList.remove("hidden");
  playSfx("panel");
}

function runTournament() {
  const character = getActiveCharacter();
  if (!character || character.careerFights < BALANCE.combat.maxCareerFights) return;
  closeModal();
  damageEquippedForBattle(character, 8);
  const maxHp = 50 + getCharacterStats(character).health * 5;
  let currentHp = maxHp;
  let lastScene = null;
  let won = true;
  const roundNames = ["Qualifier", "Semifinal", "Final"];
  const scales = [0.95, 1, 1.05];

  for (let index = 0; index < scales.length; index += 1) {
    const opponent = createOpponent(character, scales[index], `tournament-${state.marks.length}-${index}`);
    const result = resolveBattle(character, opponent, {
      seed: `${character.id}-tournament-${state.marks.length}-${index}`,
      leftStartHp: currentHp,
    });
    lastScene = buildBattleScene(character, opponent, result, `Tournament ${roundNames[index]}`);
    recordBattleHistory({
      label: `Tournament ${roundNames[index]}`,
      kind: "tournament",
      left: character,
      right: opponent,
      result,
      rewards: {},
      gearWear: index === 0 ? 8 : 0,
    });
    addBattleLog(
      `${roundNames[index]}: ${character.name} ${result.win ? "defeated" : "fell to"} ${opponent.name}. ${result.events.at(-1).text}`,
    );
    if (!result.win) {
      won = false;
      break;
    }
    currentHp = Math.min(maxHp, result.leftHp + Math.round(maxHp * BALANCE.combat.betweenTournamentRoundHeal));
  }

  const item = getEquippedItem(character);
  character.equippedItemId = null;
  character.baySlot = null;
  if (won) {
    character.state = "retired";
    state.legends.unshift(character.id);
    state.marks.unshift({
      id: uid("mark"),
      characterId: character.id,
      characterName: character.name,
      earnedAt: Date.now(),
    });
    state.salvage += 15;
    if (state.battleHistory[0]?.kind === "tournament") state.battleHistory[0].rewards.salvage += 15;
    addBattleLog(`${character.name} won the tournament, retired as a Legend, and earned a Mark plus 15 Salvage.`);
  } else {
    character.state = "fallen";
    state.fallen.unshift(character.id);
    state.salvage += 5;
    if (state.battleHistory[0]?.kind === "tournament") state.battleHistory[0].rewards.salvage += 5;
    addBattleLog(`${character.name} was permanently lost in the tournament. The crew recovered 5 Salvage.`);
  }
  state.activeCharacterId = state.characters.find((entry) => entry.state === "active" && entry.baySlot !== null)?.id || null;
  saveState();
  renderAll();
  if (lastScene) playBattleScene(lastScene);
  showToast(
    won
      ? `${character.name} retired as a Legend. Mark earned.`
      : `${character.name} became Fallen. Their ${item ? "gear was recovered" : "record remains in the memorial"}.`,
  );
}

function trainCharacter(statId, modeId) {
  const character = getActiveCharacter();
  const mode = BALANCE.trainingModes.find((entry) => entry.id === modeId);
  if (!character || !mode || !STAT_IDS.includes(statId)) return;
  if (character.trainingPoints < 1) {
    showToast("This recruit has no Training Points.");
    return;
  }
  const stat = getStat(statId);
  const before = getCharacterStats(character)[statId];
  character.trainingPoints -= 1;
  state.totalTraining += 1;
  const success = Math.random() < mode.chance;
  if (success) character.trainedStats[statId] += mode.gain;
  const after = getCharacterStats(character)[statId];
  state.trainingHistory.unshift({
    id: uid("training"),
    createdAt: Date.now(),
    characterId: character.id,
    characterName: character.name,
    statId,
    statName: stat.name,
    modeId: mode.id,
    modeName: mode.name,
    chance: mode.chance,
    success,
    gain: success ? mode.gain : 0,
    attemptedGain: mode.gain,
    before,
    after,
  });
  state.trainingHistory = state.trainingHistory.slice(0, 60);
  character.energy = Math.min(character.energy, getMaxEnergy(character));
  const tutorialTraining = state.tutorialStage === 8;
  if (tutorialTraining) {
    state.tutorialStage = 9;
    state.firstVoyagePaid = true;
    state.bucks += BALANCE.tutorial.firstVoyageBonus;
    state.totalBucks += BALANCE.tutorial.firstVoyageBonus;
  }
  saveState();
  if (tutorialTraining) routeTo("play");
  else renderAll();
  playSfx(success ? "training" : "failure");
  showTrainingResult({
    success,
    characterName: character.name,
    statName: stat.name,
    modeName: mode.name,
    gain: mode.gain,
  });
  showToast(
    tutorialTraining
      ? `${success ? `+${mode.gain} ${stat.name}. ` : "Training failed. "}Upgrade bonus: +${BALANCE.tutorial.firstVoyageBonus} Bucks.`
      : success
        ? `${mode.name} training succeeded: +${mode.gain} ${stat.name}.`
        : `${mode.name} training failed. TP consumed.`,
  );
}

function getStat(id) {
  return BALANCE.stats.find((stat) => stat.id === id) || BALANCE.stats[0];
}

function questDefinitions() {
  const activeCharacters = state.characters.filter((entry) => entry.state === "active");
  const raceCount = new Set(activeCharacters.map((entry) => entry.raceId)).size;
  const classCount = new Set(activeCharacters.map((entry) => entry.classId)).size;
  const dismantledProgress = Math.min(state.salvage, BALANCE.salvagePerCrate);
  return [
    { id: "cargo-25", title: "Cargo Rat", description: "Open captured cargo 25 times.", current: state.totalClicks, target: 25, reward: 15 },
    { id: "cargo-100", title: "Deck Rhythm", description: "Open captured cargo 100 times.", current: state.totalClicks, target: 100, reward: 40 },
    { id: "crew-2", title: "Two-Person Job", description: "Own two active recruits.", current: activeCharacters.length, target: 2, reward: 25 },
    { id: "crew-5", title: "Full Table", description: "Own five active recruits.", current: activeCharacters.length, target: 5, reward: 110 },
    { id: "race-3", title: "Mixed Crew", description: "Own recruits from three different races.", current: raceCount, target: 3, reward: 45 },
    { id: "class-4", title: "Job Board", description: "Own recruits from four different classes.", current: classCount, target: 4, reward: 55 },
    { id: "bay-3", title: "Room to Breathe", description: "Reach Bay Level 3.", current: state.bayLevel, target: 3, reward: 50 },
    { id: "gear-3", title: "Quartermaster's Shelf", description: "Hold three pieces of gear.", current: state.inventory.length, target: 3, reward: 30 },
    { id: "salvage-50", title: "Nothing Wasted", description: "Collect 50 Salvage at once.", current: state.salvage, target: 50, reward: 35 },
    { id: "salvage-crate", title: "Rebuilt From Scraps", description: "Build one Salvage Crate.", current: state.salvageCratesOpened, target: 1, reward: 85 },
    { id: "training-5", title: "Training Habit", description: "Attempt five training sessions.", current: state.totalTraining, target: 5, reward: 45 },
    { id: "arena-3", title: "Arena Regular", description: "Complete three career battles.", current: state.totalBattles, target: 3, reward: 45 },
    { id: "career-10", title: "Veteran", description: "Complete ten career fights with one recruit.", current: Math.max(0, ...state.characters.map((entry) => entry.careerFights)), target: 10, reward: 75 },
    { id: "salvage-buffer", title: "Emergency Parts", description: "Keep 25 Salvage ready for crates or repairs.", current: dismantledProgress, target: 25, reward: 30 },
    { id: "first-mark", title: "Legend Made", description: "Win a tournament Mark.", current: state.marks.length, target: 1, reward: 150 },
  ];
}

function claimQuest(id) {
  const quest = questDefinitions().find((entry) => entry.id === id);
  if (!quest || quest.current < quest.target || state.questClaims.includes(id)) return;
  state.questClaims.push(id);
  state.bucks += quest.reward;
  state.totalBucks += quest.reward;
  saveState();
  renderAll();
  playSfx("purchase");
  showToast(`${quest.title} claimed: +${quest.reward} Space Bucks.`);
}

function buildShell() {
  document.title = "Cyclops Space Pirates";
  const description = $('meta[name="description"]');
  if (description) {
    description.content = "A space-pirate clicker and monster-collector game about hiring recruits, opening captured cargo, training through battles, and building a legendary crew.";
  }

  $(".brand strong").textContent = "Cyclops Space Pirates";
  $(".brand small").textContent = "Cargo crew economy";
  $(".site-footer p").textContent =
    "Cyclops Space Pirates is a local gameplay alpha. Marketplace ETH and future money-match systems remain simulated until audited production services are ready.";
  $("#topNav").innerHTML = `
    <a href="#play" data-route-link="play">Cargo</a>
    <a href="#characters" data-route-link="characters" data-feature="characters">Crew</a>
    <a href="#shop" data-route-link="shop" data-feature="shop">Shop</a>
    <a href="#loot" data-route-link="loot" data-feature="loot">Gear</a>
    <a href="#arena" data-route-link="arena" data-feature="arena">Arena</a>
    <a href="#training" data-route-link="training" data-feature="training">Training</a>
    <button class="more-button" type="button" id="moreToggle" aria-controls="moreNav" aria-expanded="false">More</button>
    <div class="more-nav" id="moreNav">
      <a href="#market" data-route-link="market" data-feature="full">Market</a>
      <a href="#quests" data-route-link="quests" data-feature="full">Quests</a>
      <a href="#leaderboard" data-route-link="leaderboard" data-feature="full">Leaderboard</a>
      <a href="#docs" data-route-link="docs" data-feature="full">Rules</a>
      <a href="#profile" data-route-link="profile" data-feature="full">Captain Log</a>
      <button class="dev-button" type="button" id="devControls" data-action="open-dev">Dev</button>
    </div>`;

  $("#play").innerHTML = `
    <div class="play-console">
      <div class="stats-rail play-hud" id="statsRail"></div>
      <section class="bay-stage pirate-stage" aria-label="Cargo crate">
        <div class="bay-ambient" aria-hidden="true"></div>
        <div class="active-character-stage">
          <div class="stage-character-art" id="stageCharacterSprite"></div>
          <div class="stage-character-panel" id="activeCharacterPanel"></div>
        </div>
        <div class="button-core">
          <button class="visor-button cargo-crate" id="pressButton" type="button" data-action="press" aria-label="Open captured cargo">
            <span class="crate-plank plank-one" aria-hidden="true"></span>
            <span class="crate-plank plank-two" aria-hidden="true"></span>
            <span class="crate-lock" aria-hidden="true"></span>
            <strong>OPEN</strong>
          </button>
          <div class="energy-meter ship-energy-meter" aria-label="Total Energy"><span id="energyBar"></span></div>
          <div class="station-meta">
            <span id="energyLabel">Total Energy: 10 / 10</span>
            <span id="rewardLabel">1.00 Bucks / press</span>
          </div>
          <div class="press-effects" id="pressEffects" aria-hidden="true"></div>
        </div>
        <nav class="stage-actions" aria-label="Game actions">
          <a href="#characters" data-route-link="characters" data-feature="characters"><img src="assets/NormalForward.png" alt="" /><span>Crew</span></a>
          <a href="#shop" data-route-link="shop" data-feature="shop"><img src="assets/item-concepts-cyclops/individual/relics/miniature-button-shrine.png" alt="" /><span>Shop</span></a>
          <a href="#arena" data-route-link="arena" data-feature="arena"><img src="assets/action-icons/battle.png" alt="" /><span>Arena</span></a>
          <a href="#training" data-route-link="training" data-feature="training"><img src="assets/action-icons/train.png" alt="" /><span>Train</span></a>
          <a href="#loot" data-route-link="loot" data-feature="loot"><img src="assets/action-icons/loot.png" alt="" /><span>Gear</span></a>
          <a href="#market" data-route-link="market" data-feature="full"><img src="assets/action-icons/market.png" alt="" /><span>Market</span></a>
        </nav>
        <div class="bay-console">
          <div><span>Crew Bay</span><strong id="bayLevelMain">Offline</strong></div>
          <div><span>Recovery</span><strong id="bayYieldMain">0.0 Energy/sec/recruit</strong></div>
          <button class="button primary" type="button" id="buyFarmMain" data-action="upgrade-bay">Upgrade Bay</button>
        </div>
      </section>
      <section class="roster-console" aria-labelledby="rosterConsoleTitle">
        <div class="roster-console-head">
          <div><p class="eyebrow">Stationed crew</p><h3 id="rosterConsoleTitle">Bay Roster</h3></div>
          <div class="panel-actions">
            <button class="button compact" data-action="open-rules">Rules</button>
            <button class="button compact danger" data-action="reset-run">Reset</button>
          </div>
        </div>
        <div class="play-roster" id="playRoster"></div>
      </section>
      <details class="build-detail">
        <summary>Active recruit calculations</summary>
        <div class="build-summary" id="buildSummary"></div>
      </details>
    </div>`;

  $("#characters").innerHTML = `
    <div class="section-head">
      <p class="eyebrow">Recruitment terminal</p>
      <h2>Your Crew</h2>
      <p>Hire randomized recruits, assign them to limited Bay slots, and choose who opens captured cargo.</p>
    </div>
    <div class="crew-control-grid">
      <section class="shop-panel" id="hirePanel"></section>
      <section class="shop-panel" id="bayPanel"></section>
    </div>
    <div class="section-head small"><p class="eyebrow">Roster</p><h2>Recruits</h2></div>
    <div class="character-grid crew-grid" id="characterGrid"></div>`;

  $("#shop").innerHTML = `
    <div class="section-head">
      <p class="eyebrow">Ship quartermaster</p>
      <h2>Shop &amp; Crew Bay</h2>
      <p>Upgrade crew capacity, buy equipment crates, or exchange collected Salvage for a crate.</p>
    </div>
    <div class="shop-balance-banner" id="shopBalance"></div>
    <div class="shop-layout">
      <section class="shop-panel" id="bayUpgradePanel"></section>
      <section class="shop-panel" id="starterCratePanel"></section>
      <section class="shop-panel" id="standardCratePanel"></section>
      <section class="shop-panel" id="salvageCratePanel"></section>
    </div>`;

  $("#loot").innerHTML = `
    <div class="section-head">
      <p class="eyebrow">Quartermaster inventory</p>
      <h2>Gear &amp; Salvage</h2>
      <p>Each recruit equips one item. Durability wears through cargo work and battle; repair it or dismantle it into Salvage.</p>
    </div>
    <div class="stats-rail" id="lootStats"></div>
    <div class="inventory-grid" id="inventoryGrid"></div>`;

  $("#training").innerHTML = `
    <div class="section-head">
      <p class="eyebrow">Permanent development</p>
      <h2>Training Deck</h2>
      <p>Every career fight awards 1 TP. Choose reliable growth or gamble for a larger increase; stats have no hard cap.</p>
    </div>
    <div id="statPrimer"></div>
    <div class="training-layout">
      <div class="training-side-column">
        <section class="shop-panel" id="trainingCharacterPanel"></section>
        <section class="shop-panel">
          <div class="panel-head"><div><p class="eyebrow">Permanent record</p><h3>Training History</h3></div></div>
          <div class="training-history" id="trainingHistory"></div>
        </section>
      </div>
      <section class="shop-panel"><div class="training-grid" id="trainingPanel"></div></section>
    </div>`;

  $("#arena").innerHTML = `
    <div class="arena-layout">
      <section class="battle-stage-wrap">
        <div class="panel-head"><div><p class="eyebrow">Action event</p><h3>Battle stage</h3></div><span class="pill" id="battleRoundPill">No battle</span></div>
        <div id="battleStage"></div>
      </section>
      <section class="shop-panel" id="battlePrep"></section>
    </div>
    <div class="combat-guide-grid">
      <section class="shop-panel" id="combatLegend"></section>
      <section class="shop-panel" id="lastBattleSummary"></section>
    </div>
    <div class="section-head small"><p class="eyebrow">Complete record</p><h2>Fight History</h2></div>
    <div class="battle-log" id="battleLog"></div>`;

  $("#market").innerHTML = `
    <div class="section-head">
      <p class="eyebrow">Simulated exchange</p>
      <h2>Gear Market</h2>
      <p>Trade equipment for Space Bucks or simulated ETH. A 5% marketplace fee is deducted from completed sales.</p>
    </div>
    <div class="stats-rail" id="marketStats"></div>
    <div class="market-actions"><button class="button primary" data-action="settle-market">Settle buyer demand</button><span>65% simulated sale chance per listing</span></div>
    <div class="section-head small"><p class="eyebrow">Public listings</p><h2>Available gear</h2></div>
    <div class="inventory-grid" id="marketGrid"></div>
    <div class="section-head small"><p class="eyebrow">Captain's listings</p><h2>Your sales</h2></div>
    <div class="inventory-grid" id="playerListings"></div>`;

  $("#quests").innerHTML = `
    <div class="section-head"><p class="eyebrow">Milestones</p><h2>Captain's Objectives</h2><p>Objectives reward learning and long-term progression without changing combat odds.</p></div>
    <div class="quest-grid" id="questGrid"></div>`;

  $("#leaderboard").innerHTML = `
    <div class="section-head"><p class="eyebrow">Local simulation</p><h2>Cargo Leaderboard</h2><p>Mock rivals show the shape of a future server-verified leaderboard.</p></div>
    <div class="leaderboard-wrap"><div class="podium" id="podium"></div><div class="table-wrap"><table><thead><tr><th>Rank</th><th>Captain</th><th>Total Bucks</th><th>Crew</th><th>Marks</th></tr></thead><tbody id="leaderboardBody"></tbody></table></div></div>`;

  $("#docs").innerHTML = `
    <div class="section-head"><p class="eyebrow">Rules reference</p><h2>Ship Manual</h2><p>The complete live ruleset, expressed with the same values used by the prototype.</p></div>
    <div class="docs-content rules-content" id="docsContent"></div>`;

  $("#profile").innerHTML = `
    <div class="section-head"><p class="eyebrow">Captain log</p><h2>Run Summary</h2><p>Your crew, economy, tournament history, and local testing state.</p></div>
    <div class="profile-layout">
      <section class="profile-panel"><div class="panel-head"><div><p class="eyebrow">Account</p><h3>Current run</h3></div><span class="status-dot">Local alpha</span></div><dl class="profile-stats" id="profileStats"></dl></section>
      <section class="profile-panel"><div class="panel-head"><div><p class="eyebrow">Hall</p><h3>Retired Legends</h3></div></div><div id="legendList"></div></section>
      <section class="profile-panel"><div class="panel-head"><div><p class="eyebrow">Memorial</p><h3>Fallen Recruits</h3></div></div><div id="fallenList"></div></section>
      <section class="profile-panel"><div class="panel-head"><div><p class="eyebrow">Production</p><h3>Money matches</h3></div><span class="pill">Future</span></div><p class="body-copy">Paid matches remain intentionally disabled until server verification, fee disclosure, jackpot accounting, audits, and legal review are complete.</p></section>
    </div>`;

  $("#home").innerHTML = "";
  $("#home").hidden = true;

  if (!$("#tutorialCoach")) {
    document.body.insertAdjacentHTML(
      "beforeend",
      `<aside class="tutorial-coach hidden" id="tutorialCoach" aria-live="polite"><strong id="tutorialTitle"></strong><p id="tutorialCopy"></p></aside>`,
    );
  }
  if (!$("#trainingResult")) {
    document.body.insertAdjacentHTML(
      "beforeend",
      `<aside class="training-result-popup hidden" id="trainingResult" aria-live="assertive"></aside>`,
    );
  }
}

function featureUnlocked(feature) {
  if (!feature || feature === "play") return true;
  const stage = state.tutorialStage;
  const thresholds = {
    characters: 1,
    shop: 4,
    loot: 5,
    arena: 7,
    training: 8,
    full: BALANCE.tutorial.completedStage,
  };
  return stage >= (thresholds[feature] ?? 9);
}

function tutorialObjectiveRoute(stage = state.tutorialStage) {
  return {
    0: "play",
    1: "characters",
    2: "characters",
    3: "play",
    4: "shop",
    5: "loot",
    6: "loot",
    7: "arena",
    8: "training",
    9: "shop",
    10: "characters",
    11: "characters",
  }[stage] || null;
}

function isTutorialBattleLocked() {
  return state.tutorialStage === 8 && Boolean(state.battleScene?.running);
}

function tutorialRouteAllowed(route) {
  if (state.tutorialStage >= BALANCE.tutorial.completedStage) return true;
  if (isTutorialBattleLocked()) return route === "arena";
  return route === "play" || route === tutorialObjectiveRoute();
}

function tutorialActionAllowed(action, element = null) {
  if (state.tutorialStage >= BALANCE.tutorial.completedStage) return true;
  if (["open-dev", "close-modal", "reset-run", "open-rules", "dev-tutorial"].includes(action) || action.startsWith("dev-")) {
    return true;
  }

  const item = element?.dataset?.id ? state.inventory.find((entry) => entry.id === element.dataset.id) : null;
  const character = element?.dataset?.id ? state.characters.find((entry) => entry.id === element.dataset.id) : null;
  const stage = state.tutorialStage;
  if (isTutorialBattleLocked()) return false;
  if (stage === 0 || stage === 3) return action === "press";
  if (stage === 1 || stage === 10) return action === "hire-recruit";
  if (stage === 2 || stage === 11) return action === "assign-bay" && character?.baySlot === null;
  if (stage === 4) return action === "open-starter";
  if (stage === 5) return action === "equip-item" && item && !item.tutorialBroken && item.durability > 0;
  if (stage === 6) return ["open-dismantle", "confirm-dismantle"].includes(action) && item?.tutorialBroken;
  if (stage === 7) return action === "fight-duel";
  if (stage === 8) return action === "train-stat";
  if (stage === 9) return action === "upgrade-bay";
  return false;
}

function showTutorialBlockedMessage() {
  const message = tutorialMessage();
  showToast(message ? `Tutorial objective: ${message[1]}` : "Finish the current tutorial objective first.");
  playSfx("blocked");
  renderTutorial();
}

function routeFeature(route) {
  return {
    play: "play",
    characters: "characters",
    shop: "shop",
    loot: "loot",
    arena: "arena",
    training: "training",
    market: "full",
    quests: "full",
    leaderboard: "full",
    docs: "full",
    profile: "full",
  }[route] || "full";
}

function routeTo(route, updateHash = true) {
  const target = $(`[data-view="${route}"]`) ? route : "play";
  if (!featureUnlocked(routeFeature(target))) {
    showToast("That terminal has not been unlocked yet.");
    playSfx("blocked");
    return;
  }
  if (!tutorialRouteAllowed(target)) {
    showTutorialBlockedMessage();
    if (!updateHash && location.hash !== `#${currentRoute}`) history.replaceState(null, "", `#${currentRoute}`);
    return;
  }
  currentRoute = target;
  $$(".view").forEach((view) => view.classList.toggle("is-active", view.dataset.view === target));
  $$("[data-route-link]").forEach((link) => link.classList.toggle("is-active", link.dataset.routeLink === target));
  if (updateHash && location.hash !== `#${target}`) history.replaceState(null, "", `#${target}`);
  $("#topNav")?.classList.remove("is-open");
  $("#moreNav")?.classList.remove("is-open");
  $("#navToggle")?.setAttribute("aria-expanded", "false");
  $("#moreToggle")?.setAttribute("aria-expanded", "false");
  renderAll();
  window.scrollTo({ top: 0, behavior: "auto" });
  playSfx("navigate");
}

function renderNav() {
  $$("[data-feature]").forEach((element) => {
    const unlocked = featureUnlocked(element.dataset.feature);
    element.classList.toggle("feature-locked", !unlocked);
    element.setAttribute("aria-disabled", String(!unlocked));
  });
  $$("[data-route-link]").forEach((element) => {
    const route = element.dataset.routeLink;
    const tutorialLocked = route && !tutorialRouteAllowed(route);
    element.classList.toggle("tutorial-locked", tutorialLocked);
    element.setAttribute("aria-disabled", String(tutorialLocked || element.classList.contains("feature-locked")));
  });
}

function renderTutorial() {
  const coach = $("#tutorialCoach");
  const message = tutorialMessage();
  const tutorialStage = state.tutorialStage;
  $$(".tutorial-spotlight").forEach((element) => element.classList.remove("tutorial-spotlight"));
  document.body.classList.toggle("is-onboarding", Boolean(message));
  document.body.dataset.tutorialStage = String(state.tutorialStage);
  if (!message) {
    coach.classList.add("hidden");
    return;
  }
  coach.classList.remove("hidden");
  $("#tutorialTitle").textContent = message[0];
  $("#tutorialCopy").textContent = message[1];
  const selectors = [
    "#pressButton",
    currentRoute === "characters" ? '[data-action="hire-recruit"]' : '.stage-actions [data-route-link="characters"]',
    currentRoute === "characters" ? '[data-action="assign-bay"]' : '.stage-actions [data-route-link="characters"]',
    "#pressButton",
    currentRoute === "shop" ? "#starterCratePanel" : '.stage-actions [data-route-link="shop"]',
    currentRoute === "loot" ? '[data-action="equip-item"]:not([disabled])' : '.stage-actions [data-route-link="loot"]',
    currentRoute === "loot"
      ? '[data-action="open-dismantle"][data-tutorial-broken="true"]'
      : '.stage-actions [data-route-link="loot"]',
    currentRoute === "arena" ? '[data-action="fight-duel"]' : '#topNav [data-route-link="arena"]',
    currentRoute === "training" ? '[data-action="train-stat"]' : '#topNav [data-route-link="training"]',
    currentRoute === "shop" ? '#bayUpgradePanel [data-action="upgrade-bay"]' : '.stage-actions [data-route-link="shop"]',
    currentRoute === "characters" ? '[data-action="hire-recruit"]' : '.stage-actions [data-route-link="characters"]',
    currentRoute === "characters" ? '[data-action="assign-bay"]' : '.stage-actions [data-route-link="characters"]',
  ];
  const target = $(isTutorialBattleLocked() ? "#battleStage" : selectors[tutorialStage]);
  if (target) {
    target.classList.add("tutorial-spotlight");
    target.classList.remove("feature-locked", "tutorial-locked");
    target.setAttribute("aria-disabled", "false");
  }
}

function statTooltipText(stat) {
  return `${stat.name}. Cargo: ${stat.crate} Combat: ${stat.battle}`;
}

function statTooltipMarkup(stat) {
  return `
    <span class="stat-tooltip" role="tooltip">
      <b>${escapeHtml(stat.name)}</b>
      <span>Cargo: ${escapeHtml(stat.crate)}</span>
      <span>Combat: ${escapeHtml(stat.battle)}</span>
    </span>`;
}

function statLabelWithTooltip(statId, label = null, className = "") {
  const stat = getStat(statId);
  return `
    <span class="stat-label-with-tip has-stat-tooltip ${className}" tabindex="0" aria-label="${escapeHtml(statTooltipText(stat))}">
      ${escapeHtml(label || stat.name)}
      ${statTooltipMarkup(stat)}
    </span>`;
}

function statPills(stats) {
  return BALANCE.stats
    .map(
      (stat) => `
        <span class="stat-pill has-stat-tooltip" tabindex="0" aria-label="${escapeHtml(statTooltipText(stat))}">
          <small>${stat.short}</small>
          <strong>${fmt(stats[stat.id])}</strong>
          ${statTooltipMarkup(stat)}
        </span>`,
    )
    .join("");
}

function bonusLine(bonuses) {
  return STAT_IDS.filter((stat) => bonuses[stat])
    .map((stat) => `+${bonuses[stat]} ${statLabelWithTooltip(stat, getStat(stat).name, "inline-stat-label")}`)
    .join(", ");
}

function compactBonusLine(bonuses) {
  return STAT_IDS.filter((stat) => bonuses[stat])
    .map((stat) => `+${bonuses[stat]} ${statLabelWithTooltip(stat, getStat(stat).short, "inline-stat-label")}`)
    .join(", ");
}

function careerStage(character) {
  if (!character) return "No Recruit";
  if (character.state === "retired") return "Legend";
  if (character.state === "fallen") return "Fallen";
  if (character.careerFights >= BALANCE.combat.maxCareerFights) return "Tournament Ready";
  if (character.careerFights >= 7) return "Veteran";
  if (character.careerFights >= 3) return "Proven";
  return "Rookie";
}

function voyageSteps() {
  const active = getActiveCharacter();
  const hasStarterGear = state.starterCrateOpened;
  const hasEquippedGear = state.characters.some((character) => Boolean(character.equippedItemId));
  return [
    { id: "cargo", label: "Open Cargo", detail: `${fmt(state.totalClicks)} presses`, done: state.totalClicks > 0, route: "play" },
    {
      id: "first-recruit",
      label: "Hire First Recruit",
      detail: `${state.characters.length} owned`,
      done: state.characters.length > 0,
      route: "characters",
    },
    {
      id: "bay",
      label: "Assign To Bay",
      detail: `${getShipEnergy().crew}/${getBayLevel().slots || 1} stationed`,
      done: Boolean(active),
      route: "characters",
    },
    { id: "starter", label: "Starter Gear", detail: hasStarterGear ? "claimed" : "20 Bucks", done: hasStarterGear, route: "shop" },
    { id: "equip", label: "Equip Gear", detail: hasEquippedGear ? "equipped" : "one slot", done: hasEquippedGear, route: "loot" },
    { id: "battle", label: "First Battle", detail: `${state.totalBattles} career`, done: state.totalBattles > 0, route: "arena" },
    { id: "training", label: "Spend TP", detail: `${state.totalTraining} trained`, done: state.totalTraining > 0, route: "training" },
    { id: "bay-two", label: "Bay Level 2", detail: `Level ${state.bayLevel}`, done: state.bayLevel >= 2, route: "shop" },
    {
      id: "crew-two",
      label: "Second Recruit",
      detail: `${state.characters.filter((character) => character.state === "active").length} active`,
      done: state.characters.filter((character) => character.state === "active").length >= 2,
      route: "characters",
    },
  ];
}

function currentVoyageStep() {
  return voyageSteps().find((step) => !step.done) || {
    id: "free-play",
    label: "Free Play",
    detail: "Crew, gear, arena, market",
    done: false,
    route: "play",
  };
}

function renderVoyageChecklist() {
  // The route tracker was removed from the Cargo screen; tutorial focus now lives on the relevant controls.
}

function combatFormulaRows(stats) {
  return [
    ["Max HP", `${50 + stats.health * 5}`, "50 + Health x 5", "health"],
    ["Strike", `${fmt(baseStrikeDamage(stats, { health: 10 }), 1)} vs average`, "8 + Strength x 1.2 - defender Health x 0.3", "strength"],
    ["Cast", `${fmt(baseCastDamage(stats, { spirit: 10 }), 1)} vs average`, "8 + Sorcery x 1.2 - defender Spirit x 0.3", "sorcery"],
    ["Critical", `${fmt(combatCriticalChance(stats) * 100, 1)}%`, "5% + Dexterity above 10 x 0.5%", "dexterity"],
  ];
}

function compactStatPills(stats) {
  return BALANCE.stats
    .map(
      (stat) => `
        <span class="compact-stat has-stat-tooltip" aria-label="${escapeHtml(statTooltipText(stat))}">
          <small>${stat.short}</small>
          <strong>${fmt(stats[stat.id])}</strong>
          ${statTooltipMarkup(stat)}
        </span>`,
    )
    .join("");
}

function renderStageRecruitBio(character, metrics) {
  const race = getRace(character.raceId);
  const classInfo = getClass(character.classId);
  const rarity = getRarity(character.rarity);
  const stats = getCharacterStats(character);
  const item = getEquippedItem(character);
  const careerPercent = clamp((character.careerFights / BALANCE.combat.maxCareerFights) * 100, 0, 100);
  return `
    <article class="stage-recruit-bio" style="--rarity-color:${rarity.color}">
      <header>
        <div>
          <small>${rarity.name} | Bay ${character.baySlot + 1}</small>
          <h3>${escapeHtml(character.name)}</h3>
          <p>${race.name} ${classInfo.name}</p>
        </div>
      </header>
      <div class="stage-bonus-summary">
        <span><small>Race</small><strong>${race.name}: ${compactBonusLine(race.bonuses)}</strong></span>
        <span><small>Class</small><strong>${classInfo.name}: ${compactBonusLine(classInfo.bonuses)}</strong></span>
      </div>
      <div class="mini-stat-grid stage-stat-grid">${statPills(stats)}</div>
      <div class="character-output stage-output-grid">
        <span><small>Energy</small><strong>${fmt(character.energy, character.energy % 1 ? 1 : 0)} / ${getMaxEnergy(character)}</strong></span>
        <span><small>Career</small><strong>${careerStage(character)}</strong></span>
        <span><small>TP</small><strong>${character.trainingPoints}</strong></span>
        <span><small>Rating</small><strong>${combatRating(character)}</strong></span>
      </div>
      <div class="stage-click-grid">
        <span><small>Bucks / Press</small><strong>${fmt(metrics.reward, 2)}</strong></span>
        <span><small>Crit</small><strong>${fmt(metrics.criticalChance * 100, 1)}%</strong></span>
        <span><small>Free Press</small><strong>${fmt(metrics.preserveChance * 100, 1)}%</strong></span>
        <span><small>Record</small><strong>${character.wins}-${character.losses}</strong></span>
      </div>
      <div class="career-track">
        <span><b style="width:${careerPercent}%"></b></span>
        <small>${character.careerFights}/${BALANCE.combat.maxCareerFights} career fights before tournament eligibility</small>
      </div>
      <div class="equipped-line stage-gear-line">
        <small>Gear</small>
        <strong>${item ? `${escapeHtml(item.name)} | ${item.durability}/${item.maxDurability}` : "None equipped"}</strong>
      </div>
    </article>`;
}

function renderPlay() {
  const ship = getShipEnergy();
  const active = getActiveCharacter();
  const metrics = active ? getCrateMetrics(active) : null;
  const shipPercent = ship.max ? clamp((ship.current / ship.max) * 100, 0, 100) : 0;
  $("#statsRail").innerHTML = [
    ["Total Energy", `${fmt(ship.current, ship.current % 1 ? 1 : 0)} / ${fmt(ship.max)}`, "is-energy"],
    ["Recovery", recoveryRateText(ship.recovery, ""), "is-regen"],
    ["Space Bucks", fmt(state.bucks, 2), "is-shards"],
    ["Salvage", `${state.salvage} / ${BALANCE.salvagePerCrate}`, "is-extraction"],
  ]
    .map(([label, value, className]) => `<span class="hud-stat ${className}"><small>${label}</small><strong>${value}</strong></span>`)
    .join("");

  $("#energyBar").style.width = `${shipPercent}%`;
  $("#energyLabel").textContent =
    state.tutorialStage === 0
      ? `Total Energy: ${fmt(state.tutorialEnergy)} / ${BALANCE.tutorial.reserveEnergy}`
      : `Total Energy: ${fmt(ship.current, ship.current % 1 ? 1 : 0)} / ${fmt(ship.max)}`;
  $("#rewardLabel").textContent = metrics ? `${fmt(metrics.reward, 2)} Bucks / press` : "1.00 Buck / press";
  $("#pressButton").disabled =
    state.tutorialStage === 0
      ? state.tutorialEnergy < 1
      : !active ||
        active.energy < 1 ||
        active.baySlot === null ||
        (state.tutorialStage < BALANCE.tutorial.completedStage && state.tutorialStage !== 3);

  if (active) {
    const race = getRace(active.raceId);
    const classInfo = getClass(active.classId);
    const rarity = getRarity(active.rarity);
    const stats = getCharacterStats(active);
    $("#stageCharacterSprite").innerHTML = `<img src="${getRecruitSprite(active, "field")}" alt="${race.name} ${classInfo.name}" />`;
    $("#stageCharacterSprite").style.setProperty("--rarity-color", rarity.color);
    $("#stageCharacterSprite").style.setProperty("--rarity", rarity.color);
    $("#stageCharacterSprite").style.setProperty("--stage-affinity", race.color);
    $("#activeCharacterPanel").innerHTML = renderStageRecruitBio(active, metrics);
    $("#buildSummary").innerHTML = `
      <div class="formula-grid">
        <span><small>Base reward</small><strong>1.00 + ${statLabelWithTooltip("strength", "STR")} / ${statLabelWithTooltip("sorcery", "SOR")} bonuses = ${fmt(metrics.reward, 2)}</strong></span>
        <span><small>${statLabelWithTooltip("dexterity", "Critical")}</small><strong>${fmt(metrics.criticalChance * 100, 1)}%</strong></span>
        <span><small>${statLabelWithTooltip("spirit", "Energy preserve")}</small><strong>${fmt(metrics.preserveChance * 100, 1)}%</strong></span>
        <span><small>Combat rating</small><strong>${combatRating(active)}</strong></span>
      </div>
      <div class="mini-stat-grid">${statPills(stats)}</div>`;
  } else {
    $("#stageCharacterSprite").innerHTML = "";
    $("#stageCharacterSprite").style.removeProperty("--rarity-color");
    $("#stageCharacterSprite").style.removeProperty("--rarity");
    $("#stageCharacterSprite").style.removeProperty("--stage-affinity");
    $("#activeCharacterPanel").innerHTML = "";
    $("#buildSummary").innerHTML = `<p>Select a Bay recruit to see exact crate and combat calculations.</p>`;
  }

  const level = getBayLevel();
  const next = getBayLevel(state.bayLevel + 1);
  $("#bayLevelMain").textContent = state.bayLevel ? `Level ${state.bayLevel} | ${ship.crew}/${level.slots} slots` : "Offline";
  $("#bayYieldMain").textContent = recoveryRateText(level.recoveryPerHour);
  $("#buyFarmMain").textContent =
    state.bayLevel === 0
      ? "Activate with first recruit"
      : next.level === state.bayLevel
        ? "Bay maxed"
        : `Upgrade - ${next.cost} Bucks${next.marks ? ` + ${next.marks} Mark${next.marks === 1 ? "" : "s"}` : ""}`;
  $("#buyFarmMain").disabled =
    state.bayLevel === 0 ||
    next.level === state.bayLevel ||
    state.bucks < next.cost ||
    state.marks.length < next.marks ||
    (state.tutorialStage < BALANCE.tutorial.completedStage && state.tutorialStage !== 9);

  renderPlayRoster();
  renderVoyageChecklist();
}

function renderPlayRoster() {
  const level = getBayLevel();
  if (level.slots === 0) {
    $("#playRoster").innerHTML = `<button class="roster-empty" data-route-link="characters"><strong>Hire your first recruit</strong><span>The Crew terminal unlocks after the ship reserve is spent.</span></button>`;
    return;
  }
  const bySlot = new Map(
    state.characters.filter((character) => character.state === "active" && character.baySlot !== null).map((character) => [character.baySlot, character]),
  );
  $("#playRoster").innerHTML = Array.from({ length: level.slots }, (_, slot) => {
    const character = bySlot.get(slot);
    if (!character) {
      return `<button class="roster-slot empty" data-route-link="characters"><span>Bay ${slot + 1}</span><strong>Empty</strong><small>Assign crew</small></button>`;
    }
    const race = getRace(character.raceId);
    const classInfo = getClass(character.classId);
    const rarity = getRarity(character.rarity);
    const stats = getCharacterStats(character);
    const active = character.id === state.activeCharacterId;
    return `
      <button class="roster-slot ${active ? "is-active" : ""}" data-action="select-character" data-id="${character.id}" style="--rarity:${rarity.color}">
        <img src="${getRecruitSprite(character, "field")}" alt="" />
        <span class="roster-slot-copy">
          <small>Bay ${slot + 1} | ${race.name} ${classInfo.name}</small>
          <strong>${escapeHtml(character.name)}</strong>
          <em>${fmt(character.energy, character.energy % 1 ? 1 : 0)} / ${getMaxEnergy(character)} Energy</em>
        </span>
        <span class="roster-stat-row">${compactStatPills(stats)}</span>
      </button>`;
  }).join("");
}

function renderCharacters() {
  const cost = getHireCost();
  const hireAllowed = state.tutorialStage >= BALANCE.tutorial.completedStage || [1, 10].includes(state.tutorialStage);
  $("#hirePanel").innerHTML = `
    <div class="panel-head"><div><p class="eyebrow">Open contract</p><h3>Hire a Recruit</h3></div><span class="pill">${fmt(state.bucks, 2)} Space Bucks</span></div>
    <p class="body-copy">Contracts roll one Race, Class, rarity, and a small rarity stat spread.</p>
    <button class="button primary full" data-action="hire-recruit" ${state.bucks < cost || !hireAllowed ? "disabled" : ""}>Hire Recruit - ${fmt(cost)} Bucks</button>`;

  const level = getBayLevel();
  const ship = getShipEnergy();
  $("#bayPanel").innerHTML = `
    <div class="panel-head"><div><p class="eyebrow">Crew quarters</p><h3>Bay Level ${state.bayLevel}</h3></div><span class="pill">${ship.crew}/${level.slots} slots</span></div>
    <p class="body-copy">Stationed recruits recover ${recoveryRateText(level.recoveryPerHour)}. Total Energy is their combined stored Energy.</p>
    <div class="bay-slot-summary">${level.slots ? `${fmt(ship.current, 1)} / ${fmt(ship.max)} Total Energy` : "Assign the first recruit to activate Bay Level 1."}</div>`;

  const ordered = [...state.characters].sort((a, b) => {
    const order = { active: 0, retired: 1, fallen: 2 };
    return order[a.state] - order[b.state] || (a.baySlot ?? 99) - (b.baySlot ?? 99);
  });
  $("#characterGrid").innerHTML = ordered.length
    ? ordered.map(renderCharacterCard).join("")
    : `<div class="empty-state"><strong>No recruits yet</strong><p>Open the first contract when the Crew terminal unlocks.</p></div>`;
}

function renderCharacterCard(character) {
  const race = getRace(character.raceId);
  const classInfo = getClass(character.classId);
  const rarity = getRarity(character.rarity);
  const stats = getCharacterStats(character);
  const active = character.id === state.activeCharacterId;
  const item = getEquippedItem(character);
  const stateLabel = character.state === "retired" ? "RETIRED LEGEND" : character.state === "fallen" ? "FALLEN" : character.baySlot !== null ? `BAY ${character.baySlot + 1}` : "RESERVE";
  const careerPercent = clamp((character.careerFights / BALANCE.combat.maxCareerFights) * 100, 0, 100);
  const actions =
    character.state !== "active"
      ? `<span class="lifecycle-banner">${stateLabel}</span>`
      : character.baySlot === null
        ? `<button class="button primary full" data-action="assign-bay" data-id="${character.id}">Assign to Bay</button>`
        : `<div class="card-action-row">
            <button class="button ${active ? "secondary" : "primary"}" data-action="select-character" data-id="${character.id}">${active ? "Active" : "Make Active"}</button>
            <button class="button" data-action="remove-bay" data-id="${character.id}">Reserve</button>
          </div>`;
  return `
    <article class="recruit-card-v2 ${active ? "is-active" : ""} is-${character.state}" style="--rarity-color:${rarity.color}">
      <header>
        <img src="${getRecruitSprite(character, "field")}" alt="${race.name} ${classInfo.name} recruit" />
        <div><small>${rarity.name} | ${stateLabel}</small><h3>${escapeHtml(character.name)}</h3><p>${race.name} ${classInfo.name}</p></div>
      </header>
      <section class="profile-strip race-strip" style="--profile-color:${race.color}">
        <small>Race profile</small>
        <strong>${race.name}: ${bonusLine(race.bonuses)}</strong>
        <span>${race.profile}</span>
      </section>
      <section class="profile-strip">
        <small>Class profile</small>
        <strong>${classInfo.name}: ${bonusLine(classInfo.bonuses)}</strong>
        <span>${classInfo.profile}</span>
      </section>
      <div class="mini-stat-grid">${statPills(stats)}</div>
      <div class="character-output">
        <span><small>Energy</small><strong>${fmt(character.energy, character.energy % 1 ? 1 : 0)} / ${getMaxEnergy(character)}</strong></span>
        <span><small>Career</small><strong>${careerStage(character)}</strong></span>
        <span><small>TP</small><strong>${character.trainingPoints}</strong></span>
        <span><small>Rating</small><strong>${combatRating(character)}</strong></span>
      </div>
      <div class="career-track">
        <span><b style="width:${careerPercent}%"></b></span>
        <small>${character.careerFights}/${BALANCE.combat.maxCareerFights} career fights before tournament eligibility</small>
      </div>
      <div class="equipped-line"><small>Gear</small><strong>${item ? escapeHtml(item.name) : "None equipped"}</strong></div>
      ${actions}
    </article>`;
}

function renderShop() {
  const level = getBayLevel();
  const next = getBayLevel(state.bayLevel + 1);
  const atMax = next.level === state.bayLevel;
  const canUpgrade =
    state.bayLevel > 0 &&
    !atMax &&
    state.bucks >= next.cost &&
    state.marks.length >= next.marks &&
    (state.tutorialStage >= BALANCE.tutorial.completedStage || state.tutorialStage === 9);
  $("#shopBalance").innerHTML = `
    <span>Available balance</span>
    <strong>${fmt(state.bucks, 2)} Space Bucks</strong>
    <small>Bay Level ${state.bayLevel} | ${state.salvage}/${BALANCE.salvagePerCrate} Salvage</small>`;
  $("#bayUpgradePanel").innerHTML = `
    <div class="panel-head"><div><p class="eyebrow">Crew Bay</p><h3>Level ${state.bayLevel}</h3></div><span class="pill">${level.slots} berth${level.slots === 1 ? "" : "s"}</span></div>
    <p class="body-copy">Bay levels add recovery slots. Level 5 improves each stationed recruit from 1.0 to 1.1 Energy per second.</p>
    <div class="shop-math"><span>Recovery</span><strong>${recoveryRateText(level.recoveryPerHour)}</strong></div>
    <button class="button primary full" data-action="upgrade-bay" ${canUpgrade ? "" : "disabled"}>
      ${state.bayLevel === 0 ? "Assign first recruit to activate" : atMax ? "Current maximum reached" : `Upgrade to Level ${next.level} - ${next.cost} Bucks${next.marks ? ` + ${next.marks} Mark${next.marks === 1 ? "" : "s"}` : ""}`}
    </button>`;

  $("#starterCratePanel").innerHTML = `
    <div class="panel-head"><div><p class="eyebrow">Onboarding offer</p><h3>Starter Crate</h3></div><span class="pill">${state.starterCrateOpened ? "Claimed" : "20 Bucks"}</span></div>
    <p class="body-copy">One guaranteed Common item plus a broken Cargo Plate used to introduce dismantling and Salvage.</p>
    <button class="button primary full" data-action="open-starter" ${state.starterCrateOpened || state.tutorialStage !== 4 ? "disabled" : ""}>
      ${state.starterCrateOpened ? "Starter Crate opened" : "Buy Starter Crate - 20 Bucks"}
    </button>`;

  $("#standardCratePanel").innerHTML = `
    <div class="panel-head"><div><p class="eyebrow">Quartermaster</p><h3>Equipment Crate</h3></div><span class="pill">${BALANCE.economy.standardCrateCost} Bucks</span></div>
    <p class="body-copy">Roll a Weapon, Armor, Scanner, Charm, or Focus with one guaranteed primary stat, rarity, durability, and possible side stats.</p>
    <button class="button primary full" data-action="open-standard" ${state.tutorialStage < BALANCE.tutorial.completedStage || state.bucks < BALANCE.economy.standardCrateCost ? "disabled" : ""}>Open Equipment Crate</button>`;

  $("#salvageCratePanel").innerHTML = `
    <div class="panel-head"><div><p class="eyebrow">Reclamation</p><h3>Salvage Crate</h3></div><span class="pill">${state.salvage}/${BALANCE.salvagePerCrate}</span></div>
    <p class="body-copy">Critical cargo presses, arena wins, and dismantled gear produce collected Salvage for a crate. Fifty Salvage uses the normal equipment table.</p>
    <button class="button secondary full" data-action="open-salvage" ${state.salvage < BALANCE.salvagePerCrate || state.tutorialStage < BALANCE.tutorial.completedStage ? "disabled" : ""}>Build Salvage Crate</button>`;
}

function itemStatText(item) {
  const parts = [`+${item.primaryValue} ${statLabelWithTooltip(item.primaryStat, getStat(item.primaryStat).name, "inline-stat-label")}`];
  STAT_IDS.forEach((stat) => {
    if (item.sideStats[stat]) parts.push(`+${item.sideStats[stat]} ${statLabelWithTooltip(stat, getStat(stat).name, "inline-stat-label")}`);
  });
  return parts.join(" | ");
}

function renderItemCard(item, context = "inventory") {
  const rarity = getItemRarity(item.rarity);
  const type = getItemType(item.typeId);
  const equippedTo = state.characters.find((character) => character.equippedItemId === item.id);
  const broken = item.durability <= 0;
  let actions = "";
  if (context === "inventory") {
    const tutorialComplete = state.tutorialStage >= BALANCE.tutorial.completedStage;
    const canEquipForTutorial = state.tutorialStage === 5 && !item.tutorialBroken;
    const canDismantleForTutorial = state.tutorialStage === 6 && item.tutorialBroken;
    actions = `
      <div class="button-stack">
        <button class="button primary full" data-action="equip-item" data-id="${item.id}" ${broken || (!tutorialComplete && !canEquipForTutorial) ? "disabled" : ""}>${equippedTo ? `Equipped: ${escapeHtml(equippedTo.name)}` : "Equip to Active"}</button>
        ${equippedTo ? `<button class="button full" data-action="unequip-item" data-id="${item.id}" ${tutorialComplete ? "" : "disabled"}>Unequip</button>` : ""}
        <button class="button full" data-action="repair-item" data-id="${item.id}" ${item.durability >= item.maxDurability || !tutorialComplete ? "disabled" : ""}>Repair - ${repairCost(item)} Bucks</button>
        <div class="card-action-row">
          <button class="button" data-action="list-item" data-id="${item.id}" data-currency="bucks" ${tutorialComplete ? "" : "disabled"}>List Bucks</button>
          <button class="button" data-action="list-item" data-id="${item.id}" data-currency="eth" ${tutorialComplete ? "" : "disabled"}>List ETH</button>
        </div>
        <button
          class="button danger full"
          data-action="open-dismantle"
          data-id="${item.id}"
          ${item.tutorialBroken ? 'data-tutorial-broken="true"' : ""}
          ${tutorialComplete || canDismantleForTutorial ? "" : "disabled"}
        >Dismantle - ${dismantleValue(item)} Salvage</button>
      </div>`;
  }
  return `
    <article class="item-card-v2 ${broken ? "is-broken" : ""}" style="--rarity-color:${rarity.color}">
      <div class="item-visual-v2"><img src="${item.image}" alt="${escapeHtml(item.name)}" /></div>
      <div class="item-title-row"><span class="rarity-tag">${rarity.name}</span><small>${type.name}</small></div>
      <h3>${escapeHtml(item.name)}</h3>
      <p class="item-stats">${itemStatText(item)}</p>
      <div class="durability-row"><span style="width:${(item.durability / item.maxDurability) * 100}%"></span></div>
      <p>${item.durability}/${item.maxDurability} durability${broken ? " | BROKEN: no stat bonus" : ""}</p>
      ${actions}
    </article>`;
}

function renderLoot() {
  const active = getActiveCharacter();
  $("#lootStats").innerHTML = [
    ["Owned Gear", state.inventory.length],
    ["Equipped", active && getEquippedItem(active) ? getEquippedItem(active).name : "None"],
    ["Salvage", `${state.salvage}/${BALANCE.salvagePerCrate}`],
    ["Crates Opened", state.standardCratesOpened + state.salvageCratesOpened + (state.starterCrateOpened ? 1 : 0)],
  ]
    .map(([label, value]) => `<span><small>${label}</small><strong>${escapeHtml(value)}</strong></span>`)
    .join("");
  $("#inventoryGrid").innerHTML = state.inventory.length
    ? state.inventory.map((item) => renderItemCard(item)).join("")
    : `<div class="empty-state"><strong>No gear in storage</strong><p>Open an Equipment Crate or buy an item from the Market.</p></div>`;
}

function renderTraining() {
  const active = getActiveCharacter();
  $("#statPrimer").innerHTML = `
    <div class="stat-primer-grid">
      ${BALANCE.stats
        .map(
          (stat) => `
            <article class="has-stat-tooltip" tabindex="0" aria-label="${escapeHtml(statTooltipText(stat))}">
              <strong>${stat.name}</strong>
              <span>Combat: ${stat.battle}</span>
              <span>Cargo: ${stat.crate}</span>
              ${statTooltipMarkup(stat)}
            </article>`,
        )
        .join("")}
    </div>`;
  $("#trainingCharacterPanel").innerHTML = active
    ? `<div class="panel-head"><div><p class="eyebrow">Active trainee</p><h3>${escapeHtml(active.name)}</h3></div><span class="pill">${active.trainingPoints} TP</span></div>
       <div class="mini-stat-grid">${statPills(getCharacterStats(active))}</div>
       <p class="body-copy">Training gains are permanent. Failure consumes the TP, and there is no hard stat cap.</p>`
    : `<div class="empty-state"><strong>No active trainee</strong><p>Assign and select a recruit from the Crew screen.</p></div>`;

  $("#trainingPanel").innerHTML = BALANCE.stats
    .map(
      (stat) => `
        <article class="training-stat-card has-stat-tooltip" tabindex="0" aria-label="${escapeHtml(statTooltipText(stat))}">
          <header><div><small>${stat.short}</small><h3>${statLabelWithTooltip(stat.id, stat.name)}</h3></div><strong>${active ? getCharacterStats(active)[stat.id] : 0}</strong></header>
          <p>${stat.battle}</p>
          ${statTooltipMarkup(stat)}
          <div class="training-mode-row">
            ${BALANCE.trainingModes
              .map(
                (mode) => `
                  <button class="button" data-action="train-stat" data-stat="${stat.id}" data-mode="${mode.id}" ${!active || active.trainingPoints < 1 || (state.tutorialStage < BALANCE.tutorial.completedStage && state.tutorialStage !== 8) ? "disabled" : ""}>
                    <strong>${mode.name}: +${mode.gain}</strong><small>${fmt(mode.chance * 100)}% success | 1 TP</small>
                  </button>`,
              )
              .join("")}
          </div>
        </article>`,
    )
    .join("");

  $("#trainingHistory").innerHTML = state.trainingHistory.length
    ? state.trainingHistory
        .map(
          (entry) => `
            <article class="training-history-entry ${entry.success ? "is-success" : "is-failure"}">
              <span>${entry.success ? "Success" : "Failed"}</span>
              <div>
                <strong>${escapeHtml(entry.characterName)} | ${statLabelWithTooltip(entry.statId, entry.statName, "inline-stat-label")}</strong>
                <small>${escapeHtml(entry.modeName)}: ${fmt(entry.chance * 100)}% chance for +${entry.attemptedGain} | ${new Date(entry.createdAt).toLocaleString()}</small>
              </div>
              <div class="training-history-result">
                <strong>${entry.success ? `+${entry.gain}` : "+0"}</strong>
                <small>${entry.before} -> ${entry.after}</small>
              </div>
            </article>`,
        )
        .join("")
    : `<div class="empty-state"><strong>No training attempts yet</strong><p>Every success and failure will be recorded here.</p></div>`;
}

function renderCombatLegend() {
  const root = $("#combatLegend");
  if (!root) return;
  const wheel = ["beast", "magic", "metal", "wood", "stone", "beast"]
    .map((id) => getRace(id).name)
    .join(" > ");
  root.innerHTML = `
    <div class="panel-head"><div><p class="eyebrow">Combat rules</p><h3>Readable fight math</h3></div><span class="pill">Auto</span></div>
    <div class="advantage-wheel"><small>Advantage chain</small><strong>${wheel}</strong></div>
    <div class="combat-legend-list">
      <span><strong>Strike</strong><small>Physical hit. Strength raises it, defender Health reduces it.</small></span>
      <span><strong>Cast</strong><small>Spell hit. Sorcery raises it, defender Spirit reduces it.</small></span>
      <span><strong>Recover</strong><small>Once under 35% HP, Spirit heals 5 + Spirit HP.</small></span>
      <span><strong>Dexterity</strong><small>Higher Dexterity usually moves first and crits more often.</small></span>
      <span><strong>Advantage</strong><small>The advantaged recruit deals 1.10x damage, not an automatic win.</small></span>
    </div>`;
}

function renderLastBattleSummary() {
  const root = $("#lastBattleSummary");
  if (!root) return;
  const entry = state.battleHistory[0];
  if (!entry) {
    root.innerHTML = `
      <div class="panel-head"><div><p class="eyebrow">Battle summary</p><h3>No fights yet</h3></div><span class="pill">0</span></div>
      <p class="body-copy">Run a career battle to see winner, rewards, turn count, and gear wear here.</p>`;
    return;
  }
  const rewards = [
    entry.rewards.bucks ? `+${fmt(entry.rewards.bucks)} Bucks` : "",
    entry.rewards.trainingPoints ? `+${entry.rewards.trainingPoints} TP` : "",
    entry.rewards.salvage ? `+${entry.rewards.salvage} Salvage` : "",
    entry.rewards.gearWear ? `-${entry.rewards.gearWear} durability` : "",
  ].filter(Boolean);
  const last = entry.events.at(-1);
  root.innerHTML = `
    <div class="panel-head"><div><p class="eyebrow">Last fight</p><h3>${entry.outcome === "win" ? "Victory" : "Defeat"}</h3></div><span class="pill">${entry.events.length - 1} turns</span></div>
    <div class="battle-summary-grid">
      <span><small>Match</small><strong>${escapeHtml(entry.left.name)} vs ${escapeHtml(entry.right.name)}</strong></span>
      <span><small>Result</small><strong>${escapeHtml(last?.text || entry.label)}</strong></span>
      <span><small>Rewards</small><strong>${rewards.join(" | ") || "No rewards"}</strong></span>
      <span><small>When</small><strong>${new Date(entry.createdAt).toLocaleTimeString()}</strong></span>
    </div>`;
}

function renderArena() {
  const active = getActiveCharacter();
  renderCombatLegend();
  renderLastBattleSummary();
  if (active) {
    const stats = getCharacterStats(active);
    const eligible = active.careerFights >= BALANCE.combat.maxCareerFights;
    const battleRunning = Boolean(state.battleScene?.running);
    $("#battlePrep").innerHTML = `
      <div class="panel-head"><div><p class="eyebrow">Active combatant</p><h3>${escapeHtml(active.name)}</h3></div><span class="pill">${active.careerFights}/10 fights</span></div>
      <div class="mini-stat-grid">${statPills(stats)}</div>
      <div class="combat-formula-list">
        ${combatFormulaRows(stats)
          .map(([label, value, formula, statId]) => `<span><small>${statLabelWithTooltip(statId, label)}</small><strong>${value}</strong><em>${formula}</em></span>`)
          .join("")}
      </div>
      <div class="button-stack">
        <button class="button primary full" data-action="${eligible ? "open-tournament" : "fight-duel"}" ${battleRunning || (state.tutorialStage < BALANCE.tutorial.completedStage && state.tutorialStage !== 7) ? "disabled" : ""}>${eligible ? "Enter Tournament" : `Fight Career Battle ${active.careerFights + 1}`}</button>
        <button class="button secondary full" data-action="practice-battle" ${battleRunning || state.tutorialStage < BALANCE.tutorial.completedStage ? "disabled" : ""}>AI Practice</button>
      </div>`;
  } else {
    $("#battlePrep").innerHTML = `<div class="empty-state"><strong>No active combatant</strong><p>Select a recruit assigned to the Bay.</p></div>`;
  }

  renderBattleStage();
  $("#battleLog").innerHTML = state.battleHistory.length
    ? state.battleHistory.map(renderFightHistoryEntry).join("")
    : `<div class="empty-state"><strong>No completed fights yet</strong><p>Every turn, damage roll, heal, critical, matchup bonus, reward, and durability cost will appear here.</p></div>`;
}

function renderFightHistoryEntry(entry, index) {
  const rewardParts = [];
  if (entry.rewards.bucks) rewardParts.push(`+${fmt(entry.rewards.bucks)} Bucks`);
  if (entry.rewards.trainingPoints) rewardParts.push(`+${entry.rewards.trainingPoints} TP`);
  if (entry.rewards.salvage) rewardParts.push(`+${entry.rewards.salvage} Salvage`);
  if (entry.rewards.gearWear) rewardParts.push(`-${entry.rewards.gearWear} gear durability`);
  const outcome = entry.outcome === "win" ? "Victory" : "Defeat";
  return `
    <details class="fight-history-entry ${entry.outcome === "win" ? "is-win" : "is-loss"}" ${index === 0 ? "open" : ""}>
      <summary>
        <span>${outcome}</span>
        <div><strong>${escapeHtml(entry.label)}</strong><small>${escapeHtml(entry.left.name)} vs ${escapeHtml(entry.right.name)} | ${new Date(entry.createdAt).toLocaleString()}</small></div>
        <small>${rewardParts.join(" | ") || "No rewards"}</small>
      </summary>
      <div class="fight-history-matchup">
        <span><strong>${escapeHtml(entry.left.name)}</strong><small>${entry.left.race} ${entry.left.className} | ${entry.left.maxHp} HP</small></span>
        <b>VS</b>
        <span><strong>${escapeHtml(entry.right.name)}</strong><small>${entry.right.race} ${entry.right.className} | ${entry.right.maxHp} HP</small></span>
      </div>
      <ol class="fight-event-list">
        ${entry.events
          .map(
            (event) => `
              <li class="${event.final ? "is-result" : event.action === "recover" ? "is-heal" : ""}">
                <span>${event.final ? "Result" : `Turn ${event.turn}`}</span>
                <div>
                  <strong>${escapeHtml(event.text)}</strong>
                  <small>
                    ${event.critical ? "Critical | " : ""}${event.advantage ? "Advantage | " : ""}
                    Crew ${fmt(event.leftHp)}/${entry.left.maxHp} HP | Enemy ${fmt(event.rightHp)}/${entry.right.maxHp} HP
                  </small>
                </div>
              </li>`,
          )
          .join("")}
      </ol>
    </details>`;
}

function renderBattleStage() {
  const root = $("#battleStage");
  if (!root) return;
  const scene = state.battleScene;
  if (!scene) {
    const active = getActiveCharacter();
    root.innerHTML = active
      ? `<div class="battle-stage empty-battle"><img src="${getRecruitSprite(active, "field")}" alt="" /><strong>Awaiting opponent</strong><span>Career fights award TP. Practice fights do not.</span></div>`
      : `<div class="battle-stage empty-battle"><strong>No recruit selected</strong></div>`;
    $("#battleRoundPill").textContent = "No battle";
    return;
  }
  const visibleEvents = scene.events.slice(0, scene.index);
  const event = visibleEvents.at(-1) || { leftHp: scene.left.hpMax, rightHp: scene.right.hpMax, text: "Combatants ready." };
  const attacking = !event.action || event.final ? "" : event.side === "left" ? "is-attacking-left" : "is-attacking-right";
  const effectClass = !event.action
    ? ""
    : event.final
    ? "effect-final"
    : event.action === "recover"
      ? "effect-recover"
      : event.action === "cast"
        ? "effect-cast"
        : "effect-strike";
  $("#battleRoundPill").textContent = scene.label;
  root.innerHTML = `
    <div class="battle-stage ${attacking} ${effectClass} ${event.critical ? "is-critical" : ""} ${event.advantage ? "has-advantage" : ""} ${event.final ? "is-final" : ""}">
      ${event.action && !event.final && event.action !== "recover" ? `<div class="battle-projectile" aria-hidden="true"></div><div class="battle-impact" aria-hidden="true"></div>` : ""}
      ${event.action === "recover" ? `<div class="battle-heal-aura ${event.side}" aria-hidden="true"></div>` : ""}
      ${event.critical ? `<div class="battle-critical-banner" aria-hidden="true">CRITICAL</div>` : ""}
      ${event.advantage ? `<div class="battle-advantage-banner" aria-hidden="true">ADVANTAGE</div>` : ""}
      ${renderBattleHud(scene.right, event.rightHp, "enemy")}
      ${renderBattleHud(scene.left, event.leftHp, "player")}
      ${renderBattleFighter(scene.left, "left", event.side === "right" && !event.final)}
      <div class="battle-center-feed">
        <strong>${event.action ? event.action.toUpperCase() : scene.running ? "READY" : "RESULT"}</strong>
        <p>${escapeHtml(event.text)}</p>
        ${event.damage ? `<span class="damage-callout">-${event.damage}</span>` : ""}
        ${event.healing ? `<span class="heal-callout">+${event.healing}</span>` : ""}
      </div>
      ${renderBattleFighter(scene.right, "right", event.side === "left" && !event.final)}
    </div>`;
}

function renderBattleFighter(actor, side, hit) {
  return `
    <div class="battle-fighter ${side} ${hit ? "is-hit" : ""}">
      <div class="battle-sprite-card" style="--rarity-color:${actor.color}"><img class="battle-sprite-img" src="${actor.sprite}" alt="${actor.name}" /></div>
    </div>`;
}

function renderBattleHud(actor, hp, side) {
  const percent = clamp((hp / actor.hpMax) * 100, 0, 100);
  return `
    <div class="battle-info-card battle-hud ${side}">
      <div class="battle-name-row"><strong>${escapeHtml(actor.name)}</strong><span>Lv.${Math.max(1, Math.round(actor.hpMax / 5))}</span></div>
      <small>${actor.race} ${actor.className}</small>
      <div class="battle-hp-line"><b>HP</b><div class="battle-hp" aria-label="${actor.name} HP"><span style="width:${percent}%"></span></div></div>
      <small class="battle-hp-text">${fmt(hp)} / ${actor.hpMax} HP</small>
    </div>`;
}

function renderMarketCard(listing, own = false) {
  const item = listing.item;
  const rarity = getItemRarity(item.rarity);
  const price = listing.currency === "eth" ? `${fmt(listing.price, 4)} ETH` : `${fmt(listing.price)} Bucks`;
  return `
    <article class="item-card-v2 market-card-v2" style="--rarity-color:${rarity.color}">
      <div class="item-visual-v2"><img src="${item.image}" alt="${escapeHtml(item.name)}" /></div>
      <div class="item-title-row"><span class="rarity-tag">${rarity.name}</span><small>${escapeHtml(listing.seller)}</small></div>
      <h3>${escapeHtml(item.name)}</h3>
      <p class="item-stats">${itemStatText(item)}</p>
      <strong class="market-price">${price}</strong>
      <button class="button primary full" data-action="${own ? "cancel-listing" : "buy-listing"}" data-id="${listing.id}">${own ? "Cancel Listing" : "Buy"}</button>
    </article>`;
}

function renderMarket() {
  $("#marketStats").innerHTML = [
    ["Space Bucks", fmt(state.bucks, 2)],
    ["Simulated ETH", fmt(state.ethBalance, 4)],
    ["Your Listings", state.playerListings.length],
    ["Completed Sales", state.marketSales],
  ]
    .map(([label, value]) => `<span><small>${label}</small><strong>${value}</strong></span>`)
    .join("");
  $("#marketGrid").innerHTML = state.marketListings.length
    ? state.marketListings.map((listing) => renderMarketCard(listing)).join("")
    : `<div class="empty-state"><strong>Market cleared</strong><p>Reloading the run will generate another simulated listing set.</p></div>`;
  $("#playerListings").innerHTML = state.playerListings.length
    ? state.playerListings.map((listing) => renderMarketCard(listing, true)).join("")
    : `<div class="empty-state"><strong>No active listings</strong><p>List unequipped gear from the Gear screen.</p></div>`;
}

function renderQuests() {
  $("#questGrid").innerHTML = questDefinitions()
    .map((quest) => {
      const complete = quest.current >= quest.target;
      const claimed = state.questClaims.includes(quest.id);
      const percent = clamp((quest.current / quest.target) * 100, 0, 100);
      return `
        <article class="quest-card">
          <div class="panel-head"><div><p class="eyebrow">${complete ? "Complete" : "In progress"}</p><h3>${quest.title}</h3></div><span class="pill">+${quest.reward}</span></div>
          <p>${quest.description}</p>
          <div class="quest-progress"><span style="width:${percent}%"></span></div>
          <small>${fmt(quest.current)} / ${fmt(quest.target)}</small>
          <button class="button ${complete && !claimed ? "primary" : ""} full" data-action="claim-quest" data-id="${quest.id}" ${!complete || claimed ? "disabled" : ""}>${claimed ? "Claimed" : "Claim Reward"}</button>
        </article>`;
    })
    .join("");
}

function renderLeaderboard() {
  const rows = [
    { name: "redvisor.eth", total: 8420, crew: 4, marks: 3 },
    { name: "void.runner", total: 7135, crew: 4, marks: 2 },
    { name: "bay-seven", total: 5900, crew: 3, marks: 2 },
    { name: "YOU", total: state.totalBucks, crew: state.characters.length, marks: state.marks.length, you: true },
    { name: "0xCARGO", total: 2200, crew: 3, marks: 1 },
  ].sort((a, b) => b.total - a.total);
  $("#podium").innerHTML = rows
    .slice(0, 3)
    .map((row, index) => `<article class="${row.you ? "is-you" : ""}"><span>#${index + 1}</span><strong>${row.name}</strong><small>${fmt(row.total)} Bucks</small></article>`)
    .join("");
  $("#leaderboardBody").innerHTML = rows
    .map(
      (row, index) =>
        `<tr class="${row.you ? "is-you" : ""}"><td>#${index + 1}</td><td>${row.name}</td><td>${fmt(row.total)}</td><td>${row.crew}</td><td>${row.marks}</td></tr>`,
    )
    .join("");
}

function renderDocs() {
  const raceRows = BALANCE.races
    .map((race) => `<tr><td>${race.name}</td><td>${bonusLine(race.bonuses)}</td><td>Strong against ${getRace(race.strongAgainst).name}</td></tr>`)
    .join("");
  const classRows = BALANCE.classes
    .map((classInfo) => `<tr><td>${classInfo.name}</td><td>${bonusLine(classInfo.bonuses)}</td><td>${classInfo.profile}</td></tr>`)
    .join("");
  const bayRows = BALANCE.bayLevels
    .filter((level) => level.level > 0)
    .map(
      (level) =>
        `<tr><td>${level.level}</td><td>${level.slots}</td><td>${recoveryRateText(level.recoveryPerHour)}</td><td>${level.cost || "Starter"}</td><td>${level.marks}</td></tr>`,
    )
    .join("");
  const trainingRows = BALANCE.trainingModes
    .map((mode) => `<tr><td>${mode.name}</td><td>1 TP</td><td>${fmt(mode.chance * 100)}%</td><td>+${mode.gain}</td><td>${mode.description}</td></tr>`)
    .join("");
  const gearRows = BALANCE.itemRarities
    .map((rarity) => `<tr><td>${rarity.name}</td><td>${rarity.durability}</td><td>${rarity.primary[0]}-${rarity.primary[1]}</td><td>${rarity.sideRolls}</td><td>${rarity.salvageBase}</td></tr>`)
    .join("");
  $("#docsContent").innerHTML = `
    <article class="rules-section">
      <p class="eyebrow">Core loop</p><h3>Cargo, crew, combat, growth</h3>
      <p>Stationed recruits recover Energy in the Crew Bay. The active recruit spends personal Energy opening captured cargo for Space Bucks. Battles award TP, training raises permanent stats, equipment adds stats until it breaks, and tournaments permanently end careers.</p>
      <ol class="rules-steps">
        <li>Open cargo for Space Bucks.</li>
        <li>Hire recruits and assign them to Bay slots.</li>
        <li>Equip one gear item per active recruit.</li>
        <li>Fight career battles for TP and Salvage.</li>
        <li>Train permanent stats, upgrade the Bay, and decide whether to risk tournaments.</li>
      </ol>
    </article>
    <article class="rules-section">
      <p class="eyebrow">Total Energy</p><h3>One display, personal stamina</h3>
      <pre>Recruit Max Energy = 15 + Health
Recovery = Bay rate per second while stationed
Total Energy = sum of stationed recruit Energy</pre>
      <p>Switching never transfers, scales, creates, or deletes Energy. Total Energy is only an aggregate summary.</p>
    </article>
    <article class="rules-section">
      <p class="eyebrow">Daily target</p><h3>Designed around short sessions</h3>
      <p>The balance target is about ${BALANCE.economy.dailyPressTarget} meaningful presses per day once a player has multiple recruits. New players finish the opening loop in roughly ${BALANCE.economy.starterSessionTargetMinutes} minutes, then longer sessions should sit closer to ${BALANCE.economy.longTermSessionTargetMinutes} minutes unless they keep rotating rested recruits.</p>
    </article>
    <article class="rules-section">
      <p class="eyebrow">Bay levels</p><h3>Capacity and recovery</h3>
      <div class="table-wrap"><table><thead><tr><th>Level</th><th>Slots</th><th>Recovery</th><th>Bucks</th><th>Marks</th></tr></thead><tbody>${bayRows}</tbody></table></div>
    </article>
    <article class="rules-section">
      <p class="eyebrow">Cargo math</p><h3>Exact press formulas</h3>
      <pre>Bucks/press = 1 + 0.02 x STR above 10 + 0.02 x SOR above 10
Critical = 5% + 0.5% x DEX above 10 (25% cargo cap)
Energy preserve = 2% + 0.5% x SPI above 10 (15% cap)
Critical payout = 2x and a 50% chance for 1 Salvage</pre>
      <p>Strength and Sorcery both raise payout so physical and magical recruits can be useful cargo workers. Dexterity adds high-roll moments. Spirit makes Energy last longer.</p>
    </article>
    <article class="rules-section">
      <p class="eyebrow">Races</p><h3>Natural tendencies and matchup wheel</h3>
      <div class="table-wrap"><table><thead><tr><th>Race</th><th>Starting stats</th><th>Combat</th></tr></thead><tbody>${raceRows}</tbody></table></div>
    </article>
    <article class="rules-section">
      <p class="eyebrow">Classes</p><h3>Jobs without hidden abilities</h3>
      <div class="table-wrap"><table><thead><tr><th>Class</th><th>Starting stats</th><th>Identity</th></tr></thead><tbody>${classRows}</tbody></table></div>
    </article>
    <article class="rules-section">
      <p class="eyebrow">Combat</p><h3>Universal actions</h3>
      <pre>Maximum HP = 50 + Health x 5
Strike = 8 + Strength x 1.2 - defender Health x 0.3
Cast = 8 + Sorcery x 1.2 - defender Spirit x 0.3
Recover = 5 + Spirit, once below 35% HP
Critical damage = 1.5x
Advantage = 1.10x damage</pre>
      <p>The engine chooses Strike or Cast by comparing their expected damage. Dexterity determines initiative. Every action and modifier appears in the battle feed.</p>
    </article>
    <article class="rules-section">
      <p class="eyebrow">Training</p><h3>Equal average, different risk</h3>
      <p>Light is +1 at 100%, Moderate is +2 at 50%, and Intense is +4 at 25%. Each costs 1 TP and has an expected gain of one point. Failure consumes the TP. Stats have no hard cap.</p>
      <div class="table-wrap"><table><thead><tr><th>Mode</th><th>Cost</th><th>Success</th><th>Gain</th><th>Use</th></tr></thead><tbody>${trainingRows}</tbody></table></div>
    </article>
    <article class="rules-section">
      <p class="eyebrow">Lifecycle</p><h3>Career and tournament</h3>
      <p>Ten career fights each award 1 TP. Tournament entry is optional after fight ten. The tournament has three rounds with 25% HP recovery between wins. A loser becomes Fallen; a winner retires as a Legend and awards one Mark. Both permanently leave play, while equipped gear returns safely.</p>
    </article>
    <article class="rules-section">
      <p class="eyebrow">Gear</p><h3>Durability and Salvage</h3>
      <p>One item can be equipped per recruit. Gear loses 1 durability per ten cargo presses, 2 per career battle, and 8 per tournament. Broken gear gives no stats. Fifty Salvage builds a standard Equipment Crate.</p>
      <div class="table-wrap"><table><thead><tr><th>Rarity</th><th>Durability</th><th>Primary stat</th><th>Side rolls</th><th>Base Salvage</th></tr></thead><tbody>${gearRows}</tbody></table></div>
    </article>
    <article class="rules-section">
      <p class="eyebrow">Art pipeline</p><h3>Recruit sprite sheets</h3>
      <p>Each class sheet is five columns by two rows. Columns are Beast, Magic, Stone, Wood, and Metal. The top row is the opponent combat sprite. The bottom row is the player combat sprite. A horizontally flipped top-row sprite is used for cards, Bay slots, hiring, and the pre-battle idle stage.</p>
      <pre>Source: assets/{Mage,Warrior,Knight,Shaman,Rogue,Archer}.png
Output: assets/recruit-sprites/{class}/{race}-{field,player,opponent}.png
Archer sheet maps to Ranger in game data.</pre>
    </article>
    <article class="rules-section">
      <p class="eyebrow">QA and tuning</p><h3>What to test before art lock</h3>
      <ol class="rules-steps">
        <li>Fresh run tutorial cannot be completed out of order.</li>
        <li>Total Energy never changes from route switches or training screens.</li>
        <li>Every Race and Class combination has a visible transparent sprite.</li>
        <li>Fight history records every turn, reward, race edge, critical, heal, and durability cost.</li>
        <li>Gear repair, dismantle, listing, buying, and Salvage Crates do not duplicate items.</li>
      </ol>
    </article>
    <article class="rules-section">
      <p class="eyebrow">Production readiness</p><h3>What must be real later</h3>
      <p>This static build is a gameplay alpha. Any real marketplace, ETH, jackpot, money-match, minting, or reward claim needs server-authoritative state, anti-bot controls, provable randomness, audit logs, fee disclosures, wallet safety review, contract audits, and legal review before production deployment.</p>
    </article>`;
}

function renderProfile() {
  const ship = getShipEnergy();
  $("#profileStats").innerHTML = [
    ["Space Bucks", fmt(state.bucks, 2)],
    ["Lifetime Bucks", fmt(state.totalBucks, 2)],
    ["Cargo Presses", fmt(state.totalClicks)],
    ["Total Energy", `${fmt(ship.current, 1)} / ${fmt(ship.max)}`],
    ["Bay Level", state.bayLevel],
    ["Active Recruits", state.characters.filter((entry) => entry.state === "active").length],
    ["Marks", state.marks.length],
    ["Salvage", state.salvage],
  ]
    .map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`)
    .join("");
  $("#legendList").innerHTML =
    state.legends
      .map((id) => state.characters.find((character) => character.id === id))
      .filter(Boolean)
      .map((character) => `<p><strong>${escapeHtml(character.name)}</strong><span>${getRace(character.raceId).name} ${getClass(character.classId).name} | ${character.wins}-${character.losses}</span></p>`)
      .join("") || `<p class="body-copy">No retired Legends yet.</p>`;
  $("#fallenList").innerHTML =
    state.fallen
      .map((id) => state.characters.find((character) => character.id === id))
      .filter(Boolean)
      .map((character) => `<p><strong>${escapeHtml(character.name)}</strong><span>${getRace(character.raceId).name} ${getClass(character.classId).name}</span></p>`)
      .join("") || `<p class="body-copy">No Fallen recruits.</p>`;
}

function renderAll() {
  tick();
  renderNav();
  renderPlay();
  renderCharacters();
  renderShop();
  renderLoot();
  renderTraining();
  renderArena();
  renderMarket();
  renderQuests();
  renderLeaderboard();
  renderDocs();
  renderProfile();
  renderTutorial();
}

function animatePress(gain, critical, preserved) {
  const button = $("#pressButton");
  const effects = $("#pressEffects");
  if (!button || !effects) return;
  button.classList.remove("is-pressed");
  void button.offsetWidth;
  button.classList.add("is-pressed");
  setTimeout(() => button.classList.remove("is-pressed"), 150);
  const float = document.createElement("span");
  float.className = `press-float${critical ? " is-lucky" : ""}`;
  float.textContent = `+${fmt(gain, 2)}${critical ? " CRIT" : ""}${preserved ? " FREE" : ""}`;
  effects.appendChild(float);
  setTimeout(() => float.remove(), 1000);
}

function getAudioContext() {
  if (!soundEnabled) return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  audioContext ||= new AudioContextClass();
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

function getMusicTrack() {
  if (!musicTrack) {
    musicTrack = new Audio(MUSIC_SRC);
    musicTrack.loop = true;
    musicTrack.preload = "auto";
    musicTrack.autoplay = true;
    musicTrack.volume = musicVolume;
  }
  return musicTrack;
}

function queueMusicRetry() {
  if (musicRetryBound) return;
  musicRetryBound = true;
  const retry = () => {
    document.removeEventListener("pointerdown", retry, true);
    document.removeEventListener("keydown", retry, true);
    document.removeEventListener("touchstart", retry, true);
    musicRetryBound = false;
    startMusicLoop();
  };
  document.addEventListener("pointerdown", retry, true);
  document.addEventListener("keydown", retry, true);
  document.addEventListener("touchstart", retry, true);
}

function startMusicLoop({ prime = false } = {}) {
  if (!musicEnabled) return;
  const track = getMusicTrack();
  track.volume = musicVolume;
  if (!track.paused && !track.muted) return;
  track.muted = false;
  const attempt = track.play();
  if (!attempt?.catch) return;
  attempt.catch(() => {
    if (!prime) {
      queueMusicRetry();
      return;
    }
    track.muted = true;
    track
      .play()
      .then(() => {
        window.setTimeout(() => {
          if (!musicEnabled) return;
          track.volume = musicVolume;
          track.muted = false;
        }, 250);
      })
      .catch(queueMusicRetry);
  });
}

function stopMusicLoop() {
  if (!musicTrack) return;
  musicTrack.pause();
  musicTrack.muted = false;
}

function playTone(frequency, duration, type = "square", volume = 0.03, delay = 0, endFrequency = null) {
  const context = getAudioContext();
  if (!context) return;
  const start = context.currentTime + delay;
  const adjustedVolume = clamp(volume * SFX_VOLUME_MULTIPLIER, 0.0001, 0.14);
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(adjustedVolume, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function playNoise(duration = 0.08, volume = 0.02, delay = 0, filterFrequency = 600, filterType = "lowpass") {
  const context = getAudioContext();
  if (!context) return;
  const start = context.currentTime + delay;
  const adjustedVolume = clamp(volume * SFX_VOLUME_MULTIPLIER, 0.0001, 0.14);
  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1;
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = buffer;
  filter.type = filterType;
  filter.frequency.setValueAtTime(filterFrequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(adjustedVolume, start + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  source.start(start);
}

function playSfx(name) {
  startMusicLoop();
  if (!soundEnabled) return;
  if (name === "press") {
    playNoise(0.045, 0.028, 0, 160, "lowpass");
    playTone(92, 0.11, "square", 0.032, 0, 58);
    playTone(315, 0.055, "triangle", 0.018, 0.03, 430);
  } else if (name === "lucky") {
    playNoise(0.035, 0.012, 0, 2400, "highpass");
    [520, 740, 980, 1220].forEach((frequency, index) => playTone(frequency, 0.12, "triangle", 0.022, index * 0.045));
  } else if (name === "attack") {
    playTone(620, 0.16, "sawtooth", 0.022, 0, 135);
    playNoise(0.055, 0.018, 0.035, 1200, "bandpass");
  } else if (name === "hit") {
    playNoise(0.075, 0.044, 0, 230, "lowpass");
    playTone(70, 0.18, "square", 0.038, 0.01, 42);
  } else if (name === "failure") {
    playTone(180, 0.12, "sawtooth", 0.024, 0, 120);
    playTone(88, 0.13, "square", 0.025, 0.1, 54);
  } else if (name === "blocked") {
    playTone(112, 0.07, "sawtooth", 0.022);
    playTone(112, 0.07, "sawtooth", 0.022, 0.12);
  } else if (name === "training") {
    playTone(330, 0.08, "triangle", 0.018, 0, 440);
    playTone(550, 0.1, "triangle", 0.018, 0.07, 760);
    playTone(880, 0.14, "square", 0.017, 0.15);
  } else if (name === "salvage") {
    playNoise(0.24, 0.022, 0, 420, "bandpass");
    [130, 180, 240, 170].forEach((frequency, index) => playTone(frequency, 0.045, "square", 0.018, index * 0.045));
  } else if (name === "victory" || name === "unlock") {
    playNoise(0.05, 0.012, 0, 1800, "highpass");
    [392, 523, 659, 784].forEach((frequency, index) => playTone(frequency, 0.16, "triangle", 0.024, index * 0.07));
  } else if (name === "purchase") {
    playTone(260, 0.055, "square", 0.019);
    playTone(390, 0.06, "square", 0.019, 0.055);
    playTone(520, 0.08, "triangle", 0.018, 0.11);
  } else if (name === "confirm") {
    playTone(430, 0.075, "triangle", 0.017, 0, 650);
  } else if (name === "recover") {
    playTone(250, 0.12, "sine", 0.018, 0, 360);
    playTone(500, 0.18, "triangle", 0.016, 0.08, 700);
  } else if (name === "panel") {
    playNoise(0.06, 0.014, 0, 520, "bandpass");
    playTone(180, 0.05, "square", 0.012, 0.03, 240);
  } else if (name === "toggle") {
    playTone(310, 0.045, "square", 0.014);
    playTone(240, 0.045, "square", 0.014, 0.055);
  } else if (name === "navigate") {
    playTone(220, 0.035, "square", 0.01);
    playTone(330, 0.035, "triangle", 0.008, 0.025);
  }
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem("cyclops-button-sound", soundEnabled ? "on" : "off");
  renderSoundButton();
  if (soundEnabled) playSfx("confirm");
}

function renderSoundButton() {
  const button = $("#soundToggle");
  if (!button) return;
  button.textContent = soundEnabled ? "Sound" : "Muted";
  button.setAttribute("aria-pressed", String(soundEnabled));
}

function toggleMusic() {
  musicEnabled = !musicEnabled;
  localStorage.setItem("cyclops-button-music", musicEnabled ? "on" : "off");
  renderMusicButton();
  if (musicEnabled) {
    startMusicLoop({ prime: true });
    playSfx("confirm");
  } else {
    stopMusicLoop();
    playSfx("toggle");
  }
}

function renderMusicButton() {
  const button = $("#musicToggle");
  if (!button) return;
  button.textContent = musicEnabled ? "Music" : "Music Off";
  button.setAttribute("aria-pressed", String(musicEnabled));
  renderMusicVolumeControl();
}

function renderMusicVolumeControl() {
  const input = $("#musicVolume");
  const output = $("#musicVolumeValue");
  const wrap = input?.closest(".music-volume-control");
  const percent = Math.round(musicVolume * 100);
  if (input) {
    input.value = String(percent);
    input.disabled = !musicEnabled;
    input.setAttribute("aria-valuetext", `${percent}%`);
  }
  if (output) output.textContent = `${percent}%`;
  if (wrap) wrap.classList.toggle("is-muted", !musicEnabled);
}

function setMusicVolume(value) {
  const percent = clamp(Number(value) || Math.round(DEFAULT_MUSIC_VOLUME * 100), Math.round(MIN_MUSIC_VOLUME * 100), Math.round(MAX_MUSIC_VOLUME * 100));
  musicVolume = percent / 100;
  localStorage.setItem("cyclops-button-music-volume", String(percent));
  if (musicTrack) musicTrack.volume = musicVolume;
  renderMusicVolumeControl();
  if (musicEnabled && musicVolume > 0) startMusicLoop({ prime: true });
}

function closeModal() {
  $("#modalRoot").classList.add("hidden");
  $("#modalRoot").innerHTML = "";
  playSfx("confirm");
}

function openRulesModal() {
  const root = $("#modalRoot");
  root.innerHTML = `
    <div class="modal-card quick-rules">
      <p class="eyebrow">Five things to remember</p>
      <h2>How the ship works</h2>
      <ol>
        <li>Every recruit owns personal Energy.</li>
        <li>Total Energy is the combined total of stationed recruits.</li>
        <li>The Bay controls how many recruits recover simultaneously.</li>
        <li>Race + Class + rarity + training + gear produce final stats.</li>
        <li>Ten career fights lead to an optional permanent tournament.</li>
      </ol>
      <button class="button primary full" data-action="close-modal">Close</button>
    </div>`;
  root.classList.remove("hidden");
  playSfx("panel");
}

function exportSave() {
  const payload = JSON.stringify({ ...state, battleScene: null }, null, 2);
  const showExportText = () => {
    const root = $("#modalRoot");
    root.innerHTML = `
      <div class="modal-card dev-panel">
        <p class="eyebrow">Save export</p>
        <h2>Local Save JSON</h2>
        <textarea class="save-textarea" readonly>${escapeHtml(payload)}</textarea>
        <div class="panel-actions">
          <button class="button" data-action="open-dev">Back</button>
          <button class="button primary" data-action="close-modal">Close</button>
        </div>
      </div>`;
    root.classList.remove("hidden");
  };
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(payload).then(
      () => showToast("Save JSON copied to clipboard."),
      showExportText,
    );
  } else {
    showExportText();
  }
}

function importSave() {
  const payload = window.prompt("Paste Cyclops Space Pirates save JSON:");
  if (!payload) return;
  try {
    const imported = JSON.parse(payload);
    state = normalizeState(imported);
    saveState();
    closeModal();
    routeTo("play");
    renderAll();
    showToast("Save imported.");
  } catch {
    showToast("Import failed. The JSON was not a valid save.");
  }
}

function completeTutorialDev() {
  if (!state.characters.length) {
    state.bucks = Math.max(state.bucks, BALANCE.tutorial.firstRecruitCost);
    const recruit = createCharacter({ fullEnergy: true });
    state.characters.unshift(recruit);
  }
  if (state.bayLevel < 2) state.bayLevel = 2;
  const level = getBayLevel();
  let slotIndex = 0;
  state.characters.forEach((character) => {
    if (character.state !== "active" || slotIndex >= level.slots) return;
    character.baySlot = slotIndex;
    character.energy = Math.max(character.energy, Math.ceil(getMaxEnergy(character) * 0.5));
    slotIndex += 1;
  });
  state.activeCharacterId = state.characters.find((character) => character.state === "active" && character.baySlot !== null)?.id || null;
  if (!state.starterCrateOpened) {
    state.inventory.unshift(createItem({ rarity: "common" }));
    state.starterCrateOpened = true;
  }
  state.tutorialStage = BALANCE.tutorial.completedStage;
  state.firstVoyagePaid = true;
  saveState();
  closeModal();
  routeTo("play");
  renderAll();
  showToast("Tutorial completed for local testing.");
}

function seedContentDev() {
  if (state.bayLevel < 3) state.bayLevel = 3;
  BALANCE.races.forEach((race, index) => {
    const classInfo = BALANCE.classes[index % BALANCE.classes.length];
    state.characters.unshift(createCharacter({ raceId: race.id, classId: classInfo.id, rarity: index === 0 ? "rare" : "common", fullEnergy: true }));
  });
  BALANCE.classes.slice(0, 4).forEach((classInfo, index) => {
    const race = BALANCE.races[(index + 2) % BALANCE.races.length];
    state.characters.unshift(createCharacter({ raceId: race.id, classId: classInfo.id, rarity: index === 0 ? "epic" : "uncommon", fullEnergy: true }));
  });
  BALANCE.itemTypes.forEach((type, index) => {
    state.inventory.unshift(createItem({ typeId: type.id, rarity: index === 0 ? "rare" : "uncommon" }));
  });
  state.starterCrateOpened = true;
  const level = getBayLevel();
  state.characters.forEach((character) => {
    character.baySlot = null;
  });
  state.characters
    .filter((character) => character.state === "active")
    .slice(0, level.slots)
    .forEach((character, index) => {
      character.baySlot = index;
      character.energy = getMaxEnergy(character);
      if (index === 0) state.activeCharacterId = character.id;
    });
  state.marketListings = createMarketListings(12);
  state.tutorialStage = BALANCE.tutorial.completedStage;
  saveState();
  closeModal();
  routeTo("characters");
  renderAll();
  showToast("Seeded test crew, gear, and market listings.");
}

function openDevPanel() {
  const root = $("#modalRoot");
  root.innerHTML = `
    <div class="modal-card dev-panel">
      <p class="eyebrow">Local testing</p>
      <h2>Developer Controls</h2>
      <div class="dev-grid">
        <button class="button" data-action="dev-bucks">+1,000 Bucks</button>
        <button class="button" data-action="dev-energy">Fill Bay Energy</button>
        <button class="button" data-action="dev-tp">+10 TP</button>
        <button class="button" data-action="dev-salvage">+50 Salvage</button>
        <button class="button" data-action="dev-recruit">Add Bay Recruit</button>
        <button class="button" data-action="dev-career">Career to 10</button>
        <button class="button" data-action="dev-mark">+1 Mark</button>
        <button class="button" data-action="dev-tutorial">Advance Tutorial</button>
        <button class="button" data-action="dev-complete-tutorial">Complete Tutorial</button>
        <button class="button" data-action="dev-seed-content">Seed Test Content</button>
        <button class="button" data-action="dev-export">Export Save</button>
        <button class="button" data-action="dev-import">Import Save</button>
      </div>
      <p>Stage ${state.tutorialStage}/${BALANCE.tutorial.completedStage} | State key: ${STORAGE_KEY}</p>
      <div class="panel-actions">
        <button class="button danger" data-action="reset-run">Reset Run</button>
        <button class="button primary" data-action="close-modal">Close</button>
      </div>
    </div>`;
  root.classList.remove("hidden");
  playSfx("panel");
}

function resetRun() {
  clearTimeout(battleTimer);
  state = normalizeState(createDefaultState());
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  closeModal();
  routeTo("play");
  renderAll();
  showToast("Fresh captain run started.");
}

function advanceTutorialDev() {
  if (state.tutorialStage === 0) {
    state.tutorialEnergy = 0;
    state.bucks = Math.max(state.bucks, 10);
    state.tutorialStage = 1;
  } else if (state.tutorialStage === 1) {
    state.bucks = Math.max(state.bucks, getHireCost());
    hireRecruit();
    return;
  } else if (state.tutorialStage === 2) {
    assignToBay(state.characters[0]?.id);
    return;
  } else if (state.tutorialStage === 3) {
    state.bucks = Math.max(state.bucks, 20);
    state.tutorialStage = 4;
  } else if (state.tutorialStage === 4) {
    state.bucks = Math.max(state.bucks, 20);
    openStarterCrate();
    return;
  } else if (state.tutorialStage === 5) {
    const item = state.inventory.find((entry) => !entry.tutorialBroken);
    if (item) equipItem(item.id);
    return;
  } else if (state.tutorialStage === 6) {
    const item = state.inventory.find((entry) => entry.tutorialBroken);
    if (item) dismantleItem(item.id);
    return;
  } else if (state.tutorialStage === 7) {
    const active = getActiveCharacter();
    if (active) {
      active.trainingPoints += 1;
      active.careerFights += 1;
      state.tutorialStage = 8;
    }
  } else if (state.tutorialStage === 8) {
    const active = getActiveCharacter();
    if (active) {
      active.trainingPoints = Math.max(1, active.trainingPoints);
      trainCharacter("health", "light");
      return;
    }
  } else if (state.tutorialStage === 9) {
    state.bucks = Math.max(state.bucks, getBayLevel(2).cost);
    upgradeBay();
    return;
  } else if (state.tutorialStage === 10) {
    state.bucks = Math.max(state.bucks, getHireCost());
    hireRecruit();
    return;
  } else if (state.tutorialStage === 11) {
    const recruit = state.characters.find((entry) => entry.state === "active" && entry.baySlot === null);
    if (recruit) {
      assignToBay(recruit.id);
      return;
    } else {
      state.tutorialStage = 10;
    }
  }
  saveState();
  closeModal();
  renderAll();
}

function handleAction(action, element) {
  if (!tutorialActionAllowed(action, element)) {
    showTutorialBlockedMessage();
    return;
  }
  const id = element.dataset.id;
  if (action === "press") pressCargo();
  else if (action === "hire-recruit") hireRecruit();
  else if (action === "assign-bay") assignToBay(id);
  else if (action === "remove-bay") removeFromBay(id);
  else if (action === "select-character") selectCharacter(id);
  else if (action === "upgrade-bay") upgradeBay();
  else if (action === "open-starter") openStarterCrate();
  else if (action === "open-standard") openStandardCrate("bucks");
  else if (action === "open-salvage") openStandardCrate("salvage");
  else if (action === "equip-item") equipItem(id);
  else if (action === "unequip-item") unequipItem(id);
  else if (action === "repair-item") repairItem(id);
  else if (action === "open-dismantle") openDismantleConfirmation(id);
  else if (action === "confirm-dismantle") dismantleItem(id);
  else if (action === "list-item") listItem(id, element.dataset.currency);
  else if (action === "cancel-listing") cancelListing(id);
  else if (action === "buy-listing") buyListing(id);
  else if (action === "settle-market") settleMarket();
  else if (action === "fight-duel") fightDuel(false);
  else if (action === "practice-battle") fightDuel(true);
  else if (action === "open-tournament") openTournamentConfirmation();
  else if (action === "confirm-tournament") runTournament();
  else if (action === "train-stat") trainCharacter(element.dataset.stat, element.dataset.mode);
  else if (action === "claim-quest") claimQuest(id);
  else if (action === "open-rules") openRulesModal();
  else if (action === "open-dev") openDevPanel();
  else if (action === "close-modal") closeModal();
  else if (action === "reset-run") resetRun();
  else if (action === "dev-bucks") {
    state.bucks += 1000;
    state.totalBucks += 1000;
    saveState();
    closeModal();
    renderAll();
  } else if (action === "dev-energy") {
    state.characters.forEach((character) => {
      if (character.state === "active" && character.baySlot !== null) character.energy = getMaxEnergy(character);
    });
    saveState();
    closeModal();
    renderAll();
  } else if (action === "dev-tp") {
    const active = getActiveCharacter();
    if (active) active.trainingPoints += 10;
    saveState();
    closeModal();
    renderAll();
  } else if (action === "dev-salvage") {
    state.salvage += 50;
    saveState();
    closeModal();
    renderAll();
  } else if (action === "dev-recruit") {
    if (state.bayLevel === 0) state.bayLevel = 1;
    const level = getBayLevel();
    const occupied = new Set(
      state.characters
        .filter((character) => character.state === "active" && character.baySlot !== null)
        .map((character) => character.baySlot),
    );
    const slot = Array.from({ length: level.slots }, (_, index) => index).find((index) => !occupied.has(index));
    const recruit = createCharacter({ fullEnergy: true });
    if (slot !== undefined) {
      recruit.baySlot = slot;
      state.activeCharacterId = recruit.id;
    }
    state.characters.unshift(recruit);
    saveState();
    closeModal();
    renderAll();
  } else if (action === "dev-career") {
    const active = getActiveCharacter();
    if (active) {
      active.careerFights = BALANCE.combat.maxCareerFights;
      active.trainingPoints = Math.max(active.trainingPoints, BALANCE.combat.maxCareerFights);
    }
    saveState();
    closeModal();
    renderAll();
  } else if (action === "dev-mark") {
    state.marks.push({ id: uid("mark"), name: `Test Mark ${state.marks.length + 1}`, earnedAt: Date.now(), test: true });
    saveState();
    closeModal();
    renderAll();
  } else if (action === "dev-tutorial") {
    advanceTutorialDev();
  } else if (action === "dev-complete-tutorial") {
    completeTutorialDev();
  } else if (action === "dev-seed-content") {
    seedContentDev();
  } else if (action === "dev-export") {
    exportSave();
  } else if (action === "dev-import") {
    importSave();
  }
}

function initEvents() {
  document.addEventListener("click", (event) => {
    const routeLink = event.target.closest("[data-route-link]");
    if (routeLink) {
      event.preventDefault();
      routeTo(routeLink.dataset.routeLink);
      return;
    }
    const action = event.target.closest("[data-action]");
    if (action) {
      event.preventDefault();
      handleAction(action.dataset.action, action);
    }
  });

  $("#navToggle").addEventListener("click", () => {
    const open = $("#topNav").classList.toggle("is-open");
    $("#navToggle").setAttribute("aria-expanded", String(open));
    playSfx("panel");
  });
  $("#moreToggle").addEventListener("click", (event) => {
    event.stopPropagation();
    const open = $("#moreNav").classList.toggle("is-open");
    $("#moreToggle").setAttribute("aria-expanded", String(open));
    playSfx("panel");
  });
  $("#soundToggle").addEventListener("click", toggleSound);
  $("#musicToggle").addEventListener("click", toggleMusic);
  $("#musicVolume").addEventListener("input", (event) => setMusicVolume(event.target.value));
  $("#musicVolume").addEventListener("change", () => playSfx("toggle"));
  window.addEventListener("hashchange", () => routeTo(location.hash.slice(1) || "play", false));
  $("#modalRoot").addEventListener("click", (event) => {
    if (event.target === $("#modalRoot")) closeModal();
  });
}

function boot() {
  state = loadState();
  tick();
  buildShell();
  document.documentElement.dataset.theme = "dark";
  renderSoundButton();
  renderMusicButton();
  startMusicLoop({ prime: true });
  initEvents();
  const requestedRoute = location.hash.slice(1) || "play";
  currentRoute = featureUnlocked(routeFeature(requestedRoute)) && tutorialRouteAllowed(requestedRoute) ? requestedRoute : "play";
  routeTo(currentRoute, true);
  renderAll();
  setInterval(() => {
    tick();
    if (currentRoute === "play" || currentRoute === "characters" || currentRoute === "profile") {
      renderPlay();
      renderCharacters();
      renderProfile();
      renderTutorial();
    }
    saveState();
  }, 5000);
}

boot();
