const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const databasePath = path.join(__dirname, "moviesData.db");

let database = null;

const initializeDBServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBServer();

const convertMoviesJsonToObj = (jsonMovieResponse) => {
  return {
    movieId: jsonMovieResponse.movie_id,
    directorId: jsonMovieResponse.director_id,
    movieName: jsonMovieResponse.movie_name,
    leadActor: jsonMovieResponse.lead_actor,
  };
};

const convertDirectorsJsonToObj = (jsonDirectorResponse) => {
  return {
    directorId: jsonDirectorResponse.director_id,
    directorName: jsonDirectorResponse.director_name,
  };
};

//API-1:Returns a list of all movie names from movie table

app.get("/movies/", async (request, response) => {
  try {
    const getAllMoviesQuery = `
    SELECT * 
    FROM movie;`;
    const moviesList = await database.all(getAllMoviesQuery);
    Response.send(moviesList.map((eachObj) => convertMovieJsonToObj(eachObj)));
  } catch (error) {
    console.log(`DB Query Error: ${error.message}`);
    process.exit(1);
  }
});

//API-2:Creates a new movie in movie table.movie_id is auto-incremented

app.post("/movies/", async (request, response) => {
  try {
    const { directorId, movieName, leadActor } = request.body;
    const addMovieQuery = `INSERT INTO 
    movie(director_id,movie_name,lead_actor)
    VALUES(
        ${directorId},
        '${movieName}',
        '${leadActor}'
    );`;
    await database.run(addMovieQuery);
    response.send("Movie Successfully Added");
  } catch (error) {
    console.log(`DB Query Error: ${error.message}`);
    process.exit(1);
  }
});

//API-3:Returns a movie based on the movie ID

app.get("/movies/:movieId/", async (request, response) => {
  try {
    const { movieId } = request.params;
    const getMovieQuery = `
        SELECT *
        FROM movie
        WHERE movie_id = ${movieId};`;
    const movieDetails = await database.get(getMovieQuery);
    response.send(convertMovieJsonToObj(movieDetails));
  } catch (error) {
    console.log(`DB Query Error: ${error.message}`);
    process.exit(1);
  }
});

//API-4:Updates the details of a movie in movie table based on the movie ID

app.put("/movies/:movieId/", async (request, response) => {
  try {
    const { movieId } = request.params;
    const { directorId, movieName, leadActor } = request.body;
    const updateMovieQuery = `
    UPDATE 
        movie
    SET 
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    WHERE 
        movie_id = ${movieId};`;
    await database.run(updateMovieQuery);
    response.send("Movie Details Updated");
  } catch (error) {
    console.log(`DB Query Error: ${error.message}`);
    process.exit(1);
  }
});

//API-5:Deletes a movie from the movie table based on the movie ID

app.delete("/movies/:movieId/", async (request, response) => {
  try {
    const { movieId } = request.params;
    const deleteMovieQuery = `
        DELETE FROM movie
        WHERE movie_id = ${movieId};`;
    await database.run(deleteMovieQuery);
    response.send("Movie Removed");
  } catch (error) {
    console.log(`DB Query Error: ${error.message}`);
    process.exit(1);
  }
});

//API-6:Returns a list of all directors in the director table

app.get("/directors/", async (request, response) => {
  try {
    const getDirectorsQuery = `
        SELECT * 
        FROM director;`;
    const directorsList = await database.all(getDirectorsQuery);
    response.send(
      directorsList.map((eachObj) => convertDirectorsJsonToObj(eachObj))
    );
  } catch (error) {
    console.log(`DB Query Error: ${error.message}`);
    process.exit(1);
  }
});

//API-7:Returns a list of all movie names directed by a specific director

app.get("/directors/:directorId/movies/", async (request, response) => {
  try {
    const { directorId } = request.params;
    const getDirectorMoviesQuery = `
        SELECT movie_name
        FROM movie
        WHERE director_id = ${directorId};`;
    const directorMoviesList = await database.all(getDirectorMoviesQuery);
    response.send(
      directorMoviesList.map((eachObj) => ({ movieName: eachObj.movie_name }))
    );
  } catch (error) {
    console.log(`DB Query Error: ${error.message}`);
    process.exit(1);
  }
});

module.exports = app;
