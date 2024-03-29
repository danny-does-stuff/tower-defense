import React, { useState } from 'react'
import { useTexture } from '@react-three/drei'
import { GRID_SIZE, GRID_CELL_SIZE, GROUND_HEIGHT } from '../constants'
import grassImage from '../assets/grasslight-big.jpg'
import { MeshProps } from '@react-three/fiber'
import { IndexedPath } from '../types'

export default function Ground({
	onClick,
	path,
	canPlace,
}: {
	onClick: (x: number, y: number) => void
	canPlace: boolean
	path: IndexedPath
}): JSX.Element {
	const grounds = []
	const [hoveredGrid, setHoveredGrid] = useState<[number, number] | null>(null)

	for (let i = 0; i < GRID_SIZE; i++) {
		for (let j = 0; j < GRID_SIZE; j++) {
			const isInPath = path[i]?.[j]
			const position: [number, number, number] = [
				i * GRID_CELL_SIZE + GRID_CELL_SIZE / 2,
				j * GRID_CELL_SIZE + GRID_CELL_SIZE / 2,
				-GROUND_HEIGHT / 2,
			]

			const commonProps = {
				position,
				key: `${i}-${j}`,
			}
			if (hoveredGrid && hoveredGrid[0] === i && hoveredGrid[1] === j) {
				grounds.push(
					<HoveredGrass
						{...commonProps}
						onPointerOver={(e) => e.stopPropagation()}
						onPointerOut={() => setHoveredGrid(null)}
						onClick={(e) => {
							e.stopPropagation()
							if (canPlace) {
								onClick(i, j)
							}
						}}
					/>
				)
			} else if (isInPath) {
				grounds.push(<Path {...commonProps} />)
			} else {
				grounds.push(
					<Grass
						{...commonProps}
						onPointerOver={(e) => {
							e.stopPropagation()
							if ((e.faceIndex === 8 || e.faceIndex === 9) && canPlace) {
								// Only accept events on the top of the cube
								setHoveredGrid([i, j])
							}
						}}
					/>
				)
			}
		}
	}

	return <>{grounds}</>
}

function Path({ position }: { position: [number, number, number] }) {
	return (
		<mesh
			position={position}
			onClick={(e) => {
				e.stopPropagation()
			}}
			onPointerOver={(e) => {
				e.stopPropagation()
			}}
		>
			<boxGeometry args={[GRID_CELL_SIZE, GRID_CELL_SIZE, GROUND_HEIGHT]} />
			<meshStandardMaterial color={'brown'} />
		</mesh>
	)
}

function Grass({ position, ...rest }: { position: [number, number, number] } & MeshProps) {
	const grassTexture = useTexture(grassImage)

	return (
		<mesh position={position} {...rest}>
			<boxGeometry args={[GRID_CELL_SIZE, GRID_CELL_SIZE, GROUND_HEIGHT]} />
			<meshStandardMaterial map={grassTexture} />
		</mesh>
	)
}

function HoveredGrass({ position, ...rest }: { position: [number, number, number] } & MeshProps) {
	return (
		<mesh position={position} {...rest}>
			<boxGeometry args={[GRID_CELL_SIZE, GRID_CELL_SIZE, GROUND_HEIGHT]} />
			<meshStandardMaterial color={'gold'} />
		</mesh>
	)
}
