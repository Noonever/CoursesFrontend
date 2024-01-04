import client from "./client";
import type { CourseProgression } from "~/types/courseProgression";

export async function signUpForCourse(userId: string, courseId: string, assignedBy?: string | null) {
    const { data } = await client.post("/learn/sign-up", { userId, courseId, assignedBy });
    return data;
}

export async function getAssignedProgressions(courseId: string, assignedBy: string) {
    const { data } = await client.get("/learn/assigned", { params: { courseId, assignedBy } });
    return data.items;
}

export async function leaveCourse(userId: string, courseId: string) {
    const { data } = await client.post("/learn/sign-out", { userId, courseId });
    return data;
}

export async function getProgression(userId: string, courseId: string): Promise<CourseProgression> {
    const { data } = await client.get("/learn/progression", { params: { userId, courseId } });
    return data;
}

export async function getProgressions(userId: string): Promise<CourseProgression[]> {
    const { data } = await client.get("/learn/progressions", { params: { userId } });
    return data.items;
}

export async function setLastViewedSubchapter(userId: string, courseId: string, subchapterId: number) {
    const { data } = await client.patch("/learn/update-progression", { userId, courseId, lastViewedSubchapter: subchapterId });
    return data;
}

export async function setSubchapterCompleted(userId: string, courseId: string, subchapterId: number) {
    const { data } = await client.patch("/learn/update-progression", { userId, courseId, completedSubchapters: [subchapterId] });
    return data;
}

export async function finishCourse(userId: string, courseId: string) {
    const { data } = await client.patch("/learn/update-progression", { userId, courseId, isCompleted: true });
    return data;
}

export async function submitTest(courseId: string, subchapterId: number, answers: number[][]) {
    const { data } = await client.post("/learn/submit-test", { courseId, subchapterId, answers });
    return data;
}
