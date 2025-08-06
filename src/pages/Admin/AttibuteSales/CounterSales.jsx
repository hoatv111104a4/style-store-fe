import React, { useEffect, useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSearch } from '@fortawesome/free-solid-svg-icons';
import { addHDC, getHoaDonByTrangThai, updateHDCTWithKH, updateHoaDonFull, deleteHD } from '../../../services/Admin/CounterSales/HoaDonSAdmService';
import ProductsSales from '../AttibuteSales/ProductsSales';
import { addHDCT, getHoaDonCTByHoaDonId, updateHDCT, deleteHDCT } from '../../../services/Admin/CounterSales/HoaDonCTSAdmService';
import { getSanPhamCtById } from '../../../services/Admin/SanPhamCTService';
import { getKHBySdt } from '../../../services/Admin/CounterSales/NguoiDungSAdmService';
import Client from './UserSales';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import HoaDonPDFExport from './InvoicePDFExport';
import CustomAlert from './CustomAlert';
import CustomConfirm from './CustomConfirm';
import { submitVNPayOrder } from "../../../services/Website/OrderApi";
import QRCode from "react-qr-code";


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
  const [showSearchInput, setShowSearchInput] = useState(false);

  const [alertMessage, setAlertMessage] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState('success');

  const showAlert = (message) => {
    setAlertMessage(message);
    setAlertOpen(true);
  };

  const handleCloseAlert = () => {
    setAlertOpen(false);
    setAlertMessage('');
  };

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

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmTitle, setConfirmTitle] = useState('');
  const [onConfirmAction, setOnConfirmAction] = useState(() => () => { });
  const [showVnpayQR, setShowVnpayQR] = useState(false);
  const [vnpayUrl, setVnpayUrl] = useState('');

  const showConfirmDialog = (message, title, onConfirm) => {
    setConfirmMessage(message);
    setConfirmTitle(title);
    setOnConfirmAction(() => onConfirm);
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    onConfirmAction();
    setConfirmOpen(false);
  };


  const fetchHoaDons = async () => {
    try {
      const result = await getHoaDonByTrangThai(6); // Trạng thái 6 là "Đang xử lý"
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
      showAlert('Chỉ được tạo tối đa 6 hoá đơn cùng lúc!');
      setAlertSeverity('warning');
      setAlertOpen(true);
      return;
    }
    setLoading(true);
    try {
      const newHoaDon = await addHDC();
      setHoaDons(prev => [...prev, newHoaDon]);
      setSanPhamsMap(prev => ({ ...prev, [newHoaDon.id]: [] }));
      setActiveTab(newHoaDon.id);
      setConnectError(false);

      showAlert('Tạo đơn hàng thành công!');
      setAlertSeverity('success');
      setAlertOpen(true);
    } catch (err) {
      showAlert('Tạo đơn thất bại: ' + err.message);
      setAlertSeverity('error');
      setAlertOpen(true);
      setConnectError(true);
    } finally {
      setLoading(false);
    }
  };

  const confirmAddProduct = async () => {
    if (!selectedProduct) return;

    try {
      const sanPhamFromAPI = await getSanPhamCtById(selectedProduct.id);
      const giaMoi = sanPhamFromAPI.giaBan || sanPhamFromAPI.gia || 0;

      const hoaDon = hoaDons.find(hd => hd.id === activeTab);
      const currentList = sanPhamsMap[hoaDon.id] || [];

      // Tìm sản phẩm đã tồn tại dựa trên ID và giá (để phân biệt giá gốc và giá mới)
      const existed = currentList.find(sp =>
        sp.sanPhamCTId === selectedProduct.id &&
        (sp.giaTien === giaMoi)
      );

      const newSoLuong = (existed?.soLuong || 0) + soLuongNhap;

      if (newSoLuong > 20) {
        showAlert('Mỗi sản phẩm chỉ được thêm tối đa 20 sản phẩm!');
        setAlertSeverity('warning');
        setAlertOpen(true);
        return;
      }

      if (existed) {
        // Cập nhật số lượng sản phẩm đã có cùng giá
        await updateHDCT(existed.id, {
          ...existed,
          soLuong: newSoLuong,
          thanhTien: newSoLuong * giaMoi
        });
      } else {
        // Thêm dòng mới vì giá khác
        const data = {
          hoaDonId: hoaDon.id,
          sanPhamCTId: selectedProduct.id,
          maSanPhamCtAdm: selectedProduct.ma,
          tenSanPham: selectedProduct.tenSanPham || selectedProduct.ten,
          giaTien: giaMoi,
          soLuong: soLuongNhap,
          thanhTien: giaMoi * soLuongNhap
        };
        await addHDCT(data);
      }

      // Refresh lại dữ liệu
      const result = await getHoaDonCTByHoaDonId(hoaDon.id);
      setSanPhamsMap(prev => ({ ...prev, [hoaDon.id]: result.content || [] }));
      setSelectedProduct(null);
      setShowProductModal(false);
      setSoLuongNhap(1);
    } catch (err) {
      showAlert('Lỗi xử lý sản phẩm: ' + err.message);
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };



  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setSoLuongNhap(1);
  };

  const OriginalPrice = (hoaDonId) =>
    sanPhamsMap[hoaDonId]?.reduce((sum, sp) => sum + sp.soLuong * (sp.giaGocSP || 0), 0) || 0;

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
      showAlert('Mỗi sản phẩm chỉ được mua tối đa 20 sản phẩm!');
      setAlertSeverity('warning');
      setAlertOpen(true);
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
      showAlert('Cập nhật thất bại: ' + err.message);
      setAlertSeverity('error');
      setAlertOpen(true);
      setConnectError(true);
    }
  };

  const handleDeleteHoaDon = async (hoaDonId) => {
    showConfirmDialog(
      'Bạn có chắc muốn xoá hoá đơn này?',
      'Xác nhận xoá',
      async () => {
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
          showAlert("Đã xoá hóa đơn!");
          setAlertSeverity('success');
          setAlertOpen(true);
        } catch (err) {
          showAlert("Xoá hoá đơn thất bại: " + err.message);
          setAlertSeverity('error');
          setAlertOpen(true);
          setConnectError(true);
        }
      }
    );
  };


  const handleDeleteProduct = async (sp, hoaDonId) => {
    showConfirmDialog(
      "Bạn có chắc muốn xoá sản phẩm này khỏi hoá đơn?",
      "Xoá sản phẩm",
      async () => {
        try {
          await deleteHDCT(sp.id);
          const result = await getHoaDonCTByHoaDonId(hoaDonId);
          const list = result.content || [];
          setSanPhamsMap(prev => ({ ...prev, [hoaDonId]: list }));
          setConnectError(false);
        } catch (err) {
          showAlert('Xoá thất bại: ' + err.message);
          setAlertSeverity('error');
          setAlertOpen(true);
          setConnectError(true);
        }
      }
    );
  };

  // Hàm lấy số lượng tồn kho thực tế từ API cho từng sản phẩm chi tiết
  const [khoMap, setKhoMap] = useState({});
  // Thêm state để lưu giá gốc của sản phẩm từ API
  const [giaGocMap, setGiaGocMap] = useState({});
  // Thêm state để theo dõi sản phẩm có giá thay đổi (chỉ được xóa)
  const [sanPhamGiaThayDoiMap, setSanPhamGiaThayDoiMap] = useState({});

  useEffect(() => {
    // Khi sanPhamsMap hoặc activeTab thay đổi, lấy số lượng kho và giá gốc cho từng sản phẩm chi tiết
    const fetchAllKhoAndGia = async () => {
      if (!activeTab || !sanPhamsMap[activeTab]) return;
      const newKhoMap = { ...khoMap };
      const newGiaGocMap = { ...giaGocMap };
      const newSanPhamGiaThayDoiMap = { ...sanPhamGiaThayDoiMap };

      await Promise.all(sanPhamsMap[activeTab].map(async (sp) => {
        if (!sp.sanPhamCTId && !sp.id) return;
        const spctId = sp.sanPhamCTId || sp.id;
        try {
          const res = await getSanPhamCtById(spctId);
          newKhoMap[spctId] = res.soLuongTonKho ?? res.soLuong ?? '';

          // Lưu giá gốc từ API
          const giaGocFromAPI = res.giaBan || res.gia || 0;
          newGiaGocMap[spctId] = giaGocFromAPI;

          // So sánh giá hiện tại trong giỏ hàng với giá gốc từ API
          const giaHienTai = sp.giaTien || 0;
          if (giaGocFromAPI !== giaHienTai) {
            // Nếu giá khác nhau, đánh dấu sản phẩm này chỉ được xóa
            newSanPhamGiaThayDoiMap[sp.id] = true;
          } else {
            // Nếu giá bằng nhau, cho phép sửa bình thường
            newSanPhamGiaThayDoiMap[sp.id] = false;
          }
        } catch {
          newKhoMap[spctId] = '';
          newGiaGocMap[spctId] = 0;
          newSanPhamGiaThayDoiMap[sp.id] = false;
        }
      }));

      setKhoMap(newKhoMap);
      setGiaGocMap(newGiaGocMap);
      setSanPhamGiaThayDoiMap(newSanPhamGiaThayDoiMap);
    };
    fetchAllKhoAndGia();
    // eslint-disable-next-line
  }, [sanPhamsMap, activeTab]);

  const handleSearchCustomer = async (hoaDonId) => {
    if (!searchSdt) {
      showAlert('Vui lòng nhập số điện thoại khách hàng!');
      setAlertSeverity('warning');
      setAlertOpen(true);
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
        showAlert('Không tìm thấy khách hàng!');
        setAlertSeverity('warning');
        setAlertOpen(true);
      }
    } catch {
      setKhachHangMap(prev => ({
        ...prev,
        [hoaDonId]: null
      }));
      showAlert('Không tìm thấy khách hàng!');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  const handleUpdateHoaDonWithKhachHang = async (hoaDonId, khachHang, hinhThucNhanHang = 0) => {
    try {
      console.log('Gửi lên API:', { hoaDonId, khachHangId: khachHang?.id, hinhThucNhanHang });
      await updateHDCTWithKH(hoaDonId, khachHang.id, hinhThucNhanHang);
      showAlert('Cập nhật khách hàng cho hóa đơn thành công!');
      setAlertSeverity('success');
      setAlertOpen(true);
    } catch (err) {
      showAlert('Cập nhật khách hàng thất bại: ' + err.message);
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  const handleXacNhanDonHang = async (hoaDonId) => {
    const sanPhams = sanPhamsMap[hoaDonId] || [];
    const tongSoLuongSp = sanPhams.reduce((sum, sp) => sum + sp.soLuong, 0);
    const tongTien = sanPhams.reduce((sum, sp) => sum + sp.soLuong * (sp.giaTien || 0), 0);

    if (tongSoLuongSp === 0) {
      showAlert('Không có sản phẩm nào trong hoá đơn!');
      setAlertSeverity('warning');
      setAlertOpen(true);
      return;
    }

    const hinhThucNhanHang = hinhThucNhanHangMap[hoaDonId] || 0;
    const selectedPaymentId = hinhThucThanhToanMap[hoaDonId];
    const trangThai = trangThaiHoaDonMap[hoaDonId] || 6;
    const moTa = moTaHoaDonMap[hoaDonId] || "Đơn hàng tại quầy";

    try {
      if (selectedPaymentId === 3) {
        // Nếu thanh toán qua VNPAY
        const donHangData = {
          idDonHang: hoaDonId,
          loaiHoaDon: "TẠI QUẦY",
          phuongThucThanhToan: "VNPAY",
          tongTien: tongTien,
        };

        const url = await submitVNPayOrder(donHangData);

        // Hiển thị QR tại chỗ
        setVnpayUrl(url);
        setShowVnpayQR(true);
        console.log("vnpayUrl hiện tại: ", url);

        showAlert('Vui lòng quét mã QR để thanh toán qua VNPAY');
        setAlertSeverity('info');
        setAlertOpen(true);

        return;
      }

      // Cập nhật hóa đơn khi không phải VNPAY
      await updateHoaDonFull(hoaDonId, {
        ptThanhToanId: selectedPaymentId,
        tongSoLuongSp,
        tongTien,
        hinhThucNhanHang,
        trangThai,
        moTa
      });

      showAlert('Cập nhật hóa đơn thành công!');
      setAlertSeverity('success');
      setAlertOpen(true);

      await exportHoaDonToPDF(hoaDonId);
      await fetchHoaDons();
      setShowVnpayQR(false); // Ẩn QR nếu có hiển thị trước đó
    } catch (err) {
      showAlert('Cập nhật thất bại: ' + (err.message || 'Đã xảy ra lỗi'));
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  const handleXacNhanThanhToan = async (hoaDonId) => {
    const sanPhams = sanPhamsMap[hoaDonId] || [];
    const tongSoLuongSp = sanPhams.reduce((sum, sp) => sum + sp.soLuong, 0);
    const tongTien = sanPhams.reduce((sum, sp) => sum + sp.soLuong * (sp.giaTien || 0), 0);

    if (tongSoLuongSp === 0) {
      showAlert('Không có sản phẩm nào trong hoá đơn!');
      setAlertSeverity('warning');
      setAlertOpen(true);
      return;
    }

    const hinhThucNhanHang = hinhThucNhanHangMap[hoaDonId] || 0;
    const selectedPaymentId = hinhThucThanhToanMap[hoaDonId];
    const trangThai = trangThaiHoaDonMap[hoaDonId] || 6;
    const moTa = moTaHoaDonMap[hoaDonId] || "Đơn hàng tại quầy";

    try {
      // Cập nhật hóa đơn khi không phải VNPAY
      await updateHoaDonFull(hoaDonId, {
        ptThanhToanId: 3,
        tongSoLuongSp,
        tongTien,
        hinhThucNhanHang,
        trangThai,
        moTa
      });

      showAlert('Cập nhật hóa đơn thành công!');
      setAlertSeverity('success');
      setAlertOpen(true);

      await exportHoaDonToPDF(hoaDonId);
      await fetchHoaDons();
      setShowVnpayQR(false); // Ẩn QR nếu có hiển thị trước đó
    } catch (err) {
      showAlert('Cập nhật thất bại: ' + (err.message || 'Đã xảy ra lỗi'));
      setAlertSeverity('error');
      setAlertOpen(true);
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
          <ul style={{ 
            display: 'flex', 
            listStyle: 'none', 
            padding: 0, 
            margin: 0, 
            borderBottom: '1px solid #e2e8f0', 
            backgroundColor: '#f7fafc', 
            borderRadius: '8px 8px 0 0', 
            overflowX: 'auto' 
          }}>
            {hoaDons.map(hd => (
              <li 
                key={hd.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginRight: '4px' 
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    gap: '8px',
                    backgroundColor: activeTab === hd.id ? '#ffffff' : 'transparent',
                    border: activeTab === hd.id ? '1px solid #e2e8f0' : '1px solid transparent',
                    borderBottom: activeTab === hd.id ? 'none' : '1px solid #e2e8f0',
                    borderRadius: activeTab === hd.id ? '6px 6px 0 0' : '0',
                    color: activeTab === hd.id ? '#3182ce' : '#4a5568',
                    fontSize: '0.875rem',
                    fontWeight: activeTab === hd.id ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    position: 'relative',
                    top: activeTab === hd.id ? '1px' : '0',
                  }}
                  onClick={() => setActiveTab(hd.id)}
                  onMouseOver={(e) => activeTab !== hd.id && (e.currentTarget.style.backgroundColor = '#edf2f7', e.currentTarget.style.color = '#3182ce')}
                  onMouseOut={(e) => activeTab !== hd.id && (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#4a5568')}
                >
                  <span>{hd.ma}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteHoaDon(hd.id);
                    }}
                    style={{
                      padding: '2px 6px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#e53e3e',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'color 0.2s, transform 0.2s',
                      lineHeight: 1,
                    }}
                    title="Xoá hoá đơn"
                    onMouseOver={(e) => (e.currentTarget.style.color = '#c53030', e.currentTarget.style.transform = 'scale(1.2)')}
                    onMouseOut={(e) => (e.currentTarget.style.color = '#e53e3e', e.currentTarget.style.transform = 'scale(1)')}
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

              <div key={hd.id} className="row gx-4 border border-top-0 border-end-0 border-start-0 py-3">
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
                                    disabled={sp.soLuong <= 1 || sanPhamGiaThayDoiMap[sp.id]}
                                    title={sanPhamGiaThayDoiMap[sp.id] ? "Sản phẩm có giá thay đổi, chỉ được xóa" : "Giảm"}
                                  >-</button>
                                  <span style={{ minWidth: 32, display: 'inline-block', textAlign: 'center' }}>{sp.soLuong}</span>
                                  <button
                                    className="btn btn-sm btn-outline-secondary"
                                    style={{ minWidth: 28, padding: 0 }}
                                    onClick={() => handleUpdateProduct({ ...sp, soLuong: sp.soLuong + 1 }, hd.id)}
                                    disabled={sp.soLuong >= (khoMap[sp.sanPhamCTId || sp.id] ?? 999999) || sanPhamGiaThayDoiMap[sp.id]}
                                    title={sanPhamGiaThayDoiMap[sp.id] ? "Sản phẩm có giá thay đổi, chỉ được xóa" : "Tăng"}
                                  >+</button>
                                </div>
                              </td>
                              <td>{khoMap[sp.sanPhamCTId || sp.id] ?? ''}</td>
                              <td>
                                <div>
                                  {(sp.giaTien)?.toLocaleString()}₫
                                  {sanPhamGiaThayDoiMap[sp.id] && (
                                    <div>
                                      <small className="text-danger">
                                        (Giá gốc: {(giaGocMap[sp.sanPhamCTId || sp.id] || 0).toLocaleString()}₫)
                                      </small>
                                    </div>
                                  )}
                                </div>
                              </td>
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

                  <h6 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1a202c', marginBottom: '1rem' }}>
                    Thông tin thanh toán
                  </h6>
                  <div style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                  }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#4a5568', marginBottom: '8px', display: 'block' }}>
                      Hình thức thanh toán:
                    </label>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: '#4a5568' }}>
                        <input
                          type="radio"
                          name={`tt-${hd.id}`}
                          checked={hinhThucThanhToanMap[hd.id] === 2}
                          onChange={() => setHinhThucThanhToanMap(prev => ({ ...prev, [hd.id]: 2 }))}
                          style={{ marginRight: '8px', accentColor: '#38a169' }}
                        />
                        Tiền mặt
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: '#4a5568' }}>
                        <input
                          type="radio"
                          name={`tt-${hd.id}`}
                          checked={hinhThucThanhToanMap[hd.id] === 3}
                          onChange={() => setHinhThucThanhToanMap(prev => ({ ...prev, [hd.id]: 3 }))}
                          style={{ marginRight: '8px', accentColor: '#38a169' }}
                        />
                        Chuyển khoản
                      </label>
                    </div>

                    <div style={{ marginTop: '12px', fontSize: '0.875rem', color: '#4a5568' }}>
                      <p style={{ marginBottom: '8px' }}>Tổng tiền: {OriginalPrice(hd.id).toLocaleString()} ₫</p>
                      <p style={{ marginBottom: '8px' }}>Phí vận chuyển: 0 ₫</p>
                      <p style={{ marginBottom: '8px' }}>
                        Giảm giá: <span style={{ fontWeight: '600', color: '#e53e3e' }}>
                          {(OriginalPrice(hd.id) - calculateTotal(hd.id)).toLocaleString()} ₫
                        </span>
                      </p>
                    </div>

                    {hinhThucThanhToanMap[hd.id] !== 3 && (
                      <div style={{ marginTop: '16px' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#4a5568', marginBottom: '8px', display: 'block' }}>
                          Số tiền khách đưa:
                        </label>
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
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            outline: 'none',
                            transition: 'border-color 0.2s, box-shadow 0.2s',
                          }}
                          onFocus={(e) => (e.target.style.borderColor = '#3182ce', e.target.style.boxShadow = '0 0 0 3px rgba(49, 130, 206, 0.1)')}
                          onBlur={(e) => (e.target.style.borderColor = '#e2e8f0', e.target.style.boxShadow = 'none')}
                        />
                        <div style={{ marginTop: '12px', fontSize: '0.875rem', color: '#4a5568' }}>
                          Tiền thừa: <span style={{ fontWeight: '600', color: '#38a169' }}>
                            {tienKhachDuaMap[hd.id]
                              ? (tienKhachDuaMap[hd.id] - calculateTotal(hd.id)).toLocaleString()
                              : 0} ₫
                          </span>
                        </div>
                      </div>
                    )}

                    <h6 style={{ marginTop: '16px', fontSize: '1.125rem', fontWeight: '600', color: '#1a202c' }}>
                      Tổng thanh toán: {calculateTotal(hd.id).toLocaleString()} ₫
                    </h6>
                    <button
                      className="btn btn-success mt-3 w-100"
                      onClick={() => handleXacNhanDonHang(hd.id)}
                      disabled={
                        hinhThucThanhToanMap[hd.id] !== 3 && (
                          !tienKhachDuaMap[hd.id] ||
                          tienKhachDuaMap[hd.id] < calculateTotal(hd.id)
                        )
                      }
                      style={{
                        padding: '10px 16px',
                        backgroundColor: '#38a169',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        width: '100%',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        opacity: (hinhThucThanhToanMap[hd.id] !== 3 && (!tienKhachDuaMap[hd.id] || tienKhachDuaMap[hd.id] < calculateTotal(hd.id))) ? '0.5' : '1',
                      }}
                      onMouseOver={(e) => (e.target.style.backgroundColor = '#2f855a')}
                      onMouseOut={(e) => (e.target.style.backgroundColor = '#38a169')}
                    >
                      Xác nhận đơn hàng
                    </button>

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

                    {showVnpayQR && vnpayUrl && (
                      <div
                        style={{
                          position: 'fixed',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: 'rgba(0, 0, 0, 0.6)',
                          zIndex: 9999,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: '#ffffff',
                            padding: '24px',
                            borderRadius: '12px',
                            textAlign: 'center',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            width: 'fit-content',
                            maxWidth: '90%',
                          }}
                        >
                          <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '12px' }}>
                            <span style={{ color: '#e53e3e' }}>VN</span>
                            <span style={{ color: '#0072bc' }}>PAY</span>
                            <sup style={{ color: '#e53e3e', fontSize: '0.75rem' }}>QR</sup>
                          </div>

                          <div style={{ position: 'relative', display: 'inline-block', padding: '8px' }}>
                            <QRCode value={vnpayUrl} size={180} />
                            <div style={{
                              position: 'absolute',
                              top: -4,
                              left: -4,
                              width: 16,
                              height: 16,
                              borderTop: '3px solid #0072bc',
                              borderLeft: '3px solid #0072bc',
                            }} />
                            <div style={{
                              position: 'absolute',
                              top: -4,
                              right: -4,
                              width: 16,
                              height: 16,
                              borderTop: '3px solid #0072bc',
                              borderRight: '3px solid #0072bc',
                            }} />
                            <div style={{
                              position: 'absolute',
                              bottom: -4,
                              left: -4,
                              width: 16,
                              height: 16,
                              borderBottom: '3px solid #0072bc',
                              borderLeft: '3px solid #0072bc',
                            }} />
                            <div style={{
                              position: 'absolute',
                              bottom: -4,
                              right: -4,
                              width: 16,
                              height: 16,
                              borderBottom: '3px solid #0072bc',
                              borderRight: '3px solid #0072bc',
                            }} />
                          </div>

                          <div style={{ marginTop: '12px', color: '#0072bc', fontStyle: 'italic', fontSize: '0.875rem' }}>
                            Scan to Pay
                          </div>

                          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
                            <button
                              onClick={() => handleXacNhanThanhToan(hd.id)}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: '#38a169',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                              }}
                              onMouseOver={(e) => (e.target.style.backgroundColor = '#2f855a')}
                              onMouseOut={(e) => (e.target.style.backgroundColor = '#38a169')}
                            >
                              Xác nhận thanh toán
                            </button>

                            <button
                              onClick={() => setShowVnpayQR(false)}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: '#e53e3e',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                              }}
                              onMouseOver={(e) => (e.target.style.backgroundColor = '#c53030')}
                              onMouseOut={(e) => (e.target.style.backgroundColor = '#e53e3e')}
                            >
                              Đóng
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <CustomAlert
                  alertOpen={alertOpen}
                  alertMessage={alertMessage}
                  alertSeverity={alertSeverity}
                  onClose={handleCloseAlert}
                />
                <CustomConfirm
                  open={confirmOpen}
                  title={confirmTitle}
                  message={confirmMessage}
                  onCancel={() => setConfirmOpen(false)}
                  onConfirm={handleConfirm}
                />

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
