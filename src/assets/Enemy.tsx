import React from 'react'
import { useFrame } from '@react-three/fiber'
import { ENEMY_SIZE } from '../constants'
import { Enemy as EnemyType } from '../types'

export default function Enemy({
	x,
	y,
	targetLocation,
	speed,
	onUpdate,
}: {
	x: number
	y: number
	targetLocation: [number, number] | null
	speed: number
	onUpdate: (updateValue: Partial<EnemyType>) => void
}): JSX.Element {
	useFrame((_, delta) => {
		if (!targetLocation) {
			throw new Error('There is no targetLocation')
			// ??
		}
		const [targetX, targetY] = targetLocation

		const update: Partial<EnemyType> = {}

		if (x !== targetX) {
			if (x < targetX) {
				update.x = Math.min(x + delta * speed, targetX)
			} else if (x > targetX) {
				update.x = Math.max(x - delta * speed, targetX)
			}
		}

		if (y !== targetY) {
			if (y < targetY) {
				update.y = Math.min(y + delta * speed, targetY)
			} else if (y > targetY) {
				update.y = Math.max(y - delta * speed, targetY)
			}
		}

		onUpdate(update)
	})

	return (
		<mesh position={[x, y, ENEMY_SIZE]} scale={[1, 1, 1]}>
			<tetrahedronGeometry args={[ENEMY_SIZE, 0]} />
			<meshStandardMaterial color={'blue'} />
		</mesh>
	)
}
