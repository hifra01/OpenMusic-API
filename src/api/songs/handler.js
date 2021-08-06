const ClientError = require('../../exceptions/ClientError');

class SongsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
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
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // server error
      const response = h.response({
        status: 'error',
        message: 'Server error',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = SongsHandler;
