import client from "./client";
import type { User } from "~/types/user";

export async function getUserById(id: string): Promise<User | null> {
    try {
        const { data } = await client.get(`/user`, { params: { id } });
        return data;
    } catch (error) {
        return null
    }
}

export async function getUsers(): Promise<User[]> {
    try {
        const { data } = await client.get(`/users`);
        return data.items;
    } catch (error) {
        return []
    }
}

export async function setUserBoss(userId: string, bossId: string | null) {
    try {
        const { data } = await client.patch("/user", { id: userId, bossId });
        return data;
    } catch (error) {
        return null
    }
}

export async function getUserSubordinates(userId: string): Promise<User[]> {
    try {
        const { data } = await client.get("/user/subordinates", { params: { userId } });
        return data.items;
    } catch (error) {
        return []
    }
}
