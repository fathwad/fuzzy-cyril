function drawBoard(board, canvas) {
    var ctx = canvas.getContext("2d"), dim = 450, margins = 10,
        i, j, dx, dy, x_pos, y_pos, stone;

    ctx.clearRect(0,0,500,500);
    ctx.beginPath();

    // Vertical lines
    for (i = 0; i <= 18; i++) {
        dx = i/18*dim + margins;
        ctx.moveTo(dx, margins);
        ctx.lineTo(dx, dim + margins);
    }

    // Horizontal lines
    for (i = 0; i <= 18; i++) {
        dy = i/18*dim + margins;
        ctx.moveTo(margins, dy);
        ctx.lineTo(dim + margins, dy);
    }

    // Star points
    ctx.fillStyle = "rgb(0,0,0)";
    for (i = 3; i <= 15; i++) {
        for (j = 3; j <= 15; j++) {
            if (i % 6 == 3 && j % 6 == 3) {
                dx = i/18*dim + margins;
                dy = j/18*dim + margins;
                ctx.fillRect(dx - 3, dy - 3, 6, 6);
            }
        }
    }

    ctx.strokeStyle = "rgb(0,0,0)";
    ctx.lineWidth = 1.0;
    ctx.stroke();
    ctx.closePath();

    for (i = 0; i < board.stones.length; i++) {
        for (j = 0; j < board.stones[i].length; j++) {
            stone = board.stones[i][j];
            if (stone) {
                x_pos = stone.x / 18 * dim + margins;
                y_pos = stone.y / 18 * dim + margins;

                ctx.beginPath();
                ctx.arc(x_pos, y_pos, dim / (18 * 3), 0, 2 * Math.PI);
                ctx.strokeStyle = "rgb(0,0,0)";
                ctx.stroke();
                if (stone.color == "b") {
                    ctx.fillStyle = "rgb(0,0,0)";
                } else {
                    ctx.fillStyle = "rgb(255,255,255)";
                }
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}
