"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import type { Song } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { FastAverageColor } from "fast-average-color";
import { motion } from "framer-motion";
import he from "he";
import { useAtom } from "jotai";
import {
	ArrowDownToLine,
	Minimize2,
	Pause,
	Play,
	SkipBack,
	SkipForward,
} from "lucide-react";
import { Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useEffect, useState } from "react";
import {
	playerExpansionAtom,
	songIndexAtom,
	songListAtom,
} from "../atoms/atoms";
import { getSongData } from "../utils/api";
import { useAudioPlayer } from "./useAudioPlayer";

// import { preinitModule } from "react-dom";

const Player: React.FC = () => {
	const [isExpanded, setIsExpanded] = useAtom(playerExpansionAtom);
	const [songList] = useAtom(songListAtom);
	const [songIndex, setSongIndex] = useAtom(songIndexAtom);
	const [volume, setVolume] = useState("1.0");
	useEffect(() => {
		if (typeof window !== "undefined") {
			const stored = localStorage.getItem("volume");
			if (stored && !Number.isNaN(Number.parseFloat(stored))) {
				setVolume(stored);
			} else {
				setVolume("1.0");
			}
		}
	}, []);

	const { data: song } = useQuery<Song>({
		queryKey: ["songData", songList[songIndex]?.id, songIndex],
		queryFn: async () => {
			const data = await getSongData(songList[songIndex]?.id);
			return data.data[0];
		},
		enabled: !!songList[songIndex]?.id,
	});

	const { isPlaying, togglePlay, progress, seek, currentTime, audioRef } =
		useAudioPlayer(song || null);

	const goToNext = () =>
		setSongIndex((prevIndex) => (prevIndex + 1) % songList.length);

	const goToBack = () =>
		setSongIndex(
			(prevIndex) => (prevIndex - 1 + songList.length) % songList.length,
		);

	const [backgroundColor, setBackgroundColor] = useState("gray");

	const handleVolumeChange = (val: number | readonly number[]) => {
		const numericVal = typeof val === "number" ? val : val[0];
		if (numericVal === undefined || Number.isNaN(numericVal)) return;

		const newVolume = numericVal / 100;
		setVolume(`${newVolume}`);
		localStorage.setItem("volume", `${newVolume}`);
		if (audioRef.current) {
			audioRef.current.volume = newVolume;
		}
	};

	useEffect(() => {
		if (progress === 100) {
			setSongIndex((prevIndex) => (prevIndex + 1) % songList.length);
		}
	}, [progress, songList.length, setSongIndex]);

	// Extract the dominant color from the image URL
	useEffect(() => {
		const fac = new FastAverageColor();
		if (song?.image[2]?.url) {
			fac
				.getColorAsync(song.image[2].url, { crossOrigin: "anonymous" })
				.then((color) => {
					setBackgroundColor(color.hex); // Set the extracted color
				})
				.catch((error) => {
					console.error("Failed to extract color:", error);
				});
		}
		// Clean up on unmount
		return () => fac.destroy();
	}, [song?.image]);

	if (!song) return null;

	const formatTime = (seconds: number): string => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
	};

	const handleSlideComplete = () => {
		setIsExpanded((prev) => !prev);
	};

	const concatinatedArtistNames = (song: Song) => {
		const artistNames = song.artists.primary.map((item) => item.name);
		const artistNamesString = artistNames.join(", ");
		const decodedArtist = he.decode(artistNamesString);
		return decodedArtist;
	};
	const downloadSong = async (url: string, filename: string) => {
		try {
			const response = await fetch(url);
			const blob = await response.blob();

			const link = document.createElement("a");
			link.href = URL.createObjectURL(blob);
			link.download = filename || "download";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			// Clean up the URL object
			URL.revokeObjectURL(link.href);
		} catch (error) {
			console.error("Download failed:", error);
		}
	};

	return (
		<Card
			className={`fixed bottom-0 left-0 right-0 mx-auto transition-all duration-300 ${
				isExpanded ? "w-full " : "w-full max-w-screen-xl"
			}`}
		>
			<CardContent className="p-0 h-full">
				<audio ref={audioRef} />
				{isExpanded ? (
					<motion.div
						drag="y" // Enable vertical dragging
						dragConstraints={{ top: 0, bottom: 200 }} // Constrain dragging to a specific range
						onDragEnd={(event, info) => {
							if (event) {
								if (info.offset.y > 100) {
									handleSlideComplete();
								}
							}
						}}
						className="bg-background h-[100dvh] w-full"
					>
						<div className="p-4 md:p-8 h-[100dvh] flex flex-col">
							<div className="flex justify-end mb-2 md:mb-4 shrink-0">
								<Button
									variant="ghost"
									size="icon"
									onClick={() => setIsExpanded(false)}
									className="rounded-full mt-5"
								>
									<Minimize2 className="h-10 w-10" />
								</Button>
							</div>
							<div className="flex-grow flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 min-h-0">
								<div className="w-[60vw] max-w-[280px] md:max-w-[400px] shrink shrink-0 md:shrink-0 aspect-square">
									<Image
										width={400}
										height={400}
										src={song.image[2].url}
										alt={`${song.name} cover`}
										className="rounded-xl w-full h-full object-cover shadow-2xl"
									/>
								</div>
								<div className="flex flex-col w-full max-w-md">
									<h2 className="text-2xl font-semibold mb-1">
										{he.decode(song.name)}
									</h2>

									<p className="text-lg text-muted-foreground mb-4">
										{concatinatedArtistNames(song)}
									</p>
									<Slider
										value={[progress]}
										max={100}
										step={0.1}
										onValueChange={(value) =>
											seek(typeof value === "number" ? value : value[0])
										}
										className="cursor-pointer pb-2"
									/>
									<div className="flex justify-between w-full text-sm mb-4">
										<span>
											{formatTime(
												Math.floor(
													typeof currentTime === "string"
														? Number(currentTime)
														: currentTime,
												),
											)}
										</span>
										<span>
											{formatTime(
												Math.floor(
													typeof song.duration === "string"
														? Number(song.duration)
														: song.duration,
												),
											)}
										</span>
									</div>

									<div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4 mt-4 md:mt-8">
										{/* Left: Volume - Dynamically shrinks gracefully */}
										<div className="hidden sm:flex flex-1 items-center justify-start gap-4 min-w-0 pr-2 md:pr-4">
											<div
												className="cursor-pointer shrink-0 text-muted-foreground hover:text-foreground transition-colors"
												onClick={() => {
													const current = Number.parseFloat(volume);
													const safeCurrent = Number.isNaN(current)
														? 1.0
														: current;
													const newVol = safeCurrent > 0 ? 0 : 1;
													setVolume(`${newVol}`);
													localStorage.setItem("volume", `${newVol}`);
													if (audioRef.current)
														audioRef.current.volume = newVol;
												}}
											>
												{Number.parseFloat(volume) === 0 ? (
													<VolumeX className="h-5 w-5 md:h-6 md:w-6" />
												) : (
													<Volume2 className="h-5 w-5 md:h-6 md:w-6" />
												)}
											</div>
											<Slider
												value={[
													Number.isNaN(Number.parseFloat(volume))
														? 100
														: Number.parseFloat(volume) * 100,
												]}
												max={100}
												step={1}
												onValueChange={handleVolumeChange}
												className="cursor-pointer w-24 md:w-32 shrink min-w-[3rem]"
											/>
										</div>

										{/* Center: Playback Core - Strictly centered without shrinking */}
										<div className="flex items-center justify-center gap-4 shrink-0">
											<Button
												variant="ghost"
												size="icon"
												onClick={goToBack}
												className="h-16 w-16 shrink-0 rounded-full hover:bg-accent/50"
											>
												<SkipBack className="h-10 w-10 md:h-10 md:w-10" />
											</Button>
											<Button
												variant="default"
												size="icon"
												onClick={togglePlay}
												className="h-16 w-16 shrink-0 rounded-full shadow-lg hover:scale-105 transition-transform"
											>
												{isPlaying ? (
													<Pause className="h-10 w-10 md:h-10 md:w-10" />
												) : (
													<Play className="h-10 w-10 md:h-10 md:w-10 ml-1" />
												)}
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={goToNext}
												className="h-16 w-16 shrink-0 rounded-full hover:bg-accent/50"
											>
												<SkipForward className="h-10 w-10 md:h-10 md:w-10" />
											</Button>
										</div>

										{/* Right: Actions - Counters left flex-1 to maintain center symmetry */}
										<div className="flex flex-1 items-center justify-end min-w-0 pl-2 md:pl-4">
											<Button
												variant="ghost"
												size="icon"
												title="Download standard quality"
												className="h-16 w-16 shrink-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/50"
												onClick={() =>
													downloadSong(
														song.downloadUrl?.[4]?.url ||
															song.downloadUrl?.[0]?.url,
														song.name,
													)
												}
											>
												<ArrowDownToLine className="h-10 w-10 md:h-10 md:w-10" />
											</Button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</motion.div>
				) : (
					<div
						className="h-full flex items-center p-2 mb-1 cursor-pointer relative overflow-hidden bg-gradient-to-r rounded-md"
						onClick={() => setIsExpanded(true)}
						style={{
							background: `linear-gradient(to right, ${backgroundColor} ${progress}%, transparent ${progress}%)`,
						}}
					>
						<Image
							width={50}
							height={50}
							src={song.image[2].url}
							alt={`${song.name} cover`}
							className="rounded-md mr-3 w-[50px] h-[50px] object-cover"
						/>
						<div className="flex-grow mr-2">
							<h3 className="text-sm font-medium truncate">
								{he.decode(song.name)}
							</h3>
							<p className="text-xs text-muted-foreground truncate">
								{concatinatedArtistNames(song)}
							</p>
						</div>
						<Button
							variant="ghost"
							size="icon"
							className="mr-1 p-2"
							onClick={(e) => {
								e.stopPropagation();
								togglePlay();
							}}
						>
							{isPlaying ? (
								<Pause className="h-10 w-10" />
							) : (
								<Play className="h-10 w-10" />
							)}
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
};
export default Player;
