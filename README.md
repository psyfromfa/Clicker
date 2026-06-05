# Cyclops Button

Cyclops Button is a playable alpha for a character clicker and autobattler economy.

## Current Systems

- Starter Eggs and purchasable Eggs hatch random Characters.
- Characters have loadout, race, class, rarity, traits, trainable stats, lifecycle state, and one loot slot.
- Button pressing uses the active Character's energy, extraction, regen, lucky signal chance, and equipped loot.
- Loot crates roll one item with a fixed category primary stat, random combat side rolls, rarity, durability, repair cost, scrap value, and market value.
- Training has its own page where Characters spend Duel-earned TP on HP, Violence, Power, or Harmony.
- Loot has its own inventory page for equipping, repairing, listing, and scrapping items.
- Fights 1-10 are safe Duels with a basic action-event battle stage; fight 11 enters the tournament where one Character survives and earns the Mark.
- Marketplace simulation supports shard and ETH listings, buy actions, cancel actions, and buyer-demand settlement.
- Shards are used for Eggs, loot crates, repairs, upgrades, bay levels, rerolls, and marketplace activity.

## Production Notes

- Wallet and contract actions are intentionally audit-gated in the alpha.
- Economy numbers are local and tunable before deployment.
- Marketplace ETH is simulated for UX and balance planning.
- Operator identity, final terms, audits, and deployment addresses should be public before production wallet flows ship.

Open `index.html` directly or serve the folder locally. Progress is stored in `localStorage`.
