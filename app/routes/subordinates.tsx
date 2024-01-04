import { redirect, type LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData, useNavigate } from "@remix-run/react"
import { useState } from "react"
import { getUserSubordinates } from "~/fetchers/user"
import type { User } from "~/types/user"
import { requireUserId } from "~/utils/session.server"
import userStyles from "~/styles/users.css"


export function links() {
    return [{ rel: "stylesheet", href: userStyles }]
}

export async function loader({ request }: LoaderFunctionArgs) {
    const userId = await requireUserId(request)
    const subordinates = await getUserSubordinates(userId)
    if (subordinates.length === 0) {
        return redirect("/")
    }
    return { userId, subordinates }
}


export default function Subordinates() {
    const { subordinates } = useLoaderData<typeof loader>()
    const [searchText, setSearchText] = useState("")
    const navigate = useNavigate()

    function renderUser(user: User) {
        return (
            <div key={user.id} className="user-block" onClick={() => navigate(`/subordinate/${user.id}`)}>
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

    function renderSubordinates() {
        const getSearchString = (user: User) => `${user.firstName} ${user.lastName} ${user.email}`
        const searched = subordinates.filter(user => getSearchString(user).includes(searchText.toLowerCase()))
        return (
            <div className="users">
                {searched.map(user => renderUser(user))}
            </div>
        )
    }

    return (
        <>
            <span className="section-title">My subordinates</span>
            <div className="search">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="">
                    <path fillRule="evenodd" d="M17.32 15.906 21.414 20 20 21.414l-4.094-4.094a8 8 0 1 1 1.414-1.414zM11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"></path>
                </svg>
                <input value={searchText} onChange={e => setSearchText(e.target.value)} className="search" type="text" placeholder="Search" />
            </div>
            {renderSubordinates()}
        </>
    )
}