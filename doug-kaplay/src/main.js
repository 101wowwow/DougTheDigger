import kaplay from "kaplay";
import player from "./player.js";
import enemy from "./enemy.js";
import generateMap, { WALL } from "./mapGen.js";
import LEVELS from "./levels.js";

const TILE_SIZE = 32;
const MAP_COLS = 60;
const MAP_ROWS = 45;

const k = kaplay({
	background: [85, 65, 45],
});

k.loadRoot("./");
k.loadSprite("bean", "sprites/bean.png");

k.scene("home", () => {
	k.camPos(k.center());

	k.add([
		k.text("DOUG THE DIGGER", { size: 48 }),
		k.pos(k.center().x, k.center().y - 100),
		k.anchor("center"),
		k.color(255, 220, 150),
	]);

	k.add([
		k.text("You are Doug, The Digger. \nA mole, Beneath The Surface, The Underground. \nNaturally, you seek the Surface, as your ancestors have done for eons. \nUnfortunately for you, there was a disaster ages ago that has left the path to the surface leaden with perils - and it is unknown if the wonderful Surface still exists how folklore told it... \nYour task, battle your way to the surface. ", { size: 16, width: 500 }),
		k.pos(k.center().x, k.center().y),
		k.anchor("center"),
		k.color(200, 200, 200),
	]);

	const btn = k.add([
		k.text("START", { size: 32 }),
		k.pos(k.center().x, k.center().y + 100),
		k.anchor("center"),
		k.color(100, 255, 100),
		k.area(),
	]);

	btn.onClick(() => k.go("game", 0));

	k.onKeyPress("space", () => {
		k.go("game", 0);
	});
});

k.scene("game", (levelIdx) => {
	const levelDef = LEVELS[levelIdx];
	const { grid, rooms, playerStart } = generateMap(MAP_COLS, MAP_ROWS);

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

	const enemiesToSpawn = [];
	for (const entry of levelDef.enemies) {
		for (let n = 0; n < entry.count; n++) {
			enemiesToSpawn.push(entry.type);
		}
	}

	const availableRooms = rooms.slice(1);
	for (let i = 0; i < enemiesToSpawn.length; i++) {
		const room = availableRooms[i % availableRooms.length];
		const type = enemiesToSpawn[i];

		k.add([
			k.pos(
				room.cx * TILE_SIZE + TILE_SIZE / 2,
				room.cy * TILE_SIZE + TILE_SIZE / 2,
			),
			k.sprite("bean"),
			k.scale(0.28),
			k.anchor("center"),
			k.area(),
			k.color(type.tint[0], type.tint[1], type.tint[2]),
			enemy(k, bean, grid, TILE_SIZE, type),
			"enemy",
		]);
	}

	// Level label
	k.add([
		k.text(levelDef.name, { size: 16 }),
		k.pos(10, 10),
		k.color(255, 220, 150),
		k.fixed(),
		k.z(100),
	]);

	bean.onUpdate(() => {
		k.camPos(bean.pos);
	});

	k.onKeyPress("space", () => {
		bean.attack();
	});

	// Check if all enemies are dead → advance or win
	let levelCleared = false;
	k.onUpdate(() => {
		if (levelCleared) return;
		if (k.get("enemy").length === 0) {
			levelCleared = true;
			if (levelIdx + 1 < LEVELS.length) {
				k.go("game", levelIdx + 1);
			} else {
				k.go("win");
			}
		}
	});

	bean.on("death", () => {
		k.go("gameover");
	});
});

k.scene("win", () => {
	k.camPos(k.center());

	k.add([
		k.text("YOU WIN!", { size: 48 }),
		k.pos(k.center().x, k.center().y - 40),
		k.anchor("center"),
		k.color(100, 255, 100),
	]);

	k.add([
		k.text("Press B to re-begin the game...", { size: 20 }),
		k.pos(k.center().x, k.center().y + 30),
		k.anchor("center"),
		k.color(200, 200, 2),
	]);

	k.onKeyPress("B", () => {
		k.go("home");
	});
});

k.scene("gameover", () => {
	k.camPos(k.center());

	k.add([
		k.text("GAME OVER", { size: 48 }),
		k.pos(k.center().x, k.center().y - 40),
		k.anchor("center"),
		k.color(255, 50, 50),
	]);

	k.add([
		k.text("Press SPACE to try again", { size: 20 }),
		k.pos(k.center().x, k.center().y + 30),
		k.anchor("center"),
		k.color(255, 50, 50),
	]);

	k.onKeyPress("space", () => {
		k.go("game", 0);
	});
});

k.go("home");
