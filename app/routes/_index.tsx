import styles from "~/styles/index.css";
import coursesStyles from "~/styles/courses.css";
import mainBackground from "~/media/img/main-bg.jpg";
import { useLoaderData, useNavigate } from "@remix-run/react";

import courseHeader1 from "~/media/img/zeros-ones.jpg";
import courseHeader2 from "~/media/img/zeros-ones-2.jpg";
import type { CourseCard } from "~/types/course";
import { getCourseCards } from "~/fetchers/course";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { getUser, requireUserId } from "~/utils/session.server";
import { getProgressions } from "~/fetchers/learn";

export function links() {
    return [{ rel: "stylesheet", href: styles }, { rel: "stylesheet", href: coursesStyles }];
}

type userProgression = {
    courseCard: CourseCard,
    percentage: number,
    state: "active" | "completed" | "archived",
}

export async function loader({ request }: LoaderFunctionArgs): Promise<{
    courseCards: CourseCard[],
    userProgressions: userProgression[],
}> {
    const courseCards = await getCourseCards();

    const user = await getUser(request);
    if (!user) {
        return { courseCards, userProgressions: [] };
    }
    const courseProgressions = await getProgressions(user.id);
    if (courseProgressions.length === 0) {
        return { courseCards, userProgressions: [] };
    }
    const userCoursesIds = courseProgressions.map((progression) => progression.courseId);
    const userCourseCards = await getCourseCards(userCoursesIds);

    const userProgressions = userCourseCards.map(courseCard => {
        const progression = courseProgressions.find(progression => progression.courseId === courseCard.id);
        const percentage = progression ? Math.round((progression.completedSubchapters.length / courseCard.totalSubchapters) * 100) : 0;
        let state: "active" | "completed" | "archived" = 'active';
        if (progression?.isCompleted) {
            state = "completed";
        } else if (progression?.isArchived) {
            state = "archived";
        }
        return { courseCard, percentage, state };
    });
    return { courseCards, userProgressions };
}

export default function Index() {
    const navigate = useNavigate();
    const { courseCards, userProgressions } = useLoaderData<typeof loader>();

    function splitCourseCardsIntoRows(courseCards: CourseCard[], rowSize: number) {
        const result = [];
        for (let i = 0; i < courseCards.length; i += rowSize) {
            const chunk = courseCards.slice(i, i + rowSize);
            result.push(chunk);
        }
        return result;
    }

    function getRandomElements(arr: any[], count: number) {
        if (!arr.length) {
            return [];
        }
        if (arr.length <= count) return arr;
        let shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
        while (i-- > min) {
            index = Math.floor((i + 1) * Math.random());
            temp = shuffled[i];
            shuffled[i] = shuffled[index];
            shuffled[index] = temp;
        }
        return shuffled.slice(min);
    }

    function renderCourseCard(courseCard: CourseCard, index: number) {
        const backgroundImage = index % 2 === 0 ? courseHeader1 : courseHeader2;
        return (
            <div className="card-container" onClick={() => navigate(`/course/${courseCard.id}`)}>
                <div className="card-header-container" style={
                    {
                        backgroundImage: `linear-gradient(90deg, rgba(213, 69, 75, 0.7) 0%, rgba(213, 100, 70, 0.5) 100%), url(${backgroundImage})`,
                    }
                }>
                    <div className="card-header">

                    </div>
                </div>
                <div className="card-body">
                    <div className="card-title-container">
                        <span className="card-title">{courseCard.title}</span>
                    </div>
                    <div className=" card-tags">
                        {courseCard.tags.map((tag, index) => (
                            <span className="card-tag" key={tag.value}>{"#" + tag.value + " "}</span>
                        ))}<br></br>
                    </div>
                    <div className="card-description-container">
                        <span className="card-description">{courseCard.description}</span>
                    </div>
                </div>
            </div>
        );
    }

    function renderCourseCardsRow() {
        const filteredCourseCards = getRandomElements(courseCards, 5);
        const chunkedCourseCards = splitCourseCardsIntoRows(filteredCourseCards, 5);
        return (
            <div className="course-cards-container" style={{ width: "100%", marginTop: "20px" }}>
                {chunkedCourseCards.map((chunk, index) => (
                    <div className="course-cards-row" style={{ width: "100%" }} key={index}>
                        {chunk.map((courseCard, index) => (
                            renderCourseCard(courseCard, index)
                        ))}
                    </div>
                ))}
            </div>
        )
    }

    function renderProgress() {

        const activeProgressions = userProgressions.filter((userCourse) => userCourse.state === "active");

        const progress = activeProgressions.slice(0, 3).map(({ courseCard, percentage }) => (
            <div onClick={() => navigate(`/learn/${courseCard.id}`)} key={courseCard.id} className="progress">
                <span className="progress-course-title">{courseCard.title}</span>
                <div className="progress-stats">
                    <span className="progress-text">{percentage}%</span>
                    <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
                    </div>
                </div>
            </div>
        ))

        return (
            <div className="progress-container">
                <span className="progress-title">My progress</span>
                {activeProgressions.length === 0 && <span className="progress-text">You have no active courses</span>}
                {progress}
            </div>
        )
    }

    return (
        <>
            <span className="section-title">Home</span>
            <div className="header">
                <div className="banner" style={{ cursor: "pointer" }} onClick={() => navigate("/courses")}>
                    <div className="inner cover">
                        <span className="banner-main-text">
                            Just keep going!
                        </span>
                        <span className="banner-sub-text">
                            Learn something new every day
                        </span>
                    </div>
                    <div className="inner image-container">
                        <img className="bg" src={mainBackground} alt="qwe" />
                    </div>
                </div>
                {renderProgress()}
            </div>
            <div className="search" style={{ cursor: "pointer" }} onClick={() => navigate("/courses")}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="">
                    <path fill-rule="evenodd" d="M17.32 15.906 21.414 20 20 21.414l-4.094-4.094a8 8 0 1 1 1.414-1.414zM11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"></path>
                </svg>
                <input style={{ cursor: "pointer" }} className="search" type="text" placeholder="Search courses, materials and more" />
            </div>
            <div className="recommended">
                <span className="main-title">Recommended courses</span>
                {renderCourseCardsRow()}
            </div>
            <div className="recommended">
                <span className="main-title">Top courses of the week</span>
                {renderCourseCardsRow()}
            </div>
        </>
    )
}