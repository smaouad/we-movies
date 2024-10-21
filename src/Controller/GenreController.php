<?php

namespace App\Controller;

use App\Service\MovieService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class GenreController extends AbstractController
{
    private const MOVIES_PER_PAGE = 5;

    private $movieService;

    public function __construct(MovieService $movieService)
    {
        $this->movieService = $movieService;
    }

    /**
     * @Route("/genre/{id}", name="genre_movies")
     */
    public function list(int $id, Request $request): Response
    {
        $page = $request->query->getInt('page', 1);
        $genres = $this->movieService->getGenres();
        $movies = $this->movieService->getMoviesByGenres([$id], $page);

        return $this->render('genre/list.html.twig', [
            'genres' => $genres,
            'currentGenre' => $this->findGenreById($genres, $id),
            'movies' => array_slice($movies['results'], 0, self::MOVIES_PER_PAGE),
            'pagination' => $this->getPaginationData($movies['total_pages'] ?? 1, $page),
        ]);
    }

    private function findGenreById(array $genres, int $id): ?array
    {
        return current(array_filter($genres, fn($genre) => $genre['id'] === $id)) ?: null;
    }

    private function getPaginationData(int $totalPages, int $currentPage): array
    {
        return [
            'current_page' => $currentPage,
            'total_pages' => $totalPages,
        ];
    }
}