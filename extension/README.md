# Offer Hunter Chrome Extension

This is a Chrome extension built with Next.js and React to help automate job applications.

## Development Notes

During the development and refactoring of this extension, several key issues were encountered related to the build and configuration process for a Next.js application as a Chrome Extension.

### 1. Tailwind CSS Integration

**Issue:** Tailwind CSS classes were not being applied to the components, despite being correctly used in the code.

**Resolution:**
- **Dependency:** The `autoprefixer` package, a peer dependency for Tailwind CSS, was missing and needed to be installed.
- **PostCSS Configuration:** The `postcss.config.js` file was missing the `tailwindcss/nesting` plugin.
- **Content Path:** The `tailwind.config.js` file's `content` array was not correctly targeting all the component files. It was updated to specifically include all relevant files within the `app` directory.

### 2. Chrome Extension Loading Error: `_next` Directory

**Issue:** The extension failed to load in Chrome because the default Next.js build process creates a directory named `_next`. Chrome reserves filenames starting with an underscore (`_`) for its own use, causing a fatal error.

**Resolution:**
- **Build Script:** A `post-build.sh` script was created to run after the `next build` command.
- **Directory Rename:** This script renames the `dist/_next` directory to `dist/next`.
- **Path Rewriting:** The script then uses `sed` to find and replace all occurrences of `_next/` with `next/` in the generated HTML files, ensuring all asset paths are correct.

### 3. Stylesheet Injection in Extension

**Issue:** Even after a successful build, the application's styles were not present because the generated CSS file was not being loaded by the extension.

**Resolution:**
- **Build Script:** The `post-build.sh` script was updated to locate the generated CSS file (which has a unique hash in its name) from the build output.
- **CSS Copying:** The script copies this file into the `dist` directory with a static name, `style.css`.
- **Manifest Configuration:** The `public/manifest.json` file was updated to include `"css": ["style.css"]` in the `content_scripts` section, instructing Chrome to inject the stylesheet into the specified pages.
