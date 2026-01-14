# Frame

A high-performance React multi-step flow system with animations, navigation history, and optional URL routing.

## Installation

```bash
npm install @bkincz/frame
# or
pnpm add @bkincz/frame
# or
yarn add @bkincz/frame
```

## Quick Start

### 1. Setup Flow Registry

Create your flows and register them before using Frame:

```tsx
// app.tsx or main.tsx
import { setFlowRegistry } from '@bkincz/frame'

// Define your flow
const createCheckoutFlow = () => ({
  flow: {
    cart: {
      components: [CartStep],
    },
    payment: {
      components: [PaymentStep],
    },
    confirmation: {
      components: [ConfirmationStep],
    },
  },
})

// Register flows
setFlowRegistry({
  checkout: {
    factory: createCheckoutFlow,
    title: 'Checkout',
    description: 'Complete your purchase',
  },
})
```

### 2. Add FrameContainer

Add the `FrameContainer` component to your app root:

```tsx
import { FrameContainer } from '@bkincz/frame'

function App() {
  return (
    <>
      <YourApp />
      <FrameContainer debug={false} />
    </>
  )
}
```

### 3. Open a Flow

Use the FrameAPI to open flows from anywhere in your app:

```tsx
import { FrameAPI } from '@bkincz/frame'

function MyComponent() {
  return (
    <button onClick={() => FrameAPI.openFlow('checkout')}>
      Start Checkout
    </button>
  )
}
```

## FrameAPI

The FrameAPI provides imperative methods to control flows:

```tsx
import { FrameAPI } from '@bkincz/frame'

// Open a flow (chains to history)
FrameAPI.openFlow('checkout')
FrameAPI.openFlow('checkout', 'payment') // Open at specific step

// Replace current flow (clears history)
FrameAPI.replaceFlow('login')

// Navigate within flow
FrameAPI.nextStep()
FrameAPI.previousStep()

// Navigation utilities
FrameAPI.goBack() // Smart back (previous step or close)
FrameAPI.closeFlow()
FrameAPI.clearHistory()

// Check state
const hasHistory = FrameAPI.hasHistory()
```

## Frame Components

Frame provides composable UI components for building your flows:

### Basic Layout

```tsx
import { Frame } from '@bkincz/frame'

function MyStep() {
  return (
    <>
      <Frame.Heading>Welcome</Frame.Heading>
      <Frame.Subheading>Let's get started</Frame.Subheading>

      {/* Your content */}

      <Frame.Navigation>
        <Frame.Back />
        <Frame.Next />
      </Frame.Navigation>
    </>
  )
}
```

### Grid Layout

```tsx
function MyStep() {
  return (
    <Frame.Grid>
      <Frame.Main>
        {/* Main content */}
      </Frame.Main>

      <Frame.Sidebar>
        {/* Sidebar content */}
      </Frame.Sidebar>
    </Frame.Grid>
  )
}
```

### Custom Navigation

```tsx
function MyStep() {
  return (
    <>
      <Frame.Heading>Step Title</Frame.Heading>

      <Frame.Navigation>
        {/* Custom buttons instead of default Back/Next */}
        <button onClick={() => FrameAPI.closeFlow()}>
          Cancel
        </button>
        <button onClick={() => FrameAPI.nextStep()}>
          Continue
        </button>
      </Frame.Navigation>
    </>
  )
}
```

### Available Components

- `<Frame>` - Root container
- `<Frame.Overlay>` - Overlay backdrop
- `<Frame.Content>` - Content wrapper
- `<Frame.Close>` - Close button (top-right)
- `<Frame.Heading>` - Step heading
- `<Frame.Subheading>` - Step subheading
- `<Frame.Grid>` - Two-column grid layout
- `<Frame.Main>` - Main content area (in Grid)
- `<Frame.Sidebar>` - Sidebar area (in Grid)
- `<Frame.Navigation>` - Navigation button container
- `<Frame.Back>` - Back button (auto-hides/closes intelligently)
- `<Frame.Next>` - Next button (auto-hides/closes intelligently)
- `<Frame.Step>` - Renders step components from flow definition

## Creating Flows

### Flow Definition

A flow is a factory function that returns a flow definition:

```tsx
import type { FlowDefinition } from '@bkincz/frame'

export const createMyFlow = (): FlowDefinition => ({
  flow: {
    stepKey1: {
      components: [Component1, Component2],
    },
    stepKey2: {
      components: [Component3],
    },
  },
})
```

### Step Components

Step components are just React components:

```tsx
function CartStep() {
  return (
    <>
      <Frame.Heading>Your Cart</Frame.Heading>

      {/* Your cart UI */}

      <Frame.Navigation>
        <Frame.Back />
        <Frame.Next>Continue to Payment</Frame.Next>
      </Frame.Navigation>
    </>
  )
}
```

### Flow Chaining

Flows can open other flows, creating a navigation history:

```tsx
function LoginStep() {
  return (
    <>
      <Frame.Heading>Login</Frame.Heading>

      <button onClick={() => FrameAPI.openFlow('forgot-password')}>
        Forgot Password?
      </button>

      <Frame.Navigation>
        <Frame.Back />
        <Frame.Next>Login</Frame.Next>
      </Frame.Navigation>
    </>
  )
}
```

