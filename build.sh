#!/bin/sh
set -eu

rm -rf dist
mkdir -p dist

cp index.html styles.css script.js project.css robots.txt dist/
cp -R assets dist/assets
cp -R projects dist/projects

echo "Lambda build ready in dist/"
