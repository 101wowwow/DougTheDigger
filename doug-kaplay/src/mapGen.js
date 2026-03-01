// mapGen.js — Procedural cave/tunnel generator
//
// Priority: TUNNELS over rooms. The dungeon is a winding tunnel network
// with small caverns scattered through it.
//
//   1. Fill grid with walls
//   2. Place small elliptical caverns (well-spaced so tunnels are long)
//   3. Connect caverns with "drunk walk" corridors that wander naturally
//   4. Add extra branch tunnels (dead ends radiating from the network)
//   5. Three smoothing passes to make everything organic and rounded
//
// Returns { grid, rooms, playerStart }

export const WALL = 1;
export const FLOOR = 0;

const ROOM_PADDING = 4;

export default function generateMap(cols, rows) {
	const grid = [];
	for (let y = 0; y < rows; y++) {
		grid[y] = new Array(cols).fill(WALL);
	}

	const rooms = [];

	// Place small elliptical caverns — well spaced so tunnels between them are long
	for (let attempt = 0; attempt < 50; attempt++) {
		const rx = randInt(2, 4);
		const ry = randInt(2, 3);
		const cx = randInt(rx + 2, cols - rx - 2);
		const cy = randInt(ry + 2, rows - ry - 2);

		let overlaps = false;
		for (const r of rooms) {
			if (
				cx - rx - ROOM_PADDING < r.cx + r.rx &&
				cx + rx + ROOM_PADDING > r.cx - r.rx &&
				cy - ry - ROOM_PADDING < r.cy + r.ry &&
				cy + ry + ROOM_PADDING > r.cy - r.ry
			) {
				overlaps = true;
				break;
			}
		}
		if (overlaps) continue;

		// Carve ellipse with noisy edges for organic shape
		for (let y = cy - ry; y <= cy + ry; y++) {
			for (let x = cx - rx; x <= cx + rx; x++) {
				if (y < 1 || y >= rows - 1 || x < 1 || x >= cols - 1) continue;
				const dx = (x - cx) / rx;
				const dy = (y - cy) / ry;
				const noise = Math.random() * 0.4 - 0.15;
				if (dx * dx + dy * dy <= 1.0 + noise) {
					grid[y][x] = FLOOR;
				}
			}
		}
		rooms.push({ cx, cy, rx, ry });
	}

	// Safety fallback
	if (rooms.length === 0) {
		const cx = Math.floor(cols / 2);
		const cy = Math.floor(rows / 2);
		rooms.push({ cx, cy, rx: 3, ry: 2 });
		carveEllipse(grid, cx, cy, 3, 2, rows, cols);
	}

	// Sort so chain connects nearby rooms
	rooms.sort((a, b) => (a.cx + a.cy) - (b.cx + b.cy));

	// Connect rooms with wandering tunnels (30% wander → long winding paths)
	const connectionCount = new Array(rooms.length).fill(0);
	for (let i = 0; i < rooms.length - 1; i++) {
		drunkWalk(grid, rooms[i].cx, rooms[i].cy, rooms[i + 1].cx, rooms[i + 1].cy, 0.3);
		connectionCount[i]++;
		connectionCount[i + 1]++;
	}

	// Extra connections until every room has 3+ tunnels
	for (let i = 0; i < rooms.length; i++) {
		while (connectionCount[i] < 3 && rooms.length > 1) {
			let j;
			do { j = randInt(0, rooms.length); } while (j === i);
			drunkWalk(grid, rooms[i].cx, rooms[i].cy, rooms[j].cx, rooms[j].cy, 0.3);
			connectionCount[i]++;
			connectionCount[j]++;
		}
	}

	// Branch tunnels — dead-end passages that split off from the existing network.
	// These make tunnels feel like the main feature, not just connectors between rooms.
	const floorTiles = [];
	for (let y = 2; y < rows - 2; y++) {
		for (let x = 2; x < cols - 2; x++) {
			if (grid[y][x] === FLOOR) floorTiles.push({ x, y });
		}
	}
	for (let i = 0; i < 8; i++) {
		if (floorTiles.length === 0) break;
		const start = floorTiles[randInt(0, floorTiles.length)];
		const angle = Math.random() * Math.PI * 2;
		const dist = randInt(10, 22);
		const tx = Math.max(2, Math.min(cols - 3, Math.round(start.x + Math.cos(angle) * dist)));
		const ty = Math.max(2, Math.min(rows - 3, Math.round(start.y + Math.sin(angle) * dist)));
		drunkWalk(grid, start.x, start.y, tx, ty, 0.4);
	}

	// Three smoothing passes — aggressively round every edge
	// Rule: a WALL with 4+ FLOOR neighbors has a chance to become FLOOR
	// (never converts FLOOR→WALL, so tunnels are preserved)
	for (let pass = 0; pass < 3; pass++) {
		const snap = grid.map(row => [...row]);
		for (let y = 1; y < rows - 1; y++) {
			for (let x = 1; x < cols - 1; x++) {
				if (snap[y][x] !== WALL) continue;
				let floorN = 0;
				for (let dy = -1; dy <= 1; dy++) {
					for (let dx = -1; dx <= 1; dx++) {
						if (dx === 0 && dy === 0) continue;
						if (snap[y + dy][x + dx] === FLOOR) floorN++;
					}
				}
				if (floorN >= 4 && Math.random() < 0.5) {
					grid[y][x] = FLOOR;
				}
			}
		}
	}

	// Start at the room closest to the bottom-center (climbing to the surface)
	const midX = Math.floor(cols / 2);
	let bestRoom = rooms[0];
	let bestScore = Infinity;
	for (const r of rooms) {
		const score = Math.abs(r.cx - midX) - r.cy; // prefer bottom (high cy) and center
		if (score < bestScore) { bestScore = score; bestRoom = r; }
	}

	return { grid, rooms, playerStart: { x: bestRoom.cx, y: bestRoom.cy } };
}

function carveEllipse(grid, cx, cy, rx, ry, rows, cols) {
	for (let y = cy - ry; y <= cy + ry; y++) {
		for (let x = cx - rx; x <= cx + rx; x++) {
			if (y < 1 || y >= rows - 1 || x < 1 || x >= cols - 1) continue;
			const dx = (x - cx) / rx;
			const dy = (y - cy) / ry;
			if (dx * dx + dy * dy <= 1.0) grid[y][x] = FLOOR;
		}
	}
}

// "Drunk walk" — wanders toward the target with random sidesteps.
// Higher wander = windier tunnel. Always 1 tile wide, always connected.
function drunkWalk(grid, x, y, tx, ty, wander) {
	const maxSteps = (Math.abs(tx - x) + Math.abs(ty - y)) * 5;
	for (let step = 0; step < maxSteps && (x !== tx || y !== ty); step++) {
		grid[y][x] = FLOOR;

		if (Math.random() < wander) {
			// Random cardinal step
			const dir = Math.floor(Math.random() * 4);
			const nx = x + [1, -1, 0, 0][dir];
			const ny = y + [0, 0, 1, -1][dir];
			if (nx >= 1 && nx < grid[0].length - 1 && ny >= 1 && ny < grid.length - 1) {
				x = nx;
				y = ny;
			}
		} else {
			// Step toward target on the longer axis
			const dx = tx - x;
			const dy = ty - y;
			if (Math.abs(dx) >= Math.abs(dy)) {
				x += Math.sign(dx);
			} else {
				y += Math.sign(dy);
			}
		}
	}
	grid[y][x] = FLOOR;
}

function randInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}
