import WebsiteNavbar from "../components/WebsiteNavbar";
import WebSiteSidebar from "../components/WebSiteSidebar";
import WebsiteFooter from "../components/WebsiteFooter";
import { Outlet } from "react-router-dom";
const WebsiteLayout = () => {
    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <WebsiteNavbar />
            <div className="container mt-3 " style={{ flex:1 ,paddingTop: "100px"}}>
                <Outlet/>
            </div>
            <WebsiteFooter />
        </div>
    )
}

export default WebsiteLayout;