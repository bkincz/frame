/*
 *   IMPORTS
 ***************************************************************************************************/
import { FrameAPI } from '@/core'
import { useFrameRouter } from '@/hooks/useFrameRouter'

/*
 *   COMPONENT
 *   Demo component showing flow chaining capabilities
 ***************************************************************************************************/
export function FlowChainingDemo() {
	const { currentFlow, currentStepKey, hasHistory } = useFrameRouter()

	return (
		<div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
			<h3>Flow Chaining Demo</h3>

			{/* Current State */}
			<div style={{ marginBottom: '20px', padding: '10px', background: '#f5f5f5' }}>
				<p>
					<strong>Current Flow:</strong> {currentFlow || 'None'}
				</p>
				<p>
					<strong>Current Step:</strong> {currentStepKey || 'None'}
				</p>
				<p>
					<strong>Has History:</strong> {hasHistory ? 'Yes' : 'No'}
				</p>
			</div>

			{/* Navigation Buttons */}
			<div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
				{/* Open Another Flow (Chains) */}
				<button
					onClick={() => FrameAPI.openFlow('example')}
					style={{
						padding: '8px 16px',
						background: '#007bff',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						cursor: 'pointer',
					}}
				>
					Open Example Flow (Chain)
				</button>

				{/* Replace Flow */}
				<button
					onClick={() => FrameAPI.replaceFlow('example')}
					style={{
						padding: '8px 16px',
						background: '#6c757d',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						cursor: 'pointer',
					}}
				>
					Replace with Example Flow
				</button>

				{/* Go Back */}
				{hasHistory && (
					<button
						onClick={() => FrameAPI.goBack()}
						style={{
							padding: '8px 16px',
							background: '#28a745',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer',
						}}
					>
						← Go Back
					</button>
				)}

				{/* Close Flow */}
				<button
					onClick={() => FrameAPI.closeFlow()}
					style={{
						padding: '8px 16px',
						background: '#dc3545',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						cursor: 'pointer',
					}}
				>
					✕ Close
				</button>
			</div>

			{/* Instructions */}
			<div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
				<p>
					<strong>How it works:</strong>
				</p>
				<ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
					<li>
						<strong>Chain:</strong> Opens a new flow while keeping current flow in
						history
					</li>
					<li>
						<strong>Replace:</strong> Opens a new flow without adding to history
					</li>
					<li>
						<strong>Go Back:</strong> Returns to previous flow in history (only shows if
						history exists)
					</li>
					<li>
						<strong>Close:</strong> Closes the frame and clears all history
					</li>
				</ul>
			</div>
		</div>
	)
}
