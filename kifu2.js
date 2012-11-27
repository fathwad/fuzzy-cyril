var r;
(function($) {
    $(function() {
        // to be replaced with real glue code
        var jq = $("#mmm");
        r = new Record();
        r.loadFromSgfString(test_seq);

        r.board.addEventListener("change", function() {
            draw_board(this, jq[0]);
        });

        draw_board(r.board, jq[0]);
    });
})(jQuery);
