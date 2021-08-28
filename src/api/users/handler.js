class UsersHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    this.postUserHandler = this.postUserHandler.bind(this);
  }

  async postUserHandler({ payload }, h) {
    this.validator.validateUserPayload(payload);
    const { username, password, fullname } = payload;

    const userId = await this.service.addUser({ username, password, fullname });

    const response = h.response({
      status: 'success',
      message: 'User berhasil ditambahkan',
      data: {
        userId,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = UsersHandler;
