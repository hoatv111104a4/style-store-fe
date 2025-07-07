import React, { useEffect, useState } from 'react';
import { getSanPhamCtByTrangThai } from '../../../services/Admin/SanPhamCTService';

const ProductsSales = ({ onSelect }) => {
    const [bangSanPham, setBangSanPham] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 10;

    const fetchSanPhams = async (page = 0) => {
        try {
            const result = await getSanPhamCtByTrangThai(1, page, pageSize);
            setBangSanPham(result.content || []);
            setTotalPages(result.totalPages || 0);
            setTotalElements(result.totalElements || 0);
        } catch (error) {
            alert('Không thể tải sản phẩm theo trạng thái');
        }
    };

    useEffect(() => {
        fetchSanPhams(currentPage);
    }, [currentPage]);

    const handlePageChange = (page) => {
        if (page >= 0 && page < totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="p-3">
            <table className="table table-sm table-bordered">
                <thead className="table-light">
                    <tr>
                        <th>#</th>
                        <th>Mã</th>
                        <th>Tên</th>
                        <th>Kho</th>
                        <th>Giá</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {bangSanPham.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="text-center text-muted">
                                Không có sản phẩm nào
                            </td>
                        </tr>
                    ) : (
                        bangSanPham.map((sp, idx) => (
                            <tr key={sp.id}>
                                <td>{currentPage * pageSize + idx + 1}</td>
                                <td>{sp.ma}</td>
                                <td>{sp.tenSanPham}</td>
                                <td>{sp.soLuong}</td>
                                <td>{sp.giaBan.toLocaleString()}₫</td>
                                <td>
                                    <button className="btn btn-sm btn-outline-primary" onClick={() => onSelect(sp)}>
                                        Chọn
                                    </button>
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
                                <button
                                    className="page-link"
                                    onClick={() => handlePageChange(i)}
                                    disabled={currentPage === i}
                                >
                                    {i + 1}
                                </button>
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
