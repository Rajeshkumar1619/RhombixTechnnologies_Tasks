export type TrackSource =
  | { kind: 'url'; src: string }
  | { kind: 'local'; objectUrl: string };

export interface Track {
  id: string;
  title: string;
  artist: string;
  tags: string[]; // genres/categories/tags
  featured?: boolean;
  source: TrackSource;
  durationSec?: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  trackIds: string[];
  createdAt: number;
  updatedAt: number;
}

