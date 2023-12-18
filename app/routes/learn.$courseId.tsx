import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";

import { useState } from "react";
import type { Course } from "~/types/course";
import type { Info, SelectTestData, CompareTestData, Test, Video } from "~/types/chapter";
import type { CourseProgression } from "~/types/courseProgression";

import styles from "~/styles/learn.css";
import checkboxStyles from "~/styles/cool-checkbox.css";

import { getProgression, submitTest, setLastViewedSubchapter, setSubchapterCompleted } from "~/fetchers/learn";
import { getCourse } from "~/fetchers/course";

export function links() {
    return [{ rel: "stylesheet", href: styles }, { rel: "stylesheet", href: checkboxStyles }];
}

export async function loader(request: LoaderFunctionArgs): Promise<{userId: string, course: Course, progression: CourseProgression }> {
    const userId = "0";
    const courseId = request.params.courseId
    if (!courseId) {
        throw new Error("Course ID is required")
    }
    const course = await getCourse(courseId);
    const progression = await getProgression(userId, courseId);
    return { userId, course, progression };
}

export default function Learn() {
    const { userId, course, progression } = useLoaderData<typeof loader>();
    const [expandedChapterIds, setExpandedChapterIds] = useState<number[]>([0]);
    const [currentSubChapterId, setCurrentSubChapterId] = useState<number>(progression.lastViewedSubchapter ?? 0);
    const [selectedSelectOneTestAnswerId, setSelectedSelectOneTestAnswerId] = useState<number>(0);
    const [selectedSelectManyTestAnswersIds, setSelectedSelectManyTestAnswersIds] = useState<number[]>([]);
    const [compareTestAnswersIds, setCompareTestAnswersIds] = useState<number[]>([]);
    const [selectedCompareOptionId, setSelectedCompareOptionId] = useState<number | null>(null);
    const [transition, setTransition] = useState(false);

    const currentSubchapter = course.chapters.find(chapter => chapter.subChapters.some(subchapter => subchapter.index === currentSubChapterId))?.subChapters.find(subchapter => subchapter.index === currentSubChapterId);
    if (currentSubchapter === undefined) {
        return <p>Subchapter not found</p>;
    }
    const currentSubchapterType = currentSubchapter.type;

    const lastSubchapterIndex = course.chapters[course.chapters.length - 1].subChapters[course.chapters[course.chapters.length - 1].subChapters.length - 1].index;

    function flushSelectedAnswers() {
        setSelectedSelectOneTestAnswerId(0);
        setSelectedSelectManyTestAnswersIds([]);
        setCompareTestAnswersIds([]);
        setSelectedCompareOptionId(null);
    }

    const handleChangeSubChapter = async (subChapterId: number) => {
        setTransition(true); // Begin fade-out
        flushSelectedAnswers();
        const response = await setLastViewedSubchapter(userId, course.id, subChapterId);
        if (currentSubchapterType !== 'test') {
            await setSubchapterCompleted(userId, course.id, subChapterId);
        }
        setTimeout(() => {
            // After fade-out, update the content
            setCurrentSubChapterId(subChapterId);
            // Begin fade-in after content is updated
            setTransition(false);
        }, 400); // Ensure this matches the duration of the opacity transition
    };

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
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    function renderLearnSection() {

        // Render info
        if (currentSubchapterType === 'info') {
            const data = currentSubchapter.data as Info;
            const htmlString = data.html;
            if (htmlString) {
                return <div className="learn-info" dangerouslySetInnerHTML={{ __html: htmlString }} />;
            }

            // Render test
        } else if (currentSubchapterType === 'test') {
            const data = currentSubchapter.data as Test;
            const testId = data.id;
            const testType = data.type;
            let testSection = <></>

            async function sendAnswer(answer: any) {
                console.log(`Sending answers for test ${testId}: ${answer}`);
                const response = await submitTest(testId, answer);
                if (response) {
                    await setSubchapterCompleted( userId, course.id, currentSubchapter.index );
                }
            }

            // Render select-one test
            if (testType === 'select-one') {
                const testData = data.data as SelectTestData;
                const options = testData.options;
                testSection = (
                    <div className="test">
                        <div className="test-options">
                            {options.map((option, index) => (
                                <label key={index} className="checkbox style-h">
                                    <input onChange={() => {
                                        setSelectedSelectOneTestAnswerId(index);
                                    }} checked={selectedSelectOneTestAnswerId === index} type="checkbox" />
                                    <div className="checkbox__checkmark"></div>
                                    <div className="checkbox__body">{option}</div>
                                </label>
                            ))}
                        </div>
                        <div className="test-submit">
                            <button className="test-submit-button" onClick={() => {
                                sendAnswer(selectedSelectOneTestAnswerId);
                            }}>Отправить</button>
                        </div>
                    </div>
                )

                // Render select-many test
            } else if (testType === 'select-many') {
                const testData = data.data as SelectTestData;
                const options = testData.options;
                testSection = (
                    <div className="test">
                        <div className="test-options">
                            {options.map((option, index) => (
                                <label key={index} className="checkbox style-h" >
                                    <input key={index} onChange={
                                        () => {
                                            if (selectedSelectManyTestAnswersIds.includes(index)) {
                                                setSelectedSelectManyTestAnswersIds(selectedSelectManyTestAnswersIds.filter(id => id !== index));
                                            } else {
                                                setSelectedSelectManyTestAnswersIds([...selectedSelectManyTestAnswersIds, index]);
                                            }
                                        }
                                    } checked={selectedSelectManyTestAnswersIds.includes(index)} type="checkbox" />
                                    <div className="checkbox__checkmark"></div>
                                    <div className="checkbox__body">{option}</div>
                                </label>
                            ))}
                        </div>
                        <div className="test-submit">
                            <button className="test-submit-button" onClick={() => {
                                sendAnswer(selectedSelectManyTestAnswersIds);
                            }}>Отправить</button>
                        </div>
                    </div >
                )

                // Render compare test
            } else if (testType === 'compare') {
                const testData = data.data as CompareTestData;
                const firstSet = testData.firstSet;
                const secondSet = testData.secondSet;

                if (compareTestAnswersIds.length !== firstSet.length) {
                    setCompareTestAnswersIds(firstSet.map((value, index) => index));
                }

                function handleFirstSetClick(index: number) {
                    selectedCompareOptionId === index ? setSelectedCompareOptionId(null) : setSelectedCompareOptionId(index);
                }

                function handleSecondSetClick(index: number) {
                    if (selectedCompareOptionId === null) {
                        return
                    }
                    const newCompareTestAnswersIds = [...compareTestAnswersIds];
                    [newCompareTestAnswersIds[selectedCompareOptionId], newCompareTestAnswersIds[index]] = [newCompareTestAnswersIds[index], newCompareTestAnswersIds[selectedCompareOptionId]];
                    setCompareTestAnswersIds(newCompareTestAnswersIds);
                    setSelectedCompareOptionId(null);
                }

                testSection = (
                    <div className="test">
                        <div className="compare">
                            <div className="compare-set">
                                {firstSet.map((item, index) => (
                                    <div
                                        className="test-option"
                                        key={index}
                                        id={selectedCompareOptionId === index ? 'selected' : ''}
                                        onClick={() => handleFirstSetClick(index)}
                                    >{item}</div>
                                ))}
                            </div>
                            <div className="compare-set">
                                {
                                    (compareTestAnswersIds).map((item, index) => (
                                        <div
                                            className="test-option"
                                            key={index}
                                            id={selectedCompareOptionId === index ? 'selected' : ''}
                                            onClick={() => handleSecondSetClick(index)}
                                        >{(secondSet[item])}</div>
                                    ))
                                }
                            </div>
                        </div>
                        <div className="test-submit">
                            <button className="test-submit-button" onClick={() => {
                                sendAnswer(compareTestAnswersIds);
                            }}>Отправить</button>
                        </div>
                    </div>
                )
            } else {
                return null;
            }

            return (
                <div className="learn-test">
                    <div className="test-question">{data.question}</div>
                    {testSection}
                </div>
            )

            // Render video
        } else if (currentSubchapterType === 'video') {
            const data = currentSubchapter.data as Video;
            return <div className="learn-video">{data.source}</div>;
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
                        {renderLearnSection()}
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
                    </div>
                </div>
            </div>
        </>
    );
}