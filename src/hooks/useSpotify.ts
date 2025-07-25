"use client"

import { useState, useEffect } from 'react';
import { spotifyService, SpotifyTrack, SpotifyPlaylist } from '@/lib/spotify';

export function useSpotify() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);

  const searchTracks = async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await spotifyService.searchTracks(query);
      setTracks(results);
    } catch (err) {
      setError('Error searching tracks');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRetroGamingTracks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await spotifyService.searchRetroGamingTracks();
      setTracks(results);
    } catch (err) {
      setError('Error loading retro gaming tracks');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFeaturedPlaylists = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await spotifyService.getFeaturedPlaylists();
      setPlaylists(results);
    } catch (err) {
      setError('Error loading featured playlists');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPlaylistTracks = async (playlistId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await spotifyService.getPlaylistTracks(playlistId);
      setTracks(results);
    } catch (err) {
      setError('Error loading playlist tracks');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    tracks,
    playlists,
    searchTracks,
    loadRetroGamingTracks,
    loadFeaturedPlaylists,
    loadPlaylistTracks,
    formatDuration: spotifyService.formatDuration,
  };
}
