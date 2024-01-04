export interface CourseProgression {
    userId: string;
    courseId: string;
    lastViewedSubchapter: number;
    completedSubchapters: number[];
    isCompleted: boolean;
    isArchived: boolean;
    assignedBy: string | null;
}
