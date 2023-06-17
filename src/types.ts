export interface Enemy {
	currentCellIndex: number
	x: number
	y: number
	speed: number
	hp: number
	futureHp: number
	id: number
}

export type UpgradeEffect = { damage?: number; shotsPerSecond?: number }

export const TOWER_TYPES = {
	BASIC: {
		type: 'BASIC',
		name: 'Basic Tower',
		cost: 50,
		damage: 10,
		shotsPerSecond: 0.66,
		range: 3,
		color: 'hotpink',
		upgradePaths: [
			[
				{ name: 'Damage 1', cost: 50, effect: { damage: 10 } },
				{ name: 'Damage 2', cost: 100, effect: { damage: 25 } },
			],
			[],
		],
	},

	ICE: {
		type: 'ICE',
		name: 'Ice Tower',
		cost: 75,
		damage: 7.5,
		color: 'lightblue',
		effects: {
			SLOW: {
				value: 0.25,
			},
		},
	},
}

export type TowerType = keyof typeof TOWER_TYPES

export interface ITower {
	id: number
	x: number
	y: number
	type: TowerType
	upgrades: UpgradeEffect[]
}

export interface Bullet {
	origin: [number, number, number]
	destination: [number, number, number]
	startTime: Date
	speed: number
	targetEnemy: number
	originTower: ITower
}

export type ArrayPath = Array<[number, number]>
export type IndexedPath = Record<number, Record<number, true>>
