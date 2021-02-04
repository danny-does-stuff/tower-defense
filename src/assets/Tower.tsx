import React, { useRef, useState } from 'react'
import { useFrame } from 'react-three-fiber'
import { TOWER_SIZE } from '../constants'

export default function Tower({ x, y, color }: { x: number; y: number; color: string }) {
	// This reference will give us direct access to the mesh
	const mesh = useRef()

	// Set up state for the hovered and active state
	const [hovered, setHover] = useState(false)
	const [active, setActive] = useState(false)

	// Rotate mesh every frame, this is outside of React without overhead
	useFrame(() => {
		const currentMesh = mesh.current
		if (currentMesh) {
			// currentMesh.rotation.y += 0.01
			// currentMesh.rotation.x += 0.01
		}
	})
	const position: [number, number, number] = [x, y, TOWER_SIZE / 2]

	return (
		<mesh
			position={position}
			ref={mesh}
			scale={[1, 1, 1]}
			onClick={(e) => {
				e.stopPropagation()
				setActive(!active)
			}}
			onPointerOver={(e) => {
				e.stopPropagation()
				setHover(true)
			}}
			onPointerOut={() => setHover(false)}
		>
			<boxBufferGeometry args={[TOWER_SIZE, TOWER_SIZE, TOWER_SIZE]} />
			<meshStandardMaterial color={hovered ? 'orange' : color} />
		</mesh>
	)
}
