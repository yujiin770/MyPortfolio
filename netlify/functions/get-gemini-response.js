// This file is netlify/functions/get-gemini-response.js

const fetch = require('node-fetch');

exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { prompt } = JSON.parse(event.body);
        
        // --- CONFIGURATION FOR THE FREE VERTEX AI ENDPOINT ---
        const apiKey = process.env.GEMINI_API_KEY;
        const project_id = "plenary-beach-479805-k0"; // <-- PASTE YOUR PROJECT ID HERE
        const model = "gemini-pro";
        
        // This is the new, free endpoint URL
        const apiUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/${project_id}/locations/us-central1/publishers/google/models/${model}:streamGenerateContent`;

        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not set in Netlify environment variables.");
        }

        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`, // Vertex AI uses a different authorization method
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Google API responded with status ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        
        // The response structure is slightly different for Vertex AI
        const botResponse = data[0]?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: botResponse })
        };

    } catch (error) {
        console.error('Error in get-gemini-response function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'An internal error occurred.' })
        };
    }
};