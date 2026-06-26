import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ElementRef,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LessonResponseDTO, CourseResponseDTO, BASE_URL } from '../../../../types/course-builder.types';

/**
 * Component responsible for rendering the active lesson content, including video players,
 * text/markdown files, external resource links, and loading/error states.
 */
@Component({
  selector: 'app-lesson-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lesson-content.component.html',
  styleUrl: './lesson-content.component.css'
})
export class LessonContentComponent implements OnChanges, AfterViewInit {
  /**
   * The currently active lesson to display.
   */
  @Input() lesson: LessonResponseDTO | null = null;

  /**
   * The parent course context to which this lesson belongs.
   */
  @Input() course: CourseResponseDTO | null = null;

  /**
   * Signifies if a lesson payload is currently loading from the backend service.
   */
  @Input() isLoading: boolean = false;

  /**
   * A string containing error messages encountered during lesson retrieval.
   */
  @Input() error: string = '';

  /**
   * 1-based position of this lesson within the course.
   */
  @Input() currentLessonNumber = 0;

  /**
   * Total number of lessons in the parent course.
   */
  @Input() totalLessons = 0;

  /**
   * ID of the next lesson in sequence (null when on the last lesson).
   */
  @Input() nextLessonId: number | null = null;

  /**
   * Whether the active lesson is already marked complete.
   */
  @Input() isComplete = false;

  /**
   * Whether the viewer is running in staff preview mode (disables progress mutations).
   */
  @Input() isPreviewMode = false;

  /**
   * Whether a completion mutation is currently in flight.
   */
  @Input() isCompleting = false;

  /**
   * Whether the current video lesson has been fully watched.
   * For non-video lessons this is always true (no restriction).
   */
  @Input() videoFullyWatched = true;

  /**
   * Event emitted when the user clicks "Mark as Complete" on the active lesson.
   */
  @Output() markComplete = new EventEmitter<Event>();

  /**
   * Event emitted when the user clicks the "Next Lesson" button.
   */
  @Output() nextLesson = new EventEmitter<void>();

  /**
   * Whether a next course exists in the parent learning path. When true, a
   * "Next Course" button replaces "Next Lesson" on the final lesson of the course.
   */
  @Input() hasNextCourse = false;

  /**
   * Whether the active lesson is the last lesson of the current course.
   * Drives the "Course Complete" banner and the swap between Next Lesson / Next Course.
   */
  @Input() isLastLessonOfCourse = false;

  /**
   * Whether every lesson in the active course has been completed by the learner.
   */
  @Input() isCourseComplete = false;

  /**
   * Title of the course currently being viewed (used inside the completion banner).
   */
  @Input() courseTitle = '';

  /**
   * Event emitted when the learner clicks "Next Course" to advance to the
   * first lesson of the next course in the learning path.
   */
  @Output() nextCourse = new EventEmitter<void>();

  /**
   * Event emitted when a video lesson has been watched to the end.
   */
  @Output() videoEnded = new EventEmitter<void>();

  /**
   * Event emitted when the user clicks the top-right "Back to Course Builder" link.
   */
  @Output() back = new EventEmitter<void>();

  /**
   * Event emitted when the user clicks a breadcrumb crumb. The payload identifies
   * which destination the crumb refers to.
   *   - "home"    → role-appropriate landing page
   *   - "paths"   → learning-paths list / current path detail
   *   - "courses" → course-builder index for the current learning path (admin only)
   *   - "course"  → course detail for the current course
   */
  @Output() navigate = new EventEmitter<'home' | 'paths' | 'courses' | 'course'>();

  /** Reference to the native <video> element for seek/rate interception. */
  @ViewChild('videoPlayer') videoPlayerRef!: ElementRef<HTMLVideoElement>;

  /**
   * The furthest point (in seconds) the user has legitimately reached by
   * watching without seeking. Any seek attempt past this value is reverted.
   * @private
   */
  private maxAllowedTime = 0;

  /**
   * Constructs the LessonContentComponent.
   *
   * @param sanitizer - Angular service to bypass security checks and trust dynamic iframe/video resources.
   */
  constructor(private sanitizer: DomSanitizer) {}

  // ── Lifecycle hooks ──────────────────────────────────────────────

