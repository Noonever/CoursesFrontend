import client from "./client";
import type { CourseProgression } from "~/types/courseProgression";

export async function signUpForCourse(userId: string, courseId: string) {
    const { data } = await client.post("/learn/sign-up-for-course", { userId, courseId });
    return data;
}

export async function getProgression(userId: string, courseId: string): Promise<CourseProgression> {
    const { data } = await client.get("/learn/get-progression", { params: { userId, courseId } });
    return data;
}

export async function getProgressions(userId: string): Promise<CourseProgression[]> {
    const { data } = await client.get("/learn/get-progressions", { params: { userId } });
    return data;
}

export async function setLastViewedSubchapter(userId: string, courseId: string, subchapterId: number) {
    const { data } = await client.put("/learn/set-last-viewed-subchapter", { userId, courseId, subchapterId });
    return data;
}

export async function setSubchapterCompleted(userId: string, courseId: string, subchapterId: number) {
    const { data } = await client.put("/learn/set-subchapter-completed", { userId, courseId, subchapterId });
    return data;
}

export async function submitTest(testId: string, answers: number[]): Promise<boolean> {
    const { data } = await client.post("/learn/verify-test", { testId, answers });
    return data;
}