const FR = 60
const worker = new Worker("js/worker.js")

let starLayer
let dustLayer
let sunLayer

let maxLength

let seed

let stars
let sun

// p5 functions

function setup() {
    createCanvas(windowWidth, windowHeight)
    maxLength = max(width, height)
    frameRate(FR)

    starLayer = createGraphics(width, height)
    sunLayer = createGraphics(width, height)

    seed = floor(random(1000000000000))
    randomSeed(seed)
    noiseSeed(seed)

    stars = []
    for (let i = 0; i < 500; i++) {
        stars.push(new Star())
    }
    worker.onmessage = function (message) {
        let imageData = message.data
        createImageBitmap(imageData).then(imgBitmap => {
            dustLayer = createImage(imgBitmap.width, imgBitmap.height)
            dustLayer.drawingContext.drawImage(imgBitmap, 0, 0)
        })
    }
    sun = new Sun()
}

function draw() {
    translate(width / 2, height / 2)
    background(0)
    drawStars()
    drawDust()
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
    sun.display(sunLayer)
    image(sunLayer, -width / 2, -height / 2)
}