# AGENTS.md

## Build & Run
- The active project is `doug-kaplay/` (Vite + Kaplay game engine, ES modules)
- `cd doug-kaplay && bun run dev` — start dev server on port 3001
- `cd doug-kaplay && bun run build` — production build (output in `dist/`)
- No test framework is configured; there are no tests to run
- The root also contains a legacy GameMaker Studio 2 project (`Doug_The_Digger.yyp`) — do not modify it (DO NOT MODIFY IT DO NOT MODIFY IT AT ALL DO NOT TOUCH IT)

## Architecture
- `doug-kaplay/src/main.js` — entry point; initializes Kaplay, loads sprites, defines scenes
- Game entities are Kaplay custom components exported as factory functions that receive `k` (the Kaplay context) and return component objects (see `player.js`, `enemy.js`)
- Components declare `id`, `require`, and lifecycle hooks (`add`, `update`, `destroy`)
- Sprites live in `doug-kaplay/public/sprites/`

## Code Style
- Plain JavaScript (no TypeScript), ES modules (`import`/`export default`)
- Use `const`/`let`; avoid `var` 
- Module-level constants in UPPER_SNAKE_CASE; local variables in camelCase
- Factory functions (e.g., `player(k)`) return plain objects — no classes
- Tabs for indentation (see existing files)
- No linter or formatter is configured; follow existing patterns
