// server.js - GitHub API Proxy Server
// This server acts as a middleware between the frontend client and GitHub's API
// It implements a Model Context Protocol for standardized function calling

// Import required dependencies
const express = require('express'); // Web server framework
const axios = require('axios');     // HTTP client for API requests
const cors = require('cors');       // Cross-Origin Resource Sharing middleware
const app = express();              // Initialize Express application

// Configure Express middleware
app.use(express.json());           // Parse JSON request bodies
app.use(cors());                   // Enable CORS for all routes
app.use(express.static('.'));      // Serve static files from current directory

// GitHub API base URL for all API requests
const GITHUB_API = 'https://api.github.com';

// Function definitions that our Model Context Protocol will expose to clients
const functions = {
  // Search for code in GitHub repositories
  // Parameters:
  // - q: Search query string (required)
  // - page: Page number for pagination (default: 1)
  // - per_page: Number of results per page (default: 30)
  search_code: async ({q, page = 1, per_page = 30}) => {
    try {
      // Make request to GitHub's code search endpoint
      const response = await axios.get(`${GITHUB_API}/search/code`, {
        params: {q, page, per_page},  // Query parameters
        headers: getHeaders()         // Authentication and Accept headers
      });
      return response.data;           // Return the raw GitHub API response
    } catch (error) {
      // Handle errors gracefully
      return {error: error.message};  // Return error in a structured format
    }
  },
  
  // Get contents of a specific file from GitHub
  // Parameters:
  // - owner: Repository owner username (required)
  // - repo: Repository name (required)
  // - path: File path within the repository (required)
  // - branch: Branch name (default: 'main')
  get_file_contents: async ({owner, repo, path, branch = 'main'}) => {
    try {
      // Make request to GitHub's contents endpoint
      const response = await axios.get(
        `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`, 
        {
          params: {ref: branch},     // Reference (branch) parameter
          headers: getHeaders()       // Authentication and Accept headers
        }
      );
      
      // GitHub returns content as base64 encoded, so we decode it
      const content = Buffer.from(response.data.content, 'base64').toString();
      // Return a simplified response with just the needed fields
      return {content, path, repo};
    } catch (error) {
      // Handle errors gracefully
      return {error: error.message};  // Return error in a structured format
    }
  },
  
  // Search for GitHub repositories
  // Parameters:
  // - query: Search query string (required)
  // - page: Page number for pagination (default: 1)
  // - perPage: Number of results per page (default: 30)
  search_repositories: async ({query, page = 1, perPage = 30}) => {
    try {
      // Make request to GitHub's repository search endpoint
      const response = await axios.get(`${GITHUB_API}/search/repositories`, {
        params: {q: query, page, per_page: perPage},  // Query parameters
        headers: getHeaders()                         // Authentication and Accept headers
      });
      return response.data;  // Return the raw GitHub API response
    } catch (error) {
      // Handle errors gracefully
      return {error: error.message};  // Return error in a structured format
    }
  }
};

// Helper function for constructing GitHub API request headers
// Adds authentication token if available in environment variables
function getHeaders() {
  return {
    'Accept': 'application/vnd.github.v3+json',  // Specify GitHub API version
    'Authorization': process.env.GITHUB_TOKEN ? 
      `token ${process.env.GITHUB_TOKEN}` : ''   // Add token if available, empty string if not
  };
}

// Model Context Protocol endpoint - handles function calls from client
app.post('/api/context', async (req, res) => {
  // Extract function name and parameters from request body
  const {name, parameters} = req.body;
  
  // Validate that the requested function exists
  if (!functions[name]) {
    return res.status(400).json({
      error: `Function '${name}' is not defined`  // Return 400 for undefined functions
    });
  }
  
  try {
    // Dynamically call the requested function with provided parameters
    const result = await functions[name](parameters);
    res.json(result);  // Return JSON response with function result
  } catch (error) {
    // Handle unexpected errors
    res.status(500).json({error: error.message});  // Return 500 internal server error
  }
});

// Configure server port - use environment variable or default to 3000
const PORT = process.env.PORT || 3000;
// Start the server and listen on the configured port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);  // Log when server starts successfully
});
