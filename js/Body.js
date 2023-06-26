
class Body {
    constructor(
        size = random(0.4, 1),
        dist = random(0.1, 1)
    ) {
        this.colors = [
            [random(55, 220), random(55, 220), random(55, 220)],
            [random(55, 220), random(55, 220), random(55, 220)]
        ]
        this.size = size
        this.dist = dist
        this.area = this.size
        this.moons = []
        this.angle = random()
        this.rot = random()
        this.rotSpeed = random(-1, 1)
        this.rotDir = floor(random(2)) * 2 - 1
        this.threshold = random(0.2, 0.8)
    }

    createMoons(n) {
        for (let i = 0; i < n; i++) {
            const moon = new Body(
                random(0.5, 1) * this.size / 2,
                random(0.1, 0.6) * this.size / 2
            )
            this.moons.push(moon)
        }
    }

    get Area() {
        let area = this.size
        for (let i = 0; i < this.moons.length; i++){
            area += (this.moons[i].size * 2 + this.moons[i].dist)
        }
        return area
    }
}