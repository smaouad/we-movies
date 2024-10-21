<?php

namespace App\Controller;

use App\Service\MovieService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class HomeController extends AbstractController
{

    private $movieService;

    public function __construct(MovieService $movieService)
    {
        $this->movieService = $movieService;
    }

    /**
     * @Route("/", name="home")
     */
    public function index(Request $request): Response
    {
        $genres = $this->movieService->getGenres();
        $popularMovies = $this->movieService->getPopularMovies();
        $page = $request->query->getInt('page', 1);
        $topMovie = $popularMovies['results'][0] ?? null;

        if ($topMovie) {
            $topMovie = $this->movieService->getMovieDetails($topMovie['id']);
        }

        return $this->render('home/index.html.twig', [
            'genres' => $genres,
            'topMovie' => $topMovie,
            'popularMovies' => $popularMovies['results'],
            'pagination' => [
                'current_page' => $page,
                'total_pages' => $popularMovies['total_pages'],
            ],
        ]);
    }
}