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
