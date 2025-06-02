import PasswordInput from "../../components/PasswordInput";

const Register = () => {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div className="bg-white shadow p-4 rounded" style={{ border: "2px solid #fff", boxShadow: "0 0 16px #ddd", maxWidth: "450px", width: "100%",}}>
        <h3 className="text-center mb-4 text-dark">Đăng ký tài khoản</h3>
        <form>
          <div className="row mb-3">
            <label htmlFor="fullName" className="col-sm-4 col-form-label">Họ và tên</label>
            <div className="col-sm-8">
              <input type="text" className="form-control" id="fullName" />
            </div>
          </div>
          <div className="row mb-3">
            <label htmlFor="email" className="col-sm-4 col-form-label">Email</label>
            <div className="col-sm-8">
              <input type="email" className="form-control" id="email" />
            </div>
          </div>
          <div className="row mb-3">
            <label htmlFor="phone" className="col-sm-4 col-form-label">Số điện thoại</label>
            <div className="col-sm-8">
              <input type="tel" className="form-control" id="phone" />
            </div>
          </div>
          <div className="row mb-3">
            <label htmlFor="password" className="col-sm-4 col-form-label">Mật khẩu</label>
            <div className="col-sm-8">
              <PasswordInput type="password" className="form-control" id="password" />
            </div>
          </div>
          <div className="row mb-3">
            <label htmlFor="confirmPassword" className="col-sm-4 col-form-label">Xác nhận</label>
            <div className="col-sm-8">
              <PasswordInput type="password" className="form-control" id="confirmPassword" />
            </div>
          </div>
          <div className="row mb-3">
            <label htmlFor="dob" className="col-sm-4 col-form-label">Ngày sinh</label>
            <div className="col-sm-8">
              <input type="date" className="form-control" id="dob" />
            </div>
          </div>
          <fieldset className="row mb-3">
            <legend className="col-form-label col-sm-4 pt-0">Giới tính</legend>
            <div className="col-sm-8">
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="radio" name="gender" id="male" value="male" />
                <label className="form-check-label" htmlFor="male">Nam</label>
              </div>
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="radio" name="gender" id="female" value="female" />
                <label className="form-check-label" htmlFor="female">Nữ</label>
              </div>
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="radio" name="gender" id="other" value="other" />
                <label className="form-check-label" htmlFor="other">Khác</label>
              </div>
            </div>
          </fieldset>
          <div className="row mb-3">
            <div className="col-sm-8 offset-sm-4">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="agree" />
                <label className="form-check-label" htmlFor="agree">
                  Tôi đồng ý với điều khoản
                </label>
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-100">Đăng ký</button>
        </form>
      </div>
    </div>
  )
}

export default Register;