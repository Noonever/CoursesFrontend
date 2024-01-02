import { createCookieSessionStorage, redirect } from "@remix-run/node";

import type { User } from "~/types/user"
import { getUserById } from "~/fetchers/user";

const USER_SESSION_KEY = "userId";

const sessionStorage = createCookieSessionStorage({
    cookie: {
        name: "__session",
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secrets: ["lol"],
        //         secure: process.env.NODE_ENV === "production"
        secure: false,
    },
});

async function getSession(request: Request) {
    const cookie = request.headers.get("Cookie");
    return sessionStorage.getSession(cookie);
}

export async function createUserSession({
    request,
    userId: id,
}: {
    request: Request;
    userId: string;
}) {
    const session = await getSession(request);
    session.set(USER_SESSION_KEY, id);
    return redirect("/", {
        headers: {
            "Set-Cookie": await sessionStorage.commitSession(session, {
                maxAge: 60 * 60 * 24 * 7 // 7 days,
            }),
        },
    });
}

export async function getUserId(
    request: Request
): Promise<User["id"] | undefined> {
    const session = await getSession(request);
    const userId = session.get(USER_SESSION_KEY);
    return userId;
}

export async function getUser(request: Request) {
    const userId = await getUserId(request);
    if (userId === undefined) return null;
    const user = await getUserById(userId);
    if (user) return user;
    throw await logout(request);
}

export async function requireUserId(
    request: Request,
) {
    const userId = await getUserId(request);
    if (!userId) {
        throw redirect('/');
    }
    return userId;
}


export async function requireAdmin(
    request: Request
) {
    const userId = await requireUserId(request);
    const user = await getUserById(userId);
    if (!user?.isAdmin) {
        throw redirect('/');
    }
    return userId;
}


export async function logout(request: Request) {
    const session = await getSession(request);
    return redirect("/login", {
        headers: {
            "Set-Cookie": await sessionStorage.destroySession(session),
        },
    });
}
