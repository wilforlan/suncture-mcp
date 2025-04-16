#!/usr/bin/env node

import { runServer } from "./index.js";

// Run the server when executed directly
runServer().catch((error) => {
    console.error("Fatal error in bin.ts:", error);
    process.exit(1);
}); 