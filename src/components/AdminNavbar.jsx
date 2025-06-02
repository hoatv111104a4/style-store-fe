const AdminNavbar = ({ toggleSidebar }) => {
  return (
    <nav className="navbar navbar-expand-md bg-white border-bottom sticky-top" style={{ height: "60px", zIndex: 1020 }}  >
      <div className="container-md d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <button className="navbar-toggler" type="button" onClick={toggleSidebar} aria-controls="sidebar" aria-expanded="false" aria-label="Toggle sidebar" >
            <span className="navbar-toggler-icon"></span>
          </button>
          
        </div>
        <div>
          <i className="bi bi-bell fs-4 position-relative me-5" style={{ cursor: "pointer" }} >
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "0.7rem", padding: "2px 6px" }} >
              0<span className="visually-hidden">unread messages</span>
            </span>
          </i>
          <i
            className="bi bi-person-circle fs-3 me-5"
            style={{ cursor: "pointer" }}
            title="Tài khoản"
          ></i>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;