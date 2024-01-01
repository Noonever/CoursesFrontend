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

import useUserWatched from "~/hooks/useUserWacthed";

export function links() {
    return [{ rel: "stylesheet", href: styles }, { rel: "stylesheet", href: checkboxStyles }];
}

export async function loader({ request }: LoaderFunctionArgs): Promise<{ userId: string, course: Course, progression: CourseProgression }> {
    const userId = await requireUserId(request) ?? "0";
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
    const [ref, isVisible] = useUserWatched<HTMLDivElement>();

    useEffect(() => {
        if (isVisible) {
            if (currentSubchapter.content.type !== 'test') {
                handleCompleteSubchapter()
                    .catch(console.error);
            }
        }
    }, [isVisible]); // This will only run once because after visibility is true, the observer disconnects

    async function handleCompleteSubchapter() {
        if (completedSubchapters.includes(currentSubChapterId)) {
            return;
        }
        console.log('Completing subchapter', currentSubChapterId);
        setCompletedSubchapters([...completedSubchapters, currentSubChapterId]);
        await setSubchapterCompleted(userId, course.id, currentSubChapterId);
    }

    async function handleChangeSubChapter(subChapterId: number) {
        setTransition(true); // Begin fade-out
        // await setLastViewedSubchapter(userId, course.id, subChapterId);
        setTimeout(() => {
            // After fade-out, update the content
            setCurrentSubChapterId(subChapterId);
            // Begin fade-in after content is updated
            setTransition(false);
        }, 400); // Ensure this matches the duration of the opacity transition
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
                                    <div key={subChapter.index} className={"navigation-subchapter" + (currentSubChapterId === subChapter.index ? " active" : "")} onClick={() => handleChangeSubChapter(subChapter.index)}>
                                        <span className="subchapter-title">{subChapter.title}</span>
                                        {completedSubchapters.includes(subChapter.index) ? '✓' : ''}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
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
                        [questionIndex]: newAnswers
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
                    console.log(testAnswers)
                    const answers = testAnswers[questionIndex];

                    function handleOnDragEnd(result) {
                        const fromId = result.source.index;
                        const toId = result.destination.index;
                        console.log(fromId, toId);
                        handleChangeCompareAnswer(questionIndex, fromId, toId);
                    }
                    questionElement = (
                        <div className="test-options">
                            <DragDropContext onDragEnd={handleOnDragEnd}>
                                <div className="compare">
                                    <div className="compare-set">
                                        {firstOptionsSet.map((item, index) => (
                                            <div className="compare-option static" key={index}>
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
                                    <Droppable droppableId={`answers-${questionIndex}`}>
                                        {(provided) => (
                                            <div className="compare-set" {...provided.droppableProps} ref={provided.innerRef}>
                                                {answers.map((item, index) => (
                                                    <Draggable key={item} draggableId={`draggable-${questionIndex}-${item}`} index={index}>
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
                        <button className="test-submit-button" onClick={() => {
                            alert(JSON.stringify(testAnswers));
                        }}>Submit</button>
                    </div>
                </div>
            )
        }

        function renderVideo(data: Video) {
            return <div className="learn-video">{data.source}</div>;
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
                    <div className={"learn-content" + (transition ? ' covered' : '')} >
                        {renderContent(currentSubchapter.content)}
                        <div className="pagination">
                            <div className="previous-button-container">
                                {currentSubChapterId > 0 && <span className="pagination-button" onClick={() => {
                                    handleChangeSubChapter(currentSubChapterId - 1);
                                }}>PREVIOUS</span>}
                            </div>
                            <div className="next-button-container">
                                {lastSubchapterIndex > currentSubChapterId && <span className="pagination-button" onClick={() => {
                                    handleChangeSubChapter(currentSubChapterId + 1);
                                }}>NEXT</span>}
                            </div>
                        </div>
                        <div ref={ref}>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}