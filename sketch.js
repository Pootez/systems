const FR = 60

let starLayer
let sunLayer

let maxLength

let stars
let sun

// p5 functions

function setup() {
    maxLength = max(windowWidth, windowHeight)
    frameRate(FR)

    createCanvas(windowWidth, windowHeight)
    starLayer = createGraphics(windowWidth, windowHeight)
    starLayer.translate(windowWidth / 2, windowHeight / 2)
    sunLayer = createGraphics(windowWidth, windowHeight)
    sunLayer.translate(windowWidth / 2, windowHeight / 2)

    stars = []
    for (let i = 0; i < 500; i++) {
        stars.push(new Star())
    }
    sun = new Sun()
}

function draw() {
    background(0)
    drawStars()
    drawSun()
}

function windowResized() {
    maxLength = max(windowWidth, windowHeight)
    resizeCanvas(windowWidth, windowHeight)
    translate(windowWidth / 2, windowHeight / 2)
    starLayer.resizeCanvas(windowWidth, windowHeight)
    starLayer.reset()
    starLayer.translate(windowWidth / 2, windowHeight / 2)
    sunLayer.resizeCanvas(windowWidth, windowHeight)
    sunLayer.reset()
    sunLayer.translate(windowWidth / 2, windowHeight / 2)
}

// Other functions

function drawStars() {
    starLayer.clear()
    stars.forEach(star => star.display(starLayer))
    image(starLayer, 0, 0)
}

function drawSun() {
    sunLayer.clear()
    sun.display(sunLayer)
    image(sunLayer, 0, 0)
}