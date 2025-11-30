// This file is netlify/functions/get-gemini-response.js

// We need the 'node-fetch' package to make API calls in a Node.js environment
const fetch = require('node-fetch');

exports.handler = async function(event) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Get the user's message from the request body
        const { prompt } = JSON.parse(event.body);

        // This is where your secret API key is stored.
        // We will set this up in the Netlify dashboard later.
        const apiKey = process.env.GEMINI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${AIzaSyCagomy_SRD8L9mwS1_YowsdYh0PmhxH9E}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`Google API responded with status ${response.status}`);
        }

        const data = await response.json();
        
        // Extract the text from Gemini's complex response structure
        const botResponse = data.candidates[0].content.parts[0].text;

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: botResponse })
        };

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to get response from AI' })
        };
    }
};