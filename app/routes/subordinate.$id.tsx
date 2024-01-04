import { redirect, type LoaderFunctionArgs } from "@remix-run/node"
import { getUserById } from "~/fetchers/user"
import { requireUserId } from "~/utils/session.server"

import userStyles from "~/styles/users.css"
import myLearningStyles from "~/styles/my-learning.css"

import type { User } from "~/types/user"
import { useLoaderData, useNavigate } from "@remix-run/react"
import type { CourseCard } from "~/types/course"
import { getProgressions } from "~/fetchers/learn"
import { getCourseCards } from "~/fetchers/course"
import { useState } from "react"

type userProgression = {
    courseCard: CourseCard,
    percentage: number,
    state: "active" | "completed" | "archived",
}

export function links() {
    return [
        { rel: "stylesheet", href: userStyles },
        { rel: "stylesheet", href: myLearningStyles }
    ]
}

export async function loader({ request, params }: LoaderFunctionArgs): Promise<{
    subordinate: User
    subordinateProgressions: userProgression[]
}> {
    const userId = await requireUserId(request)
    const subordinateId = params.id
    if (!subordinateId) throw redirect("/subordinates")
    const subordinate = await getUserById(subordinateId)
    if (!subordinate) throw redirect("/subordinates")
    if (subordinate.bossId !== userId) {
        throw redirect("/subordinates")
    }

    const subordinateProgressions = await getProgressions(subordinateId);
    if (subordinateProgressions.length === 0) {
        return { subordinate, subordinateProgressions: [] };
    }
    const subordinateCoursesIds = subordinateProgressions.map((progression) => progression.courseId);
    const subordinateCourseCards = await getCourseCards(subordinateCoursesIds);

    const userProgressions = subordinateCourseCards.map(courseCard => {
        const progression = subordinateProgressions.find(progression => progression.courseId === courseCard.id);
        const percentage = progression ? Math.round((progression.completedSubchapters.length / courseCard.totalSubchapters) * 100) : 0;
        let state: "active" | "completed" | "archived" = 'active';
        if (progression?.isCompleted) {
            state = "completed";
        } else if (progression?.isArchived) {
            state = "archived";
        }
        return { courseCard, percentage, state };
    });
    return { subordinate, subordinateProgressions: userProgressions };
}

export default function Subordinate() {
    const navigate = useNavigate()
    const { subordinate, subordinateProgressions } = useLoaderData<typeof loader>()
    const [searchText, setSearchText] = useState("");
    const [currentTab, setCurrentTab] = useState<"active" | "completed" | "archived">("active");

    const currentProgressions = subordinateProgressions.filter((userCourse) => userCourse.state === currentTab);
    const searched = currentProgressions.filter((userCourse) => userCourse.courseCard.title.toLowerCase().includes(searchText.toLowerCase()));

    function renderUser(user: User) {
        return (
            <div key={user.id} className="user-block" style={{ cursor: "default", marginTop: "20px" }}>
                <div className="user-profile">
                    <img alt="Profile" className="profile" src={user.imageUrl} />
                    <div className="user-info">
                        <span className="user-names">{user.firstName}</span>
                        <span className="user-names">{user.lastName}</span>
                    </div>
                </div>
                <span className="user-email">{user.email}</span>
            </div>
        )
    }

    function renderCourseProgression(course: CourseCard, percentage: number) {

        return (
            <div className="progression-wrapper">
                <div className="progression">
                    <div className="progression-image-container">

                    </div>

                    <div className="progression-info">

                        <span className="course-title" onClick={() => navigate(`/learn/${course.id}`)}>{course.title}</span>

                        <div className="course-tags">
                            {course.tags.map((tag, index) => (
                                <span className="course-tag" key={tag.value}>{"#" + tag.value + " "}</span>
                            ))}<br></br>
                        </div>

                        <div className="progress-container">
                            <span className="progress-text">{percentage}% completed</span>
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
                            </div>
                            <div className="buttons">
                                <button className="learn button" onClick={() => navigate(`/course/${course.id}`)}>Check course</button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            <span className="section-title">Subordinate profile</span>
            {renderUser(subordinate)}
            <div className="tabs" style={{ marginTop: "40px" }}>
                <div className={`tab ${currentTab === "active" ? "active" : ""}`} onClick={() => setCurrentTab("active")}>Active</div>
                <div className={`tab ${currentTab === "completed" ? "active" : ""}`} onClick={() => setCurrentTab("completed")}>Completed</div>
                <div className={`tab ${currentTab === "archived" ? "active" : ""}`} onClick={() => setCurrentTab("archived")}>Archived</div>
            </div>
            <div className="search" style={{ marginTop: "20px" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="">
                    <path fill-rule="evenodd" d="M17.32 15.906 21.414 20 20 21.414l-4.094-4.094a8 8 0 1 1 1.414-1.414zM11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"></path>
                </svg>
                <input value={searchText} onChange={e => setSearchText(e.target.value)} className="search" type="text" placeholder="Search" />
            </div>
            {searched.map((userCourse) => renderCourseProgression(userCourse.courseCard, userCourse.percentage))}
        </>
    )
}