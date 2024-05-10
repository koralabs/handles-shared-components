
rollup -c
jq '.main = "index.js" | .module = "index.esm.js" | .types = "index.d.ts" | .files = ["*"]' package.json > package.tmp && mv package.tmp package.json
