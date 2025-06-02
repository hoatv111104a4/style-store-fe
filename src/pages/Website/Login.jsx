import PasswordInput from "../../components/PasswordInput";

const Login = () => {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div className="bg-white shadow p-4 rounded" style={{ border: "2px solid #fff", boxShadow: "0 0 16px #ddd", maxWidth: "400px", width: "100%", }}>
        <h3 className="text-center mb-4 text-dark">Đăng nhập</h3>
        <form>
          <div className="row mb-3">
            <label htmlFor="email" className="col-sm-4 col-form-label">Gmail</label>
            <div className="col-sm-8">
              <input type="email" className="form-control" id="email" placeholder="Nhập gmail" />
            </div>
          </div>
          <div className="row mb-3">
            <label htmlFor="password" className="col-sm-4 col-form-label">Mật khẩu</label>
            <div className="col-sm-8">
              <PasswordInput type="password" className="form-control" id="password" placeholder="Nhập mật khẩu" />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-sm-8 offset-sm-4">
              <a href="#" className="text-decoration-none text-primary" style={{ fontSize: "0.95rem" }}>
                Quên mật khẩu?
              </a>
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-100">Đăng nhập</button>
        </form>
      </div>
    </div>
  )
}

export default Login;