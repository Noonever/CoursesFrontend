import client from "./client";
import type { Course, CourseCard, CourseDemo } from "~/types/course";

export async function getCourse(id: string): Promise<Course> {
    const { data } = await client.get(`/course`, { params: { id } });
    return data;
}

export async function getCourseCards(ids?: string[]): Promise<CourseCard[]> {
    const { data } = await client.get("/course/get-cards", { params: { ids } });
    return data;
}

export async function getCourseDemo(id: string): Promise<CourseDemo> {
    const { data } = await client.get(`/course-demo`, { params: { id } });
    return data;
}