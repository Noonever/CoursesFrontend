import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";

import { useEffect, useState } from "react";
import type { Course } from "~/types/course";
import type { Info, Question, Test, Video, SubChapter, Content } from "~/types/chapter";
import type { CourseProgression } from "~/types/courseProgression";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import styles from "~/styles/learn.css";
import checkboxStyles from "~/styles/cool-checkbox.css";

import { getProgression, submitTest, setLastViewedSubchapter, setSubchapterCompleted } from "~/fetchers/learn";
import { getCourse } from "~/fetchers/course";
import { requireUserId } from "~/utils/session.server";

import useUserWatched from "~/hooks/useUserWatched";

const percentageToComplete = 100

export function links() {
    return [{ rel: "stylesheet", href: styles }, { rel: "stylesheet", href: checkboxStyles }];
}

export async function loader({ request }: LoaderFunctionArgs): Promise<{
    userId: string,
    course: Course,
    progression: CourseProgression
}> {
    const userId = await requireUserId(request);
    const courseId = request.url.split('/').pop();
    if (!courseId) {
        throw new Error("Course ID is required")
    }

    const course = await getCourse(courseId);
    if (course === null) {
        throw new Error("Course not found")
    }
    const progression = await getProgression(userId, courseId);

    return { userId, course, progression };
}

