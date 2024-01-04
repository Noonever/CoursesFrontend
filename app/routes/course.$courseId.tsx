import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate, useRevalidator } from "@remix-run/react";
import type { CourseDemo } from "~/types/course";

import { getCourseDemo } from "~/fetchers/course";

import styles from "~/styles/course-demo.css";
import userStyles from "~/styles/users.css";

import { getUserId } from "~/utils/session.server";
import { getAssignedProgressions, leaveCourse, signUpForCourse } from "~/fetchers/learn";
import { getUserSubordinates } from "~/fetchers/user";
import type { User } from "~/types/user";
import { useState } from "react";
import type { CourseProgression } from "~/types/courseProgression";

type AssignedUser = {
    user: User,
    assigned: boolean
}

export function links() {
    return [
        { rel: "stylesheet", href: styles },
        { rel: "stylesheet", href: userStyles }
    ];
}

export async function loader({ request }: LoaderFunctionArgs): Promise<{
    userId: string | undefined,
    courseDemo: CourseDemo,
    isStudying: boolean,
    userSubordinates: User[],
    assignedProgressions: CourseProgression[]
}> {
    const userId = await getUserId(request);
    const courseId = request.url.split('/').pop();
    let userSubordinates: User[] = [];
    let assignedProgressions = [];
    if (!courseId) {
        throw new Error("Course ID is required")
    }
    if (userId) {
        userSubordinates = await getUserSubordinates(userId);
        assignedProgressions = await getAssignedProgressions(courseId, userId);
    }
    const { preview, isStudying } = await getCourseDemo(courseId, userId || null);
    console.log(preview)
    return { userId, courseDemo: preview, isStudying, userSubordinates, assignedProgressions };
}

