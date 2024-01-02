import client from "~/fetchers/client";

export async function uploadFile(file: File) {
    try {
        let formData = new FormData();
        formData.append("file", file);
        console.log(file)
        const { data } = await client.post("/file", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return data;
    } catch (error) {
        return null
    }
}

