"use client";
import React from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Minimize2,
  ArrowDownToLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { useAudioPlayer } from "./useAudioPlayer";
import { Song } from "@/lib/types";
import { getSongData } from "../utils/api";
import { useAtom } from "jotai";
import {
  songListAtom,
  songIndexAtom,
  playerExpansionAtom,
} from "../atoms/atoms";
import { motion } from "framer-motion";
import { FastAverageColor } from "fast-average-color";
import { useEffect, useState } from "react";
import he from "he";
import { Volume2, VolumeX } from "lucide-react";

// import { preinitModule } from "react-dom";

const Player: React.FC = () => {
  const [isExpanded, setIsExpanded] = useAtom(playerExpansionAtom);
  const [songList] = useAtom(songListAtom);
  const [songIndex, setSongIndex] = useAtom(songIndexAtom);
  const [volume, setVolume] = useState("1.0");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("volume");
      if (stored && !isNaN(parseFloat(stored))) {
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
    const numericVal = typeof val === 'number' ? val : val[0];
    if (numericVal === undefined || isNaN(numericVal)) return;

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
      className={`fixed bottom-0 left-0 right-0 mx-auto transition-all duration-300 ${isExpanded ? "w-full " : "w-full max-w-screen-xl"
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
                  className="rounded-full"
                >
                  <Minimize2 className="h-6 w-6" />
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
                    onValueChange={(value) => seek(typeof value === 'number' ? value : value[0])}
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

                  <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-6 mt-4 md:mt-8">
                    {/* Left: Volume - Hidden on extra small screens to save space */}
                    <div className="hidden sm:flex items-center gap-3 w-32 md:w-40">
                      <div
                        className="cursor-pointer shrink-0 text-muted-foreground hover:text-foreground transition-colors p-2"
                        onClick={() => {
                          const current = parseFloat(volume);
                          const safeCurrent = isNaN(current) ? 1.0 : current;
                          const newVol = safeCurrent > 0 ? 0 : 1;
                          setVolume(`${newVol}`);
                          localStorage.setItem("volume", `${newVol}`);
                          if (audioRef.current) audioRef.current.volume = newVol;
                        }}
                      >
                        {parseFloat(volume) === 0 ? <VolumeX className="h-6 w-6 md:h-7 md:w-7" /> : <Volume2 className="h-6 w-6 md:h-7 md:w-7" />}
                      </div>
                      <Slider
                        value={[isNaN(parseFloat(volume)) ? 100 : parseFloat(volume) * 100]}
                        max={100}
                        step={1}
                        onValueChange={handleVolumeChange}
                        className="cursor-pointer w-full shrink-0"
                      />
                    </div>

                    {/* Center: Playback Core */}
                    <div className="flex items-center justify-center gap-4 md:gap-6 flex-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToBack}
                        className="h-14 w-14 shrink-0 rounded-full hover:bg-accent/50"
                      >
                        <SkipBack className="h-8 w-8 md:h-8 md:w-8" />
                      </Button>
                      <Button
                        variant="default"
                        size="icon"
                        onClick={togglePlay}
                        className="h-14 w-14 shrink-0 rounded-full shadow-lg hover:scale-105 transition-transform"
                      >
                        {isPlaying ? (
                          <Pause className="h-8 w-8 md:h-8 md:w-8" />
                        ) : (
                          <Play className="h-8 w-8 md:h-8 md:w-8 ml-1" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToNext}
                        className="h-14 w-14 shrink-0 rounded-full hover:bg-accent/50"
                      >
                        <SkipForward className="h-8 w-8 md:h-8 md:w-8" />
                      </Button>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center justify-end sm:w-32 md:w-40">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Download standard quality"
                        className="h-14 w-14 shrink-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        onClick={() => downloadSong(song.downloadUrl?.[4]?.url || song.downloadUrl?.[0]?.url, song.name)}
                      >
                        <ArrowDownToLine className="h-8 w-8 md:h-8 md:w-8" />
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
