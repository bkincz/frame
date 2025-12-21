# Frame

A high-performance React multi-step flow system with navigation history, and URL routing.

## Quick Start

### Installation

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Open browser to test
# http://localhost:5173/?flow=example&step=1
```

## Project Structure

```
frame/
├── src/
│   ├── core/              # Core Frame system
│   │   ├── frame.component.tsx      # Frame UI components
│   │   ├── frame.container.tsx      # Main orchestrator
│   │   ├── frame.api.ts             # Public API
│   │   ├── frame.registry.ts        # Flow registry
│   │   ├── frame.functions.ts       # Helper functions
│   │   └── frame.animations.ts      # GSAP animations
│   ├── flows/             # Flow implementations
│   │   ├── example/                 # Example flow
│   │   └── flow.types.ts            # Flow type definitions
│   ├── hooks/             # React hooks
│   │   ├── useFrameRouter.ts        # Frame routing hook
│   │   └── useQueryParams.ts        # URL query params
│   ├── state/             # State management
│   │   └── frame.state.ts           # Frame state (Clutch)
│   ├── lib/               # Utilities
│   │   ├── event.ts                 # Event manager
│   │   └── router.ts                # URL router
│   └── styles/            # Global SCSS
├── docs/                  # Documentation (Docusaurus)
└── dist/                  # Build output
```

## Scripts

```bash
# Development
pnpm dev              # Start dev server (http://localhost:5173)
pnpm build            # Build for production
pnpm preview          # Preview production build

# Code Quality
pnpm lint             # ESLint check
pnpm lint:fix         # Fix linting issues
pnpm format           # Prettier format
pnpm format:check     # Check formatting
pnpm tsc              # TypeScript check

# Documentation
pnpm docs:dev         # Start docs site (http://localhost:3000)
pnpm docs:build       # Build documentation
pnpm docs:serve       # Serve built docs
```

## Integration

### Next.js App Router

```tsx
// app/layout.tsx
import { FrameContainer } from '@/core'

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body>
				{children}
				<FrameContainer />
			</body>
		</html>
	)
}
```

### Next.js Pages Router

```tsx
// pages/_app.tsx
import { FrameContainer } from '@/core'

export default function App({ Component, pageProps }) {
	return (
		<>
			<Component {...pageProps} />
			<FrameContainer />
		</>
	)
}
```

### Standalone React

```tsx
// main.tsx
import { FrameContainer } from '@/core'

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<App />
		<FrameContainer />
	</React.StrictMode>
)
```

## Configuration

### URL Routing (Optional)

```tsx
<FrameContainer
	updateUrl={true} // Enable URL sync (default: true)
	flowParam="flow" // URL param name (default: "flow")
	stepParam="step" // URL param name (default: "step")
	debug={false} // Debug logging (default: false)
/>
```

### Without URL Routing

```tsx
;<FrameContainer updateUrl={false} />

// Use API or events to control
FrameAPI.openFlow('checkout')
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- React 19+
- TypeScript 5.6+

## Documentation

Full documentation and interactive examples:

```bash
pnpm docs:dev
```

Visit [http://localhost:3000](http://localhost:3000)

## License

MIT

## Acknowledgments

Built with:

- [React 19](https://react.dev/)
- [Clutch](https://github.com/bkincz/clutch) - State management
- [Vite](https://vitejs.dev/) - Build tool
- [TypeScript](https://www.typescriptlang.org/)