When users navigate back from 'forgot-password', they return to the login flow.

## Hooks

Frame provides React hooks for advanced use cases:

### useNavigationState

Get navigation button state for custom navigation:

```tsx
import { useNavigationState } from '@bkincz/frame'

function CustomNavigation() {
  const backState = useNavigationState({ direction: 'back' })
  const nextState = useNavigationState({ direction: 'next' })

  return (
    <div>
      <button
        onClick={backState.onClick}
        disabled={backState.isDisabled}
        style={{ display: backState.isHidden ? 'none' : 'block' }}
      >
        {backState.label}
      </button>

      <button
        onClick={nextState.onClick}
        disabled={nextState.isDisabled}
      >
        {nextState.label}
      </button>
    </div>
  )
}
```

### useFlowLifecycle

React to flow lifecycle events:

```tsx
import { useFlowLifecycle } from '@bkincz/frame'

function MyStep() {
  useFlowLifecycle({
    onEnter: (flow) => {
      console.log('Flow opened:', flow)
    },
    onExit: (flow) => {
      console.log('Flow closed:', flow)
    },
  })

  return <div>Content</div>
}
```

### useStepLifecycle

React to step lifecycle events:

```tsx
import { useStepLifecycle } from '@bkincz/frame'

function MyStep() {
  useStepLifecycle({
    onEnter: (stepKey) => {
      console.log('Step entered:', stepKey)
      // Track analytics, fetch data, etc.
    },
    onExit: (stepKey) => {
      console.log('Step exited:', stepKey)
    },
  })

  return <div>Content</div>
}
```

### useFrameAnimations

Access animation controls (advanced):

```tsx
import { useFrameAnimations } from '@bkincz/frame'

function MyComponent() {
  const { animateFrameEntrance, animateFrameExit } = useFrameAnimations()

  // Custom animation logic
}
```

## Configuration

### FrameContainer Props

```tsx
interface FrameContainerProps {
  debug?: boolean  // Enable debug logging (default: false)
}
```

### Flow Registry

```tsx
import {
  setFlowRegistry,
  registerFlow,
  unregisterFlow,
  clearFlowRegistry,
  getFlowRegistry
} from '@bkincz/frame'

// Set entire registry
setFlowRegistry({
  flow1: { factory, title, description },
  flow2: { factory, title, description },
})

// Add individual flow
registerFlow('flow3', { factory, title, description })

// Remove flow
unregisterFlow('flow3')

// Clear all
clearFlowRegistry()

// Get current registry
const registry = getFlowRegistry()
```

## Helper Functions

Frame provides utility functions for working with flows:

```tsx
import {
  getFlowEntry,
  flowExists,
  getAvailableFlows,
  getFlowMetadata,
  getFlowStepKeys,
  isValidStepKey,
  getFirstStepKey,
  getNextStepKey,
  getPreviousStepKey,
  isFirstStepOfRootFlow,
  isLastStepOfLeafFlow,
} from '@bkincz/frame'

// Check if flow exists
if (flowExists('checkout')) {
  FrameAPI.openFlow('checkout')
}

// Get all available flows
const flows = getAvailableFlows()
// ['checkout', 'login', 'signup']

// Get flow metadata
const metadata = getFlowMetadata('checkout')
// { title: 'Checkout', description: '...' }

// Get step keys
const steps = getFlowStepKeys('checkout')
// ['cart', 'payment', 'confirmation']

// Validate step key
if (isValidStepKey('checkout', 'payment')) {
  FrameAPI.openFlow('checkout', 'payment')
}
```

## Framework Integration

### Next.js App Router

```tsx
// app/layout.tsx
import { FrameContainer, setFlowRegistry } from '@bkincz/frame'
import { createCheckoutFlow } from './flows/checkout'

// Register flows
setFlowRegistry({
  checkout: {
    factory: createCheckoutFlow,
    title: 'Checkout',
  },
})

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
import { FrameContainer, setFlowRegistry } from '@bkincz/frame'
import { createCheckoutFlow } from '../flows/checkout'

setFlowRegistry({
  checkout: {
    factory: createCheckoutFlow,
    title: 'Checkout',
  },
})

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
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { FrameContainer, setFlowRegistry } from '@bkincz/frame'
import { createCheckoutFlow } from './flows/checkout'

setFlowRegistry({
  checkout: {
    factory: createCheckoutFlow,
    title: 'Checkout',
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <FrameContainer />
  </StrictMode>
)
```

## TypeScript

Frame is written in TypeScript and provides full type definitions:

```tsx
import type {
  FlowDefinition,
  FlowFactory,
  FlowRegistry,
  FlowRegistryEntry,
  FlowStep,
} from '@bkincz/frame'

const createMyFlow: FlowFactory = () => {
  return {
    flow: {
      step1: {
        components: [MyComponent],
      },
    },
  }
}
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- React 18+
- TypeScript 5+

## License

MIT

## Credits

Built with:
- [React](https://react.dev/)
- [Clutch](https://github.com/bkincz/clutch) - State management
- [GSAP](https://greensock.com/gsap/) - Animations
- [TypeScript](https://www.typescriptlang.org/)
