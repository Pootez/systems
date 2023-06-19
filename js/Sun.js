
class Sun {
    constructor() {
        this.color = color(255, 204, 0)
        this.size = random(0.5, 1)
    }

    display(layer) {
        layer.fill(this.color)
        layer.stroke(lerpColor(this.color,color(255,0,0),0.4))
        layer.strokeWeight(maxLength/500)
        layer.circle(0, 0, this.size * maxLength / 10)
    }
}