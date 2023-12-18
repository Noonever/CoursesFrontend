import client from "./client";

export async function getUserById(id: string): Promise<any> {
    const { data } = await client.get(`/user?id=${id}`);
    return data;
}
