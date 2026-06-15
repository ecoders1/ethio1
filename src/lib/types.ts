export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  university?: string;
  student_id?: string;
  department_id?: string;
  avatar_url?: string;
  role: "student" | "admin" | "super_admin";
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  icon: string;
  category: string;
  color: string;
  description?: string;
  exam_count?: number;
  question_count?: number;
  is_active: boolean;
  created_at: string;
}

export interface Exam {
  id: string;
  title: string;
  department_id: string;
  department?: Department;
  description?: string;
  duration_minutes: number;
  question_count: number;
  passing_score: number;
  is_active: boolean;
  exam_type: "practice" | "mock" | "previous";
  year?: number;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  exam_id: string;
  question_text: string;
  question_type: "mcq" | "true_false";
  options?: string[];
  correct_answer: string | number;
  explanation?: string;
  marks: number;
  order_num: number;
}

export interface ExamResult {
  id: string;
  user_id: string;
  exam_id: string;
  exam?: Exam;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  score: number;
  percentage: number;
  passed: boolean;
  time_taken: number;
  answers: Record<string, string | number>;
  completed_at: string;
}

export interface Material {
  id: string;
  title: string;
  department_id?: string;
  department?: Department;
  file_url: string;
  file_type: "pdf" | "docx" | "ppt" | "xls" | "image" | "other";
  file_size: number;
  category: "notes" | "books" | "slides" | "past_exam" | "other";
  download_count: number;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  type: "exam_alert" | "result" | "department" | "general";
  is_read: boolean;
  created_at: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  user?: User;
  exam_id: string;
  exam?: Exam;
  certificate_number: string;
  issued_at: string;
  score: number;
}

export interface AdminStats {
  total_students: number;
  total_departments: number;
  total_exams: number;
  total_questions: number;
  total_results: number;
  active_users: number;
}
