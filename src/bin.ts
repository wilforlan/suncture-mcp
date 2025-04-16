#!/usr/bin/env node

import { runServer } from './index.js';

// Run the server when the binary is executed
runServer()
  .catch((error: unknown) => {
    console.error("Fatal error in bin.js:", error);
    process.exit(1);
  }); 