class PlaylistsHandler {
  constructor(playlistsService, songsService, validator) {
    this.playlistsService = playlistsService;
    this.songsService = songsService;
    this.validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistHandler = this.deletePlaylistHandler.bind(this);
    this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this);
    this.getPlaylistSongsHandler = this.getPlaylistSongsHandler.bind(this);
    this.deletePlaylistSongHandler = this.deletePlaylistSongHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    this.validator.validatePostPlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this.playlistsService.addPlaylist({
      name,
      owner: credentialId,
    });

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler({ auth }) {
    const { id: credentialId } = auth.credentials;
    const playlists = await this.playlistsService.getPlaylistsByUserId(credentialId);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { playlistId } = request.params;

    await this.playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this.playlistsService.deletePlaylistById(playlistId);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postPlaylistSongHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { playlistId } = request.params;

    this.validator.validatePostPlaylistSongPayload(request.payload);
    const { songId } = request.payload;

    await this.playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this.songsService.validateSong(songId);

    await this.playlistsService.addSongToPlaylist({
      songId,
      playlistId,
    });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { playlistId } = request.params;

    await this.playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const songs = await this.playlistsService.getSongsByPlaylistId(playlistId);

    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  async deletePlaylistSongHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { playlistId } = request.params;

    this.validator.validateDeletePlaylistSongPayload(request.payload);
    const { songId } = request.payload;

    await this.playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this.songsService.validateSong(songId);
    await this.playlistsService.validateSongInPlaylist(playlistId, songId);

    await this.playlistsService.deleteSongFromPlaylist({ songId, playlistId });

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }
}

module.exports = PlaylistsHandler;
