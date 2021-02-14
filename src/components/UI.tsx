import React, { useState } from 'react'
import { useSpring, animated } from 'react-spring'

export default function UI({
	onSelectTowerToBuy,
}: {
	onSelectTowerToBuy: (towerType: string) => void
}): JSX.Element {
	const [towerSelectorOpen, setTowerSelectorOpen] = useState(false)
	return (
		<>
			<TowerSelector
				visible={towerSelectorOpen}
				onSelect={onSelectTowerToBuy}
				onClose={() => setTowerSelectorOpen(false)}
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
				<span>Moneyz: $150</span>
				<button onClick={() => setTowerSelectorOpen((isOpen) => !isOpen)}>Buy Tower</button>
			</div>
		</>
	)
}

function TowerSelector({
	visible,
	onSelect,
	onClose,
}: {
	visible: boolean
	onSelect: (towerId: string) => void
	onClose: () => void
}) {
	const style = useSpring({
		bottom: visible ? 0 : -100,
	})
	return (
		<animated.div
			style={{ position: 'absolute', right: 0, height: '100px', backgroundColor: 'gray', ...style }}
		>
			<button onClick={onClose}>X</button>
			<button onClick={() => onSelect('BASIC')}>Basic Tower</button>
		</animated.div>
	)
}
