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
- **Inert Management** - Automatically makes background non-interactive in modal mode with exclusion list support
- **Navigation Management** - Intelligent back/next buttons with flow chaining support
- **Flow Params** - Pass typed data when opening a flow, accessible anywhere via `useFrameParams<T>()`
- **Conditional Step Skipping** - Declaratively skip steps based on runtime conditions with `skipIf`
- **Next.js Compatible** - Built-in browser back interception that hands off cleanly to Next.js router
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
FrameAPI.openFlow('checkout', 'payment', { instanceId: '123' }) // With params

// Replace current flow (clears history)
FrameAPI.replaceFlow('login')
FrameAPI.replaceFlow('login', undefined, { redirect: '/dashboard' }) // With params

// Navigate within flow
FrameAPI.nextStep()
FrameAPI.previousStep()
FrameAPI.goBack() // Smart back (previous step or close)
FrameAPI.closeFlow()

// Manage flow history
FrameAPI.clearHistory()
const hasFlowHistory = FrameAPI.hasHistory()
```

### Flow Params

Pass arbitrary data when opening a flow. Params are accessible in any step component via `useFrameParams<T>()`, persist across chained flows (new params merge over existing), and are cleared when the frame closes.

```tsx
import { FrameAPI, useFrameParams } from '@bkincz/frame'

// Pass params when opening
FrameAPI.openFlow('checkout', 'payment', {
  instanceId: '123',
  redirect: '/dashboard',
})

// Read params in any step component
function PaymentStep() {
  const { instanceId, redirect } = useFrameParams<{
    instanceId: string
    redirect: string
  }>()

  return <div>Processing order {instanceId}</div>
}
```

When flows chain, params merge and new params take priority over existing ones. Use `replaceFlow` to start fresh with only the new params.

### Step Skipping

Navigate directly to any step while maintaining accurate history:

```tsx
import { FrameAPI } from '@bkincz/frame'

// Skip to any step in the current flow
FrameAPI.goToStep('payment')     // Jump from step 1 to payment
FrameAPI.goToStep('confirmation') // Skip ahead
FrameAPI.goToStep('cart')        // Jump backward

// Navigate back through your exact path
FrameAPI.goBackInStepHistory()  // Returns to previous step in history

// Check and manage step history
if (FrameAPI.hasStepHistory()) {
  // Show "undo" or step history back button
}
FrameAPI.clearStepHistory()
```

**How Step History Works:**

When you skip steps using `goToStep()`, each visited step is recorded. This allows users to retrace their exact navigation path:

```tsx
// User's navigation: cart → payment → confirmation → cart
FrameAPI.openFlow('checkout', 'cart')
FrameAPI.goToStep('payment')      // History: [cart]
FrameAPI.goToStep('confirmation') // History: [cart, payment]
FrameAPI.goToStep('cart')         // History: [cart, payment, confirmation]

// Going back retraces the path:
FrameAPI.goBackInStepHistory()    // → confirmation
FrameAPI.goBackInStepHistory()    // → payment
FrameAPI.goBackInStepHistory()    // → cart
```

Step history is automatically cleared when:
- Switching to a different flow
- Closing the frame
- Reopening a closed flow

### Conditional Step Skipping

Use `skipIf` on a step to skip it declaratively based on a runtime condition. The step is skipped before it renders.

```tsx
export const createCheckoutFlow = (): FlowDefinition => ({
  flow: {
    'address': {
      components: [AddressStep],
      heading: 'Shipping Address',
    },
    'shipping-options': {
      components: [ShippingStep],
      heading: 'Shipping Options',
      // Skip if user only has digital items
      skipIf: () => cartStore.isDigitalOnly(),
    },
    'payment': {
      components: [PaymentStep],
      heading: 'Payment',
    },
  },
})
```

Multiple consecutive steps can have `skipIf`. Frame will advance through them until it finds a step that does not skip.

### Custom Layouts per Flow/Step

Define custom layouts directly in your flow or step configuration. This is useful when different flows or steps require completely different visual structures:

```tsx
import type { FlowDefinition, FrameRenderProps } from '@bkincz/frame'
import { DefaultFrameLayout } from '@bkincz/frame'

// Custom layout for a specific flow
const WizardLayout = ({ refs, handlers, state, Frame }: FrameRenderProps) => (
  <Frame>
    <Frame.Content ref={refs.content} variant={state.variant}>
      <div className="wizard-layout">
        <aside className="wizard-sidebar">
          {/* Custom step indicator */}
        </aside>
        <Frame.Main ref={refs.stepWrapper}>
          {state.currentStep && <Frame.Step step={state.currentStep} />}
        </Frame.Main>
      </div>
    </Frame.Content>
  </Frame>
)

// Minimal layout for confirmation steps
const MinimalLayout = ({ refs, state, Frame }: FrameRenderProps) => (
  <Frame>
    <Frame.Content ref={refs.content} variant={state.variant}>
      <Frame.Main ref={refs.stepWrapper}>
        {state.currentStep && <Frame.Step step={state.currentStep} />}
      </Frame.Main>
    </Frame.Content>
  </Frame>
)

