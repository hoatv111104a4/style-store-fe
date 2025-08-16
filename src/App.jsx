import { BrowserRouter, Routes, Route } from "react-router-dom";
import WebsiteLayout from "./layouts/WebsiteLayout";
import WebsiteHome from "./pages/Website/WebsiteHome";
import WebSiteSidebar from "./components/WebSiteSidebar";
import Register from "./pages/Website/Register";
import Login from "./pages/Website/Login";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import CounterSales from "./pages/Admin/AttibuteSales/CounterSales";
import Discounts from "./pages/Admin/Discounts";
import OrderManagement from "./pages/Admin/OrderManagement";
import OrderDetailAdmin from "./pages/Admin/OrderDetail";
import ReturnManagement from "./pages/Admin/ReturnManagement";
import Logout from "./pages/Admin/Logout";
import AboutPage from "./pages/Website/AboutPage";
import ContactPage from "./pages/Website/ContactPage";
import Customer from "./pages/Admin/AttibuteAcount/CustomerPage";
import StaffPage from "./pages/Admin/AttibuteAcount/StaffPage";
import BrandPage from "./pages/Admin/AttributeProduct/BrandPage";
import ColorPage from "./pages/Admin/AttributeProduct/ColorPage";
import MaterialPage from "./pages/Admin/AttributeProduct/MaterialPage";
import SizePage from "./pages/Admin/AttributeProduct/SizePage";
import OriginPage from "./pages/Admin/AttributeProduct/OriginPage";
import Products from "./pages/Admin/AttributeProduct/Products";
import DetailProduct from "./pages/Website/DetailProduct";
import SanPhamCtPage from "./pages/Admin/AttributeProduct/SanPhamCtPage";
import AddProductWithDetailsPage from "./pages/Admin/AttributeProduct/AddProductWithDetailsPage";
import CheckOutPage from "./pages/Website/CheckOutPage";
import ScrollToTop from "./components/ScrollToTop";
import { ToastContainer } from "react-toastify";
import HistoryOrder from "./pages/Website/HistoryOrder";
import AddVoucher from "./pages/Website/AddVocher";
import PaymentSuccess from "./pages/Website/PaymentSuccess";
import StaffList from "./pages/Admin/Staff";
import CustomerList from "./pages/Admin/Customer";
import AddStaff from "./pages/Admin/AddStaff";
import UpdateStaff from "./pages/Admin/UpdateStaff";
import AddCustomer from "./pages/Admin/AddCustomer";
import UpdateCustomer from "./pages/Admin/UpdateCustomer";
import OrderDetail from "./pages/Website/OrderDetail";
import UpdateVoucher from "./pages/Admin/UpdateVoucher";
import AccessDenied from "./pages/AccessDenied";
import UserProfile from "./pages/MyInfo";
import AdminLogin from "./pages/AdminLogin";
import UserProfileAdmin from "./pages/MyInfoAdmin";
import HoaDonAdminList from "./pages/Admin/HoaDonAdminNew";
import HoaDonDetailPage from "./pages/Admin/ChiTietHoaDonAdmin";
import SanPhamAdminPage from "./pages/Admin/SanPhamAdminPage";
import AddSanPhamChiTietAdmin from "./pages/Admin/AddSanPhamAdminNew";
import UpdateSpCtPage from "./pages/Admin/UpdateSpCtModal";
function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ToastContainer position="top-right" autoClose={2000} />

      <Routes>
        {/* Routes cho WebsiteLayout */}
        <Route element={<WebsiteLayout />}>
          <Route path="/" element={<WebsiteHome />} />
          <Route path="/san-pham" element={<WebSiteSidebar />} />
          <Route path="/lien-he" element={<ContactPage />} />
          <Route path="/website/san-pham/chi-tiet-san-pham/:id" element={<DetailProduct />} />
          <Route path="/website/dat-hang" element={<CheckOutPage />} />
          <Route path="/website/dat-hang/lich-su-dat-hang" element={<HistoryOrder />} />
          <Route path="/website/dat-hang/lich-su-dat-hang/chi-tiet-don-hang/:orderId" element={<OrderDetail />} />
          <Route path="/thanh-toan-thanh-cong" element={<PaymentSuccess />} />
          <Route path="/thanh-toan-that-bai" element={<PaymentSuccess />} />
          <Route path="/website/thong-tin-ca-nhan" element={<UserProfile />} />
        </Route>

        <Route element={<AdminLayout />}>
          <Route path="/admin/thong-ke" element={<AdminDashboard />} />
          <Route path="/admin/ban-hang-tai-quay" element={<CounterSales />} />
          <Route path="/admin/quan-ly-hoa-don" element={<HoaDonAdminList />} />
          <Route path="/admin/giam-gia" element={<Discounts />} />
          <Route path="/admin/quan-ly-tra-hang" element={<ReturnManagement />} />
          <Route path="/dang-xuat" element={<Logout />} />
          <Route path="/admin/tai-khoan/khach-hang" element={<CustomerList />} />
          <Route path="/admin/tai-khoan/nhan-vien" element={<StaffList />} />
          <Route path="/admin/quan-ly-sp/mau-sac" element={<ColorPage />} />
          <Route path="/admin/quan-ly-sp/thuong-hieu" element={<BrandPage />} />
          <Route path="/admin/quan-ly-sp/chat-lieu" element={<MaterialPage />} />
          <Route path="/admin/quan-ly-sp/kich-thuoc" element={<SizePage />} />
          <Route path="/admin/quan-ly-sp/xuat-xu" element={<OriginPage />} />
          <Route path="/admin/quan-ly-sp/san-pham" element={<Products />} />
          <Route path="/admin/san-pham-chi-tiet/:sanPhamId" element={<SanPhamAdminPage />} />
          <Route path="/admin/quan-ly-sp/them-san-pham" element={<AddSanPhamChiTietAdmin />} />
          <Route path="/admin/giam-gia/them-phieu-giam-gia" element={<AddVoucher />} />
          <Route path="/admin/giam-gia/chi-tiet/:id" element={<UpdateVoucher />} />
          <Route path="/admin/hoa-don/chi-tiet-hoa-don/:id" element={<HoaDonDetailPage />} />
          <Route path="/admin/tai-khoan/nhan-vien/them-nhan-vien" element={<AddStaff />} />
          <Route path="/admin/tai-khoan/nhan-vien/chi-tiet/:id" element={<UpdateStaff />} />
          <Route path="/admin/tai-khoan/khach-hang/them-khach-hang" element={<AddCustomer />} />
          <Route path="/admin/tai-khoan/khach-hang/chi-tiet/:id" element={<UpdateCustomer />} />
          <Route path="/website/thong-tin-ca-nhan-cua-toi" element={<UserProfileAdmin />} />
          <Route path="/admin/san-pham-chi-tiet/chi-tiet/:id" element={<UpdateSpCtPage />} />

        </Route>
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="/styleStore/login/admin" element={<AdminLogin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;