const FR = 60

let starLayer
let sunLayer

let maxLength

let stars
let sun

// p5 functions

function setup() {
    createCanvas(windowWidth, windowHeight)
    maxLength = max(width, height)
    frameRate(FR)

    starLayer = createGraphics(width, height)
    sunLayer = createGraphics(width, height)

    stars = []
    for (let i = 0; i < 500; i++) {
        stars.push(new Star())
    }
    sun = new Sun()
}

function draw() {
    translate(width / 2, height / 2)
    background(0)
    drawStars()
    drawSun()
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
    maxLength = max(width, height)
    starLayer.resizeCanvas(width, height)
    sunLayer.resizeCanvas(width, height)
}

// Other functions

function drawStars() {
    starLayer.clear()
    stars.forEach(star => star.display(starLayer))
    image(starLayer, -width / 2, -height / 2)
}

function drawSun() {
    sunLayer.clear()
    sun.display(sunLayer)
    image(sunLayer, -width / 2, -height / 2)
}