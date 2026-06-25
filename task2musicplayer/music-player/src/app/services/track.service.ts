import { Injectable, signal } from '@angular/core';
import { Track } from '../models';

@Injectable({ providedIn: 'root' })
export class TrackService {
  private readonly tracksRevision = signal(0);

  private tracks: Track[] = [
    {
      id: 't1',
      title: 'Aurora Nights',
      artist: 'Lumen Wave',
      tags: ['Chill'],
      featured: true,
      source: { kind: 'url', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' }
    },
    {
      id: 't2',
      title: 'Neon Drift',
      artist: 'Pixel Runner',
      tags: ['Electronic'],
      featured: false,
      source: { kind: 'url', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' }
    },
    {
      id: 't3',
      title: 'Golden Hour',
      artist: 'Mira Skyline',
      tags: ['Pop'],
      featured: true,
      source: { kind: 'url', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' }
    },
    {
      id: 't4',
      title: 'Midnight Breeze',
      artist: 'Harbor Lights',
      tags: ['Chill'],
      featured: false,
      source: { kind: 'url', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' }
    },
    {
      id: 't5',
      title: 'Solar Pulse',
      artist: 'Orbit Atlas',
      tags: ['Electronic'],
      featured: false,
      source: { kind: 'url', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' }
    },
    {
      id: 't6',
      title: 'City of Echoes',
      artist: 'Noir Avenue',
      tags: ['Rock'],
      featured: true,
      source: { kind: 'url', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' }
    }
  ];

  getAll(): Track[] {
    this.tracksRevision();
    return this.tracks;
  }

  getById(id: string): Track | undefined {
    return this.tracks.find(t => t.id === id);
  }

  getAllTags(): string[] {
    const set = new Set<string>();
    for (const t of this.tracks) for (const tag of t.tags) set.add(tag);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  setDuration(id: string, durationSec: number): void {
    const t = this.getById(id);
    if (!t) return;
    t.durationSec = durationSec;
  }

  addLocalTracks(tracks: Track[]): void {
    this.tracks = [...tracks, ...this.tracks];
    this.tracksRevision.update(n => n + 1);
  }

  // Exposed for playlist editor
  removeTracks(trackIds: string[]): void {
    const set = new Set(trackIds);
    this.tracks = this.tracks.filter(t => !set.has(t.id));
  }
}

