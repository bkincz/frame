/*
 *   BASE
 ***************************************************************************************************/
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

/*
 *   STYLES
 ***************************************************************************************************/
import '@/styles/global.scss'

/*
 *   COMPONENTS
 ***************************************************************************************************/
import { FrameContainer } from '@/core/frame.container'

/*
 *   APPLICATION ENTRY
 ***************************************************************************************************/
const rootElement = document.getElementById('hh-root')
if (!rootElement) {
	throw new Error('Root element not found')
}

createRoot(rootElement).render(
	<StrictMode>
		<FrameContainer debug={true} />
	</StrictMode>
)
