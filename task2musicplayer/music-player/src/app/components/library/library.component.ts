import { Component, computed, inject, signal, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Track } from '../../models';
import { TrackService } from '../../services/track.service';
import { normalizeQuery } from '../../utils';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './library.component.html',
  styleUrl: './library.component.css'
})
export class LibraryComponent {
  private tracksSvc = inject(TrackService);

  search = signal('');
  selectedTag = signal<string>('all');
  featuredOnly = signal(false);

  // ngModel helpers (Angular doesn't support [(ngModel)] with signal())
  getSearch(): string { return this.search(); }
  setSearch(v: string) { this.search.set(v); }

  getSelectedTag(): string { return this.selectedTag(); }
  setSelectedTag(v: string) { this.selectedTag.set(v); }

  getFeaturedOnly(): boolean { return this.featuredOnly(); }
  setFeaturedOnly(v: boolean) { this.featuredOnly.set(!!v); }


  tracks = computed(() => this.tracksSvc.getAll());

  tags = computed(() => ['all', ...this.tracksSvc.getAllTags()]);

  filteredTracks = computed(() => {
    const q = normalizeQuery(this.search());
    const tag = this.selectedTag();
    const feat = this.featuredOnly();

    return this.tracks().filter(t => {
      const hay = `${t.title} ${t.artist} ${t.tags.join(' ')}`.toLowerCase();
      const matchesQ = !q || hay.includes(q);
      const matchesTag = tag === 'all' || t.tags.includes(tag);
      const matchesFeat = !feat || !!t.featured;
      return matchesQ && matchesTag && matchesFeat;
    });
  });

  @Input() set activeTrackId(id: string | null) {
    this.activeId.set(id);
  }

  @Output() trackClick = new EventEmitter<string>();

  activeId = signal<string | null>(null);

  firstFeatured = computed(() => this.filteredTracks().find(t => t.featured) ?? null);

  onTrackClick(id: string): void {
    this.trackClick.emit(id);
  }

  onTrackKeydown(event: KeyboardEvent, id: string): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onTrackClick(id);
    }
  }
}

