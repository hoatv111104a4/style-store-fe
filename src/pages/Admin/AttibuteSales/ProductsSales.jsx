import React, { useEffect, useState } from 'react';
import {
    filterSanPhamCtNangCao
} from '../../../services/Admin/CounterSales/SanPhamCTSAdmService';
import { getAllMauSac } from '../../../services/Admin/MauSacService';
import { getAllThuongHieu } from '../../../services/Admin/ThuongHieuService';
import { getAllKichThuoc } from '../../../services/Admin/KichThuocService';
import { getAllXuatXu } from '../../../services/Admin/XuatXuService';
import { getAllChatLieu } from '../../../services/Admin/ChatLieuService';

const ProductsSales = ({ onSelect }) => {
    const [bangSanPham, setBangSanPham] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [filters, setFilters] = useState({
        searchText: '',
        mauSacId: '',
        thuongHieuId: '',
        kichThuocId: '',
        xuatXuId: '',
        chatLieuId: ''
    });

    const [mauSacs, setMauSacs] = useState([]);
    const [thuongHieus, setThuongHieus] = useState([]);
    const [kichThuocs, setKichThuocs] = useState([]);
    const [xuatXus, setXuatXus] = useState([]);
    const [chatLieus, setChatLieus] = useState([]);

    const pageSize = 5;

    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                const [msRes, thRes, ktRes, xxRes, clRes] = await Promise.all([
                    getAllMauSac(0, 100),
                    getAllThuongHieu(0, 100),
                    getAllKichThuoc(0, 100),
                    getAllXuatXu(0, 100),
                    getAllChatLieu(0, 100)
                ]);

                setMauSacs(msRes.content || []);
                setThuongHieus(thRes.content || []);
                setKichThuocs(ktRes.content || []);
                setXuatXus(xxRes.content || []);
                setChatLieus(clRes.content || []);
            } catch (error) {
                console.error("Lỗi khi tải dropdown:", error.message);
            }
        };
        loadDropdowns();
    }, []);

    useEffect(() => {
        fetchSanPhams(currentPage);
    }, [currentPage, filters]);

    const fetchSanPhams = async (page = 0) => {
        try {
            const response = await filterSanPhamCtNangCao({
                sanPhamMa: filters.searchText ? filters.searchText.trim() : null,
                sanPhamTen: filters.searchText ? filters.searchText.trim() : null,
                mauSacId: filters.mauSacId || null,
                thuongHieuId: filters.thuongHieuId || null,
                kichThuocId: filters.kichThuocId || null,
                xuatXuId: filters.xuatXuId || null,
                chatLieuId: filters.chatLieuId || null,
                trangThai: 1,
                page,
                size: pageSize
            });
            console.log("Kết quả tìm kiếm:", response);
            setBangSanPham(response.content || []);
            setTotalPages(response.totalPages || 0);
            setTotalElements(response.totalElements || 0);
        } catch (error) {
            console.error("Lỗi khi tìm kiếm sản phẩm:", error);
            alert("Lỗi khi tìm kiếm sản phẩm: " + error.message);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
        setCurrentPage(0);
    };

    const handlePageChange = (page) => {
        if (page >= 0 && page < totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="p-3">
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <input
                        type="text"
                        className="form-control"
                        name="searchText"
                        placeholder="Tìm theo mã hoặc tên"
                        value={filters.searchText}
                        onChange={handleFilterChange}
                    />
                </div>
                <div className="col-md-2">
                    <select className="form-select" name="mauSacId" onChange={handleFilterChange} value={filters.mauSacId}>
                        <option value="">-- Màu sắc --</option>
                        {mauSacs.map((ms) => (
                            <option key={ms.id} value={ms.id}>{ms.ten}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-2">
                    <select className="form-select" name="thuongHieuId" onChange={handleFilterChange} value={filters.thuongHieuId}>
                        <option value="">-- Thương hiệu --</option>
                        {thuongHieus.map((th) => (
                            <option key={th.id} value={th.id}>{th.ten}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-2">
                    <select className="form-select" name="kichThuocId" onChange={handleFilterChange} value={filters.kichThuocId}>
                        <option value="">-- Kích thước --</option>
                        {kichThuocs.map((kt) => (
                            <option key={kt.id} value={kt.id}>{kt.ten}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-2">
                    <select className="form-select" name="xuatXuId" onChange={handleFilterChange} value={filters.xuatXuId}>
                        <option value="">-- Xuất xứ --</option>
                        {xuatXus.map((xx) => (
                            <option key={xx.id} value={xx.id}>{xx.ten}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-2">
                    <select className="form-select" name="chatLieuId" onChange={handleFilterChange} value={filters.chatLieuId}>
                        <option value="">-- Chất liệu --</option>
                        {chatLieus.map((cl) => (
                            <option key={cl.id} value={cl.id}>{cl.ten}</option>
                        ))}
                    </select>
                </div>
            </div>

            <table className="table table-sm table-bordered">
                <thead className="table-light">
                    <tr>
                        <th>#</th>
                        <th>Hình ảnh</th>
                        <th>Mã</th>
                        <th>Tên</th>
                        <th>Màu sắc</th>
                        <th>Thương hiệu</th>
                        <th>Kích thước</th>
                        <th>Xuất xứ</th>
                        <th>Chất liệu</th>
                        <th>Giá bán</th>
                        <th>Giá bán gốc</th>
                        <th>Kho</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {bangSanPham.length === 0 ? (
                        <tr>
                            <td colSpan={12} className="text-center text-muted">Không có sản phẩm nào</td>
                        </tr>
                    ) : (
                        bangSanPham.map((sp, idx) => (
                            <tr key={sp.id}>
                                <td>{currentPage * pageSize + idx + 1}</td>
                                <td>
                                    <img
                                        src={sp.urlHinhAnhMauSac ? `http://localhost:8080/uploads/${sp.urlHinhAnhMauSac}` : "/placeholder-image.png"}
                                        alt={sp.tenSanPham}
                                        style={{ objectFit: "cover", height: "80px", width: "80px", borderRadius: "8px" }}
                                    />
                                </td>
                                <td>{sp.ma}</td>
                                <td>{sp.tenSanPham}</td>
                                <td>{sp.tenMauSac}</td>
                                <td>{sp.tenThuongHieu}</td>
                                <td>{sp.tenKichThuoc}</td>
                                <td>{sp.tenXuatXu}</td>
                                <td>{sp.tenChatLieu}</td>
                                <td>{sp.giaBan.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                                <td>{sp.giaBanGoc.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                                <td>{sp.soLuong}</td>
                                <td>
                                    <button className="btn btn-sm btn-outline-primary" onClick={() => onSelect({
                                        ...sp,
                                        giaTien: sp.giaBan,
                                        giaTienBanDau: sp.giaBan,  // Để dùng so sánh sau này
                                        ngayTao: new Date(),
                                    })}>Chọn</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <div className="d-flex justify-content-between align-items-center mt-3 text-secondary">
                <nav>
                    <ul className="pagination mb-0">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(i)}>{i + 1}</button>
                            </li>
                        ))}
                    </ul>
                </nav>
                <span>
                    Trang {totalPages > 0 ? currentPage + 1 : 0} / {totalPages} ({totalElements} bản ghi)
                </span>
            </div>
        </div>
    );
};
export default ProductsSales;



