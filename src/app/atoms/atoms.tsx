import { atom } from "jotai";
import { searchSongData } from "../examples/songData";
import { Song } from "@/lib/types";

// type SongList = typeof albumData.data.songs;

export const songListAtom = atom<Song[]>([]);
export const songIndexAtom = atom(0);
export const playerExpansionAtom = atom(true);
export const playSongAtom = atom(false);
export const searchTextAtom = atom("");
