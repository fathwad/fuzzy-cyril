(function($) {
function Board(size) {
    this.size = parseInt(size) || 19;
    this.stones = null;
    this._events = {};

    this.clearBoard();
}

Board.prototype.addEventListener = function(event_name, callback) {
    var callbacks = this._events[event_name] = this._events[event_name] || [];
    callbacks.push(callback);
}

Board.prototype.dispatchEvent = function(event_name, args) {
    if (this._events.hasOwnProperty(event_name)) {
        var callbacks = this._events[event_name], i;
        for (i = 0; i < callbacks.length; i++) {
            callbacks[i].apply(this, args);
        }
    }
}

Board.prototype.clearBoard = function() {
    this.stones = new Array(this.size);

    for (var i = 0; i < this.stones.length; i++) {
        this.stones[i] = new Array(this.size);
    }
}

Board.prototype.addStone = function(x, y, color, suppress_change_event) {
    if (x < this.stones.length && y < this.stones.length && !this.stones[x][y]) {
        var stone = new Stone(x, y, this, color);
        this.stones[x][y] = stone;
        stone.mergeGroup();
        stone.killNeighbors();
    }
    if (!suppress_change_event) {
        this.dispatchEvent("change");
    }
}

Board.prototype.removeStone = function (x, y, suppress_change_event) {
    var stone = this.stones[x][y];
    if (stone) {
        
    }
}

Board.prototype.serialize = function() {
    var raw_board = {w: [], b: [], size: this.size}, stone, i, j;
    for (i = 0; i < this.stones.length; i++) {
        for (j = 0; j < this.stones.length; j++) {
            stone = this.stones[i][j];
            if (stone) {
                raw_board[stone.color].push({x: i, y: j});
            }
        }
    }
    return JSON.stringify(raw_board);
}

Board.prototype.deserialize = function(raw) {
    if (typeof raw === "string") {
        raw = JSON.parse(raw);
    }

    var board = this;
    board.size = raw.hasOwnProperty("size")? raw.size : 19;
    board.clearBoard();

    if (raw.hasOwnProperty("w")) {
        raw.w.forEach(function(coord) {
            board.addStone(coord.x, coord.y, "w", true);
        });
    }
    if (raw.hasOwnProperty("b")) {
        raw.b.forEach(function(coord) {
            board.addStone(coord.x, coord.y, "b", true);
        });
    }
    this.dispatchEvent("change");
}

function Stone(x, y, board, color) {
    this.x = x;
    this.y = y;
    this.board = board;
    this.color = color;
    this.group = null;
}

Stone.prototype.neighbors = function(action, array_fn) {
    array_fn = array_fn || "map";
    var neighbor_coords = [
        {x: this.x - 1, y: this.y},
        {x: this.x + 1, y: this.y},
        {x: this.x, y: this.y - 1},
        {x: this.x, y: this.y + 1}
    ], board = this.board, stone = this;
    return neighbor_coords.filter(function(coord) {
            return coord.x >= 0 && coord.y >= 0 && coord.x < board.stones.length && coord.y < board.stones.length;
        })[array_fn](function(coord) {
            return action.call(stone, board.stones[coord.x][coord.y]);
        });
}

Stone.prototype.rediscoverGroup = function(new_group) {
    if (!new_group) {
        new_group = new Group();
    }

    console.log("rediscovering group");

    if (this.group) {
        this.group.stones = this.group.stones.filter(function(stone) {
            return stone != this;
        });
    }
    this.group = new_group;
    this.group.stones.push(this);

    var reassignNeighbors = function(neighbor) {
        if (neighbor && this.color == neighbor.color && this.group != neighbor.group) {
            neighbor.rediscoverGroup(new_group);
        }
    };
    this.neighbors(reassignNeighbors);
}

Stone.prototype.mergeGroup = function() {
    var merge_neighbor = function(neighbor) {
        if (neighbor && neighbor.color == this.color) {
            var neighbor_group = neighbor.group;
            this.group = this.group || neighbor_group || new Group([this, neighbor]);
            if (neighbor_group) {
                neighbor_group.setNewGroup(this.group);
            } else {
                neighbor.group = this.group;
                this.group.stones.push(neighbor);
            }
        }
    };
    this.neighbors(merge_neighbor);
}

Stone.prototype.killNeighbors = function() {
    var kill_neighbor = function(neighbor) {
        if (neighbor && neighbor.color != this.color) {
            var group = neighbor.group || neighbor;
            if (!group.hasLiberty()) {
                group.die();
            }
        }
    }
    this.neighbors(kill_neighbor);
}

Stone.prototype.hasLiberty = function() {
    var is_neighbor_undefined = function(neighbor) {
        return !neighbor;
    }
    return this.neighbors(is_neighbor_undefined, "some");
}

Stone.prototype.removeFromBoard = function() {
    this.board.stones[this.x][this.y] = null;
    if (this.group) {
        this.group = null;
        this.neighbors(function(neighbor) {
            if (neighbor && this.color == neighbor.color) {
                neighbor.rediscoverGroup();
            }
        });
    }
}

function Group(stones) {
    if (!stones) {
        stones = []
    }
    this.stones = stones;
    var i;
    for (i = 0; i < stones.length; i++) {
        stones[i].group = this;
    }
}

Group.prototype.setNewGroup = function(group) {
    var i;
    if (this != group) {
        for (i = 0; i < this.stones.length; i++) {
            this.stones[i].group = group;
        }
        group.stones = group.stones.concat(this.stones);
    }
}

Group.prototype.hasLiberty = function() {
    return this.stones.some(function(stone) {
        return stone.hasLiberty();
    });
}

Group.prototype.die = function() {
    this.stones.forEach(function(stone) {
        stone.group = null;
        stone.removeFromBoard();
    });
}
function Record() {
    this.board = new Board();
    this.current_move = null;
    this.root_move = null;
    this._static_moves = {w: {}, b: {}};
}

Record.prototype.loadFromSgfString = function(sgf_data) {
    // Parse sgf_data and build move_stack
    var value_re = /\[[^\]]*\]/, cur_mv, last_mv, root_mv, method, cur_char,
        last_method, variation_stack = [], match_index, values, value_prefix;

    this.board.clearBoard();
    while (sgf_data.length > 0) {
        match_index = sgf_data.search(value_re);
        if (match_index >= 0) {
            values = value_re.exec(sgf_data);
            value_prefix = sgf_data.substr(0, match_index).replace(/\s/g, "");
            sgf_data = sgf_data.substr(match_index + values[0].length);

            // Find the current method and handle variations
            method = "";
            while (value_prefix.length > 0) {
                cur_char = value_prefix.charAt(0);
                value_prefix = value_prefix.substr(1);
                if (cur_char === "(") {
                    // Start new variation
                    if (last_mv) {
                        variation_stack.push(cur_mv);
                    }
                } else if (cur_char === ")") {
                    // End the current variation
                    if (variation_stack.length > 0) {
                        cur_mv = variation_stack.pop();
                    }
                } else if (cur_char === ";") {
                    // Start a new move
                    last_mv = cur_mv;
                    cur_mv = new Move();
                    root_mv = root_mv? root_mv : cur_mv;
                    if (last_mv) {
                        last_mv.addNextMove(cur_mv);
                    }
                } else {
                    method += cur_char;
                }
            }
            method = method.trim();
            if (method) {
                last_method = method;
            } else {
                method = last_method;
            }

            // Populate current move
            if (cur_mv) {
                if (cur_mv.meta.indexOf(method) < 0) {
                    cur_mv.meta += " " + method;
                    cur_mv.meta = cur_mv.meta.trim();
                }
                value = values[0].replace(/[\]\[]/g, "");
                if (method == "B" || method == "W") {
                    cur_mv.color = method;
                    cur_mv.position = value;
                } else if (method == "C") {
                    cur_mv.comment = value;
                } else if (method == "AW") {
                    cur_mv.aw.push(value);
                } else if (method == "AB") {
                    cur_mv.ab.push(value);
                } else if (method == "AE") {
                    cur_mv.ae.push(value);
                }
            }
        } else {
            value_prefix = sgf_data;
            sgf_data = "";
        }
    }
    this.current_move = root_mv;
    this.root_move = root_mv;

    // load static moves
    this._addStatic();

    this.board.dispatchEvent("change");
}

Record.prototype._addStatic = function() {
    var move = this.current_move, i, board_coords, stone,
        w = this._static_moves.w, b = this._static_moves.b;

    // remove all static stones (to maybe be readded later)
    for (coded_coord in w) {
        board_coords = sgfCoordToIndecies(coded_coord);
        stone = this.board.stones[board_coords[1]][board_coords[0]];
        if (stone) {
            stone.removeFromBoard();
        }
    }
    for (coded_coord in b) {
        board_coords = sgfCoordToIndecies(coded_coord);
        stone = this.board.stones[board_coords[1]][board_coords[0]];
        if (stone) {
            console.log(stone);
            stone.removeFromBoard();
        }
    }

    for (i = 0; i < move.aw.length; i++) {
        coded_coord = move.aw[i];
        delete b[coded_coord];
        w[coded_coord] = true;
    }
    for (i = 0; i < move.ab.length; i++) {
        coded_coord = move.ab[i];
        delete w[coded_coord];
        b[coded_coord] = true;
    }
    for (i = 0; i < move.ae.length; i++) {
        coded_coord = move.ae[i];
        delete b[coded_coord];
        delete w[coded_coord];
    }

    for (coded_coord in w) {
        board_coords = sgfCoordToIndecies(coded_coord);
        this.board.addStone(board_coords[1], board_coords[0], "w", true);
    }
    for (coded_coord in b) {
        board_coords = sgfCoordToIndecies(coded_coord);
        this.board.addStone(board_coords[1], board_coords[0], "b", true);
    }
}

Record.prototype.nextMove = function() {
    return this._nextMove(false);
}

Record.prototype._nextMove = function(suppress_change_event) {
    if (this.current_move.next_move) {
        if (!this.current_move.raw_board) {
            this.current_move.raw_board = this.board.serialize();
        }

        this.current_move = this.current_move.next_move;
        if (this.current_move.raw_board) {
            this.board.deserialize(this.current_move.raw_board);
        } else {
            var board_coords = sgfCoordToIndecies(this.current_move.position);
            if (board_coords && this.current_move.color) {
                this.board.addStone(board_coords[1], board_coords[0], this.current_move.color.toLowerCase(), suppress_change_event);
            }
            this._addStatic();

            if (!suppress_change_event) {
                this.board.dispatchEvent("change");
            }

            this.current_move.raw_board = this.board.serialize();
        }
    }
}

Record.prototype.previousMove = function() {
    if (this.current_move.previous_move) {
        this.current_move = this.current_move.previous_move;
        this.board.deserialize(this.current_move.raw_board);
    }
}

Record.prototype.playMove = function() {}

Record.prototype.jumpToMove = function(move_num, variation) {
    if (!variation) {
        variation = [];
    }
    var move_counter = 0;
    this.current_move = this.root_move;
    this.board.clearBoard();
    while (move_counter < move_num) {
        this._nextMove(true);
        move_counter++;
    }
    this.board.dispatchEvent("change");
}

function Move() {
    this.color = null;
    this.raw_board = null;
    this.comment = "";
    this.position = null;
    this.next_move = null;
    this.previous_move = null;
    this.meta = "";
    this.aw = [];
    this.ab = [];
    this.ae = [];
}

Move.prototype.addNextMove = function(mv) {
    if (this.next_move == null) {
        this.next_move = mv;
    } else if (this.next_move instanceof Move) {
        this.next_move = [this.next_move, mv];
    } else {
        this.next_move.push(mv);
    }
    mv.previous_move = this;
}

function sgfCoordToIndecies(sgf_coord) {
    if (sgf_coord) {
        return [sgf_coord.charCodeAt(0) - 97, sgf_coord.charCodeAt(1) - 97];
    } else {
        return [];
    }
}
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

    $.fn.kifu = function(sgf_data_or_url) {
        if (this.length == 0 || !this[0].getContext) {
            return this;
        }

        var record = this.data("kifu_record"), jq_obj = this;
        if (!record) {
            record = new Record();
            record.board.addEventListener("change", function() {
                drawBoard(this, jq_obj[0]);
            });
            if (typeof sgf_data_or_url === "string") {
                if (endsWith(sgf_data_or_url, ".sgf")) {
                    // Return the deferred ajax object
                    return $.ajax({
                        url: sgf_data_or_url,
                        dataType: 'text',
                        success: function(data) {
                            record.loadFromSgfString(data);
                            this.data("kifu_record", record);
                        }
                    });
                } else {
                    record.loadFromSgfString(sgf_data_or_url);
                }
            } else {
                record.loadFromSgfString(this.html());
            }
            drawBoard(record.board, this[0]);
            this.data("kifu_record", record);
        }
        return record;
    }

    function endsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }
})(jQuery);
