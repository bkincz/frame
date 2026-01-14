[![Release](https://github.com/bkincz/frame/actions/workflows/release.yml/badge.svg?branch=master)](https://github.com/bkincz/frame/actions/workflows/release.yml)
[![npm version](https://badge.fury.io/js/@bkincz%2Fframe.svg)](https://badge.fury.io/js/@bkincz%2Fframe)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

# Frame

A production-ready, TypeScript-first React multi-step flow system with animations, navigation history, and customizable layouts.

## Features

- **Multi-Step Flows** - Create complex, nested flows with automatic navigation history
- **Animations** - Smooth GSAP-powered transitions between steps and flows
- **Customizable Layouts** - Full control via render props or use the built-in responsive grid
- **Modal & Fullscreen** - Switch between centered modals and fullscreen layouts per flow or step
- **Navigation Management** - Intelligent back/next buttons with flow chaining support
- **Type Safety** - Full TypeScript support with comprehensive type definitions
- **Framework Agnostic** - Works with Next.js, Vite, Create React App, and more
- **Lifecycle Hooks** - React to flow and step events for analytics, data fetching, etc.

## Installation

```bash
npm install @bkincz/frame
# or
yarn add @bkincz/frame
# or
pnpm add @bkincz/frame
```

## Quick Start

### 1. Define Your Flow

```tsx
// flows/checkout.tsx
import type { FlowDefinition } from '@bkincz/frame'

export const createCheckoutFlow = (): FlowDefinition => ({
  flow: {
    cart: {
      components: [CartStep],
      heading: 'Your Cart',
      subheading: 'Review your items',
    },
    payment: {
      components: [PaymentStep],
      heading: 'Payment',
    },
    confirmation: {
      components: [ConfirmationStep],
      heading: 'Order Complete',
    },
  },
  config: {
    variant: 'modal', // or 'fullscreen'
  },
})
```

### 2. Register Your Flows

```tsx
// app.tsx or main.tsx
import { setFlowRegistry } from '@bkincz/frame'
import { createCheckoutFlow } from './flows/checkout'

setFlowRegistry({
  checkout: {
    factory: createCheckoutFlow,
    title: 'Checkout',
    description: 'Complete your purchase',
  },
})
```

### 3. Add FrameContainer

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

### 4. Open Flows

```tsx
import { FrameAPI } from '@bkincz/frame'

function ProductPage() {
  return (
    <button onClick={() => FrameAPI.openFlow('checkout')}>
      Checkout
    </button>
  )
}
```

## Core Features

### Flow Navigation

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
FrameAPI.goBack() // Smart back (previous step or close)
FrameAPI.closeFlow()

// Manage history
FrameAPI.clearHistory()
const hasHistory = FrameAPI.hasHistory()
```

### Step Components

Write simple React components for each step:

```tsx
import { Frame } from '@bkincz/frame'

function CartStep() {
  return (
    <>
      {/* Heading and subheading can be set in flow definition or here */}
      <Frame.Heading>Your Cart</Frame.Heading>
      <Frame.Subheading>Review your items before checkout</Frame.Subheading>

      {/* Your cart UI */}
      <div className="cart-items">
        {/* Cart items... */}
      </div>

      {/* Navigation automatically manages back/next/close */}
      <Frame.Navigation>
        <Frame.Back />
        <Frame.Next>Continue to Payment</Frame.Next>
      </Frame.Navigation>
    </>
  )
}
```

### Flow Chaining

Flows can open other flows, maintaining navigation history:

```tsx
function LoginStep() {
  return (
    <>
      <Frame.Heading>Login</Frame.Heading>

      {/* Opens nested flow - back button returns to login */}
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

## Frame Components

### Available Components

- `<Frame>` - Root container
- `<Frame.Overlay>` - Overlay backdrop (modal variant)
- `<Frame.Content>` - Content wrapper
- `<Frame.Close>` - Close button
- `<Frame.Heading>` - Step heading
- `<Frame.Subheading>` - Step subheading
- `<Frame.Grid>` - Two-column grid layout
- `<Frame.Main>` - Main content area
- `<Frame.Sidebar>` - Sidebar area
- `<Frame.Navigation>` - Navigation container
- `<Frame.Back>` - Back button (intelligent auto-hide/close)
- `<Frame.Next>` - Next button (intelligent auto-hide/close)
- `<Frame.Step>` - Renders step components

### Grid Layout

```tsx
function MyStep() {
  return (
    <Frame.Grid>
      <Frame.Main>
        <Frame.Heading>Main Content</Frame.Heading>
        {/* Your main content */}
      </Frame.Main>

      <Frame.Sidebar>
        {/* Sidebar content (hidden on mobile/tablet, hidden in modal variant) */}
      </Frame.Sidebar>

      <Frame.Navigation>
        <Frame.Back />
        <Frame.Next />
      </Frame.Navigation>
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
        {/* Replace default navigation with custom buttons */}
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

## React Hooks

### `useNavigationState(options)`

Get navigation state for custom UI:

```tsx
import { useNavigationState } from '@bkincz/frame'

function CustomNavigation() {
  const backState = useNavigationState({ direction: 'previous' })
  const nextState = useNavigationState({ direction: 'next' })

  return (
    <nav>
      {!backState.isHidden && (
        <button 
          onClick={() => FrameAPI.previousStep()} 
          disabled={backState.isDisabled}
        >
          Back
        </button>
      )}
      
      <button 
        onClick={() => FrameAPI.nextStep()} 
        disabled={nextState.isDisabled}
      >
        Next
      </button>
    </nav>
  )
}
```

## Customization

Frame provides full control over layout structure through render props.

### Default Layout

```tsx
<FrameContainer debug={false} />
```

### Custom Layout with Render Props

```tsx
<FrameContainer debug={false}>
  {({ refs, handlers, state, Frame }) => (
    <Frame>
      {state.showOverlay && (
        <Frame.Overlay ref={refs.overlay} onClick={handlers.handleOverlayClick} />
      )}
      <Frame.Content
        ref={refs.content}
        onClick={handlers.stopPropagation}
        variant={state.variant}
      >
        <div className="my-custom-layout">
          <Frame.Close />
          
          <Frame.Main ref={refs.stepWrapper}>
            {state.currentStep && (
              <>
                {state.currentStep.heading && (
                  <Frame.Heading>{state.currentStep.heading}</Frame.Heading>
                )}
                <Frame.Step step={state.currentStep} />
              </>
            )}
          </Frame.Main>

          {/* Custom navigation placement */}
          <div className="custom-nav">
            <Frame.Back />
            <Frame.Next />
          </div>
        </div>
      </Frame.Content>
    </Frame>
  )}
</FrameContainer>
```

### Render Props API

**`refs`** - Required element references:
- `refs.overlay` - Attach to `Frame.Overlay` (modal variant)
- `refs.content` - Attach to `Frame.Content` (required)
- `refs.stepWrapper` - Attach to `Frame.Main` (required for transitions)

**`handlers`** - Pre-configured event handlers:
- `handlers.closeFrame()` - Close with animation
- `handlers.stopPropagation(event)` - Prevent event bubbling
- `handlers.handleOverlayClick()` - Close on overlay click

**`state`** - Current frame state:
- `state.isOpen` - Whether frame is open
- `state.currentFlow` - Current flow name
- `state.currentStepKey` - Current step key
- `state.currentStep` - Current step definition
- `state.variant` - Frame variant (`'modal'` | `'fullscreen'`)
- `state.showOverlay` - Whether to show overlay
- `state.showSidebar` - Whether to show sidebar

**`Frame`** - The Frame component with all sub-components

### Required Elements

Custom layouts must include:
- `<Frame>` - Root container
- `<Frame.Content ref={refs.content}>` - Content container
- `<Frame.Main ref={refs.stepWrapper}>` - Step wrapper
- `<Frame.Step step={state.currentStep} />` - Step renderer
- `<Frame.Overlay ref={refs.overlay} />` - Only if `state.showOverlay === true`

## Configuration

### FrameContainer Props

```tsx
interface FrameContainerProps {
  debug?: boolean  // Enable debug logging (default: false)
  children?: FrameRenderFunction  // Optional render function for custom layouts
}
```

### Flow Configuration

```tsx
interface FlowDefinition {
  flow: Record<string, FlowStep>
  config?: FlowConfig
  onEnter?: (flowName: string) => void
  onExit?: (flowName: string) => void
}

interface FlowConfig {
  variant?: 'modal' | 'fullscreen'  // Default: 'fullscreen'
  sidebar?: boolean  // Default: true (auto-hidden in modal)
}

interface FlowStep {
  components: React.ComponentType[]
  heading?: string
  subheading?: string
  config?: {
    variant?: 'modal' | 'fullscreen'
    sidebar?: boolean
  }
  onEnter?: (stepKey: string) => void
  onExit?: (stepKey: string) => void
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
  checkout: { 
    factory: createCheckoutFlow, 
    title: 'Checkout',
    description: 'Complete your purchase',
  },
  login: { 
    factory: createLoginFlow, 
    title: 'Login' 
  },
})

// Add individual flow
registerFlow('signup', {
  factory: createSignupFlow,
  title: 'Sign Up',
})

// Remove flow
unregisterFlow('signup')

// Clear all
clearFlowRegistry()

// Get current registry
const registry = getFlowRegistry()
```

## Utility Functions

```tsx
import {
  flowExists,
  getAvailableFlows,
  getFlowMetadata,
  getFlowStepKeys,
  isValidStepKey,
  getFirstStepKey,
  getNextStepKey,
  getPreviousStepKey,
} from '@bkincz/frame'

// Check if flow exists
if (flowExists('checkout')) {
  FrameAPI.openFlow('checkout')
}

// Get all flow names
const flows = getAvailableFlows()
// ['checkout', 'login', 'signup']

// Get flow metadata
const metadata = getFlowMetadata('checkout')
// { title: 'Checkout', description: '...' }

// Get step keys for a flow
const steps = getFlowStepKeys('checkout')
// ['cart', 'payment', 'confirmation']

// Validate step
if (isValidStepKey('checkout', 'payment')) {
  FrameAPI.openFlow('checkout', 'payment')
}
```

## Framework Integration

### Next.js App Router

```tsx
// app/layout.tsx
import { FrameContainer, setFlowRegistry } from '@bkincz/frame'
import '@bkincz/frame/styles'
import { createCheckoutFlow } from './flows/checkout'

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
import '@bkincz/frame/styles'
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

### Vite / Create React App

```tsx
// main.tsx or index.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { FrameContainer, setFlowRegistry } from '@bkincz/frame'
import '@bkincz/frame/styles'
import { createCheckoutFlow } from './flows/checkout'
import App from './App'

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

Full TypeScript support with comprehensive type definitions:

```tsx
import type {
  // Flow types
  FlowDefinition,
  FlowFactory,
  FlowConfig,
  FlowStep,
  FlowRegistry,
  FlowRegistryEntry,
  FrameVariant,
  // Customization types
  FrameRenderProps,
  FrameRenderFunction,
  FrameRefs,
  FrameHandlers,
  FrameState,
} from '@bkincz/frame'

// Typed flow factory
const createMyFlow: FlowFactory = () => ({
  flow: {
    step1: {
      components: [MyComponent],
      heading: 'Step 1',
    },
  },
  config: {
    variant: 'modal',
  },
})

// Typed custom layout
function CustomLayout(props: FrameRenderProps) {
  const { refs, handlers, state, Frame } = props
  return (
    <Frame>
      <Frame.Content ref={refs.content} variant={state.variant}>
        <Frame.Main ref={refs.stepWrapper}>
          {state.currentStep && <Frame.Step step={state.currentStep} />}
        </Frame.Main>
      </Frame.Content>
    </Frame>
  )
}
```

## API Reference

### FrameAPI

- `openFlow(flowName, stepKey?)` - Open flow (chains to history)
- `replaceFlow(flowName, stepKey?)` - Replace flow (clears history)
- `nextStep()` - Navigate to next step
- `previousStep()` - Navigate to previous step
- `goBack()` - Smart back navigation
- `closeFlow()` - Close current flow
- `clearHistory()` - Clear navigation history
- `hasHistory()` - Check if history exists

### Flow Registry

- `setFlowRegistry(registry)` - Set entire registry
- `registerFlow(name, entry)` - Register single flow
- `unregisterFlow(name)` - Unregister flow
- `clearFlowRegistry()` - Clear all flows
- `getFlowRegistry()` - Get current registry

### Utility Functions

- `flowExists(name)` - Check if flow exists
- `getAvailableFlows()` - Get all flow names
- `getFlowMetadata(name)` - Get flow metadata
- `getFlowStepKeys(name)` - Get step keys
- `isValidStepKey(flowName, stepKey)` - Validate step
- `getFirstStepKey(flowName)` - Get first step
- `getNextStepKey(flowName, currentKey)` - Get next step
- `getPreviousStepKey(flowName, currentKey)` - Get previous step
- `isFirstStepOfRootFlow()` - Check if first step of root
- `isLastStepOfLeafFlow()` - Check if last step of leaf

## License

MIT
