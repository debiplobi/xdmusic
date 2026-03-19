"use client";
import { getGlobalSearch } from "@/app/utils/api";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { glboalSearchResult } from "../examples/globalSearch";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import useDebounce from "../hooks/useDebounce";
import { useAtom } from "jotai";
import {
  songListAtom,
  songIndexAtom,
  playSongAtom,
  isChildPageAtom,
} from "../atoms/atoms";
import AlbumPage from "./albums";
import { useState } from "react";
import ArtistPage from "./artists";
import PlaylistPage from "./playlists";
import he from "he";

export interface SearchSong {
  id: string;
  title: string;
  image: { quality: string; url: string }[];
  album: string;
  url: string;
  type: string;
  description: string;
  primaryArtists: string;
  singers: string;
  language: string;
}

interface PropTypes {
  searchText: string;
}

const Search: React.FC<PropTypes> = ({ searchText }) => {
  const debouncedSearchQuery = useDebounce(searchText, 300);

  const [songList, setSongList] = useAtom(songListAtom);
  const [songIndex, setSongIndex] = useAtom(songIndexAtom);
  const [playSong, setPlaySong] = useAtom(playSongAtom);
  const [albumId, setAlbumId] = useState(0);
  const [isChildPage, setIsChildPage] = useAtom(isChildPageAtom);
  const [albumClicked, setAlbumClicked] = useState(false);
  const [artistClicked, setArtistClicked] = useState(false);
  const [playlistClicked, setPlaylistClicked] = useState(false);
  const [artistId, setArtistId] = useState(0);
  const [playlistId, setPlaylistId] = useState(0);

  const handleAlbumClick = (id: number) => {
    setAlbumId(id);
    setIsChildPage(true);
    setAlbumClicked(true);
  };

  const handleArtistClick = (id: number) => {
    setArtistId(id);
    setIsChildPage(true);
    setArtistClicked(true);
  };

  const handlePlaylistClick = (id: number) => {
    setPlaylistId(id);
    setIsChildPage(true);
    setPlaylistClicked(true);
  };

  const { data, isFetching } = useQuery<typeof glboalSearchResult.data>({
    queryKey: ["searchSongDetails", debouncedSearchQuery],
    queryFn: async () => {
      const data = await getGlobalSearch(searchText);

      console.log(data.data);
      return data.data;
    },
    enabled: searchText ? true : false,
  });

  // console.log(songList, songIndex);
  const handleTopQueryClick = (
    result: (typeof glboalSearchResult.data.topQuery.results)[0],
    index: number,
  ) => {
    if (result.type === "artist") {
      handleArtistClick(parseInt(result.id));
    }

    if (result.type === "album") {
      handleAlbumClick(parseInt(result.id));
    }

    if (result.type === "playlist") {
      handlePlaylistClick(parseInt(result.id));
    }
    if (result.type === "song") {
      console.log(result);
      setSongList([result]);
      setSongIndex(index);
      setPlaySong(true);
    }
  };

  return (
    <div>
      {isChildPage && albumClicked && (
        <AlbumPage albumId={albumId} setAlbumClicked={setAlbumClicked} />
      )}
      {isChildPage && artistClicked && (
        <ArtistPage artistId={artistId} setArtistClicked={setArtistClicked} />
      )}

      {isChildPage && playlistClicked && (
        <PlaylistPage
          playlistId={playlistId}
          setPlaylistClicked={setPlaylistClicked}
        />
      )}
      {!isChildPage && !artistClicked && !albumClicked && (
        <ScrollArea className="h-[calc(100vh-4rem)]">
          {data && searchText !== "" && (
            <div className="container mx-auto px-4 py-6 md:py-8">
              <h1 className="text-3xl md:text-4xl font-extrabold mb-8 md:mb-10">
                Search Results
              </h1>

              {/* Top Query */}
              {data.topQuery?.results?.length > 0 && (
                <section className="mb-10">
                  {/* <h2 className="text-2xl md:text-3xl font-bold mb-4">Top Query</h2> */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.topQuery.results.map((result, index) => (
                      <Card
                        key={result.id}
                        onClick={() => handleTopQueryClick(result, index)}
                      >
                        <CardContent className="p-0">
                          <Image
                            width={300}
                            height={300}
                            alt={result.title}
                            src={result.image[2].url}
                            className="w-full h-auto aspect-square object-cover rounded-t-lg"
                          />
                          <div className="p-4">
                            <h3 className="text-lg font-bold mb-2 line-clamp-1">
                              {he.decode(result.title)}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {he.decode(result.description)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {/* Songs */}
              {data.songs?.results?.length > 0 && (
                <section className="mb-10">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">Songs</h2>
                  <div className="grid gap-4">
                    {data.songs.results.map((song, index) => (
                      <Card
                        key={song.id}
                        onClick={() => {
                          setSongList(data?.songs?.results);
                          setSongIndex(index);
                          setPlaySong(true);
                        }}
                        className="cursor-pointer hover:bg-accent transition-colors duration-200"
                      >
                        <CardContent className="p-0 flex items-center">
                          <div className="relative flex-shrink-0">
                            <Image
                              width={80}
                              height={80}
                              src={song.image[2].url}
                              alt={song.title}
                              className="w-20 h-20 object-cover rounded-l-lg"
                            />
                          </div>
                          <div className="p-4 flex-grow">
                            <h3 className="text-base font-semibold mb-1">
                              {he.decode(song.title)}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {he.decode(song.singers)}
                            </p>
                            {song.album && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Album: {he.decode(song.album)}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {/* Albums */}
              {data.albums?.results?.length > 0 && (
                <section className="mb-10">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    Albums
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {data.albums.results.map((album) => (
                      <Card
                        key={album.id}
                        onClick={() => handleAlbumClick(parseInt(album.id))}
                      >
                        <CardContent className="p-0">
                          <div className="relative">
                            <Image
                              width={300}
                              height={300}
                              alt={album.title}
                              src={album.image[2].url}
                              className="w-full h-auto aspect-square object-cover rounded-t-lg"
                            />
                          </div>
                          <div className="p-3">
                            <h3 className="text-sm font-semibold mb-1 line-clamp-1">
                              {album.title}
                            </h3>
                            <p className="text-xs text-muted-foreground mb-1">
                              Year: {album.year}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              By {album.artist}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {/* Artists */}
              {data.artists?.results?.length > 0 && (
                <section className="mb-10">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    Artists
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {data.artists.results.map((artist) => (
                      <Card
                        key={artist.id}
                        onClick={() => handleArtistClick(parseInt(artist.id))}
                      >
                        <CardContent className="p-0">
                          <div className="relative">
                            <Image
                              width={200}
                              height={200}
                              alt={artist.title}
                              src={artist.image[2].url}
                              className="w-full h-auto aspect-square object-cover rounded-t-lg"
                            />
                          </div>
                          <div className="p-3 text-center">
                            <h3 className="text-sm font-semibold line-clamp-1">
                              {artist.title}
                            </h3>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {/* Playlists */}
              {data.playlists?.results?.length > 0 && (
                <section className="mb-10">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    Playlists
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {data.playlists.results.map((playlist) => (
                      <Card
                        key={playlist.id}
                        onClick={() =>
                          handlePlaylistClick(parseInt(playlist.id))
                        }
                      >
                        <CardContent className="p-0">
                          <div className="relative">
                            <Image
                              width={300}
                              height={300}
                              alt={playlist.title}
                              src={playlist.image[2].url}
                              className="w-full h-auto aspect-square object-cover rounded-t-lg"
                            />
                          </div>
                          <div className="p-3">
                            <h3 className="text-sm font-semibold">
                              <Link
                                href={playlist.url || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary transition-colors duration-200 line-clamp-1"
                              >
                                {playlist.title}
                              </Link>
                            </h3>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
          {isFetching && !isChildPage && !artistClicked && !albumClicked && (
            <div className="container mx-auto px-4 py-6 md:py-8">
              <h1 className="text-3xl md:text-4xl font-extrabold mb-8 md:mb-10">
                <Skeleton className="h-8 w-2/3" />
              </h1>

              {/* Top Query Skeleton */}
              <section className="mb-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  <Skeleton className="h-6 w-1/3" />
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Skeleton className="h-[300px] w-full rounded-lg" />
                  <Skeleton className="h-[300px] w-full rounded-lg" />
                  <Skeleton className="h-[300px] w-full rounded-lg" />
                </div>
              </section>

              {/* Songs Skeleton */}
              <section className="mb-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  <Skeleton className="h-6 w-1/3" />
                </h2>
                <div className="grid gap-4">
                  <Skeleton className="h-[80px] w-full rounded-lg" />
                  <Skeleton className="h-[80px] w-full rounded-lg" />
                  <Skeleton className="h-[80px] w-full rounded-lg" />
                </div>
              </section>

              {/* Albums Skeleton */}
              <section className="mb-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  <Skeleton className="h-6 w-1/3" />
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  <Skeleton className="h-[300px] w-full rounded-lg" />
                  <Skeleton className="h-[300px] w-full rounded-lg" />
                  <Skeleton className="h-[300px] w-full rounded-lg" />
                </div>
              </section>

              {/* Artists Skeleton */}
              <section className="mb-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  <Skeleton className="h-6 w-1/3" />
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  <Skeleton className="h-[200px] w-full rounded-lg" />
                  <Skeleton className="h-[200px] w-full rounded-lg" />
                  <Skeleton className="h-[200px] w-full rounded-lg" />
                </div>
              </section>

              {/* Playlists Skeleton */}
              <section className="mb-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  <Skeleton className="h-6 w-1/3" />
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  <Skeleton className="h-[300px] w-full rounded-lg" />
                  <Skeleton className="h-[300px] w-full rounded-lg" />
                  <Skeleton className="h-[300px] w-full rounded-lg" />
                </div>
              </section>
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
};
export default Search;
