import kaplay from "kaplay";
import player from "./player.js";
import enemy, { ENEMY_TYPES } from "./enemy.js";
import generateMap, { WALL } from "./mapGen.js";
import LEVELS from "./levels.js";
import scrollingText from "./scrollingText.js";
import createNotifications from "./notifications.js";

const TILE_SIZE = 16;
const MAP_COLS = 120;
const MAP_ROWS = 90;

const k = kaplay({
	background: [85, 65, 45],
	font: "scientifica", // yup thanks
});

k.loadRoot("./");
k.loadFont("scientifica", "fonts/scientifica.ttf");
k.loadSprite("bean", "sprites/bean.png");
k.loadSprite("spider", "sprites/spider.png");
k.loadSprite("goofybigtext", "sprites/eviltextbadtest.png")
k.loadSprite("doug", "sprites/doug.png")

k.scene("home", () => {
	k.camPos(k.center());

	k.add([
		k.text("DOUG THE DIGGER", { size: 48 }),
		k.pos(k.center().x, k.center().y - 120),
		k.anchor("center"),
		k.color(255, 220, 150),
	]);
	const DougDemo = k.add([
		k.pos(k.center().x - 120, k.center().y + 20),
		k.sprite("doug"),
		k.scale(0.30),
		k.anchor("center"),
	]);

	const SpiderDemo = k.add([
		k.pos(k.center().x + 120, k.center().y + 20),
		k.sprite("spider"),
		k.scale(1),
		k.anchor("center"),
	]);

	const storyText = k.add([
		k.text("", { size: 16, width: 500 }),
		k.pos(k.center().x, k.center().y),
		k.anchor("center"),
		k.color(255, 255, 255),
		scrollingText(k, {
			text: "You are Doug, The Digger. \nA mole, Beneath The Surface, The Underground. \nNaturally, you seek the Surface, as your ancestors have done for eons. \nUnfortunately for you, there was a disaster ages ago that has left the path to the surface leaden with perils - and it is unknown if the wonderful Surface still exists how folklore told it... \nYour task, battle your way to the surface. \nEnter to start. Arrow keys for navigation, space to attack",
			speed: 40,
		}),
	]);

	const btn = k.add([
		k.text("START", { size: 32 }),
		k.pos(k.center().x, k.center().y + 100),
		k.anchor("center"),
		k.color(100, 255, 100),
		k.area(),
	]);

	btn.onClick(() => k.go("levelintro", 0));

	k.onKeyPress("enter", () => {
		k.go("levelintro", 0);
	});

	// Debug level select
	const debugLabel = k.add([
		k.text("DEBUG: Jump to level", { size: 14 }),
		k.pos(k.center().x, k.height() - 80),
		k.anchor("center"),
		k.color(150, 150, 150),
	]);

	for (let i = 0; i < LEVELS.length; i++) {
		const lvlBtn = k.add([
			k.text(`${i + 1}`, { size: 20 }),
			k.pos(k.center().x - ((LEVELS.length - 1) * 20) + i * 40, k.height() - 50),
			k.anchor("center"),
			k.color(255, 200, 100),
			k.area(),
		]);
		lvlBtn.onClick(() => k.go("levelintro", i));
	}
});

k.scene("levelintro", (levelIdx) => {
	const levelDef = LEVELS[levelIdx];
	k.camPos(k.center());

	k.add([
		k.text(levelDef.name, { size: 48 }),
		k.pos(k.center().x, k.center().y - 60),
		k.anchor("center"),
		k.color(255, 220, 150),
	]);

	if (levelDef.description) {
		k.add([
			k.text("", { size: 18, width: 500 }),
			k.pos(k.center().x, k.center().y + 10),
			k.anchor("center"),
			k.color(200, 200, 200),
			scrollingText(k, {
				text: levelDef.description,
				speed: 35,
			}),
		]);
	}

	k.add([
		k.text("Press ENTER to begin | SPACE to attack", { size: 16 }),
		k.pos(k.center().x, k.center().y + 100),
		k.anchor("center"),
		k.color(150, 150, 150),
	]);

	k.onKeyPress("enter", () => {
		k.go("game", levelIdx);
	});
});

