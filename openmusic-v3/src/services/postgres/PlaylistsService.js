const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationsService) {
    this.pool = new Pool();
    this.collaborationsService = collaborationsService;
  }

  async verifyPlaylistOwner(playlistId, userId) {
    const query = {
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist not found.');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== userId) {
      throw new AuthorizationError('You are not authorized to access this resource.');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this.collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  async validateSongInPlaylist(playlistId, songId) {
    const query = {
      text: 'SELECT id FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Song id is not in playlist');
    }
  }

  async addPlaylist({
    name,
    owner,
  }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Failed to add playlist.');
    }

    return result.rows[0].id;
  }

  async getPlaylistsByUserId(userId) {
    const query = {
      text: `SELECT DISTINCT playlists.id, playlists.name, users.username FROM playlists
      LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
      JOIN users ON playlists.owner = users.id
      WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
      values: [userId],
    };

    const result = await this.pool.query(query);
    return result.rows;
  }

  async deleteAllSongsFromPlaylist(playlistId) {
    const query = {
      text: 'DELETE FROM playlistsongs WHERE playlist_id = $1',
      values: [playlistId],
    };

    await this.pool.query(query);
  }

  async deletePlaylistById(playlistId) {
    await this.deleteAllSongsFromPlaylist(playlistId);

    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [playlistId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Cannot delete playlist. Playlist id not found.');
    }
  }

  async addSongToPlaylist({
    songId,
    playlistId,
  }) {
    const id = `playlistsong-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlistsongs VALUES ($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Failed to add song to playlist.');
    }
  }

  async getSongsByPlaylistId(playlistId) {
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer FROM playlistsongs
      JOIN songs on playlistsongs.song_id = songs.id
      WHERE playlistsongs.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this.pool.query(query);
    return result.rows;
  }

  async deleteSongFromPlaylist({
    songId,
    playlistId,
  }) {
    const query = {
      text: 'DELETE FROM playlistsongs WHERE song_id = $1 AND playlist_id = $2 RETURNING id',
      values: [songId, playlistId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Failed to delete song from playlist.');
    }
  }
}

module.exports = PlaylistsService;
