var test_sgf = "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]RU[Japanese]SZ[19]KM[0.00]AW[ea][ma][pa][bb][cb][db][eb][mb][pb][rb][ac][cc][lc][mc][qc][nd][pd][qd][ne][oe][rm][qo][ro][ap][bp][qp][bq][pq][qq][br][cr][dr][nr][pr][sr][bs]AB[fa][fb][kb][lb][ob][qb][bc][dc][ec][gc][kc][nc][oc][pc][bd][cd][kd][ld][md][od][be][de][ao][bo][co][cp][rp][sp][cq][dq][fq][rq][ar][er][qr][rr][cs][qs])"
var test_seq = "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]RU[Japanese]SZ[19]KM[0.00]PW[Frank]PB[Alex];B[jj];W[ji];B[ij];W[kj];B[ki];W[lj];B[jh];W[kh];B[ii])"
var test_blob = "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]RU[Japanese]SZ[19]KM[0.00]AB[ji][ki][ij][jj][kj][jk])"
var test_funky = "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]RU[Japanese]SZ[19]KM[0.00]AW[ap][bp][cp]AB[ao][bo][co][aq][bq][cq])"

function test_print_board(board) {
    for (var i = 0; i < board.stones.length; i++) {
        var row = '';
        for (var j = 0; j < board.stones[i].length; j++) {
            var stone = board.stones[i][j];
            if (!stone) {
                row += '+ ';
            } else {
                row += stone.color == 'b'?'o ':'x ';
            }
        }
        console.log(row);
    }
}
