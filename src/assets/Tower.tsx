import React, { useRef, useState } from 'react'
import { useFrame } from 'react-three-fiber'
import { BULLET_SPEED, TOWER_SIZE } from '../constants'
import { Enemy, TowerType, TOWER_TYPES } from '../types'

export default function Tower({
	x,
	y,
	type,
	onShoot,
	target,
}: {
	x: number
	y: number
	type: TowerType
	onShoot: (origin: [number, number, number], bulletSpeed: number) => void
	target: Enemy | null
}): JSX.Element {
	const shootRef = useRef(30)
	// Set up state for the hovered and active state
	const [hovered, setHover] = useState(false)
	const [active, setActive] = useState(false)

	useFrame(() => {
		if (!target) {
			return
		}
		shootRef.current++
		if (shootRef.current >= 40) {
			shootRef.current = 0
			onShoot([x, y, TOWER_SIZE * 0.75], BULLET_SPEED)
		}
	})
	const position: [number, number, number] = [x, y, TOWER_SIZE / 2]

	return (
		<mesh
			position={position}
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
			<meshStandardMaterial color={hovered ? 'orange' : getColorForTowerType(type)} />
		</mesh>
	)
}

function getColorForTowerType(type: TowerType) {
	return TOWER_TYPES[type].color
}
