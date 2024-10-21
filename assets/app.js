import './styles/app.scss';
import { Modal } from 'bootstrap';
import $ from 'jquery';
import 'jquery-ui/ui/widgets/autocomplete';

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    document.querySelectorAll('.movie-details').forEach(button => {
        button.addEventListener('click', handleMovieDetails);
    });

    const videoContainer = document.querySelector('.ratio-16x9 iframe');
    if (videoContainer) {
        videoContainer.addEventListener('click', () => {
            videoContainer.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        });
    }

    document.querySelectorAll('.genre-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', handleGenreFilter);
    });
});

function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

function handleGenreFilter(page = 1) {
    const selectedGenres = Array.from(document.querySelectorAll('.genre-checkbox:checked'))
        .map(checkbox => checkbox.value);

    fetch(`/filter-movies?genres=${selectedGenres.join(',')}&page=${page}`)
        .then(response => response.json())
        .then(data => {
            if (data.movies && Array.isArray(data.movies)) {
                updateMovieList(data.movies);
            } else {
                updateMovieList([]);
            }
            if (data.pagination) {
                updatePagination(data.pagination, selectedGenres);
            }
        })
        .catch(error => console.error('Erreur lors du filtrage des films:', error));
}

function updateMovieList(movies) {
    const movieListContainer = document.querySelector('#movie-list');
    movieListContainer.innerHTML = movies.length ? 
        movies.map(movie => createMovieElement(movie).outerHTML).join('') :
        '<p>Aucun film trouvé pour ces genres.</p>';

    movieListContainer.querySelectorAll('.movie-details').forEach(button => {
        button.addEventListener('click', handleMovieDetails);
    });
}

function updatePagination(paginationData) {
    const paginationContainer = document.querySelector('#pagination');
    if (!paginationContainer) return;

    const { current_page: currentPage, total_pages: totalPages } = paginationData;
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(currentPage - halfVisible, 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    paginationContainer.innerHTML = `
        <nav aria-label="Page navigation">
            <ul class="pagination justify-content-center">
                <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous">
                        <span aria-hidden="true">&laquo;</span>
                    </a>
                </li>
                ${Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
                    .map(i => `
                        <li class="page-item ${i === currentPage ? 'active' : ''}">
                            <a class="page-link" href="#" data-page="${i}">${i}</a>
                        </li>
                    `).join('')}
                <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next">
                        <span aria-hidden="true">&raquo;</span>
                    </a>
                </li>
            </ul>
        </nav>
    `;

    paginationContainer.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = parseInt(e.target.dataset.page);
            if (!isNaN(page)) {
                handleGenreFilter(page);
            }
        });
    });
}

function createMovieElement(movie) {
    const movieCard = document.createElement('div');
    movieCard.className = 'movie-card mb-4';
    movieCard.innerHTML = `
        <div class="row g-0">
            <div class="col-md-4">
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" class="img-fluid rounded-start" alt="${movie.title}">
            </div>
            <div class="col-md-8">
                <div class="card-body">
                    <h5 class="card-title">${movie.title}</h5>
                    <div class="movie-rating">
                        ${generateRatingStars(movie.vote_average)}
                        <span>(${movie.vote_count} votes)</span>
                    </div>
                    <p class="movie-year-studio">${movie.release_date.substr(0, 4)}</p>
                    <p class="card-text">${movie.overview.slice(0, 200)}...</p>
                    <button class="btn btn-primary movie-details" data-movie-id="${movie.id}">Voir détails</button>
                </div>
            </div>
        </div>
    `;
    return movieCard;
}

