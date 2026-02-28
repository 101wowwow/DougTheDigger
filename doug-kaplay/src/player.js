import { WALL } from "./mapGen.js";

const SPEED = 150;
const MAX_HEALTH = 100;
const COLLISION_HALF = 8; // half-size of the player's collision box (16×16 px)
const BAR_WIDTH = 30;
const BAR_HEIGHT = 4;
const BAR_OFFSET_Y = 20;

export default function player(k, mapGrid, tileSize) {
	let health = MAX_HEALTH;
	let isHit = false;
	let healthBar = null;
	let healthBarBg = null;

	// Check if a position would put any corner of the collision box inside a wall
	function hitsWall(cx, cy) {
		const corners = [
			[cx - COLLISION_HALF, cy - COLLISION_HALF],
			[cx + COLLISION_HALF, cy - COLLISION_HALF],
			[cx - COLLISION_HALF, cy + COLLISION_HALF],
			[cx + COLLISION_HALF, cy + COLLISION_HALF],
		];
		for (const [px, py] of corners) {
			const tx = Math.floor(px / tileSize);
			const ty = Math.floor(py / tileSize);
			if (ty < 0 || ty >= mapGrid.length || tx < 0 || tx >= mapGrid[0].length) return true;
			if (mapGrid[ty][tx] === WALL) return true;
		}
		return false;
	}

	return {
		id: "player",
		require: ["area", "pos"],

		speed: SPEED,
		health,
		maxHealth: MAX_HEALTH,

		damage(amount) {
			if (isHit) return;

			health -= amount;
			isHit = true;
			this.color = k.rgb(255, 0, 0);

			k.wait(0.1, () => {
				this.color = k.rgb();
				isHit = false;
			});

			if (healthBar) {
				healthBar.width = BAR_WIDTH * Math.max(0, health / MAX_HEALTH);
			}

			if (health <= 0) {
				health = 0;
				k.addKaboom(this.pos);
				k.shake(10);
				this.trigger("death");
			}
		},

		heal(amount) {
			health = Math.min(health + amount, MAX_HEALTH);
			this.color = k.rgb(0, 255, 0);

			k.wait(0.1, () => {
				this.color = k.rgb();
			});

			if (healthBar) {
				healthBar.width = BAR_WIDTH * Math.max(0, health / MAX_HEALTH);
			}
		},

		attack() {
			k.addKaboom(this.pos, { scale: 0.5 });
			k.shake(4);

			const enemies = k.get("enemy");
			for (const e of enemies) {
				if (this.pos.dist(e.pos) < 100) {
					e.damage(20);
				}
			}
		},

		add() {
			healthBarBg = k.add([
				k.rect(BAR_WIDTH, BAR_HEIGHT),
				k.pos(this.pos.x - BAR_WIDTH / 2, this.pos.y - BAR_OFFSET_Y),
				k.color(100, 100, 100),
				k.z(10),
			]);

			healthBar = k.add([
				k.rect(BAR_WIDTH, BAR_HEIGHT),
				k.pos(this.pos.x - BAR_WIDTH / 2, this.pos.y - BAR_OFFSET_Y),
				k.color(255, 0, 0),
				k.z(11),
			]);
		},

		update() {
			let dx = 0, dy = 0;
			if (k.isKeyDown(["left", "a"])) dx = -SPEED;
			if (k.isKeyDown(["right", "d"])) dx = SPEED;
			if (k.isKeyDown(["up", "w"])) dy = -SPEED;
			if (k.isKeyDown(["down", "s"])) dy = SPEED;

			const dt = k.dt();

			// Try X axis — only move if no wall collision
			if (dx !== 0) {
				const nx = this.pos.x + dx * dt;
				if (!hitsWall(nx, this.pos.y)) {
					this.pos.x = nx;
				}
			}

			// Try Y axis — only move if no wall collision
			if (dy !== 0) {
				const ny = this.pos.y + dy * dt;
				if (!hitsWall(this.pos.x, ny)) {
					this.pos.y = ny;
				}
			}

			// Keep health bar above the player
			if (healthBar && healthBarBg) {
				healthBarBg.pos.x = this.pos.x - BAR_WIDTH / 2;
				healthBarBg.pos.y = this.pos.y - BAR_OFFSET_Y;
				healthBar.pos.x = this.pos.x - BAR_WIDTH / 2;
				healthBar.pos.y = this.pos.y - BAR_OFFSET_Y;
			}
		},

		destroy() {
			if (healthBar) healthBar.destroy();
			if (healthBarBg) healthBarBg.destroy();
		},
	};
}
