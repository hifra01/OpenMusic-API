class SongsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;
  }

  async postSongHandler(request, h) {
    try {
      this.validator.validateSongPayload(request.payload);
    } catch (error) {
      
    }
  }
}

module.exports = SongsHandler;
