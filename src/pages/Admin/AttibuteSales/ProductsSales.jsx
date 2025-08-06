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
            <div style={{ padding: '16px', backgroundColor: '#f7fafc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)' }}>
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
    <div>
      <input
        type="text"
        className="form-control"
        name="searchText"
        placeholder="Tìm theo mã hoặc tên"
        value={filters.searchText}
        onChange={handleFilterChange}
        style={{
          padding: '8px 12px',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          fontSize: '0.875rem',
          outline: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          width: '100%',
        }}
        onFocus={(e) => (e.target.style.borderColor = 'orange', e.target.style.boxShadow = '0 0 0 3px rgba(49, 130, 206, 0.1)')}
        onBlur={(e) => (e.target.style.borderColor = '#e2e8f0', e.target.style.boxShadow = 'none')}
      />
    </div>
    <div>
      <select
        className="form-select"
        name="mauSacId"
        onChange={handleFilterChange}
        value={filters.mauSacId}
        style={{
          padding: '8px 12px',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          fontSize: '0.875rem',
          outline: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          width: '100%',
        }}
        onFocus={(e) => (e.target.style.borderColor = 'orange', e.target.style.boxShadow = '0 0 0 3px rgba(49, 130, 206, 0.1)')}
        onBlur={(e) => (e.target.style.borderColor = '#e2e8f0', e.target.style.boxShadow = 'none')}
      >
        <option value="">-- Màu sắc --</option>
        {mauSacs.map((ms) => (
          <option key={ms.id} value={ms.id}>{ms.ten}</option>
        ))}
      </select>
    </div>
    <div>
      <select
        className="form-select"
        name="thuongHieuId"
        onChange={handleFilterChange}
        value={filters.thuongHieuId}
        style={{
          padding: '8px 12px',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          fontSize: '0.875rem',
          outline: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          width: '100%',
        }}
        onFocus={(e) => (e.target.style.borderColor = 'orange', e.target.style.boxShadow = '0 0 0 3px rgba(49, 130, 206, 0.1)')}
        onBlur={(e) => (e.target.style.borderColor = '#e2e8f0', e.target.style.boxShadow = 'none')}
      >
        <option value="">-- Thương hiệu --</option>
        {thuongHieus.map((th) => (
          <option key={th.id} value={th.id}>{th.ten}</option>
        ))}
      </select>
    </div>
    <div>
      <select
        className="form-select"
        name="kichThuocId"
        onChange={handleFilterChange}
        value={filters.kichThuocId}
        style={{
          padding: '8px 12px',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          fontSize: '0.875rem',
          outline: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          width: '100%',
        }}
        onFocus={(e) => (e.target.style.borderColor = 'orange', e.target.style.boxShadow = '0 0 0 3px rgba(49, 130, 206, 0.1)')}
        onBlur={(e) => (e.target.style.borderColor = '#e2e8f0', e.target.style.boxShadow = 'none')}
      >
        <option value="">-- Kích thước --</option>
        {kichThuocs.map((kt) => (
          <option key={kt.id} value={kt.id}>{kt.ten}</option>
        ))}
      </select>
    </div>
    <div>
      <select
        className="form-select"
        name="xuatXuId"
        onChange={handleFilterChange}
        value={filters.xuatXuId}
        style={{
          padding: '8px 12px',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          fontSize: '0.875rem',
          outline: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          width: '100%',
        }}
        onFocus={(e) => (e.target.style.borderColor = 'orange', e.target.style.boxShadow = '0 0 0 3px rgba(49, 130, 206, 0.1)')}
        onBlur={(e) => (e.target.style.borderColor = '#e2e8f0', e.target.style.boxShadow = 'none')}
      >
        <option value="">-- Xuất xứ --</option>
        {xuatXus.map((xx) => (
          <option key={xx.id} value={xx.id}>{xx.ten}</option>
        ))}
      </select>
    </div>
    <div>
      <select
        className="form-select"
        name="chatLieuId"
        onChange={handleFilterChange}
        value={filters.chatLieuId}
        style={{
          padding: '8px 12px',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          fontSize: '0.875rem',
          outline: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          width: '100%',
        }}
        onFocus={(e) => (e.target.style.borderColor = 'orange', e.target.style.boxShadow = '0 0 0 3px rgba(49, 130, 206, 0.1)')}
        onBlur={(e) => (e.target.style.borderColor = '#e2e8f0', e.target.style.boxShadow = 'none')}
      >
        <option value="">-- Chất liệu --</option>
        {chatLieus.map((cl) => (
          <option key={cl.id} value={cl.id}>{cl.ten}</option>
        ))}
      </select>
    </div>
  </div>

  <table
    style={{
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    }}
  >
    <thead style={{ backgroundColor: '#edf2f7', color: '#4a5568', fontSize: '0.875rem', fontWeight: '600' }}>
      <tr>
        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>#</th>
        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Hình ảnh</th>
        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Mã</th>
        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Tên</th>
        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Màu sắc</th>
        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Thương hiệu</th>
        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Kích thước</th>
        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Xuất xứ</th>
        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Chất liệu</th>
        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Giá bán</th>
        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Giá bán gốc</th>
        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Kho</th>
        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Hành động</th>
      </tr>
    </thead>
    <tbody>
      {bangSanPham.length === 0 ? (
        <tr>
          <td
            colSpan={13}
            style={{ padding: '16px', textAlign: 'center', color: '#718096', fontSize: '0.875rem' }}
          >
            Không có sản phẩm nào
          </td>
        </tr>
      ) : (
        bangSanPham.map((sp, idx) => (
          <tr
            key={sp.id}
            style={{
              backgroundColor: '#ffffff',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f7fafc')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
          >
            <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#4a5568', borderBottom: '1px solid #e2e8f0' }}>
              {currentPage * pageSize + idx + 1}
            </td>
            <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
              <img
                src={sp.urlHinhAnhMauSac ? `http://localhost:8080/uploads/${sp.urlHinhAnhMauSac}` : "/placeholder-image.png"}
                alt={sp.tenSanPham}
                style={{
                  objectFit: 'cover',
                  height: '60px',
                  width: '60px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                }}
              />
            </td>
            <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#4a5568', borderBottom: '1px solid #e2e8f0' }}>
              {sp.ma}
            </td>
            <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#4a5568', borderBottom: '1px solid #e2e8f0' }}>
              {sp.tenSanPham}
            </td>
            <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#4a5568', borderBottom: '1px solid #e2e8f0' }}>
              {sp.tenMauSac}
            </td>
            <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#4a5568', borderBottom: '1px solid #e2e8f0' }}>
              {sp.tenThuongHieu}
            </td>
            <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#4a5568', borderBottom: '1px solid #e2e8f0' }}>
              {sp.tenKichThuoc}
            </td>
            <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#4a5568', borderBottom: '1px solid #e2e8f0' }}>
              {sp.tenXuatXu}
            </td>
            <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#4a5568', borderBottom: '1px solid #e2e8f0' }}>
              {sp.tenChatLieu}
            </td>
            <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#4a5568', borderBottom: '1px solid #e2e8f0' }}>
              {sp.giaBan.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </td>
            <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#4a5568', borderBottom: '1px solid #e2e8f0' }}>
              {sp.giaBanGoc.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </td>
            <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#4a5568', borderBottom: '1px solid #e2e8f0' }}>
              {sp.soLuong}
            </td>
            <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => onSelect({
                  ...sp,
                  giaTien: sp.giaBan,
                  giaTienBanDau: sp.giaBan,
                  ngayTao: new Date(),
                })}
                style={{
                  padding: '6px 12px',
                  border: '1px solid orange',
                  borderRadius: '6px',
                  color: 'orange',
                  backgroundColor: 'transparent',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s, color 0.2s',
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = 'orange', e.target.style.color = '#ffffff')}
                onMouseOut={(e) => (e.target.style.backgroundColor = 'transparent', e.target.style.color = 'orange')}
              >
                Chọn
              </button>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>

  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', color: '#718096', fontSize: '0.875rem' }}>
    <nav>
      <ul style={{ display: 'flex', listStyle: 'none', padding: 0, margin: 0, gap: '8px' }}>
        {Array.from({ length: totalPages }, (_, i) => (
          <li
            key={i}
            style={{
              backgroundColor: currentPage === i ? 'orange' : '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              transition: 'background-color 0.2s',
            }}
          >
            <button
              style={{
                padding: '6px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                color: currentPage === i ? '#ffffff' : '#4a5568',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
              onClick={() => handlePageChange(i)}
              onMouseOver={(e) => currentPage !== i && (e.target.style.color = 'orange')}
              onMouseOut={(e) => currentPage !== i && (e.target.style.color = '#4a5568')}
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
        </div>
    );
};
export default ProductsSales;



