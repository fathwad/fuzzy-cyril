function drawBoard(board, canvas) {
    var ctx = canvas.getContext("2d"), dim = 450, margins = 30,
        i, j, dx, dy, x_pos, y_pos, stone, black_stone, stone_radius, padded_stone_radius;

    ctx.clearRect(0,0,500,500);
    ctx.beginPath();

    // Vertical lines
    for (i = 0; i <= board.size - 1; i++) {
        dx = i/(board.size - 1)*dim + margins;
        ctx.moveTo(dx, margins);
        ctx.lineTo(dx, dim + margins);
    }

    // Horizontal lines
    for (i = 0; i <= (board.size - 1); i++) {
        dy = i/(board.size - 1)*dim + margins;
        ctx.moveTo(margins, dy);
        ctx.lineTo(dim + margins, dy);
    }

    // Star points
    if (board.size == 19) {
        ctx.fillStyle = "rgb(0,0,0)";
        for (i = 3; i <= 15; i++) {
            for (j = 3; j <= 15; j++) {
                if (i % 6 == 3 && j % 6 == 3) {
                    dx = i/(board.size - 1)*dim + margins;
                    dy = j/(board.size - 1)*dim + margins;
                    ctx.fillRect(dx - 3, dy - 3, 6, 6);
                }
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
            annotation = board.annotations[i][j];

            x_pos = i / (board.size - 1) * dim + margins;
            y_pos = j / (board.size - 1) * dim + margins;
            stone_radius = dim / ((board.size - 1) * 3);

            if (stone) {
                ctx.beginPath();
                ctx.arc(x_pos, y_pos, stone_radius, 0, 2 * Math.PI);
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

            black_stone = stone && stone.color == "b";
            if (annotation) {
                padded_stone_radius = stone_radius - 1;
                if (annotation == "[tr]") {
                    ctx.beginPath();
                    ctx.moveTo(x_pos, y_pos - padded_stone_radius);
                    ctx.lineTo(x_pos + padded_stone_radius * Math.sqrt(3) / 2, y_pos + padded_stone_radius/2);
                    ctx.lineTo(x_pos - padded_stone_radius * Math.sqrt(3) / 2, y_pos + padded_stone_radius/2);
                    ctx.lineTo(x_pos, y_pos - padded_stone_radius);
                    if (black_stone) {
                        ctx.strokeStyle = "rgb(255,255,255)";
                    } else {
                        ctx.strokeStyle = "rgb(0,0,0)";
                    }
                    ctx.stroke();
                    ctx.closePath();
                } else if (annotation == "[cr]") {
                    ctx.beginPath();
                    ctx.arc(x_pos, y_pos, stone_radius/2, 0, 2 * Math.PI);
                    if (black_stone) {
                        ctx.strokeStyle = "rgb(255,255,255)";
                    } else {
                        ctx.strokeStyle = "rgb(0,0,0)";
                    }
                    ctx.stroke();
                    ctx.closePath();
                } else {
                    if (!black_stone) {
                        ctx.beginPath();
                        ctx.arc(x_pos, y_pos, stone_radius - 1, 0, 2 * Math.PI);
                        ctx.strokeStyle = "rgb(255,255,255)";
                        ctx.stroke();
                        ctx.fillStyle = "rgb(255,255,255)";
                        ctx.fill();
                        ctx.closePath();
                    }

                    ctx.beginPath();
                    ctx.font = "normal 12px Verdana";
                    ctx.fillStyle = black_stone?"rgb(255,255,255)":"rgb(0,0,0)";
                    text_metrics = ctx.measureText(annotation);
                    ctx.fillText(annotation, x_pos - text_metrics.width/2, y_pos + 4);
                    ctx.closePath();
                }
            }
        }
    }
}
