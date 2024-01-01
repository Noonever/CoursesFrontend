import { useState } from "react";
import type { CourseCreateSchema, Tag } from "~/types/course";
import { Editor } from '@tinymce/tinymce-react';
import styles from "~/styles/learn.css";
import checkboxStyles from "~/styles/cool-checkbox.css";
import createStyles from "~/styles/create.css";
import { Chapter, SubChapter } from "~/types/chapter";
import { createCourse } from "~/fetchers/course";

interface InfoForm {
    html: string | null;
}

interface QuestionForm {
    question: string | null;
    type: "select-one" | "select-many" | "compare" | null;
    options: string[];
    answers: number[];
}

interface TestForm {
    questions: QuestionForm[];
}

interface VideoForm {
    source: string | null;
}

interface ContentForm {
    type: 'info' | 'test' | 'video';
    data: InfoForm | TestForm | VideoForm | null;
}

interface SubChapterForm {
    title: string;
    content: ContentForm | null;
}

interface ChapterForm {
    title: string;
    subChapters: SubChapterForm[];
}

interface CourseForm {
    title: string | null;
    tags: Tag[];
    description: string | null;
    previewHtml: string | null;
    estimation: string | null;
    chapters: ChapterForm[];
}


export function links() {
    return [
        { rel: "stylesheet", href: styles },
        { rel: "stylesheet", href: checkboxStyles },
        { rel: "stylesheet", href: createStyles },
    ];
}

