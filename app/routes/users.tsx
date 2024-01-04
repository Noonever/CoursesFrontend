import type { LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData, useRevalidator } from "@remix-run/react"
import { useState } from "react"
import { getUsers, setUserBoss } from "~/fetchers/user"
import type { User } from "~/types/user"
import { requireAdmin } from "~/utils/session.server"

import styles from "~/styles/users.css"


const subordinateSvg = (fill: string) => {
    return(
        <svg style={{ cursor: "pointer" }} fill={fill} width={60} height={60} xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 100 100" enable-background="new 0 0 100 100" >
            <g display="none">
                <rect x="-660.877" y="-277.172" display="inline" fill="#000000" width="1370.931" height="877.172" />
            </g>
            <g>
                <g>
                    <path d="M18.376,80.841c4.942,0,8.963-4.021,8.963-8.963c0-4.942-4.021-8.963-8.963-8.963c-4.942,0-8.963,4.021-8.963,8.963    C9.413,76.82,13.434,80.841,18.376,80.841z M18.376,65.615c3.453,0,6.263,2.81,6.263,6.263c0,3.454-2.81,6.263-6.263,6.263    c-3.454,0-6.263-2.81-6.263-6.263C12.113,68.425,14.923,65.615,18.376,65.615z" />
                    <path d="M7.785,92.886c0-4.032,3.28-7.312,7.312-7.312h6.559c4.032,0,7.312,3.28,7.312,7.312h1.5h1.5    c0-5.686-4.626-10.312-10.312-10.312h-6.559c-5.686,0-10.312,4.625-10.312,10.312h1.5H7.785z" />
                    <path d="M58.963,71.878c0-4.942-4.021-8.963-8.963-8.963c-4.942,0-8.963,4.021-8.963,8.963c0,4.942,4.021,8.963,8.963,8.963    C54.942,80.841,58.963,76.82,58.963,71.878z M43.737,71.878c0-3.453,2.81-6.263,6.263-6.263c3.453,0,6.263,2.81,6.263,6.263    c0,3.454-2.81,6.263-6.263,6.263C46.546,78.141,43.737,75.332,43.737,71.878z" />
                    <path d="M46.721,85.575h6.559c4.032,0,7.312,3.28,7.312,7.312h1.5h1.5c0-5.686-4.626-10.312-10.312-10.312h-6.559    c-5.686,0-10.312,4.625-10.312,10.312h1.5h1.5C39.409,88.854,42.689,85.575,46.721,85.575z" />
                    <path d="M72.661,71.878c0,4.942,4.021,8.963,8.963,8.963c4.942,0,8.963-4.021,8.963-8.963c0-4.942-4.021-8.963-8.963-8.963    C76.682,62.915,72.661,66.936,72.661,71.878z M87.887,71.878c0,3.454-2.81,6.263-6.263,6.263c-3.453,0-6.263-2.81-6.263-6.263    c0-3.453,2.81-6.263,6.263-6.263C85.077,65.615,87.887,68.425,87.887,71.878z" />
                    <path d="M78.344,85.575h6.559c4.032,0,7.312,3.28,7.312,7.312h1.5h1.5c0-5.686-4.625-10.312-10.312-10.312h-6.559    c-5.686,0-10.312,4.625-10.312,10.312h1.5h1.5C71.032,88.854,74.313,85.575,78.344,85.575z" />
                    <path d="M59.959,17.073c0-5.491-4.468-9.959-9.959-9.959s-9.959,4.468-9.959,9.959s4.468,9.959,9.959,9.959    S59.959,22.564,59.959,17.073z M43.041,17.073c0-3.837,3.122-6.959,6.959-6.959s6.959,3.122,6.959,6.959S53.837,24.032,50,24.032    S43.041,20.91,43.041,17.073z" />
                    <path d="M63.591,40.081c0-5.686-4.626-10.312-10.312-10.312h-6.559c-5.686,0-10.312,4.626-10.312,10.312h3c0,0,0,0,0,0    c0-4.032,3.28-7.312,7.312-7.312h6.559c4.032,0,7.312,3.28,7.312,7.312c0,0,0,0,0,0H63.591z" />
                    <polygon points="80.124,58.654 83.124,58.654 83.124,48.953 51.5,48.953 51.5,41.668 48.5,41.668 48.5,48.953 16.876,48.953     16.876,58.654 19.876,58.654 19.876,51.953 48.5,51.953 48.5,58.654 51.5,58.654 51.5,51.953 80.124,51.953" />
                </g>
            </g>
        </svg>
    )
}

export function links() {
    return [{ rel: "stylesheet", href: styles }]
}

export async function loader({ request }: LoaderFunctionArgs) {
    await requireAdmin(request)
    const users = await getUsers()
    return { users }
}

