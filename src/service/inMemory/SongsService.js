/* eslint-disable object-curly-newline */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-vars */
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class SongsService {
  constructor() {
    this._songs = [];
  }

  addSongs({ title, year, genre, performer, duration, albumId }) {
    const id = `song-${nanoid(15)}`;
    const newSongs = {
      id,
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
    };
    this._songs.push(newSongs);
    const isSuccess = this._songs.filter((song) => song.id === id).length > 0;

    if (!isSuccess) {
      throw new InvariantError("Songs gagal ditambahkan");
    }

    return id;
  }

  getAllSongs() {
    return this._songs.map(({ id, title, performer }) => ({
      id,
      title,
      performer,
    }));
  }

  getSongsById(id) {
    const song = this._songs.filter((s) => s.id === id)[0];
    if (!song) {
      throw new NotFoundError("Songs tidak ditemukan");
    }
    return song;
  }

  editSongsById(id, { title, year, genre, performer, duration, albumId }) {
    const index = this._songs.findIndex((song) => song.id === id);
    if (index === -1) {
      throw new NotFoundError("Id songs tidak ditemukan");
    }
    this._songs[index] = {
      ...this._songs[index],
      title,
      year,
      genre,
      performer,
      duration: duration || null,
      albumId: albumId || null,
    };
  }

  deleteSongsById(id) {
    const index = this._songs.findIndex((song) => song.id === id);
    if (index === -1) {
      throw new NotFoundError("Id songs tidak ditemukan");
    }
    this._songs.splice(index, 1);
  }
}

module.exports = SongsService;
