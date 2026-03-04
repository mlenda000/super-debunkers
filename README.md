# Super Debunkers

A real-time multiplayer card game where players identify misinformation tactics used by fictional social media villains. Built with React, TypeScript, and WebSockets.

> **Live:** [super-debunkers.vercel.app](https://super-debunkers.vercel.app/)

## Related Repository

This is the **client** application. It requires the companion **server** to function:

| Repo                                                      | Description                                            |
| --------------------------------------------------------- | ------------------------------------------------------ |
| **super-debunkers** (this repo)                           | React front-end — UI, game interactions, drag-and-drop |
| [**dfg-server**](https://github.com/mlenda000/dfg-server) | PartyKit WebSocket server — rooms, scoring, game state |

Both must be running for local development.

## How the Game Works

1. Players join a room from the lobby
2. Each round, a fake news card is displayed with a hidden misinformation tactic
3. Players drag tactic cards from their hand onto the play area to identify the tactic used
4. Once all players are ready, the server scores the round
5. A modal sequence reveals results, individual feedback, and the scoreboard
6. After several rounds, the player with the highest score wins

## Tech Stack

- **React 19** with TypeScript
- **Vite** — build tooling and dev server
- **PartySocket** — WebSocket client for real-time communication
- **@dnd-kit** — drag-and-drop for card placement
- **React Router** — client-side routing
- **Swiper** — carousel components
- **Tailwind CSS** — utility-first styling
- **pnpm** — package manager

## Project Structure

```
src/
├── components/
│   ├── atoms/         # Small reusable components (buttons, inputs, backgrounds)
│   ├── molecules/     # Composed components (play area, news cards, scoreboard)
│   ├── organisms/     # Complex sections (game table, modals, player hand)
│   └── templates/     # Full page layouts (home, lobby, game, directions)
├── context/           # React context providers (GameContext, GlobalContext)
├── data/              # Static JSON data (cards, villains, directions)
├── hooks/             # Custom hooks (useGameContext, useWebSocket, useModalFade)
├── services/          # WebSocket service, environment config, profanity filter
├── types/             # TypeScript type definitions
└── utils/             # Message utilities for WebSocket communication
```

## Getting Started

### Prerequisites

- Node.js 25+
- pnpm 9+
- The [dfg-server](https://github.com/mlenda000/dfg-server) running locally on port 1999

### Installation

```bash
# Clone the repo
git clone https://github.com/mlenda000/super-debunkers.git
cd super-debunkers

# Install dependencies
pnpm install

# Start the dev server
pnpm dev
```

The client runs on `http://localhost:5173` by default and connects to the PartyKit server at `127.0.0.1:1999` in development mode.

### Environment Variables

| Variable             | Default (dev)    | Description                                                                          |
| -------------------- | ---------------- | ------------------------------------------------------------------------------------ |
| `VITE_PARTYKIT_HOST` | `127.0.0.1:1999` | PartyKit server host. In production, defaults to `dfg-server.mlenda000.partykit.dev` |

### Building for Production

```bash
pnpm build
```

Output is written to `dist/`. The project is configured for deployment on Vercel with SPA rewrites.

## Scripts

| Command        | Description                         |
| -------------- | ----------------------------------- |
| `pnpm dev`     | Start Vite dev server               |
| `pnpm build`   | Type-check and build for production |
| `pnpm preview` | Preview production build locally    |
| `pnpm lint`    | Run ESLint                          |

## Game Architecture

The client communicates with the server exclusively via WebSockets (PartySocket). Key message types:

- `playerEnters` / `playerLeaves` — join and leave rooms
- `influencer` — broadcast the current news card to all players
- `playerReady` / `playerNotReady` — signal readiness with chosen tactics
- `endOfRound` — trigger server-side scoring
- `scoreUpdate` — receive calculated scores from the server
- `roomUpdate` — sync room state (players, deck, round)
- `reconnectState` — restore full game state after disconnect

See [FLOW_DOCUMENTATION.md](./FLOW_DOCUMENTATION.md) for the complete game flow.
