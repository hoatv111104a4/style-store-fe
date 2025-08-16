import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllChatLieu, addChatLieu, updateChatLieu, deleteChatLieu, searchChatLieuByName } from '../../../services/Admin/ChatLieuService';
import {
  Box,
  Button,
  Typography,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Grid,
  useMediaQuery,
  Pagination,
} from '@mui/material';
import { useTheme, styled } from '@mui/material/styles';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Sync as SyncIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const orange = '#ff8800';
const black = '#222';
const white = '#fff';

const OrangeButton = styled(Button)(({ theme }) => ({
  backgroundColor: orange,
  color: white,
  '&:hover': {
    backgroundColor: '#ff9900',
  },
  borderRadius: 12,
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: '0 2px 8px rgba(255,136,0,0.08)',
}));

const MaterialPage = () => {
  const [materials, setMaterials] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [formData, setFormData] = useState({
    ma: '',
    ten: '',
    ngayTao: '',
    ngaySua: '',
    ngayXoa: null,
    moTa: '',
    trangThai: 1,
  });
  const [formErrors, setFormErrors] = useState({});
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null });
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const fetchData = useCallback(async (page, size, search = '') => {
    try {
      setLoading(true);
      if (search) setSearchLoading(true);
      setError(null);
      let response;
      if (search && search.trim().length >= 5 && /^[\p{L}\s]+$/u.test(search.trim())) {
        response = await searchChatLieuByName(search.trim(), page, size);
      } else {
        response = await getAllChatLieu(page, size);
      }
      setMaterials(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu từ server');
    } finally {
      setLoading(false);
      if (search) setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(currentPage, pageSize, searchTerm);
  }, [currentPage, pageSize, searchTerm, fetchData]);

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  const validateForm = useCallback(async () => {
    const errors = {};
    if (!formData.ten?.trim()) {
      errors.ten = 'Tên chất liệu không được để trống';
    } else if (!formData.ten.trim().match(/^[\p{L}\s]+$/u)) {
      errors.ten = 'Tên chỉ được chứa chữ cái và khoảng trắng';
    } else if (formData.ten.length > 50) {
      errors.ten = 'Tên không được vượt quá 50 ký tự';
    } else {
      try {
        const response = await searchChatLieuByName(formData.ten.trim(), 0, 10);
        const existingMaterials = response.content || [];
        const isDuplicate = existingMaterials.some(
          (material) =>
            material.ten.toLowerCase() === formData.ten.trim().toLowerCase() &&
            (!selectedMaterial || material.id !== selectedMaterial.id)
        );
        if (isDuplicate) {
          errors.ten = 'Tên chất liệu đã tồn tại';
        }
      } catch (err) {
        errors.ten = 'Không thể kiểm tra tên chất liệu';
      }
    }
    if (formData.moTa?.length > 255) {
      errors.moTa = 'Mô tả không được vượt quá 255 ký tự';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, selectedMaterial]);

  const handleAdd = useCallback(() => {
    setFormData({
      ma: '',
      ten: '',
      ngayTao: new Date().toISOString(),
      ngaySua: new Date().toISOString(),
      ngayXoa: null,
      moTa: '',
      trangThai: 1,
    });
    setFormErrors({});
    setAlertMessage('');
    setSelectedMaterial(null);
    setIsViewMode(false);
    setIsModalOpen(true);
  }, []);

  const handleViewOrEdit = useCallback((material, viewOnly = false) => {
    setFormData({
      ...material,
      ngayTao: material.ngayTao || '',
      ngaySua: material.ngaySua || '',
      ngayXoa: material.ngayXoa || null,
      trangThai: material.trangThai || 1,
    });
    setFormErrors({});
    setAlertMessage('');
    setSelectedMaterial(material);
    setIsViewMode(viewOnly);
    setIsModalOpen(true);
  }, []);

  const handleSave = useCallback(
    async (e) => {
      e.preventDefault();
      const isValid = await validateForm();
      if (!isValid) {
        setAlertMessage('Vui lòng kiểm tra lại thông tin đã nhập');
        setAlertType('error');
        return;
      }
      try {
        const now = new Date().toISOString();
        const materialToSave = {
          ...formData,
          ma: selectedMaterial ? formData.ma : `CL-${crypto.randomUUID().substring(0, 8)}`,
          trangThai: 1,
          ngayTao: selectedMaterial ? formData.ngayTao : now,
          ngaySua: now,
          ngayXoa: formData.trangThai === 0 ? now : null,
        };
        if (selectedMaterial) {
          await updateChatLieu(selectedMaterial.id, materialToSave);
          setMaterials((prev) =>
            prev.map((m) => (m.id === selectedMaterial.id ? { ...m, ...materialToSave } : m))
          );
          setAlertMessage(`Cập nhật chất liệu "${materialToSave.ten}" thành công`);
        } else {
          await addChatLieu(materialToSave);
          await fetchData(currentPage, pageSize, searchTerm);
          setAlertMessage(`Thêm chất liệu "${materialToSave.ten}" thành công`);
        }
        setAlertType('success');
        setIsModalOpen(false);
      } catch (err) {
        setAlertMessage(`Thao tác thất bại: ${err.response?.data?.message || err.message}`);
        setAlertType('error');
      }
    },
    [formData, selectedMaterial, currentPage, pageSize, searchTerm, validateForm, fetchData]
  );

  const handleDelete = useCallback(async () => {
    try {
      await deleteChatLieu(confirmModal.id);
      await fetchData(currentPage, pageSize, searchTerm);
      setAlertMessage('Cập nhật trạng thái thành công');
      setAlertType('success');
    } catch (err) {
      setAlertMessage(`Cập nhật trạng thái thất bại: ${err.message}`);
      setAlertType('error');
    } finally {
      setConfirmModal({ open: false, id: null });
    }
  }, [confirmModal.id, currentPage, pageSize, searchTerm, fetchData]);

  const handlePageChange = useCallback((event, value) => {
    setCurrentPage(value - 1);
  }, []);

  const handleSearchInput = useCallback((e) => {
    const value = e.target.value;
    setSearchInput(value);
    if (value && value.trim().length > 0) {
      if (!/^[\p{L}\s]+$/u.test(value.trim())) {
        setError('Tên tìm kiếm chỉ được chứa chữ cái và khoảng trắng');
      } else {
        setError(null);
      }
    } else {
      setError(null);
    }
  }, []);

  const handleSearch = useCallback(() => {
    setSearchTerm(searchInput);
    setCurrentPage(0);
  }, [searchInput]);

  const handleClearSearch = useCallback(() => {
    setSearchInput('');
    setSearchTerm('');
    setCurrentPage(0);
    setError(null);
  }, []);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && searchInput.trim()) {
      handleSearch();
    }
  }, [handleSearch]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress color="warning" size={60} />
      </Box>
    );
  }
  if (error && !materials.length) {
    return (
      <Box m={4}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh', p: isMobile ? 1 : 4 }}>
      <Typography
        variant={isMobile ? 'h5' : 'h4'}
        fontWeight={700}
        color={black}
        align="center"
        sx={{ letterSpacing: 2, mb: 3 }}
      >
        QUẢN LÝ CHẤT LIỆU
      </Typography>
      <Grid container spacing={2} alignItems="center" mb={3}>
        <Grid item xs={12} md={7}>
          <Box display="flex" gap={2} alignItems="center">
            <TextField
              variant="outlined"
              size="small"
              placeholder="Nhập tên chất liệu..."
              value={searchInput}
              onChange={handleSearchInput}
              onKeyPress={handleKeyPress}
              error={!!error}
              helperText={error}
              sx={{
                borderRadius: 2,
                bgcolor: '#fafafa',
                maxWidth: 350,
                flex: 1,
                '& .MuiOutlinedInput-root': { borderRadius: 2 },
              }}
              InputProps={{
                endAdornment: (
                  <>
                    {searchInput && (
                      <IconButton
                        color="default"
                        onClick={handleClearSearch}
                        edge="end"
                        size="small"
                        sx={{ mr: searchLoading ? 1 : 0 }}
                      >
                        <CloseIcon />
                      </IconButton>
                    )}
                    {searchLoading ? (
                      <CircularProgress size={20} color="warning" />
                    ) : (
                      <IconButton
                        color="warning"
                        onClick={handleSearch}
                        disabled={!!error || !searchInput.trim()}
                        edge="end"
                        size="small"
                      >
                        <SearchIcon />
                      </IconButton>
                    )}
                  </>
                ),
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={5} display="flex" justifyContent={isMobile ? 'flex-start' : 'flex-end'}>
          <OrangeButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{ minWidth: 180, boxShadow: '0 2px 8px rgba(255,136,0,0.08)' }}
          >
            Thêm chất liệu
          </OrangeButton>
        </Grid>
      </Grid>
      <div
        className="table-responsive"
        style={{ borderRadius: 8, boxShadow: "0 0 8px rgba(0,0,0,0.05)" }}
      >
        <table className="table table-hover" style={{ textAlign: "center", fontSize: "0.85rem" }}>
          <thead style={{ backgroundColor: orange, color: white }}>
            <tr>
              <th scope="col">#</th>
              <th scope="col">MÃ CHẤT LIỆU</th>
              <th scope="col">TÊN CHẤT LIỆU</th>
              <th scope="col" className="d-none d-md-table-cell">NGÀY TẠO</th>
              <th scope="col" className="d-none d-md-table-cell">NGÀY SỬA</th>
              <th scope="col" className="d-none d-lg-table-cell">MÔ TẢ</th>
              <th scope="col">TRẠNG THÁI</th>
              <th scope="col">HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {materials.length > 0 ? (
              materials.map((material, index) => (
                <tr key={material.id}>
                  <th scope="row">{index + 1 + currentPage * pageSize}</th>
                  <td style={{ fontWeight: 600, letterSpacing: 1 }}>{material.ma}</td>
                  <td style={{ fontWeight: 500 }}>{material.ten}</td>
                  <td className="d-none d-md-table-cell">{material.ngayTao?.slice(0, 10) || '-'}</td>
                  <td className="d-none d-md-table-cell">{material.ngaySua?.slice(0, 10) || '-'}</td>
                  <td className="d-none d-lg-table-cell">{material.moTa || '-'}</td>
                  <td style={{ width: 160 }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 12,
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        backgroundColor: material.trangThai === 1 ? "#d1e7dd" : "#e2e3e5",
                        color: material.trangThai === 1 ? "#0f5132" : "#444",
                      }}
                    >
                      {material.trangThai === 1 ? 'Đang Hoạt Động' : 'Ngừng Hoạt Động'}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex justify-content-center gap-1">
                      <button
                        onClick={() => handleViewOrEdit(material, true)}
                        style={{
                          backgroundColor: "#212529",
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          padding: "6px 12px",
                          fontSize: "0.85rem",
                        }}
                      >
                        <VisibilityIcon fontSize="small" style={{ marginRight: 4 }} />
                        <span className="d-none d-md-inline">Xem</span>
                      </button>
                      <button
                        onClick={() => handleViewOrEdit(material, false)}
                        style={{
                          backgroundColor: "#ffca28",
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          padding: "6px 12px",
                          fontSize: "0.85rem",
                        }}
                      >
                        <EditIcon fontSize="small" style={{ marginRight: 4 }} />
                        <span className="d-none d-md-inline">Sửa</span>
                      </button>
                      <button
                        onClick={() => setConfirmModal({ open: true, id: material.id })}
                        style={{
                          backgroundColor: material.trangThai === 1 ? "#dc3545" : "#28a745",
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          padding: "6px 12px",
                          fontSize: "0.85rem",
                        }}
                      >
                        <SyncIcon fontSize="small" style={{ marginRight: 4 }} />
                        <span className="d-none d-md-inline">{material.trangThai === 1 ? "Ngưng" : "Hoạt động"}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center text-muted py-4">
                  {searchTerm ? `Không tìm thấy chất liệu phù hợp với "${searchTerm}"` : 'Không có chất liệu nào'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} flexWrap="wrap" gap={2}>
        <Pagination
          count={totalPages}
          page={currentPage + 1}
          onChange={handlePageChange}
          color="warning"
          shape="rounded"
        />
        <Typography>
          Trang {totalPages > 0 ? currentPage + 1 : 0} / {totalPages} ({totalElements} chất liệu)
        </Typography>
      </Box>
      <Snackbar
        open={!!alertMessage}
        autoHideDuration={4000}
        onClose={() => setAlertMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setAlertMessage('')}
          severity={alertType}
          sx={{
            bgcolor: alertType === 'success' ? orange : '#e53935',
            color: white,
            fontWeight: 600,
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ bgcolor: '#f1f5f9', fontWeight: 700 }}>
          {isViewMode ? 'Xem Chất Liệu' : selectedMaterial ? 'Chỉnh sửa Chất Liệu' : 'Thêm mới Chất Liệu'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSave}>
            {selectedMaterial && (
              <TextField
                label="Mã Chất Liệu"
                value={formData.ma}
                fullWidth
                margin="normal"
                InputProps={{ readOnly: true }}
                sx={{ bgcolor: '#f8f9fa', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            )}
            <TextField
              label="Tên Chất Liệu"
              value={formData.ten}
              onChange={(e) => !isViewMode && setFormData({ ...formData, ten: e.target.value })}
              fullWidth
              margin="normal"
              required={!isViewMode}
              error={!!formErrors.ten}
              helperText={formErrors.ten}
              InputProps={{ readOnly: isViewMode }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Mô Tả"
              value={formData.moTa}
              onChange={(e) => !isViewMode && setFormData({ ...formData, moTa: e.target.value })}
              fullWidth
              margin="normal"
              multiline
              rows={4}
              error={!!formErrors.moTa}
              helperText={formErrors.moTa}
              InputProps={{ readOnly: isViewMode }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
              <Button
                variant="outlined"
                onClick={() => setIsModalOpen(false)}
                sx={{ borderRadius: 2 }}
              >
                {isViewMode ? 'Đóng' : 'Hủy'}
              </Button>
              {!isViewMode && (
                <OrangeButton type="submit" variant="contained">
                  {selectedMaterial ? 'Cập nhật' : 'Thêm mới'}
                </OrangeButton>
              )}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog
        open={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, id: null })}
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>Xác nhận</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc muốn thay đổi trạng thái chất liệu này?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => setConfirmModal({ open: false, id: null })}
            sx={{ borderRadius: 2 }}
          >
            Hủy
          </Button>
          <OrangeButton variant="contained" onClick={handleDelete}>
            Xác nhận
          </OrangeButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaterialPage;