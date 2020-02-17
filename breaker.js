    // game parameters
    const BALL_SPD = 0.5; // starting ball speed as a fraction of screen width per second
    const BALL_SPIN = 0.2; // ball deflection off the paddle (0 = no spin, 1 = high spin)
    const HEIGHT = 550; // pixels
    const PADDLE_SPD = 0.7; // fraction of screen width per second

    // derived dimensions
    const WIDTH = HEIGHT * 0.9;
    const WALL = WIDTH / 50;
    const BALL_SIZE = WALL;
    const PADDLE_H = WALL;
    const PADDLE_W = PADDLE_H * 5;

    // colours
    const COLOR_BACKGROUND = "black";
    const COLOR_BALL = "white";
    const COLOR_PADDLE = "white";
    const COLOR_WALL = "grey";

    // definitions
    const Direction = {
        LEFT: 0,
        RIGHT: 1,
        STOP: 2
    }

    // set up the game canvas
    var canv = document.createElement("canvas");
    canv.width = WIDTH;
    canv.height = HEIGHT;
    document.body.appendChild(canv);

    // set up the context
    var ctx = canv.getContext("2d");
    ctx.lineWidth = WALL;

    // game variables
    var ball, paddle;

    // start a new game
    newGame();

    // event listeners
    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);

    // set up the game loop
    var timeDelta, timeLast;
    requestAnimationFrame(loop);

    function loop(timeNow) {
        if (!timeLast) {
            timeLast = timeNow;
        }

        // calculate the time difference
        timeDelta = (timeNow - timeLast) * 0.001; // seconds
        timeLast = timeNow;

        // update
        updatePaddle(timeDelta);
        updateBall(timeDelta);

        // draw
        drawBackground();
        drawWalls();
        drawPaddle();
        drawBall();

        // call the next loop
        requestAnimationFrame(loop);
    }

    function applyBallSpeed(angle) {

        // keep the angle between 30 and 150 degrees
        if (angle < Math.PI / 6) {
            angle = Math.PI / 6;
        } else if (angle > Math.PI * 5 / 6) {
            angle = Math.PI * 5 / 6;
        }

        // update the x and y velocities of the ball
        ball.xv = ball.spd * Math.cos(angle);
        ball.yv = -ball.spd * Math.sin(angle);
    }

    function drawBackground() {
        ctx.fillStyle = COLOR_BACKGROUND;
        ctx.fillRect(0, 0, canv.width, canv.height);
    }

    function drawBall() {
        ctx.fillStyle = COLOR_BALL;
        ctx.fillRect(ball.x - ball.w * 0.5, ball.y - ball.h * 0.5, ball.w, ball.h);
    }

    function drawPaddle() {
        ctx.fillStyle = COLOR_PADDLE;
        ctx.fillRect(paddle.x - paddle.w * 0.5, paddle.y - paddle.h * 0.5, paddle.w, paddle.h);
    }

    function drawWalls() {
        let hwall = WALL * 0.5;
        ctx.strokeStyle = COLOR_WALL;
        ctx.beginPath();
        ctx.moveTo(hwall, HEIGHT);
        ctx.lineTo(hwall, hwall);
        ctx.lineTo(WIDTH - hwall, hwall);
        ctx.lineTo(WIDTH - hwall, HEIGHT);
        ctx.stroke();
    }

    function keyDown(ev) {
        switch (ev.keyCode) {
            case 32: // space bar (serve the ball)
                serve();
                break;
            case 37: // left arrow (move paddle left)
                movePaddle(Direction.LEFT);
                break;
            case 39: // right arrow (move paddle right)
                movePaddle(Direction.RIGHT);
                break;
        }
    }

    function keyUp(ev) {
        switch (ev.keyCode) {
            case 37: // left arrow (stop moving)
            case 39: // right arrow (stop moving)
                movePaddle(Direction.STOP);
                break;
        }
    }

    function movePaddle(direction) {
        switch (direction) {
            case Direction.LEFT:
                paddle.xv = -paddle.spd;
                break;
            case Direction.RIGHT:
                paddle.xv = paddle.spd;
                break;
            case Direction.STOP:
                paddle.xv = 0;
                break;
        }
    }

    function newGame() {
        paddle = new Paddle();
        ball = new Ball();
    }

    function outOfBounds() {
        // TODO out of bounds
        newGame();
    }

    function serve() {

        // ball already in motion
        if (ball.yv != 0) {
            return;
        }

        // random angle, between 45 and 135 degrees
        let angle = Math.random() * Math.PI / 2 + Math.PI / 4;
        applyBallSpeed(angle);
    }

    function updateBall(delta) {
        ball.x += ball.xv * delta;
        ball.y += ball.yv * delta;

        // bounce the ball off the walls
        if (ball.x < WALL + ball.w * 0.5) {
            ball.x = WALL + ball.w * 0.5;
            ball.xv = -ball.xv;
        } else if (ball.x > canv.width - WALL - ball.w * 0.5) {
            ball.x = canv.width - WALL - ball.w * 0.5;
            ball.xv = -ball.xv;
        } else if (ball.y < WALL + ball.h * 0.5) {
            ball.y = WALL + ball.h * 0.5;
            ball.yv = -ball.yv;
        }

        // bounce off the paddle
        if (ball.y > paddle.y - paddle.h * 0.5 - ball.h * 0.5
            && ball.y < paddle.y
            && ball.x > paddle.x - paddle.w * 0.5 - ball.w * 0.5
            && ball.x < paddle.x + paddle.w * 0.5 + ball.w * 0.5
        ) {
            ball.y = paddle.y - paddle.h * 0.5 - ball.h * 0.5;
            ball.yv = -ball.yv;

            // modify the angle based off ball spin
            let angle = Math.atan2(-ball.yv, ball.xv);
            angle += (Math.random() * Math.PI / 2 - Math.PI / 4) * BALL_SPIN;
            applyBallSpeed(angle);
        }

        // handle out of bounds
        if (ball.y > canv.height) {
            outOfBounds();
        }

        // move the stationary ball with the paddle
        if (ball.yv == 0) {
            ball.x = paddle.x;
        }
    }

    function updatePaddle(delta) {
        paddle.x += paddle.xv * delta;

        // stop paddle at walls
        if (paddle.x < WALL + paddle.w * 0.5) {
            paddle.x = WALL + paddle.w * 0.5;
        } else if (paddle.x > canv.width - WALL - paddle.w * 0.5) {
            paddle.x = canv.width - WALL - paddle.w * 0.5;
        }
    }

    function Ball() {
        this.w = BALL_SIZE;
        this.h = BALL_SIZE;
        this.x = paddle.x;
        this.y = paddle.y - paddle.h / 2 - this.h / 2;
        this.spd = BALL_SPD * WIDTH;
        this.xv = 0;
        this.yv = 0;
    }

    function Paddle() {
        this.w = PADDLE_W;
        this.h = PADDLE_H;
        this.x = canv.width / 2;
        this.y = canv.height - this.h * 3;
        this.spd = PADDLE_SPD * WIDTH;
        this.xv = 0;
    }