export default function Create() {

    const [expandedChapterIds, setExpandedChapterIds] = useState<number[]>([0]);
    const [editableChapterIndex, setEditableChapterIndex] = useState<number>(0);
    const [editableSubChapterIndex, setEditableSubChapterIndex] = useState<number>(0);

    const [courseForm, setCourseForm] = useState<CourseForm>({
        title: null,
        tags: [],
        description: null,
        previewHtml: null,
        estimation: null,
        chapters: [
            {
                title: "First Chapter",
                subChapters: [
                    {
                        title: "First Subchapter",
                        content: {
                            type: 'info',
                            data: {
                                html: ''
                            }
                        }
                    }
                ],
            }
        ],
    })

    const [addableSelectOptions, setAddableSelectOptions] = useState<Record<number, string>>({});
    const [addableCompareOptions, setAddableCompareOptions] = useState<Record<number, [string, string]>>({});

    const [difficultyTags, setDifficultyTags] = useState<string[]>([]);
    const [editableTags, setEditableTags] = useState<{ difficulty: string, language: string, specification: string }>({
        difficulty: '',
        language: '',
        specification: '',
    });
    const [languageTags, setLanguageTags] = useState<string[]>([]);
    const [specificationTags, setSpecificationTags] = useState<string[]>([]);

    const editableSubChapter = courseForm.chapters[editableChapterIndex]?.subChapters[editableSubChapterIndex]
    const [courseInfoExpanded, setCourseInfoExpanded] = useState(true);

    function addChapter() {
        setCourseForm({
            ...courseForm,
            chapters: [
                ...courseForm.chapters,
                {
                    title: "New Chapter",
                    subChapters: [],
                }
            ]
        })
    }

    function moveChapter(from: number, to: number) {
        setCourseForm({
            ...courseForm,
            chapters: [
                ...courseForm.chapters.slice(0, from),
                ...courseForm.chapters.slice(from + 1, to + 1),
                courseForm.chapters[from],
                ...courseForm.chapters.slice(to + 1)
            ]
        })
    }

    function removeChapter(chapterIndex: number) {
        setCourseForm({
            ...courseForm,
            chapters: [
                ...courseForm.chapters.slice(0, chapterIndex),
                ...courseForm.chapters.slice(chapterIndex + 1)
            ]
        })
    }

    function addSubChapter(chapterIndex: number) {
        const newChapters = courseForm.chapters;
        newChapters[chapterIndex].subChapters.push({
            title: "New Subchapter",
            content: {
                type: 'info',
                data: {
                    html: ''
                }
            }
        })
        setCourseForm({
            ...courseForm,
            chapters: newChapters
        })
    }

    function moveSubChapter(chapterIndex: number, from: number, to: number) {
        const newSubChapters = courseForm.chapters[chapterIndex].subChapters;
        [newSubChapters[from], newSubChapters[to]] = [newSubChapters[to], newSubChapters[from]];
        setCourseForm({
            ...courseForm,
            chapters: [
                ...courseForm.chapters.slice(0, chapterIndex),
                {
                    ...courseForm.chapters[chapterIndex],
                    subChapters: newSubChapters
                },
                ...courseForm.chapters.slice(chapterIndex + 1)
            ]
        })
    }

    function removeSubChapter(chapterIndex: number, subChapterIndex: number) {
        const newChapters = courseForm.chapters;
        const newSubchapters = newChapters[chapterIndex].subChapters;
        newSubchapters.splice(subChapterIndex, 1);
        newChapters[chapterIndex].subChapters = newSubchapters;
        setCourseForm({
            ...courseForm,
            chapters: newChapters
        })
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
                    {courseForm.chapters.map((chapter, chapterIndex) => (
                        <div key={chapterIndex}>
                            <div className="navigation-chapter" onClick={() => toggleChapter(chapterIndex)}>
                                {expandedChapterIds.includes(chapterIndex) ? '▼ ' : '▶ '}
                                {chapter.title}
                                <svg onClick={() => {
                                    removeChapter(chapterIndex);
                                    setExpandedChapterIds(expandedChapterIds.filter(id => id !== chapterIndex)); // TODO: Fix this
                                }} style={{ cursor: 'pointer' }} xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 128 128">
                                    <path d="M 49 1 C 47.34 1 46 2.34 46 4 C 46 5.66 47.34 7 49 7 L 79 7 C 80.66 7 82 5.66 82 4 C 82 2.34 80.66 1 79 1 L 49 1 z M 24 15 C 16.83 15 11 20.83 11 28 C 11 35.17 16.83 41 24 41 L 101 41 L 101 104 C 101 113.37 93.37 121 84 121 L 44 121 C 34.63 121 27 113.37 27 104 L 27 52 C 27 50.34 25.66 49 24 49 C 22.34 49 21 50.34 21 52 L 21 104 C 21 116.68 31.32 127 44 127 L 84 127 C 96.68 127 107 116.68 107 104 L 107 40.640625 C 112.72 39.280625 117 34.14 117 28 C 117 20.83 111.17 15 104 15 L 24 15 z M 24 21 L 104 21 C 107.86 21 111 24.14 111 28 C 111 31.86 107.86 35 104 35 L 24 35 C 20.14 35 17 31.86 17 28 C 17 24.14 20.14 21 24 21 z M 50 55 C 48.34 55 47 56.34 47 58 L 47 104 C 47 105.66 48.34 107 50 107 C 51.66 107 53 105.66 53 104 L 53 58 C 53 56.34 51.66 55 50 55 z M 78 55 C 76.34 55 75 56.34 75 58 L 75 104 C 75 105.66 76.34 107 78 107 C 79.66 107 81 105.66 81 104 L 81 58 C 81 56.34 79.66 55 78 55 z"></path>
                                </svg>
                            </div>
                            <div
                                className="subchapter-container"
                                style={{
                                    maxHeight: expandedChapterIds.includes(chapterIndex) ? `${(chapter.subChapters.length + 1) * 50}px` : "0px"
                                    /* Adjust 50px to the height of your subchapter items */
                                }}
                            >
                                {chapter.subChapters.map((subChapter, subchapterIndex) => (
                                    <div
                                        key={subchapterIndex}
                                        className={"navigation-subchapter" + ((editableChapterIndex === chapterIndex && editableSubChapterIndex === subchapterIndex) ? " active" : "")}
                                        onClick={() => { setEditableChapterIndex(chapterIndex); setEditableSubChapterIndex(subchapterIndex) }}
                                    >
                                        <span className="subchapter-title">{subChapter.title}</span>
                                        <svg onClick={() => removeSubChapter(chapterIndex, subchapterIndex)} style={{ cursor: 'pointer' }} xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 128 128">
                                            <path d="M 49 1 C 47.34 1 46 2.34 46 4 C 46 5.66 47.34 7 49 7 L 79 7 C 80.66 7 82 5.66 82 4 C 82 2.34 80.66 1 79 1 L 49 1 z M 24 15 C 16.83 15 11 20.83 11 28 C 11 35.17 16.83 41 24 41 L 101 41 L 101 104 C 101 113.37 93.37 121 84 121 L 44 121 C 34.63 121 27 113.37 27 104 L 27 52 C 27 50.34 25.66 49 24 49 C 22.34 49 21 50.34 21 52 L 21 104 C 21 116.68 31.32 127 44 127 L 84 127 C 96.68 127 107 116.68 107 104 L 107 40.640625 C 112.72 39.280625 117 34.14 117 28 C 117 20.83 111.17 15 104 15 L 24 15 z M 24 21 L 104 21 C 107.86 21 111 24.14 111 28 C 111 31.86 107.86 35 104 35 L 24 35 C 20.14 35 17 31.86 17 28 C 17 24.14 20.14 21 24 21 z M 50 55 C 48.34 55 47 56.34 47 58 L 47 104 C 47 105.66 48.34 107 50 107 C 51.66 107 53 105.66 53 104 L 53 58 C 53 56.34 51.66 55 50 55 z M 78 55 C 76.34 55 75 56.34 75 58 L 75 104 C 75 105.66 76.34 107 78 107 C 79.66 107 81 105.66 81 104 L 81 58 C 81 56.34 79.66 55 78 55 z"></path>
                                        </svg>
                                    </div>
                                ))}
                                <div className={"navigation-subchapter"} onClick={() => addSubChapter(chapterIndex)}>
                                    <span className="subchapter-title">+</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="navigation-chapter" onClick={() => addChapter()}>
                        +
                    </div>
                </div>
            </div>
        );
    }

    function handleChangeContentType(type: 'info' | 'test' | 'video') {
        if (confirm("If u change the content type, the old content will be lost")) {
            const newSubChapter = editableSubChapter;
            if (newSubChapter.content) {
                newSubChapter.content.type = type
                if (type === 'info') {
                    newSubChapter.content.data = {
                        html: ''
                    }
                } else if (type === 'test') {
                    newSubChapter.content.data = {
                        questions: [
                            {
                                question: 'New question',
                                type: 'select-one',
                                options: [],
                                answers: [0]
                            }
                        ]
                    }
                } else if (type === 'video') {
                    newSubChapter.content.data = {
                        source: ''
                    }
                }
                const newChapters = courseForm.chapters;
                console.log(newChapters);
                newChapters[editableChapterIndex].subChapters[editableSubChapterIndex] = newSubChapter;
                setCourseForm({
                    ...courseForm,
                    chapters: newChapters
                })
            }
        }
    }

    function renderContentEditor() {
        if (!editableSubChapter) {
            return <></>;
        }
        const content = editableSubChapter.content;

        function renderInfoEditor(data: InfoForm) {
            const htmlString = data.html || '';

            function handleChangeHtmlString(newValue: string) {
                const newContent = content;
                newContent.data = {
                    ...newContent.data,
                    html: newValue
                }
                editableSubChapter.content = newContent;
                const newChapters = courseForm.chapters;
                newChapters[editableChapterIndex].subChapters[editableSubChapterIndex] = editableSubChapter;
                setCourseForm({
                    ...courseForm,
                    chapters: newChapters
                })
            }
            
            return (
                <Editor
                    value={htmlString}
                    onEditorChange={(newValue, editor) => {
                        handleChangeHtmlString(newValue);
                    }}
                    apiKey='6ww3bxkycnxywzlldls40sianwegf3qu88gop5sgngh6pufa'
                    init={{
                        toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | image | align lineheight | tinycomments | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                        tinycomments_mode: 'embedded',
                        tinycomments_author: 'Author name',
                        mergetags_list: [
                            { value: 'First.Name', title: 'First Name' },
                            { value: 'Email', title: 'Email' },
                        ]
                    }}
                />
            )

        }

        function renderTestEditor(data: TestForm) {

            const questions = data.questions;

            function addQuestion() {
                const newQuestions = questions;
                newQuestions.push({
                    question: 'New question',
                    type: 'select-one',
                    options: [],
                    answers: [0],
                });
                content.data = {
                    ...content.data,
                    questions: newQuestions
                }
                editableSubChapter.content = content;
                const newChapters = courseForm.chapters;
                newChapters[editableChapterIndex].subChapters[editableSubChapterIndex] = editableSubChapter;
                setCourseForm({
                    ...courseForm,
                    chapters: newChapters
                })
            }

            function setQuestionType(questionIndex: number, type: 'select-one' | 'select-many' | 'compare') {
                const newQuestions = questions;
                const newQuestion = newQuestions[questionIndex];
                newQuestion.type = type;
                if (type === 'select-one') {
                    newQuestion.answers = [0];
                } else if (type === 'select-many') {
                    newQuestion.answers = [];
                } else if (type === 'compare') {
                    newQuestion.options = [];
                }
                newQuestions[questionIndex] = newQuestion
                content.data = {
                    ...content.data,
                    questions: newQuestions
                }
                editableSubChapter.content = content;
                const newChapters = courseForm.chapters;
                newChapters[editableChapterIndex].subChapters[editableSubChapterIndex] = editableSubChapter;
                setCourseForm({
                    ...courseForm,
                    chapters: newChapters
                })
            }

            function setQuestionText(questionIndex: number, text: string) {
                const newQuestions = questions;
                newQuestions[questionIndex].question = text;
                content.data = {
                    ...content.data,
                    questions: newQuestions
                }
                editableSubChapter.content = content;
                const newChapters = courseForm.chapters;
                newChapters[editableChapterIndex].subChapters[editableSubChapterIndex] = editableSubChapter;
                setCourseForm({
                    ...courseForm,
                    chapters: newChapters
                })
            }

            function removeQuestion(questionIndex: number) {
                const newQuestions = questions;
                newQuestions.splice(questionIndex, 1);
                content.data = {
                    ...content.data,
                    questions: newQuestions
                }
                editableSubChapter.content = content;
                const newChapters = courseForm.chapters;
                newChapters[editableChapterIndex].subChapters[editableSubChapterIndex] = editableSubChapter;
                setCourseForm({
                    ...courseForm,
                    chapters: newChapters
                })
            }

            function handleChangeAddableSelectOptionTexts(questionIndex: number, text: string) {
                setAddableSelectOptions({ ...addableSelectOptions, [questionIndex]: text });
            }

            function handleChangeAddableCompareOptionText(questionIndex: number, text: string, setIndex: number) {
                const newCompareOptions = addableCompareOptions[questionIndex] || ['', ''];
                newCompareOptions[setIndex] = text;
                setAddableCompareOptions({ ...addableCompareOptions, [questionIndex]: newCompareOptions });
            }

            function addSelectOption(questionIndex: number) {
                const newQuestions = questions;
                const addableOptionText = addableSelectOptions[questionIndex];
                if (!addableOptionText) {
                    alert('Please input option text.');
                    return;
                }
                newQuestions[questionIndex].options.push(addableOptionText);
                content.data = {
                    ...content.data,
                    questions: newQuestions
                }
                editableSubChapter.content = content;
                const newChapters = courseForm.chapters;
                newChapters[editableChapterIndex].subChapters[editableSubChapterIndex] = editableSubChapter;
                setCourseForm({
                    ...courseForm,
                    chapters: newChapters
                })

                const newAddableOptionTexts = addableSelectOptions;
                newAddableOptionTexts[questionIndex] = '';
                console.log(newAddableOptionTexts);
                setAddableSelectOptions(newAddableOptionTexts);
            }

            function addCompareOption(questionIndex: number) {
                const newQuestions = questions;
                const currentCompareOptions = newQuestions[questionIndex].options;

                const newCompareOptions = addableCompareOptions[questionIndex];
                const firstSetOption = newCompareOptions[0];
                const secondSetOption = newCompareOptions[1];
                if (!firstSetOption || !secondSetOption) {
                    alert('Please input option text.');
                    return;
                }

                const firstOptionsSet = currentCompareOptions.slice(0, currentCompareOptions.length / 2);
                const secondOptionsSet = currentCompareOptions.slice(currentCompareOptions.length / 2);
                firstOptionsSet.push(firstSetOption);
                secondOptionsSet.push(secondSetOption);
                const newOptions = [...firstOptionsSet, ...secondOptionsSet];
                newQuestions[questionIndex].options = newOptions;
                content.data = {
                    ...content.data,
                    questions: newQuestions
                }
                editableSubChapter.content = content;
                const newChapters = courseForm.chapters;
                newChapters[editableChapterIndex].subChapters[editableSubChapterIndex] = editableSubChapter;
                setCourseForm({
                    ...courseForm,
                    chapters: newChapters
                })

                const newAddableCompareOptions = addableCompareOptions;
                newAddableCompareOptions[questionIndex] = ['', ''];
                setAddableCompareOptions(newAddableCompareOptions);
            }

            function removeSelectOption(questionIndex: number, optionIndex: number) {
                const newQuestions = questions;
                newQuestions[questionIndex].options.splice(optionIndex, 1);
                content.data = {
                    ...content.data,
                    questions: newQuestions
                }
                editableSubChapter.content = content;
                const newChapters = courseForm.chapters;
                newChapters[editableChapterIndex].subChapters[editableSubChapterIndex] = editableSubChapter;
                setCourseForm({
                    ...courseForm,
                    chapters: newChapters
                })
            }

            function removeCompareOption(questionIndex: number, firstSetOptionIndex: number) {
                const newQuestions = questions;
                const currentCompareOptions = newQuestions[questionIndex].options;
                const firstOptionsSet = currentCompareOptions.slice(0, currentCompareOptions.length / 2);
                const secondOptionsSet = currentCompareOptions.slice(currentCompareOptions.length / 2);
                firstOptionsSet.splice(firstSetOptionIndex, 1);
                secondOptionsSet.splice(firstSetOptionIndex, 1);
                const newOptions = [...firstOptionsSet, ...secondOptionsSet];
                newQuestions[questionIndex].options = newOptions;
                content.data = {
                    ...content.data,
                    questions: newQuestions
                }
                editableSubChapter.content = content;
                const newChapters = courseForm.chapters;
                newChapters[editableChapterIndex].subChapters[editableSubChapterIndex] = editableSubChapter;
                setCourseForm({
                    ...courseForm,
                    chapters: newChapters
                })
            }

            function handleChangeSelectAnswer(questionIndex: number, optionIndex: number) {
                const newQuestions = questions;
                const question = newQuestions[questionIndex];
                if (question.type === 'select-one') {
                    question.answers = [optionIndex];
                } else if (question.type === 'select-many') {
                    if (question.answers.includes(optionIndex)) {
                        question.answers.splice(question.answers.indexOf(optionIndex), 1);
                    } else {
                        question.answers.push(optionIndex);
                    }
                }
                content.data = {
                    ...content.data,
                    questions: newQuestions
                }
                editableSubChapter.content = content;
                const newChapters = courseForm.chapters;
                newChapters[editableChapterIndex].subChapters[editableSubChapterIndex] = editableSubChapter;
                setCourseForm({
                    ...courseForm,
                    chapters: newChapters
                })
            }

            function renderQuestion(question: QuestionForm, questionIndex: number) {
                const questionType = question.type;
                const options = question.options;
                if (!options) return;
                const answers = question.answers;
                let addableOptionText = addableSelectOptions[questionIndex];

                let questionElement = <></>;
                // Render select question
                if (questionType === 'select-one' || questionType === 'select-many') {
                    questionElement = (
                        <div className="test-options">
                            {options.map((option, index) => (
                                <div key={index} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between', gap: '20px' }}>
                                    <label key={index} className="checkbox style-h" style={{ width: '100%' }}>
                                        <input onChange={() => handleChangeSelectAnswer(questionIndex, index)}
                                            checked={answers.includes(index)} type="checkbox" />
                                        <div className="checkbox__checkmark"></div>
                                        <div className="checkbox__body">{option}</div>
                                    </label>
                                    {options.length > 1 && (
                                        <svg onClick={() => removeSelectOption(questionIndex, index)} style={{ cursor: 'pointer' }} xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 128 128">
                                            <path d="M 49 1 C 47.34 1 46 2.34 46 4 C 46 5.66 47.34 7 49 7 L 79 7 C 80.66 7 82 5.66 82 4 C 82 2.34 80.66 1 79 1 L 49 1 z M 24 15 C 16.83 15 11 20.83 11 28 C 11 35.17 16.83 41 24 41 L 101 41 L 101 104 C 101 113.37 93.37 121 84 121 L 44 121 C 34.63 121 27 113.37 27 104 L 27 52 C 27 50.34 25.66 49 24 49 C 22.34 49 21 50.34 21 52 L 21 104 C 21 116.68 31.32 127 44 127 L 84 127 C 96.68 127 107 116.68 107 104 L 107 40.640625 C 112.72 39.280625 117 34.14 117 28 C 117 20.83 111.17 15 104 15 L 24 15 z M 24 21 L 104 21 C 107.86 21 111 24.14 111 28 C 111 31.86 107.86 35 104 35 L 24 35 C 20.14 35 17 31.86 17 28 C 17 24.14 20.14 21 24 21 z M 50 55 C 48.34 55 47 56.34 47 58 L 47 104 C 47 105.66 48.34 107 50 107 C 51.66 107 53 105.66 53 104 L 53 58 C 53 56.34 51.66 55 50 55 z M 78 55 C 76.34 55 75 56.34 75 58 L 75 104 C 75 105.66 76.34 107 78 107 C 79.66 107 81 105.66 81 104 L 81 58 C 81 56.34 79.66 55 78 55 z"></path>
                                        </svg>
                                    )}
                                </div>
                            ))}
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between', gap: '20px' }}>
                                <input value={addableOptionText} onChange={(e) => handleChangeAddableSelectOptionTexts(questionIndex, e.target.value)} className="test-question" style={{ width: '100%' }}></input>
                                <button onClick={() => addSelectOption(questionIndex)}>Add option</button>
                            </div>
                        </div>
                    )
                }

                // Render compare question
                else if (questionType === 'compare') {
                    const firstOptionsSet = options.slice(0, options.length / 2);
                    const secondOptionsSet = options.slice(options.length / 2);
                    const addableCompareOption = addableCompareOptions[questionIndex] || ['', ''];

                    questionElement = (
                        <div className="test-options">
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
                                <div className="compare-set">
                                    {secondOptionsSet.map((item, index) => (
                                        <div className="compare-option static" key={index}>
                                            {item}
                                        </div>
                                    ))}
                                </div>
                                <div className="compare-icons">
                                    {firstOptionsSet.map((item, index) => (
                                        <div className="compare-option sign" key={index}>
                                            <svg onClick={() => removeCompareOption(questionIndex, index)} key={index} style={{ cursor: 'pointer' }} xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 128 128">
                                                <path d="M 49 1 C 47.34 1 46 2.34 46 4 C 46 5.66 47.34 7 49 7 L 79 7 C 80.66 7 82 5.66 82 4 C 82 2.34 80.66 1 79 1 L 49 1 z M 24 15 C 16.83 15 11 20.83 11 28 C 11 35.17 16.83 41 24 41 L 101 41 L 101 104 C 101 113.37 93.37 121 84 121 L 44 121 C 34.63 121 27 113.37 27 104 L 27 52 C 27 50.34 25.66 49 24 49 C 22.34 49 21 50.34 21 52 L 21 104 C 21 116.68 31.32 127 44 127 L 84 127 C 96.68 127 107 116.68 107 104 L 107 40.640625 C 112.72 39.280625 117 34.14 117 28 C 117 20.83 111.17 15 104 15 L 24 15 z M 24 21 L 104 21 C 107.86 21 111 24.14 111 28 C 111 31.86 107.86 35 104 35 L 24 35 C 20.14 35 17 31.86 17 28 C 17 24.14 20.14 21 24 21 z M 50 55 C 48.34 55 47 56.34 47 58 L 47 104 C 47 105.66 48.34 107 50 107 C 51.66 107 53 105.66 53 104 L 53 58 C 53 56.34 51.66 55 50 55 z M 78 55 C 76.34 55 75 56.34 75 58 L 75 104 C 75 105.66 76.34 107 78 107 C 79.66 107 81 105.66 81 104 L 81 58 C 81 56.34 79.66 55 78 55 z"></path>
                                            </svg>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between', gap: '20px' }}>
                                <input value={addableCompareOption[0]} onChange={(e) => handleChangeAddableCompareOptionText(questionIndex, e.target.value, 0)} className="test-question" style={{ width: '100%' }}></input>
                                <input value={addableCompareOption[1]} onChange={(e) => handleChangeAddableCompareOptionText(questionIndex, e.target.value, 1)} className="test-question" style={{ width: '100%' }}></input>
                                <button onClick={() => addCompareOption(questionIndex)} >Add option</button>
                            </div>
                        </div>
                    )
                }

                return (
                    <>
                        <div className="question-header">
                            <select onChange={(e) => setQuestionType(questionIndex, e.target.value as 'select-one' | 'select-many' | 'compare')}>
                                <option value="select-one">Select one</option>
                                <option value="select-many">Select many</option>
                                <option value="compare">Compare</option>
                            </select>
                            <input
                                value={question.question || ''}
                                onChange={(e) => setQuestionText(questionIndex, e.target.value)}
                                className="question-text"
                            ></input>
                            <svg onClick={() => removeQuestion(questionIndex)} style={{ cursor: 'pointer' }} xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 128 128">
                                <path d="M 49 1 C 47.34 1 46 2.34 46 4 C 46 5.66 47.34 7 49 7 L 79 7 C 80.66 7 82 5.66 82 4 C 82 2.34 80.66 1 79 1 L 49 1 z M 24 15 C 16.83 15 11 20.83 11 28 C 11 35.17 16.83 41 24 41 L 101 41 L 101 104 C 101 113.37 93.37 121 84 121 L 44 121 C 34.63 121 27 113.37 27 104 L 27 52 C 27 50.34 25.66 49 24 49 C 22.34 49 21 50.34 21 52 L 21 104 C 21 116.68 31.32 127 44 127 L 84 127 C 96.68 127 107 116.68 107 104 L 107 40.640625 C 112.72 39.280625 117 34.14 117 28 C 117 20.83 111.17 15 104 15 L 24 15 z M 24 21 L 104 21 C 107.86 21 111 24.14 111 28 C 111 31.86 107.86 35 104 35 L 24 35 C 20.14 35 17 31.86 17 28 C 17 24.14 20.14 21 24 21 z M 50 55 C 48.34 55 47 56.34 47 58 L 47 104 C 47 105.66 48.34 107 50 107 C 51.66 107 53 105.66 53 104 L 53 58 C 53 56.34 51.66 55 50 55 z M 78 55 C 76.34 55 75 56.34 75 58 L 75 104 C 75 105.66 76.34 107 78 107 C 79.66 107 81 105.66 81 104 L 81 58 C 81 56.34 79.66 55 78 55 z"></path>
                            </svg>
                        </div>
                        <div className="test" style={{ marginBottom: '40px' }}>
                            {questionElement}
                        </div>
                    </>
                )
            }

            return (
                <div className="learn-test">
                    {questions.map((question, index) => (renderQuestion(question, index)))}
                    <div className="test-submit">
                        <button onClick={addQuestion}>Add question</button>
                    </div>
                </div>
            )
        }

        function renderVideoEditor(data: Video) {
            return <div className="learn-video">{data.source}</div>;
        }

        if (content.type === 'info') {
            return renderInfoEditor(content.data as Info);
        } else if (content.type === 'test') {
            return renderTestEditor(content.data as TestForm);
        } else if (content.type === 'video') {
            return renderVideoEditor(content.data as Video);
        } else {
            return <>Error occurred</>;
        }
    }

    
    function handleDeleteDifficultyTag(index: number) {
        const newDifficultyTags = [...difficultyTags]
        newDifficultyTags.splice(index, 1)
        setDifficultyTags(newDifficultyTags)
    }

    function handleDeleteLanguageTag(index: number) {
        const newLanguageTags = [...languageTags]
        newLanguageTags.splice(index, 1)
        setLanguageTags(newLanguageTags)
    }

    function handleDeleteSpecificationTag(index: number) {
        const newSpecificationTags = [...specificationTags]
        newSpecificationTags.splice(index, 1)
        setSpecificationTags(newSpecificationTags)
    }


    async function handleCreateCourse() {
        console.log(courseForm)

        const resultingTags: Tag[] = []
        difficultyTags.forEach(tag => {
            resultingTags.push({
                groupName: "difficulty",
                value: tag
            })
        })
        specificationTags.forEach(tag => {
            resultingTags.push({
                groupName: "specification",
                value: tag
            })
        })
        languageTags.forEach(tag => {
            resultingTags.push({
                groupName: "language",
                value: tag
            })
        })

        if (courseForm.title === "" || courseForm.title === null) {
            alert("Title is required")
            return
        }
        if (courseForm.description === "" || courseForm.description === null) {
            alert("Description is required")
            return
        }
        if (courseForm.previewHtml === "" || courseForm.previewHtml === null) {
            alert("Preview HTML is required")
            return
        }
        if (resultingTags.length === 0) {
            alert("Tags are required")
            return
        }
        if (courseForm.chapters.length === 0) {
            alert("Chapters are required")
            return
        }

        const formattedChapters: Chapter[] = []

        let totalSubChapterIndex = 0
        for (const [chapterIndex, chapterForm] of courseForm.chapters.entries()) {

            const subChapters: SubChapter[] = []

            const subChapterForms = chapterForm.subChapters
            if (subChapterForms.length === 0) {
                alert(`Subchapters are required for chapter ${chapterIndex + 1}`)
                return
            }

            for (const [subChapterIndex, subChapterForm] of subChapterForms.entries()) {
                const content = subChapterForm.content
                if (!content?.data) {
                    alert(`Content is required for chapter ${chapterIndex + 1} subchapter ${subChapterIndex + 1}`)
                    return
                }
                if (content.type === 'info') {
                    if (!content.data.html) {
                        alert(`Html is required for chapter ${chapterIndex + 1} subchapter ${subChapterIndex + 1}`)
                        return
                    }
                } else if (content.type === 'test') {
                    const questionForms = content.data.questions as QuestionForm[]
                    for (const [questionIndex, questionForm] of questionForms.entries()) {
                        if (!questionForm.question) {
                            alert(`Question is required for chapter ${chapterIndex + 1} subchapter ${subChapterIndex + 1} question ${questionIndex + 1}`)
                            return
                        } else if (!questionForm.options.length) {
                            alert(`Options are required for chapter ${chapterIndex + 1} subchapter ${subChapterIndex + 1} question ${questionIndex + 1}`)
                            return
                        }
                    }
                } else if (content.type === 'video') {
                    if (!content.data.source) {
                        alert(`Source is required for chapter ${chapterIndex + 1} subchapter ${subChapterIndex + 1}`)
                        return
                    }
                }

                const contentToAdd = {
                    type: content.type,
                    data: content.data
                }

                subChapters.push({
                    index: totalSubChapterIndex,
                    title: subChapterForm.title,
                    content: contentToAdd
                })

                totalSubChapterIndex++
            }

            formattedChapters.push({
                index: chapterIndex,
                title: chapterForm.title,
                subChapters: subChapters
            })
        }

        const course: CourseCreateSchema = {
            title: courseForm.title,
            tags: resultingTags,
            description: courseForm.description,
            previewHtml: courseForm.previewHtml,
            estimation: 2,
            chapters: formattedChapters
        }
        console.log(course)
        await createCourse(course)
    }

    return (
        <>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>

            </div>
            <div className="learn-header" style={{ background: "white", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)" }}>
                <button onClick={() => setCourseInfoExpanded(!courseInfoExpanded)}>{courseInfoExpanded ? "Hide course info" : "Show course info"}</button>
                <input
                    className="learn-title"
                    style={{ color: 'black', backgroundColor: 'rgba(255, 255, 255, 0)', border: 'none', textAlign: 'center', }}
                    placeholder="Title"
                    value={courseForm.title || ""}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}>
                </input>
                <button onClick={handleCreateCourse}>Create</button>
            </div>
            {courseInfoExpanded && (
                <div className="learn-content" style={{ width: "100%" }}>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        <div className="description-container">
                            Course Description
                            <textarea className="description" value={courseForm.description || ""} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} />
                        </div>
                        <div className="tags-selector-container">
                            <div className="group-names-container">
                                <div className="group-name">
                                    Difficulty
                                </div>
                                <div className="group-name">
                                    Language
                                </div>
                                <div className="group-name">
                                    Specification
                                </div>
                            </div>
                            <div className="tags-container">

                                <div className="tag-row">

                                    <div className="tags">
                                        {difficultyTags.map((tag, index) => (
                                            <div className="tag" key={index}>
                                                {tag}
                                                <svg onClick={() => {
                                                    handleDeleteDifficultyTag(index)
                                                }} style={{ cursor: 'pointer' }} xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25" viewBox="0 0 128 128">
                                                    <path d="M 49 1 C 47.34 1 46 2.34 46 4 C 46 5.66 47.34 7 49 7 L 79 7 C 80.66 7 82 5.66 82 4 C 82 2.34 80.66 1 79 1 L 49 1 z M 24 15 C 16.83 15 11 20.83 11 28 C 11 35.17 16.83 41 24 41 L 101 41 L 101 104 C 101 113.37 93.37 121 84 121 L 44 121 C 34.63 121 27 113.37 27 104 L 27 52 C 27 50.34 25.66 49 24 49 C 22.34 49 21 50.34 21 52 L 21 104 C 21 116.68 31.32 127 44 127 L 84 127 C 96.68 127 107 116.68 107 104 L 107 40.640625 C 112.72 39.280625 117 34.14 117 28 C 117 20.83 111.17 15 104 15 L 24 15 z M 24 21 L 104 21 C 107.86 21 111 24.14 111 28 C 111 31.86 107.86 35 104 35 L 24 35 C 20.14 35 17 31.86 17 28 C 17 24.14 20.14 21 24 21 z M 50 55 C 48.34 55 47 56.34 47 58 L 47 104 C 47 105.66 48.34 107 50 107 C 51.66 107 53 105.66 53 104 L 53 58 C 53 56.34 51.66 55 50 55 z M 78 55 C 76.34 55 75 56.34 75 58 L 75 104 C 75 105.66 76.34 107 78 107 C 79.66 107 81 105.66 81 104 L 81 58 C 81 56.34 79.66 55 78 55 z"></path>
                                                </svg>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="tag-add">
                                        <input value={editableTags.difficulty} onChange={(e) => setEditableTags({ ...editableTags, difficulty: e.target.value })} type="text" placeholder="tag" />
                                        <button onClick={() => {
                                            const newDifficultyTags = difficultyTags
                                            newDifficultyTags.push(editableTags.difficulty)
                                            console.log(newDifficultyTags)
                                            setDifficultyTags(newDifficultyTags);
                                            setEditableTags({ ...editableTags, difficulty: "" });
                                        }}>+</button>
                                    </div>

                                </div>

                                <div className="tag-row">

                                    <div className="tags">
                                        {languageTags.map((tag, index) => (
                                            <div className="tag" key={index}>
                                                {tag}
                                                <svg onClick={() => {
                                                    handleDeleteLanguageTag(index)
                                                }} style={{ cursor: 'pointer' }} xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25" viewBox="0 0 128 128">
                                                    <path d="M 49 1 C 47.34 1 46 2.34 46 4 C 46 5.66 47.34 7 49 7 L 79 7 C 80.66 7 82 5.66 82 4 C 82 2.34 80.66 1 79 1 L 49 1 z M 24 15 C 16.83 15 11 20.83 11 28 C 11 35.17 16.83 41 24 41 L 101 41 L 101 104 C 101 113.37 93.37 121 84 121 L 44 121 C 34.63 121 27 113.37 27 104 L 27 52 C 27 50.34 25.66 49 24 49 C 22.34 49 21 50.34 21 52 L 21 104 C 21 116.68 31.32 127 44 127 L 84 127 C 96.68 127 107 116.68 107 104 L 107 40.640625 C 112.72 39.280625 117 34.14 117 28 C 117 20.83 111.17 15 104 15 L 24 15 z M 24 21 L 104 21 C 107.86 21 111 24.14 111 28 C 111 31.86 107.86 35 104 35 L 24 35 C 20.14 35 17 31.86 17 28 C 17 24.14 20.14 21 24 21 z M 50 55 C 48.34 55 47 56.34 47 58 L 47 104 C 47 105.66 48.34 107 50 107 C 51.66 107 53 105.66 53 104 L 53 58 C 53 56.34 51.66 55 50 55 z M 78 55 C 76.34 55 75 56.34 75 58 L 75 104 C 75 105.66 76.34 107 78 107 C 79.66 107 81 105.66 81 104 L 81 58 C 81 56.34 79.66 55 78 55 z"></path>
                                                </svg>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="tag-add">
                                        <input value={editableTags.language} onChange={(e) => setEditableTags({ ...editableTags, language: e.target.value })} type="text" placeholder="tag" />
                                        <button onClick={() => {
                                            const newLanguageTags = languageTags
                                            newLanguageTags.push(editableTags.language)
                                            console.log(newLanguageTags)
                                            setLanguageTags(newLanguageTags);
                                            setEditableTags({ ...editableTags, language: "" });
                                        }}>+</button>
                                    </div >

                                </div>

                                <div className="tag-row">

                                    <div className="tags">
                                        {specificationTags.map((tag, index) => (
                                            <div className="tag" key={index}>
                                                {tag}
                                                <svg onClick={() => {
                                                    handleDeleteSpecificationTag(index)
                                                }} style={{ cursor: 'pointer' }} xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25" viewBox="0 0 128 128">
                                                    <path d="M 49 1 C 47.34 1 46 2.34 46 4 C 46 5.66 47.34 7 49 7 L 79 7 C 80.66 7 82 5.66 82 4 C 82 2.34 80.66 1 79 1 L 49 1 z M 24 15 C 16.83 15 11 20.83 11 28 C 11 35.17 16.83 41 24 41 L 101 41 L 101 104 C 101 113.37 93.37 121 84 121 L 44 121 C 34.63 121 27 113.37 27 104 L 27 52 C 27 50.34 25.66 49 24 49 C 22.34 49 21 50.34 21 52 L 21 104 C 21 116.68 31.32 127 44 127 L 84 127 C 96.68 127 107 116.68 107 104 L 107 40.640625 C 112.72 39.280625 117 34.14 117 28 C 117 20.83 111.17 15 104 15 L 24 15 z M 24 21 L 104 21 C 107.86 21 111 24.14 111 28 C 111 31.86 107.86 35 104 35 L 24 35 C 20.14 35 17 31.86 17 28 C 17 24.14 20.14 21 24 21 z M 50 55 C 48.34 55 47 56.34 47 58 L 47 104 C 47 105.66 48.34 107 50 107 C 51.66 107 53 105.66 53 104 L 53 58 C 53 56.34 51.66 55 50 55 z M 78 55 C 76.34 55 75 56.34 75 58 L 75 104 C 75 105.66 76.34 107 78 107 C 79.66 107 81 105.66 81 104 L 81 58 C 81 56.34 79.66 55 78 55 z"></path>
                                                </svg>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="tag-add">
                                        <input value={editableTags.specification} onChange={(e) => setEditableTags({ ...editableTags, specification: e.target.value })} type="text" placeholder="tag" />
                                        <button onClick={() => {
                                            const newSpecificationTags = specificationTags
                                            newSpecificationTags.push(editableTags.specification)
                                            setSpecificationTags(newSpecificationTags);
                                            setEditableTags({ ...editableTags, specification: "" });
                                        }} >+</button>
                                    </div>

                                </div>
                            </div>
                        </div>

                    </div>
                    <div style={{ marginTop: "20px", display: "flex", flexDirection: "column" }}>
                        Course Preview
                        <Editor
                            value={courseForm.previewHtml || ''}
                            onEditorChange={(newValue, editor) => {
                                setCourseForm({
                                    ...courseForm,
                                    previewHtml: newValue
                                })
                            }}
                            apiKey='6ww3bxkycnxywzlldls40sianwegf3qu88gop5sgngh6pufa'
                            init={{
                                toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | image | align lineheight | tinycomments | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                                tinycomments_mode: 'embedded',
                                tinycomments_author: 'Author name',
                                mergetags_list: [
                                    { value: 'First.Name', title: 'First Name' },
                                    { value: 'Email', title: 'Email' },
                                ]
                            }}
                        />
                    </div>
                </div>
            )}
            <div className="course-container">
                {renderNavigation()}
                <div className="learn-container">
                    {
                        editableSubChapter && (
                            <>
                                <div className="learn-header">
                                    <div className="learn-title-container" style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>

                                        <select onChange={(e) => handleChangeContentType(e.target.value as 'info' | 'test' | 'video')} value={editableSubChapter?.content?.type || "info"}>
                                            <option value="info">info</option>
                                            <option value="test">test</option>
                                            <option value="video">video</option>
                                        </select>

                                        <input
                                            style={{ backgroundColor: 'rgba(255, 255, 255, 0)', border: 'none', textAlign: 'center' }}
                                            value={editableSubChapter?.title || ""}
                                            onChange={(e) => {
                                                setCourseForm({
                                                    ...courseForm,
                                                    chapters: courseForm.chapters.map((chapter, index) => {
                                                        if (index === editableChapterIndex) {
                                                            return {
                                                                ...chapter,
                                                                subChapters: chapter.subChapters.map((subChapter, subChapterIndex) => {
                                                                    if (subChapterIndex === editableSubChapterIndex) {
                                                                        return {
                                                                            ...subChapter,
                                                                            title: e.target.value
                                                                        }
                                                                    } else {
                                                                        return subChapter
                                                                    }
                                                                })
                                                            }

                                                        } else {
                                                            return chapter
                                                        }
                                                    })
                                                })
                                            }}
                                            className="learn-title"
                                        ></input>
                                    </div>
                                </div>
                                <div className="learn-content">
                                    {renderContentEditor()}
                                </div>
                            </>
                        )
                    }

                </div>
            </div>
        </>
    )
}
