import React from 'react'
const SIZE = 5

export default function Enemy({x, y}: {x: number, y: number}) {
	const position: [number, number, number] = [x, y, SIZE / 2]

	return <mesh
		position={position}
		scale={[1, 1, 1]}>
		<tetrahedronBufferGeometry args={[SIZE, 0]} />
		<meshStandardMaterial color={'blue'}/>
	</mesh>
}