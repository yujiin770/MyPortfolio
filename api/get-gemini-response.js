// This file is now in api/get-gemini-response.js

const fetch = require('node-fetch');

exports.handler = async function(event) {
    // Vercel sends the body in a different format, so we check both
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { prompt } = body;

    try {
        // --- CONFIGURATION FOR THE FREE VERTEX AI ENDPOINT ---
        const apiKey = process.env.GEMINI_API_KEY;
        const project_id = process.env.GOOGLE_PROJECT_ID; // <-- NOW USES THE SECURE VARIABLE
        const model = "gemini-pro";
        
        const apiUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/${project_id}/locations/us-central1/publishers/google/models/${model}:streamGenerateContent`;

        if (!apiKey || !project_id) {
            throw new Error("API Key or Project ID is not set in Vercel environment variables.");
        }

        // ... the rest of your Vertex AI fetch logic remains exactly the same ...
        
        const requestBody = { /* ... */ };
        const response = await fetch(apiUrl, { /* ... */ });
        const data = await response.json();
        const botResponse = data[0]?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";

        // Vercel requires a slightly different response format
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reply: botResponse }),
        };

    } catch (error) {
        console.error('Error in get-gemini-response function:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'An internal error occurred.' }),
        };
    }
};