function handleSearch() {
    const query = this.value;
    const resultsContainer = document.getElementById('search-results');

    if (query.length > 2) {
        fetch(`/search?q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                resultsContainer.innerHTML = data.map(movie => `
                    <div class="search-result" data-movie-id="${movie.id}">
                        <img src="https://image.tmdb.org/t/p/w92${movie.poster_path}" alt="${movie.title}">
                        <div>
                            <h4>${movie.title}</h4>
                            <p>${movie.release_date.substr(0, 4)}</p>
                        </div>
                    </div>
                `).join('');
                resultsContainer.style.display = 'block';

                resultsContainer.querySelectorAll('.search-result').forEach(result => {
                    result.addEventListener('click', () => {
                        handleMovieDetails({ target: { dataset: { movieId: result.dataset.movieId } } });
                        resultsContainer.style.display = 'none';
                    });
                });
            })
            .catch(error => {
                console.error('Erreur lors de la recherche:', error);
                resultsContainer.innerHTML = '<p>Une erreur est survenue lors de la recherche.</p>';
                resultsContainer.style.display = 'block';
            });
    } else {
        resultsContainer.innerHTML = '';
        resultsContainer.style.display = 'none';
    }
}

function handleMovieDetails(event) {
    const movieId = event.target.dataset.movieId;
    fetch(`/movie/${movieId}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('movieModalLabel').textContent = data.title;
            document.getElementById('movieTrailer').innerHTML = data.videos && data.videos.results.length > 0 ?
                `<div class="ratio ratio-16x9">
                    <iframe src="https://www.youtube.com/embed/${data.videos.results[0].key}" allowfullscreen></iframe>
                </div>` :
                '<p>Aucune bande-annonce disponible</p>';
            document.getElementById('moviePoster').src = `https://image.tmdb.org/t/p/w500${data.poster_path}`;
            document.getElementById('movieDetails').innerHTML = `
                <h3>${data.title}</h3>
                <p class="text-warning">${generateRatingStars(data.vote_average)} (${data.vote_count} votes)</p>
                <p><strong>Date de sortie :</strong> ${data.release_date}</p>
                <p><strong>Studio :</strong> ${data.production_companies[0]?.name || 'N/A'}</p>
                <p>${data.overview}</p>
            `;
            new Modal(document.getElementById('movieModal')).show();
        })
        .catch(error => console.error('Erreur lors de la récupération des détails du film:', error));
}

function generateRatingStars(rating) {
    const starCount = Math.round(rating / 2);
    return Array(5).fill().map((_, i) => `<i class="fa${i < starCount ? 's' : 'r'} fa-star"></i>`).join('');
}

$(document).ready(function() {
    $("#search-input").autocomplete({
        source: function(request, response) {
            $.ajax({
                url: "/search/autocomplete",
                dataType: "json",
                data: { q: request.term },
                success: function(data) {
                    response(data);
                }
            });
        },
        minLength: 2,
        select: function(event, ui) {
            event.preventDefault();
            $("#search-input").val(ui.item.label);
            displaySelectedMovie(ui.item.id);
        }
    }).autocomplete("instance")._renderItem = function(ul, item) {
        return $("<li>")
            .append(`<div class='autocomplete-item'>
                <img src='${item.poster}' alt='${item.label}' class='autocomplete-poster'>
                <span class='autocomplete-title'>${item.label}</span>
                <span class='autocomplete-year'>(${item.year})</span>
            </div>`)
            .appendTo(ul);
    };
});

function displaySelectedMovie(movieId) {
    $.ajax({
        url: "/movie/" + movieId,
        dataType: "json",
        success: function(data) {
            $("#main-content").html(`
                <h2>${data.title}</h2>
                <img src="https://image.tmdb.org/t/p/w500${data.poster_path}" alt="${data.title}" style="max-width: 300px;">
                <p>${data.overview}</p>
                <p>Date de sortie : ${data.release_date}</p>
                <p>Note : ${data.vote_average}/10</p>
                ${data.videos && data.videos.results.length > 0 ? 
                    `<div class="ratio ratio-16x9">
                        <iframe src="https://www.youtube.com/embed/${data.videos.results[0].key}" allowfullscreen></iframe>
                    </div>` : ''}
            `);
        }
    });
}