const FR = 30 // Framerate
const seedSize = 1000000000000
const worker = new Worker("js/worker.js") // Web Worker for noise map processing
let openSimplex // OpenSmiplex noise API

// Graphics / Layers
let starLayer
let dustImage
let sunImage
let planetImages
let planetLayer

let maxLength // Max window dimension

let seed // Seed in use

let stars // Stars array
let dust // Dust object
let sun // Sun object
let planets // Planets array

let distance // Cumulative distance of astral bodies

// p5 functions

function setup() {
    // Setup canvas and graphics
    maxLength = min(windowWidth, windowHeight)
    createCanvas(maxLength, maxLength)
    frameRate(FR)
    noSmooth()

    starLayer = createGraphics(width, height)
    planetLayer = createGraphics(width, height)

    // Generate seed
    generate(floor(random(seedSize)))

    // Web worker response function
    worker.onmessage = function (message) {
        if (message.data.element == "dust") {
            let imageData = message.data.data
            createImageBitmap(imageData).then(imgBitmap => {
                dustImage = createImage(imgBitmap.width, imgBitmap.height)
                dustImage.drawingContext.drawImage(imgBitmap, 0, 0)
            })
        }
        if (message.data.element == "sun") {
            let imageData = message.data.data
            createImageBitmap(imageData).then(imgBitmap => {
                sunImage = createImage(imgBitmap.width, imgBitmap.height)
                sunImage.drawingContext.drawImage(imgBitmap, 0, 0)
            })
        }
        if (message.data.element == "planets") {
            planetImages = []
            let imagesData = message.data.data
            for (let i = 0; i < imagesData.length; i++) {
                let planetImageData = imagesData[i].image
                createImageBitmap(planetImageData).then(imgBitmap => {
                    planetImages[i] = { moons: [] }
                    planetImages[i].image = createImage(imgBitmap.width, imgBitmap.height)
                    planetImages[i].image.drawingContext.drawImage(imgBitmap, 0, 0)
                })
                for (let j = 0; j < imagesData[i].moons.length; j++) {
                    let moonImageData = imagesData[i].moons[j]
                    createImageBitmap(moonImageData).then(imgBitmap => {
                        planetImages[i].moons[j] = createImage(imgBitmap.width, imgBitmap.height)
                        planetImages[i].moons[j].drawingContext.drawImage(imgBitmap, 0, 0)
                    })
                }
            }
        }
    }
}

function draw() {
    translate(width / 2, height / 2)
    background(0)
    drawStars()
    drawDust()
    drawSun()
    drawPlanets()
}

function windowResized() {
    maxLength = min(windowWidth, windowHeight)
    resizeCanvas(maxLength, maxLength)
    starLayer.resizeCanvas(width, height)
    planetLayer.resizeCanvas(width, height)
}

// Other functions

function generate(s) {
    // Set seed
    seed = s
    openSimplex = openSimplexNoise(s)
    randomSeed(s)
    noiseSeed(s)

    // Generate stars
    stars = []
    let starsCount = random(1000)
    for (let i = 0; i < starsCount; i++) {
        stars.push(new Star())
    }

    // Generate dust
    dust = new Dust()

    // Generate sun
    sun = new Sun()

    // Generate planets
    const planetCount = ceil(pow((random()), 1.5) * 6)
    planets = []
    distance = sun.size // Increase distance to sun surface
    for (let i = 0; i < planetCount; i++) {
        // Create planet
        planets.push(new Body())

        const moonCount = floor(pow(random(), 4) * 5)
        planets[i].createMoons(moonCount)

        distance += planets[i].dist
        distance += planets[i].Area * 2
    }

    distance = distance * 2.6
}

function drawStars() {
    starLayer.clear()
    starLayer.reset()
    starLayer.translate(width / 2, height / 2)
    stars.forEach(star => star.display(starLayer))
    image(starLayer, -width / 2, -height / 2)
}

function drawDust() {
    // Request image from Web Worker
    worker.postMessage({
        element: "dust",
        seed: seed,
        frameCount: frameCount,
        data: dust
    })
    if (dustImage != undefined) { // If there is an image, display it
        noSmooth()
        image(dustImage, -maxLength / 2, -maxLength / 2, maxLength, maxLength)
    }
}

