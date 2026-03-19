"use client";
import { playSongAtom, songIndexAtom, songListAtom } from "@/app/atoms/atoms";
import { getPlaylistDetails } from "@/app/utils/api";
import {
	PageHeaderSkeleton,
	SongSkeletonList,
} from "@/components/shared/MediaSkeleton";
import { SongCard } from "@/components/shared/SongCard";
import { Button } from "@/components/ui/button";
import type { Playlist } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import he from "he";
import { useAtom } from "jotai";
import { ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";

export default function PlaylistRoutePage() {
	const router = useRouter();
	const { id } = useParams<{ id: string }>();
	const playlistId = Number.parseInt(id, 10);

	const [, setSongList] = useAtom(songListAtom);
	const [, setSongIndex] = useAtom(songIndexAtom);
	const [, setPlaySong] = useAtom(playSongAtom);

	const { data, isFetching, isError } = useQuery<Playlist>({
		queryKey: ["playlistDetails", playlistId],
		queryFn: async () => {
			const response = await getPlaylistDetails(playlistId);
			return response.data;
		},
		enabled: !!playlistId,
	});

	if (isError || !playlistId) {
		return (
			<div className="container mx-auto px-4 py-8 text-center mt-20">
				<h2 className="text-2xl font-bold mb-4">Error loading playlist</h2>
				<Button onClick={() => router.push("/")} variant="outline">
					<ChevronLeft className="mr-2" /> Go back
				</Button>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-6 md:py-8 min-h-screen">
			{isFetching && (
				<div className="animate-in fade-in duration-300">
					<PageHeaderSkeleton />
					<SongSkeletonList count={8} />
				</div>
			)}

			{data && (
				<div className="animate-in fade-in duration-300">
					<section className="mb-10">
						<h2 className="text-2xl md:text-3xl font-bold mb-4">
							{he.decode(data.name || data.title || "Unknown Playlist")}
						</h2>
						<Button
							variant="secondary"
							size="icon"
							className="mb-6 hover:scale-105 transition-transform h-8 w-8"
							onClick={() => router.back()}
						>
							<ChevronLeft />
						</Button>

						{!data.songs || data.songs.length === 0 ? (
							<h2 className="text-2xl text-muted-foreground mb-4 text-center font-serif mt-10">
								No Songs found!
							</h2>
						) : (
							<div className="grid gap-4">
								{data.songs.map((song, index) => (
									<SongCard
										key={song.id}
										song={song}
										priority={index < 6}
										onClick={() => {
											setSongList(data.songs!);
											setSongIndex(index);
											setPlaySong(true);
										}}
									/>
								))}
							</div>
						)}
					</section>
				</div>
			)}
		</div>
	);
}
