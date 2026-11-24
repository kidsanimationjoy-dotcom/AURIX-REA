# AURIX REA

**Understand. Reverse Engineer. Recreate.**

AURIX REA is a browser-based workspace for organizing authorized reverse-engineering investigations using the official [REA project](https://github.com/morluto/rea).

## Current release

The first frontend release includes:
- A responsive dashboard for desktop and mobile
- Investigation intake for websites, APKs, JavaScript/Electron, .NET, firmware, native binaries, databases, network recordings, and other targets
- A local-session investigation queue
- Explicit runtime connection status and setup requirements

**Important:** the current frontend does not execute REA analysis yet. Investigation records currently exist only in the browser session. The official REA runtime must be installed in a separate authenticated worker before analysis can run. Do not expose an unauthenticated MCP endpoint to the public internet.

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

## Netlify

Build command: `npm run build`  
Publish directory: `dist`

The repository includes `netlify.toml` for the Vite static build.

## Authorization and safety

Only examine software, files, systems, and services you own or are explicitly authorized to analyze. Do not use AURIX REA to access accounts, data, or systems without permission.

## Official REA references

- https://github.com/morluto/rea
- https://rea.tools
- https://www.npmjs.com/package/rea-agents
