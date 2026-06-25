import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { tokenizeTags } from '../../utils';
import { Track, TrackSource } from '../../models';
import { TrackService } from '../../services/track.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css'
})
export class UploadComponent {
  private tracks = inject(TrackService);

  tagInput = 'Uploaded';

  @Output() uploaded = new EventEmitter<number>();

  async onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const newTracks: Track[] = [];

    const fileArr = Array.from(files);
    for (const f of fileArr) {
      if (!f.type.includes('audio')) continue;
      const id = 'u-' + f.name.replace(/\s+/g, '-').toLowerCase() + '-' + Math.random().toString(16).slice(2);
      const tags = tokenizeTags(this.tagInput);
      const title = f.name.replace(/\.[^/.]+$/, '').slice(0, 60);

      const srcObj: TrackSource = { kind: 'local', objectUrl: URL.createObjectURL(f) };

      newTracks.push({
        id,
        title,
        artist: 'Local Upload',
        tags: tags.length ? tags : ['Uploaded'],
        featured: false,
        source: srcObj
      });
    }

    if (!newTracks.length) return;
    this.tracks.addLocalTracks(newTracks);
    this.uploaded.emit(newTracks.length);
  }
}

