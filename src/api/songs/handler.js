const { sendErrorResponse } = require('../../utils');

class SongsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler(request, h) {
    try {
      this.validator.validateSongPayload(request.payload);
      const {
        title,
        year,
        performer,
        genre = '',
        duration = 0,
      } = request.payload;

      const songId = await this.service.addSong({
        title,
        year,
        performer,
        genre,
        duration,
      });

      const response = h.response({
        status: 'success',
        message: 'Lagu berhasil ditambahkan',
        data: {
          songId,
        },
      });

      response.code(201);
      return response;
    } catch (error) {
      return sendErrorResponse(error, h);
    }
  }

  async getSongsHandler(request, h) {
    try {
      const songs = await this.service.getSongs();
      return {
        status: 'success',
        data: {
          songs,
        },
      };
    } catch (error) {
      return sendErrorResponse(error, h);
    }
  }

  async getSongByIdHandler(request, h) {
    try {
      const { songId } = request.params;
      const song = await this.service.getSongById(songId);
      return {
        status: 'success',
        data: {
          song,
        },
      };
    } catch (error) {
      return sendErrorResponse(error, h);
    }
  }

  async putSongByIdHandler(request, h) {
    try {
      this.validator.validateSongPayload(request.payload);
      const { songId } = request.params;
      const {
        title,
        year,
        performer,
        genre = '',
        duration = 0,
      } = request.payload;

      await this.service.editSongById(songId, {
        title,
        year,
        performer,
        genre,
        duration,
      });

      return {
        status: 'success',
        message: 'lagu berhasil diperbarui',
      };
    } catch (error) {
      return sendErrorResponse(error, h);
    }
  }

  async deleteSongByIdHandler(request, h) {
    try {
      const { songId } = request.params;
      await this.service.deleteSongById(songId);
      return {
        status: 'success',
        message: 'lagu berhasil dihapus',
      };
    } catch (error) {
      return sendErrorResponse(error, h);
    }
  }
}

module.exports = SongsHandler;
