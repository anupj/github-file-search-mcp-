# GitHub Code Explorer using Model Context Protocol

This project demonstrates how to implement the Model Context Protocol (MCP) to create a GitHub code search tool that could be used by AI assistants.

## What is Model Context Protocol?

Model Context Protocol is a standardized way for AI models to interact with external tools and services. It defines:

1. How functions are described to AI models
2. How AI models decide which functions to call
3. How parameters are structured and validated
4. How results are returned in a consistent format

## Features

- Search for code across GitHub repositories
- View file contents from repositories
- Search for GitHub repositories
- Function discovery endpoint
- AI assistant simulation interface

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Optional: Set up a GitHub API token as the environment variable `GH_TOKEN` for higher rate limits

## Usage

1. Start the server:
   ```bash
   npm start
   ```
   or for development with auto-reload:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to http://localhost:3000
3. Click "Load Available Functions" to see the API capabilities
4. Type a query in the input box and press Enter to simulate an AI conversation

## API Endpoints

- `GET /api/mcp/functions` - List all available functions
- `POST /api/mcp` - Call a function with parameters

## Implementation Details

The application consists of:
- A Node.js/Express backend that wraps the GitHub API
- A browser client that simulates an AI assistant using the API
- MCP-compatible function definitions with JSON Schema
