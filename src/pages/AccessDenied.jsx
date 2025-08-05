import React from "react";
import { Button, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      sx={{ textAlign: "center", p: 3 }}
    >
      <Typography variant="h4" color="error" gutterBottom>
        Bạn không có quyền truy cập
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Bạn không có đủ quyền để truy cập trang này. Vui lòng đăng nhập lại hoặc quay về trang chủ.
      </Typography>
      <Box>
        <Button
          variant="contained"
          sx={{ mr: 2, backgroundColor: "#ff6600", "&:hover": { backgroundColor: "#e65c00" } }}
          onClick={() => navigate("/")}
        >
          Quay về trang chủ
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate("/login")}
        >
          Đăng nhập
        </Button>
      </Box>
    </Box>
  );
};

export default AccessDenied;