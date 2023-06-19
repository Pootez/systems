
class Star {
    constructor() {
        this.x = random(-1, 1)
        this.y = random(-1, 1)
        this.lum = random(0.5, 1)

        this.offset = random(100)
        this.speed = random(0.25, 1)
    }

    display(layer) {

        let starScale = cos((frameCount + this.offset) / 20 * this.speed) + 2
        layer.fill(255, 50 * starScale * 2)
        layer.noStroke()
        layer.circle(this.x * maxLength / 2 + width / 2, this.y * maxLength / 2 + height / 2, this.lum * 3 * maxLength / 1000)
    }
}