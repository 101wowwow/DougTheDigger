// all important player file


// todo: (do not implement until i decide how)
// make speed slower/variable with some enemy attacks

const SPEED = 200;
const MAX_HEALTH = 100;

export default function player(k) {
    let health = MAX_HEALTH;
    let isHit = false;
    let healthBar = null;
    let healthBarBg = null;

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
                healthBar.width = 60 * Math.max(0, health / MAX_HEALTH);
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
                healthBar.width = 60 * Math.max(0, health / MAX_HEALTH);
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
                k.rect(60, 8),
                k.pos(this.pos.x + 10, this.pos.y - 40),
                k.color(100, 100, 100),
                k.z(0.9),
            ]);

            healthBar = k.add([
                k.rect(60, 8),
                k.pos(this.pos.x + 10, this.pos.y - 40),
                k.color(255, 0, 0),
                k.z(1),
            ]);
        },

        update() {
            if (k.isKeyDown(["left", "a"])) {
                this.move(-SPEED, 0);
            }
            if (k.isKeyDown(["right", "d"])) {
                this.move(SPEED, 0);
            }
            if (k.isKeyDown(["up", "w"])) {
                this.move(0, -SPEED);
            }
            if (k.isKeyDown(["down", "s"])) {
                this.move(0, SPEED);
            }

            if (healthBar && healthBarBg) {
                var magicFactorX = 0;
                var magicFactorY = 20;
                healthBarBg.pos.x = this.pos.x;
                healthBarBg.pos.y = this.pos.y - magicFactorY;
                healthBar.pos.x = this.pos.x;
                healthBar.pos.y = this.pos.y - magicFactorY;
            }
        },

        destroy() {
            if (healthBar) healthBar.destroy();
            if (healthBarBg) healthBarBg.destroy();
        },
    };
}
