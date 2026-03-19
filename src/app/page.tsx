"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { useQuery } from "@tanstack/react-query";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Search from "./comps/search";
import { useAtom } from "jotai";
import { searchTextAtom } from "./atoms/atoms";

const Home = () => {
  const { setTheme } = useTheme();
  const [searchText, setSearchText] = useAtom(searchTextAtom);
  // const [searchSongList, setSearchSongList] = useState<SearchSong[]>([]);
  // const [searchSongIndex, setSearchSongIndex] = useState(0);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 md:py-4">
      {isClient && typeof window !== "undefined" && (
        <div className="flex flex-col min-h-screen overflow-hidden">
          {" "}
          {/* Added overflow-hidden */}
          <div className="flex justify-between items-center p-4 gap-2">
            <Input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search Song..."
              type="text"
              className="flex-1"
            />
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" size="icon" />}>
                <Sun className=" rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 " />
                <Moon className="absolute  rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* Content Section */}
          <div className="flex-grow overflow-auto">
            <Search searchText={searchText} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
