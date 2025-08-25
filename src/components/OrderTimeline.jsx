import React from "react";
import { ProgressBar, Step } from "react-step-progress-bar";
import "react-step-progress-bar/styles.css";
import { 
  FaBox, 
  FaClipboardCheck, 
  FaShippingFast, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaUndoAlt 
} from "react-icons/fa";

// ...existing code...
const statusConfig = {
  0: { 
    label: "Chờ xác nhận", 
    icon: FaClipboardCheck, 
    color: "#ff9800",
    percentage: 15 
  },
  1: { 
    label: "Chờ lấy hàng", 
    icon: FaBox, 
    color: "#2196f3",
    percentage: 45 
  },
  2: { 
    label: "Đang giao hàng", 
    icon: FaShippingFast, 
    color: "#4caf50",
    percentage: 75 
  },
  3: { 
    label: "Giao thành công", 
    icon: FaCheckCircle, 
    color: "#8bc34a",
    percentage: 100 
  },
  4: { 
    label: "Đã hủy", 
    icon: FaTimesCircle, 
    color: "#f44336"
  },
  5: { 
    label: "Đã hoàn trả", 
    icon: FaUndoAlt, 
    color: "#9c27b0"
  },
  default: { 
    label: "Chưa xác định", 
    icon: FaTimesCircle, 
    color: "#9e9e9e" // Xám
  }
};

const mainPath = [0, 1, 2, 3];
// ...existing code...

const OrderTimeline = ({ trangThaiDonHang }) => {
  // Ép kiểu trangThaiDonHang thành số
  const validTrangThai = Math.max(0, Math.min(5, Number(trangThaiDonHang) || 0));
  const currentStatus = statusConfig[validTrangThai] || statusConfig.default;
  const isMainPath = mainPath.includes(validTrangThai);
  const progressPercent = isMainPath ? (currentStatus.percentage || 0) : 0;

  console.log("trangThaiDonHang:", trangThaiDonHang, "validTrangThai:", validTrangThai);

  if (!isMainPath && (validTrangThai === 3 || validTrangThai === 5)) {
    const Icon = currentStatus.icon;
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Trạng thái đơn hàng</h3>
        <div style={{ ...styles.specialStatus, borderColor: currentStatus.color }}>
          <Icon size={40} color={currentStatus.color} />
          <div style={{ ...styles.specialStatusText, color: currentStatus.color }}>
            {currentStatus.label}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Trạng thái đơn hàng</h3>
      <div style={{ marginBottom: "50px" }}>
        <ProgressBar
          percent={progressPercent}
          filledBackground={`linear-gradient(to right, ${statusConfig[0].color}, ${statusConfig[4].color})`}
          height={6}
        >
          {mainPath.map((statusId, index) => {
            const stepConfig = statusConfig[statusId];
            const Icon = stepConfig.icon;
            return (
              <Step transition="scale" key={index}>
                {({ accomplished }) => (
                  <div style={{
                    ...styles.stepIconContainer,
                    backgroundColor: accomplished ? stepConfig.color : "#e0e0e0",
                  }}>
                    <Icon color="white" size={20} />
                  </div>
                )}
              </Step>
            );
          })}
        </ProgressBar>
      </div>
      <div style={styles.labelContainer}>
        {mainPath.map((statusId) => {
          const stepConfig = statusConfig[statusId];
          const isAccomplished = (statusConfig[validTrangThai]?.percentage || 0) >= stepConfig.percentage;
          const isActive = validTrangThai === statusId;
          return (
            <div
              key={statusId}
              style={{
                ...styles.labelText,
                fontWeight: isActive ? 'bold' : 'normal',
                color: isAccomplished ? stepConfig.color : '#666',
              }}
            >
              {stepConfig.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    maxWidth: "800px",
    margin: "40px auto",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  title: {
    textAlign: "center",
    color: "#333",
    marginBottom: "40px",
    fontWeight: "600",
  },
  stepIconContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "3px solid white",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
  },
  labelContainer: {
    display: "flex",
    justifyContent: "space-between",
    position: 'relative',
    top: '-35px'
  },
  labelText: {
    width: '100px',
    textAlign: 'center',
    fontSize: '14px',
    transition: 'all 0.3s ease',
  },
  specialStatus: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px',
    border: '2px dashed',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
  },
  specialStatusText: {
    marginTop: '15px',
    fontSize: '20px',
    fontWeight: 'bold',
  }
};

export default OrderTimeline;