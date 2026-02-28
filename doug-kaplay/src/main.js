import kaplay from "kaplay";
import player from "./player.js";

const k = kaplay();

k.loadRoot("./");
k.loadSprite("bean", "sprites/bean.png");

const bean = k.add([
    k.pos(120, 80),
    k.sprite("bean"),
    k.area(),
    player(k),
]);
