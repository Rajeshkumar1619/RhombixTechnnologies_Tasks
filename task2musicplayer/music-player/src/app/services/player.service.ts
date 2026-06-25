import { Injectable, signal } from '@angular/core';
import { Track } from '../models';

function fmtTime(sec: number | undefined): string {
  const s = Math.max(0, Math.floor(sec ?? 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private audio: HTMLAudioElement = new Audio();

  isReady = signal(false);
  isPlaying = signal(false);
  currentTimeSec = signal(0);
  durationSec = signal(0);
  volume = signal(0.7);
  isMuted = signal(false);

  // playlist playback state
  currentTrackId = signal<string | null>(null);
  shuffle = signal(false);
  repeat = signal<'off' | 'one'>('off');

  onReady?: () => void;

  private currentQueueIds: string[] = [];
  private currentIndex: number = -1;

  constructor() {
    this.audio.preload = 'metadata';

    this.audio.addEventListener('loadedmetadata', () => {
      this.durationSec.set(Number.isFinite(this.audio.duration) ? this.audio.duration : 0);
      this.isReady.set(true);
      this.onReady?.();
    });

    this.audio.addEventListener('timeupdate', () => {
      this.currentTimeSec.set(this.audio.currentTime || 0);
    });

    this.audio.addEventListener('play', () => this.isPlaying.set(true));
    this.audio.addEventListener('pause', () => this.isPlaying.set(false));

    this.audio.addEventListener('ended', () => {
      if (this.repeat() === 'one') {
        this.seekTo(0);
        this.play().catch(() => {});
        return;
      }
      this.next();
    });
  }

  setQueue(trackIds: string[], startTrackId?: string): void {
    this.currentQueueIds = trackIds.slice();
    if (startTrackId) {
      const idx = this.currentQueueIds.indexOf(startTrackId);
      this.currentIndex = idx >= 0 ? idx : 0;
    } else {
      this.currentIndex = this.currentQueueIds.length ? 0 : -1;
    }
  }

  loadAndPlay(track: Track, autoplay = true): void {
    this.currentTrackId.set(track.id);

    const src = track.source.kind === 'url' ? track.source.src : track.source.objectUrl;
    this.audio.src = src;

    this.audio.volume = this.isMuted() ? 0 : this.volume();
    this.audio.muted = this.isMuted();

    if (autoplay) {
      this.play().catch(() => {});
    }
  }

  play(): Promise<void> {
    return this.audio.play();
  }

  pause(): void {
    this.audio.pause();
  }

  togglePlay(): void {
    if (this.audio.paused) this.play().catch(() => {});
    else this.pause();
  }

  seekTo(ratioOrSec: number): void {
    if (ratioOrSec < 0) ratioOrSec = 0;

    // If slider uses 0..1 ratio
    if (ratioOrSec <= 1) {
      const d = this.audio.duration || this.durationSec();
      this.audio.currentTime = d ? ratioOrSec * d : 0;
      return;
    }

    this.audio.currentTime = ratioOrSec;
  }

  setVolume(v01: number): void {
    const v = Math.min(1, Math.max(0, v01));
    this.volume.set(v);
    this.audio.muted = v === 0;
    this.audio.volume = v;
    this.isMuted.set(v === 0);
  }

  toggleShuffle(): void {
    this.shuffle.set(!this.shuffle());
  }

  toggleRepeat(): void {
    this.repeat.set(this.repeat() === 'one' ? 'off' : 'one');
  }

  prev(): void {
    if (!this.currentQueueIds.length) return;
    this.move(-1);
  }

  next(): void {
    if (!this.currentQueueIds.length) return;
    this.move(1);
  }

  private move(direction: 1 | -1): void {
    if (!this.currentQueueIds.length) return;

    if (this.shuffle()) {
      const len = this.currentQueueIds.length;
      if (len === 1) {
        this.loadCurrentTrackOnly();
        return;
      }
      // choose random different index
      let nextIdx = this.currentIndex;
      while (nextIdx === this.currentIndex) {
        nextIdx = Math.floor(Math.random() * len);
      }
      this.currentIndex = nextIdx;
    } else {
      const len = this.currentQueueIds.length;
      this.currentIndex = (this.currentIndex + direction + len) % len;
    }

    this.loadByQueueIndex();
  }

  private loadCurrentTrackOnly(): void {
    this.loadByQueueIndex();
  }

  // Caller must load track data by ID; we expose getCurrentTrackId and loadById in component.
  getCurrentTrackId(): string | null {
    return this.currentTrackId();
  }

  getQueueIds(): string[] {
    return this.currentQueueIds.slice();
  }

  // Set by component after loading track; this ensures ended->next picks queue order.
  // Component calls: playerService.loadAndPlay(track) and playerService.setQueue([...], trackId)

  // For slider UI
  get progressRatio(): number {
    const d = this.durationSec();
    if (!d) return 0;
    return (this.currentTimeSec() || 0) / d;
  }

  get formattedCurrentTime(): string {
    return fmtTime(this.currentTimeSec());
  }

  get formattedDuration(): string {
    return fmtTime(this.durationSec());
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private loadByQueueIndex(): void {
    // no-op here; component is responsible to actually load track object
    // We only update trackId signal to inform UI.
    const id = this.currentQueueIds[this.currentIndex];
    this.currentTrackId.set(id ?? null);
  }
}