export default function Users() {
    const { users } = useLoaderData<typeof loader>()
    const [searchText, setSearchText] = useState("")
    const [modalSearchText, setModalSearchText] = useState("")
    const [editableUser, setEditableUser] = useState<User | null>(null)
    const [currentTab, setCurrentTab] = useState<"allUsers" | "subordinates">("subordinates")
    const revalidator = useRevalidator()

    async function handleChangeSubordination(userId: string) {
        const user = users.find(user => user.id === userId)
        if (!user) {
            return
        }
        if (!editableUser) {
            return
        }
        if (user.bossId !== editableUser?.id) {
            await setUserBoss(user.id, editableUser.id)   
        } else {
            await setUserBoss(user.id, "")
        }
        revalidator.revalidate()
    }

    function renderUser(user: User) {
        return (
            <div key={user.id} className="user-block" onClick={() => setEditableUser(user)}>
                <div className="user-profile">
                    <img alt="Profile" className="profile" src={user.imageUrl} />
                    <div className="user-info">
                        <span className="user-names">{user.firstName}</span>
                        <span className="user-names">{user.lastName}</span>
                    </div>
                </div>
                <span className="user-email">{user.email}</span>
            </div>
        )
    }

    function renderUsers() {
        const getSearchString = (user: User) => `${user.firstName} ${user.lastName} ${user.email}`
        const searched = users.filter(user => getSearchString(user).includes(searchText.toLowerCase()))
        return (
            <div className="users">
                {searched.map(user => renderUser(user))}
            </div>
        )
    }

    function renderModalUser(user: User) {
        const bossId = editableUser?.id
        return (
            <div key={user.id} className="modal-user-block">
                <div className="user-profile">
                    <img alt="Profile" className="profile" src={user.imageUrl} />
                    <div className="user-info">
                        <span className="user-names">{user.firstName}</span>
                        <span className="user-names">{user.lastName}</span>
                    </div>
                </div>
                <span className="modal-user-email">{user.email}</span>
                <div className="modal-user-controls" onClick={() => handleChangeSubordination(user.id)}>
                    {subordinateSvg(user.bossId === bossId ? 'rgb(255, 120, 120)': 'black')}
                </div>
            </div>
        )
    }

    function renderModalUsers(users: User[]) {
        const getSearchString = (user: User) => `${user.firstName} ${user.lastName} ${user.email}`
        const searched = users.filter(user => getSearchString(user).includes(modalSearchText.toLowerCase())).filter(user => user.id !== editableUser?.id)
        return (
            <div className="modal-users">
                {searched.map(user => renderModalUser(user))}
            </div>
        )
    }

    function renderModal() {
        if (!editableUser) {
            return null
        }
        const currentUser = editableUser
        const userSubordinates = users.filter(user => user.bossId === currentUser.id)

        return (
            <div onClick={() => setEditableUser(null)} className="modal-overlay">
                <div onClick={(e) => e.stopPropagation()} className="modal">

                    <div className="modal-header">
                        <div key={currentUser.id} style={{ width: "100%", cursor: 'default' }} className="user-block" onClick={() => setEditableUser(currentUser)}>
                            <div className="user-profile">
                                <img alt="Profile" className="profile" src={currentUser.imageUrl} />
                                <div className="user-info">
                                    <span className="user-names">{currentUser.firstName}</span>
                                    <span className="user-names">{currentUser.lastName}</span>
                                </div>
                            </div>
                            <span className="user-email">{currentUser.email}</span>
                        </div>
                        <div className="close-button" onClick={() => setEditableUser(null)}>X</div>
                    </div>

                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="tabs">
                                <div className={`tab ${currentTab === "subordinates" ? "active" : ""}`} onClick={() => setCurrentTab("subordinates")}>Subordinates</div>
                                <div className={`tab ${currentTab === "allUsers" ? "active" : ""}`} onClick={() => setCurrentTab("allUsers")}>All users</div>
                            </div>
                            <div className="search" style={{ marginTop: '30px' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="">
                                    <path fillRule="evenodd" d="M17.32 15.906 21.414 20 20 21.414l-4.094-4.094a8 8 0 1 1 1.414-1.414zM11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"></path>
                                </svg>
                                <input value={modalSearchText} onChange={e => setModalSearchText(e.target.value)} className="search" type="text" placeholder="Search" />
                            </div>
                        </div>
                        {renderModalUsers(currentTab === "subordinates" ? userSubordinates : users)}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            {editableUser && renderModal()}
            <span className="section-title">Users</span>
            <div className="search">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="">
                    <path fillRule="evenodd" d="M17.32 15.906 21.414 20 20 21.414l-4.094-4.094a8 8 0 1 1 1.414-1.414zM11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"></path>
                </svg>
                <input value={searchText} onChange={e => setSearchText(e.target.value)} className="search" type="text" placeholder="Search" />
            </div>
            {renderUsers()}
        </>
    )
}