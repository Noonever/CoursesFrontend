import { useState } from "react";
import type { CourseCard } from "~/types/course";

import styles from "~/styles/my-learning.css";
import { useLoaderData, useNavigate, useRevalidator } from "@remix-run/react";
import { getProgressions, leaveCourse } from "~/fetchers/learn";
import { getCourseCards } from "~/fetchers/course";
import { requireUserId } from "~/utils/session.server";
import type { LoaderFunctionArgs } from "@remix-run/node";

export function links() {
    return [{ rel: "stylesheet", href: styles }];
}

export async function loader({request}: LoaderFunctionArgs): Promise<{ userId: string, data: { courseCard: CourseCard, percentage: number }[] }> {
    const userId = await requireUserId(request);
    const courseProgressions = await getProgressions(userId);
    const userCoursesIds = courseProgressions.map((progression) => progression.courseId);
    const userCourseCards = await getCourseCards(userCoursesIds);
    const mergedData = userCourseCards.map(courseCard => {
        const progression = courseProgressions.find(progression => progression.courseId === courseCard.id);
        const percentage = progression ? progression.completedSubchapters.length / progression.totalChapters : 0;
        return { courseCard, percentage };
    });
    return { userId, data: mergedData };
}

export default function MyLearning() {
    const navigate = useNavigate();
    const { userId, data } = useLoaderData<typeof loader>();
    const [searchText, setSearchText] = useState("");
    const revalidator = useRevalidator();

    const filteredData = data.filter((userCourse) => userCourse.courseCard.title.toLowerCase().includes(searchText.toLowerCase()));

    function renderCourseProgression(course: CourseCard, percentage: number) {

        async function handleLeaveCourse() {
            await leaveCourse(userId, course.id);
            revalidator.revalidate();
        }

        return (
            <div className="progression-wrapper">
                <div className="progression">
                    <div className="progression-image-container">

                    </div>

                    <div className="progression-info">

                        <span className="course-title" onClick={() => navigate(`/learn/${course.id}`)}>{course.title}</span>

                        <div className="course-tags">
                            {course.tags.map((tag, index) => (
                                <span onClick={() => navigate(`/courses/?tag=${tag.value}`)} className="course-tag" key={tag.value}>{"#" + tag.value + " "}</span>
                            ))}<br></br>
                        </div>

                        <div className="progress-container">
                            <span className="progress-text">{percentage}% completed</span>
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
                            </div>
                            <div className="buttons">
                                <button className="exclude button" onClick={handleLeaveCourse} >Leave course</button>
                                <button className="learn button" onClick={() => navigate(`/learn/${course.id}`)}>Continue learning</button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        )
    }
    
    return (
        <>
            <span className="section-title">My Learning</span>
            <div className="search">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="">
                    <path fill-rule="evenodd" d="M17.32 15.906 21.414 20 20 21.414l-4.094-4.094a8 8 0 1 1 1.414-1.414zM11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"></path>
                </svg>
                <input value={searchText} onChange={e => setSearchText(e.target.value)} className="search" type="text" placeholder="Search" />
            </div>
            {filteredData.map((userCourse) => renderCourseProgression(userCourse.courseCard, userCourse.percentage))}
        </>
    );
}