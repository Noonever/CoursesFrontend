import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import type { CourseDemo } from "~/types/course";

import { getCourseDemo } from "~/fetchers/course";

import styles from "~/styles/course-demo.css";

export function links() {
    return [{ rel: "stylesheet", href: styles }];
}

export async function loader(request: LoaderFunctionArgs): Promise<CourseDemo> {
    const courseId = request.params.courseId
    if (!courseId) {
        throw new Error("Course ID is required")
    }
    const courseDemo = await getCourseDemo(courseId)
    return courseDemo
}

export default function Course() {
    const courseDemo = useLoaderData<typeof loader>();
    const navigate = useNavigate();

    function handleLearnClick() {
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
                <button onClick={handleExcludeClick} className="course-control" id="exclude">Exclude me</button>
            </div>
            <div className="info-container">
                <p>{courseDemo.info}</p>
            </div>
        </>
    );
}
