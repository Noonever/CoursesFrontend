export interface Info {
    html: string;
}

export interface Question {
    question: string;
    type: "select-one" | "select-many" | "compare";
    options: string[];
}

export interface Test {
    questions: Question[];
}

export interface Video {
    source: string;
}

export interface Content {
    type: 'info' | 'test' | 'video';
    data: Info | Test | Video;
}

export interface SubChapter {
    index: number;
    title: string;
    content: Content;
}

export interface Chapter {
    index: number;
    title: string;
    subChapters: SubChapter[];
}
