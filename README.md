# GitHub File Search

A web application that allows users to search for code across GitHub
repositories and view file contents. This project implements a Model Context
Protocol for standardized function calling between client and server.

## Features

- Search for code across public GitHub repositories using GitHub's search API
- View file contents directly in the browser
- Simple, responsive, and intuitive user interface
- Secure implementation with proper error handling
- Customizable search parameters for targeted results

## Architecture

### Client-Server Model
- **Frontend**: Browser-based client built with vanilla HTML, CSS, and JavaScript
- **Backend**: Node.js Express server acting as a proxy to the GitHub API
- **Communication Protocol**: Custom Model Context Protocol implementation for structured function calls

### Technologies

- **Node.js**: JavaScript runtime for server-side code
- **Express.js**: Web application framework for handling HTTP requests
- **GitHub REST API**: Provides search and content retrieval capabilities
- **Axios**: Promise-based HTTP client for API requests
- **CORS**: Cross-Origin Resource Sharing support for security
- **HTML/CSS/JavaScript**: Frontend implementation without frameworks

## Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd github-file-search
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up GitHub API token (optional but recommended to avoid rate limits)
   ```bash
   # For Linux/macOS
   export GITHUB_TOKEN=your_github_personal_access_token

   # For Windows (Command Prompt)
   set GITHUB_TOKEN=your_github_personal_access_token

   # For Windows (PowerShell)
   $env:GITHUB_TOKEN="your_github_personal_access_token"
   ```

4. Start the server
   ```bash
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Enter a search query in the search box
   - **Simple search**: `function javascript`
   - **Advanced search**: `function in:file language:javascript repo:owner/repo`
   - **Reference**: For full search syntax, see GitHub's [documentation](https://docs.github.com/en/search-github/searching-on-github/searching-code)

2. Browse the list of search results showing repository names and file paths

3. Click on any search result to view the file contents directly in the application

## API Reference

### Model Context Protocol

The server implements a Model Context Protocol endpoint at `/api/context` which accepts POST requests with the following structure:

```json
{
  "name": "function_name",
  "parameters": {
    "param1": "value1",
    "param2": "value2"
  }
}
```

### Available Functions

#### `search_code`
Search for code across GitHub repositories.

Parameters:
- `q` (string, required): Search query string
- `page` (number, optional): Page number for pagination (default: 1)
- `per_page` (number, optional): Results per page (default: 30)

#### `get_file_contents`
Get contents of a specific file from a GitHub repository.

Parameters:
- `owner` (string, required): Repository owner username
- `repo` (string, required): Repository name
- `path` (string, required): File path within the repository
- `branch` (string, optional): Branch name (default: 'main')

#### `search_repositories`
Search for GitHub repositories.

Parameters:
- `query` (string, required): Search query string
- `page` (number, optional): Page number for pagination (default: 1)
- `perPage` (number, optional): Results per page (default: 30)

## Environment Variables

- `PORT`: The port on which the server will run (default: 3000)
- `GITHUB_TOKEN`: GitHub personal access token for API authentication (increases rate limits and provides access to private repositories if configured with appropriate scopes)

## Security Considerations

- GitHub API tokens should be kept confidential and never exposed in client-side code
- The application implements proper error handling to prevent crashes
- Input is validated to prevent injection attacks
- HTML content is escaped to prevent XSS attacks