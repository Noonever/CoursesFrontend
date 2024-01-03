import client from "~/fetchers/client";

export async function uploadFile(file: File) {
    try {
        let formData = new FormData();
        formData.append("file", file);
        console.log(file)
        const response = await client.post("/file", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            timeout: 120000
        });
        return response;
    } catch (error) {
        return null
    }
}

