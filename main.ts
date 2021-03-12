// Set up inputs
input.onButtonPressed(Button.A, function () {
    spaceInvaders.leftPressed();
})
input.onButtonPressed(Button.AB, function () {
    spaceInvaders.shootPressed();
})
input.onButtonPressed(Button.B, function () {
    spaceInvaders.rightPressed();
})
class Bullet {
    position: number;
    elevation: number;
    direction: number;

    constructor(startPos: number, elevation: number, direction: number) {
        this.position = startPos;
        this.elevation = elevation;
        this.direction = direction;
    }

    nextPos() {
        this.elevation += this.direction;
    }

    getPosition() {
        return this.position;
    }
}
class SpaceShip {
    position: number;
    elevation: number;

    constructor() { }

    moveLeft() {
        this.position--;
        if (this.position < 0) {
            this.position = 0;
        }
    }

    moveRight() {
        this.position++;
        if (this.position > 4) {
            this.position = 4;
        }
    }

    moveDown() {
        this.elevation++;
    }

    getPosition() {
        return this.position;
    }
}
class Invader extends SpaceShip {

    constructor(startPos: number, elevation: number) {
        super();
        this.position = startPos;
        this.elevation = elevation;
    }

    nextDirection() {

    }
}
class Player extends SpaceShip {
    lives: number;

    constructor() {
        super();
        this.lives = 2;
        this.position = 2;
        this.elevation = 4;
    }

    kill() {
        this.lives--;
    }
}
class SpaceInvaders {

    // Holds the player and the eneimies
    player: Player;
    enemies: Array<Invader>;

    // Hold their bullets
    playerBullets: Array<Bullet>;
    enemyBullets: Array<Bullet>;

    // Decreases as the round gets faster
    roundSpeed: number;

    // Indicates if the player was shot that round
    playerShot: boolean;

    // Stores when the player last shot a bullet
    playerLastShot: number;

    // Indicates the direction the invaders will move next
    invaderDirection: number;

    // Stores if the current round is running
    running: boolean;

    // Stores if we won this round
    win: boolean;

    constructor() {
        this.roundSpeed = 20;
        this.makeRound();
    }

    /**
     * Initilises all the entites
     * for the start of a round
     */
    makeRound() {
        this.player = new Player();
        this.enemies = [];
        this.running = true;
        this.win = false;
        this.enemyBullets = [];
        this.playerBullets = [];
        this.playerLastShot = -5000;
        this.invaderDirection = 0;
        this.makeEnemies();
    }

    /**
     * Creates a pattern on enemies
     */
    makeEnemies() {
        for (let i = 1; i < 4; i++) {
            for (let j = 0; j < 2; j++) {
                this.enemies.push(new Invader(i, j));
            }
        }
    }

    leftPressed() {
        if (this.running) {
            this.player.moveLeft();
            this.draw();
        }
    }

    rightPressed() {
        if (this.running) {
            this.player.moveRight();
            this.draw();
        }
    }

    /**
     * Run when a player presses the shoot button
     */
    shootPressed() {
        // The player can shoot faster as the rounds increase
        if ((game.currentTime() - this.playerLastShot) > (2000 / (21 - this.roundSpeed)) && this.running) {
            let position = this.player.position;
            let elevation = this.player.elevation;

            // We make a bullet for their position
            this.playerBullets.push(
                new Bullet(position, elevation, -1)
            );

            // And save when they last shot
            this.playerLastShot = game.currentTime();
            this.draw();
        }

    }

    /**
     * Randomly shoots from an invader on the screen
     */
    enemyShoot() {
        let enemy3: Invader = this.enemies.get(Math.random()*(this.enemies.length));
        this.enemyBullets.push(new Bullet(enemy3.position, enemy3.elevation, 1));
    }

    /**
     * Draws all of the entities to the screen
     */
    draw() {
        basic.clearScreen();
        led.plot(this.player.position, this.player.elevation);

        for (let k = 0; k < this.playerBullets.length; k++) {
            let bullet: Bullet = this.playerBullets.get(k);
            led.plot(bullet.position, bullet.elevation);
        }

        for (let l = 0; l < this.enemyBullets.length; l++) {
            let bullet2: Bullet = this.enemyBullets.get(l);
            led.plot(bullet2.position, bullet2.elevation);
        }

        for (let m = 0; m < this.enemies.length; m++) {
            let enemy: Invader = this.enemies.get(m);
            led.plot(enemy.position, enemy.elevation);
        }
    }

