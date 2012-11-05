function Board(size) {
    this.size = parseInt(size) || 19;
    this.stones = null;

    this.clearBoard();
}

Board.prototype.clearBoard = function() {
    this.stones = new Array(this.size);

    for (var i = 0; i < this.stones.length; i++) {
        this.stones[i] = new Array(this.size);
    }
}

Board.prototype.addStone = function(x, y, color) {
    if (x < this.stones.length && y < this.stones.length && !this.stones[x][y]) {
        var stone = new Stone(x, y, this, color);
        this.stones[x][y] = stone;
        stone.mergeGroup();
        stone.killNeighbors();
    }
}

Board.prototype.serialize = function() {
    var raw_board = {w: [], b: [], size: this.size};
    for (var i = 0; i < this.stones.length; i++) {
        for (var j = 0; j < this.stones.length; j++) {
            var stone = this.stones[i][j];
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
            board.addStone(coord.x, coord.y, "w");
        });
    }
    if (raw.hasOwnProperty("b")) {
        raw.b.forEach(function(coord) {
            board.addStone(coord.x, coord.y, "b");
        });
    }
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
    ];
    var board = this.board;
    var stone = this;
    return neighbor_coords.filter(function(coord) {
            return coord.x >= 0 && coord.y >= 0 && coord.x < board.stones.length && coord.y < board.stones.length;
        })[array_fn](function(coord) {
            return action.call(stone, board.stones[coord.x][coord.y]);
        });
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

Stone.prototype.die = function() {
    this.board.stones[this.x][this.y] = null;
    if (this.group) {
        this.group.stones = this.group.stones.filter(function(stone) {
            return stone != this;
        });
        this.group = null;
    }
}

function Group(stones) {
    this.stones = stones;
    for (var i = 0; i < stones.length; i++) {
        stones[i].group = this;
    }
}

Group.prototype.setNewGroup = function(group) {
    if (this != group) {
        for (var i = 0; i < this.stones.length; i++) {
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
        stone.die();
    });
}
