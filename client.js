// MCP Server API URL
const API_URL = 'http://localhost:3000/api/mcp';
const FUNCTIONS_URL = 'http://localhost:3000/api/mcp/functions';

// Store available functions
let availableFunctions = [];

// Sample AI responses for simulation
const aiResponses = {
  default: "I'm not sure how to help with that. Could you try asking about GitHub code or repositories?",
  searchCode: "I'll search for code examples on GitHub for you. Let me do that now...",
  searchRepos: "I'll look for repositories that match your query. One moment please...",
  viewFile: "Let me fetch that file for you so we can look at the code...",
};

// Load available functions from the server
async function loadFunctions() {
  try {
    const response = await fetch(FUNCTIONS_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch functions: ${response.statusText}`);
    }
    
    availableFunctions = await response.json();
    
    // Populate the dropdown
    const select = document.getElementById('function-select');
    select.innerHTML = '<option value="">Select a function...</option>';
    
    availableFunctions.forEach(func => {
      const option = document.createElement('option');
      option.value = func.name;
      option.textContent = `${func.name} - ${func.description}`;
      select.appendChild(option);
    });
    
    logApiCall('GET', FUNCTIONS_URL, null, availableFunctions);
    
    // Add AI response about available tools
    addAiMessage("I've loaded my available tools. I can search for code, get file contents, or search for repositories on GitHub. What would you like to find?");
  } catch (error) {
    console.error('Error loading functions:', error);
    logApiCall('GET', FUNCTIONS_URL, null, { error: error.message });
    addAiMessage("I'm having trouble connecting to my tools right now. Please try again later.");
  }
}

// Display function details
function showFunctionDetails() {
  const select = document.getElementById('function-select');
  const functionName = select.value;
  
  if (!functionName) {
    document.getElementById('function-details').innerHTML = '';
    return;
  }
  
  const functionInfo = availableFunctions.find(f => f.name === functionName);
  
  if (functionInfo) {
    document.getElementById('function-details').innerHTML = `
      <h3>Function: ${functionInfo.name}</h3>
      <p>${functionInfo.description}</p>
      <h4>Parameters:</h4>
      <pre>${JSON.stringify(functionInfo.parameters, null, 2)}</pre>
    `;
  }
}

// MCP client implementation
async function callFunction(name, parameters) {
  try {
    logApiCall('POST', API_URL, { name, parameters }, null);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ name, parameters })
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    logApiCall('Response', '', null, result);
    
    return result;
  } catch (error) {
    console.error(`Error calling function ${name}:`, error);
    logApiCall('Error', '', { name, parameters }, { error: error.message });
    return { status: 'error', error: error.message };
  }
}

// Add a user message to the conversation
function addUserMessage(message) {
  const conversation = document.getElementById('ai-conversation');
  const messageDiv = document.createElement('div');
  messageDiv.className = 'user-message';
  messageDiv.textContent = message;
  conversation.appendChild(messageDiv);
  conversation.scrollTop = conversation.scrollHeight;
}

// Add an AI message to the conversation
function addAiMessage(message) {
  const conversation = document.getElementById('ai-conversation');
  const messageDiv = document.createElement('div');
  messageDiv.className = 'ai-message';
  messageDiv.textContent = message;
  conversation.appendChild(messageDiv);
  conversation.scrollTop = conversation.scrollHeight;
}

// Log API calls in the right panel
function logApiCall(method, url, request, response) {
  const logs = document.getElementById('api-logs');
  const logEntry = document.createElement('div');
  
  let content = `<strong>${method}</strong> ${url || ''}<br>`;
  
  if (request) {
    content += '<h4>Request:</h4>';
    content += `<pre>${JSON.stringify(request, null, 2)}</pre>`;
  }
  
  if (response) {
    content += '<h4>Response:</h4>';
    content += `<pre>${JSON.stringify(response, null, 2)}</pre>`;
  }
  
  logEntry.innerHTML = content;
  logEntry.style.borderBottom = '1px solid #ccc';
  logEntry.style.paddingBottom = '10px';
  logEntry.style.marginBottom = '10px';
  
  logs.insertBefore(logEntry, logs.firstChild);
}

// Simulate how an AI model would call a function through MCP
async function simulateAIFunctionCall(userIntent) {
  // Add a message showing the AI's reasoning process
  addAiMessage("I need to search GitHub for information. Let me think about which function to call...");
  
  // Log the AI's "thinking" process
  console.log("AI reasoning process:");
  
  // This simulates the AI model's decision-making process
  let functionName = '';
  let functionParameters = {};
  
  if (userIntent.includes("find code") || userIntent.includes("search for code")) {
    console.log("User wants to find code - I'll use the search_code function");
    
    // AI determines the best parameters based on user intent
    const searchTerm = userIntent.includes("react") 
      ? "language:javascript filename:*.jsx React.Component" 
      : "language:javascript " + userIntent.replace("find code", "").replace("search for code", "").trim();
    
    functionName = "search_code";
    functionParameters = { q: searchTerm };
  } else if (userIntent.includes("find repository") || userIntent.includes("search for repository")) {
    console.log("User wants to find repositories - I'll use the search_repositories function");
    
    const searchTerm = userIntent.replace("find repository", "").replace("search for repository", "").trim();
    
    functionName = "search_repositories";
    functionParameters = { q: searchTerm };
  } else {
    // Default to code search
    console.log("No specific intent detected, defaulting to code search");
    functionName = "search_code";
    functionParameters = { q: "javascript " + userIntent };
  }
  
  console.log(`AI decided to call ${functionName} with parameters:`, functionParameters);
  
  // Show the function call in the UI
  const functionCallDetails = document.createElement('div');
  functionCallDetails.className = 'ai-function-call';
  functionCallDetails.innerHTML = `
    <p><em>AI is calling function:</em></p>
    <pre>${functionName}(${JSON.stringify(functionParameters, null, 2)})</pre>
  `;
  document.getElementById('ai-conversation').appendChild(functionCallDetails);
  
  // Make the actual function call
  try {
    const result = await callFunction(functionName, functionParameters);
    console.log("Function call result:", result);
    return { functionName, result };
  } catch (error) {
    console.error("Error in AI function call:", error);
    return { functionName, error };
  }
}

// Simulate an AI conversation with function calling
async function simulateConversation() {
  const userInput = document.getElementById('user-input');
  const userMessage = userInput.value.trim();
  
  if (!userMessage) return;
  
  // Display user message
  addUserMessage(userMessage);
  userInput.value = '';
  
  // Initial AI response
  addAiMessage(aiResponses.searchCode || "Let me search for that information for you...");
  
  // Simulate AI function calling process
  const { functionName, result, error } = await simulateAIFunctionCall(userMessage);
  
  // Handle the result
  if (error) {
    addAiMessage(`I encountered an error: ${error.message}`);
    return;
  }
  
  if (result && result.status === 'success') {
    let aiResponse = '';
    
    if (functionName === 'search_code') {
      const items = result.data.items || [];
      aiResponse = `I found ${items.length} code results. Here are a few examples:\n\n`;
      
      items.slice(0, 3).forEach((item, index) => {
        aiResponse += `${index + 1}. ${item.repository.full_name}: ${item.path}\n`;
      });
      
      aiResponse += '\nWould you like me to show you any of these files?';
    } else if (functionName === 'search_repositories') {
      const items = result.data.items || [];
      aiResponse = `I found ${items.length} repositories. Here are a few examples:\n\n`;
      
      items.slice(0, 3).forEach((item, index) => {
        aiResponse += `${index + 1}. ${item.full_name}: ${item.description || 'No description'}\n`;
      });
      
      aiResponse += '\nWould you like more information about any of these repositories?';
    } else if (functionName === 'get_file_contents') {
      const content = result.data.content || '';
      const preview = content.length > 200 ? content.substring(0, 200) + '...' : content;
      
      aiResponse = `Here's the file ${result.data.path} from ${result.data.repo}:\n\n`;
      aiResponse += `\`\`\`\n${preview}\n\`\`\`\n\n`;
      aiResponse += 'Would you like me to explain this code?';
    }
    
    addAiMessage(aiResponse);
  } else {
    addAiMessage(`I ran into an issue: ${result.error || 'Unknown error'}. Could you try a different query?`);
  }
}

// Initialize the UI
document.addEventListener('DOMContentLoaded', () => {
  // Add initial AI message
  addAiMessage("Hello! I'm an AI assistant that can help you find and explore code on GitHub. What would you like to search for?");
  
  // Set up enter key for user input
  document.getElementById('user-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      simulateConversation();
    }
  });
});
