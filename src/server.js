require('dotenv').config();

const Hapi = require('@hapi/hapi');
const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');
const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const songsService = new SongsService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register({
    plugin: songs,
    options: {
      service: songsService,
      validator: SongsValidator,
    },
  });

  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request;

    // Jika ClientError
    if (response instanceof ClientError) {
      // membuat response baru dari response toolkit sesuai kebutuhan error handling
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });

      newResponse.code(response.statusCode);
      return newResponse;
    }

    // Jika Server Error
    if (response instanceof Error) {
      const newResponse = h.response({
        status: 'fail',
        message: 'Internal Server Error',
      });
      newResponse.code(500);
      console.error(response);
      return newResponse;
    }

    // jika bukan ClientError, lanjutkan dengan response sebelumnya (tanpa intervensi)
    return response.continue || response;
  });

  await server.start();
  console.log(`Server is running on ${server.info.uri}`);
};

init();
