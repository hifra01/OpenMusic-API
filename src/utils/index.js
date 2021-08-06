/* eslint-disable camelcase */
const ClientError = require('../exceptions/ClientError');

const mapDBToModel = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  inserted_at,
  updated_at,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  insertedAt: inserted_at,
  updatedAt: updated_at,
});

const sendErrorResponse = (error, h) => {
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
};

module.exports = { mapDBToModel, sendErrorResponse };
