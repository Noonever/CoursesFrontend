import client from "./client";
import type { Course, CourseCard, CourseCreateSchema, CourseDemo } from "~/types/course";

export async function createCourse(course: {}) {
    try {
        const { data } = await client.post("/course", course);
        return data;
    } catch (error) {
        return null
    }
}

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
    console.log(data)
    return data;
}


