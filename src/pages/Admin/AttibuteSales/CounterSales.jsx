import React, { useEffect, useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSearch } from '@fortawesome/free-solid-svg-icons';
import { addHDC, getHoaDonByTrangThai, updateHDCTWithKH, updateHoaDonFull, deleteHD } from '../../../services/Admin/CounterSales/HoaDonSAdmService';
import ProductsSales from '../AttibuteSales/ProductsSales';
import { addHDCT, getHoaDonCTByHoaDonId, updateHDCT, deleteHDCT } from '../../../services/Admin/CounterSales/HoaDonCTSAdmService';
import { getSanPhamCtById } from '../../../services/Admin/SanPhamCTService';
import { getKHBySdt } from '../../../services/Admin/CounterSales/NguoiDungSAdmService'
import Client from './UserSales';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import HoaDonPDFExport from './InvoicePDFExport';



const CounterSales = () => {
  const [hoaDons, setHoaDons] = useState([]);
  const [sanPhamsMap, setSanPhamsMap] = useState({});
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [soLuongNhap, setSoLuongNhap] = useState(1);
  const [connectError, setConnectError] = useState(false);
  const [searchSdt, setSearchSdt] = useState('');
  const [khachHang, setKhachHang] = useState(null); // Sửa lại, không dùng khachHangMap
  const [showSearchInput, setShowSearchInput] = useState(false);

  // Thêm state để lưu khách hàng theo từng hóa đơn
  const [khachHangMap, setKhachHangMap] = useState({});

  // Thêm state để lưu hình thức nhận hàng và thanh toán cho từng hóa đơn
  const [hinhThucNhanHangMap, setHinhThucNhanHangMap] = useState({});
  const [hinhThucThanhToanMap, setHinhThucThanhToanMap] = useState({});

  // thêm state để lưu trạng thái và mô tả của hóa đơn
  const [trangThaiHoaDonMap, setTrangThaiHoaDonMap] = useState({});
  const [moTaHoaDonMap, setMoTaHoaDonMap] = useState({});

  const hoaDonRefs = useRef({});
  // Thêm state để lưu số tiền khách đưa cho từng hóa đơn
  const [tienKhachDuaMap, setTienKhachDuaMap] = useState({});




  const fetchHoaDons = async () => {
    try {
      const result = await getHoaDonByTrangThai(6); // Giả sử 6 là trạng thái "Đang xử lý"
      const list = result.content || [];
      setHoaDons(list);
      if (list.length > 0) setActiveTab(list[0].id);
      setConnectError(false);
    } catch (err) {
      setConnectError(true);
      console.error('Lỗi khi load hóa đơn:', err.message);
    }
  };

  useEffect(() => {
    fetchHoaDons();
  }, []);

  useEffect(() => {
    const fetchChiTietByHoaDon = async () => {
      if (!activeTab) return;
      try {
        const result = await getHoaDonCTByHoaDonId(activeTab);
        const list = result.content || [];
        setSanPhamsMap(prev => ({ ...prev, [activeTab]: list }));
        setConnectError(false);
      } catch (err) {
        setConnectError(true);
        console.error('Không thể lấy chi tiết hóa đơn:', err.message);
      }
    };
    fetchChiTietByHoaDon();
  }, [activeTab]);

  const handleCreateOrder = async () => {
    if (hoaDons.length >= 6) {
      alert('Chỉ được tạo tối đa 6 hoá đơn cùng lúc!');
      return;
    }
    setLoading(true);
    try {
      const newHoaDon = await addHDC();
      setHoaDons(prev => [...prev, newHoaDon]);
      setSanPhamsMap(prev => ({ ...prev, [newHoaDon.id]: [] }));
      setActiveTab(newHoaDon.id);
      setConnectError(false);
    } catch (err) {
      alert('Tạo đơn thất bại: ' + err.message);
      setConnectError(true);
    } finally {
      setLoading(false);
    }
  };

  const confirmAddProduct = async () => {
    if (!selectedProduct) return;
    const hoaDon = hoaDons.find(hd => hd.id === activeTab);
    const currentList = sanPhamsMap[hoaDon.id] || [];
    const existed = currentList.find(sp => sp.sanPhamCTId === selectedProduct.id);

    const newSoLuong = (existed?.soLuong || 0) + soLuongNhap;

    if (newSoLuong > 20) {
      alert('Mỗi sản phẩm chỉ được thêm tối đa 20 sản phẩm!');
      return;
    }

    const gia = selectedProduct.giaBan || selectedProduct.gia || 0;

    if (existed) {
      try {
        await updateHDCT(existed.id, {
          ...existed,
          soLuong: newSoLuong,
          thanhTien: newSoLuong * gia
        });
        const result = await getHoaDonCTByHoaDonId(hoaDon.id);
        setSanPhamsMap(prev => ({ ...prev, [hoaDon.id]: result.content || [] }));
        setSelectedProduct(null);
        setShowProductModal(false);
        setSoLuongNhap(1);
      } catch (err) {
        alert('Cập nhật số lượng thất bại: ' + err.message);
      }
    } else {
      const data = {
        hoaDonId: hoaDon.id,
        sanPhamCTId: selectedProduct.id,
        maSanPhamCtAdm: selectedProduct.ma,
        tenSanPham: selectedProduct.tenSanPham || selectedProduct.ten,
        giaTien: gia,
        soLuong: soLuongNhap,
        thanhTien: gia * soLuongNhap
      };

      try {
        await addHDCT(data);
        const result = await getHoaDonCTByHoaDonId(hoaDon.id);
        setSanPhamsMap(prev => ({ ...prev, [hoaDon.id]: result.content || [] }));
        setSelectedProduct(null);
        setShowProductModal(false);
        setSoLuongNhap(1);
      } catch (err) {
        alert('Thêm sản phẩm thất bại: ' + err.message);
      }
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setSoLuongNhap(1);
  };

  const calculateTotal = (hoaDonId) =>
    sanPhamsMap[hoaDonId]?.reduce((sum, sp) => sum + sp.soLuong * (sp.giaTien || 0), 0) || 0;
  const exportHoaDonToPDF = async (hoaDonId) => {
    const element = hoaDonRefs.current[hoaDonId];
    if (!element) return;

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    // Mở PDF trong tab mới thay vì tải về
    pdf.output('dataurlnewwindow');
  };





  const handleUpdateProduct = async (sp, hoaDonId) => {
    if (!sp.soLuong || isNaN(sp.soLuong) || Number(sp.soLuong) <= 0) return;
    if (Number(sp.soLuong) > 20) {
      alert('Mỗi sản phẩm chỉ được mua tối đa 20 sản phẩm!');
      return;
    }
    try {
      await updateHDCT(sp.id, {
        id: sp.id,
        hoaDonId: sp.hoaDonId || hoaDonId,
        sanPhamCTId: sp.sanPhamCTId,
        soLuong: Number(sp.soLuong),
        tenSanPham: sp.tenSanPham,
        giaTien: sp.giaTien,
        thanhTien: Number(sp.soLuong) * (sp.giaTien || 0)
      });
      const result = await getHoaDonCTByHoaDonId(hoaDonId);
      const list = result.content || [];
      setSanPhamsMap(prev => ({ ...prev, [hoaDonId]: list }));
      setConnectError(false);
    } catch (err) {
      alert('Cập nhật thất bại: ' + err.message);
      setConnectError(true);
    }
  };

  const handleDeleteHoaDon = async (hoaDonId) => {
    if (!window.confirm("Bạn có chắc muốn xoá hoá đơn này?")) return;
    try {
      await deleteHD(hoaDonId); // API soft delete hoặc chuyển trạng thái
      setHoaDons(prev => prev.filter(hd => hd.id !== hoaDonId));
      setActiveTab(prev => {
        if (prev === hoaDonId && hoaDons.length > 1) {
          // Nếu xóa tab đang mở, chuyển sang tab đầu tiên còn lại
          const remaining = hoaDons.filter(hd => hd.id !== hoaDonId);
          return remaining[0]?.id || null;
        }
        return prev;
      });
      alert("Đã xoá hóa đơn!");
    } catch (err) {
      alert("Xoá hoá đơn thất bại: " + err.message);
    }
  };


  const handleDeleteProduct = async (sp, hoaDonId) => {
    if (!window.confirm('Bạn có chắc muốn xoá sản phẩm này khỏi hoá đơn?')) return;
    try {
      await deleteHDCT(sp.id);
      const result = await getHoaDonCTByHoaDonId(hoaDonId);
      const list = result.content || [];
      setSanPhamsMap(prev => ({ ...prev, [hoaDonId]: list }));
      setConnectError(false);
    } catch (err) {
      alert('Xoá thất bại: ' + err.message);
      setConnectError(true);
    }
  };

  // Hàm lấy số lượng tồn kho thực tế từ API cho từng sản phẩm chi tiết
  const [khoMap, setKhoMap] = useState({});

  useEffect(() => {
    // Khi sanPhamsMap hoặc activeTab thay đổi, lấy số lượng kho cho từng sản phẩm chi tiết
    const fetchAllKho = async () => {
      if (!activeTab || !sanPhamsMap[activeTab]) return;
      const newKhoMap = { ...khoMap };
      await Promise.all(sanPhamsMap[activeTab].map(async (sp) => {
        if (!sp.sanPhamCTId && !sp.id) return;
        const spctId = sp.sanPhamCTId || sp.id;
        try {
          const res = await getSanPhamCtById(spctId);
          newKhoMap[spctId] = res.soLuongTonKho ?? res.soLuong ?? '';
        } catch {
          newKhoMap[spctId] = '';
        }
      }));
      setKhoMap(newKhoMap);
    };
    fetchAllKho();
    // eslint-disable-next-line
  }, [sanPhamsMap, activeTab]);

  const handleSearchCustomer = async (hoaDonId) => {
    if (!searchSdt) {
      alert('Vui lòng nhập số điện thoại khách hàng!');
      return;
    }
    try {
      const res = await getKHBySdt(searchSdt);
      console.log('Kết quả tìm khách hàng:', res);
      if (res) {
        setKhachHangMap(prev => ({
          ...prev,
          [hoaDonId]: res
        }));
        setShowSearchInput(false);
        setSearchSdt('');

      } else {
        setKhachHangMap(prev => ({
          ...prev,
          [hoaDonId]: null
        }));
        alert('Không tìm thấy khách hàng!');
      }
    } catch {
      setKhachHangMap(prev => ({
        ...prev,
        [hoaDonId]: null
      }));
      alert('Không tìm thấy khách hàng!');
    }
  };

  const handleUpdateHoaDonWithKhachHang = async (hoaDonId, khachHang, hinhThucNhanHang = 0) => {
    try {
      console.log('Gửi lên API:', { hoaDonId, khachHangId: khachHang?.id, hinhThucNhanHang });
      await updateHDCTWithKH(hoaDonId, khachHang.id, hinhThucNhanHang);
      alert('Cập nhật khách hàng cho hóa đơn thành công!');
    } catch (err) {
      alert('Cập nhật khách hàng thất bại: ' + err.message);
    }
  };

  const handleXacNhanDonHang = async (hoaDonId) => {
    // Tính tổng số lượng và tổng tiền
    const sanPhams = sanPhamsMap[hoaDonId] || [];
    const tongSoLuongSp = sanPhams.reduce((sum, sp) => sum + sp.soLuong, 0);
    const tongTien = sanPhams.reduce((sum, sp) => sum + sp.soLuong * (sp.giaTien || 0), 0);

    if (tongSoLuongSp === 0) {
      alert('Không có sản phẩm nào trong hoá đơn!');
      return;
    }

    // Lấy hình thức nhận hàng và thanh toán
    const hinhThucNhanHang = hinhThucNhanHangMap[hoaDonId] || 0;
    const selectedPaymentId = hinhThucThanhToanMap[hoaDonId];

    // Lấy trạng thái và mô tả của hóa đơn
    const trangThai = trangThaiHoaDonMap[hoaDonId] || 6; // hiện là chờ xác nhận cho đơn tại quầy
    const moTa = moTaHoaDonMap[hoaDonId] || "Đơn hàng tại quầy";

    try {
      await updateHoaDonFull(hoaDonId, {
        ptThanhToanId: selectedPaymentId,
        tongSoLuongSp,
        tongTien,
        hinhThucNhanHang,
        trangThai,
        moTa
      });
      alert('Cập nhật hóa đơn thành công!');
      await exportHoaDonToPDF(hoaDonId); // Xuất hóa đơn sang PDF
      await fetchHoaDons();
    } catch (err) {
      alert('Cập nhật thất bại: ' + err.message);
    }
  };

  return (
    <div className="container-fluid py-4 px-5 bg-white min-vh-100">
      <h5 className="fw-bold mb-4">QUẢN LÝ BÁN HÀNG</h5>

      {connectError && (
        <div className="alert alert-danger">Không thể kết nối đến máy chủ.</div>
      )}

      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-outline-secondary" onClick={handleCreateOrder} disabled={loading}>
          {loading ? 'Đang tạo...' : <><FontAwesomeIcon icon={faPlus} /> Tạo đơn hàng mới</>}
        </button>
      </div>

      {hoaDons.length === 0 ? (
        <p className="text-muted text-center mt-5">Không có đơn hàng nào có trạng thái là "Đang xử lý"</p>
      ) : (
        <>
          <ul className="nav nav-tabs">
            {hoaDons.map(hd => (
              <li className="nav-item d-flex align-items-center" key={hd.id}>
                <div className={`nav-link d-flex justify-content-between align-items-center ${activeTab === hd.id ? 'active' : ''}`}
                  style={{ gap: 8, paddingRight: 8, cursor: 'pointer' }}
                  onClick={() => setActiveTab(hd.id)}
                >
                  <span>{hd.ma}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // tránh chuyển tab khi click X
                      handleDeleteHoaDon(hd.id);
                    }}
                    className="btn btn-sm btn-link text-danger p-0"
                    title="Xoá hoá đơn"
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {hoaDons.map(hd => {
            if (activeTab !== hd.id) return null;
            const khachHang = khachHangMap[hd.id];
            return (
              <div key={hd.id} className="row border border-top-0 p-3">
                <div className="col-md-8">
                  <div className="d-flex justify-content-between mb-3">
                    <button className="btn btn-outline-success" onClick={() => setShowProductModal(true)}>
                      <FontAwesomeIcon icon={faPlus} className="me-1" /> Thêm sản phẩm
                    </button>
                  </div>
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Mã</th>
                        <th>Tên</th>
                        <th>Số lượng</th>
                        <th>Kho</th>
                        <th>Giá</th>
                        <th>Thành tiền</th>
                        <th>Ngày tạo</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(sanPhamsMap[hd.id]?.length ?? 0) === 0 ? (
                        <tr><td colSpan={8} className="text-center text-muted">Chưa có sản phẩm nào</td></tr>
                      ) : (
                        [...sanPhamsMap[hd.id]]
                          .sort((a, b) => (a.maSanPhamCtAdm || '').localeCompare(b.maSanPhamCtAdm || ''))
                          .map((sp, idx) => (
                            <tr key={sp.id}>
                              <td>{idx + 1}</td>
                              <td>{sp.maSanPhamCtAdm}</td>
                              <td>{sp.tenSanPham}</td>
                              <td>
                                <div className="d-flex align-items-center justify-content-center gap-2">
                                  <button
                                    className="btn btn-sm btn-outline-secondary"
                                    style={{ minWidth: 28, padding: 0 }}
                                    onClick={() => handleUpdateProduct({ ...sp, soLuong: sp.soLuong - 1 }, hd.id)}
                                    disabled={sp.soLuong <= 1}
                                    title="Giảm"
                                  >-</button>
                                  <span style={{ minWidth: 32, display: 'inline-block', textAlign: 'center' }}>{sp.soLuong}</span>
                                  <button
                                    className="btn btn-sm btn-outline-secondary"
                                    style={{ minWidth: 28, padding: 0 }}
                                    onClick={() => handleUpdateProduct({ ...sp, soLuong: sp.soLuong + 1 }, hd.id)}
                                    disabled={sp.soLuong >= (khoMap[sp.sanPhamCTId || sp.id] ?? 999999)}
                                    title="Tăng"
                                  >+</button>
                                </div>
                              </td>
                              <td>{khoMap[sp.sanPhamCTId || sp.id] ?? ''}</td>
                              <td>{(sp.giaTien)?.toLocaleString()}₫</td>
                              <td>{sp.thanhTien?.toLocaleString()}₫</td>
                              <td>{sp.ngayTao ? new Date(sp.ngayTao).toLocaleString() : ''}</td>
                              <td className="text-center align-middle">
                                <div className="d-flex justify-content-center gap-2">
                                  <button className="btn btn-link p-0 text-danger" title="Xoá" onClick={() => handleDeleteProduct(sp, hd.id)}>
                                    <FontAwesomeIcon icon={faTrash} size="lg" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="col-md-4">
                  <Client
                    hoaDonId={hd.id}
                    khachHangMap={khachHangMap}
                    showSearchInput={showSearchInput}
                    setShowSearchInput={setShowSearchInput}
                    searchSdt={searchSdt}
                    setSearchSdt={setSearchSdt}
                    handleSearchCustomer={handleSearchCustomer}
                    handleUpdateHoaDonWithKhachHang={handleUpdateHoaDonWithKhachHang}
                    hinhThucNhanHang={hinhThucNhanHangMap[hd.id] || 0}
                    setHinhThucNhanHang={val =>
                      setHinhThucNhanHangMap(prev => ({ ...prev, [hd.id]: val }))
                    }
                    trangThai={trangThaiHoaDonMap[hd.id] || 0}
                    setTrangThai={val =>
                      setTrangThaiHoaDonMap(prev => ({ ...prev, [hd.id]: val }))
                    }
                    moTa={moTaHoaDonMap[hd.id] || ''}
                    setMoTa={val =>
                      setMoTaHoaDonMap(prev => ({ ...prev, [hd.id]: val }))
                    }
                  />


                  <h6 className="fw-bold">Thông tin thanh toán</h6>
                  <div className="border p-3">
                    <label>Hình thức thanh toán:</label><br />
                    {/* Nếu chọn giao hàng */}
                    {hinhThucNhanHangMap[hd.id] === 1 ? (
                      // Giao hàng tận nơi: 3 lựa chọn
                      <>
                        <input
                          type="radio"
                          name={`tt-${hd.id}`}
                          checked={hinhThucThanhToanMap[hd.id] === 0}
                          onChange={() =>
                            setHinhThucThanhToanMap(prev => ({ ...prev, [hd.id]: 0 }))
                          }
                        /> Khi nhận hàng &nbsp;
                        <input
                          type="radio"
                          name={`tt-${hd.id}`}
                          checked={hinhThucThanhToanMap[hd.id] === 2}
                          onChange={() =>
                            setHinhThucThanhToanMap(prev => ({ ...prev, [hd.id]: 2 }))
                          }
                        /> Tại quầy &nbsp;
                        <input
                          type="radio"
                          name={`tt-${hd.id}`}
                          checked={hinhThucThanhToanMap[hd.id] === 3}
                          onChange={() =>
                            setHinhThucThanhToanMap(prev => ({ ...prev, [hd.id]: 3 }))
                          }
                        /> Thanh toán qua ví điện tử
                      </>
                    ) : (
                      // Tại quầy: 2 lựa chọn (giá trị 2 và 3)
                      <>
                        <input
                          type="radio"
                          name={`tt-${hd.id}`}
                          checked={hinhThucThanhToanMap[hd.id] === 2}
                          onChange={() =>
                            setHinhThucThanhToanMap(prev => ({ ...prev, [hd.id]: 2 }))
                          }
                        /> Tiền mặt &nbsp;
                        <input
                          type="radio"
                          name={`tt-${hd.id}`}
                          checked={hinhThucThanhToanMap[hd.id] === 3}
                          onChange={() =>
                            setHinhThucThanhToanMap(prev => ({ ...prev, [hd.id]: 3 }))
                          }
                        /> Chuyển khoản
                      </>
                    )}
                    <div className="mt-2">
                      <p>Tổng tiền: {calculateTotal(hd.id).toLocaleString()} ₫</p>
                      <p>Phí vận chuyển: 0 ₫</p>
                      <p>Giảm giá: 0 ₫</p>
                      <input className="form-control" placeholder="Nhập mã giảm giá" />
                    </div>
                    <div className="mt-3">
                      <label>Số tiền khách đưa:</label>
                      <input
                        type="number"
                        className="form-control"
                        min={0}
                        value={tienKhachDuaMap[hd.id] || ''}
                        onChange={e => {
                          const value = Number(e.target.value);
                          setTienKhachDuaMap(prev => ({ ...prev, [hd.id]: value }));
                        }}
                        placeholder="Nhập số tiền khách đưa"
                      />
                      <div className="mt-2">
                        Tiền thừa:&nbsp;
                        <strong>
                          {tienKhachDuaMap[hd.id]
                            ? (tienKhachDuaMap[hd.id] - calculateTotal(hd.id)).toLocaleString()
                            : 0}
                          &nbsp;₫
                        </strong>
                      </div>
                    </div>
                    <h6 className="mt-3">Tổng thanh toán: {calculateTotal(hd.id).toLocaleString()} ₫</h6>
                    <button className="btn btn-success mt-3 w-100" onClick={() => handleXacNhanDonHang(hd.id)}>
                      Xác nhận đơn hàng
                    </button>
                    {/* Đặt ở cuối return, ngoài mọi tab, KHÔNG dùng display: none */}
                    <div style={{ position: 'absolute', top: 0, left: '-9999px' }}>
                      {hoaDons.map(hd => (
                        <HoaDonPDFExport
                          key={hd.id}
                          ref={el => (hoaDonRefs.current[hd.id] = el)}
                          hoaDon={hd}
                          sanPhams={sanPhamsMap[hd.id] || []}
                          tongTien={calculateTotal(hd.id)}
                        />
                      ))}
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}

      {showProductModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chọn sản phẩm</h5>
                <button className="btn-close" onClick={() => setShowProductModal(false)}></button>
              </div>
              <div className="modal-body p-0">
                <ProductsSales onSelect={handleProductSelect} />
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nhập số lượng</h5>
                <button className="btn-close" onClick={() => setSelectedProduct(null)}></button>
              </div>
              <div className="modal-body">
                <p><strong>{selectedProduct.tenSanPham || selectedProduct.ten}</strong></p>
                <p>Giá: {(selectedProduct.giaBan || selectedProduct.gia)?.toLocaleString()} ₫</p>
                <p>Số lượng còn trong kho: {selectedProduct.soLuong}</p>
                <input type="number" min="1" max={selectedProduct.soLuong}
                  className="form-control"
                  value={soLuongNhap}
                  onChange={e => setSoLuongNhap(Number(e.target.value))}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedProduct(null)}>Huỷ</button>
                <button className="btn btn-primary" onClick={confirmAddProduct}>Thêm vào hoá đơn</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CounterSales;

