import client from "./client";
import type { Course, CourseCard, CourseDemo } from "~/types/course";


export async function getCourse(id: string): Promise<Course | null> {
    try {
        const { data } = await client.get(`/course`, { params: { id } });
        return data;
    } catch (error) {
        return null
    }
}

export async function getCourseCards(ids?: string[]): Promise<CourseCard[]> {
    try {
        const { data } = await client.get("/course/cards", { params: { 
            ids: ids?.join(",")
         } });
        return data.items;
    } catch (error) {
        return []
    }
}

export async function getCourseDemo(courseId: string, userId: string): Promise<{ preview: CourseDemo, isStudying: boolean }> {
    const { data } = await client.get(`/course/demo`, { params: { courseId, userId } });
    return data;
}
