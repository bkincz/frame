---
sidebar_position: 1
---

# Creating Flows

Learn how to create custom flows for your Frame application.

## What is a Flow?

A **flow** is a multi-step form or process displayed in the Frame modal. Each flow consists of:

- Multiple **steps** (screens)
- Navigation between steps
- A flow component that handles rendering

## Step 1: Create the Flow Component

Create a new file in `src/flows/` directory:

```tsx title="src/flows/onboarding.flow.tsx"
import type { FlowProps } from '@/core/frame.registry'

export function OnboardingFlow({ step, onNext, onPrevious, onClose }: FlowProps) {
  return (
    <div style={{ padding: '32px' }}>
      {step === 1 && (
        <div>
          <h2>Welcome!</h2>
          <p>Let's get you set up in just a few steps.</p>
          <button onClick={onNext}>Get Started</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2>Tell us about yourself</h2>
          <form>
            <input type="text" placeholder="Your name" />
            <input type="email" placeholder="Your email" />
          </form>
          <button onClick={onPrevious}>Back</button>
          <button onClick={onNext}>Continue</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2>All set!</h2>
          <p>You're ready to go.</p>
          <button onClick={onClose}>Finish</button>
        </div>
      )}
    </div>
  )
}
```

## Step 2: Export the Flow

Add your flow to the barrel export:

```tsx title="src/flows/index.ts"
export { OnboardingFlow } from './onboarding.flow'
```

## Step 3: Register the Flow

Register your flow in the Flow Registry:

```tsx title="src/core/frame.registry.ts"
import { OnboardingFlow } from '@/flows'

export const FLOW_REGISTRY: FlowRegistry = {
  onboarding: {
    component: OnboardingFlow,
    maxSteps: 3,
    title: 'Onboarding',
    description: 'Get started with our platform',
  },
  // ... other flows
}
```

## Step 4: Test Your Flow

Navigate to:

```
http://localhost:5173/?flow=onboarding&step=1
```

## Flow Props

Every flow component receives these props:

```tsx
interface FlowProps {
  step: number              // Current step (1-indexed)
  onNext?: () => void      // Go to next step
  onPrevious?: () => void  // Go to previous step
  onClose?: () => void     // Close the frame
}
```

## Best Practices

### 1. Conditional Rendering by Step

Use conditional rendering to show different content per step:

```tsx
{step === 1 && <StepOne />}
{step === 2 && <StepTwo />}
{step === 3 && <StepThree />}
```

### 2. Validate maxSteps

Always set `maxSteps` to match your flow's total steps:

```tsx
{
  component: OnboardingFlow,
  maxSteps: 3,  // Must match highest step number
}
```

### 3. Handle Edge Cases

Disable navigation buttons at flow boundaries:

```tsx
{step === 1 && (
  <div>
    {/* No previous button on first step */}
    <button onClick={onNext}>Next</button>
  </div>
)}

{step === maxSteps && (
  <div>
    <button onClick={onPrevious}>Back</button>
    {/* Close instead of next on last step */}
    <button onClick={onClose}>Finish</button>
  </div>
)}
```

### 4. Use State for Form Data

Store form data in component state:

```tsx
export function OnboardingFlow({ step, onNext, onPrevious, onClose }: FlowProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    preferences: []
  })

  const handleSubmit = () => {
    // Save data
    console.log(formData)
    onClose()
  }

  return (
    // ... render form with formData
  )
}
```

### 5. Add Loading States

Handle async operations gracefully:

```tsx
const [loading, setLoading] = useState(false)

const handleNext = async () => {
  setLoading(true)
  try {
    await saveData()
    onNext?.()
  } catch (error) {
    console.error(error)
  } finally {
    setLoading(false)
  }
}
```

## Advanced Patterns

### Dynamic Step Count

Calculate steps based on user data:

```tsx
export function DynamicFlow({ step, onNext, onPrevious, onClose }: FlowProps) {
  const [requiresVerification, setRequiresVerification] = useState(false)

  const totalSteps = requiresVerification ? 4 : 3

  // Adjust flow based on totalSteps
}
```

### Shared Components

Extract common UI into reusable components:

```tsx
// src/flows/components/FlowButtons.tsx
export function FlowButtons({
  step,
  maxSteps,
  onNext,
  onPrevious,
  onClose
}) {
  return (
    <div className="flow-buttons">
      {step > 1 && <button onClick={onPrevious}>Back</button>}
      {step < maxSteps && <button onClick={onNext}>Next</button>}
      {step === maxSteps && <button onClick={onClose}>Finish</button>}
    </div>
  )
}
```

### Custom Validation

Validate before allowing navigation:

```tsx
const [isValid, setIsValid] = useState(false)

const handleNext = () => {
  if (!isValid) {
    alert('Please complete all required fields')
    return
  }
  onNext?.()
}

return (
  <button onClick={handleNext} disabled={!isValid}>
    Next
  </button>
)
```

## Styling Flows

### Option 1: Inline Styles

```tsx
<div style={{ padding: '32px', maxWidth: '600px' }}>
  {/* Flow content */}
</div>
```

### Option 2: CSS Modules

```tsx
import styles from './onboarding.module.scss'

export function OnboardingFlow() {
  return (
    <div className={styles.container}>
      {/* Flow content */}
    </div>
  )
}
```

### Option 3: Styled Components

```tsx
import styled from 'styled-components'

const Container = styled.div`
  padding: 32px;
  max-width: 600px;
`

export function OnboardingFlow() {
  return (
    <Container>
      {/* Flow content */}
    </Container>
  )
}
```

## Next Steps

- [Integrate with Next.js](./nextjs-integration)
- [Learn about debugging](./debugging)
- [Explore architecture](../architecture/overview)
