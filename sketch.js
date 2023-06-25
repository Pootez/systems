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

    seed = floor(random(seedSize))
    generate(seed)

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
        distance += random(0.5, 3)
        planet.dist = distance
        planet.size = random(0.2, 1)
        distance += planet.size

        let moonCount = floor(pow(random(), 4) * 6)
        planet.moons = []
        let moonDistance = 0
        for (let j = 0; j < moonCount; j++) {
            let moon = {}
            moon.primary = color(random(255), random(255), random(255)).toString()
            moon.secondary = color(random(255), random(255), random(255)).toString()
            moonDistance += random(0.5, 3) / 4
            moon.dist = moonDistance
            moon.size = random(0.2, 1) / 4
            distance += moon.size
            planet.moons.push(moon)
        }
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
        const angle = planet.angle * TWO_PI + frameCount * TWO_PI / (FR * planet.size * pow(planet.dist, 2) * 40)

        planetLayer.fill(color(planet.primary))
        planetLayer.noStroke()
        planetLayer.circle(cos(angle) * planetDist, sin(angle) * planetDist, planetRadius)

        planetLayer.noFill()
        planetLayer.stroke(200, 100)
        planetLayer.strokeWeight(planet.size * 0.2 * maxLength / distance)
        const safeAngle = planetRadius / planetDist
        planetLayer.arc(0, 0, planetDist * 2, planetDist * 2, angle + safeAngle, angle - safeAngle)
    }

    image(planetLayer, -width / 2, -height / 2)
}