function drawSun() {
    // Draw sun glare
    let ctx = drawingContext

    let gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, maxLength / 3)
    gradient.addColorStop(0, color(red(sun.color), green(sun.color), blue(sun.color), 128).toString())
    gradient.addColorStop(1, color(0, 0).toString())

    ctx.fillStyle = gradient;

    ctx.beginPath()
    ctx.arc(0, 0, maxLength, 0, 2 * Math.PI)
    ctx.fill()

    // Request image from Web Worker
    worker.postMessage({
        element: "sun",
        seed: seed,
        frameCount: frameCount,
        data: sun
    })
    if (sunImage != undefined) { // If there is an image, display it
        const sunRadius = sun.size * maxLength / distance
        image(sunImage, -sunRadius, -sunRadius, sunRadius * 2, sunRadius * 2)
    }
}

function drawPlanets() {
    // Request image from Web Worker
    worker.postMessage({
        element: "planets",
        seed: seed,
        frameCount: frameCount,
        data: planets
    })

    planetLayer.clear()
    planetLayer.noSmooth()
    planetLayer.imageMode(CENTER)

    let planetPointer = sun.size

    // Draw planets
    for (let i = 0; i < planets.length; i++) {
        // Get values
        const planet = planets[i]
        planetPointer += (planet.Area + planet.dist)
        const planetDist = planetPointer * maxLength / distance
        const planetRadius = planet.size * maxLength / distance
        const planetAngle = planet.angle * TWO_PI + sun.rotDir * frameCount * sun.size * 2000 / (FR * pow(planetPointer, 2) * 1000)
        let planetSafeAngle = planetRadius * 1.2 / planetDist

        // Draw planet
        if (planetImages) {
            const planetImage = planetImages[i].image
            planetLayer.reset()
            planetLayer.translate(width / 2, height / 2)
            planetLayer.translate(cos(planetAngle) * planetDist, sin(planetAngle) * planetDist)
            planetLayer.rotate(planet.rot * TWO_PI + planet.rotSpeed * frameCount / (planet.size * 100))
            planetLayer.image(planetImage, 0, 0, planetRadius * 2, planetRadius * 2)
        }

        let moonPointer = planet.size
        // Draw moons
        for (let j = 0; j < planet.moons.length; j++) {
            // Get values
            const moon = planet.moons[j]
            moonPointer += (moon.Area + moon.dist)
            const moonDist = moonPointer * maxLength / distance
            const moonRadius = moon.size * maxLength / distance
            const moonAngle = moon.angle * TWO_PI + planet.rotDir * frameCount * planet.size * 800 / (FR * pow(moonPointer, 2) * 1000)
            const moonSafeAngle = moonRadius * 1.2 / moonDist

            // Draw moon
            if (planetImages) {
                const moonImage = planetImages[i].moons[j]
                planetLayer.reset()
                planetLayer.translate(width / 2, height / 2)
                planetLayer.translate(cos(planetAngle) * planetDist + cos(moonAngle) * moonDist, sin(planetAngle) * planetDist + sin(moonAngle) * moonDist)
                planetLayer.rotate(moon.rot * TWO_PI + moon.rotSpeed * frameCount / (moon.size * 100))
                planetLayer.image(moonImage, 0, 0, moonRadius * 2, moonRadius * 2)
            }

            // Draw moon orbit
            planetLayer.reset()
            planetLayer.translate(width / 2, height / 2)
            planetLayer.noFill()
            planetLayer.stroke(255, 50)
            planetLayer.strokeWeight(moonRadius * 0.4)
            planetLayer.arc(cos(planetAngle) * planetDist, sin(planetAngle) * planetDist, moonDist * 2, moonDist * 2, moonAngle + moonSafeAngle, moonAngle - moonSafeAngle)

            moonPointer += moon.Area

            // Adjust the orbit gap for planets
            if (planet.moons.length == j + 1) planetSafeAngle = (moonDist + moonRadius + planetRadius * 0.4) / planetDist
        }

        // Draw planet orbit
        planetLayer.reset()
        planetLayer.translate(width / 2, height / 2)
        planetLayer.noFill()
        planetLayer.stroke(255, 50)
        planetLayer.strokeWeight(planetRadius * 0.4)
        planetLayer.arc(0, 0, planetDist * 2, planetDist * 2, planetAngle + planetSafeAngle, planetAngle - planetSafeAngle)

        planetPointer += planet.Area
    }

    // Display layer
    image(planetLayer, -width / 2, -height / 2)
}