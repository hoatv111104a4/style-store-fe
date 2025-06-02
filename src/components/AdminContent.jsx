const AdminContent = ({ children }) => (
  <div className="container-md mt-3 px-4 py-3" style={{ minHeight: "calc(100vh - 60px)" }}>
    {children}
  </div>
);

export default AdminContent;