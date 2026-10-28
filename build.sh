#!/bin/bash
set -e
rollup -c
# Publish manifest for lib/ (the package root on npm). Written to lib/, never over the source package.json.
jq '.main = "index.js" | .module = "index.esm.js" | .types = "index.d.ts" | .files = ["*"]' package.json > lib/package.json
