export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'executive';

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  duration_minutes: number;
  content_markdown: string;
  video_url?: string;
  cave_reference?: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  level: CourseLevel;
  duration_hours: number;
  instructor_name: string;
  instructor_title: string;
  featured_image: string;
  description: string;
  modules_count: number;
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  progress_percent: number;
  status: 'enrolled' | 'completed';
  enrolled_at: string;
  completed_at?: string;
}

export interface Certificate {
  id: string;
  certificate_code: string;
  user_id: string;
  user_name: string;
  course_id: string;
  course_title: string;
  issued_at: string;
  digital_signature: string;
}
