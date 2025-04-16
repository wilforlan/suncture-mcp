import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerHealthTools } from "./tools/healthTools.js";
import { runExpressServer } from "./controllers/server.js";
import { ServerOptions } from "./types/index.js";

// Server instance - exported for potential programmatic use
export const server = new McpServer({
    name: "suncture-healthcare",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});

// Register all healthcare tools with the server
registerHealthTools(server);

/**
 * Run the MCP server
 * @param options Optional server configuration options
 * @returns A promise that resolves when the server is running
 */
export async function runServer(options?: ServerOptions): Promise<void> {
    // Get configuration from options or environment variables
    const mode = options?.mode || process.env.MCP_MODE || "sse";

    try {
        // Check if mode is SSE and set up SSE server
        if (mode === "sse") {
            try {
                console.error(`Setting up SSE server...`);
                await runExpressServer(server, options);
                return;
            } catch (error) {
                console.error("Failed to initialize SSE transport:", error);
                console.error("Falling back to stdio mode.");
                // Fall back to stdio mode if SSE transport is not available
            }
        }
        // Check if mode is REST (legacy support)
        else if (mode === "rest") {
            try {
                // Dynamically import the REST transport module
                const { RestServerTransport } = await import("@chatmcp/sdk/server/rest.js");
                
                const port = options?.port || parseInt(process.env.MCP_PORT || "3001");
                const endpoint = options?.endpoint || process.env.MCP_ENDPOINT || "/rest";
                
                const transport = new RestServerTransport({
                    port,
                    endpoint,
                });
                await server.connect(transport);
                await transport.startServer();
                console.error(`Healthcare MCP Server running in REST mode on port ${port} with endpoint ${endpoint}`);
                return;
            } catch (error) {
                console.error("Failed to initialize REST transport. Falling back to stdio mode.", error);
                // Fall back to stdio mode if REST transport is not available
            }
        }

        // Default to stdio mode
        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.error("Healthcare MCP Server running on stdio");
    } catch (error) {
        console.error("Fatal error running server:", error);
        throw error; // Rethrow to allow calling code to handle errors
    }
}

// Auto-run the server if this file is executed directly (not imported as a module)
if (import.meta.url === `file://${process.argv[1]}`) {
    runServer().catch((error) => {
        console.error("Fatal error in main():", error);
        process.exit(1);
    });
}