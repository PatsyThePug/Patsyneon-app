const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SPOTIFY_AUTH_BASE = 'https://accounts.spotify.com';

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  duration_ms: number;
  preview_url: string | null;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
  tracks: {
    total: number;
    items: { track: SpotifyTrack }[];
  };
}

class SpotifyService {
  private accessToken: string | null = null;
  private clientId: string;

  constructor() {
    this.clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '';
    if (!this.clientId) {
      console.warn('Spotify Client ID not found in environment variables');
    }
  }

  // Obtener token de acceso usando Client Credentials Flow
  async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    try {
      const response = await fetch(`${SPOTIFY_AUTH_BASE}/api/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.clientId}:${process.env.SPOTIFY_CLIENT_SECRET || 'dummy_secret'}`)}`,
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        throw new Error('Failed to get access token');
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      
      // El token expira, así que lo limpiamos después de un tiempo
      setTimeout(() => {
        this.accessToken = null;
      }, (data.expires_in - 60) * 1000);

      return this.accessToken as string;
    } catch (error) {
      console.error('Error getting Spotify access token:', error);
      throw error;
    }
  }

  // Buscar canciones
  async searchTracks(query: string, limit: number = 20): Promise<SpotifyTrack[]> {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(
        `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search tracks');
      }

      const data = await response.json();
      return data.tracks.items;
    } catch (error) {
      console.error('Error searching tracks:', error);
      return [];
    }
  }

  // Obtener playlists destacadas
  async getFeaturedPlaylists(limit: number = 20): Promise<SpotifyPlaylist[]> {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(
        `${SPOTIFY_API_BASE}/browse/featured-playlists?limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get featured playlists');
      }

      const data = await response.json();
      return data.playlists.items;
    } catch (error) {
      console.error('Error getting featured playlists:', error);
      return [];
    }
  }

  // Obtener canciones de una playlist
  async getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(
        `${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get playlist tracks');
      }

      const data = await response.json();
      return data.items.map((item: any) => item.track);
    } catch (error) {
      console.error('Error getting playlist tracks:', error);
      return [];
    }
  }

  // Buscar canciones gaming/retro específicas
  async searchRetroGamingTracks(): Promise<SpotifyTrack[]> {
    const queries = [
      'chiptune 8bit',
      'video game music',
      'retro gaming soundtrack',
      'synthwave gaming',
      'pixel music',
      'arcade music'
    ];

    const allTracks: SpotifyTrack[] = [];

    for (const query of queries) {
      const tracks = await this.searchTracks(query, 10);
      allTracks.push(...tracks);
    }

    // Eliminar duplicados
    const uniqueTracks = allTracks.filter((track, index, self) => 
      index === self.findIndex(t => t.id === track.id)
    );

    return uniqueTracks.slice(0, 20);
  }

  // Formatear duración de milisegundos a mm:ss
  formatDuration(durationMs: number): string {
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

export const spotifyService = new SpotifyService();
