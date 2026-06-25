import { Injectable } from '@angular/core';
import { Playlist } from '../models';
import { LocalStorageService } from './local-storage.service';

const KEY = 'rhombix_musicplayer_playlists_v1';

@Injectable({ providedIn: 'root' })
export class PlaylistService {
  private playlists: Playlist[];

  constructor(private storage: LocalStorageService) {
    this.playlists = this.storage.getJson<Playlist[]>(KEY, []);
  }

  getAll(): Playlist[] {
    return this.playlists.slice().sort((a, b) => b.updatedAt - a.updatedAt);
  }

  getById(id: string): Playlist | undefined {
    return this.playlists.find(p => p.id === id);
  }

  create(input: { name: string; description?: string; trackIds: string[] }): Playlist {
    const now = Date.now();
    const p: Playlist = {
      id: this.randomId(),
      name: input.name.trim() || 'Untitled Playlist',
      description: input.description,
      trackIds: input.trackIds.slice(),
      createdAt: now,
      updatedAt: now
    };
    this.playlists = [p, ...this.playlists];
    this.persist();
    return p;
  }

  update(id: string, patch: Partial<Pick<Playlist, 'name' | 'description' | 'trackIds'>>): Playlist | undefined {
    const idx = this.playlists.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    const updated: Playlist = {
      ...this.playlists[idx],
      ...patch,
      name: patch.name !== undefined ? (patch.name.trim() || 'Untitled Playlist') : this.playlists[idx].name,
      updatedAt: Date.now()
    };
    this.playlists = [
      ...this.playlists.slice(0, idx),
      updated,
      ...this.playlists.slice(idx + 1)
    ];
    this.persist();
    return updated;
  }

  delete(id: string): void {
    this.playlists = this.playlists.filter(p => p.id !== id);
    this.persist();
  }

  private persist(): void {
    this.storage.setJson(KEY, this.playlists);
  }

  private randomId(): string {
    return Math.random().toString(16).slice(2) + '-' + Date.now().toString(16);
  }
}

