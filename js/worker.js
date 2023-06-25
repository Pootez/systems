
importScripts("../libraries/opensimplex.js")


const largeScale = 0.05
const mediumScale = 0.1
const smallScale = 0.8
const largeSpeed = 0.002
const mediumSpeed = 0.006
const smallSpeed = 0.01

// Response from main program
self.onmessage = function (message) {
    if (message.data.element == "dust") {
        const size = 64 // Set size
        // Retrieve data
        const data = message.data
        const seed = data.seed
        const frameCount = data.frameCount

        const r = 201
        const g = 202
        const b = 203
        const a = 204

        const openSimplex = openSimplexNoise(seed) // Create noise API
        
        // Get pixel values
        let pixels = []
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const large = (openSimplex.noise3D(x * largeScale, y * largeScale, frameCount * largeSpeed + 200) + 1) / 2
                const small = (openSimplex.noise3D(x * mediumScale, y * mediumScale, frameCount * mediumSpeed) + 1) / 2
                const value = (large + large + small) * 255 / 3

                let index = (x + y * size) * 4
                pixels[index] = (openSimplex.noise2D(1, r) + 1) * 128
                pixels[index + 1] = (openSimplex.noise2D(1, g) + 1) * 128
                pixels[index + 2] = (openSimplex.noise2D(1, b) + 1) * 128
                pixels[index + 3] = ((openSimplex.noise2D(1, a) + 1) / 2 + 0.5) * value
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