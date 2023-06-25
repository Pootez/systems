
importScripts("../libraries/opensimplex.js")


const largeScale = 0.05
const mediumScale = 0.1
const smallScale = 0.8
const largeSpeed = 0.0002
const mediumSpeed = 0.0006
const smallSpeed = 0.01

// Response from main program
self.onmessage = function (message) {
    if (message.data.element == "dust") {
        const size = 64 // Set size
        // Retrieve data
        const data = message.data
        const seed = data.seed
        const frameCount = data.frameCount
        const dust = data.data
        const a = dust.colors[0]
        const b = dust.colors[1]
        const c = dust.colors[2]
        const threshold = 0.3

        const openSimplex = openSimplexNoise(seed) // Create noise API

        // Get pixel values
        let pixels = []
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const large = (openSimplex.noise3D(x * largeScale, y * largeScale, frameCount * largeSpeed + 200) + 1) / 2
                const small = (openSimplex.noise3D(x * mediumScale, y * mediumScale, frameCount * mediumSpeed) + 1) / 2
                const value = large * large * small

                let index = (x + y * size) * 4
                pixels[index] = value < threshold ? lerp(a[0], b[0], Math.floor((value / threshold) * 4) / 4) : lerp(c[0], b[0], Math.floor(((value - threshold) / (1 - threshold)) * 4) / 4)
                pixels[index + 1] = value < threshold ? lerp(a[1], b[1], Math.floor((value / threshold) * 4) / 4) : lerp(c[1], b[1], Math.floor(((value - threshold) / (1 - threshold)) * 4) / 4)
                pixels[index + 2] = value < threshold ? lerp(a[2], b[2], Math.floor((value / threshold) * 4) / 4) : lerp(c[2], b[2], Math.floor(((value - threshold) / (1 - threshold)) * 4) / 4)
                pixels[index + 3] = Math.pow(value, 0.6) * 255
            }
        }

        // Post image data to main program
        const imageData = new ImageData(new Uint8ClampedArray(pixels), size, size)
        postMessage({
            element: "dust",
            data: imageData
        })
    }
    if (message.data.element == "sun") {
        // Retrieve data
        const data = message.data
        const seed = data.seed
        const frameCount = data.frameCount
        const sun = data.data

        const openSimplex = openSimplexNoise(seed) // Create noise API
        const size = Math.ceil(sun.size * 16) // Determine size


        // Get pixel values
        let pixels = []
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const noiseValue = (openSimplex.noise3D(x * smallScale, y * smallScale, frameCount * smallSpeed) + 1) / 2
                const distance = Math.sqrt(Math.pow(x - size / 2, 2) + Math.pow(y - size / 2, 2)) / (size / 2.1)
                const value = Math.floor(lerp(distance, noiseValue, 0.2) * 7) / 6

                let index = (x + y * size) * 4
                pixels[index] = lerp(sun.color[0], 255, Math.pow(1 - value, 1.5))
                pixels[index + 1] = lerp(sun.color[1], 190, Math.pow(1 - value, 1.5))
                pixels[index + 2] = lerp(sun.color[2], 150, Math.pow(1 - value, 1.5))
                pixels[index + 3] = distance <= 1 ? (1 - Math.pow(distance, 20)) * 255 : 0
            }
        }

        const imageData = new ImageData(new Uint8ClampedArray(pixels), size, size)
        postMessage({
            element: "sun",
            data: imageData
        })
    }
}

function lerp(a, b, t) {
    return ((1 - t) * a + t * b)
}