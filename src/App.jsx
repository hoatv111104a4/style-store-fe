import { BrowserRouter, Routes, Route } from "react-router-dom";
import WebsiteLayout from "./layouts/WebsiteLayout";
import WebsiteHome from "./pages/WebsiteHome";
import WebSiteSidebar from "./components/WebSiteSidebar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import AdminLayout from "./layouts/AdminLayout"; 
import AdminDashboard from "./pages/AdminDashboard";
import Account from "./pages/Account";
import CounterSales from "./pages/CounterSales";
import Discounts from "./pages/Discounts";
import OrderManagement from "./pages/OrderManagement";
import ReturnManagement from "./pages/ReturnManagement";
import Products from "./pages/Products";
import Logout from "./pages/Logout";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Routes cho WebsiteLayout */}
                <Route element={<WebsiteLayout />}>
                    <Route path="/" element={<WebsiteHome />} />
                    <Route path="/san-pham" element={<WebSiteSidebar />} />
                    <Route path="/gioi-thieu" element={<AboutPage />} />
                    <Route path="/lien-he" element={<ContactPage />} />
                    <Route path="/dang-ki" element={<Register />} />
                    <Route path="/dang-nhap" element={<Login />} />
                </Route>
                {/* Routes cho AdminLayout */}
                <Route element={<AdminLayout />}>
                    <Route path="/admin/thong-ke" element={<AdminDashboard />} />
                    <Route path="/admin/ban-hang-tai-quay" element={<CounterSales />} />
                    <Route path="/admin/san-pham" element={<Products />} />
                    <Route path="/admin/quan-ly-don-hang" element={<OrderManagement />} />
                    <Route path="/admin/giam-gia" element={<Discounts />} />
                    <Route path="/admin/tai-khoan" element={<Account />} />
                    <Route path="/admin/quan-ly-tra-hang" element={<ReturnManagement />} />
                    <Route path="/dang-xuat" element={<Logout />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;