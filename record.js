function Record() {
    this.board = new Board();
    this.current_move = null;
    this.root_move = null;
}

Record.prototype.loadFromSgfString = function(sgf_data) {
    // Parse sgf_data and build move_stack
    var value_re = /\[[^\]]*\]/, cur_mv, last_mv, last_method, variation_stack, root_mv;

    this.board.clearBoard();
    while (sgf_data.length > 0) {
        var match_index = sgf_data.search(value_re), values, value_prefix;
        if (match_index >= 0) {
            values = value_re.exec(sgf_data);
            value_prefix = sgf_data.substr(0, match_index).replace(/\s/g, "");
            sgf_data = sgf_data.substr(match_index + values[0].length);

            // Find the current method and handle variations
            var c, method = "";
            while (value_prefix.length > 0) {
                c = value_prefix.charAt(0);
                value_prefix = value_prefix.substr(1);
                if (c === "(") {
                    // Start new variation
                    if (last_mv) {
                        variation_stack.push(cur_mv);
                    }
                } else if (c === ")") {
                    // End the current variation
                    if (variation_stack.length > 0) {
                        cur_mv = variation_stack.pop();
                    }
                } else if (c === ";") {
                    // Start a new move
                    last_mv = cur_mv;
                    cur_mv = new Move();
                    root_mv = root_mv? root_mv : cur_mv;
                    if (last_mv) {
                        last_mv.addNextMove(cur_mv);
                    }
                } else {
                    method += c;
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
    root_mv.aw.forEach(function(coded_coord) {
        var board_coords = sgfCoordToIndecies(coded_coord);
        board.addStone(board_coords[1], board_coords[0], "w", true);
    });
    root_mv.ab.forEach(function(coded_coord) {
        var board_coords = sgfCoordToIndecies(coded_coord);
        board.addStone(board_coords[1], board_coords[0], "b", true);
    });

    // load played moves

    this.board.dispatchEvent("change");
}

Record.prototype.nextMove = function() {
    return this._nextMove(false)
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
            if (board_coords) {
                this.board.addStone(board_coords[1], board_coords[0], this.current_move.color.toLowerCase(), suppress_change_event);
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
