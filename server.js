const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// GitHub API base URL
const GITHUB_API = 'https://api.github.com';

// Function definitions with schemas for MCP
const functionDefinitions = [
  {
    "name": "search_code",
    "description": "Search for code across GitHub repositories",
    "parameters": {
      "type": "object",
      "properties": {
        "q": {
          "type": "string",
          "description": "Search query using GitHub's search syntax"
        },
        "page": {
          "type": "number",
          "description": "Page number for pagination"
        },
        "per_page": {
          "type": "number",
          "description": "Results per page (max 100)"
        }
      },
      "required": ["q"]
    }
  },
  {
    "name": "get_file_contents",
    "description": "Get the contents of a file from a GitHub repository",
    "parameters": {
      "type": "object",
      "properties": {
        "owner": {
          "type": "string",
          "description": "Repository owner (username or organization)"
        },
        "repo": {
          "type": "string",
          "description": "Repository name"
        },
        "path": {
          "type": "string",
          "description": "Path to the file"
        },
        "branch": {
          "type": "string",
          "description": "Branch name (defaults to main)"
        }
      },
      "required": ["owner", "repo", "path"]
    }
  },
  {
    "name": "search_repositories",
    "description": "Search for GitHub repositories",
    "parameters": {
      "type": "object",
      "properties": {
        "q": {
          "type": "string",
          "description": "Search query using GitHub's search syntax"
        },
        "page": {
          "type": "number",
          "description": "Page number for pagination"
        },
        "per_page": {
          "type": "number",
          "description": "Results per page (max 100)"
        }
      },
      "required": ["q"]
    }
  }
];

// Function implementations
const functions = {
  search_code: async (parameters) => {
    const { q, page = 1, per_page = 30 } = parameters;
    
    try {
      const response = await axios.get(`${GITHUB_API}/search/code`, {
        params: { q, page, per_page },
        headers: getHeaders()
      });
      return {
        status: "success",
        data: response.data
      };
    } catch (error) {
      return {
        status: "error",
        error: error.message
      };
    }
  },
  
  get_file_contents: async (parameters) => {
    const { owner, repo, path, branch = 'main' } = parameters;
    
    try {
      const response = await axios.get(
        `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
        {
          params: { ref: branch },
          headers: getHeaders()
        }
      );
      
      // GitHub returns content as base64
      const content = Buffer.from(response.data.content, 'base64').toString();
      
      return {
        status: "success",
        data: {
          content,
          path,
          repo: `${owner}/${repo}`
        }
      };
    } catch (error) {
      return {
        status: "error",
        error: error.message
      };
    }
  },
  
  search_repositories: async (parameters) => {
    const { q, page = 1, per_page = 30 } = parameters;
    
    try {
      const response = await axios.get(`${GITHUB_API}/search/repositories`, {
        params: { q, page, per_page },
        headers: getHeaders()
      });
      
      return {
        status: "success",
        data: response.data
      };
    } catch (error) {
      return {
        status: "error",
        error: error.message
      };
    }
  }
};

// Helper function for authentication headers
function getHeaders() {
  return {
    'Accept': 'application/vnd.github.v3+json',
    'Authorization': process.env.GH_TOKEN ? 
      `token ${process.env.GH_TOKEN}` : ''
  };
}

// MCP endpoint
app.post('/api/mcp', async (req, res) => {
  // The request should contain a name and parameters
  const { name, parameters } = req.body;
  
  // Validate that the function exists
  if (!functions[name]) {
    return res.status(400).json({
      status: "error",
      error: `Function '${name}' is not defined`
    });
  }
  
  try {
    // Execute the function with the provided parameters
    const result = await functions[name](parameters);
    
    // Return the standardized result
    res.json(result);
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error.message
    });
  }
});

// Endpoint to get available functions - this allows discovery
app.get('/api/mcp/functions', (req, res) => {
  res.json(functionDefinitions);
});

// Serve static files from the 'public' directory
app.use(express.static('./'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MCP Server running on port ${PORT}`);
  console.log(`Function discovery available at http://localhost:${PORT}/api/mcp/functions`);
});
