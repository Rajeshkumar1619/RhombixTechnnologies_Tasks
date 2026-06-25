import { Component, computed, effect, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LibraryComponent } from './components/library/library.component';
import { PlayerComponent } from './components/player/player.component';
import { PlaylistManagerComponent } from './components/playlist-manager/playlist-manager.component';
import { UploadComponent } from './components/upload/upload.component';
import { TrackService } from './services/track.service';
import { PlayerService } from './services/player.service';
import { PlaylistService } from './services/playlist.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LibraryComponent, PlayerComponent, PlaylistManagerComponent, UploadComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private tracks = inject(TrackService);
  private player = inject(PlayerService);
  private playlists = inject(PlaylistService);

  // selected queue ids based on selected playlist
  queueIds = signal<string[]>(this.tracks.getAll().map(t => t.id));

  // keep library active UI in sync (simple)
  activeTrackId = signal<string | null>(null);

  // notify UI on current track id
  filteredQueueIds = computed(() => this.queueIds());


  constructor() {
    // initial queue
    this.player.setQueue(this.queueIds());

    effect(() => {
      const id = this.player.currentTrackId();
      this.activeTrackId.set(id);
    });
  }

  onLibraryTrackClick(trackId: string) {
    const t = this.tracks.getById(trackId);
    if (!t) return;

    // set queue if empty
    const q = this.queueIds();
    if (!q.length) this.queueIds.set(this.tracks.getAll().map(x => x.id));

    // update player queue around chosen track if exists
    this.player.setQueue(this.queueIds(), trackId);
    this.player.loadAndPlay(t, true);
    this.activeTrackId.set(trackId);
  }

  onPlaylistSelected(trackIds: string[]) {
    if (!trackIds.length) return;
    this.queueIds.set(trackIds);
    this.player.setQueue(trackIds);

    const first = trackIds[0];
    const t = this.tracks.getById(first);
    if (!t) return;
    this.player.setQueue(trackIds, first);
    this.player.loadAndPlay(t, true);
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const tag = (document.activeElement?.tagName ?? '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    if (event.code === 'Space') {
      event.preventDefault();
      this.player.togglePlay();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.player.next();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.player.prev();
    } else if (event.key.toLowerCase() === 'm') {
      event.preventDefault();
      const vol = this.player.volume();
      if (this.player.isMuted() || vol === 0) {
        this.player.setVolume(vol > 0 ? vol : 0.7);
      } else {
        this.player.setVolume(0);
      }
    }
  }
}

