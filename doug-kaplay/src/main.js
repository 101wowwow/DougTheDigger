import kaplay from "kaplay";
import player from "./player.js";
import enemy from "./enemy.js";

const k = kaplay();

k.loadRoot("./");
k.loadSprite("bean", "sprites/bean.png");

k.scene("game", () => {
    const bean = k.add([
        k.pos(120, 80),
        k.sprite("bean"),
        k.area(),
        player(k),
    ]);

    k.add([
        k.pos(400, 200),
        k.sprite("bean"),
        k.area(),
        k.color(255, 0, 0),
        enemy(k, bean),
    ]);

    k.onKeyPress("space", () => {
        bean.attack();
    });

    bean.on("death", () => {
        k.go("gameover");
    });
});

k.scene("gameover", () => {
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
