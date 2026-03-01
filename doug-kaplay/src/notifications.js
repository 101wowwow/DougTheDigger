const DURATION = 2.5;
const FADE_TIME = 0.5;
const START_Y = 40;
const SPACING = 18;
const LEFT_MARGIN = 10;

export default function createNotifications(k) {
	const active = [];

	function show(msg, color = [255, 255, 255]) {
		const y = START_Y + active.length * SPACING;

		const obj = k.add([
			k.text(msg, { size: 30 }),
			k.pos(LEFT_MARGIN, y),
			k.color(color[0], color[1], color[2]),
			k.opacity(1),
			k.fixed(),
			k.z(100),
		]);

		active.push(obj);

		k.wait(DURATION, () => {
			if (!obj.exists()) return;
			let t = 0;
			const fadeHandler = obj.onUpdate(() => {
				t += k.dt();
				obj.opacity = Math.max(0, 1 - t / FADE_TIME);
				if (t >= FADE_TIME) {
					fadeHandler.cancel();
					const idx = active.indexOf(obj);
					if (idx !== -1) active.splice(idx, 1);
					obj.destroy();
					reposition();
				}
			});
		});
	}

	function reposition() {
		for (let i = 0; i < active.length; i++) {
			active[i].pos.y = START_Y + i * SPACING;
		}
	}

	return { show };
}
