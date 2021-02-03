import React, { useState, useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import {Canvas, useThree, extend, useFrame} from 'react-three-fiber'
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js'
import Tower from './assets/Tower'
import Enemy from './assets/Enemy'
import Bullet from './assets/Bullet'
import './App.css'
extend({ FlyControls })

function Controls() {
	const { camera } = useThree()
	const ref = useRef()
	useFrame((state, delta) => ref.current.update(delta))
	return <flyControls ref={ref} args={[camera]} />
}

const GRID_CELL_SIZE = 15

const GRID_SIZE = 20

const MAP_WIDTH = GRID_CELL_SIZE * GRID_SIZE

function Camera() {
	const ref = useRef()
	const { setDefaultCamera } = useThree()
	// This makes sure that size-related calculations are proper
	// Every call to useThree will return this camera instead of the default camera 
	useEffect(() => {
		setDefaultCamera(ref.current)
		ref.current.lookAt(MAP_WIDTH / 2, MAP_WIDTH / 2, 0)
		ref.current.rotateZ(-0.40)
	}, [])
	return <perspectiveCamera ref={ref} position={[100, -150, 100]}  rotation={[ 0,Math.PI / 2,  0]}/>
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

function App() {
	const [towers, setTowers] = useState([])

	const [path, pathArray] = useMemo(getPath, [])

	return (
		<div className="App">
			<Canvas  >
				<ambientLight intensity={0.3}/>
				<pointLight position={[MAP_WIDTH/2, 400, MAP_WIDTH/2]} />
				<axesHelper args={[1000]}/>
				<gridHelper args={[MAP_WIDTH * 2, (MAP_WIDTH / GRID_CELL_SIZE) * 2, 'white', 'gray']} rotation={[Math.PI /2, 0, 0]}/>
				<Camera />
				{/* <Controls /> */}
				{towers.map(tower => 
					<Tower x={(tower.x*GRID_CELL_SIZE) + (GRID_CELL_SIZE/2)} y={tower.y*GRID_CELL_SIZE + GRID_CELL_SIZE / 2} color={'hotpink'} key={tower.id}/>
				)}
				<Ground onClick={(x, y) => setTowers(towers => [...towers, {id: nextTowerId++, x, y}])} path={path}/>
				<Enemies path={pathArray} />
				<Bullets />
			</Canvas>
		</div>
	)
}

let nextTowerId = 0

const GROUND_HEIGHT = 10

function Ground({onClick, path}: {onClick: (number, number) => mixed}) {
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
					position={[(i*GRID_CELL_SIZE) + (GRID_CELL_SIZE/2), j*GRID_CELL_SIZE + GRID_CELL_SIZE / 2, -GROUND_HEIGHT / 2]}
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
					onPointerOut={() => setHoveredGrid(null)}>
					
					<boxBufferGeometry args={[GRID_CELL_SIZE, GRID_CELL_SIZE, GROUND_HEIGHT]} />
					<meshStandardMaterial color={color}/>
				</mesh>
			)
		}
	}
  
	return grounds
}

const ENEMY_GRIDS_PER_SECOND = 2
const ENEMY_SPEED = ENEMY_GRIDS_PER_SECOND * GRID_CELL_SIZE

function Enemies({path}: {path: Array<[number, number]>}) {
	const [currentCellIndex, setCurrentCellIndex] = useState(0)
	const [x, setX] = useState<number>(path[currentCellIndex][0] * GRID_CELL_SIZE)
	const [y, setY] = useState(path[currentCellIndex][1] * GRID_CELL_SIZE)
	
	function getTargetLocation(): [number, number] | null {
		const targetCell = path[currentCellIndex + 1] 

		if (!targetCell) {
			return null
		}

		const [targetCellX, targetCellY] = targetCell
		return [targetCellX * GRID_CELL_SIZE, targetCellY * GRID_CELL_SIZE]
	}

	useFrame((_, delta) => {
		const targetLocation = getTargetLocation()
		if (!targetLocation) {
			// ??
		}
		const [targetX, targetY] = targetLocation

		if (x !== targetX) {
			setX(x => {
				if (x < targetX) {
					return Math.min(x + delta * ENEMY_SPEED, targetX)
				} else if (x > targetX) {
					return Math.max(x - delta * ENEMY_SPEED, targetX)
				}
				return x
			})
		}

		if (y !== targetY) {
			console.log(targetX, targetY)
			setY(y => {
				if (y < targetY) {
					return Math.min(y + delta * ENEMY_SPEED, targetY)
				} else if (y > targetY) {
					return Math.max(y - delta * ENEMY_SPEED, targetY)
				}
				return y
			})
		}
	})

	useEffect(() => {
		const targetLocation = getTargetLocation()
		if (!targetLocation) {
			// ??
		}
		if (x === targetLocation[0] && y === targetLocation[1]) {
			setCurrentCellIndex(i => i + 1)
		}
	}, [x, y])

	return <>
		<Enemy x={x} y={y} currentLocation={''}/>
	</>
}

function Bullets() {
	return <Bullet position={[100, 0, 50]} />
}

export default App
