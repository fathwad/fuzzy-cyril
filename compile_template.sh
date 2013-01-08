#!/bin/bash
cat src/plugin_template.js | awk '{ if ($1 == "//:INCLUDE") system("cat " $2); else print $0 }' > bin/kifu.pretty.js
yuicompressor -v bin/kifu.pretty.js -o bin/kifu.min.js