    /**
     * Moves the invaders to their next position
     */
    tickInvaders() {
        let newDirection: boolean = false;
        let dead: boolean = false;

        for (let n = 0; n < this.enemies.length; n++) {
            let enemy2: Invader = this.enemies.get(n);

            switch (this.invaderDirection) {
                case 0:
                    enemy2.position--;
                    break;
                case 1:
                    enemy2.elevation++;
                    break;
                case 2:
                    enemy2.position++;
                    break;
                case 3:
                    enemy2.elevation++;
                    break;
            }

            if (enemy2.position > 3 || enemy2.position < 1) {
                newDirection = true;
            } else if (enemy2.elevation > 3) {
                dead = true;
            }
        }

        if (newDirection) {
            this.invaderDirection = (this.invaderDirection + 1) % 4;
        }

        if (dead) {
            this.playerShot = false;
            this.running = false;
        } else {
            this.draw();
        }
    }

    /**
     * Moves all bullets to their next positions
     * and checks for deaths
     */
    tickBullets() {
        let removeBullets: Array<Bullet> = [];

        for (let o = 0; o < this.playerBullets.length; o++) {
            let bullet3: Bullet = this.playerBullets.get(o);

            let died: Array<Invader> = [];

            for (let p = 0; p < this.enemies.length; p++) {
                let enemy4: Invader = this.enemies.get(p);
                if (bullet3.position == enemy4.position &&
                    bullet3.elevation == enemy4.elevation) {

                    removeBullets.push(bullet3);
                    died.push(enemy4);
                } else if (bullet3.elevation > 4) {
                    removeBullets.push(bullet3);
                }
            }

            for (let q = 0; q < died.length; q++) {
                this.enemies.removeElement(died.get(q));
            }
            bullet3.nextPos();
        }

        for (let r = 0; r < removeBullets.length; r++) {
            this.playerBullets.removeElement(removeBullets.get(r));
        }

        removeBullets = [];

        for (let s = 0; s < this.enemyBullets.length; s++) {
            let bullet4: Bullet = this.enemyBullets.get(s);

            if (this.player.elevation == bullet4.elevation &&
                this.player.position == bullet4.position) {
                removeBullets.push(bullet4);
                this.player.kill();
                this.playerShot = true;

            } else if (bullet4.elevation > 4) {
                removeBullets.push(bullet4);
            }

            bullet4.nextPos();
        }

        for (let t = 0; t < removeBullets.length; t++) {
            this.playerBullets.removeElement(removeBullets.get(t));
        }

        if (this.enemies.length < 1) {
            this.running = false;
            this.win = true;
        }

        this.draw();
    }

    /**
     * Game main loop runs the rounds and performs
     * each of the required ticks
     */
    mainLoop() {
        while (this.roundSpeed > 0) {
            let tickNum = 0;
            while (this.running) {
                spaceInvaders.draw();
                tickNum++;
                this.tickBullets();
                if (!(tickNum % this.roundSpeed)) {
                    this.tickInvaders();
                }

                if (!(Math.random()*1 * this.roundSpeed)) {
                    this.enemyShoot();
                }

                basic.pause(250);

                if (this.playerShot) {
                    this.running = false;
                    for (let u = 0; u < 3; u++) {
                        led.unplot(this.player.position, this.player.elevation);
                        basic.pause(500);
                        led.plot(this.player.position, this.player.elevation);
                        basic.pause(500);
                    }

                    if (this.player.lives > -1) {
                        this.running = true;
                    }

                    this.playerShot = false;
                }
            }
            basic.pause(250);
            basic.clearScreen();

            if (this.win) {
                basic.showNumber(21 - this.roundSpeed);
                basic.pause(2000);
                this.roundSpeed--;
                this.makeRound();
                this.running = false;
                this.draw();
                basic.pause(1000);
                this.running = true;
            } else {
                basic.showNumber(21 - this.roundSpeed);
                basic.showString("Game over...");
                return;
            }
        }
    }
}
let spaceInvaders = new SpaceInvaders();
spaceInvaders.mainLoop();
