require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { geminiAPIKey, API_options } = require('./constants');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(geminiAPIKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const fetchMovieDetails = async (movieName) => {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${movieName}&language=en-US&page=1`,
            API_options);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error(error);
    }
}

app.post('/api/recommendations', async (req, res) => {
    const userQuery = req.body.query;
    if (!userQuery) {
        res.status(400).send({ error: 'No query provided' });
    }
    try {
        const prompt = "Act as a movie recommendation system and give me a list of 5 movies for the query: " +
            userQuery +
            ". I want the text returned to be with no explanation just movies that are comma seperated the result should be like the example result shown ahead Example result: The Shawshank Redemption, The Godfather, The Godfather: Part II, Pulp Fiction, 12 Angry Men";
        const result = await model.generateContent(prompt);
        const moviesText = result?.response?.candidates[0]?.content?.parts[0]?.text;
        if (!moviesText) {
            return res.status(500).json({ error: "Failed to generate movie recommendations" });
        }
        const movieNamesArr = moviesText.split(",").map((movie) => movie.trim());
        const moviesPromiseArr = movieNamesArr.map((movieName) => fetchMovieDetails(movieName));
        const moviesDetails = await Promise.all(moviesPromiseArr);
        const filtereMoviesDetails = moviesDetails.map((movies) => movies[0]);
        res.json({
            recommendedMovies: movieNamesArr,
            moviesDetails: filtereMoviesDetails
        })
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Something went wrong' });
    }
})

app.get('/api/now-playing', async (req, res) => {
    try {
        const response = await fetch("https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1",
            API_options);
        const data = await response.json();
        if (!data.results) {
            return res.status(500).json({ error: "Failed to fetch now playing movies" });
        }
        res.json({
            nowPlayingMovies: data.results
        })
    } catch (error) {
        console.error(error);
    }
})

app.get('/api/popular-movies', async (req, res) => {
    try {
        const response = await fetch('https://api.themoviedb.org/3/movie/popular?language=en-US&page=1',
            API_options)
        const data = await response.json();
        if (!data.results) {
            return res.status(500).json({ error: "Failed to fetch popular movies" });
        }
        res.json({
            popularMovies: data.results
        })
    } catch (error) {
        console.error(error);
    }
})

app.get('/api/toprated-movies', async (req, res) => {
    try {
        const response = await fetch('https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1', API_options)
        const data = await response.json();
        if (!data.results) {
            return res.status(500).json({ error: "Failed to fetch top rated movies" });
        }
        res.json({
            topRatedMovies: data.results
        })
    } catch (error) {
        console.error(error);
    }
})

app.get('/api/upcoming-movies', async (req, res) => {
    try {
        const response = await fetch('https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=1', API_options)
        const data = await response.json();
        if (!data.results) {
            return res.status(500).json({ error: "Failed to fetch upcoming movies" });
        }
        res.json({
            upcomingMovies: data.results
        })
    } catch (error) {
        console.error(error);
    }
})

app.get('/api/movie/:id/trailer', async (req, res) => {
    const movieId = req.params.id;
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?language=en-US`,
            API_options);
        const data = await response.json();
        if (!data.results || data.results.length === 0) {
            return res.status(404).json({ error: "No trailers found" });
        }
        const filterData = data.results.filter((video) => video.type === "Trailer");
        const trailer = filterData.length ? filterData[0] : data.results[0];
        res.json({
            trailerOnHome: trailer
        })
    } catch (error) {
        console.error(error);
    }
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})
