const DEFAULT_SPEED = 30; // characters per second
const DEFAULT_CURSOR_CHAR = "█";
const DEFAULT_CURSOR_BLINK_RATE = 0.5; // seconds per blink cycle

export default function scrollingText(k, opts = {}) {
	let fullText = opts.text || "";
	const speed = opts.speed || DEFAULT_SPEED;
	const cursorChar = opts.cursorChar ?? DEFAULT_CURSOR_CHAR;
	const blinkRate = opts.cursorBlinkRate || DEFAULT_CURSOR_BLINK_RATE;
	const onFinish = opts.onFinish || null;

	let charIndex = 0;
	let elapsed = 0;
	let finished = false;
	let cursorVisible = true;
	let cursorTimer = 0;
	let paused = false;

	function updateDisplay(obj) {
		const revealed = fullText.substring(0, charIndex);
		const cursor = cursorVisible ? cursorChar : " ";
		obj.text = revealed + cursor;
	}

	return {
		id: "scrollingText",
		require: ["text"],

		add() {
			updateDisplay(this);
		},

		update() {
			const dt = k.dt();

			// Blink cursor
			cursorTimer += dt;
			if (cursorTimer >= blinkRate) {
				cursorTimer -= blinkRate;
				cursorVisible = !cursorVisible;
			}

			// Reveal characters
			if (!finished && !paused) {
				elapsed += dt;
				const targetChars = Math.floor(elapsed * speed);
				if (targetChars > charIndex) {
					charIndex = Math.min(targetChars, fullText.length);
				}
				if (charIndex >= fullText.length) {
					finished = true;
					if (onFinish) onFinish();
					this.trigger("scrollFinish");
				}
			}

			updateDisplay(this);
		},

		skipScroll() {
			charIndex = fullText.length;
			finished = true;
			if (onFinish) onFinish();
			this.trigger("scrollFinish");
			updateDisplay(this);
		},

		isScrollFinished() {
			return finished;
		},

		pauseScroll() {
			paused = true;
		},

		resumeScroll() {
			paused = false;
		},

		resetScroll(newText) {
			if (newText !== undefined) {
				fullText = newText;
			}
			charIndex = 0;
			elapsed = 0;
			finished = false;
			paused = false;
			cursorTimer = 0;
			cursorVisible = true;
		},
	};
}
