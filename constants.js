const dotenv = require('dotenv');
dotenv.config();

const API_options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer ' + process.env.TMDB_API_KEY
    }
};

const openAIKey = process.env.OPENAI_API_KEY;

const geminiAPIKey = process.env.GEMINI_API_KEY;

module.exports = { API_options, openAIKey, geminiAPIKey}