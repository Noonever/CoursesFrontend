export interface CourseProgression {
    userId: string;
    courseId: string;
    lastViewedSubchapter: number;
    completedSubchapters: number[];
    completionPercentage: number;
    isCompleted: boolean;
    isArchived: boolean;
}
