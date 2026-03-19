"use client";
import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { playSongAtom } from "../atoms/atoms";

import type { Song } from "@/lib/types";

export interface PlayerProps {
	songList: Song[];
	songIndex: number;
	setSongIndex: React.Dispatch<React.SetStateAction<number>>;
	isExpanded: boolean;
	setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useAudioPlayer(song: Song | null) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [progress, setProgress] = useState(0);
	const [currentTime, setCurrentTime] = useState(0);
	const audioRef = useRef<HTMLAudioElement>(null);
	const [playSong, setPlaySong] = useAtom(playSongAtom);
	const [isEnded, setIsEnded] = useState(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: only run on song change
	useEffect(() => {
		if (!song) return;

		const audio = audioRef.current;
		if (!audio) return;

		// Set the new song's source
		audio.src = song.downloadUrl[4].url;
		audio.load();

		if (playSong) {
			audio.volume = Number.parseFloat(localStorage.getItem("volume") || "1.0");
			setProgress(0);
			setCurrentTime(0);
			audio.play();
			setIsPlaying(true);
		}

		// Reset progress and play the song
		// setProgress(0);
		// setCurrentTime(0);

		const updateProgress = () => {
			if (audio.duration) {
				setProgress((audio.currentTime / audio.duration) * 100);
				setCurrentTime(audio.currentTime);
			}
		};

		// const handleEnded = () => {setIsPlaying(false) setPlaySong(false)};

		// Add event listeners
		audio.addEventListener("timeupdate", updateProgress);
		// audio.addEventListener("ended", setIsEnded(true));

		return () => {
			// Clean up event listeners
			audio.removeEventListener("timeupdate", updateProgress);
			// audio.removeEventListener("ended", handleEnded);
		};
	}, [song]);

	// useEffect(() => {
	//   const audio = audioRef.current;
	//   if (!audio) return;
	//   if (playSong) {
	//     audio.play();
	//     setIsPlaying(true);
	//   }
	// }, [playSong]);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		if (isPlaying) {
			audio.volume = Number.parseFloat(localStorage.getItem("volume") || "1.0");
			audio.play();
		} else {
			audio.pause();
		}
	}, [isPlaying]);

	const togglePlay = () => {
		setIsPlaying((prev) => !prev);
		setPlaySong((prev) => !prev);
	};

	const seek = (value: number) => {
		const audio = audioRef.current;
		if (audio) {
			const newTime = (value / 100) * audio.duration;
			audio.currentTime = newTime;
			setProgress(value);
			setCurrentTime(newTime);
		}
	};

	return { isPlaying, togglePlay, progress, seek, currentTime, audioRef };
}