export default function Course() {
    const { userId, courseDemo, isStudying, userSubordinates, assignedProgressions } = useLoaderData<typeof loader>();
    const navigate = useNavigate();
    const revalidator = useRevalidator();
    const [modalIsOpened, setModalIsOpened] = useState(false);
    const [modalSearchText, setModalSearchText] = useState("");
    const [modalTab, setModalTab] = useState<"allUsers" | "assigned">("assigned");

    async function handleLearnClick() {
        if (!userId) {
            alert("Please sign in first");
            return
        }
        if (!isStudying) {
            await signUpForCourse(userId, courseDemo.id);
        }
        return navigate("/learn/" + courseDemo.id);
    }

    async function handleExcludeClick() {
        if (userId) {
            await leaveCourse(userId, courseDemo.id);
        }
        revalidator.revalidate();
    }

    async function handleAssignClick(subordinateId: string) {
        if (!userId) {
            return
        }
        if (assignedProgressions.map(progression => progression.userId).includes(subordinateId)) {
            return
        } // TODO handle already assigned
        await signUpForCourse(subordinateId, courseDemo.id, userId);
    }

    function renderModalSubordinate(subordinate: User, assigned: boolean) {
        return (
            <div key={subordinate.id} className="modal-user-block">
                <div className="user-profile">
                    <img alt="Profile" className="profile" src={subordinate.imageUrl} />
                    <div className="user-info">
                        <span className="user-names">{subordinate.firstName}</span>
                        <span className="user-names">{subordinate.lastName}</span>
                    </div>
                </div>
                <span className="modal-user-email">{subordinate.email}</span>
                <svg cursor={"pointer"} onClick={() => handleAssignClick(subordinate.id)} fill={assigned ? "rgb(255, 120, 108)" : "black"} height="40px" width="40px" xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 490 490">
                    <g>
                        <path d="M463.648,0H26.353C11.799,0,0,12.09,0,27.003v329.454c0,14.914,11.799,27.004,26.353,27.004h50.82L45.217,490
		l149.871-102.284c4.294-2.887,9.319-4.425,14.456-4.425h254.105c14.554,0,26.352-12.09,26.352-27.003V27.003
		C490,12.09,478.202,0,463.648,0z M459.375,352.666H209.543c-11.259,0-22.166,3.332-31.719,9.754l-78.421,53.52l7.103-23.68
		l11.826-39.423h-41.16H30.625V30.625h428.75V352.666z"/>
                        <path d="M245,303.932c23.237-12.295,46.297-16.393,66.714-16.393c40.835,0,71.099,16.393,71.099,16.393V96.541
		c-23.034-12.42-46.072-16.555-66.532-16.555C275.534,79.987,245,96.38,245,96.38s-30.54-16.391-71.279-16.393
		c-20.464-0.001-43.493,4.133-66.532,16.555v207.391c0,0,30.27-16.393,71.099-16.393C198.706,287.539,221.759,291.636,245,303.932z
		 M352.188,116.457v144.795c-11.846-2.533-25.532-4.337-40.474-4.337c-17.766,0-34.954,2.596-51.406,7.677V122.969
		c4.546-2.181,27.279-12.357,55.972-12.357C328.819,110.612,340.838,112.573,352.188,116.457z M137.813,116.457
		c11.351-3.885,23.368-5.846,35.906-5.845c29.059,0.002,51.96,10.415,55.964,12.348v141.628
		c-16.448-5.079-33.633-7.673-51.396-7.673c-14.942,0-28.627,1.805-40.474,4.338V116.457z"/>
                    </g>
                </svg>
            </div>
        )
    }

    function renderModalSubordinates(subordinates: AssignedUser[]) {
        const getSearchString = (user: User) => `${user.firstName} ${user.lastName} ${user.email}`
        const searched = subordinates.filter(user => getSearchString(user.user).includes(modalSearchText.toLowerCase()))
        return (
            <div className="modal-users">
                {searched.map(user => renderModalSubordinate(user.user, user.assigned))}
            </div>
        )
    }

    function renderModal() {
        if (!userSubordinates) {
            return
        }

        const assignedSubordinatesIds = assignedProgressions.map(progression => progression.userId)
        const assignedSubordinates = userSubordinates.filter(user => assignedSubordinatesIds.includes(user.id))

        const assignedSubordinatesForCourse = assignedSubordinates.map(user => ({ user, assigned: assignedSubordinatesIds.includes(user.id) }))
        const allSubordinatesForCourse = userSubordinates.map(user => ({ user, assigned: assignedSubordinatesIds.includes(user.id) }))

        return (
            <div onClick={() => setModalIsOpened(false)} className="modal-overlay">
                <div onClick={(e) => e.stopPropagation()} className="modal">

                    <div className="modal-header">
                        <div style={{ width: "100%", cursor: 'default' }} className="user-block">
                            <span className="user-email">Assign subordinates to course {courseDemo.title}</span>
                        </div>
                        <div className="close-button" onClick={() => setModalIsOpened(false)}>X</div>
                    </div>

                    <div className="modal-body">
                        <div className="modal-section">

                            <div className="tabs" style={{ marginTop: "10px", width: 'calc(50% - 10px)' }}>
                                <div className={`tab ${modalTab === "assigned" ? "active" : ""}`} onClick={() => setModalTab("assigned")}>Assigned for course</div>
                                <div className={`tab ${modalTab === "allUsers" ? "active" : ""}`} onClick={() => setModalTab("allUsers")}>All subordinates</div>
                            </div>

                            <div className="search" style={{ marginTop: '30px' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="">
                                    <path fillRule="evenodd" d="M17.32 15.906 21.414 20 20 21.414l-4.094-4.094a8 8 0 1 1 1.414-1.414zM11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"></path>
                                </svg>
                                <input value={modalSearchText} onChange={e => setModalSearchText(e.target.value)} className="search" type="text" placeholder="Search" />
                            </div>

                        </div>
                        {renderModalSubordinates(modalTab === "allUsers" ? allSubordinatesForCourse : assignedSubordinatesForCourse)}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            {modalIsOpened && renderModal()}
            <div className="course-header">
                <span className="course-title">{courseDemo.title}</span>
            </div>
            <div className="course-tags">
                {courseDemo.tags.map(tag => <span key={tag.value} className="course-tag">{tag.value} </span>)}
            </div>
            <div className="course-controls">
                <button onClick={handleLearnClick} className="course-control" id="learn">Study</button>
                {isStudying && <button onClick={handleExcludeClick} className="course-control" id="exclude">Exclude me</button>}
                {userSubordinates.length > 0 && <button onClick={() => setModalIsOpened(true)} className="course-control" id="learn">Assign subordinates</button>}
            </div>
            <div className="info-container">
                <div className="info-text" dangerouslySetInnerHTML={{ __html: courseDemo.previewHtml }}>

                </div>
            </div>
        </>
    );
}
