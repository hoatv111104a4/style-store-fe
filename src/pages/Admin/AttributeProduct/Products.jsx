import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { searchSPWithQuantity, deleteSP } from '../../../services/Admin/SanPhamAdminService';

import {
  Box,
  Button,
  Typography,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tooltip,
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
  PauseCircle as PauseCircleIcon,
  RemoveShoppingCart as RemoveShoppingCartIcon,
  CheckCircle as CheckCircleIcon,
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

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null, currentStatus: null });
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
      const response = await searchSPWithQuantity(search, page, size);
      setProducts(
        response.content.map(item => ({
          ...item.sanPham,
          totalQuantity: item.totalQuantity || 0,
          trangThai: item.sanPham.trangThai,
        })) || []
      );
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

  const handleViewOrEdit = (product, viewOnly = false) => {
    if (!product || !product.id) {
      setAlertMessage('Sản phẩm không hợp lệ');
      setAlertType('error');
      return;
    }
    const path = viewOnly
      ? `/admin/san-pham-chi-tiet/${product.id}`
      : `/admin/san-pham-chi-tiet/${product.id}`;
    navigate(path, {
      state: { isViewMode: viewOnly, product },
    });
  };

  const handleAddProduct = () => {
    navigate('/admin/quan-ly-sp/them-san-pham');
  };

  const handleDelete = async () => {
    try {
      await deleteSP(confirmModal.id);
      await fetchData(currentPage, pageSize, searchTerm);
      const newStatus = confirmModal.currentStatus === 1 ? 'Hết Hàng' : 'Đang Bán';
      setAlertMessage(`Đã thay đổi trạng thái sản phẩm sang "${newStatus}"`);
      setAlertType('success');
    } catch (err) {
      setAlertMessage(`Cập nhật trạng thái thất bại: ${err.message}`);
      setAlertType('error');
    } finally {
      setConfirmModal({ open: false, id: null, currentStatus: null });
    }
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value - 1);
  };

  const handleSearchInput = (e) => {
    setSearchInput(e.target.value);
    setError(null);
  };

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setCurrentPage(0);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setCurrentPage(0);
    setError(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && searchInput.trim()) {
      handleSearch();
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress color="warning" size={60} />
      </Box>
    );
  if (error && !products.length)
    return (
      <Box m={4}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh', p: isMobile ? 1 : 4 }}>
      <Typography
        variant={isMobile ? 'h5' : 'h4'}
        fontWeight={700}
        color={black}
        align="center"
        sx={{ letterSpacing: 2, mb: 3 }}
      >
        QUẢN LÝ SẢN PHẨM
      </Typography>
      <Grid container spacing={2} alignItems="center" mb={3}>
        <Grid item xs={12} md={7}>
          <Box display="flex" gap={2} alignItems="center">
            <TextField
              variant="outlined"
              size="small"
              placeholder="Nhập tên sản phẩm..."
              value={searchInput}
              onChange={handleSearchInput}
              onKeyPress={handleKeyPress}
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
                        disabled={!searchInput.trim()}
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
            onClick={handleAddProduct}
            sx={{ minWidth: 180, boxShadow: '0 2px 8px rgba(255,136,0,0.08)' }}
          >
            Thêm sản phẩm
          </OrangeButton>
        </Grid>
      </Grid>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          boxShadow: 2,
          border: '1px solid #ffe0b2',
          mt: 1,
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: orange }}>
              <TableCell align="center" sx={{ color: white, fontWeight: 700, width: 48, border: 0 }}>#</TableCell>
              <TableCell sx={{ color: white, fontWeight: 700, minWidth: 120, border: 0 }}>MÃ SẢN PHẨM</TableCell>
              <TableCell sx={{ color: white, fontWeight: 700, minWidth: 180, border: 0 }}>TÊN SẢN PHẨM</TableCell>
              <TableCell sx={{ color: white, fontWeight: 700, minWidth: 80, border: 0 }}>TỔNG SỐ LƯỢNG</TableCell>
              <TableCell sx={{ color: white, fontWeight: 700, minWidth: 110, border: 0 }}>NGÀY TẠO</TableCell>
              <TableCell sx={{ color: white, fontWeight: 700, minWidth: 110, border: 0 }}>NGÀY SỬA</TableCell>
              <TableCell sx={{ color: white, fontWeight: 700, minWidth: 110, border: 0 }}>NGÀY XÓA</TableCell>
              <TableCell align="center" sx={{ color: white, fontWeight: 700, minWidth: 120, border: 0 }}>TRẠNG THÁI</TableCell>
              <TableCell align="center" sx={{ color: white, fontWeight: 700, minWidth: 120, border: 0 }}>HÀNH ĐỘNG</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.length > 0 ? (
              products.map((product, index) => (
                <TableRow
                  key={product.id}
                  hover
                  sx={{
                    transition: 'background 0.2s',
                    '&:hover': { backgroundColor: '#fffaf3' },
                    borderBottom: '1px solid #ffe0b2',
                  }}
                >
                  <TableCell align="center" sx={{ fontWeight: 600, color: orange, border: 0 }}>
                    {index + 1 + currentPage * pageSize}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: black, letterSpacing: 1, border: 0 }}>
                    {product.ma}
                  </TableCell>
                  <TableCell sx={{ color: black, fontWeight: 500, border: 0 }}>
                    <Tooltip title={product.ten} arrow>
                      <span style={{
                        display: 'inline-block',
                        maxWidth: 180,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>{product.ten}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{
                    fontWeight: 600,
                    color: product.totalQuantity === 0 ? '#e53935' : orange,
                    border: 0
                  }}>
                    {product.totalQuantity || 0}
                  </TableCell>
                  <TableCell sx={{ color: black, border: 0 }}>
                    {product.ngayTao?.slice(0, 10) || '-'}
                  </TableCell>
                  <TableCell sx={{ color: black, border: 0 }}>
                    {product.ngaySua?.slice(0, 10) || '-'}
                  </TableCell>
                  <TableCell sx={{ color: black, border: 0 }}>
                    {product.ngayXoa?.slice(0, 10) || '-'}
                  </TableCell>
                  <TableCell align="center" sx={{ border: 0 }}>
                    {product.trangThai === 0 ? (
                      <Chip
                        label={product.totalQuantity > 0 ? 'Tạm Ngưng' : 'Hết Hàng'}
                        icon={
                          product.totalQuantity > 0
                            ? <PauseCircleIcon sx={{ color: '#757575' }} />
                            : <RemoveShoppingCartIcon sx={{ color: '#e53935' }} />
                        }
                        sx={{
                          bgcolor: '#fff',
                          color: product.totalQuantity > 0 ? black : '#e53935',
                          fontWeight: 600,
                          px: 1.5,
                          fontSize: 14,
                          border: '1px solid #eee',
                          boxShadow: 'none',
                        }}
                      />
                    ) : (
                      <Chip
                        label={product.totalQuantity === 0 ? 'Hết Hàng' : 'Đang Kinh Doanh'}
                        icon={
                          product.totalQuantity === 0
                            ? <RemoveShoppingCartIcon sx={{ color: '#e53935' }} />
                            : <CheckCircleIcon sx={{ color: orange }} />
                        }
                        sx={{
                          bgcolor: product.totalQuantity === 0 ? '#fff' : '#fff',
                          color: product.totalQuantity === 0 ? '#e53935' : orange,
                          fontWeight: 600,
                          px: 1.5,
                          fontSize: 14,
                          border: `1.5px solid ${product.totalQuantity === 0 ? '#e53935' : orange}`,
                          boxShadow: 'none',
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="center" sx={{ border: 0 }}>
                    <Box display="flex" justifyContent="center" gap={0.5}>
                      <Tooltip title="Xem chi tiết" arrow>
                        <IconButton
                          sx={{
                            color: '#1976d2',
                            bgcolor: '#f4f8fd',
                            borderRadius: 2,
                            transition: 'all 0.2s',
                            '&:hover': { bgcolor: '#e3f2fd', color: '#0d47a1' },
                            p: 1,
                          }}
                          onClick={() => handleViewOrEdit(product, true)}
                          size="small"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sửa" arrow>
                        <IconButton
                          sx={{
                            color: orange,
                            bgcolor: '#fff7f0',
                            borderRadius: 2,
                            transition: 'all 0.2s',
                            '&:hover': { bgcolor: '#ffe0b2', color: '#ff6f00' },
                            p: 1,
                          }}
                          onClick={() => handleViewOrEdit(product, false)}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Thay đổi trạng thái" arrow>
                        <IconButton
                          sx={{
                            color: '#e53935',
                            bgcolor: '#fff6f6',
                            borderRadius: 2,
                            transition: 'all 0.2s',
                            '&:hover': { bgcolor: '#ffeaea', color: '#b71c1c' },
                            p: 1,
                          }}
                          onClick={() =>
                            setConfirmModal({
                              open: true,
                              id: product.id,
                              currentStatus: product.trangThai,
                            })
                          }
                          size="small"
                        >
                          <SyncIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography color="text.secondary" fontSize={18}>
                    {searchTerm
                      ? `Không tìm thấy sản phẩm phù hợp với "${searchTerm}"`
                      : 'Không có sản phẩm nào'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} flexWrap="wrap" gap={2}>
        <Pagination
          count={totalPages}
          page={currentPage + 1}
          onChange={handlePageChange}
          color="warning"
          shape="rounded"
        />
        <Typography>
          Trang {totalPages > 0 ? currentPage + 1 : 0} / {totalPages} ({totalElements} sản phẩm)
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
        open={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, id: null, currentStatus: null })}
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>Xác nhận</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc muốn thay đổi trạng thái sản phẩm sang "
            {confirmModal.currentStatus === 1 ? 'Hết Hàng' : 'Đang Bán'}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => setConfirmModal({ open: false, id: null, currentStatus: null })}
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

export default Products;