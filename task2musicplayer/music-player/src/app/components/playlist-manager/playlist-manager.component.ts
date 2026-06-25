import { Component, computed, inject, signal, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Playlist } from '../../models';
import { PlaylistService } from '../../services/playlist.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { CommonModule } from '@angular/common';
import { Track } from '../../models';
import { TrackService } from '../../services/track.service';

@Component({
  selector: 'app-playlist-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './playlist-manager.component.html',
  styleUrl: './playlist-manager.component.css'
})
export class PlaylistManagerComponent {
  @Output() playlistSelected = new EventEmitter<string[]>();

  private playlistsSvc = inject(PlaylistService);
  private tracksSvc = inject(TrackService);

  playlists = computed(() => this.playlistsSvc.getAll());

  selectedPlaylistId = signal<string | null>(null);
  selected = computed(() => {
    if (!this.selectedPlaylistId()) return null;
    return this.playlistsSvc.getById(this.selectedPlaylistId()! ) ?? null;
  });

  // create
  newName = signal('');
  newDesc = signal('');

  getNewName(): string { return this.newName(); }
  setNewName(v: string) { this.newName.set(v); }
  getNewDesc(): string { return this.newDesc(); }
  setNewDesc(v: string) { this.newDesc.set(v); }


  // edit
  editId = signal<string | null>(null);
  editName = signal('');
  editDesc = signal('');

  getEditName(): string { return this.editName(); }
  setEditName(v: string) { this.editName.set(v); }
  getEditDesc(): string { return this.editDesc(); }
  setEditDesc(v: string) { this.editDesc.set(v); }

  getSearchTrack(): string { return this.searchTrack(); }
  setSearchTrack(v: string) { this.searchTrack.set(v); }


  // track pick
  searchTrack = signal('');

  tracks = computed(() => this.tracksSvc.getAll());
  filteredTracksForEdit = computed(() => {
    const q = (this.searchTrack() || '').toLowerCase().trim();
    if (!q) return this.tracks();
    return this.tracks().filter(t => `${t.title} ${t.artist} ${t.tags.join(' ')}`.toLowerCase().includes(q));
  });

  selectPlaylist(id: string): void {
    this.selectedPlaylistId.set(id);
    const p = this.playlistsSvc.getById(id);
    if (p?.trackIds.length) {
      this.playlistSelected.emit(p.trackIds);
    }
  }

  playSelected(): void {
    const p = this.selected();
    if (p?.trackIds.length) {
      this.playlistSelected.emit(p.trackIds);
    }
  }

  createPlaylist() {
    const trackIds = this.tracks().map(t => t.id); // default: add all demo tracks
    const p = this.playlistsSvc.create({
      name: this.newName(),
      description: this.newDesc(),
      trackIds
    });
    this.newName.set('');
    this.newDesc.set('');
    this.selectedPlaylistId.set(p.id);
    this.playlistSelected.emit(p.trackIds);
  }

  startEdit(p: Playlist) {
    this.editId.set(p.id);
    this.editName.set(p.name);
    this.editDesc.set(p.description ?? '');
  }

  cancelEdit() {
    this.editId.set(null);
  }

  saveEdit() {
    const id = this.editId();
    if (!id) return;

    const updated = this.playlistsSvc.update(id, {
      name: this.editName(),
      description: this.editDesc()
    });
    if (!updated) return;
    this.editId.set(null);
  }

  deletePlaylist(id: string) {
    this.playlistsSvc.delete(id);
    if (this.selectedPlaylistId() === id) this.selectedPlaylistId.set(null);
    if (this.editId() === id) this.editId.set(null);
  }

  toggleTrackInSelected(trackId: string) {
    const id = this.selectedPlaylistId();
    if (!id) return;
    const p = this.playlistsSvc.getById(id);
    if (!p) return;

    const set = new Set(p.trackIds);
    if (set.has(trackId)) set.delete(trackId);
    else set.add(trackId);

    this.playlistsSvc.update(id, { trackIds: Array.from(set) });
  }

  setPlaylistTrackIdsForEditor(trackIds: string[]) {
    const id = this.selectedPlaylistId();
    if (!id) return;
    this.playlistsSvc.update(id, { trackIds });
  }

  isInSelected(trackId: string): boolean {
    const p = this.selected();
    if (!p) return false;
    return p.trackIds.includes(trackId);
  }
}

