import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LessonResponseDTO, CourseResponseDTO } from '../../../../types/course-builder.types';

@Component({
  selector: 'app-lesson-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lesson-content.component.html',
  styleUrl: './lesson-content.component.css'
})
export class LessonContentComponent {
  @Input() lesson: LessonResponseDTO | null = null;
  @Input() course: CourseResponseDTO | null = null;
  @Input() isLoading: boolean = false;
  @Input() error: string = '';

  constructor(private sanitizer: DomSanitizer) {}

  getYouTubeEmbedUrl(lesson: LessonResponseDTO | null): SafeResourceUrl | null {
    if (!lesson || lesson.type !== 3 || !lesson.videoUrl) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = lesson.videoUrl.match(regExp);

    if (match && match[2].length === 11) {
      const videoId = match[2];
      return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}?autoplay=0`);
    }
    return null;
  }

  getMediaUrl(lesson: LessonResponseDTO | null): string | null {
    if (!lesson || !lesson.videoUrl) return null;
    
    // Type 3 is Link (URL), return as-is
    if (lesson.type === 3) return lesson.videoUrl;
    
    // External links (just in case)
    if (lesson.videoUrl.startsWith('http')) return lesson.videoUrl;
    
    // Prepend BASE_URL for uploaded files
    const baseUrl = 'http://localhost:5232';
    return `${baseUrl}/${lesson.videoUrl.replace(/^\//, '')}`;
  }
}
