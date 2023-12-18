import type Chapter from "./chapter";

interface CourseBase {
    id: string;
    title: string;
}

interface Tag {
    groupName: "difficulty" | "language" | "specification";
    value: string;
}

export interface CourseCard extends CourseBase {
    description: string
    tags: Tag[]
}

export interface CourseDemo extends CourseCard {
    info: string;
    goal: string;
}

export interface Course extends CourseCard {
    chapters: Chapter[];
}

