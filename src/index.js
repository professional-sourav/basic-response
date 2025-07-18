"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_1 = require("@modelcontextprotocol/sdk/server/mcp");
const stdio_1 = require("@modelcontextprotocol/sdk/server/stdio");
const zod_1 = require("zod");
// Create server instance
const server = new mcp_1.McpServer({
    name: 'Basic Response Server',
    version: '1.0.0',
    capabilities: {
        resources: {},
        tools: {}
    }
});
const basicResponse = (data) => ({
    text: 'Hello, this is a basic response! ' + data,
    metadata: {
        timestamp: new Date().toISOString(),
        source: 'BasicResponse'
    }
});
server.tool('basicResponseMultiBlock', 'Returns response with separate content blocks', { state: zod_1.z.string().optional() }, (_a) => __awaiter(void 0, [_a], void 0, function* ({ state }) {
    const responseText = state || 'Default input';
    const timestamp = new Date().toISOString();
    const source = 'MCP Server';
    return {
        content: [
            {
                type: "text",
                text: responseText
            },
            {
                type: "text",
                text: `Generated at ${timestamp} from ${source}`
            }
        ]
    };
}));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Create transport for server
        const transport = new stdio_1.StdioServerTransport();
        // Start the server
        yield server.connect(transport);
        console.log('MCP Server is running and waiting for requests...');
    });
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
