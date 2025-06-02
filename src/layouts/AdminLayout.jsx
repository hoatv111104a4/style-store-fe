import { useState } from "react";
import AdminAside from "../components/AdminAside";
import AdminNavbar from "../components/AdminNavbar";
import AdminContent from "../components/AdminContent";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div style={{ display: "flex", minHeight: "110vh" }}>
      <div className={`bg-white border-end ${sidebarOpen ? "d-block" : "d-none d-md-block"}`} style={{ width: "250px", flexShrink: 0 }}>
        <AdminAside />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <AdminNavbar toggleSidebar={toggleSidebar} />
        <AdminContent style={{ paddingTop: "60px" }}>
          <Outlet />
        </AdminContent>
      </div>
    </div>
  );
};

export default AdminLayout;