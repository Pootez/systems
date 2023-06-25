
importScripts("../libraries/opensimplex.js")

const size = 64

const r = 201
const g = 202
const b = 203
const a = 204
const largeScale = 0.05
const smallScale = 0.1
const largeSpeed = 0.002
const smallSpeed = 0.006

self.onmessage = function (message) {
    let data = message.data
    let seed = data.seed
    let frameCount = data.frameCount

    let pixels = []
    const openSimplex = openSimplexNoise(seed)

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const large = (openSimplex.noise3D(x * largeScale, y * largeScale, frameCount * largeSpeed + 200) + 1) / 2
            const small = (openSimplex.noise3D(x * smallScale, y * smallScale, frameCount * smallSpeed) + 1) / 2
            const value = (large * large + small) * 255 / 2
            let index = (x + y * size) * 4
            pixels[index] = (openSimplex.noise2D(1, r) + 1) * 128
            pixels[index + 1] = (openSimplex.noise2D(1, g) + 1) * 128
            pixels[index + 2] = (openSimplex.noise2D(1, b) + 1) * 128
            pixels[index + 3] = ((openSimplex.noise2D(1, a) + 1) / 2 + 0.5) * value
        }
    }

    const imageData = new ImageData(new Uint8ClampedArray(pixels), size, size)
    postMessage(imageData)
}