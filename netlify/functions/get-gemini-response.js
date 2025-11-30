// This file is netlify/functions/get-gemini-response.js

const fetch = require('node-fetch');

// This is the main function that Netlify will run
exports.handler = async function(event) {
    // We only want to respond to POST requests from our chatbot
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Get the user's message from the incoming request
        const { prompt } = JSON.parse(event.body);

        // Securely get the API key from the Netlify environment variables
        const apiKey = process.env.GEMINI_API_KEY;

        // Check if the API key is actually present. If not, fail gracefully.
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not set in Netlify environment variables.");
        }

        // Construct the correct URL for the Gemini API
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

        // Prepare the data to send to Google's API
        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        };

        // Make the call to the Gemini API
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        // If the response from Google is not successful, throw an error
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Google API responded with status ${response.status}: ${errorBody}`);
        }

        // Parse the successful response from Google
        const data = await response.json();
        
        // Safely extract the text from Gemini's response
        const botResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";

        // Send the clean response back to our chatbot
        return {
            statusCode: 200,
            body: JSON.stringify({ reply: botResponse })
        };

    } catch (error) {
        // If anything goes wrong, log the detailed error on the server
        console.error('Error in get-gemini-response function:', error);
        
        // And send a generic, user-friendly error back to the chatbot
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'An internal error occurred.' })
        };
    }
};