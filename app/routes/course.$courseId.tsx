import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import type { CourseDemo } from "~/types/course";

import { getCourseDemo } from "~/fetchers/course";

import styles from "~/styles/course-demo.css";
import { requireUserId } from "~/utils/session.server";
import { signUpForCourse } from "~/fetchers/learn";

export function links() {
    return [{ rel: "stylesheet", href: styles }];
}

export async function loader({request}: LoaderFunctionArgs): Promise<{userId: string, courseDemo: CourseDemo, isStudying: boolean}> {
    const userId = await requireUserId(request)
    const courseId = request.url.split('/').pop();
    if (!courseId) {
        throw new Error("Course ID is required")
    }
    const { preview, isStudying} = await getCourseDemo(courseId, userId);
    return {userId, courseDemo: preview, isStudying};
}

export default function Course() {
    const { userId, courseDemo, isStudying }= useLoaderData<typeof loader>();
    const navigate = useNavigate();

    async function handleLearnClick() {
        if (!isStudying) {
            await signUpForCourse(userId, courseDemo.id);
        }
        navigate("/learn/" + courseDemo.id);
    }

    function handleExcludeClick() {
        navigate("/exclude/" + courseDemo.id);
    }

    return (
        <>
            <div className="course-header">
                <span className="course-title">{courseDemo.title}</span>
            </div>
            <div className="course-tags">
                {courseDemo.tags.map(tag => <span key={tag.value} className="course-tag">{tag.value} </span>)}
            </div>
            <div className="course-controls">
                <button onClick={handleLearnClick} className="course-control" id="learn">Study</button>
                {!isStudying && <button onClick={handleExcludeClick} className="course-control" id="exclude">Exclude me</button>}
            </div>
            <div className="info-container">
                <p>{courseDemo.info}</p>
            </div>
        </>
    );
}