export const createCheckoutFlow = (): FlowDefinition => ({
  flow: {
    cart: {
      components: [CartStep],
      heading: 'Your Cart',
      subheading: 'Review your items',
      // This step uses the flow-level layout
    },
    payment: {
      components: [PaymentStep],
      heading: 'Payment',
      // This step uses the flow-level layout
    },
    confirmation: {
      components: [ConfirmationStep],
      heading: 'Order Complete',
      config: {
        layout: MinimalLayout, // Step-specific layout override
      },
    },
  },
  config: {
    variant: 'modal',
    layout: WizardLayout, // Flow-level layout (default for all steps)
  },
})
```

**Layout Priority:**

Layouts are resolved in this order (first match wins):
1. Step-level layout (`step.config.layout`)
2. Flow-level layout (`flow.config.layout`)
3. FrameContainer children render prop
4. DefaultFrameLayout (built-in)

This allows you to:
- Set a default layout for an entire flow
- Override specific steps with custom layouts
- Fall back to the FrameContainer's render prop or default layout

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

### Inert Management

When using modal variant, Frame automatically makes background content non-interactive and hidden from screen readers using the `inert` attribute and `aria-hidden`. This ensures proper accessibility and prevents focus from escaping the modal.

**Automatic Behavior:**
- In modal mode: Background elements become inert (enabled by default)
- In fullscreen mode: No inert management applied
- Frame container is always excluded from inert state

**Configuration:**

```tsx
// Flow-level configuration
export const createCheckoutFlow = (): FlowDefinition => ({
  flow: {
    // ... steps
  },
  config: {
    variant: 'modal',
    inert: {
      enabled: true,  // Default: true (only applies in modal mode)
      excludeSelectors: [
        '#persistent-header',    // Keep header interactive
        '.always-accessible',    // Keep certain elements accessible
        '[data-persistent]',     // Custom data attributes
      ],
    },
  },
})

// Step-level override
export const createCheckoutFlow = (): FlowDefinition => ({
  flow: {
    payment: {
      heading: 'Payment',
      components: [PaymentStep],
      config: {
        variant: 'modal',
        inert: {
          enabled: true,
          excludeSelectors: ['#chat-widget'],  // Keep chat widget accessible
        },
      },
    },
  },
  config: {
    variant: 'modal',
  },
})

// Disable inert management for a specific step
export const createCheckoutFlow = (): FlowDefinition => ({
  flow: {
    'special-step': {
      heading: 'Special Step',
      components: [SpecialStep],
      config: {
        variant: 'modal',
        inert: {
          enabled: false,  // Disable inert management for this step
        },
      },
    },
  },
})
```

**Browser Support:**
- The `inert` attribute is natively supported in modern browsers
- For older browsers, consider using a polyfill like [wicg-inert](https://github.com/WICG/inert)

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

### `useFrameParams<T>()`

Access params passed to `FrameAPI.openFlow()` from any step component:

```tsx
import { useFrameParams } from '@bkincz/frame'

function CheckoutStep() {
  const { orderId, returnUrl } = useFrameParams<{
    orderId: string
    returnUrl: string
  }>()

  return <div>Order: {orderId}</div>
}
```

Returns an empty object `{}` if no params were passed. Params are cleared on frame close.

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
  config?: FlowConfig           // Optional
  onEnter?: () => void | Promise<void>
  onExit?: () => void | Promise<void>
}

interface FlowConfig {
  variant?: 'modal' | 'fullscreen'  // Default: 'fullscreen'
  sidebar?: boolean  // Default: true (auto-hidden in modal)
  layout?: FrameRenderFunction  // Custom layout for all steps in flow
  inert?: {
    enabled?: boolean  // Default: true in modal mode
    excludeSelectors?: string[]  // CSS selectors to exclude from inert
  }
}

interface FlowStep {
  components: React.ComponentType[]
  heading?: string | ReactNode   // Optional, supports rich content
  subheading?: string | ReactNode
  skipIf?: () => boolean         // Skip this step if returns true
  config?: {
    variant?: 'modal' | 'fullscreen'
    sidebar?: boolean
    layout?: FrameRenderFunction  // Custom layout for this step only
    inert?: {
      enabled?: boolean  // Default: true in modal mode
      excludeSelectors?: string[]  // CSS selectors to exclude from inert
    }
  }
  onEnter?: () => void | Promise<void>
  onExit?: () => void | Promise<void>
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

### Next.js Router Compatibility

When Frame is open, browser back navigation is handled by Frame rather than Next.js. When the frame closes, control returns to Next.js automatically.

No configuration required. Works with both the Pages Router and App Router.

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

import { useFrameParams } from '@bkincz/frame'

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

**Flow Navigation:**
- `openFlow(flowName, stepKey?, params?)` - Open flow (chains to history)
- `replaceFlow(flowName, stepKey?, params?)` - Replace flow (clears history)
- `closeFlow()` - Close current flow
- `goBack()` - Smart back navigation

**Step Navigation:**
- `nextStep()` - Navigate to next step
- `previousStep()` - Navigate to previous step
- `goToStep(stepKey)` - Skip to any step (tracks history)
- `goBackInStepHistory()` - Go back through step history

**History Management:**
- `hasHistory()` - Check if flow history exists
- `clearHistory()` - Clear flow navigation history
- `hasStepHistory()` - Check if step history exists
- `clearStepHistory()` - Clear step navigation history

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
