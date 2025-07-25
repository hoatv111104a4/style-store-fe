import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPageNhanVien, deleteUser } from "../../services/Website/UserApi2";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import selectNoBorderSx from "../../components/selectNoBorderSx";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
const StaffList = () => {
  const navigate = useNavigate();
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async (pageNum = 1, filters = {}) => {
    try {
      setLoading(true);
      const data = await getPageNhanVien(
        pageNum - 1,
        5,
        filters.search || undefined,
        filters.gender || undefined,
        filters.status || undefined
      );
      if (data && data.content) {
        setStaffs(data.content);
        setTotalPages(data.totalPages || 1);
      } else {
        setStaffs([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách nhân viên:", error);
      setStaffs([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Chỉ gọi fetchData khi component mount lần đầu
  useEffect(() => {
    fetchData(1);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setPage(1);
    await fetchData(1, {
      search: search || undefined,
      gender: genderFilter || undefined,
      status: statusFilter || undefined,
    });
  };

  const handleClearSearch = () => {
    setSearch("");
  };

  const handleClearAll = () => {
    setSearch("");
    setGenderFilter("");
    setStatusFilter("");
    setPage(1);
    fetchData(1, {
      search: undefined,
      gender: undefined,
      status: undefined,
    });
  };

  const handlePageChange = (e, value) => {
    setPage(value);
    fetchData(value, {
      search: search || undefined,
      gender: genderFilter || undefined,
      status: statusFilter || undefined,
    });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa",
      text: "Bạn có chắc chắn muốn xóa nhân viên này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff6600",
      cancelButtonColor: "#888",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });
    if (result.isConfirmed) {
      try {
        await deleteUser(id);
        toast.success("Xoá nhân viên thành công!");
        fetchData(page, {
          search: search || undefined,
          gender: genderFilter || undefined,
          status: statusFilter || undefined,
        });
      } catch (error) {
        toast.error("Lỗi khi xoá nhân viên.");
        console.error("Xoá thất bại:", error);
      }
    }
  };

  return (
    <section className="mt-4">
      <h3 className="mb-3 text-center" style={{ color: "#ff6600" }}>
        Danh sách nhân viên
      </h3>

      <div className="d-flex justify-content-end mb-3">
        <button
          className="btn btn-primary"
          onClick={() => navigate("/admin/tai-khoan/nhan-vien/them-nhan-vien")}
          style={{ backgroundColor: "#ff6600", border: "none" }}
        >
          <i className="bi bi-plus-lg me-2"></i> Thêm nhân viên
        </button>
      </div>

      <div className="d-flex flex-wrap gap-3 mb-4 align-items-center">
        <form className="d-flex" onSubmit={handleSearch}>
          <TextField
            variant="outlined"
            placeholder="Nhập tên, số điện thoại hoặc email"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: { xs: 200, sm: 300 }, background: "#fff", borderRadius: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton edge="end" onClick={handleClearSearch} disabled={!search}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </form>

        <Select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          displayEmpty
          sx={{ ...selectNoBorderSx, minWidth: { xs: 120, sm: 150 } }}
          renderValue={(selected) =>
            selected
              ? selected === "1"
                ? "Nam"
                : selected === "0"
                ? "Nữ"
                : "Không xác định"
              : "Giới tính"
          }
        >
          <MenuItem value="">Tất cả</MenuItem>
          <MenuItem value="1">Nam</MenuItem>
          <MenuItem value="0">Nữ</MenuItem>
        </Select>

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          displayEmpty
          sx={{ ...selectNoBorderSx, minWidth: { xs: 120, sm: 150 } }}
          renderValue={(selected) =>
            selected
              ? selected === "1"
                ? "Hoạt động"
                : selected === "0"
                ? "Không hoạt động"
                : "Không xác định"
              : "Trạng thái"
          }
        >
          <MenuItem value="">Tất cả</MenuItem>
          <MenuItem value="1">Hoạt động</MenuItem>
          <MenuItem value="0">Không hoạt động</MenuItem>
        </Select>

        <IconButton
          onClick={handleSearch}
          sx={{ backgroundColor: "#ff6600", color: "#fff", borderRadius: 2 }}
        >
          <SearchIcon />
        </IconButton>
        <IconButton
          onClick={handleClearAll}
          sx={{ backgroundColor: "#888", color: "#fff", borderRadius: 2 }}
        >
          <ClearIcon />
        </IconButton>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center mt-4">
          <div
            className="spinner-border"
            role="status"
            style={{ width: "1.5rem", height: "1.5rem" }}
          ></div>
        </div>
      ) : (
        <div
          className="table-responsive"
          style={{ borderRadius: 8, boxShadow: "0 0 8px rgba(0,0,0,0.05)" }}
        >
          <table className="table table-hover" style={{ textAlign: "center" }}>
            <thead>
              <tr>
                <th scope="col">STT</th>
                <th scope="col">Mã</th>
                <th scope="col">Họ tên</th>
                <th scope="col" className="d-none d-md-table-cell">SĐT</th>
                <th scope="col" className="d-none d-lg-table-cell">Email</th>
                <th scope="col" className="d-none d-xl-table-cell">Địa chỉ</th>
                <th scope="col" className="d-none d-md-table-cell">Giới tính</th>
                <th scope="col" className="d-none d-md-table-cell">Năm sinh</th>
                <th scope="col">Trạng thái</th>
                <th scope="col" className="d-none d-xl-table-cell">Vai trò</th>
                <th scope="col">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {staffs.length > 0 ? (
                staffs.map((staff, index) => (
                  <tr key={staff.id}>
                    <th scope="row">{(page - 1) * 5 + index + 1}</th>
                    <td>{staff.ma || "N/A"}</td>
                    <td style={{ fontWeight: 500 }}>{staff.hoTen || "N/A"}</td>
                    <td className="d-none d-md-table-cell">{staff.soDienThoai || "N/A"}</td>
                    <td className="d-none d-lg-table-cell">{staff.email || "N/A"}</td>
                    <td className="d-none d-xl-table-cell">{staff.diaChi || "N/A"}</td>
                    <td className="d-none d-md-table-cell">
                      {staff.gioiTinh == "1"
                        ? "Nam"
                        : staff.gioiTinh == "0"
                        ? "Nữ"
                        : "Không xác định"}
                    </td>
                    <td className="d-none d-md-table-cell">
                      {staff.namSinh
                        ? new Date(staff.namSinh).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </td>
                    <td style={{ width: 160 }}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 12,
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          backgroundColor:
                            staff.trangThai == "1"
                              ? "#d1e7dd"
                              : staff.trangThai == "0"
                              ? "#f8d7da"
                              : "#eee",
                          color:
                            staff.trangThai == "1"
                              ? "#0f5132"
                              : staff.trangThai == "0"
                              ? "#842029"
                              : "#555",
                        }}
                      >
                        {staff.trangThai == "1"
                          ? "Hoạt động"
                          : staff.trangThai == "0"
                          ? "Không hoạt động"
                          : "Không xác định"}
                      </span>
                    </td>
                    <td className="d-none d-xl-table-cell">
                      {staff.role == "STAFF" ? "Nhân viên" : "-"}
                    </td>
                    <td>
                      <div className="d-flex justify-content-center gap-1">
                        <button
                          onClick={() =>
                            navigate(`/admin/tai-khoan/nhan-vien/chi-tiet/${staff.id}`)
                          }
                          style={{
                            backgroundColor: "#212529",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            padding: "6px 12px",
                            fontSize: "0.85rem",
                          }}
                        >
                          <i className="bi bi-eye-fill me-1"></i>
                          <span className="d-none d-md-inline">Xem</span>
                        </button>
                        <button
                          onClick={() => handleDelete(staff.id)}
                          style={{
                            backgroundColor: "#dc3545",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            padding: "6px 12px",
                            fontSize: "0.85rem",
                          }}
                        >
                          <i className="bi bi-trash-fill me-1"></i>
                          <span className="d-none d-md-inline">Xoá</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="text-center text-muted py-4">
                    Không có nhân viên
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-3">
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                shape="rounded"
                size="large"
                sx={{
                  "& .MuiPaginationItem-root": { color: "#333" },
                  "& .Mui-selected": {
                    backgroundColor: "#ff6600 !important",
                    color: "#fff",
                  },
                  "& .MuiPaginationItem-ellipsis": {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  },
                }}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default StaffList;