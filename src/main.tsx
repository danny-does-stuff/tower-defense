import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

const containerDomNode = document.getElementById('root')
if (!containerDomNode) throw new Error('Failed to find the root element')
const root = createRoot(containerDomNode)
root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
)
