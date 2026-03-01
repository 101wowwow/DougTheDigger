import { ENEMY_TYPES } from "./enemy.js";

// Each level defines which enemies to spawn.
// `type`  — key from ENEMY_TYPES
// `count` — how many of that type to place
const LEVELS = [

	{
		name: "Level 1",
		description: "Level 1. You battle Red Soldiers, remains of the War, now 'resting' below the surface. \n Slow, but medium strength. Or, so you think. \nYou'll have to hunt down the enemies, before they hunt you down. Use the terrain to your advantage - make them get stuck before the end. Defeat all the enemies - then head Up towards the Surface, to find the Gateway. The Gateway is gray when inactivated, and purple when you can use it to teleport to the next level.\nArrow Keys to move, space to attack",
		enemies: [
			{ type: ENEMY_TYPES.red, count: 4 },
		],
	},
	{
		name: "Level 2",
		description: "Level 2. There are Cowardly Soldiers too. You must hunt them down - they won't come for you unless you are close... ",
		enemies: [
			{ type: ENEMY_TYPES.red, count: 2 },
			{ type: ENEMY_TYPES.coward, count: 4 },
		],
	},
	{
		name: "Level 3",
		description: "Steampunk Spiders are fast - beware. Spam space to kill them, please.",
		enemies: [
			{ type: ENEMY_TYPES.red, count: 2 },
			// { type: ENEMY_TYPES.black, count: 3 },
			{ type: ENEMY_TYPES.spider, count: 3 },
			{ type: ENEMY_TYPES.coward, count: 1 },
			
		],
	},
	{
		name: "Level 4",
		description: "And you thought spiders were fast? Phaser Drones - those that fought and survived the horrible nuclear Global War, have now decided... Doug is their enemy. Oh, the scarier part? They pass through walls.",
		enemies: [
			{ type: ENEMY_TYPES.red, count: 1 },
			// { type: ENEMY_TYPES.black, count: 2 },
			{ type: ENEMY_TYPES.spider, count: 1 },
			{ type: ENEMY_TYPES.phaser, count: 2 },
			{ type: ENEMY_TYPES.coward, count: 1 },

		],
	},
	{
		name: "Level 5",
		description: "Everything, Red Soldiers, Cowardly Soldiers, Steampunk Spiders, Phaser Drones.. oh dear",
		enemies: [
			{ type: ENEMY_TYPES.red, count: 4 },
			// { type: ENEMY_TYPES.black, count: 4 },
			{ type: ENEMY_TYPES.spider, count: 3 },
			{ type: ENEMY_TYPES.phaser, count: 2 },
			{ type: ENEMY_TYPES.coward, count: 1 },
		],
	},
	{
		name: "Level 6 — BOSS",
		description: "Help, there is  a GIANT gigaspider! Uh oh",
		isBossLevel: true,
		enemies: [
			{ type: ENEMY_TYPES.gigaSpider, count: 1 },
			{ type: ENEMY_TYPES.spider, count: 1 },
			{ type: ENEMY_TYPES.phaser, count: 2 },
		],
	},
];

export default LEVELS;
