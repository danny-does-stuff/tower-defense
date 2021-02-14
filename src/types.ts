export interface Enemy {
	currentCellIndex: number
	x: number
	y: number
	speed: number
	hp: number
	futureHp: number
	id: number
}

export interface Tower {
	id: number
	x: number
	y: number
}

export interface Bullet {
	origin: [number, number, number]
	destination: [number, number, number]
	startTime: Date
	speed: number
	targetEnemy: number
}

export type ArrayPath = Array<[number, number]>
export type IndexedPath = Record<number, Record<number, true>>
