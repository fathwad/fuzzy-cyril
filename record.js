function Record() {
    this.board = null;
    this.current_move = null;
}

Record.prototype.loadFromSgfString = function(sgf_data) {
    // Parse sgf_data and build move_stack
    var value_re = /\[[^\]]*\]/, cur_mv, last_mv, last_method, variation_stack, root_mv;

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
    var board = new Board();
    this.board = board;

    // load static moves
    root_mv.aw.forEach(function(coded_coord) {
        board.addStone(coded_coord.charCodeAt(1) - 97, coded_coord.charCodeAt(0) - 97, "w");
    });
    root_mv.ab.forEach(function(coded_coord) {
        board.addStone(coded_coord.charCodeAt(1) - 97, coded_coord.charCodeAt(0) - 97, "b");
    });

    // load played moves
}

Record.prototype.nextMove = function() {
    
}

Record.prototype.previousMove = function() {}
Record.prototype.playMove = function() {}

function Move() {
    this.color = null;
    this.raw_board = null;
    this.comment = "";
    this.position = null;
    this.next_move = null;
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
}
