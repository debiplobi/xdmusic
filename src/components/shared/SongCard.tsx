"use client";
import type { Song } from "@/lib/types";
import he from "he";
import Image from "next/image";
import type React from "react";

interface SongCardProps {
	song: Song;
	onClick: () => void;
	priority?: boolean;
}

export const SongCard: React.FC<SongCardProps> = ({
	song,
	onClick,
	priority = false,
}) => {
	const title = song.title || song.name || "Unknown Song";
	const artistName =
		song.singers ||
		(song.artists?.primary?.map((a) => a.name).join(", ") ?? "Unknown Artist");
	const albumName =
		typeof song.album === "string" ? song.album : song.album?.name;
	const imgSrc = song.image?.length
		? song.image[song.image.length - 1]?.url || song.image[0].url
		: null;

	return (
		<div>
			<div
				onClick={onClick}
				className="flex items-center gap-3 px-2 py-2 rounded-md cursor-pointer hover:bg-accent/60 transition-colors duration-150 group"
			>
				{imgSrc ? (
					<Image
						width={56}
						height={56}
						priority={priority}
						src={imgSrc}
						alt={title}
						className="w-14 h-14 object-cover rounded flex-shrink-0 shadow-md"
					/>
				) : (
					<div className="w-14 h-14 rounded bg-muted flex-shrink-0" />
				)}
				<div className="flex-1 min-w-0">
					<p className="text-sm font-semibold truncate leading-snug">
						{he.decode(title)}
					</p>
					<p className="text-xs text-muted-foreground truncate mt-0.5">
						{he.decode(artistName)}
						{albumName ? ` • ${he.decode(albumName)}` : ""}
					</p>
				</div>
			</div>
		</div>
	);
};
