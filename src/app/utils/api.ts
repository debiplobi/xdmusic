import axios from "axios";
import { Album, Artist, Playlist, Song, TopQueryItem } from "@/lib/types";

const saavnApi = axios.create({
  baseURL: "https://jiosaavn-api.debiprasadxd-41e.workers.dev",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function searchAlbums(query: string): Promise<{ data: { results: Album[] } }> {
  const response = await saavnApi.get("/api/search/albums?query=" + query);
  return response.data;
}

export async function getAlbumDetails(id: number): Promise<{ data: Album }> {
  const response = await saavnApi.get("/api/albums?id=" + id);
  return response.data;
}

export async function getPlaylistDetails(id: number): Promise<{ data: Playlist }> {
  const response = await saavnApi.get(`/api/playlists?id=${id}&limit=100`);
  return response.data;
}

export async function getArtistSongs(id: number, pageNo: number): Promise<{ data: { songs: Song[] } }> {
  const response = await saavnApi.get(`/api/artists/${id}/songs?page=${pageNo}`);
  return response.data;
}

export async function getArtistDetails(id: number): Promise<{ data: Artist }> {
  const response = await saavnApi.get(`/api/artists/${id}`);
  return response.data;
}

export async function searchArtists(query: string): Promise<{ data: { results: Artist[] } }> {
  const response = await saavnApi.get("/api/search/artists?query=" + query);
  return response.data;
}

export async function SearchSong(query: string): Promise<{ data: { results: Song[] } }> {
  const response = await saavnApi.get(`/api/search/songs?query=${query}&page=1&limit=10`);
  return response.data;
}

export async function getGlobalSearch(query: string): Promise<{
  data: {
    topQuery: { results: TopQueryItem[] };
    songs: { results: Song[] };
    albums: { results: Album[] };
    artists: { results: Artist[] };
    playlists: { results: Playlist[] };
  }
}> {
  const response = await saavnApi.get(`/api/search?query=${query}`);
  return response.data;
}

export async function getSongData(songId: string): Promise<{ data: Song[] }> {
  const response = await saavnApi.get(`/api/songs/${songId}`);
  return response.data;
}
