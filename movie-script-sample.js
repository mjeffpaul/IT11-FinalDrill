document.addEventListener('DOMContentLoaded', function () {
    init();
});

const apiKey = 'a1eaf99f91dafeb68a35eee97f7a433e';
const apiUrl = 'https://api.themoviedb.org/3';
const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('id') || 24428;

let selectedGenre;

async function getUpcomingMovies() {
    const response = await fetch(`${apiUrl}/movie/upcoming?api_key=${apiKey}`);
    const data = await response.json();
    displayMovies(data.results, 'movieContainer');
    
    
}

async function searchMovie(query, genre) {
    const genreFilter = genre ? `&with_genres=${genre}` : '';
    const response = await fetch(`${apiUrl}/search/movie?api_key=${apiKey}&query=${query}${genreFilter}`);
    const data = await response.json();
    displayMovies(data.results, 'movieContainer');
    updateMoviesTitle(`Search Results for "${query}"`);
}

function displayMovies(movies, containerId) {
    const container = document.getElementById(containerId);

    // Check if the container exists
    if (!container) {
        console.error(`Container with ID ${containerId} not found.`);
        return;
    }

    container.innerHTML = '';

    movies.forEach(movie => {
        if (!selectedGenre || movie.genre_ids.includes(parseInt(selectedGenre))) {
            const movieElement = document.createElement('a');
            movieElement.classList.add('movie');
            movieElement.href = `movie_details.html?id=${movie.id}`;
            movieElement.innerHTML = `
                <img src="${imageBaseUrl}${movie.poster_path}" alt="${movie.title}">
                <h3>${movie.title}</h3>
                <div class="overview">
                    <h3>Overview</h3>
                    <p>${movie.overview}</p>
                </div>
            `;
            container.appendChild(movieElement);
        }
    });
}


function updateMoviesTitle(title) {
    const moviesTitle = document.getElementById('moviesTitle');

    // Check if the element exists before updating its textContent
    if (moviesTitle) {
        moviesTitle.textContent = title;
    } else {
        console.error('Element with ID moviesTitle not found.');
    }
}


async function getMovieDetails() {
    try {
       // Fetch movie details using the extracted movie ID
       const response = await fetch(`${apiUrl}/movie/${movieId}?api_key=${apiKey}`);
       if (!response.ok) {
          throw new Error('Failed to fetch movie details.');
       }
       const data = await response.json();
       return data;
    } catch (error) {
       console.error(error);
       return null; // Return null when movie details cannot be fetched
    }
 }

 async function displayMovieDetails(movieId) {
    try {
        const detailsContainer = document.getElementById('movieDetails');
        if (!detailsContainer) {
            throw new Error('Details container not found.');
        }

        // Fetch movie details using the extracted movie ID
        const response = await fetch(`${apiUrl}/movie/${movieId}?api_key=${apiKey}`);
        if (!response.ok) {
            throw new Error('Failed to fetch movie details.');
        }

        const movie = await response.json();

        // Log the actual structure of the movie object
        console.log('Actual movie object structure:', movie);

        // Check if movie object and its properties exist before accessing them
        if (movie && movie.title && movie.poster_path && movie.overview && movie.release_date && movie.vote_average && movie.popularity && movie.credits && movie.credits.crew) {
            detailsContainer.innerHTML = `
                <p>Director: ${getDirector(movie.credits.crew)}</p>
                <p>Stars: ${getStars(movie.credits.cast)}</p>
                <p>Genre: ${getGenres(movie.genres)}</p>
                <img src="${movie.poster_path ? imageBaseUrl + movie.poster_path : 'path/to/placeholder-image.jpg'}" alt="${movie.title}">
                <p>Release Date: ${movie.release_date}</p>
                <p>Rating: ${movie.vote_average}/10</p>
                <p>${movie.overview}</p>
                <!-- Include other details as needed -->
            `;
        } else {
            // Handle the case where the movie details are incomplete or not available
            console.warn('Movie details are incomplete:', movie);
            detailsContainer.innerHTML = '<p>Movie details not available.</p>';
        }
    } catch (error) {
        console.error(error);
    }
}

// Call the function with the movieId
displayMovieDetails(movieId);



function getDirector(crew) {
    // Check if crew array and its length are valid before accessing elements
    if (crew && crew.length > 0) {
        const director = crew.find(member => member.job === 'Director');
        return director ? director.name : 'N/A';
    } else {
        return 'N/A';
    }
}

function getStars(cast) {
    const topStars = cast.slice(0, 3).map(actor => actor.name);
    return topStars.length > 0 ? topStars.join(', ') : 'N/A';
}

function getGenres(genres) {
    return genres.map(genre => genre.name).join(', ');
}

async function init() {
    const movieDetails = await getMovieDetails();
    const detailsContainer = document.getElementById('movieDetails');

    if (detailsContainer) {
        detailsContainer.style.display = 'block';
        
        if (movieDetails && movieDetails.title && movieDetails.poster_path && movieDetails.overview && movieDetails.release_date && movieDetails.vote_average && movieDetails.popularity && movieDetails.credits && movieDetails.credits.crew) {
            detailsContainer.innerHTML = `
                <h3>${movieDetails.title}</h3>
                <img src="${imageBaseUrl}${movieDetails.poster_path}" alt="${movieDetails.title}">
                <p>${movieDetails.overview}</p>
                <p>Release Date: ${movieDetails.release_date}</p>
                <p>Director: ${getDirector(movieDetails.credits.crew)}</p>
                <!-- Include other details as needed -->
            `;
        } else {
            detailsContainer.innerHTML = '<p>Movie details not available.</p>';
        }

        getSimilarMovies();
    } else {
        console.error('Details container not found');
    }
}
async function getSimilarMovies() {
    // Fetch similar movies using the extracted movie ID
    const response = await fetch(`${apiUrl}/movie/${movieId}/similar?api_key=${apiKey}`);
    const data = await response.json();
    displayMovies(data.results, 'similarMovies');
}

searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query !== '') {
        searchMovie(query);
    } else {
        getUpcomingMovies();
    }
});

getUpcomingMovies();
