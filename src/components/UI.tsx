import React, { useState } from 'react'
import { useSpring, animated } from '@react-spring/web'
import { getKeys } from '../helpers'
import { TowerType, TOWER_TYPES } from '../types'

export default function UI({
	onSelectTowerToBuy,
	moneyz,
}: {
	onSelectTowerToBuy: (towerType: TowerType) => void
	moneyz: number
}): JSX.Element {
	const [towerSelectorOpen, setTowerSelectorOpen] = useState(true)
	return (
		<>
			<TowerSelector
				visible={towerSelectorOpen}
				onSelect={onSelectTowerToBuy}
				onClose={() => setTowerSelectorOpen(false)}
				moneyz={moneyz}
			/>
			<div
				style={{
					position: 'absolute',
					bottom: 0,
					backgroundColor: 'gray',
					width: '100%',
					display: 'flex',
					justifyContent: 'space-between',
				}}
			>
				<span>Moneyz: {moneyz}</span>
				<button onClick={() => setTowerSelectorOpen((isOpen) => !isOpen)}>Buy Tower</button>
			</div>
		</>
	)
}

function TowerSelector({
	visible,
	onSelect,
	onClose,
	moneyz,
}: {
	visible: boolean
	onSelect: (towerType: TowerType) => void
	onClose: () => void
	moneyz: number
}) {
	const style = useSpring({
		bottom: visible ? 0 : -100,
	})
	return (
		<animated.div
			style={{ position: 'absolute', right: 0, height: '100px', backgroundColor: 'gray', ...style }}
		>
			<button onClick={onClose}>X</button>
			{getKeys(TOWER_TYPES).map((towerType: TowerType) => (
				<button
					onClick={() => onSelect(towerType)}
					key={towerType}
					disabled={TOWER_TYPES[towerType].cost > moneyz}
				>
					{TOWER_TYPES[towerType].name}
				</button>
			))}
		</animated.div>
	)
}
