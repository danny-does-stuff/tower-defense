import React from 'react'
import { useFrame } from 'react-three-fiber'
import { ENEMY_SIZE, ENEMY_SPEED } from '../constants'

export default function Enemy({
	x,
	y,
	targetLocation,
	onUpdate,
}: {
	x: number
	y: number
	targetLocation: [number, number] | null
}) {
	useFrame((_, delta) => {
		if (!targetLocation) {
			// ??
		}
		const [targetX, targetY] = targetLocation

		const update = {}

		if (x !== targetX) {
			if (x < targetX) {
				update.x = Math.min(x + delta * ENEMY_SPEED, targetX)
			} else if (x > targetX) {
				update.x = Math.max(x - delta * ENEMY_SPEED, targetX)
			}
		}

		if (y !== targetY) {
			if (y < targetY) {
				update.y = Math.min(y + delta * ENEMY_SPEED, targetY)
			} else if (y > targetY) {
				update.y = Math.max(y - delta * ENEMY_SPEED, targetY)
			}
		}

		onUpdate(update)
	})

	const position: [number, number, number] = [x, y, ENEMY_SIZE]

	return (
		<mesh position={position} scale={[1, 1, 1]}>
			<tetrahedronBufferGeometry args={[ENEMY_SIZE, 0]} />
			<meshStandardMaterial color={'blue'} />
		</mesh>
	)
}