export default function Learn() {
    const { userId, course, progression } = useLoaderData<typeof loader>();

    const [expandedChapterIds, setExpandedChapterIds] = useState<number[]>([0]);
    const [currentSubChapterId, setCurrentSubChapterId] = useState<number>(progression.lastViewedSubchapter);
    const currentSubchapter = course.chapters.find(chapter => chapter.subChapters.some(subchapter => subchapter.index === currentSubChapterId))?.subChapters.find(subchapter => subchapter.index === currentSubChapterId) as SubChapter;
    const [completedSubchapters, setCompletedSubchapters] = useState<number[]>(progression.completedSubchapters);
    const lastSubchapterIndex = course.chapters[course.chapters.length - 1].subChapters[course.chapters[course.chapters.length - 1].subChapters.length - 1].index;

    const [testAnswers, setTestAnswers] = useState<Record<number, number[]>>(getEmptyTestAnswers());
    const [transition, setTransition] = useState(false);
    const [modalIsOpened, setModalIsOpened] = useState(false);
    const [modalText, setModalText] = useState<string>("");
    const [ref, isVisible] = useUserWatched<HTMLDivElement>();

    useEffect(() => {
        if (isVisible) {
            if (currentSubchapter.content.type !== 'test') {
                handleCompleteSubchapter()
            }
        }
    }, [isVisible, currentSubchapter]);

    async function handleCompleteSubchapter() {
        if (completedSubchapters.includes(currentSubChapterId)) {
            return;
        }
        setCompletedSubchapters([...completedSubchapters, currentSubChapterId]);
        await setSubchapterCompleted(userId, course.id, currentSubChapterId);
    }

    async function handleChangeSubChapter(subChapterId: number) {
        setTransition(true); // Begin fade-out
        await setLastViewedSubchapter(userId, course.id, subChapterId);
        setTimeout(() => {
            const newSubchapter = course.chapters.find(chapter => chapter.subChapters.some(subchapter => subchapter.index === subChapterId))?.subChapters.find(subchapter => subchapter.index === subChapterId) as SubChapter;
            setCurrentSubChapterId(subChapterId);
            setTransition(false);
        }, 400); // Ensure this matches the duration of the opacity transition
    }

    function toggleModal(time: number, text: string) {
        setModalIsOpened(true);
        setModalText(text);
        setTimeout(() => {
            setModalIsOpened(false);
        }, time);
    }

    function getCompletionPercentage() {
        return Math.round((completedSubchapters.length / (lastSubchapterIndex + 1)) * 100);
    }

    function handleFinishCourse() {
        if (getCompletionPercentage() < percentageToComplete) {
            toggleModal(3000, "You must complete all chapters to finish the course");
            return;
        } else {
            toggleModal(3000, "Congratulations! You have completed the course!");
        }
    }

    function getEmptyTestAnswers() {
        const test = currentSubchapter.content.data as Test;
        const testLength = test.questions?.length ?? 0;
        const emptyTestAnswers: Record<number, number[]> = {};
        for (let i = 0; i < testLength; i++) {
            const questionType = test.questions[i].type;
            if (questionType === 'select-one') {
                emptyTestAnswers[i] = [0];
            }
            if (questionType === 'select-many') {
                emptyTestAnswers[i] = [];
            }
            if (questionType === 'compare') {
                const optionsLength = test.questions[i].options.length / 2;
                const optionsIds = [...Array(optionsLength).keys()];
                emptyTestAnswers[i] = optionsIds;
            }
        }
        return emptyTestAnswers;
    }

    function renderNavigation() {

        const toggleChapter = (chapterId: number) => {
            if (expandedChapterIds.includes(chapterId)) {
                setExpandedChapterIds(expandedChapterIds.filter(id => id !== chapterId));
            } else {
                setExpandedChapterIds([...expandedChapterIds, chapterId]);
            }
        };

        return (
            <div className="navigation">
                <div className="navigation-header">
                    <span>Navigation</span>
                    <span>{getCompletionPercentage()}%</span>
                </div>
                <div className="navigation-content">
                    {course.chapters.map(chapter => (
                        <div key={chapter.index}>
                            <div className="navigation-chapter" onClick={() => toggleChapter(chapter.index)}>
                                {expandedChapterIds.includes(chapter.index) ? '▼ ' : '▶ '}
                                {chapter.title}
                            </div>
                            <div
                                className="subchapter-container"
                                style={{
                                    maxHeight: expandedChapterIds.includes(chapter.index) ? `${chapter.subChapters.length * 50}px` : "0px"
                                    /* Adjust 50px to the height of your subchapter items */
                                }}
                            >
                                {chapter.subChapters.map(subChapter => (
                                    <div key={subChapter.index}
                                        className={"navigation-subchapter" + (currentSubChapterId === subChapter.index ? " active" : "")}
                                        onClick={() => handleChangeSubChapter(subChapter.index)}>
                                        <span className="subchapter-title">{subChapter.title}</span>
                                        {completedSubchapters.includes(subChapter.index) ? '✓' : ''}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="navigation-footer">
                    {progression.isCompleted ? (
                        <div>
                            <span className="course-finish-text">Course Completed</span>
                        </div>
                    ) : (
                        <button onClick={handleFinishCourse} style={{ backgroundColor: getCompletionPercentage() > 99 ? '#e88080' : 'rgb(210, 210, 210)' }} className="course-finish">Finish Course</button>
                    )}
                </div>
            </div >
        );
    }

    function renderContent(content: Content) {

        function renderInfo(data: Info) {
            const htmlString = data.html;
            if (htmlString) {
                return <div className="learn-info" dangerouslySetInnerHTML={{ __html: htmlString }} />;
            }
        }

        function renderTest(data: Test) {

            const questions = data.questions;
            

            async function handleSubmitTest() {
                const answers = Object.values(testAnswers);
                const data = await submitTest(course.id, currentSubChapterId, answers);
                const answeredCorrectly = data.answeredCorrectly;
                if (answeredCorrectly.length === questions.length) {
                    toggleModal(3000, "Congratulations! You have completed the test!");
                    await setSubchapterCompleted(userId, course.id, currentSubChapterId);
                    setCompletedSubchapters([...completedSubchapters, currentSubChapterId]);
                } else {
                    toggleModal(3000, "Sorry, you have not completed the test");
                }
            }

            function handleChangeSelectOneAnswer(questionIndex: number, optionIndex: number) {
                setTestAnswers((prevAnswers) => {
                    return {
                        ...prevAnswers,
                        [questionIndex]: [optionIndex]
                    };
                });
            }

            function handleChangeSelectManyAnswer(questionIndex: number, optionIndex: number) {
                const newAnswers = testAnswers[questionIndex];
                if (newAnswers.includes(optionIndex)) {
                    newAnswers.splice(newAnswers.indexOf(optionIndex), 1);
                } else {
                    newAnswers.push(optionIndex);
                }
                setTestAnswers((prevAnswers) => {
                    return {
                        ...prevAnswers,
                        [questionIndex]: newAnswers.sort()
                    };
                })
            }

            function handleChangeCompareAnswer(questionIndex: number, fromOptionIndex: number, toOptionIndex: number) {
                const newAnswers = testAnswers[questionIndex];
                [newAnswers[fromOptionIndex], newAnswers[toOptionIndex]] = [newAnswers[toOptionIndex], newAnswers[fromOptionIndex]];
                setTestAnswers((prevAnswers) => {
                    return {
                        ...prevAnswers,
                        [questionIndex]: newAnswers
                    };
                })
            }

            function renderQuestion(question: Question, questionIndex: number) {
                const questionType = question.type;
                const options = question.options;
                const answers = testAnswers[questionIndex];
                let questionElement = <></>;

                // Render select question
                if (questionType === 'select-one' || questionType === 'select-many') {
                    questionElement = (
                        <div className="test-options">
                            {options.map((option, index) => (
                                <label key={index} className="checkbox style-h">
                                    <input onChange={() => {
                                        questionType === 'select-one' ?
                                            handleChangeSelectOneAnswer(questionIndex, index) :
                                            handleChangeSelectManyAnswer(questionIndex, index)
                                    }} checked={answers.includes(index)} type="checkbox" />
                                    <div className="checkbox__checkmark"></div>
                                    <div className="checkbox__body">{option}</div>
                                </label>
                            ))}
                        </div>
                    )
                }

                // Render compare question
                else if (questionType === 'compare') {
                    const firstOptionsSet = options.slice(0, options.length / 2);
                    const secondOptionsSet = options.slice(options.length / 2);


                    function handleOnDragEnd(result) {
                        const fromId = result.source.index;
                        const toId = result.destination.index;
                        handleChangeCompareAnswer(questionIndex, fromId, toId);
                    }

                    questionElement = (
                        <div className="test-options">
                            <DragDropContext onDragEnd={handleOnDragEnd}>
                                <div className="compare">
                                    <div className="compare-set">
                                        {firstOptionsSet.map((item, staticIndex) => (
                                            <div className="compare-option static" key={staticIndex}>
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="compare-signs">
                                        {firstOptionsSet.map((item, index) => (
                                            <div className="compare-option sign" key={index}>
                                                -
                                            </div>
                                        ))}
                                    </div>
                                    <Droppable droppableId={`answers-${currentSubChapterId}-${questionIndex}`}>
                                        {(provided) => (
                                            <div className="compare-set" {...provided.droppableProps}
                                                ref={provided.innerRef}>
                                                {answers.map((item, answerIndex) => (
                                                    <Draggable key={answerIndex}
                                                        draggableId={`draggable-${questionIndex}-${answerIndex}`}
                                                        index={answerIndex}>
                                                        {(provided) => (
                                                            <div
                                                                className="compare-option"
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                            >
                                                                {secondOptionsSet[item]}
                                                            </div>
                                                        )}

                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            </DragDropContext>
                        </div>
                    )
                }

                return (
                    <>
                        <span className="test-question">{question.question}</span>
                        <div className="test">
                            {questionElement}
                        </div>
                    </>
                )
            }

            return (
                <div className="learn-test">
                    {questions.map((question, index) => (renderQuestion(question, index)))}
                    <div className="test-submit">
                        <button className="test-submit-button" onClick={handleSubmitTest}>Submit
                        </button>
                    </div>
                </div>
            )
        }

        function renderVideo(data: Video) {
            return <div className="learn-video">
                <video style={{ width: '100%' }} controls>
                    <source src={`http://localhost:8080/file/?id=${data.source}`} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>;
        }

        if (content.type === 'info') {
            return renderInfo(content.data as Info);
        } else if (content.type === 'test') {
            return renderTest(content.data as Test);
        } else if (content.type === 'video') {
            return renderVideo(content.data as Video);
        } else {
            return <>Error occurred</>;
        }

    }

    return (
        <>
            {modalIsOpened && (
                <div onClick={() => setModalIsOpened(false)} className="modal-overlay">
                    <div className="modal-window">
                        <div className="modal-text">{modalText}</div>
                    </div>
                </div>
            )}

            <div className="course-header">
                <span className="course-title">{course.title}</span>
            </div>
            <div className="course-container">
                {renderNavigation()}
                <div className="learn-container">
                    <div className="learn-header">
                        <div className="learn-title-container">
                            <span className="learn-title">{currentSubchapter.title}</span>
                        </div>
                    </div>
                    <div className={"learn-content" + (transition ? ' covered' : '')}>
                        {renderContent(currentSubchapter.content)}
                        <div className="pagination">
                            <div className="previous-button-container">
                                {currentSubChapterId > 0 && <span className="pagination-button" onClick={() => {
                                    handleChangeSubChapter(currentSubChapterId - 1);
                                }}>PREVIOUS</span>}
                            </div>
                            <div className="next-button-container">
                                {lastSubchapterIndex > currentSubChapterId &&
                                    <span className="pagination-button" onClick={() => {
                                        handleChangeSubChapter(currentSubChapterId + 1);
                                    }}>NEXT</span>}
                            </div>
                        </div>

                    </div>
                    <div style={{ height: '1px' }} ref={ref}>
                    </div>
                </div>
            </div>
        </>
    );
}