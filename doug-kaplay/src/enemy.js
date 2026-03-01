
// this game sucks
import { WALL } from "./mapGen.js";

const DEFAULT_COLLISION_HALF = 8;
const PATH_RECALC_INTERVAL = 0.3;

const ENEMY_DEFAULTS = {
	name: "Enemy",
	speed: 160,
	health: 30,
	attackDamage: 10,
	attackCooldown: 0.8,
	attackRange: 40,
	phaseThrough: false, // a bug into a feature nope
	smartPathing: false, // BFS pathfinding around walls
	triggerRadius: Infinity, // detection radius in px (Infinity = always chasing)
	tint: [255, 0, 0],
	sprite: "bean",
	spriteScale: 0.28,
	width: 16,
	height: 16,
};

function bfsPath(grid, sx, sy, ex, ey) {
	const rows = grid.length;
	const cols = grid[0].length;
	sx = Math.max(0, Math.min(cols - 1, sx));
	sy = Math.max(0, Math.min(rows - 1, sy));
	ex = Math.max(0, Math.min(cols - 1, ex));
	ey = Math.max(0, Math.min(rows - 1, ey));
	if (sx === ex && sy === ey) return [];
	if (grid[ey][ex] === WALL) return null;

	const visited = new Set();
	const startKey = sy * cols + sx;
	visited.add(startKey);
	const parent = new Map();
	const queue = [startKey];
	let head = 0;
	const endKey = ey * cols + ex;

	while (head < queue.length) {
		const key = queue[head++];
		const x = key % cols;
		const y = (key - x) / cols;

		for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
			const nx = x + dx;
			const ny = y + dy;
			if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
			const nkey = ny * cols + nx;
			if (visited.has(nkey)) continue;
			if (grid[ny][nx] === WALL) continue;

			visited.add(nkey);
			parent.set(nkey, key);

			if (nkey === endKey) {
				const path = [];
				let ck = nkey;
				while (ck !== startKey) {
					path.push({ x: ck % cols, y: Math.floor(ck / cols) });
					ck = parent.get(ck);
				}
				path.reverse();
				return path;
			}

			queue.push(nkey);
		}
	}

	return null;
}

function hasLineOfSight(grid, ax, ay, bx, by) {
	let x0 = ax, y0 = ay;
	const dx = Math.abs(bx - x0);
	const dy = Math.abs(by - y0);
	const sx = x0 < bx ? 1 : -1;
	const sy = y0 < by ? 1 : -1;
	let err = dx - dy;

	while (true) {
		if (y0 < 0 || y0 >= grid.length || x0 < 0 || x0 >= grid[0].length) return false;
		if (grid[y0][x0] === WALL) return false;
		if (x0 === bx && y0 === by) break;
		const e2 = 2 * err;
		if (e2 > -dy) { err -= dy; x0 += sx; }
		if (e2 < dx) { err += dx; y0 += sy; }
	}
	return true;
}

export const ENEMY_TYPES = {
    // yay todo add more enemies

	phaser: {
		name: "Phaser Drone",
		speed: 300,
		health: 15,
		attackDamage: 8,
		attackCooldown: 0.6,
		phaseThrough: true,
		smartPathing: false,
		triggerRadius: Infinity,
		tint: [30, 30, 30],
		sprite: "bean",
		width: 14,
		height: 14,
	},
	red: {
		name: "Red Soldier",
		speed: 120,
		health: 55,
		attackDamage: 15,
		attackCooldown: 1.0,
		phaseThrough: false,
		smartPathing: true,
		triggerRadius: 800,
		tint: [255, 0, 0],
		sprite: "bean",
		width: 16,
		height: 16,
	},

	coward:{
		name: "Cowardly (Dumb) Soldier",
		speed: 120,
		health: 55,
		attackDamage: 15,
		attackCooldown: 1.0,
		phaseThrough: false,
		smartPathing: false,
		triggerRadius: 100,
		tint: [243, 176, 74],
		sprite: "bean",
		width: 16,
		height: 16,
	},
	

    spider: {
        name: "Steampunk Spider",
        speed: 200,
        health: 90,
        attackDamage: 10,
        attackCooldown: 0.4,
        smartPathing: true,
        triggerRadius: Infinity,
        sprite: "spider",
        spriteScale: 0.15,
        tint: [255, 255, 255],
        width: 5,
        height: 5,
    },

	spiderNoHunt: {
        name: "Steampunk Spider(No Hunt)",
        speed: 200,
        health: 90,
        attackDamage: 10,
        attackCooldown: 0.4,
        smartPathing: true,
        triggerRadius: 300,
        sprite: "spider",
        spriteScale: 0.15,
        tint: [255, 255, 255],
        width: 5,
        height: 5,
    },

	gigaSpider: {
		name: "Giga Steampunk Spider",
		speed: 90,
		health: 600,
		attackDamage: 13,
		attackCooldown: 0.5,
		phaseThrough: false,
		smartPathing: true,
		triggerRadius: Infinity,
		sprite: "spider",
		spriteScale: 0.7,
		tint: [255, 80, 80],
		width: 60,
		height: 60,
		isBoss: true,
	},


    // issues
    // soldier: {
    //     speed: 100,
	// 	health: 60,
	// 	attackDamage: 15,
	// 	attackCooldown: 1.0,
	// 	phaseThrough: false,
	// 	tint: [255, 0, 0],
	// 	sprite: "bean",
	// 	width: 18,
	// 	height: 18,
    // }
};

