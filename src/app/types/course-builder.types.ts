export const BASE_URL = 'http://localhost:5232';

export interface LessonResponseDTO {
  id: number;
  title: string;
  description: string | null;
  content: string | null;
  order: number;
  sectionId: number;
}

export interface SectionResponseDTO {
  id: number;
  title: string;
  description: string | null;
  order: number;
  courseId: number;
  lessons: LessonResponseDTO[];
}

export interface CourseResponseDTO {
  id: number;
  title: string;
  description: string | null;
  order: number;
  learningPathId: number;
  sections: SectionResponseDTO[];
}

export interface LearningPathResponseDto {
  id: number;
  title: string;
  description: string | null;
  courses: CourseResponseDTO[];
}
