import React, { useState, useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { Canvas, useThree, extend, useFrame } from 'react-three-fiber'
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js'
import Tower from './assets/Tower'
import Enemy from './assets/Enemy'
import Bullet from './assets/Bullet'
import { GRID_CELL_SIZE, GRID_SIZE, MAP_WIDTH, GROUND_HEIGHT } from './constants'
import './App.css'
extend({ FlyControls })

function Camera() {
	const ref = useRef()
	const { setDefaultCamera } = useThree()
	// This makes sure that size-related calculations are proper
	// Every call to useThree will return this camera instead of the default camera
	useEffect(() => {
		setDefaultCamera(ref.current)
		ref.current.lookAt(MAP_WIDTH / 2, MAP_WIDTH / 2, 0)
		ref.current.rotateZ(-0.4)
	}, [])
	return <perspectiveCamera ref={ref} position={[100, -150, 100]} rotation={[0, Math.PI / 2, 0]} />
}

function getPath() {
	const pathArray = []
	const indexedPath = {}
	function addToPath(x: number, y: number) {
		pathArray.push([x, y])

		if (!indexedPath[x]) {
			indexedPath[x] = {}
		}

		indexedPath[x][y] = true
	}
	for (let i = 0; i < GRID_SIZE - 1; i++) {
		addToPath(1, i)
	}
	for (let i = 2; i < GRID_SIZE - 1; i++) {
		addToPath(i, GRID_SIZE - 2)
	}
	for (let i = GRID_SIZE - 3; i >= 0; i--) {
		addToPath(GRID_SIZE - 2, i)
	}
	return [indexedPath, pathArray]
}

function getEnemy(path) {
	return { currentCellIndex: 0, x: path[0][0], y: path[0][1] }
}

function App() {
	const [towers, setTowers] = useState([])
	const [path, pathArray] = useMemo(getPath, [])
	const [enemies, setEnemies] = useState({
		0: { ...getEnemy(pathArray), id: 0 },
	})

	return (
		<div className="App">
			<Canvas>
				<ambientLight intensity={0.3} />
				<pointLight position={[MAP_WIDTH / 2, 400, MAP_WIDTH / 2]} />
				<axesHelper args={[1000]} />
				<gridHelper
					args={[MAP_WIDTH * 2, (MAP_WIDTH / GRID_CELL_SIZE) * 2, 'white', 'gray']}
					rotation={[Math.PI / 2, 0, 0]}
				/>
				<Camera />
				{/* <Controls /> */}
				{towers.map((tower) => (
					<Tower
						x={tower.x * GRID_CELL_SIZE + GRID_CELL_SIZE / 2}
						y={tower.y * GRID_CELL_SIZE + GRID_CELL_SIZE / 2}
						color={'hotpink'}
						key={tower.id}
					/>
				))}
				<Ground
					onClick={(x, y) => setTowers((towers) => [...towers, { id: nextTowerId++, x, y }])}
					path={path}
				/>
				<Enemies
					path={pathArray}
					enemies={enemies}
					onUpdate={(enemyId, update) => {
						setEnemies((enemies) => {
							const newEnemies = { ...enemies }
							newEnemies[enemyId] = { ...newEnemies[enemyId], ...update }
							return newEnemies
						})
					}}
				/>
				<Bullets />
			</Canvas>
		</div>
	)
}

let nextTowerId = 0

function Ground({ onClick, path }: { onClick: (number, number) => mixed }) {
	const grounds = []
	const [hoveredGrid, setHoveredGrid] = useState(null)

	for (let i = 0; i < GRID_SIZE; i++) {
		for (let j = 0; j < GRID_SIZE; j++) {
			const isInPath = path[i]?.[j]
			let color = hoveredGrid && hoveredGrid[0] === i && hoveredGrid[1] === j ? 'gold' : 'green'
			if (isInPath) {
				color = 'brown'
			}
			grounds.push(
				<mesh
					position={[
						i * GRID_CELL_SIZE + GRID_CELL_SIZE / 2,
						j * GRID_CELL_SIZE + GRID_CELL_SIZE / 2,
						-GROUND_HEIGHT / 2,
					]}
					onClick={(e) => {
						if (isInPath) {
							return
						}
						e.stopPropagation()
						onClick(i, j)
					}}
					onPointerOver={(e) => {
						e.stopPropagation()
						setHoveredGrid([i, j])
					}}
					onPointerOut={() => setHoveredGrid(null)}
				>
					<boxBufferGeometry args={[GRID_CELL_SIZE, GRID_CELL_SIZE, GROUND_HEIGHT]} />
					<meshStandardMaterial color={color} />
				</mesh>
			)
		}
	}

	return grounds
}

function Enemies({
	path,
	enemies,
	onUpdate,
}: {
	path: Array<[number, number]>
	enemies: Enemy
	onUpdate: (string, {}) => mixed
}) {
	return Object.values(enemies).map((enemy) => {
		const targetCell = path[enemy.currentCellIndex + 1]

		if (!targetCell) {
			return null
		}

		const [targetCellX, targetCellY] = targetCell
		const targetX = targetCellX * GRID_CELL_SIZE
		const targetY = targetCellY * GRID_CELL_SIZE
		return (
			<Enemy
				key={enemy.id}
				{...enemy}
				targetLocation={[targetX, targetY]}
				onUpdate={(update) => {
					const yIsUpToDate = (update.y || enemy.y) === targetY
					const xIsUpToDate = (update.x || enemy.x) === targetX

					if (yIsUpToDate && xIsUpToDate) {
						update.currentCellIndex = enemy.currentCellIndex + 1
					}

					onUpdate(enemy.id, update)
				}}
			/>
		)
	})
}

function Bullets() {
	return <Bullet position={[100, 0, 50]} />
}

export default App
