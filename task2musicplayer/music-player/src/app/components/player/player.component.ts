import { Component, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerService } from '../../services/player.service';
import { TrackService } from '../../services/track.service';
import { Track } from '../../models';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './player.component.html',
  styleUrl: './player.component.css'
})
export class PlayerComponent {
  player = inject(PlayerService);
  private tracks = inject(TrackService);

  private savedVolume = 0.7;

  volumePercent = computed(() => Math.round((this.player.volume() || 0) * 100));

  currentTrack = computed<Track | null>(() => {
    const id = this.player.currentTrackId();
    if (!id) return null;
    return this.tracks.getById(id) ?? null;
  });

  progressRatio = computed(() => {
    const d = this.player.durationSec();
    if (!d) return 0;
    return (this.player.currentTimeSec() || 0) / d;
  });

  modeText = computed(() => {
    const sh = this.player.shuffle() ? 'on' : 'off';
    const rp = this.player.repeat() === 'one' ? 'on' : 'off';
    return `Shuffle: ${sh} • Repeat: ${rp}`;
  });

  currentTags = computed(() => this.currentTrack()?.tags?.join(', ') || '—');

  coverLetter(title?: string): string {
    const s = (title ?? '').trim();
    return s ? s[0].toUpperCase() : '🎵';
  }

  constructor() {
    effect(() => {
      const id = this.player.currentTrackId();
      if (!id) return;
      const t = this.tracks.getById(id);
      if (!t) return;
      this.player.loadAndPlay(t, true);
    });
  }

  togglePlay(): void {
    this.player.togglePlay();
  }

  prev(): void {
    this.player.prev();
  }

  next(): void {
    this.player.next();
  }

  toggleShuffle(): void {
    this.player.toggleShuffle();
  }

  toggleRepeat(): void {
    this.player.toggleRepeat();
  }

  seekRatioInput(ratio: number): void {
    this.player.seekTo(ratio);
  }

  volumeInput(v: number): void {
    if (v > 0) this.savedVolume = v;
    this.player.setVolume(v);
  }

  muteToggle(): void {
    if (this.player.isMuted() || this.player.volume() === 0) {
      this.player.setVolume(this.savedVolume || 0.7);
    } else {
      this.savedVolume = this.player.volume() || 0.7;
      this.player.setVolume(0);
    }
  }
}
