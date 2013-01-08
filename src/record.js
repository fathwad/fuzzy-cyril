function Record() {
    this.board = new Board();
    this.current_move = null;
    this.root_move = null;
    this._static_moves = {w: {}, b: {}};
    this._variation_stack = [];
    this._variation_index = -1;
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
                } else if (method == "LB") {
                    cur_mv.lb.push(value);
                } else if (method == "TR") {
                    cur_mv.tr.push(value);
                }
            }
        } else {
            value_prefix = sgf_data;
            sgf_data = "";
        }
    }
    this._setCurrentMove(root_mv);
    this.root_move = root_mv;

    this._applyStatic();

    this.board.dispatchEvent("change");
}

Record.prototype._applyStatic = function() {
    var move = this.current_move, i, board_coords, stone,
        w = this._static_moves.w, b = this._static_moves.b;

    for (coded_coord in w) {
        board_coords = sgfCoordToIndecies(coded_coord);
        stone = this.board.stones[board_coords[0]][board_coords[1]];
        if (stone) {
            stone.removeFromBoard();
        }
    }
    for (coded_coord in b) {
        board_coords = sgfCoordToIndecies(coded_coord);
        stone = this.board.stones[board_coords[0]][board_coords[1]];
        if (stone) {
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
        this.board.addStone(board_coords[0], board_coords[1], "w", true);
    }
    for (coded_coord in b) {
        board_coords = sgfCoordToIndecies(coded_coord);
        this.board.addStone(board_coords[0], board_coords[1], "b", true);
    }
}

Record.prototype.setVariationStack = function(new_stack) {
    this._variation_stack = new_stack;
}

Record.prototype.nextMove = function() {
    return this._nextMove(false);
}

Record.prototype._nextMove = function(suppress_change_event) {
    var variation_to_take, board_coords;
    if (this.current_move.next_move) {
        if (!this.current_move.raw_board) {
            this.current_move.raw_board = this.board.serialize();
        }

        if (Object.prototype.toString.call(this.current_move.next_move) === "[object Array]") {
            this._variation_index++;
            if (!(this._variation_index in this._variation_stack)) {
                this._variation_stack[this._variation_index] = 0;
            }
            variation_to_take = this._variation_stack[this._variation_index];
            this._setCurrentMove(this.current_move.next_move[variation_to_take]);
        } else {
            this._setCurrentMove(this.current_move.next_move);
        }

        if (this.current_move.raw_board) {
            this.board.deserialize(this.current_move.raw_board);
        } else {
            board_coords = sgfCoordToIndecies(this.current_move.position);
            if (board_coords && this.current_move.color) {
                this.board.addStone(board_coords[0], board_coords[1], this.current_move.color.toLowerCase(), suppress_change_event);
            }
            this._applyStatic();

            if (!suppress_change_event) {
                this.board.dispatchEvent("change");
            }

            this.current_move.raw_board = this.board.serialize();
        }
    }
}

Record.prototype.previousMove = function() {
    if (this.current_move.previous_move) {
        this._setCurrentMove(this.current_move.previous_move);
        if (Object.prototype.toString.call(this.current_move.next_move) === "[object Array]") {
            this._variation_index--;
        }
        this.board.deserialize(this.current_move.raw_board);
    }
}

Record.prototype.playMove = function() {}

Record.prototype.jumpToMove = function(move_num) {
    var move_counter = 0;
    this._setCurrentMove(this.root_move);
    this._variation_index = -1;
    this.board.clearBoard();
    while (move_counter < move_num) {
        this._nextMove(true);
        move_counter++;
    }
    this.board.dispatchEvent("change");
}

Record.prototype._setCurrentMove = function(move) {
    this.current_move = move;
    this.board.clearAnnotations();
    var i, board_coords, label;
    for (i = 0; i < move.lb.length; i++) {
        label = move.lb[i].split(":");
        board_coords = sgfCoordToIndecies(label[0]);
        this.board.annotations[board_coords[0]][board_coords[1]] = label[1];
    }
    for (i = 0; i < move.tr.length; i++) {
        board_coords = sgfCoordToIndecies(move.tr[i]);
        this.board.annotations[board_coords[0]][board_coords[1]] = "[tr]";
    }
}

function Move() {
    this.color = null;
    this.raw_board = null;
    this.raw_static = null;
    this.comment = "";
    this.position = null;
    this.next_move = null;
    this.previous_move = null;
    this.meta = "";
    this.aw = [];
    this.ab = [];
    this.ae = [];
    this.lb = [];
    this.tr = [];
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
