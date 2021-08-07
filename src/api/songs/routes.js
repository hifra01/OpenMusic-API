module.exports = (handler) => [
  // menyimpan lagu
  {
    method: 'POST',
    path: '/songs',
    handler: handler.postSongHandler,
    options: {
      cors: {
        origin: ['*'],
      },
    },
  },

  // menampilkan seluruh lagu
  {
    method: 'GET',
    path: '/songs',
    handler: handler.getSongsHandler,
    options: {
      cors: {
        origin: ['*'],
      },
    },
  },

  // menampilkan detail lagu
  {
    method: 'GET',
    path: '/songs/{songId}',
    handler: handler.getSongByIdHandler,
    options: {
      cors: {
        origin: ['*'],
      },
    },
  },

  // mengubah data lagu
  {
    method: 'PUT',
    path: '/songs/{songId}',
    handler: handler.putSongByIdHandler,
    options: {
      cors: {
        origin: ['*'],
      },
    },
  },

  // menghapus data lagu
  {
    method: 'DELETE',
    path: '/songs/{songId}',
    handler: handler.deleteSongByIdHandler,
    options: {
      cors: {
        origin: ['*'],
      },
    },
  },
];
