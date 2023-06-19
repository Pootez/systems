
class Star {
    constructor() {
        this.x = random()
        this.y = random()
        this.lum = random(0.5, 1)

        this.offset = random(100)
        this.speed = random(0.25, 1)
    }

    display(layer) {

        let starScale = cos((frameCount + this.offset) / 20 * this.speed) + 2

        layer.fill(255, 50 * starScale * 2)
        layer.noStroke()
        layer.circle(this.x * maxLength, this.y * maxLength, this.lum * 2)
    }
}