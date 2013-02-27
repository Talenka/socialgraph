#!/bin/bash

##
# SocialGraph (socialgraph.boudah.pl)
#
# @author Boudah Talenka <boudah.talenka@gmail.com>
# @license GNU General Public License
#
# This script checks, minifies and documents for the file SocialGraph.js
#

# We check style and language errors and warnings,
# just because we care. For this we use the closure-linter. Mac OS setup: 
# sudo easy_install http://closure-linter.googlecode.com/files/closure_linter-latest.tar.gz
gjslint SocialGraph.js --strict

# We use JSDoc Toolkit for generating documentation. Download it here:
# https://code.google.com/p/jsdoc-toolkit/downloads/detail?name=jsdoc_toolkit-2.4.0.zip
java -jar jsdoc-toolkit/jsrun.jar jsdoc-toolkit/app/run.js \
--debug --directory=doc --t=jsdoc-toolkit/templates/jsdoc/ SocialGraph.js

# We use Closure compiler for Javascript Minification. Download it here:
# http://closure-compiler.googlecode.com/files/compiler-latest.zip
java -jar closure/compiler.jar --js SocialGraph.js --js_output_file SocialGraph.min.js \
--charset UTF-8 --compilation_level ADVANCED_OPTIMIZATIONS \
--use_types_for_optimization --warning_level VERBOSE --accept_const_keyword

# We strip some lasting whitespaces (why are they here?)
# @todo simplify these lines
JS=$(cat SocialGraph.min.js)
# the -n option for echo suppress the trailling new line
rm SocialGraph.min.js
echo -n ${JS} >> SocialGraph.min.js

# We minify the stylesheet.
# We could also use closure stylesheets, with
# java -jar closure/stylesheets.jar style.css --output-file style.min.css
# @todo simplify these lines
CSS=$(cat style.css)
echo -n ${CSS} >> style.min.css
CSS=$(cat style.min.css)
CSS=${CSS//: /:}
CSS=${CSS//; /;}
CSS=${CSS//, /,}
CSS=${CSS//\{ /\{}
CSS=${CSS// \{/\{}
CSS=${CSS//\} /\}}
CSS=${CSS// \}/\}}
CSS=${CSS//;\}/\}}
rm style.min.css
echo -n ${CSS} >> style.min.css

# We rebuild the index.htm file, for network latency optimization
rm index.htm
echo -n "<!doctype html><meta charset=utf-8><title>SocialGraph</title><style>$(cat style.min.css)</style><script>$(cat SocialGraph.min.js)</script>" >> index.htm

# We remove unnecessary minified files
rm SocialGraph.min.js
rm style.min.css