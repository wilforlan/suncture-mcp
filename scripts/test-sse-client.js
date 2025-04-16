#!/usr/bin/env node

// Simple test client for the SSE server
import fetch from 'node-fetch';

const PORT = process.env.PORT || 3001;
const SERVER_URL = `http://localhost:${PORT}`;

// Test connectivity to the server
async function testSSEConnection() {
  console.log(`Testing connection to ${SERVER_URL}/sse`);
  
  try {
    // First test if the server is running with a simple fetch
    const response = await fetch(`${SERVER_URL}/sse`);
    console.log(`Server response status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('Connection successful! Server is responding correctly.');
      console.log('Set up an EventSource to test real-time updates:');
      
      // In a browser, you'd use:
      // const eventSource = new EventSource('http://localhost:3001/sse');
      // eventSource.onmessage = (event) => {
      //   console.log('Received message:', event.data);
      // };
      // eventSource.onerror = (error) => {
      //   console.error('EventSource error:', error);
      // };
    } else {
      console.error(`Server returned unexpected status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error connecting to server:', error);
    console.log('\nPossible issues:');
    console.log('1. Ensure the server is running (npm run dev)');
    console.log('2. Check if another process is using port 3001');
    console.log('3. Verify network settings and firewall rules');
  }
}

testSSEConnection(); 