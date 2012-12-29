#!/bin/bash
cat plugin_template.js | awk '{ if ($1 == "//:INCLUDE") system("cat " $2); else print $0 }' > kifu.pretty.js
yuicompressor -v kifu.pretty.js -o kifu.min.js
