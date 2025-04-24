CREATE DATABASE film_recommender;
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  settings JSONB DEFAULT '{}'  --  for storing theme, bg color, etc.
);

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  movie_id INTEGER,
  review TEXT,
  rating INTEGER
);

CREATE TABLE watchlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name TEXT
);

CREATE TABLE watchlist_movies (
  id SERIAL PRIMARY KEY,
  watchlist_id INTEGER REFERENCES watchlists(id),
  movie_id INTEGER
);
