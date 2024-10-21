<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;

class MovieService
{
    private const BASE_URL = 'https://api.themoviedb.org/3';
    private $httpClient;
    private $token;
    
    public function __construct(HttpClientInterface $httpClient, string $token)
    {
        $this->httpClient = $httpClient;
        $this->token = $token;
    }

    public function getGenres(): array
    {
        return $this->makeApiCall('/genre/movie/list')['genres'];
    }

    public function getPopularMovies(int $page = 1): array
    {
        return $this->makeApiCall('/movie/popular', ['page' => $page]);
    }

    public function getMoviesByGenres(array $genreIds, int $page = 1): array
    {
        return $this->makeApiCall('/discover/movie', [
            'with_genres' => implode(',', $genreIds),
            'page' => $page,
            'sort_by' => 'popularity.desc'
        ]);
    }

    public function searchMovies(string $query): array
    {
        return $this->makeApiCall('/search/movie', ['query' => $query])['results'];
    }

    public function getMovieDetails(int $movieId): array
    {
        return $this->makeApiCall("/movie/{$movieId}", ['append_to_response' => 'videos']);
    }

    private function makeApiCall(string $endpoint, array $params = []): array
    {
        $response = $this->httpClient->request('GET', self::BASE_URL . $endpoint, [
            'headers' => [
                'Authorization' => 'Bearer ' . $this->token,
                'Accept' => 'application/json',
            ],
            'query' => array_merge(['language' => 'fr-FR'], $params)
        ]);
    
        return $response->toArray();
    }
}