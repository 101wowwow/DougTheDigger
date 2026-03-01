
// this game sucks
import { WALL } from "./mapGen.js";

const COLLISION_HALF = 8;

const ENEMY_DEFAULTS = {
	speed: 160,
	health: 30,
	attackDamage: 10,
	attackCooldown: 0.8,
	attackRange: 40,
	phaseThrough: false, // a bug into a feature nope
	tint: [255, 0, 0],
	sprite: "bean",
	spriteScale: 0.28,
	width: 16,
	height: 16,
};

export const ENEMY_TYPES = {
    // yay todo add more enemies
	black: {
		speed: 240,
		health: 15,
		attackDamage: 8,
		attackCooldown: 0.6,
		phaseThrough: true,
		tint: [30, 30, 30],
		sprite: "bean",
		width: 14,
		height: 14,
	},
	red: {
		speed: 100,
		health: 60,
		attackDamage: 15,
		attackCooldown: 1.0,
		phaseThrough: false,
		tint: [255, 0, 0],
		sprite: "bean",
		width: 16,
		height: 16,
	},

    spider: {
        speed: 200,
        health: 30,
        attackDamage: 10,
        attackCooldown: 0.5,
        sprite: "spider",
        spriteScale: 0.15,
        tint: [255, 255, 255],
        width: 5,
        height: 5,
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
			if (ty < 0 || ty >= grid.length || tx < 0 || tx >= grid[0].length) return true;
			if (grid[ty][tx] === WALL) return true;
		}
		return false;
	}

	return {
		id: "enemy",
		require: ["area", "pos", "color"],

		damage(amount) {
			health -= amount;
			this.color = k.rgb(255, 255, 255);
			k.wait(0.1, () => {
				if (!this.exists()) return;
				this.color = k.rgb(cfg.tint[0], cfg.tint[1], cfg.tint[2]);
			});

			if (health <= 0) {
				k.addKaboom(this.pos, { scale: 0.5 });
				this.destroy();
			}
		},

		update() {
			if (!target.exists()) return;

			const dist = this.pos.dist(target.pos);

			if (dist < cfg.attackRange && canAttack) {
				target.damage(cfg.attackDamage);
				canAttack = false;
				k.wait(cfg.attackCooldown, () => { canAttack = true; });
			} else {
				const dir = target.pos.sub(this.pos).unit();

				if (cfg.phaseThrough) {
					this.move(dir.scale(cfg.speed));
				} else {
					const dt = k.dt();
					const nx = this.pos.x + dir.x * cfg.speed * dt;
					const ny = this.pos.y + dir.y * cfg.speed * dt;

					if (!hitsWall(nx, this.pos.y)) {
						this.pos.x = nx;
					}
					if (!hitsWall(this.pos.x, ny)) {
						this.pos.y = ny;
					}
				}
			}
		},
	};
}
