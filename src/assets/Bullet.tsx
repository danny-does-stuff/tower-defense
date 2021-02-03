import React from 'react'

const RADIUS = 1

export default function Bullet({position}: {position: [number, number, number]}) {
	return <mesh
		position={position}
		scale={[1, 1, 1]}>
		<sphereBufferGeometry args={[RADIUS]} />
		<meshStandardMaterial color={'fuschia'}/>
	</mesh>
}