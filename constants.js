import dotenv from 'dotenv';
dotenv.config();

export const API_options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer ' + process.env.TMDB_API_KEY
    }
};

export const openAIKey = process.env.OPENAI_API_KEY;

export const geminiAPIKey = process.env.GEMINI_API_KEY;  