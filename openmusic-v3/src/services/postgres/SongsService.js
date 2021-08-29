const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBToModel } = require('../../utils');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor(cacheService) {
    this.pool = new Pool();
    this.cacheService = cacheService;
  }

  async validateSong(songId) {
    const query = {
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [songId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Invalid song id');
    }
  }

  async addSong({
    title,
    year,
    performer,
    genre = '',
    duration = 0,
  }) {
    const id = `song-${nanoid(16)}`;
    const insertedAt = new Date().toISOString();
    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      values: [
        id,
        title,
        year,
        performer,
        genre,
        duration,
        insertedAt,
        insertedAt,
      ],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Failed to add song');
    }

    await this.cacheService.delete('songs');

    return result.rows[0].id;
  }

  async getSongs() {
    try {
      const result = await this.cacheService.get('songs');
      return JSON.parse(result);
    } catch (error) {
      const result = await this.pool.query('SELECT id, title, performer FROM songs');
      await this.cacheService.set('songs', JSON.stringify(result.rows));
      return result.rows;
    }
  }

  async getSongById(id) {
    try {
      const result = await this.cacheService.get(`song:${id}`);
      return JSON.parse(result);
    } catch (error) {
      const query = {
        text: 'SELECT * FROM songs WHERE id = $1',
        values: [id],
      };

      const result = await this.pool.query(query);

      if (!result.rowCount) {
        throw new NotFoundError('Song not found');
      }

      const mappedResult = result.rows.map(mapDBToModel)[0];
      await this.cacheService.set(`song:${id}`, JSON.stringify(mappedResult));
      return mappedResult;
    }
  }

  async editSongById(id, {
    title,
    year,
    performer,
    genre = '',
    duration = 0,
  }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, updated_at = $6 WHERE id = $7 RETURNING id',
      values: [
        title,
        year,
        performer,
        genre,
        duration,
        updatedAt,
        id,
      ],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Failed to update song. Id not found');
    }

    await this.cacheService.delete(`song:${id}`);
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Failed to delete song. Id not found');
    }

    await this.cacheService.delete(`song:${id}`);
    await this.cacheService.delete('songs');
  }
}

module.exports = SongsService;
