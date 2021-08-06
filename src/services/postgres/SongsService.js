const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
// const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor() {
    this.pool = new Pool();
  }

  async addSong({
    title,
    year,
    performer,
    genre,
    duration,
  }) {
    const id = `song-${nanoid(16)}`;
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      values: [id, title, year, performer, genre, duration, insertedAt, updatedAt],
    };

    const result = await this.pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Failed to add song');
    }

    return result.rows[0].id;
  }
}

module.exports = SongsService;
