# Suncture Healthcare MCP Server

A Model Context Protocol (MCP) server that provides healthcare-related tools for AI assistants, enabling them to offer practical healthcare information to users.

## Features

This MCP server includes the following healthcare tools:

1. **Health Recommendations Tool (`get-health-recommendations`)** - Get personalized health screening and preventive care recommendations based on age, sex, and pregnancy status.

2. **Medication Information Tool (`lookup-medication`)** - Look up comprehensive information about medications, including usage, dosage, side effects, and interactions.

3. **Disease Information Tool (`find-disease-info`)** - Find information about diseases and medical conditions, including symptoms, treatments, and prevention strategies.

4. **BMI Calculator Tool (`calculate-bmi`)** - Calculate Body Mass Index (BMI) and get tailored health recommendations based on the result.

5. **Symptom Checker Tool (`symptom-checker`)** - Analyze reported symptoms and get preliminary advice, potential conditions, and guidance on when to seek medical care.

## Installation

### Prerequisites

- Node.js (v18 or later)
- npm (v7 or later)

### Local Installation

```bash
# Clone the repository
git clone https://github.com/your-username/suncture-healthcare-mcp.git
cd suncture-healthcare-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start
```

## Usage with MCP-enabled AI Models

This MCP server can be used with AI models that support the Model Context Protocol. The server exposes healthcare-related tools that can be called by the model to provide information to users.

### Example Usage with Claude 3.5 Sonnet

```javascript
import { Anthropic } from "@anthropic-ai/sdk";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Connect to the healthcare MCP server
const healthcareMcp = new Client({ name: "healthcare-client", version: "1.0.0" });
const transport = new StdioClientTransport({
  command: "node",
  args: ["dist/index.js"],
});
healthcareMcp.connect(transport);

// Get available tools
const { tools } = await healthcareMcp.listTools();

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Example: Use the symptom checker tool
const response = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20240620",
  max_tokens: 1000,
  messages: [
    {
      role: "user",
      content: "I've been having a headache and fever for the past two days. What could it be?"
    }
  ],
  tools,
});

// Process tool calls from the model
for (const content of response.content) {
  if (content.type === "tool_use") {
    const result = await healthcareMcp.callTool({
      name: content.name,
      arguments: content.input,
    });
    console.log(result.content);
  }
}
```

## Docker Usage

You can also run the server using Docker:

```bash
# Build the Docker image
docker build -t suncture-healthcare-mcp .

# Run the container
docker run -i --rm suncture-healthcare-mcp
```

## MCP.so Hosting

This server is designed to be hostable on [MCP.so](https://mcp.so), allowing easy integration with supported AI models.

## Disclaimer

The healthcare information provided by this MCP server is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.

## License

MIT License 