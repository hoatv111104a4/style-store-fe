import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const ContactPage = () => {
  return (
    <div className="contact-page" style={styles.page}>
      {/* Header */}
      <div className="text-center mb-5">
        <h1 style={styles.header}>Liên hệ với StyleStore</h1>
        <p style={styles.subHeader}>Nhóm SD-02, Cao đẳng FPT, Hà Nội | 5 thành viên</p>
      </div>

      <div className="container">
        <div className="row g-4">
          {/* Form liên hệ */}
          <div className="col-lg-6">
            <div className="card shadow-sm border-0 p-4" style={styles.card}>
              <h2 style={styles.sectionTitle}>Gửi tin nhắn cho chúng tôi</h2>
              <form>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label" style={styles.label}>
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    placeholder="Nhập họ và tên"
                    style={styles.input}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label" style={styles.label}>
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder="Nhập email của bạn"
                    style={styles.input}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="phone" className="form-label" style={styles.label}>
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    id="phone"
                    placeholder="Nhập số điện thoại"
                    style={styles.input}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="message" className="form-label" style={styles.label}>
                    Tin nhắn
                  </label>
                  <textarea
                    className="form-control"
                    id="message"
                    rows="5"
                    placeholder="Nhập tin nhắn của bạn"
                    style={styles.textarea}
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  style={styles.submitButton}
                >
                  Gửi tin nhắn
                </button>
              </form>
            </div>
          </div>

          {/* Google Maps Embed */}
          <div className="col-lg-6">
            <h2 style={styles.sectionTitle}>Vị trí của chúng tôi</h2>
            <div className="shadow-sm rounded" style={styles.map}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.856614054536!2d105.5253!3d21.0134!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDAwJzUyLjIiTiAxMDXCsDMxJzMwLjgiRQ!5e0!3m2!1svi!2s!4v1721209895!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="Vị trí Cao đẳng FPT, Hà Nội"
              ></iframe>
            </div>
            <div className="mt-4" style={styles.info}>
              <p className="fw-bold">StyleStore - Nhóm SD-02</p>
              <p>Cao đẳng FPT, Khu Công nghệ cao Hòa Lạc, Hà Nội, Việt Nam</p>
              <p>Email: stylestore@fpt.edu.vn</p>
              <p>Điện thoại: (+84) 123 456 789</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-5" style={styles.footer}>
        <p>© 2025 StyleStore. Được phát triển bởi Nhóm SD-02, Cao đẳng FPT, Hà Nội.</p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
    padding: "3rem 1rem",
  },
  header: {
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#333",
  },
  subHeader: {
    fontSize: "1.1rem",
    color: "#666",
  },
  card: {
    borderRadius: "10px",
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#333",
    marginBottom: "1.5rem",
  },
  label: {
    fontSize: "0.9rem",
    color: "#555",
  },
  input: {
    borderRadius: "6px",
    borderColor: "#ced4da",
    padding: "0.75rem",
    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
  },
  textarea: {
    borderRadius: "6px",
    borderColor: "#ced4da",
    padding: "0.75rem",
    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
  },
  submitButton: {
    backgroundColor: "#ff6600",
    borderColor: "#ff6600",
    padding: "0.75rem",
    fontSize: "1rem",
    fontWeight: "500",
    transition: "background-color 0.3s ease",
  },
  map: {
    height: "400px",
    width: "100%",
    minHeight: "300px",
    borderRadius: "10px",
  },
  info: {
    color: "#555",
    fontSize: "0.95rem",
  },
  footer: {
    color: "#666",
    fontSize: "0.9rem",
  },
};

export default ContactPage;