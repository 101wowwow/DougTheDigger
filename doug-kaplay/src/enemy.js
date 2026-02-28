const ENEMY_SPEED = 220;
const ENEMY_HEALTH = 30;
const ATTACK_COOLDOWN = 0.8;
const ATTACK_DAMAGE = 10;
const ATTACK_RANGE = 40;

export default function enemy(k, target) {
    let health = ENEMY_HEALTH;
    let canAttack = true;

    return {
        id: "enemy",
        require: ["area", "pos", "color"],

        damage(amount) {
            health -= amount;
            this.color = k.rgb(255, 255, 255);
            k.wait(0.1, () => {
                this.color = k.rgb(255, 0, 0);
            });

            if (health <= 0) {
                k.addKaboom(this.pos, { scale: 0.5 });
                this.destroy();
            }
        },

        update() {
            if (!target.exists()) return;

            const dist = this.pos.dist(target.pos);

            if (dist < ATTACK_RANGE && canAttack) {
                target.damage(ATTACK_DAMAGE);
                canAttack = false;
                k.wait(ATTACK_COOLDOWN, () => { canAttack = true; });
            } else {
                const dir = target.pos.sub(this.pos).unit();
                this.move(dir.scale(ENEMY_SPEED));
            }
        },
    };
}
