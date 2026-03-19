"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getArtistDetails, getArtistSongs } from "@/app/utils/api";
import { useAtom } from "jotai";
import { songListAtom, songIndexAtom, playSongAtom } from "@/app/atoms/atoms";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import he from "he";
import { PageHeaderSkeleton, SongSkeletonList } from "@/components/shared/MediaSkeleton";
import { SongCard } from "@/components/shared/SongCard";
import { Artist, Song } from "@/lib/types";

export default function ArtistRoutePage() {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const artistId = parseInt(id, 10);

    const [songList, setSongList] = useAtom(songListAtom);
    const [, setSongIndex] = useAtom(songIndexAtom);
    const [playSong, setPlaySong] = useAtom(playSongAtom);

    const [artistSongsData, setArtistSongsData] = useState<Song[]>([]);
    const [artistSongsPageNo, setArtistSongsPageNo] = useState(0);
    const observerTarget = useRef<HTMLDivElement>(null);

    // Fetch basic details
    const { data: artist, isFetching: isArtistFetching, isError: isArtistError } = useQuery<Artist>({
        queryKey: ["artistDetails", artistId],
        queryFn: async () => {
            const response = await getArtistDetails(artistId);
            return response.data;
        },
        enabled: !!artistId,
    });

    // Fetch songs with pagination
    const { isFetching: isSongsFetching, isRefetching } = useQuery<Song[]>({
        queryKey: ["artistSongs", artistId, artistSongsPageNo],
        queryFn: async () => {
            const response = await getArtistSongs(artistId, artistSongsPageNo);
            const songs = response.data.songs;
            setArtistSongsData(prev => [...prev, ...songs]);

            // Update global store if current playing
            if (artistSongsPageNo > 0 && playSong) {
                setSongList(prev => {
                    // We ensure not to destructively replace everything if not needed,
                    // but keeping it simple like the old version:
                    return [...prev, ...songs];
                });
            }
            return songs;
        },
        enabled: !!artistId,
    });

    // Intersection Observer for infinite scrolling
    const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
        const target = entries[0];
        if (target.isIntersecting && !isSongsFetching && !isRefetching) {
            setArtistSongsPageNo((prev) => prev + 1);
        }
    }, [isSongsFetching, isRefetching]);

    useEffect(() => {
        const observer = new IntersectionObserver(handleObserver, { threshold: 1.0 });
        if (observerTarget.current) observer.observe(observerTarget.current);

        return () => {
            if (observerTarget.current) observer.unobserve(observerTarget.current);
        };
    }, [handleObserver, observerTarget]);

    if (isArtistError || !artistId) {
        return (
            <div className="container mx-auto px-4 py-8 text-center mt-20">
                <h2 className="text-2xl font-bold mb-4">Error loading artist</h2>
                <Button onClick={() => router.push("/")} variant="outline">
                    <ChevronLeft className="mr-2" /> Go back
                </Button>
            </div>
        );
    }

    const isLoading = (isArtistFetching && artistSongsPageNo === 0) || (isSongsFetching && artistSongsPageNo === 0);

    return (
        <div className="container mx-auto px-4 py-6 md:py-8 min-h-screen">
            {isLoading && (
                <div className="animate-in fade-in duration-300">
                    <PageHeaderSkeleton />
                    <SongSkeletonList count={8} />
                </div>
            )}

            {artist && (
                <div className="animate-in fade-in duration-300">
                    <section className="mb-10">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">
                            {he.decode(artist.name || artist.title || "Unknown Artist")}
                        </h2>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="mb-6 hover:scale-105 transition-transform"
                            onClick={() => router.back()}
                        >
                            <ChevronLeft />
                        </Button>

                        {(!artistSongsData || artistSongsData.length === 0) && !isLoading ? (
                            <h2 className="text-2xl text-muted-foreground mb-4 text-center font-serif mt-10">
                                No Songs found!
                            </h2>
                        ) : (
                            <div className="grid gap-4">
                                {artistSongsData.map((song, index) => (
                                    <SongCard
                                        key={`${song.id}-${index}`}
                                        song={song}
                                        onClick={() => {
                                            setSongList(artistSongsData);
                                            setSongIndex(index);
                                            setPlaySong(true);
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        {isRefetching && artistSongsPageNo > 0 && (
                            <div className="mt-8">
                                <SongSkeletonList count={3} />
                            </div>
                        )}

                        <div ref={observerTarget} className="h-10 w-full mt-4 flex items-center justify-center">
                            {!isRefetching && artistSongsData.length > 0 && (
                                <span className="text-muted-foreground text-sm">Scroll for more...</span>
                            )}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}