export default function enemy(k, target, grid, tileSize, opts = {}) {
	const cfg = { ...ENEMY_DEFAULTS, ...opts };
	let health = cfg.health;
	let canAttack = true;
	let cachedPath = null;
	let pathTimer = 0;

	// Derive wall-collision half from the enemy's hitbox dimensions
	const collisionHalf = Math.max(2, Math.min(cfg.width, cfg.height) / 2);

	function hitsWall(cx, cy) {
		const corners = [
			[cx - collisionHalf, cy - collisionHalf],
			[cx + collisionHalf, cy - collisionHalf],
			[cx - collisionHalf, cy + collisionHalf],
			[cx + collisionHalf, cy + collisionHalf],
		];
		for (const [px, py] of corners) {
			const tx = Math.floor(px / tileSize);
			const ty = Math.floor(py / tileSize);
			if (ty < 0 || ty >= grid.length || tx < 0 || tx >= grid[0].length) return true;
			if (grid[ty][tx] === WALL) return true;
		}
		return false;
	}

	return {
		id: "enemy",
		typeName: cfg.name,
		isBoss: !!cfg.isBoss,
		require: ["area", "pos", "color"],

		getHealth() { return health; },
		getMaxHealth() { return cfg.health; },

		damage(amount) {
			health -= amount;
			this.color = k.rgb(255, 255, 255);
			k.wait(0.1, () => {
				if (!this.exists()) return;
				this.color = k.rgb(cfg.tint[0], cfg.tint[1], cfg.tint[2]);
			});

			if (health <= 0) {
				this.trigger("killed");
				k.addKaboom(this.pos, { scale: cfg.isBoss ? 2 : 0.5 });
				if (cfg.isBoss) k.shake(20);
				this.destroy();
			}
		},

		update() {
			if (!target.exists()) return;

			const dist = this.pos.dist(target.pos);

			// Only chase when player is within trigger radius
			if (dist > cfg.triggerRadius) return;

			if (dist < cfg.attackRange && canAttack) {
				target.damage(cfg.attackDamage);
				canAttack = false;
				k.wait(cfg.attackCooldown, () => { canAttack = true; });
				return;
			}

			if (cfg.phaseThrough) {
				const dir = target.pos.sub(this.pos).unit();
				this.move(dir.scale(cfg.speed));
				return;
			}

			let dirX, dirY;

			if (cfg.smartPathing) {
				const myTx = Math.floor(this.pos.x / tileSize);
				const myTy = Math.floor(this.pos.y / tileSize);
				const plTx = Math.floor(target.pos.x / tileSize);
				const plTy = Math.floor(target.pos.y / tileSize);

				// Direct line of sight to player? Go straight (full diagonal speed)
				if (hasLineOfSight(grid, myTx, myTy, plTx, plTy)) {
					const dir = target.pos.sub(this.pos).unit();
					dirX = dir.x;
					dirY = dir.y;
				} else {
					// No LOS — use BFS path around walls
					pathTimer -= k.dt();
					if (pathTimer <= 0 || !cachedPath) {
						pathTimer = PATH_RECALC_INTERVAL;
						cachedPath = bfsPath(grid, myTx, myTy, plTx, plTy);
					}

					if (cachedPath && cachedPath.length > 0) {
						// Look ahead for the furthest visible waypoint (allows diagonal shortcuts)
						let bestIdx = 0;
						const maxLook = Math.min(cachedPath.length - 1, 6);
						for (let i = maxLook; i > 0; i--) {
							if (hasLineOfSight(grid, myTx, myTy, cachedPath[i].x, cachedPath[i].y)) {
								bestIdx = i;
								break;
							}
						}
						const wp = cachedPath[bestIdx];
						const tx = wp.x * tileSize + tileSize / 2;
						const ty = wp.y * tileSize + tileSize / 2;
						const dx = tx - this.pos.x;
						const dy = ty - this.pos.y;
						const len = Math.sqrt(dx * dx + dy * dy);
						if (len > 0) {
							dirX = dx / len;
							dirY = dy / len;
						}
					}
				}
			}

			// Fallback: direct chase (also used when smartPathing is off)
			if (dirX == null) {
				const dir = target.pos.sub(this.pos).unit();
				dirX = dir.x;
				dirY = dir.y;
			}

			const dt = k.dt();
			const nx = this.pos.x + dirX * cfg.speed * dt;
			const ny = this.pos.y + dirY * cfg.speed * dt;

			if (!hitsWall(nx, this.pos.y)) {
				this.pos.x = nx;
			}
			if (!hitsWall(this.pos.x, ny)) {
				this.pos.y = ny;
			}
		},
	};
}
