import client from "./client";
import type { Course, CourseCard, CourseDemo } from "~/types/course";

export async function getCourse(id: string): Promise<Course> {
    const { data } = await client.get(`/course/${id}`);
    return data;
}

export async function getCourseCards(ids?: string[] ): Promise<CourseCard[]> {
    const { data } = await client.post("/course/get-cards", { ids });
    return data;
}

export async function getCourseDemo(id: string): Promise<CourseDemo> {
    const { data } = await client.get(`/course-demo/${id}`);
    return data;
}
