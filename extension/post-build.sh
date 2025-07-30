#!/bin/bash
# Move the contents of _next to a valid directory name
if [ -d "dist/_next" ]; then
  mv dist/_next dist/next
fi

# Update references in HTML files
find dist -name "*.html" -print0 | xargs -0 sed -i 's/_next/next/g'

# Find the generated CSS file and copy it to the dist directory
CSS_FILE=$(find dist/next/static/css -name "*.css" | head -n 1)
if [ -f "$CSS_FILE" ]; then
  cp "$CSS_FILE" "dist/style.css"
fi

# Copy public files
cp -r public/* dist/

# Bundle background script
esbuild public/background.js --bundle --outfile=dist/background.bundle.js --loader:.js=jsx
