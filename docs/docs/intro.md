---
sidebar_position: 1
---

# Getting Started

Frame is a lightweight React-based modal/lightbox system designed to be sideloaded into Next.js applications. It watches URL query parameters and displays step-based forms (flows) in a modal overlay.

## Features

- 🎯 **Query Parameter Routing** - Flows open/close based on URL params
- 🔄 **Step-based Navigation** - Multi-step forms with browser history support
- 🎨 **Compound Components** - Flexible, composable API
- 📦 **Type-safe** - Full TypeScript support
- 🎪 **Event System** - Custom events for decoupled communication
- ⌨️ **Keyboard Accessible** - ESC to close, full keyboard navigation
- 🪶 **Lightweight** - Minimal dependencies

## Quick Start

### Installation

```bash
pnpm install
```

### Development

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) and test the flows:

- `http://localhost:5173/?flow=signup&step=1`
- `http://localhost:5173/?flow=checkout&step=1`

### How It Works

Frame monitors URL query parameters (`flow` and `step`) and displays the corresponding flow component in a modal overlay:

```
/?flow=signup&step=1  →  Opens signup flow at step 1
/?flow=checkout&step=3 →  Opens checkout flow at step 3
No params             →  Frame is closed
```

### Closing the Frame

Users can close the frame by:

- Clicking the **X** button
- Pressing **ESC** key
- Clicking the **background overlay**
- Removing query params from URL

## Next Steps

- [Create your first flow](./guides/creating-flows)
- [Learn about the architecture](./architecture/overview)
- [Integrate with Next.js](./guides/nextjs-integration)
- [API Reference](./api/frame-state)
