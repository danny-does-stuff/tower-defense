import distance from 'euclidean-distance'

import { GRID_CELL_SIZE } from './constants'
import { ArrayPath, Enemy, TowerType, TOWER_TYPES, UpgradeEffect, ITower } from './types'

export function getTimeToTarget(
	origin: [number, number, number],
	destination: [number, number, number],
	speed: number
): number {
	return getTimeToTravelDistance(distance(origin, destination), speed)
}

export function getFutureLocation(
	enemy: Enemy,
	path: ArrayPath,
	time: number
): [number, number] | null {
	for (let i = enemy.currentCellIndex; i < path.length && time > 0; i++) {
		const location: [number, number] | null =
			i === enemy.currentCellIndex ? [enemy.x, enemy.y] : getPathLocation(path, i)
		const nextLocation = getPathLocation(path, i + 1)
		if (!nextLocation) {
			return location
		}

		const nextDistance = distance(location, nextLocation)
		const timeToTravelNextDistance = getTimeToTravelDistance(nextDistance, enemy.speed)
		if (time <= timeToTravelNextDistance) {
			if (!location) {
				return null
			}
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

export function getPathLocation(path: ArrayPath, pathIndex: number): [number, number] | null {
	const targetCell = path[pathIndex]

	if (!targetCell) {
		return null
	}

	const [targetCellX, targetCellY] = targetCell
	return [targetCellX * GRID_CELL_SIZE, targetCellY * GRID_CELL_SIZE]
}

export function getSpeedVector(enemy: Enemy, path: ArrayPath): [number, number] {
	const targetLocation = getPathLocation(path, enemy.currentCellIndex + 1)
	if (!targetLocation) {
		throw new Error('not getting a targetLocation')
	}

	const diffX = targetLocation[0] - enemy.x
	const diffY = targetLocation[1] - enemy.y

	const x = diffX > 0 ? 1 : diffX > 0 ? -1 : 0
	const y = diffY > 0 ? 1 : diffY > 0 ? -1 : 0
	return [x * enemy.speed, y * enemy.speed]
}

/**
 * Calculates the point of interception for one object starting at point
 * <code>a</code> with speed vector <code>v</code> and another object
 * starting at point <code>b</code> with a speed of <code>s</code>.
 *
 * @see <a
 *      href="http://jaran.de/goodbits/2011/07/17/calculating-an-intercept-course-to-a-target-with-constant-direction-and-velocity-in-a-2-dimensional-plane/">Calculating
 *      an intercept course to a target with constant direction and velocity
 *      (in a 2-dimensional plane)</a>
 *
 * @param a
 *            start vector of the object to be intercepted
 * @param v
 *            speed vector of the object to be intercepted
 * @param b
 *            start vector of the intercepting object
 * @param s
 *            speed of the intercepting object
 * @return vector of interception or <code>null</code> if object cannot be
 *         intercepted or calculation fails
 *
 * @author Jens Seiler
 */
export function calculateTimeToInterception(
	a: [number, number],
	v: [number, number],
	b: [number, number],
	s: number
): number | null {
	const ox = a[0] - b[0]
	const oy = a[1] - b[1]

	const h1 = v[0] * v[0] + v[1] * v[1] - s * s
	const h2 = ox * v[0] + oy * v[1]
	let t
	if (h1 == 0) {
		// problem collapses into a simple linear equation
		t = -(ox * ox + oy * oy) / (2 * h2)
	} else {
		// solve the quadratic equation
		const minusPHalf = -h2 / h1

		const discriminant = minusPHalf * minusPHalf - (ox * ox + oy * oy) / h1 // term in brackets is h3
		if (discriminant < 0) {
			// no (real) solution then...
			return null
		}

		const root = Math.sqrt(discriminant)

		const t1 = minusPHalf + root
		const t2 = minusPHalf - root

		const tMin = Math.min(t1, t2)
		const tMax = Math.max(t1, t2)

		t = tMin > 0 ? tMin : tMax // get the smaller of the two times, unless it's negative
		if (t < 0) {
			// we don't want a solution in the past
			return null
		}
	}

	// calculate the point of interception using the found intercept time and return it
	// return [a[0] + t * v[0], a[1] + t * v[1]]

	return t * 1000
}

/**
 * A type safe way to get the keys from an object
 */
export const getKeys = <T extends Record<string, unknown>>(o: T): Array<keyof T> =>
	<Array<keyof T>>Object.keys(o)

export function getDamage({ type, upgrades }: ITower): number {
	let damage = TOWER_TYPES[type].damage
	for (const upgrade of upgrades) {
		if (upgrade.damage) {
			damage += upgrade.damage
		}
	}
	return damage
}
