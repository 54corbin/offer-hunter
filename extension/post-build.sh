#!/bin/bash

# Copy all files from public to dist
cp -r public/* dist/

# Bundle background script
./node_modules/.bin/esbuild public/background.js --bundle --outfile=dist/background.bundle.js

# Rename _next to next, if it exists
if [ -d "dist/_next" ]; then
    mv dist/_next dist/next
fi

# Update references in HTML, JS, and CSS files
find dist -type f \( -name '*.html' -o -name '*.js' -o -name '*.css' \) -exec sed -i 's/\/_next\//next\//g' {} +

# Extract all inline scripts from HTML files to be compliant with Content Security Policy (CSP).
# This is necessary for Chrome Extensions, which forbid inline JavaScript.
find dist -name "*.html" | while read html_file; do
  # Define a file to store the extracted scripts for the current HTML file.
  inline_js_file="dist/$(basename "$html_file" .html).inline.js"
  > "$inline_js_file" # Create or truncate the file.

  # Use Perl to robustly find and extract all inline script content.
  # Perl is used for its powerful regex capabilities, which are more reliable
  # for this kind of HTML parsing than sed or grep.
  # - The 's{...}{...}ges' command finds all ('g') matches, allows '.' to match
  #   newlines ('s'), and executes code ('e') for the replacement.
  # - We find any <script> tag that does NOT have a 'src=' attribute.
  # - Its content is captured and printed to our .js file.
  # - The original inline script tag is replaced with an empty string.
  perl -0777 -i -pe '
    open my $js_fh, ">>", "'""$inline_js_file""'";
    s{<script\b(?![^>]*\bsrc=)[^>]*>(.*?)</script>}{
      print $js_fh $1 . ";\n";
      "";
    }ges;
    close $js_fh;
  ' "$html_file"

  # If we extracted any scripts, add a single <script> tag back into the HTML
  # to load the combined inline scripts from the file we created.
  if [ -s "$inline_js_file" ]; then
    script_name=$(basename "$inline_js_file")
    sed -i "s,</body>,<script src=\"$script_name\"></script></body>,g" "$html_file"
  else
    # If no scripts were found, remove the empty JS file.
    rm "$inline_js_file"
  fi
done
