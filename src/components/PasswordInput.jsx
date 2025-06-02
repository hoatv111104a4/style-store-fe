import React, { useState } from "react";

const PasswordInput = ({ id, placeholder }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="input-group">
      <input
        type={show ? "text" : "password"}
        className="form-control"
        id={id}
        placeholder={placeholder}
      />
      <button
        type="button"
        className="btn btn-outline-secondary"
        tabIndex={-1}
        onClick={() => setShow((prev) => !prev)}
      >
        <i className={`bi ${show ? "bi-eye-slash" : "bi-eye"}`}></i>
      </button>
    </div>
  );
};

export default PasswordInput;