import { ENEMY_TYPES } from "./enemy.js";

// Each level defines which enemies to spawn.
// `type`  — key from ENEMY_TYPES
// `count` — how many of that type to place
const LEVELS = [
	{
		name: "Level 1",
		enemies: [
			{ type: ENEMY_TYPES.red, count: 2 },
		],
	},
	{
		name: "Level 2",
		enemies: [
			{ type: ENEMY_TYPES.red, count: 3 },
			{ type: ENEMY_TYPES.black, count: 1 },
		],
	},
	{
		name: "Level 3",
		enemies: [
			{ type: ENEMY_TYPES.red, count: 2 },
			{ type: ENEMY_TYPES.black, count: 3 },
		],
	},
	{
		name: "Level 4",
		enemies: [
			{ type: ENEMY_TYPES.red, count: 4 },
			{ type: ENEMY_TYPES.black, count: 4 },
		],
	},
	{
		name: "Level 5",
		enemies: [
			{ type: ENEMY_TYPES.red, count: 5 },
			{ type: ENEMY_TYPES.black, count: 5 },
		],
	},
];

export default LEVELS;
