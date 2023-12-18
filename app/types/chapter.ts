export interface Info {
    html: string;
}

export interface SelectTestData {
    options: string[];
}

export interface CompareTestData {
    firstSet: string[];
    secondSet: string[];
}

export interface Test {
    id: string;
    question: string;
    type: "select-one" | "select-many" | "compare";
    data: SelectTestData | CompareTestData;
}

export interface Video {
    source: string;
}

export interface SubChapter {
    index: number;
    title: string;
    type: 'info' | 'test' | 'video';
    data: Info | Test | Video;
}

export default interface Chapter {
    index: number;
    title: string;
    subChapters: SubChapter[];
}
