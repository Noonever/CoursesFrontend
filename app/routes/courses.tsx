import { useState } from "react";
import { useLoaderData, useLocation, useNavigate } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";

import Checkbox from "~/components/checkbox";

import type { CourseCard } from "~/types/course";
import { getCourseCards } from "~/fetchers/course";

import styles from "~/styles/courses.css";
import courseHeader1 from "~/media/img/zeros-ones.jpg";
import courseHeader2 from "~/media/img/zeros-ones-2.jpg";


export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: styles }];
}

export async function loader(): Promise<{ courseCards: CourseCard[], groupedTags: Record<string, string[]>}> {
    const groupedTags: Record<string, string[]> = {};
    const courseCards = await getCourseCards();

    courseCards.forEach(courseCard => {
        courseCard.tags.forEach(tag => {
            if (!groupedTags[tag.groupName]) {
                groupedTags[tag.groupName] = [];
            }
            if (!groupedTags[tag.groupName].includes(tag.value)) {
                groupedTags[tag.groupName].push(tag.value);
            }
        });
    });
    return { courseCards, groupedTags };
}

export default function Courses() {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const searchedTag = queryParams.get('tag');

    const { courseCards, groupedTags } = useLoaderData<typeof loader>();
    const [selectedTags, setSelectedTags] = useState<string[]>(searchedTag ? [searchedTag] : []);
    const [searchText, setSearchText] = useState("");

    function handleTagClick(tag: string) {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    }

    function filterCourses(): CourseCard[] {
        return courseCards.filter(courseCard => {
            return selectedTags.every(tag => courseCard.tags.map(tag => tag.value).includes(tag));
        }).filter(courseCard => {
            return (courseCard.title.toLowerCase() + courseCard.description.toLowerCase()).includes(searchText.toLowerCase());
        });
    }

    function splitCourseCardsIntoRows(courseCards: CourseCard[], rowSize: number) {
        const result = [];
        for (let i = 0; i < courseCards.length; i += rowSize) {
            const chunk = courseCards.slice(i, i + rowSize);
            result.push(chunk);
        }
        return result;
    }

    function renderCourseCard(courseCard: CourseCard, index: number) {
        const backgroundImage = index % 2 === 0 ? courseHeader2 : courseHeader1;
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

    function renderCourseCards() {
        const courseCards = filterCourses();
        const chunkedCourseCards = splitCourseCardsIntoRows(courseCards, 5);
        console.log(chunkedCourseCards);
        const cards = chunkedCourseCards.map((chunk, index) => (
            <div className="course-cards-row" key={index}>
                {chunk.map((courseCard, index) => (
                    renderCourseCard(courseCard, index)
                ))}
            </div>
        ))
        return (
            <div className="course-cards-container">
                {cards.length? cards : (
                    <div style={{height: "20vh", width: "100%", display: "flex", justifyContent: "center", alignItems: "center"}}>
                        <span style={{textAlign: "center", fontSize: "30px"}}>No courses found</span>
                    </div>
                )}
            </div>
        )
    }

    function renderFiltersSection() {
        return (
            <div className="filter-container">
                <span className="filter-title">Filters</span>
                {Object.keys(groupedTags).map(groupName => (
                    <>
                        <span className="filter-label">{groupName.toUpperCase()}</span>
                        {groupedTags[groupName].map(tag => (
                            <div onClick={() => handleTagClick(tag)} className="filter" key={tag}>
                                <Checkbox key={selectedTags.join()} value={selectedTags.includes(tag)} />
                                <span>{tag}</span>
                            </div>
                        ))}
                    </>
                ))}
            </div>
        );
    }

    return (
        <>
            <span className="section-title">Courses</span>
            <div className="search">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="">
                    <path fillRule="evenodd" d="M17.32 15.906 21.414 20 20 21.414l-4.094-4.094a8 8 0 1 1 1.414-1.414zM11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"></path>
                </svg>
                <input value={searchText} onChange={e => setSearchText(e.target.value)} className="search" type="text" placeholder="Search" />
            </div>

            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginTop: "3vh" }}>
                {renderFiltersSection()}
                {renderCourseCards()}
            </div>
        </>
    );
}