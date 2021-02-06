import distance from 'euclidean-distance'

import { GRID_CELL_SIZE } from './constants'

export function getTimeToTarget(
	origin: [number, number, number],
	destination: [number, number, number],
	speed: number
): number {
	return getTimeToTravelDistance(distance(origin, destination), speed)
}

export function getFutureLocation(enemy, path, time: number): [number, number] {
	for (let i = enemy.currentCellIndex; i < path.length && time > 0; i++) {
		const location = i === enemy.currentCellIndex ? [enemy.x, enemy.y] : getPathLocation(path, i)
		const nextLocation = getPathLocation(path, i + 1)
		if (!nextLocation) {
			return location
		}

		const nextDistance = distance(location, nextLocation)
		const timeToTravelNextDistance = getTimeToTravelDistance(nextDistance, enemy.speed)
		if (time <= timeToTravelNextDistance) {
			const percentageOfDistanceToTravel = time / timeToTravelNextDistance
			return linearInterpolation(location, nextLocation, percentageOfDistanceToTravel)
		} else {
			time -= timeToTravelNextDistance
		}
	}
	throw new Error('should not happen')
}

function linearInterpolation(
	point1: [number, number],
	point2: [number, number],
	percentage: number
): [number, number] {
	return [
		point1[0] + (point2[0] - point1[0]) * percentage,
		point1[1] + (point2[1] - point1[1]) * percentage,
	]
}

export function getTimeToTravelDistance(distance: number, speed: number): number {
	return (distance / speed) * 1000
}

export function getPathLocation(path, pathIndex: number): [number, number] | null {
	const targetCell = path[pathIndex]

	if (!targetCell) {
		return null
	}

	const [targetCellX, targetCellY] = targetCell
	return [targetCellX * GRID_CELL_SIZE, targetCellY * GRID_CELL_SIZE]
}
