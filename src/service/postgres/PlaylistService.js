/* eslint-disable no-underscore-dangle */
// SELECT playlist.id,playlist.name,users.username FROM playlist
// LEFT JOIN users ON playlist.owner = users.id;
// where playlist.owner = users.id
// SELECT songs.id,songs.title,songs.performer FROM songs
// LEFT JOIN playlist_songs ON songs.id = playlist_songs.id;
// Pake where playlist_id = playlist.id
const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const AuthorizationError = require("../../exceptions/AuthorizationError");
const NotFoundError = require("../../exceptions/NotFoundError");

class PlaylistService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(15)}`;
    const query = {
      text: "INSERT INTO playlist VALUES($1,$2,$3) RETURNING id",
      values: [id, name, owner],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Gagal menambahkan playlist");
    }

    return result.rows[0].id;
  }

  async getPlaylist(owner) {
    const query = {
      text: "SELECT playlist.id,playlist.name,users.username FROM playlist LEFT JOIN users ON playlist.owner = users.id WHERE playlist.owner = $1",
      values: [owner],
    };

    const result = await this._pool.query(query);
    const toMap = result.rows.map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      username: playlist.username,
    }));

    return toMap;
  }

  async verifyPlaylistOwner({ id, owner }) {
    const query = {
      text: "SELECT owner FROM playlist WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }

    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError("Anda tidak berhak mengakses playlist ini");
    }
  }

  async deletePlaylistById(id) {
    const query = {
      text: "DELETE FROM playlist WHERE id = $1 RETURNING id",
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Gagal menghapus. Id tidak ditemukan");
    }
  }

  async addSongToPlaylist({ songId, playlistId }) {
    const querySong = {
      text: "SELECT * FROM songs WHERE id = $1",
      values: [songId],
    };

    const resSong = await this._pool.query(querySong);
    if (!resSong.rows.length) {
      throw new NotFoundError("Gagal menambahkan. id lagu tidak ditemukan");
    }

    const id = `playlist-song-${nanoid(10)}`;
    const queryPlaylist = {
      text: "INSERT INTO playlist_songs VALUES($1,$2,$3)",
      values: [id, playlistId, songId],
    };

    await this._pool.query(queryPlaylist);
    // if (!resPlaylist.rows.length) {
    //   throw new InvariantError("Gagal menambahkan lagu ke playlist");
    // }
  }

  async getSongInPlaylist({ playlistId, owner }) {
    const queryPlaylist = {
      text: "SELECT playlist.id,playlist.name,users.username FROM playlist LEFT JOIN users ON playlist.owner = users.id WHERE playlist.owner = $1 AND playlist.id = $2",
      values: [owner, playlistId],
    };

    const querySongs = {
      text: "SELECT songs.id,songs.title,songs.performer FROM songs INNER JOIN playlist_songs ON songs.id = playlist_songs.song_id WHERE playlist_songs.playlist_id = $1",
      values: [playlistId],
    };

    const resPlaylist = await this._pool.query(queryPlaylist);
    const resSongs = await this._pool.query(querySongs);

    if (!resPlaylist.rows.length) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }

    // const toMapPlaylist = resPlaylist.rows.map((playlist) => ({
    //   id: playlist.id,
    //   name: playlist.name,
    //   username: playlist.username,
    //   songs: resSongs.rows,
    // }));
    // return toMapPlaylist;
    return {
      id: resPlaylist.rows[0].id,
      name: resPlaylist.rows[0].name,
      username: resPlaylist.rows[0].username,
      songs: resSongs.rows,
    };
  }

  async deleteSongInPlaylist({ songId, playlistId }) {
    const query = {
      text: "DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id",
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError("Gagal menghapus. Id lagu tidak ditemukan");
    }
  }
}

module.exports = PlaylistService;
