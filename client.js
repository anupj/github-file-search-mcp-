// client.js - Frontend Client for GitHub Code Explorer
// This client implements the browser-side functionality to interact with the server's Model Context Protocol
// and render the search results and file contents in the UI

// API endpoint URL for Model Context Protocol requests
const API_URL = 'http://localhost:3000/api/context';

/**
 * Model Context Protocol client implementation
 * Makes standardized function calls to the server API
 * 
 * @param {string} name - The function name to call on the server
 * @param {object} parameters - The parameters to pass to the function
 * @returns {Promise<object>} - The parsed JSON response from the server
 * @throws {Error} - If the API call fails
 */
async function callFunction(name, parameters) {
  // Make the API request to the server
  const response = await fetch(API_URL, {
    method: 'POST',                                 // Always use POST for function calls
    headers: {'Content-Type': 'application/json'},  // Send JSON data
    body: JSON.stringify({name, parameters})        // Format body according to protocol
  });
  
  // Handle non-200 responses
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  
  // Parse and return the JSON response
  return response.json();
}

/**
 * UI Function: Perform code search when user submits search form
 * Calls the server's search_code function and displays results
 */
async function searchCode() {
  // Get the user's search query from the input field
  const query = document.getElementById('search-query').value;
  const resultsDiv = document.getElementById('results');
  // Show loading indicator
  resultsDiv.innerHTML = '<p>Searching...</p>';
  
  try {
    // Call the server's search_code function with the query
    const data = await callFunction('search_code', {
      q: query  // Pass query parameter according to GitHub API requirements
    });
    
    // Handle error responses from the server
    if (data.error) {
      resultsDiv.innerHTML = `<p class="error">Error: ${data.error}</p>`;
      return;
    }
    
    // Display the search results in the UI
    displayCodeResults(data);
  } catch (error) {
    // Handle client-side errors (e.g., network issues)
    resultsDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
  }
}

/**
 * UI Function: View contents of a specific file
 * Calls the server's get_file_contents function and displays the file
 * 
 * @param {string} owner - GitHub repository owner username
 * @param {string} repo - GitHub repository name
 * @param {string} path - File path within the repository
 */
async function viewFileContents(owner, repo, path) {
  const contentDiv = document.getElementById('file-content');
  // Show loading indicator
  contentDiv.innerHTML = '<p>Loading file...</p>';
  
  try {
    // Call the server's get_file_contents function with file details
    const data = await callFunction('get_file_contents', {
      owner,  // Repository owner (username)
      repo,   // Repository name
      path    // File path within the repository
    });
    
    // Handle error responses from the server
    if (data.error) {
      contentDiv.innerHTML = `<p class="error">Error: ${data.error}</p>`;
      return;
    }
    
    // Display the file content with the file path as header
    // Note: Basic display without syntax highlighting
    contentDiv.innerHTML = `
      <h3>${path}</h3>
      <pre><code>${escapeHtml(data.content)}</code></pre>
    `;
  } catch (error) {
    // Handle client-side errors (e.g., network issues)
    contentDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
  }
}

/**
 * Helper Function: Display code search results in the UI
 * Formats GitHub API search results into HTML list with clickable links
 * 
 * @param {object} data - The response data from GitHub's code search API
 */
function displayCodeResults(data) {
  const resultsDiv = document.getElementById('results');
  
  // Check if we have results to display
  if (data.items && data.items.length > 0) {
    // Begin building HTML with result count
    let html = `<p>Found ${data.total_count} results:</p><ul>`;
    
    // Loop through each search result item
    data.items.forEach(item => {
      // Create a list item with repository name and clickable file link
      html += `
        <li>
          <strong>${item.repository.full_name}</strong>: 
          <a href="#" onclick="viewFileContents('${item.repository.owner.login}', 
                                              '${item.repository.name}', 
                                              '${item.path}'); return false;">
            ${item.path}
          </a>
        </li>
      `;
    });
    
    // Finish the HTML list
    html += '</ul>';
    resultsDiv.innerHTML = html;
  } else {
    // No results found
    resultsDiv.innerHTML = '<p>No results found.</p>';
  }
}

/**
 * Helper Function: Escape HTML special characters to prevent XSS attacks
 * Converts potentially dangerous characters to their HTML entity equivalents
 * 
 * @param {string} text - The raw text that might contain HTML special characters
 * @returns {string} - The escaped HTML-safe text
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")   // Escape ampersands
    .replace(/</g, "&lt;")    // Escape less-than signs
    .replace(/>/g, "&gt;")    // Escape greater-than signs
    .replace(/"/g, "&quot;")  // Escape double quotes
    .replace(/'/g, "&#039;"); // Escape single quotes
}