import type { LinksFunction } from "@remix-run/node";
import {
    Links,
    LiveReload,
    Meta,
    NavLink,
    Outlet,
    Scripts,
    ScrollRestoration,
} from "@remix-run/react";

import styles from "./root-styles.css";


const homeSvg = (strokeColor: string) => {
    return (
        <svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 20V14C14 12.8954 13.1046 12 12 12C10.8954 12 10 12.8954 10 14V20M10.9833 3.60011L4.98335 7.14177C4.37395 7.50149 4 8.15646 4 8.8641V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V8.8641C20 8.15646 19.6261 7.50149 19.0167 7.14177L13.0167 3.60011C12.3894 3.22988 11.6106 3.22988 10.9833 3.60011Z" stroke={strokeColor ? strokeColor : "black"} stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    )
}


const openedBookSvg = (strokeColor: string) => {
    return (
        <svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 19V6.2C5 5.0799 5 4.51984 5.21799 4.09202C5.40973 3.71569 5.71569 3.40973 6.09202 3.21799C6.51984 3 7.0799 3 8.2 3H15.8C16.9201 3 17.4802 3 17.908 3.21799C18.2843 3.40973 18.5903 3.71569 18.782 4.09202C19 4.51984 19 5.0799 19 6.2V17H7C5.89543 17 5 17.8954 5 19ZM5 19C5 20.1046 5.89543 21 7 21H19M18 17V21M15 13.5C14.7164 12.3589 13.481 11.5 12 11.5C10.519 11.5 9.28364 12.3589 9 13.5M12 7.5H12.01M13 7.5C13 8.05228 12.5523 8.5 12 8.5C11.4477 8.5 11 8.05228 11 7.5C11 6.94772 11.4477 6.5 12 6.5C12.5523 6.5 13 6.94772 13 7.5Z" stroke={strokeColor ? strokeColor : "black"} stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    )
}

const booksSvg = (strokeColor: string) => {
    return (
        <svg fill={strokeColor ? strokeColor : "black"} height="32px" width="32px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 490 490">
            <g>
                <path d="M487.483,357.878c2.708-3.074,4.246-16.302-7.831-17.309H74.721C33.521,340.569,0,374.087,0,415.291
		C0,456.484,33.521,490,74.721,490h404.931c14.281-1.61,10.498-14.365,7.729-17.42C452.525,434.055,452.565,397.616,487.483,357.878
		z M458.156,469.148H74.721c-29.703,0-53.867-24.16-53.867-53.857c0-29.699,24.164-53.87,53.867-53.87h383.72
		C434.298,397.606,434.196,433.708,458.156,469.148z"/>
                <path d="M10.348,319.714h404.93c41.2,0,74.722-33.518,74.722-74.711c0-41.202-33.521-74.721-74.722-74.721H188.749v-20.851h290.903
		c14.281-1.61,10.498-14.365,7.729-17.42c-34.856-38.526-34.815-74.965,0.102-114.702c2.708-3.074,4.246-16.304-7.831-17.31H74.721
		C33.521,0,0,33.519,0,74.721c0,41.194,33.521,74.711,74.721,74.711h13.32v20.851H10.348c-12.077,1.006-10.539,14.234-7.831,17.309
		c34.918,39.738,34.958,76.177,0.102,114.703C-0.15,305.349-3.933,318.104,10.348,319.714z M74.721,128.58
		c-29.703,0-53.867-24.16-53.867-53.859c0-29.698,24.164-53.868,53.867-53.868h383.72c-24.143,36.184-24.245,72.286-0.285,107.728
		H188.749V74.716c0-5.762-4.664-10.426-10.427-10.426H98.468c-5.764,0-10.427,4.664-10.427,10.426v53.864H74.721z M167.895,85.142
		v130.28L144.83,197.35c-1.894-1.477-4.165-2.219-6.435-2.219c-2.271,0-4.542,0.742-6.436,2.219l-23.064,18.072V85.142H167.895z
		 M88.041,191.134v45.699c-0.604,9.074,6.298,17.959,16.862,8.206l33.492-26.237l33.491,26.237
		c10.972,8.891,17.702,0.523,16.863-8.206v-45.699h226.529c29.703,0,53.867,24.171,53.867,53.869
		c0,29.698-24.164,53.859-53.867,53.859H31.844c23.961-35.441,23.858-71.544-0.285-107.729H88.041z"/>
            </g>
        </svg>
    )
}



export const links: LinksFunction = () => {
    return [
        { rel: "stylesheet", href: styles },
        {
            rel: 'preconnect',
            href: 'https://fonts.googleapis.com'
        },
        {
            rel: 'preconnect',
            href: 'https://fonts.gstatic.com',
            crossOrigin: 'anonymous'
        },
        {
            rel: 'stylesheet',
            href: "https://fonts.googleapis.com/css2?family=Roboto&family=Sora:wght@500&display=swap"
        },
        {
            rel: 'stylesheet',
            href: 'https://unpkg.com/tachyons@4.12.0/css/tachyons.min.css'
        }
    ];
};

const svgActiveColor = "rgba(213, 69, 75, 0.9)";

export default function App() {
    return (
        <html lang="en" style={{ fontFamily: "'Sora', sans-serif", lineHeight: "1.8" }}>
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
            </head>
            <body>
                <div className="navbar-container">
                    <div className="navbar">
                        <NavLink to="/">
                            {({ isActive, isPending }) => (
                                <div className={isActive ? "nav-button-container active" : "nav-button-container"}>
                                    {homeSvg(isActive ? svgActiveColor : "black")}
                                    <span className="nav-button">Home</span>
                                </div>
                            )}
                        </NavLink>

                        <NavLink to="/my-learning">
                            {({ isActive, isPending }) => (
                                <div className={isActive ? "nav-button-container active" : "nav-button-container"}>
                                    {openedBookSvg(isActive ? svgActiveColor : "black")}
                                    <span className="nav-button">My learning</span>
                                </div>
                            )}
                        </NavLink>

                        <NavLink to="/courses">
                            {({ isActive, isPending }) => (
                                <div className={isActive ? "nav-button-container active" : "nav-button-container"}>
                                    {booksSvg(isActive ? svgActiveColor : "black")}
                                    <span className="nav-button">Courses</span>
                                </div>
                            )}
                        </NavLink>
                    </div>
                </div>

                <div className="page-container">
                    <div className="content">
                        <Outlet />
                    </div>
                </div>
                <ScrollRestoration />
                <Scripts />
                <LiveReload />
            </body>
        </html>
    );
}
