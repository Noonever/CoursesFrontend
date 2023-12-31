import type { Chapter }from "./chapter";

interface CourseBase {
    id: string;
    title: string;
}

export interface Tag {
    groupName: "difficulty" | "language" | "specification";
    value: string;
}

export interface CourseCard extends CourseBase {
    description: string;
    totalSubchapters: number;
    tags: Tag[]
}

export interface CourseDemo extends CourseBase {
    previewHtml: string;
    tags: Tag[]
}

export interface Course extends CourseBase {
    chapters: Chapter[];
}

export interface CourseCreateSchema {
    title: string;
    tags: Tag[];
    description: string;
    previewHtml: string;
    estimation: number;
    chapters: Chapter[];
}
