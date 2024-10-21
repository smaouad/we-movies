<?php

namespace App\Tests\Service;

use App\Service\MovieService;
use PHPUnit\Framework\TestCase;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

class MovieServiceTest extends TestCase
{
    private $httpClient;
    private $movieService;

    protected function setUp(): void
    {
        $this->httpClient = $this->createMock(HttpClientInterface::class);
        $this->movieService = new MovieService($this->httpClient, 'fake_api_token');
    }

    public function testGetGenres()
    {
        $response = $this->createMock(ResponseInterface::class);
        $response->method('toArray')
            ->willReturn(['genres' => [['id' => 28, 'name' => 'Action'], ['id' => 12, 'name' => 'Adventure']]]);

        $this->httpClient->method('request')
            ->willReturn($response);

        $genres = $this->movieService->getGenres();
        $this->assertCount(2, $genres);
        $this->assertEquals('Action', $genres[0]['name']);
    }

    public function testGetPopularMovies()
    {
        $response = $this->createMock(ResponseInterface::class);
        $response->method('toArray')
            ->willReturn(['results' => [['title' => 'Movie 1'], ['title' => 'Movie 2']]]);

        $this->httpClient->method('request')
            ->willReturn($response);

        $movies = $this->movieService->getPopularMovies();
        $this->assertCount(2, $movies['results']);
        $this->assertEquals('Movie 1', $movies['results'][0]['title']);
    }

    public function testGetMoviesByGenres()
    {
        $response = $this->createMock(ResponseInterface::class);
        $response->method('toArray')
            ->willReturn(['results' => [['title' => 'Genre Movie 1'], ['title' => 'Genre Movie 2']]]);

        $this->httpClient->method('request')
            ->willReturn($response);

        $movies = $this->movieService->getMoviesByGenres([28, 12]);
        $this->assertCount(2, $movies['results']);
        $this->assertEquals('Genre Movie 1', $movies['results'][0]['title']);
    }

    public function testSearchMovies()
    {
        $response = $this->createMock(ResponseInterface::class);
        $response->method('toArray')
            ->willReturn(['results' => [['title' => 'Inception']]]);

        $this->httpClient->method('request')
            ->willReturn($response);

        $result = $this->movieService->searchMovies('Inception');
        $this->assertIsArray($result);
        $this->assertCount(1, $result);
        $this->assertEquals('Inception', $result[0]['title']);
    }
}
