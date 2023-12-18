import { createUserSession } from "~/utils/session.server";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
    console.log(request)
    const userId = "0";
    return createUserSession({
        request,
        userId,
    });
}
