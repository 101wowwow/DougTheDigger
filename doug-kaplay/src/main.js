import kaplay from "kaplay";
import player from "./player.js";
import enemy, { ENEMY_TYPES } from "./enemy.js";
import generateMap, { WALL } from "./mapGen.js";

const TILE_SIZE = 32;
const MAP_COLS = 60;
const MAP_ROWS = 45;

const k = kaplay({
	background: [85, 65, 45], // lighter brown — visible floor color
});

k.loadRoot("./");
k.loadSprite("bean", "sprites/bean.png");

k.scene("game", () => {
	const { grid, rooms, playerStart } = generateMap(MAP_COLS, MAP_ROWS);

	// Render wall tiles as dark brown rectangles (darker than the floor background)
	for (let y = 0; y < MAP_ROWS; y++) {
		for (let x = 0; x < MAP_COLS; x++) {
			if (grid[y][x] === WALL) {
				k.add([
					k.pos(x * TILE_SIZE, y * TILE_SIZE),
					k.rect(TILE_SIZE, TILE_SIZE),
					k.color(40, 28, 18),
					"wall",
				]);
			}
		}
	}

	// Player spawns at the center of the first room
	const bean = k.add([
		k.pos(
			playerStart.x * TILE_SIZE + TILE_SIZE / 2,
			playerStart.y * TILE_SIZE + TILE_SIZE / 2,
		),
		k.sprite("bean"),
		k.scale(0.28),
		k.anchor("center"),
		k.area(),
		player(k, grid, TILE_SIZE),
	]);

	// One enemy per room (skip room 0 — that's the player's starting room)
	for (let i = 1; i < rooms.length; i++) {
		const room = rooms[i];
		const cx = room.cx;
		const cy = room.cy;

		const type = i % 2 === 0 ? ENEMY_TYPES.black : ENEMY_TYPES.red;

		k.add([
			k.pos(
				cx * TILE_SIZE + TILE_SIZE / 2,
				cy * TILE_SIZE + TILE_SIZE / 2,
			),
			k.sprite("bean"),
			k.scale(0.28),
			k.anchor("center"),
			k.area(),
			k.color(type.tint[0], type.tint[1], type.tint[2]),
			enemy(k, bean, grid, TILE_SIZE, type),
		]);
	}

	// Camera follows the player every frame
	bean.onUpdate(() => {
		k.camPos(bean.pos);
	});

	k.onKeyPress("space", () => {
		bean.attack();
	});

	bean.on("death", () => {
		k.go("gameover");
	});
});

k.scene("gameover", () => {
	k.camPos(k.center()); // reset camera so text is centered on screen

	k.add([
		k.text("GAME OVER", { size: 48 }),
		k.pos(k.center().x, k.center().y - 40),
		k.anchor("center"),
		k.color(255, 50, 50),
	]);

	k.add([
		k.text("Press SPACE to restart", { size: 20 }),
		k.pos(k.center().x, k.center().y + 30),
		k.anchor("center"),
		k.color(255, 50, 50),
	]);

	k.onKeyPress("space", () => {
		k.go("game");
	});
});

k.go("game");
