import React, { useEffect, useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSearch } from '@fortawesome/free-solid-svg-icons';
import { addHDC, getHoaDonByTrangThai, updateHDCTWithKH, updateHoaDonFull, deleteHD, submitVNPayOrder } from '../../../services/Admin/CounterSales/HoaDonSAdmService';
import ProductsSales from '../AttibuteSales/ProductsSales';
import { addHDCT, getHoaDonCTByHoaDonId, updateHDCT, deleteHDCT } from '../../../services/Admin/CounterSales/HoaDonCTSAdmService';
import { getSanPhamCtById } from '../../../services/Admin/SanPhamCTService';
import { getKHBySdt } from '../../../services/Admin/CounterSales/NguoiDungSAdmService';
import Client from './UserSales';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
// import HoaDonPDFExport from './InvoicePDFExport';
import QRCode from "react-qr-code";
import Swal from 'sweetalert2';
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import ReactDOM from 'react-dom/client';
const CounterSalesStyle = `
.table {
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    border: none;
}
.table thead th {
    background: #f8f9fa;
    font-weight: 600;
    color: #222;
    border-bottom: 2px solid #f0f0f0;
    font-size: 15px;
}
.table tbody tr {
    border-bottom: 1px solid #f0f0f0;
}
.table tbody tr:last-child {
    border-bottom: none;
}
.table td, .table th {
    vertical-align: middle;
    border: none;
    font-size: 15px;
}
.table img {
    border-radius: 8px;
    border: 1px solid #eee;
}
.btn, .form-control {
    border-radius: 8px !important;
    font-weight: 500;
    font-size: 15px;
    transition: background 0.2s, color 0.2s;
}
.btn-primary {
    background: #ff6600 !important;
    border-color: #ff6600 !important;
    color: #fff !important;
}
.btn-primary:hover, .btn-primary:focus {
    background: #e65c00 !important;
    border-color: #e65c00 !important;
}
.btn-outline-primary {
    color: #ff6600 !important;
    border-color: #ff6600 !important;
    background: #fff !important;
}
.btn-outline-primary:hover, .btn-outline-primary:focus {
    background: #ff6600 !important;
    color: #fff !important;
}
.btn-secondary {
    background: #f0f0f0 !important;
    color: #333 !important;
    border: none !important;
}
.btn-secondary:hover, .btn-secondary:focus {
    background: #e0e0e0 !important;
}
.btn-info {
    background: #e6f0ff !important;
    color: #1976d2 !important;
    border: none !important;
}
.btn-info:hover, .btn-info:focus {
    background: #bbdefb !important;
    color: #1976d2 !important;
}
.btn-danger {
    background: #ffebee !important;
    color: #d32f2f !important;
    border: none !important;
}
.btn-danger:hover, .btn-danger:focus {
    background: #ffcdd2 !important;
    color: #d32f2f !important;
}
.form-control {
    border: 1px solid #e0e0e0 !important;
    background: #fafbfc !important;
    color: #222 !important;
    box-shadow: none !important;
}
.card {
    border-radius: 12px;
    border: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    background: #fff;
}
.table-bordered > :not(caption) > * > * {
    border-width: 0;
}
`;
const CounterSales = () => {
  const HoaDonPDFExport = React.lazy(() => import('./InvoicePDFExport'));
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
  const [xacNhanKhachHangMap, setXacNhanKhachHangMap] = useState({});
  const [diaChiNhanIdMap, setDiaChiNhanIdMap] = useState({});
  const [soDienThoaiMap, setSoDienThoaiMap] = useState({});
  const [tienThueMap, setTienThueMap] = useState({});
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  const clientRef = useRef(null);

  if (typeof document !== "undefined" && !document.getElementById("dashboard-style")) {
    const style = document.createElement("style");
    style.id = "dashboard-style";
    style.innerHTML = CounterSalesStyle;
    document.head.appendChild(style);
  }
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
  const [tienTraLaiMap, setTienTraLaiMap] = useState({});
  const [showVnpayQR, setShowVnpayQR] = useState(false);
  const [vnpayUrl, setVnpayUrl] = useState('');

  const fetchHoaDons = async () => {
    console.log("Đang gọi fetchHoaDons...");
    try {
      const result = await getHoaDonByTrangThai(6); // Trạng thái 6 là "Đang xử lý"
      console.log("Kết quả gọi API:", result);
      const list = result.content || [];
      setHoaDons(list);
      setActiveTab(prev => {
        if (prev && list.some(hd => hd.id === prev)) {
          return prev; // giữ nguyên tab hiện tại
        }
        return list[0]?.id || null; // nếu tab cũ không tồn tại thì chọn tab đầu
      });
      // if (list.length > 0) setActiveTab(list[0].id);
      setConnectError(false);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error.response?.status, error.message);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        navigate("/access-denied");
      } else {
        toast.error('Bạn không có quyền truy cập!');
        setConnectError(true);
      }
    }
  };

  useEffect(() => {
    const savedMap = JSON.parse(localStorage.getItem('lastSearchSdt') || '{}');
    if (Object.keys(savedMap).length > 0) {
      setSoDienThoaiMap(savedMap);
    }
  }, []);

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
      toast.warning('Chỉ được tạo tối đa 6 hoá đơn cùng lúc!');
      return;
    }
    setLoading(true);
    try {
      const newHoaDon = await addHDC();
      setHoaDons(prev => [...prev, newHoaDon]);
      setSanPhamsMap(prev => ({ ...prev, [newHoaDon.id]: [] }));
      setActiveTab(newHoaDon.id);
      setConnectError(false);
      toast.success('Tạo đơn hàng thành công!');
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error.response?.status, error.message);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        navigate("/access-denied");
      } else {
        toast.error('Bạn không có quyền truy cập!');
        // setConnectError(true);
      }
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
        toast.warning('Mỗi sản phẩm chỉ được thêm tối đa 20 sản phẩm!');
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
      toast.error('Lỗi xử lý sản phẩm: ' + err.message);
    }
  };

  const handleTienKhachDua = (hoaDonId, value) => {
    // Cập nhật tiền khách đưa
    setTienKhachDuaMap(prev => ({ ...prev, [hoaDonId]: value }));

    // Tính tiền trả lại
    const tongThanhToan =
      calculateTotal(hoaDonId) + (hinhThucNhanHangMap[hoaDonId] === 1 ? 30000 : 0);
    const tienThua = value - tongThanhToan;

    // Cập nhật tiền trả lại
    setTienTraLaiMap(prev => ({ ...prev, [hoaDonId]: tienThua }));
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setSoLuongNhap(1);
  };

  const OriginalPrice = (hoaDonId) =>
    sanPhamsMap[hoaDonId]?.reduce((sum, sp) => sum + sp.soLuong * (sp.giaGocSP || 0), 0) || 0;

  const calculateTotal = (hoaDonId) =>
    sanPhamsMap[hoaDonId]?.reduce((sum, sp) => sum + sp.soLuong * (sp.giaTien || 0), 0) || 0;

  const handleOpenPdfInNewTab = async (hoaDonId) => {
    try {
      // 1. Tạo một div tạm thời để render
      const tempDiv = document.createElement('div');
      tempDiv.style.cssText = 'position:absolute; top:0; left:-9999px; background:#fff;';
      document.body.appendChild(tempDiv);

      // 2. Render component vào div tạm
      const { default: HoaDonPDF } = await import('./InvoicePDFExport');
      const root = ReactDOM.createRoot(tempDiv);
      root.render(
        <HoaDonPDF
          hoaDon={hoaDons.find(h => h.id === hoaDonId)}
          sanPhams={sanPhamsMap[hoaDonId] || []}
          tongTien={calculateTotal(hoaDonId)}
          tienThue={hinhThucNhanHangMap[hoaDonId] === 1 ? 30000 : 0}
          soDienThoai={soDienThoaiMap[hoaDonId] || ""}
        />
      );


      // 3. Đợi render hoàn tất
      await new Promise(resolve => setTimeout(resolve, 500));

      // 4. Chụp ảnh và tạo PDF
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        logging: true,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      // 5. Hiển thị PDF
      const pdfUrl = pdf.output('bloburl');
      window.open(pdfUrl, '_blank');

      // 6. Dọn dẹp
      root.unmount();
      document.body.removeChild(tempDiv);

    } catch (error) {
      console.error('Lỗi chi tiết:', error);
      toast.error(`Lỗi khi tạo PDF: ${error.message}`);
    }
  };

  const handleUpdateProduct = async (sp, hoaDonId) => {
    if (!sp.soLuong || isNaN(sp.soLuong) || Number(sp.soLuong) <= 0) return;
    if (Number(sp.soLuong) > 20) {
      toast.warning('Mỗi sản phẩm chỉ được mua tối đa 20 sản phẩm!');
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
      toast.err('Cập nhật thất bại: ' + err.message);
      setConnectError(true);
    }
  };

  const handleDeleteHoaDon = async (hoaDonId) => {
    const result = await Swal.fire({
      title: "Xác nhận xoá hoá đơn",
      text: "Bạn có chắc chắn muốn xoá hoá đơn này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff0000ff",
      cancelButtonColor: "#888",
      confirmButtonText: "Xoá",
      cancelButtonText: "Hủy",
    });
    if (result.isConfirmed) {
      try {
        await deleteHD(hoaDonId); // API soft delete hoặc chuyển trạng thái
        setHoaDons(prev => prev.filter(hd => hd.id !== hoaDonId));
        setActiveTab(prev => {
          if (prev === hoaDonId && hoaDons.length > 1) {
            const remaining = hoaDons.filter(hd => hd.id !== hoaDonId);
            return remaining[0]?.id || null;
          }
          return prev;
        });
        toast.success("Đã xoá hóa đơn!");
      } catch (err) {
        toast.error("Xoá hoá đơn thất bại: " + err.message);
        setConnectError(true);
      }
    }

  };


  const handleDeleteProduct = async (sp, hoaDonId) => {
    const result = await Swal.fire({
      title: "Xác nhận xoá sản phẩm",
      text: "Bạn có chắc chắn muốn xoá sản phẩm này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff0000ff",
      cancelButtonColor: "#888",
      confirmButtonText: "Xoá",
      cancelButtonText: "Hủy",
    });
    if (result.isConfirmed) {
      if (!sp.id) {
        toast.error('Không thể xoá sản phẩm không hợp lệ!');
        return;
      }
      try {
        await deleteHDCT(sp.id);
        const result = await getHoaDonCTByHoaDonId(hoaDonId);
        const list = result.content || [];
        setSanPhamsMap(prev => ({ ...prev, [hoaDonId]: list }));
        setConnectError(false);
        toast.success("Xoá sản phẩm thành công!", { autoClose: 2000 });
      } catch (err) {
        toast.error('Xoá sản phẩm thất bại: ' + err.message);
        setConnectError(true);
      }
    }
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
      toast.warning('Vui lòng nhập số điện thoại khách hàng!');
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
        toast.warning('Không tìm thấy khách hàng!');
      }
    } catch {
      setKhachHangMap(prev => ({
        ...prev,
        [hoaDonId]: null
      }));
      toast.error('Không tìm thấy khách hàng!');
    }
  };

  const handleUpdateHoaDonWithKhachHang = async (hoaDonId, khachHang, hinhThucNhanHang = 0, diaChiNhanId = null) => {
    try {
      await updateHDCTWithKH(hoaDonId, khachHang.id, hinhThucNhanHang, diaChiNhanId);
      toast.success('Cập nhật khách hàng cho hóa đơn thành công!');
      setXacNhanKhachHangMap(prev => ({
        ...prev,
        [hoaDonId]: true
      }));
      await fetchHoaDons();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi cập nhật khách hàng!';
      console.error('Chi tiết lỗi:', err.response?.data?.message);
      toast.error('Cập nhật khách hàng thất bại: ' + errorMessage);
    }
  };

  const handleXacNhanDonHang = async (hoaDonId, hinhThucNhanHang, isVnpayPaymentConfirmed = false) => {
    try {
      const sanPhams = sanPhamsMap[hoaDonId] || [];
      const tongSoLuongSp = sanPhams.reduce((sum, sp) => sum + sp.soLuong, 0);
      let tongTien = sanPhams.reduce((sum, sp) => sum + sp.soLuong * (sp.giaTien || 0), 0);

      let phiShip = 0;
      if (hinhThucNhanHang === 1) {
        phiShip = 30000; // phí ship
        setTienThueMap(prev => {
          const newMap = { ...prev, [hoaDonId]: phiShip };
          console.log("🟢 Sau khi set:", newMap[hoaDonId]); // kiểm tra có giá trị không
          return newMap;
        });
        console.log("Cập nhật phí ship cho hóa đơn:", hoaDonId);
        console.log("Phí ship:", tienThueMap[hoaDonId]);
        console.log("Hình thức nhận hàng:", hinhThucNhanHang);
        tongTien += 30000; // phí ship
      }

      if (tongSoLuongSp === 0) {
        toast.warning('Không có sản phẩm nào trong hoá đơn!');
        return;
      }

      let ptThanhToanId = hinhThucThanhToanMap[hoaDonId] || 2;
      const moTa = moTaHoaDonMap[hoaDonId] || "Đơn hàng tại quầy";

      // Logic xử lý VNPAY
      if (!isVnpayPaymentConfirmed && ptThanhToanId === 3) {
        const donHangData = {
          idDonHang: hoaDonId,
          loaiHoaDon: "TẠI QUẦY",
          phuongThucThanhToan: "VNPAY",
          tongTien: tongTien,
        };

        const url = await submitVNPayOrder(donHangData);
        setVnpayUrl(url);
        setShowVnpayQR(true);
        console.log("vnpayUrl hiện tại: ", url);

        toast.info('Vui lòng quét mã QR để thanh toán qua VNPAY');
        return;
      }

      if (isVnpayPaymentConfirmed) {
        ptThanhToanId = 3;
      }
      let tongTienUpdate = tongTien;
      if (hinhThucNhanHang === 1) {
        tongTienUpdate -= 30000;
      }

      await updateHoaDonFull(hoaDonId, {
        ptThanhToanId,
        tongSoLuongSp,
        tongTien: tongTienUpdate,
        hinhThucNhanHang,
        trangThai: hinhThucNhanHang,
        moTa,
        tienKhachTra: tienKhachDuaMap[hoaDonId] || 0,
        tienThua: tienTraLaiMap[hoaDonId] || 0,
        tienThue: phiShip
      });

      toast.success('Cập nhật hóa đơn thành công!');

      await fetchHoaDons();
      await handleOpenPdfInNewTab(hoaDonId);
      setShowVnpayQR(false);
    } catch (err) {
      toast.error('Cập nhật thất bại: ' + (err.message || 'Đã xảy ra lỗi'));
    }
  };

  const handleXacNhanThanhToan = async (hoaDonId, hinhThucNhanHang) => {
    try {
      const sanPhams = sanPhamsMap[hoaDonId] || [];
      const hoaDon = hoaDons.find(hd => hd.id === hoaDonId);
      const tongSoLuongSp = sanPhams.reduce((sum, sp) => sum + sp.soLuong, 0);
      let tongTien = sanPhams.reduce((sum, sp) => sum + sp.soLuong * (sp.giaTien || 0), 0);
      let tienKhachDua = tongTien;
      let tienThue = 0;
      if (hinhThucNhanHang === 1) {
        tienKhachDua += 30000; // phí ship
        tienThue = 30000;
      }

      await updateHoaDonFull(hoaDonId, {
        ...hoaDon,
        tongSoLuongSp,
        ptThanhToanId: 3,
        moTa: "Đơn hàng tại quầy",
        hinhThucNhanHang,
        trangThai: hinhThucNhanHang,
        tongTien: tongTien,
        tienThue: tienThue,
        tienKhachTra: tienKhachDua,
        tienThua: 0
      });

      toast.success('Cập nhật hóa đơn thành công!');


      await fetchHoaDons();
      await handleOpenPdfInNewTab(hoaDonId);
      setShowVnpayQR(false);

    } catch (error) {
      console.error("Lỗi khi xác nhận thanh toán:", error);
      toast.error('Cập nhật hóa đơn thất bại!');
    }
  };


  return (
    <div className="container-fluid py-4 px-5 bg-white">
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

              <div key={hd.id} className="row gx-4 border border-top-0 border-end-0 border-start-0 py-3">
                <div className="col-md-8">
                  <div className="d-flex justify-content-between mb-3">
                    <button className="btn btn-outline-success" onClick={() => setShowProductModal(true)}>
                      <FontAwesomeIcon icon={faPlus} className="me-1" /> Thêm sản phẩm
                    </button>
                  </div>
                  <table className="table table-bordered align-middle text-center" style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: 40 }}>#</th>
                        <th style={{ minWidth: 80 }}>Mã</th>
                        <th style={{ minWidth: 160 }}>Tên</th>
                        <th style={{ width: 120 }}>Số lượng</th>
                        <th style={{ width: 80 }}>Kho</th>
                        <th style={{ minWidth: 100 }}>Giá</th>
                        <th style={{ width: 80 }}>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(sanPhamsMap[hd.id]?.length ?? 0) === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center text-muted py-4">Chưa có sản phẩm nào</td>
                        </tr>
                      ) : (
                        [...sanPhamsMap[hd.id]]
                          .sort((a, b) => (a.maSanPhamCtAdm || '').localeCompare(b.maSanPhamCtAdm || ''))
                          .map((sp, idx) => (
                            <tr key={sp.id}>
                              <td>{idx + 1}</td>
                              <td>{sp.maSanPhamCtAdm}</td>
                              <td className="text-start">{sp.tenSanPham}</td>
                              <td>
                                <div className="d-flex align-items-center justify-content-center gap-2">
                                  <button
                                    className="btn btn-sm btn-outline-secondary"
                                    style={{ minWidth: 28, padding: 0 }}
                                    onClick={() => handleUpdateProduct({ ...sp, soLuong: sp.soLuong - 1 }, hd.id)}
                                    title={sanPhamGiaThayDoiMap[sp.id] ? "Sản phẩm có giá thay đổi, chỉ được xóa hoặc giảm" : "Giảm"}
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
                                        (Giá mới: {(giaGocMap[sp.sanPhamCTId || sp.id] || 0).toLocaleString()}₫)
                                      </small>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td>
                                <button className="btn btn-link p-0 text-danger" title="Xoá" onClick={() => handleDeleteProduct(sp, hd.id)}>
                                  <FontAwesomeIcon icon={faTrash} size="lg" />
                                </button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="col-md-4">
                  <Client
                    ref={clientRef}
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
                    daXacNhan={xacNhanKhachHangMap[hd.id] || false}
                    setXacNhanKhachHangMap={setXacNhanKhachHangMap}
                    handleXacNhanKhachHang={handleUpdateHoaDonWithKhachHang}
                    trangThai={trangThaiHoaDonMap[hd.id] || 0}
                    setTrangThai={val =>
                      setTrangThaiHoaDonMap(prev => ({ ...prev, [hd.id]: val }))
                    }
                    moTa={moTaHoaDonMap[hd.id] || ''}
                    setMoTa={val =>
                      setMoTaHoaDonMap(prev => ({ ...prev, [hd.id]: val }))
                    }
                    diaChiNhanId={diaChiNhanIdMap[hd.id] || null}
                    setDiaChiNhanId={val =>
                      setDiaChiNhanIdMap(prev => ({ ...prev, [hd.id]: val }))
                    }
                    setSoDienThoai={soDienThoai =>
                      setSoDienThoaiMap(prev => ({ ...prev, [hd.id]: soDienThoai }))
                    }
                  />



                  <h6 className="fw-bold">Thông tin thanh toán</h6>
                  <div className="border p-3">
                    <label>Hình thức thanh toán:</label><br />
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

                    <div className="mt-2">
                      <p>Tổng tiền: {OriginalPrice(hd.id).toLocaleString()} ₫</p>
                      <p>
                        Phí vận chuyển:{" "}
                        {(hinhThucNhanHangMap[hd.id] === 1 ? 30000 : 0).toLocaleString()} ₫
                      </p>
                      <p>
                        Giảm giá: <strong>
                          {(OriginalPrice(hd.id) - calculateTotal(hd.id)).toLocaleString()} ₫
                        </strong>
                      </p>
                    </div>

                    {hinhThucThanhToanMap[hd.id] !== 3 && (
                      <div className="mt-3">
                        <label>Số tiền khách đưa:</label>
                        <input
                          type="number"
                          className="form-control"
                          min={0}
                          value={tienKhachDuaMap[hd.id] || ''}
                          onChange={e => handleTienKhachDua(hd.id, Number(e.target.value))}
                          placeholder="Nhập số tiền khách đưa"
                        />
                        <div className="mt-2">
                          Tiền thừa:&nbsp;
                          <strong>
                            {tienTraLaiMap[hd.id] !== undefined
                              ? tienTraLaiMap[hd.id] < 0
                                ? "Vui lòng đưa đủ tiền"
                                : `${tienTraLaiMap[hd.id].toLocaleString()} ₫`
                              : 0}
                          </strong>
                        </div>
                      </div>
                    )}
                    <h6 className="mt-3">
                      Tổng thanh toán: {(
                        calculateTotal(hd.id) +
                        (hinhThucNhanHangMap[hd.id] === 1 ? 30000 : 0)
                      ).toLocaleString()} ₫
                    </h6>
                    <h6 className="mt-3" style={{ display: 'none' }}>
                      Tổng thanh toán: {calculateTotal(hd.id).toLocaleString()} ₫
                    </h6>

                    <button
                      className="btn btn-success mt-3 w-100"
                      onClick={async () => {
                        handleXacNhanDonHang(hd.id, hinhThucNhanHangMap[hd.id]);
                      }}
                      disabled={
                        !xacNhanKhachHangMap[hd.id] || (
                          hinhThucThanhToanMap[hd.id] !== 3 &&
                          (
                            !tienKhachDuaMap[hd.id] ||
                            tienKhachDuaMap[hd.id] < (calculateTotal(hd.id) + (hinhThucNhanHangMap[hd.id] === 1 ? 30000 : 0))
                          )
                        )
                      }
                    >
                      Xác nhận đơn hàng
                    </button>
                    {showPdfPreview && (
                      <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999 }}>
                        <React.Suspense fallback={<div>Đang tải hóa đơn...</div>}>
                          {hoaDons.map(hd => (
                            <HoaDonPDFExport
                              key={`pdf-${hd.id}`}
                              ref={el => {
                                if (el) {
                                  hoaDonRefs.current[hd.id] = el;
                                  console.log(`Đã gán ref cho ${hd.id}`, el);
                                }
                              }}
                              hoaDon={hd}
                              sanPhams={sanPhamsMap[hd.id] || []}
                              tongTien={calculateTotal(hd.id)}
                              tienThue={hinhThucNhanHangMap[hd.id] === 1 ? 30000 : 0}
                              soDienThoai={soDienThoaiMap[hd.id] || ""}
                            />
                          ))}
                        </React.Suspense>
                      </div>
                    )}
                    {showVnpayQR && vnpayUrl && (
                      <div
                        style={{
                          position: "fixed",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: "rgba(0,0,0,0.5)",
                          zIndex: 9999,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          style={{
                            background: "white",
                            padding: "24px 32px",
                            borderRadius: "12px",
                            textAlign: "center",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                            width: "fit-content",
                            position: "relative",
                          }}
                        >
                          {/* Logo chữ VNPAYQR */}
                          <div style={{ fontWeight: "bold", fontSize: 24, marginBottom: 10 }}>
                            <span style={{ color: "red" }}>VN</span>
                            <span style={{ color: "#0072bc" }}>PAY</span>
                            <sup style={{ color: "red", fontSize: 12 }}>QR</sup>
                          </div>

                          {/* QR code + góc xanh */}
                          <div style={{ position: "relative", display: "inline-block" }}>
                            <QRCode value={vnpayUrl} size={200} />

                            {/* Viền 4 góc xanh giống mẫu */}
                            {/* Trên trái */}
                            <div style={{
                              position: "absolute",
                              top: -8,
                              left: -8,
                              width: 20,
                              height: 20,
                              borderTop: "3px solid #0072bc",
                              borderLeft: "3px solid #0072bc",
                            }} />
                            {/* Trên phải */}
                            <div style={{
                              position: "absolute",
                              top: -8,
                              right: -8,
                              width: 20,
                              height: 20,
                              borderTop: "3px solid #0072bc",
                              borderRight: "3px solid #0072bc",
                            }} />
                            {/* Dưới trái */}
                            <div style={{
                              position: "absolute",
                              bottom: -8,
                              left: -8,
                              width: 20,
                              height: 20,
                              borderBottom: "3px solid #0072bc",
                              borderLeft: "3px solid #0072bc",
                            }} />
                            {/* Dưới phải */}
                            <div style={{
                              position: "absolute",
                              bottom: -8,
                              right: -8,
                              width: 20,
                              height: 20,
                              borderBottom: "3px solid #0072bc",
                              borderRight: "3px solid #0072bc",
                            }} />
                          </div>

                          {/* Scan to Pay */}
                          <div style={{ marginTop: 8, color: "#0072bc", fontStyle: "italic" }}>
                            Scan to Pay
                          </div>

                          {/* Nút xác nhận và đóng */}
                          <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 24 }}>
                            <button
                              onClick={() => handleXacNhanThanhToan(hd.id, hinhThucNhanHangMap[hd.id])}
                              style={{
                                padding: "8px 16px",
                                backgroundColor: "#38a169",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                              }}
                            >
                              Xác nhận thanh toán
                            </button>

                            <button
                              onClick={() => setShowVnpayQR(false)}
                              style={{
                                padding: "8px 16px",
                                backgroundColor: "#e53e3e",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                              }}
                            >
                              Đóng
                            </button>
                          </div>
                        </div>
                      </div>
                    )}


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
