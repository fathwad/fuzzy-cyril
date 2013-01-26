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
                        jq_obj.data("kifu_record", record);
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
