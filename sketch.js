const FR = 60
const worker = new Worker("js/worker.js")
let openSimplex

let starLayer
let dustLayer
let sunLayer

let maxLength

let seed

let stars
let sun

const pc = 401 // Planet count
let planetCount

// p5 functions

function setup() {
    createCanvas(windowWidth, windowHeight)
    maxLength = max(width, height)
    frameRate(FR)

    starLayer = createGraphics(width, height)
    sunLayer = createGraphics(width, height)

    seed = floor(random(1000000000000))
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
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
    maxLength = max(width, height)
    starLayer.resizeCanvas(width, height)
    sunLayer.resizeCanvas(width, height)
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
    planetCount = ceil(openSimplex.noise2D(1, pc) * 10)

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
    sun.display(sunLayer)
    image(sunLayer, -width / 2, -height / 2)
}