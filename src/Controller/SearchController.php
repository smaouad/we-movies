<?php

namespace App\Controller;

use App\Service\MovieService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class SearchController extends AbstractController
{
    private const AUTOCOMPLETE_LIMIT = 5;
    private const FILTER_LIMIT = 5;

    private $movieService;

    public function __construct(MovieService $movieService)
    {
        $this->movieService = $movieService;
    }

    /**
     * @Route("/search", name="search_movies", methods={"GET"})
     */
    public function search(Request $request): JsonResponse
    {
        return $this->json($this->movieService->searchMovies($request->query->get('q')));
    }

    /**
     * @Route("/movie/{id}", name="movie_details", methods={"GET"})
     */
    public function movieDetails(int $id): JsonResponse
    {
        return $this->json($this->movieService->getMovieDetails($id));
    }

    /**
     * @Route("/search/autocomplete", name="search_autocomplete", methods={"GET"})
     */
    public function autocomplete(Request $request): JsonResponse
    {
        $results = $this->movieService->searchMovies($request->query->get('q'));
        return $this->json($this->formatAutocompleteResults($results));
    }

    /**
     * @Route("/filter-movies", name="filter_movies")
     */
    public function filterMovies(Request $request): JsonResponse
    {
        $genres = $request->query->get('genres');
        $page = max(1, $request->query->getInt('page', 1));
        $moviesData = $this->movieService->getMoviesByGenres(explode(',', $genres), $page);

        return $this->json([
            'movies' => array_slice($moviesData['results'], 0, self::FILTER_LIMIT) ?? [],
            'pagination' => $this->getPaginationData($page, $moviesData['total_pages'] ?? 1),
        ]);
    }

    private function formatAutocompleteResults(array $results): array
    {
        return array_map(function ($movie) {
            return [
                'id' => $movie['id'],
                'value' => $movie['title'],
                'label' => $movie['title'],
                'poster' => 'https://image.tmdb.org/t/p/w92' . $movie['poster_path'],
                'year' => substr($movie['release_date'], 0, 4)
            ];
        }, array_slice($results, 0, self::AUTOCOMPLETE_LIMIT));
    }

    private function getPaginationData(int $currentPage, int $totalPages): array
    {
        return [
            'current_page' => $currentPage,
            'total_pages' => $totalPages,
        ];
    }
}