  ngOnChanges(changes: SimpleChanges): void {
    // Reset video tracking state whenever the lesson changes
    if (changes['lesson']) {
      this.maxAllowedTime = 0;
    }
  }

  ngAfterViewInit(): void {
    if (!this.isPreviewMode && !this.isComplete) {
      this.lockPlaybackRate();
    }
  }

  // ── Video enforcement handlers ───────────────────────────────────

  /**
   * Called on every `timeupdate` event from the <video>.
   * Advances `maxAllowedTime` as the user watches naturally.
   */
  onTimeUpdate(): void {
    if (this.isPreviewMode || this.isComplete) return;
    
    const video = this.videoPlayerRef?.nativeElement;
    if (!video || video.seeking) return;
    
    if (video.currentTime > this.maxAllowedTime) {
      // Natural playback advances in small increments (usually ~0.25s).
      // If the jump is larger than 1 second, it's an uncaptured seek/skip.
      if (video.currentTime - this.maxAllowedTime <= 1.0) {
        this.maxAllowedTime = video.currentTime;
      } else {
        // Snap back to the furthest allowed point
        video.currentTime = this.maxAllowedTime;
      }
    }
  }

  /**
   * Called on the `seeking` event from the <video>.
   * If the user tries to seek past the furthest naturally-watched point,
   * snap them back. Rewinding is always allowed.
   */
  onSeeking(): void {
    if (this.isPreviewMode || this.isComplete) return;

    const video = this.videoPlayerRef?.nativeElement;
    if (!video) return;
    
    // Prevent seeking ahead of maxAllowedTime
    if (video.currentTime > this.maxAllowedTime) {
      video.currentTime = this.maxAllowedTime;
    }
  }

  /**
   * Called when the video's `ended` event fires.
   * Emits videoEnded so the parent can unlock "Mark Complete".
   */
  onVideoEnded(): void {
    this.videoEnded.emit();
  }

  /**
   * Called on the `ratechange` event from the <video>.
   * Forces the playback rate back to 1× to prevent speed manipulation.
   */
  onRateChange(): void {
    if (this.isPreviewMode || this.isComplete) return;

    const video = this.videoPlayerRef?.nativeElement;
    if (!video) return;
    if (video.playbackRate !== 1) {
      video.playbackRate = 1;
    }
  }

  /**
   * Whether the current lesson is a native video (type 0) that still
   * needs to be watched before the user can proceed.
   */
  get isVideoLocked(): boolean {
    return !!this.lesson && this.lesson.type === 0 && !this.videoFullyWatched && !this.isPreviewMode && !this.isComplete;
  }

  /**
   * Locks the playback rate on the current <video> element.
   * @private
   */
  private lockPlaybackRate(): void {
    const video = this.videoPlayerRef?.nativeElement;
    if (video) video.playbackRate = 1;
  }

  /**
   * Evaluates if the lesson has a valid YouTube link and parses its ID,
   * returning a sanitized URL formatted for a responsive iframe embedded player.
   *
   * @param lesson - The lesson information containing the URL.
   * @returns A trusted SafeResourceUrl object if valid, or null.
   */
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

  /**
   * Formats the media source URL depending on whether the lesson is an external hyperlink
   * (type 3 or http(s) prefixed) or an uploaded file stored on the local media server.
   *
   * @param lesson - The lesson object.
   * @returns The fully-formed media path string, or null.
   */
  getMediaUrl(lesson: LessonResponseDTO | null): string | null {
    if (!lesson || !lesson.videoUrl) return null;
    
    // Type 3 is Link (URL), return as-is
    if (lesson.type === 3) return lesson.videoUrl;
    
    // External links (just in case)
    if (lesson.videoUrl.startsWith('http')) return lesson.videoUrl;
    
    // Prepend BASE_URL for uploaded files
    return `${BASE_URL}/${lesson.videoUrl.replace(/^\//, '')}`;
  }

  /**
   * Gets the fully resolved course cover image URL.
   *
   * @returns The absolute URL to the course cover image, or an empty string.
   */
  getCoursePictureUrl(): string {
    if (!this.course || !this.course.pictureUrl) return '';
    if (this.course.pictureUrl.startsWith('http')) return this.course.pictureUrl;
    return `${BASE_URL}/${this.course.pictureUrl.replace(/^\//, '')}`;
  }
}
