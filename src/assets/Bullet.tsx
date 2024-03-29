import React from 'react'
import { a, useSpring } from '@react-spring/three'
import { BULLET_SPEED } from '../constants'
import { getTimeToTarget, getTimeToTravelDistance } from '../helpers'

const RADIUS = 1

export default function Bullet({
	origin,
	destination,
	startTime,
	speed,
	onFinish,
}: {
	origin: [number, number, number]
	destination: [number, number, number]
	startTime: Date
	speed: number
	onFinish: () => void
}): JSX.Element {
	const { position } = useSpring({
		from: { position: origin },
		to: { position: destination },
		config: { duration: getTimeToTarget(origin, destination, speed) },
		onRest: onFinish,
	})

	return (
		<a.mesh position={position} scale={[1, 1, 1]}>
			<sphereGeometry args={[RADIUS]} />
			<meshStandardMaterial color={'black'} />
		</a.mesh>
	)
}
