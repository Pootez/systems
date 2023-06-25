const FR = 60
const seedSize = 1000000000000
const worker = new Worker("js/worker.js")
let openSimplex

let starLayer
let dustLayer
let sunLayer
let planetLayer

let maxLength

let seed

let stars
let sun
let planets

let distance

// p5 functions

function setup() {
    createCanvas(windowWidth, windowHeight)
    maxLength = max(width, height)
    frameRate(FR)

    starLayer = createGraphics(width, height)
    sunLayer = createGraphics(width, height)
    planetLayer = createGraphics(width, height)

    generate(floor(random(seedSize)))

    worker.onmessage = function (message) {
        let imageData = message.data
        createImageBitmap(imageData).then(imgBitmap => {
            dustLayer = createImage(imgBitmap.width, imgBitmap.height)
            dustLayer.drawingContext.drawImage(imgBitmap, 0, 0)
        })
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
    resizeCanvas(windowWidth, windowHeight)
    maxLength = max(width, height)
    starLayer.resizeCanvas(width, height)
    sunLayer.resizeCanvas(width, height)
    planetLayer.resizeCanvas(width, height)
}

// Other functions

function generate(s) {
    seed = s
    openSimplex = openSimplexNoise(s)
    randomSeed(s)
    noiseSeed(s)


    stars = []
    let starsCount = random(1000)
    for (let i = 0; i < starsCount; i++) {
        stars.push(new Star())
    }
    sun = new Sun()
    let planetCount = ceil(pow((random()), 1.5) * 8)
    planets = []
    distance = sun.size * 0.5
    for (let i = 0; i < planetCount; i++) {
        let planet = {}
        planet.primary = color(random(255), random(255), random(255)).toString()
        planet.secondary = color(random(255), random(255), random(255)).toString()

        planet.angle = random()
        planet.size = random(0.2, 1)
        distance += planet.size

        let moonCount = floor(pow(random(), 4) * 6)
        planet.moons = []
        let moonDistance = 0
        for (let j = 0; j < moonCount; j++) {
            let moon = {}
            moon.primary = color(random(255), random(255), random(255)).toString()
            moon.secondary = color(random(255), random(255), random(255)).toString()
            moonDistance += random(0.1, 1) / 4
            moon.dist = moonDistance + planet.size
            moon.size = random(0.2, 1) / 4
            moonDistance += moon.size
            moon.angle = random()
            planet.moons.push(moon)
        }
        distance += moonDistance
        distance += random(0.1, 1)
        planet.dist = distance
        distance += moonDistance

        planets.push(planet)
    }

    distance = distance * 3
}

function drawStars() {
    starLayer.clear()
    starLayer.reset()
    starLayer.translate(width / 2, height / 2)
    stars.forEach(star => star.display(starLayer))
    image(starLayer, -width / 2, -height / 2)
}

function drawDust() {
    worker.postMessage({
        seed: seed,
        frameCount: frameCount
    })
    if (dustLayer != undefined) {
        noSmooth()
        image(dustLayer, -maxLength / 2, -maxLength / 2, maxLength, maxLength)
    }
}

function drawSun() {
    sunLayer.clear()
    sunLayer.reset()
    sunLayer.translate(width / 2, height / 2)

    let ctx = drawingContext

    let gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, maxLength / 2)
    gradient.addColorStop(0, color(red(sun.color), green(sun.color), blue(sun.color), 128).toString())
    gradient.addColorStop(1, color(0, 0).toString())

    ctx.fillStyle = gradient;

    ctx.beginPath()
    ctx.arc(0, 0, maxLength, 0, 2 * Math.PI)
    ctx.fill()

    sunLayer.fill(sun.color)
    sunLayer.stroke(lerpColor(sun.color, color(255, 0, 0), 0.4))
    sunLayer.strokeWeight(maxLength / 500)
    sunLayer.circle(0, 0, sun.size * maxLength * 2 / distance)

    image(sunLayer, -width / 2, -height / 2)
}

function drawPlanets() {
    planetLayer.clear()
    planetLayer.reset()
    planetLayer.translate(width / 2, height / 2)

    for (let i = 0; i < planets.length; i++) {
        const planet = planets[i]
        const planetDist = (planet.dist + planet.size * 0.5) * maxLength / distance
        const planetRadius = planet.size * maxLength / distance
        const planetAngle = planet.angle * TWO_PI + frameCount * sun.size * 4000 / (FR * planet.size * pow(planetDist, 2))
        let planetSafeAngle = planetRadius / planetDist

        planetLayer.fill(color(planet.primary))
        planetLayer.noStroke()
        planetLayer.circle(cos(planetAngle) * planetDist, sin(planetAngle) * planetDist, planetRadius)

        for (let j = 0; j < planet.moons.length; j++) {
            const moon = planet.moons[j]
            const moonDist = (moon.dist + moon.size * 0.5) * maxLength / distance
            const moonRadius = moon.size * maxLength / distance
            const moonAngle = moon.angle * TWO_PI + frameCount * planet.size * 200 / (FR * moon.size * pow(moonDist, 2))
            const moonSafeAngle = moonRadius / moonDist

            planetLayer.fill(color(moon.primary))
            planetLayer.noStroke()
            planetLayer.circle(cos(planetAngle) * planetDist + cos(moonAngle) * moonDist, sin(planetAngle) * planetDist + sin(moonAngle) * moonDist, moonRadius)

            planetLayer.noFill()
            planetLayer.stroke(200, 100)
            planetLayer.strokeWeight(moonRadius * 0.5)
            planetLayer.arc(cos(planetAngle) * planetDist, sin(planetAngle) * planetDist, moonDist * 2, moonDist * 2, moonAngle + moonSafeAngle, moonAngle - moonSafeAngle)

            if (planet.moons.length == j + 1) planetSafeAngle = (moonDist + moonRadius) * 1.2 / planetDist
        }

        planetLayer.noFill()
        planetLayer.stroke(200, 100)
        planetLayer.strokeWeight(planetRadius * 0.4)
        planetLayer.arc(0, 0, planetDist * 2, planetDist * 2, planetAngle + planetSafeAngle, planetAngle - planetSafeAngle)
    }

    image(planetLayer, -width / 2, -height / 2)
}