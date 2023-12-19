import { createUserSession } from "~/utils/session.server";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
    const userId = request.url.split('=').pop();
    if(!userId) return null;
    return createUserSession({
        request,
        userId,
    });
}