k.scene("game", (levelIdx) => {
	const levelDef = LEVELS[levelIdx];
	const { grid, rooms, playerStart, gatewayStart } = generateMap(MAP_COLS, MAP_ROWS);

	// Pre-render all walls into a single background image for performance
	const wallCanvas = document.createElement("canvas");
	wallCanvas.width = MAP_COLS * TILE_SIZE;
	wallCanvas.height = MAP_ROWS * TILE_SIZE;
	const wallCtx = wallCanvas.getContext("2d");
	for (let y = 0; y < MAP_ROWS; y++) {
		for (let x = 0; x < MAP_COLS; x++) {
			if (grid[y][x] === WALL) {
				wallCtx.fillStyle = "#281c12";
				wallCtx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
				wallCtx.strokeStyle = "#1e1409";
				wallCtx.lineWidth = 0.5;
				wallCtx.strokeRect(x * TILE_SIZE + 0.5, y * TILE_SIZE + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
			}
		}
	}
	const wallTag = "wallbg_" + Date.now();
	k.loadSprite(wallTag, wallCanvas.toDataURL());
	k.onLoad(() => {
		k.add([
			k.pos(0, 0),
			k.sprite(wallTag),
			k.z(-1),
		]);
	});

	const doug = k.add([
		k.pos(
			playerStart.x * TILE_SIZE + TILE_SIZE / 2,
			playerStart.y * TILE_SIZE + TILE_SIZE / 2,
		),
		k.sprite("doug"),
		k.scale(0.04),
		k.anchor("center"),
		k.area(),
		player(k, grid, TILE_SIZE),
	]);

	// Notifications & kill tracker
	const notifs = createNotifications(k);

	const killTracker = {};
	for (const entry of levelDef.enemies) {
		const name = entry.type.name || "Enemy";
		if (!killTracker[name]) {
			killTracker[name] = { total: 0, killed: 0 };
		}
		killTracker[name].total += entry.count;
	}

	function getTrackerText() {
		const lines = [];
		for (const [name, data] of Object.entries(killTracker)) {
			lines.push(`${data.killed}/${data.total} ${name}s Killed`);
		}
		return lines.join("\n");
	}

	const trackerLabel = k.add([
		k.text(getTrackerText(), { size: 14 }),
		k.pos(k.width() - 10, 10),
		k.anchor("topright"),
		k.color(200, 200, 200),
		k.fixed(),
		k.z(100),
	]);

	doug.on("damaged", (amount) => {
		notifs.show(`Took ${amount} damage!`, [255, 80, 80]);
	});

	const enemiesToSpawn = [];
	for (const entry of levelDef.enemies) {
		for (let n = 0; n < entry.count; n++) {
			enemiesToSpawn.push(entry.type);
		}
	}

	const playerPx = k.vec2(
		playerStart.x * TILE_SIZE + TILE_SIZE / 2,
		playerStart.y * TILE_SIZE + TILE_SIZE / 2,
	);
	const MIN_SPAWN_DIST = 100;
	const availableRooms = rooms.slice(1).filter((r) => {
		if (r.cx === gatewayStart.x && r.cy === gatewayStart.y) return false;
		const rx = r.cx * TILE_SIZE + TILE_SIZE / 2;
		const ry = r.cy * TILE_SIZE + TILE_SIZE / 2;
		return playerPx.dist(k.vec2(rx, ry)) >= MIN_SPAWN_DIST;
	});
	for (let i = 0; i < enemiesToSpawn.length; i++) {
		const room = availableRooms[i % availableRooms.length];
		const type = enemiesToSpawn[i];

		const spriteName = type.sprite || "bean";
		const w = type.width || 16;
		const h = type.height || 16;
		const sc = type.spriteScale || 0.28;

		const enemyObj = k.add([
			k.pos(
				room.cx * TILE_SIZE + TILE_SIZE / 2,
				room.cy * TILE_SIZE + TILE_SIZE / 2,
			),
			k.sprite(spriteName),
			k.scale(sc),
			k.anchor("center"),
			k.area({ shape: new k.Rect(k.vec2(0), w, h) }),
			k.color(type.tint[0], type.tint[1], type.tint[2]),
			enemy(k, doug, grid, TILE_SIZE, type),
			"enemy",
		]);

		enemyObj.on("killed", () => {
			const name = enemyObj.typeName || "Enemy";
			if (killTracker[name]) {
				killTracker[name].killed++;
			}
			trackerLabel.text = getTrackerText();
			notifs.show(`Killed a ${name}!`, [255, 220, 100]);
		});
	}

	// Level label
	const levelLabel = k.add([
		k.text(levelDef.name, { size: 16 }),
		k.pos(10, 10),
		k.color(255, 220, 150),
		k.fixed(),
		k.z(100),
	]);

	// Gateway HUD label (hidden until activated)
	const gatewayHud = k.add([
		k.text("Gateway Activated", { size: 14 }),
		k.pos(10, 10),
		k.anchor("topleft"),
		k.color(160, 0, 255),
		k.fixed(),
		k.z(100),
		k.opacity(0),
	]);

	doug.onUpdate(() => {
		k.camPos(doug.pos);
	});

	k.onKeyPress("space", () => {
		doug.attack();
	});

	// Gateway — starts gray, turns purple when all enemies are killed
	const GATEWAY_W = 40;
	const GATEWAY_H = 24;
	const gateway = k.add([
		k.pos(
			gatewayStart.x * TILE_SIZE + TILE_SIZE / 2,
			gatewayStart.y * TILE_SIZE + TILE_SIZE / 2,
		),
		k.rect(GATEWAY_W, GATEWAY_H),
		k.anchor("center"),
		k.area(),
		k.color(120, 120, 120),
		k.z(5),
		"gateway",
	]);
	const gatewayLabel = k.add([
		k.text("Gateway", { size: 10 }),
		k.pos(
			gatewayStart.x * TILE_SIZE + TILE_SIZE / 2,
			gatewayStart.y * TILE_SIZE + TILE_SIZE / 2,
		),
		k.anchor("center"),
		k.color(255, 255, 255),
		k.z(6),
	]);

	let gatewayActive = false;

	// Check if all enemies are dead → activate the gateway
	let flashTimer = 0;
	k.onUpdate(() => {
		if (!gatewayActive && k.get("enemy").length === 0) {
			gatewayActive = true;
			gateway.color = k.rgb(160, 0, 255);
			gatewayLabel.color = k.rgb(255, 255, 255);
			notifs.show("Gateway activated! Find the Gateway!", [160, 0, 255]);

			// Position HUD label right of the level label and show it
			gatewayHud.pos.x = levelLabel.pos.x + levelLabel.width + 16;
			gatewayHud.opacity = 1;
		}

		// Flash the HUD label purple
		if (gatewayActive) {
			flashTimer += k.dt();
			gatewayHud.opacity = Math.abs(Math.sin(flashTimer * 4));
		}
	});

	// Touch the active gateway → advance
	doug.onCollide("gateway", () => {
		if (!gatewayActive) return;
		if (levelIdx + 1 < LEVELS.length) {
			k.go("levelintro", levelIdx + 1);
		} else {
			k.go("win");
		}
	});

	doug.on("death", () => {
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

	k.onKeyPress("b", () => {
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
		k.text("Press ENTER to try again", { size: 20 }),
		k.pos(k.center().x, k.center().y + 30),
		k.anchor("center"),
		k.color(255, 50, 50),
	]);

	k.onKeyPress("enter", () => {
		k.go("levelintro", 0);
	});
});

k.go("home");
