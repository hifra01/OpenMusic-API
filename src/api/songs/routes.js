module.exports = (handler) => [
  // menyimpan lagu
  {
    method: 'POST',
    path: '/songs',
    handler: handler.postSongHandler,
  },

  // menampilkan seluruh lagu
  {
    method: 'GET',
    path: '/songs',
    handler: handler.getSongsHandler,
  },

  // menampilkan detail lagu
  {
    method: 'GET',
    path: '/songs/{songId}',
    handler: handler.getSongByIdHandler,
  },

  // mengubah data lagu
  {
    method: 'PUT',
    path: '/songs/{songId}',
    handler: handler.putSongByIdHandler,
  },

  // menghapus data lagu
  {
    method: 'DELETE',
    path: '/songs/{songId}',
    handler: handler.deleteSongByIdHandler,
  },
];
