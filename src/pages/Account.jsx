// const Account = () => {
//     return(
//         <div className="admin-account">
//             <h1>Quản lý tài khoản 111</h1>
                     
//         </div>
//     )
// }

// export default Account;
import React, { useState } from "react";

const Account = () => {
    const [email, setEmail] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [activeTab, setActiveTab] = useState("changePassword");

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Đổi mật khẩu thành công (demo)");
    };

    const styles = {
        container: {
            maxWidth: "800px",
            margin: "auto",
            padding: "20px",
            fontFamily: "Arial, sans-serif",
            background: "#f4f6f9",
            borderRadius: "10px",
        },
        title: {
            textAlign: "center",
            color: "#0d6efd", // xanh dương đậm
            marginBottom: "20px",
        },
        infoBox: {
            display: "flex",
            justifyContent: "space-between",
            background: "#ffffff",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
            border: "1px solid #dce3eb",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
        },
        tabs: {
            display: "flex",
            borderBottom: "1px solid #0d6efd",
            marginBottom: "20px",
        },
        tab: (isActive) => ({
            flex: 1,
            textAlign: "center",
            padding: "10px",
            cursor: "pointer",
            background: isActive ? "#0d6efd" : "#ffffff", // Nền xanh khi active, trắng khi không
            color: isActive ? "#ffffff" : "#0d6efd", // Chữ trắng khi active, xanh khi không
            border: "1px solid #0d6efd",
            borderBottom: isActive ? "none" : "1px solid #0d6efd",
            fontWeight: isActive ? "bold" : "normal",
            transition: "0.3s",
        }),
        formBox: {
            background: "#ffffff",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #dce3eb",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
        },
        label: {
            display: "block",
            marginTop: "10px",
            fontWeight: "bold",
            color: "#333",
        },
        input: {
            width: "100%",
            padding: "8px",
            marginTop: "5px",
            border: "1px solid #cce0ff",
            borderRadius: "6px",
            backgroundColor: "#fefefe",
            outlineColor: "#0d6efd"
        },
        button: {
            background: "#0d6efd",
            color: "white",
            border: "none",
            padding: "10px 15px",
            marginTop: "15px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
        },
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Quản lý tài khoản</h1>

            {/* Thông tin tài khoản */}
            <div style={styles.infoBox}>
                <div>
                    <h4>Tran Van Hoa</h4>
                    <p>Ngày sinh: 31/12/2004</p>
                    <p>Số lượng đơn hàng: 10</p>
                    <p>Số tiền đã chi: 10.200.000 ₫</p>
                </div>
                <div>
                    <p><strong>Địa chỉ:</strong> Việt nam</p>
                    <p><strong>Email:</strong> hoa573898@gmail.com</p>
                    <p><strong>Phone:</strong> 0123456789</p>
                </div>
            </div>

            {/* Thanh tab */}
            <div style={styles.tabs}>
                <div
                    style={styles.tab(activeTab === "info")}
                    onClick={() => setActiveTab("info")}
                >
                    Thông tin tài khoản
                </div>
                <div
                    style={styles.tab(activeTab === "changePassword")}
                    onClick={() => setActiveTab("changePassword")}
                >
                    Thay đổi mật khẩu
                </div>
                <div
                    style={styles.tab(activeTab === "orders")}
                    onClick={() => setActiveTab("orders")}
                >
                    Lịch sử đơn hàng
                </div>
            </div>

            {/* Nội dung tab */}
            {activeTab === "changePassword" && (
                <form style={styles.formBox} onSubmit={handleSubmit}>
                    <h3 style={{ color: "#0d6efd", marginBottom: "15px" }}>Thay đổi mật khẩu</h3>

                    <label style={styles.label}>Email</label>
                    <input
                        type="email"
                        placeholder="Nhập email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={styles.input}
                    />

                    <label style={styles.label}>Mật khẩu cũ</label>
                    <input
                        type="password"
                        placeholder="Nhập mật khẩu cũ"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                        style={styles.input}
                    />

                    <label style={styles.label}>Mật khẩu mới</label>
                    <input
                        type="password"
                        placeholder="Nhập mật khẩu mới"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        style={styles.input}
                    />

                    <button type="submit" style={styles.button}>
                        Thay đổi
                    </button>
                </form>
            )}

            {activeTab === "info" && (
                <div style={styles.formBox}>
                    <p>Đây là thông tin tài khoản.</p>
                </div>
            )}

            {activeTab === "orders" && (
                <div style={styles.formBox}>
                    <p>Lịch sử đơn hàng sẽ hiển thị ở đây.</p>
                </div>
            )}
        </div>
    );
};

export default Account;

