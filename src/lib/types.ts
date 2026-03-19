export interface ImageDesc {
	quality?: string;
	url: string;
}

export interface ArtistBrief {
	id: string;
	name: string;
	url?: string;
	image?: ImageDesc[];
	type?: string;
	role?: string;
}

export interface Song {
	id: string;
	name: string;
	title?: string; // Search API returns title, Detail API returns name
	type?: string;
	album?: { id: string; name: string; url: string } | string;
	year?: string;
	releaseDate?: string;
	duration: number | string;
	label?: string;
	primaryArtists?: string;
	primaryArtistsId?: string;
	singers?: string;
	featuredArtists?: string;
	featuredArtistsId?: string;
	explicitContent?: number;
	playCount?: number;
	language?: string;
	hasLyrics?: string;
	url?: string;
	copyright?: string;
	image: ImageDesc[];
	downloadUrl: { quality: string; url: string }[];
	artists: {
		primary: ArtistBrief[];
		featured?: ArtistBrief[];
		all?: ArtistBrief[];
	};
}

export interface Album {
	id: string | number;
	name: string;
	title?: string;
	year?: string;
	type?: string;
	playCount?: number;
	language?: string;
	explicitContent?: string;
	primaryArtistsId?: string;
	url?: string;
	image: ImageDesc[];
	songs?: Song[];
	artist?: string;
	artists?: ArtistBrief[];
}

export interface Artist {
	id: string | number;
	name: string;
	title?: string;
	url?: string;
	image: ImageDesc[];
	followerCount?: string;
	fanCount?: string;
	isVerified?: boolean;
	dominantLanguage?: string;
	dominantType?: string;
	bio?: string | any[];
	dob?: string;
	fb?: string;
	twitter?: string;
	wiki?: string;
	availableLanguages?: string[];
	isRadioPresent?: boolean;
	type?: string;
	roles?: string[];
	songs?: Song[];
}

export interface Playlist {
	id: string | number;
	name: string;
	title?: string;
	subtitle?: string;
	header_desc?: string;
	type?: string;
	url?: string;
	image: ImageDesc[];
	language?: string;
	year?: string;
	playCount?: string;
	explicitContent?: string;
	songCount?: string;
	artists?: ArtistBrief[];
	songs?: Song[];
}

export interface TopQueryItem {
	id: string;
	title: string;
	image: ImageDesc[];
	url: string;
	type: string;
	description: string;
	position: number;
}
