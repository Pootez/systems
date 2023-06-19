
class Sun {
    constructor() {
        this.color = color(255, 200, 0)
        this.size = random(0.5, 1)
    }

    display(layer) {

        let ctx = drawingContext

        let gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, maxLength / 2)
        gradient.addColorStop(0, color(red(this.color), green(this.color), blue(this.color), 128).toString())
        gradient.addColorStop(1, color(0, 0).toString())

        ctx.fillStyle = gradient;

        ctx.beginPath()
        ctx.arc(0, 0, maxLength, 0, 2 * Math.PI)
        ctx.fill()

        layer.fill(this.color)
        layer.stroke(lerpColor(this.color, color(255, 0, 0), 0.4))
        layer.strokeWeight(maxLength / 500)
        layer.circle(width / 2, height / 2, this.size * maxLength / 10)
    }
}