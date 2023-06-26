
class Sun {
    constructor() {
        this.color = [random(50,255), random(50,255), random(50,255)]
        this.size = random(0.8, 2)
        this.rotDir = floor(random(2)) * 2 - 1
    }
}