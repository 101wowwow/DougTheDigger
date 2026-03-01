import { ENEMY_TYPES } from "./enemy.js";

// Each level defines which enemies to spawn.
// `type`  — key from ENEMY_TYPES
// `count` — how many of that type to place
const LEVELS = [
	{
		name: "Level 1",
		description: "Level 1. You battle Red Enemies(RELACES THIS AAA). Slow, but medium strength.",
		enemies: [
			{ type: ENEMY_TYPES.red, count: 3 },
			
		],
	},
	{
		name: "Level 2",
		description: "spider enemies are fast - beware",
		enemies: [
			{ type: ENEMY_TYPES.red, count: 1 },
			// { type: ENEMY_TYPES.black, count: 3 },
			{ type: ENEMY_TYPES.spider, count: 3 },
			
		],
	},
	{
		name: "Level 3",
		description: "More enemies yadda yadda.... SPIDERS AAAAA",
		enemies: [
			{ type: ENEMY_TYPES.red, count: 2 },
			// { type: ENEMY_TYPES.black, count: 2 },
			{ type: ENEMY_TYPES.spider, count: 3 },
		],
	},
	{
		name: "Level 4",
		description: "more fnny stuff aaa",
		enemies: [
			{ type: ENEMY_TYPES.red, count: 4 },
			// { type: ENEMY_TYPES.black, count: 4 },
			{ type: ENEMY_TYPES.spider, count: 3 },
		],
	},
	{
		name: "Level 5",
		description: "level 5 aaaaaafdsgfdsfa",
		enemies: [
			{ type: ENEMY_TYPES.red, count: 5 },
			// { type: ENEMY_TYPES.black, count: 5 },
			{ type: ENEMY_TYPES.spider, count: 5 },
		],
	},
];

export default LEVELS;
