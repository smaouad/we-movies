# We Movies

We Movies est une application web de recherche et de découverte de films, utilisant l'API TheMovieDB pour fournir des informations détaillées sur les films.

## Fonctionnalités

- Recherche de films avec autocomplétion
- Filtrage des films par genre
- Affichage des détails d'un film, y compris la bande-annonce
- Pagination des résultats
- Interface responsive

## Technologies utilisées

- Symfony 5.4
- PHP 7.4+
- JavaScript (ES6+)
- jQuery et jQuery UI pour l'autocomplétion
- Bootstrap 5 pour le design
- API TheMovieDB

## Installation

1. Clonez le dépôt :
git clone https://github.com/smaouad/we-movies.git

2. Installez les dépendances PHP :
composer install

3. Installez les dépendances JavaScript :
npm install

4. Compilez les assets :
npm run dev

5. Configurez votre fichier `.env` avec vos informations de base de données et votre token API TheMovieDB :
- `DATABASE_URL="mysql://db_user:db_password@127.0.0.1:3306/db_name"`
- `MDB_API_TOKEN=votre_token_ici`

6. Lancez le serveur Symfony :
symfony server:start


## Structure du projet

- `src/Controller/` : Contient les contrôleurs de l'application
- `src/Service/` : Contient le service MovieService pour interagir avec l'API
- `templates/` : Contient les templates Twig
- `assets/` : Contient les fichiers JavaScript et SCSS
- `public/` : Contient les fichiers publics accessibles par le navigateur

## Tests

Pour lancer les tests unitaires :
- php bin/phpunit

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
