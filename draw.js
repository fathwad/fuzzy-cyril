function draw_board(board, canvas) {
    var ctx = canvas.getContext("2d"), dim = 450, margins = 10;

    ctx.clearRect(0,0,500,500);
    ctx.beginPath();

    // Vertical lines
    for (var i = 0; i <= 18; i++) {
        var dx = i/18*dim + margins;
        ctx.moveTo(dx,margins);
        ctx.lineTo(dx,dim + margins);
    }

    // Horizontal lines
    for (var i = 0; i <= 18; i++) {
        var dy = i/18*dim + margins;
        ctx.moveTo(margins,dy);
        ctx.lineTo(dim + margins,dy);
    }

    // Star points
    ctx.fillStyle = "rgb(0,0,0)";
    for (var i = 3; i <= 15; i++) {
        for (var j = 3; j <= 15; j++) {
            if (i % 6 == 3 && j % 6 == 3) {
                var dx = i/18*dim + margins;
                var dy = j/18*dim + margins;
                ctx.fillRect(dx - 3, dy - 3, 6, 6);
            }
        }
    }

    ctx.strokeStyle = "rgb(0,0,0)";
    ctx.lineWidth = 1.0;
    ctx.stroke();
    ctx.closePath();

    for (var i = 0; i < board.stones.length; i++) {
        for (var j = 0; j < board.stones[i].length; j++) {
            var stone = board.stones[i][j];
            if (stone) {
                var x_pos = stone.x / 18 * dim + margins;
                var y_pos = stone.y / 18 * dim + margins;

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
