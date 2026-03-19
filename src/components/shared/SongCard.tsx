"use client";
import React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import he from "he";
import { Song } from "@/lib/types";

interface SongCardProps {
    song: Song;
    onClick: () => void;
}

export const SongCard: React.FC<SongCardProps> = ({ song, onClick }) => {
    const title = song.title || song.name || "Unknown Song";
    const artistName =
        song.singers ||
        (song.artists?.primary ? song.artists.primary.map((a) => a.name).join(", ") : "Unknown Artist");
    const albumName = typeof song.album === "string" ? song.album : song.album?.name;

    return (
        <Card
            onClick={onClick}
            className="cursor-pointer hover:bg-accent transition-colors duration-200"
        >
            <CardContent className="p-0 flex items-center">
                <div className="relative flex-shrink-0">
                    {song.image && song.image.length > 0 && (
                        <Image
                            width={80}
                            height={80}
                            src={song.image[song.image.length - 1]?.url || song.image[0].url}
                            alt={title}
                            className="w-20 h-20 object-cover rounded-l-lg"
                        />
                    )}
                </div>
                <div className="p-4 flex-grow">
                    <h3 className="text-base font-semibold mb-1">{he.decode(title)}</h3>
                    <p className="text-sm text-muted-foreground">{he.decode(artistName)}</p>
                    {albumName && (
                        <p className="text-xs text-muted-foreground mt-1">
                            Album: {he.decode(albumName)}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
