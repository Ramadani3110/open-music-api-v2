/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
require("dotenv").config();
const Hapi = require("@hapi/hapi");
const albums = require("./api/albums");
const songs = require("./api/songs");
const AlbumsService = require("./service/postgres/AlbumsService");
const SongsService = require("./service/postgres/SongsService");
const AlbumsValidator = require("./validator/music/albums");
const SongsValidator = require("./validator/music/songs");

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan di ${server.info.uri}`);
};
init();
