import express from "express";
import cors from 'cors';
import path from "path";
import { fileURLToPath } from "url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { ServerOptions } from "../types/index.js";
import routes from "../routes/index.js";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configure the Express server with all necessary middleware and routes
 * @param server The MCP server instance
 * @returns An Express app configured and ready to use
 */
export function configureExpressApp(server: McpServer) {
    const app = express();
    const transportMap = new Map<string, SSEServerTransport>();

    // Enable CORS for all origins
    app.use(cors({
        origin: '*',
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Serve static files - with proper path resolution
    const publicPath = path.join(__dirname, '../../src/public');
    app.use('/static', express.static(publicPath));

    // Use the routes defined in routes/index.ts
    app.use('/', routes);

    // Configure SSE endpoint
    app.get("/sse", async (req, res) => {
        console.error(`Received SSE connection request from ${req.ip}`);
        
        // Set headers for SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        // Create the full URL for messages endpoint
        const messagesUrl = `/messages`;
        console.error(`Creating SSE transport with messagesUrl=${messagesUrl}`);
        const transport = new SSEServerTransport(messagesUrl, res);
        console.error(`Created SSE transport with sessionId=${transport.sessionId}`);
        transportMap.set(transport.sessionId, transport);
        await server.connect(transport);
        console.error(`Connected transport with sessionId=${transport.sessionId} to MCP server`);
    });

    // Configure messages endpoint
    app.post("/messages", (req, res) => {
        const sessionId = req.query.sessionId as string;
        console.error(`Received message for sessionId=${sessionId}`);
        if (!sessionId) {
            console.error('Message received without sessionId');
            res.status(400).json({ error: 'sessionId is required' });
            return;
        }

        const transport = transportMap.get(sessionId);
        if (transport) {
            console.error(`Found transport for sessionId=${sessionId}, handling message`);
            transport.handlePostMessage(req, res);
        } else {
            console.error(`No transport found for sessionId=${sessionId}`);
            res.status(404).json({ error: 'Session not found' });
        }
    });

    return app;
}

/**
 * Run the server with the specified options
 * @param server The MCP server instance 
 * @param options Server configuration options
 */
export async function runExpressServer(server: McpServer, options: ServerOptions = {}): Promise<void> {
    const port = options.port || parseInt(process.env.MCP_PORT || "3001");
    const endpoint = options.endpoint || process.env.MCP_ENDPOINT || "/sse";

    // Configure and start Express server
    const app = configureExpressApp(server);

    // Start the server
    app.listen(port, () => {
        console.error(`Healthcare MCP Server running on port ${port}`);
        console.error(`SSE URL: http://localhost:${port}${endpoint}`);
        console.error(`Messages URL: http://localhost:${port}/messages`);
    });
} 