const FR = 60

let starLayer

let maxLength

let stars = []

// p5 functions

function setup() {
    maxLength = max(windowWidth, windowHeight)
    createCanvas(windowWidth, windowHeight)
    frameRate(FR)

    starLayer = createGraphics(windowWidth, windowHeight)

    for (let i = 0; i < 500; i++) {
        stars.push(new Star())
    }
}

function draw() {
    background(0)
    drawStars()
}

function windowResized() {
    maxLength = max(windowWidth, windowHeight)
    resizeCanvas(windowWidth, windowHeight)
    starLayer.resizeCanvas(windowWidth, windowHeight)
}

// Other functions

function drawStars() {
    starLayer.clear()
    stars.forEach(star => star.display(starLayer))
    image(starLayer, 0, 0)
}