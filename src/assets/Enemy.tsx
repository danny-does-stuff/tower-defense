import React from 'react'
import {useFrame} from 'react-three-fiber'
import { GRID_CELL_SIZE } from '../constants'
const SIZE = 5

const GRID_CELLS_PER_SECOND = 5
const SPEED = GRID_CELLS_PER_SECOND * GRID_CELL_SIZE

export default function Enemy({x, y, targetLocation, onUpdate }: {x: number, y: number, targetLocation: [number, number] | null }) {
	useFrame((_, delta) => {
		if (!targetLocation) {
			// ??
		}
		const [targetX, targetY] = targetLocation
        
		const update = {}

		if (x !== targetX) {
			if (x < targetX) {
				update.x = Math.min(x + delta * SPEED, targetX)
			} else if (x > targetX) {
				update.x = Math.max(x - delta * SPEED, targetX)
			}
		}

		if (y !== targetY) {
			if (y < targetY) {
				update.y = Math.min(y + delta * SPEED, targetY)
			} else if (y > targetY) {
				update.y = Math.max(y - delta * SPEED, targetY)
			}
		}

		onUpdate(update)
	})


	const position: [number, number, number] = [x, y, SIZE]

	return <mesh
		position={position}
		scale={[1, 1, 1]}>
		<tetrahedronBufferGeometry args={[SIZE, 0]} />
		<meshStandardMaterial color={'blue'}/>
	</mesh>
}