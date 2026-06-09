import { defineConfig } from "vite";

// The marketing-kit .jsx files use bare `React.useState/useRef/useEffect` and
// classic JSX, and share components via `window` (no ES imports between them).
// We inject `React` into every file and let esbuild's classic JSX transform
// (React.createElement) handle the markup — no extra React plugin needed.
export default defineConfig({
  esbuild: {
    jsx: "transform",
    jsxInject: `import React from "react"`,
  },
});
