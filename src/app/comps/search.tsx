"use client";
import { getGlobalSearch } from "@/app/utils/api";
import { MediaCard } from "@/components/shared/MediaCard";
import {
	MediaSkeletonGrid,
	SongSkeletonList,
} from "@/components/shared/MediaSkeleton";
import { SongCard } from "@/components/shared/SongCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Album, Artist, Playlist, Song, TopQueryItem } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { playSongAtom, songIndexAtom, songListAtom } from "../atoms/atoms";
import useDebounce from "../hooks/useDebounce";

interface PropTypes {
	searchText: string;
}

const Search: React.FC<PropTypes> = ({ searchText }) => {
	const router = useRouter();
	const debouncedSearchQuery = useDebounce(searchText, 300);

	const [, setSongList] = useAtom(songListAtom);
	const [, setSongIndex] = useAtom(songIndexAtom);
	const [, setPlaySong] = useAtom(playSongAtom);

	const { data, isFetching } = useQuery<{
		topQuery: { results: TopQueryItem[] };
		songs: { results: Song[] };
		albums: { results: Album[] };
		artists: { results: Artist[] };
		playlists: { results: Playlist[] };
	}>({
		queryKey: ["searchSongDetails", debouncedSearchQuery],
		queryFn: async () => {
			const response = await getGlobalSearch(searchText);
			return response.data;
		},
		enabled: !!searchText,
	});

	const handleTopQueryClick = (result: TopQueryItem, index: number) => {
		if (result.type === "artist") router.push(`/artist/${result.id}`);
		if (result.type === "album") router.push(`/album/${result.id}`);
		if (result.type === "playlist") router.push(`/playlist/${result.id}`);
		if (result.type === "song") {
			// Ideally we would fetch song details, but let's emulate the original behavior
			// which placed the topQuery song directly into the player state.
			setSongList(data?.songs.results || ([] as Song[]));
			// If it's a top query, we just play the first match in the songs array that matches,
			const foundIndex =
				data?.songs.results.findIndex((s) => s.id === result.id) ?? -1;
			setSongIndex(Math.max(foundIndex, 0));
			setPlaySong(true);
		}
	};

	return (
		<div>
			<ScrollArea className="h-[calc(100vh-4rem)]">
				{data && searchText !== "" && (
					<div className="container mx-auto px-4 py-6 md:py-8">
						<h1 className="text-3xl md:text-4xl font-extrabold mb-8 md:mb-10">
							Search Results
						</h1>

						{/* Top Query */}
						{data.topQuery?.results?.length > 0 && (
							<section className="mb-10 animate-in fade-in duration-300 delay-100">
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{data.topQuery.results.map((result, index) => (
										<MediaCard
											key={result.id}
											id={result.id}
											title={result.title}
											subtitle={result.description}
											imageUrl={
												result.image?.[result.image.length - 1]?.url ||
												result.image?.[0]?.url
											}
											type={result.type as any}
											onClick={() => handleTopQueryClick(result, index)}
										/>
									))}
								</div>
							</section>
						)}

						{/* Songs */}
						{data.songs?.results?.length > 0 && (
							<section className="mb-10 animate-in fade-in duration-300 delay-150">
								<h2 className="text-2xl md:text-3xl font-bold mb-4">Songs</h2>
								<div className="grid gap-4">
									{data.songs.results.map((song, index) => (
										<SongCard
											key={song.id}
											song={song}
											onClick={() => {
												setSongList(data.songs.results);
												setSongIndex(index);
												setPlaySong(true);
											}}
										/>
									))}
								</div>
							</section>
						)}

						{/* Albums */}
						{data.albums?.results?.length > 0 && (
							<section className="mb-10 animate-in fade-in duration-300 delay-200">
								<h2 className="text-2xl md:text-3xl font-bold mb-4">Albums</h2>
								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
									{data.albums.results.map((album) => (
										<MediaCard
											key={album.id}
											id={album.id}
											title={album.title || album.name}
											subtitle={`Year: ${album.year || ""}`}
											description={`By ${album.artist || ""}`}
											imageUrl={
												album.image?.[album.image.length - 1]?.url ||
												album.image?.[0]?.url
											}
											type="album"
										/>
									))}
								</div>
							</section>
						)}

						{/* Artists */}
						{data.artists?.results?.length > 0 && (
							<section className="mb-10 animate-in fade-in duration-300 delay-300">
								<h2 className="text-2xl md:text-3xl font-bold mb-4">Artists</h2>
								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
									{data.artists.results.map((artist) => (
										<MediaCard
											key={artist.id}
											id={artist.id}
											title={artist.title || artist.name}
											imageUrl={
												artist.image?.[artist.image.length - 1]?.url ||
												artist.image?.[0]?.url
											}
											type="artist"
										/>
									))}
								</div>
							</section>
						)}

						{/* Playlists */}
						{data.playlists?.results?.length > 0 && (
							<section className="mb-10 animate-in fade-in duration-300 delay-500">
								<h2 className="text-2xl md:text-3xl font-bold mb-4">
									Playlists
								</h2>
								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
									{data.playlists.results.map((playlist) => (
										<MediaCard
											key={playlist.id}
											id={playlist.id}
											title={playlist.title || playlist.name}
											imageUrl={
												playlist.image?.[playlist.image.length - 1]?.url ||
												playlist.image?.[0]?.url
											}
											type="playlist"
										/>
									))}
								</div>
							</section>
						)}
					</div>
				)}

				{isFetching && (
					<div className="container mx-auto px-4 py-6 md:py-8">
						<h1 className="text-3xl md:text-4xl font-extrabold mb-8 md:mb-10">
							<div className="h-8 w-2/3 bg-muted rounded animate-pulse" />
						</h1>

						<section className="mb-10">
							<h2 className="text-2xl md:text-3xl font-bold mb-4">
								<div className="h-6 w-1/3 bg-muted rounded animate-pulse" />
							</h2>
							<MediaSkeletonGrid height={300} count={3} />
						</section>

						<section className="mb-10">
							<h2 className="text-2xl md:text-3xl font-bold mb-4">
								<div className="h-6 w-1/3 bg-muted rounded animate-pulse" />
							</h2>
							<SongSkeletonList count={3} />
						</section>

						<section className="mb-10">
							<h2 className="text-2xl md:text-3xl font-bold mb-4">
								<div className="h-6 w-1/3 bg-muted rounded animate-pulse" />
							</h2>
							<MediaSkeletonGrid height={300} count={6} />
						</section>
					</div>
				)}
			</ScrollArea>
		</div>
	);
};
export default Search;
