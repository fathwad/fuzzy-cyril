var test_sgf = "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]RU[Japanese]SZ[19]KM[0.00]AW[ea][ma][pa][bb][cb][db][eb][mb][pb][rb][ac][cc][lc][mc][qc][nd][pd][qd][ne][oe][rm][qo][ro][ap][bp][qp][bq][pq][qq][br][cr][dr][nr][pr][sr][bs]AB[fa][fb][kb][lb][ob][qb][bc][dc][ec][gc][kc][nc][oc][pc][bd][cd][kd][ld][md][od][be][de][ao][bo][co][cp][rp][sp][cq][dq][fq][rq][ar][er][qr][rr][cs][qs])"
var test_seq = "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]RU[Japanese]SZ[19]KM[0.00]PW[Frank]PB[Alex];B[jj];W[ji];B[ij];W[kj];B[ki];W[lj];B[jh];W[kh];B[ii])"
var test_blob = "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]RU[Japanese]SZ[19]KM[0.00]AB[ji][ki][ij][jj][kj][jk])"
var test_funky = "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]RU[Japanese]SZ[19]KM[0.00]AW[ap][bp][cp]AB[ao][bo][co][aq][bq][cq])"
var test_ladder = "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]RU[Japanese]SZ[19]KM[0.00]AW[ki][jj][kj][ik][jk]AB[ji][ij][lj][hk][kk][il][jl])"
var test_ladder_seq = "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]RU[Japanese]SZ[19]KM[0.00]AW[jj][kj][ik][jk]AB[ji][ij][lj][hk][kk][il][jl];AW[ki])"
var test_capture_3 = "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]RU[Japanese]SZ[19]KM[0.00]AW[cp][dp][ep][bq][eq][cr][er]AB[cq][dq][dr];B[aq];W[ds])"
var test_no_static_cap_3 = "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]RU[Japanese]SZ[19]KM[0.00];B[cq];W[bq];B[dq];W[cr];B[dr];W[er];B[bp];W[cp];B[aq];W[dp];B[co];W[eq];B[do];W[ds])"
var test_no_static_cap_3_2 = "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]RU[Japanese]SZ[19]KM[0.00];B[co];W[dp];B[cq];W[cp];B[dq];W[ep];B[bp];W[eq];B[fp];W[er];B[dr];W[bo];B[bn];W[bq];B[ao];W[cr];B[aq];W[ds])"
var test_9x9_game = "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]RU[Japanese]SZ[9]HA[7]KM[0.00]PW[Frank]PB[Lynda]AB[cc][gc][ce][ee][ge][cg][gg];W[df];B[de];W[cf];B[dg];W[ef];B[bf];W[eg];B[ff];W[eh];B[dh];W[be];B[bd];W[bg];B[ae];W[ch];B[ag];W[di];B[bh];W[gh];B[cg];W[dg];B[bg];W[hg];B[hf];W[fg];B[gf];W[hh];B[if];W[bi];B[ig];W[ih];B[];W[ci])"
var test_no_static_ladder = "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]RU[Japanese]SZ[19]KM[0.00];B[jk];W[ij];B[ik];W[in];B[hj];W[lo];B[ii];W[jj];B[kj];W[ji];B[jh];W[ki];B[li];W[kh];B[kg];W[lh];B[mh];W[lg];B[lf])"
var test_static_cap = "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]RU[Japanese]SZ[19]KM[0.00]AW[jj]AB[ij][kj][jk];B[ji])"
var test_static_cap_2 = "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]RU[Japanese]SZ[19]KM[0.00]AW[ji][jj]AB[ii][ki][ij][kj][jk];B[jh])"
var hybrid_cap = "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]RU[Japanese]SZ[19]KM[0.00]AW[jj]AB[ii][ij][kj][jk];B[ki];W[ji];B[jh])"

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
