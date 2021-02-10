import React, { useState, useRef, useEffect, useMemo, Suspense } from 'react'
import * as THREE from 'three'
import { Canvas, useThree, extend } from 'react-three-fiber'
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js'
import Tower from './assets/Tower'
import Enemy from './assets/Enemy'
import Bullet from './assets/Bullet'
import Ground from './components/Ground'
import { GRID_CELL_SIZE, GRID_SIZE, MAP_WIDTH, ENEMY_SIZE, ENEMY_SPEED } from './constants'
import './App.css'
import {
	getTimeToTarget,
	getFutureLocation,
	getPathLocation,
	calculateTimeToInterception,
	getSpeedVector,
} from './helpers'

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

interface EnemyType {
	currentCellIndex: number
	x: number
	y: number
	speed: number
	hp: number
	futureHp: number
	id: number
}

let enemyId = 0

function getEnemy(path): EnemyType {
	return {
		currentCellIndex: 0,
		x: path[0][0],
		y: path[0][1],
		speed: ENEMY_SPEED,
		hp: 100,
		futureHp: 100,
		id: enemyId++,
	}
}

function App() {
	const [towers, setTowers] = useState([])
	const [path, pathArray] = useMemo(getPath, [])
	const [enemies, setEnemies] = useState<{ number: EnemyType }>(() => {
		const enemy = getEnemy(pathArray)

		return {
			[enemy.id]: enemy,
		}
	})
	const [bullets, setBullets] = useState<BulletType[]>([])

	const firstEnemy: EnemyType | null = Object.values(enemies).reduce((result, currentEnemy) => {
		if (!result) {
			if (currentEnemy.futureHp > 0) {
				return currentEnemy
			}
			return null
		}

		if (currentEnemy.currentCellIndex > result.currentCellIndex && currentEnemy.futureHp > 0) {
			return currentEnemy
		}
		return result
	}, null)

	return (
		<div className="App">
			<Canvas>
				<Suspense fallback={null}>
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
							target={firstEnemy}
							onShoot={(origin, bulletSpeed) => {
								const timeToInterception = calculateTimeToInterception(
									[firstEnemy.x, firstEnemy.y],
									getSpeedVector(firstEnemy, pathArray),
									[origin[0], origin[1]],
									bulletSpeed
								)
								if (!timeToInterception) {
									throw new Error('Tower is unable to shoot that thing')
								}

								const interceptionPoint = getFutureLocation(
									firstEnemy,
									pathArray,
									timeToInterception
								)
								console.log(firstEnemy.x, firstEnemy.y, interceptionPoint)

								setEnemies((enemies) => {
									const targettedEnemy = enemies[firstEnemy.id]
									return {
										...enemies,
										[targettedEnemy.id]: {
											...targettedEnemy,
											futureHp: targettedEnemy.futureHp - 10,
										},
									}
								})

								setBullets((bullets) => [
									...bullets,
									{
										origin,
										destination: [...interceptionPoint, ENEMY_SIZE / 2],
										speed: bulletSpeed,
										startTime: new Date(),
										targetEnemy: firstEnemy.id,
									},
								])
							}}
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
					<Bullets
						bullets={bullets}
						removeBullet={(bulletToRemove) => {
							setEnemies((enemies) => {
								const newEnemies = { ...enemies }
								const hitEnemyId = bulletToRemove.targetEnemy
								newEnemies[hitEnemyId] = {
									...newEnemies[hitEnemyId],
									hp: newEnemies[hitEnemyId].hp - 10,
								}
								if (newEnemies[hitEnemyId].hp === 0) {
									delete newEnemies[hitEnemyId]
								}
								return newEnemies
							})
							setBullets((bullets) => bullets.filter((bullet) => bullet !== bulletToRemove))
						}}
					/>
				</Suspense>
			</Canvas>
		</div>
	)
}

let nextTowerId = 0

function Enemies({
	path,
	enemies,
	onUpdate,
}: {
	path: Array<[number, number]>
	enemies: { number: EnemyType }
	onUpdate: (string, {}) => mixed
}) {
	return Object.values(enemies).map((enemy) => {
		const targetLocation = getPathLocation(path, enemy.currentCellIndex + 1)

		if (!targetLocation) {
			return null
		}

		const [targetX, targetY] = targetLocation

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

interface BulletType {
	origin: [number, number, number]
	destination: [number, number, number]
	startTime: Date
	speed: number
	targetEnemy: number
}

function Bullets({
	bullets,
	removeBullet,
}: {
	bullets: BulletType[]
	removeBullet: (bullet: BulletType) => void
}) {
	return bullets.map((bullet) => (
		<Bullet
			{...bullet}
			onFinish={() => {
				removeBullet(bullet)
			}}
			key={`${bullet.startTime}${bullet.origin.join('')}${bullet.destination.join('')}`}
		/>
	))
}

export default App
