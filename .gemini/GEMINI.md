## Gemini Added Memories
- The user's project is 'offer_hunter', a Chrome Extension.
- The project was migrated from Next.js to a standard React, TypeScript, and Webpack stack with Tailwind CSS.
- The primary application code is now located in the `extension_webpack` directory. The original `extension` directory is considered legacy.
- To build the project, run `npm run build` inside the `/extension_webpack` directory. The output is generated in `/extension_webpack/dist`.
- The application uses `react-router-dom` with `HashRouter` for navigation.
- Core features include user profile management, LLM-based content generation, and a passcode lock feature.
- Service logic is located in `extension_webpack/src/services`, with key files being `storageService.ts` and `llmService.ts`.
- All UI components are in `extension_webpack/src`, structured into `pages`, `components`, and a main `App.tsx` that handles routing and the lock screen logic.
