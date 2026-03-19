"use client";
import { Card, CardContent } from "@/components/ui/card";
import he from "he";
import Image from "next/image";
import Link from "next/link";
import type React from "react";

export interface MediaCardProps {
	id: string | number;
	title: string;
	imageUrl: string;
	subtitle?: string;
	description?: string;
	url?: string;
	type: "album" | "artist" | "playlist" | "song" | "top";
	onClick?: () => void;
	priority?: boolean;
}

// Generates the href for the Next.js Link depending on item type
const getHref = (
	type: MediaCardProps["type"],
	id: string | number,
	url?: string,
) => {
	switch (type) {
		case "album":
			return `/album/${id}`;
		case "artist":
			return `/artist/${id}`;
		case "playlist":
			return `/playlist/${id}`;
		default:
			return url || "#";
	}
};

export const MediaCard: React.FC<MediaCardProps> = ({
	id,
	title,
	imageUrl,
	subtitle,
	description,
	type,
	url,
	onClick,
	priority = false,
}) => {
	const content = (
		<Card
			className={`h-full ${onClick ? "cursor-pointer" : ""}`}
			onClick={onClick}
		>
			<CardContent className="p-0 h-full flex flex-col">
				<div className="relative w-full aspect-square">
					<Image
						width={300}
						height={300}
						alt={title}
						src={imageUrl}
						priority={priority}
						className="w-full h-auto aspect-square object-cover rounded-t-lg"
					/>
				</div>
				<div
					className={`p-3 flex-grow ${type === "artist" ? "text-center" : ""}`}
				>
					<h3 className="text-sm font-semibold mb-1 line-clamp-1">
						{he.decode(title)}
					</h3>
					{subtitle && (
						<p className="text-xs text-muted-foreground mb-1 line-clamp-1">
							{he.decode(subtitle)}
						</p>
					)}
					{description && (
						<p className="text-xs text-muted-foreground line-clamp-2">
							{he.decode(description)}
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);

	// If onClick is provided, we assume the parent handles routing or modal (like play song)
	if (onClick) {
		return content;
	}

	// Otherwise wrap it in a Link for navigation
	return (
		<Link
			href={getHref(type, id, url)}
			className="block h-full transition-transform hover:scale-105"
		>
			{content}
		</Link>
	);
};
