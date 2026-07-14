import assert from 'node:assert/strict'
import { pointerForce } from './playground.js'

assert.deepEqual(pointerForce(0, 0, 200, 0, 100), [0, 0])
assert.deepEqual(pointerForce(0, 0, 0, 0, 100), [0, 0])
const [x, y] = pointerForce(0, 0, 50, 0, 100)
assert(x > 0 && y === 0)

console.log('playground force check passed')
