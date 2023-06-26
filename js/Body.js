
class Body {
    constructor(
        size = random(0.4, 1),
        dist = random(0.1, 1)
    ) {
        this.colors = [
            [random(255), random(255), random(255)],
            [random(255), random(255), random(255)]
        ]
        this.size = size
        this.dist = dist
        this.area = this.size
        this.moons = []
        this.angle = random()
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
        this.moons.forEach(obj => {
            area += (obj.size * 2 + obj.dist)
        })
        return area
    }
}