import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchSPWithQuantity, toggleStatusSP } from '../../../services/Admin/SanPhamAdminService';
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
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    id: null,
    currentStatus: null,
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [skipFetch, setSkipFetch] = useState(false);

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
    if (!skipFetch) {
      fetchData(currentPage, pageSize, searchTerm);
    }
  }, [currentPage, pageSize, searchTerm, fetchData, skipFetch]);

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  useEffect(() => {
    if (skipFetch && currentPage === 0) {
      setSkipFetch(false);
    }
  }, [currentPage, skipFetch]);

  const handleViewOrEdit = useCallback((product, viewOnly = false) => {
    navigate(`/san-pham-chi-tiet/${product.id}`, {
      state: { isViewMode: viewOnly, product },
    });
  }, [navigate]);

  const handleAddProduct = useCallback(() => {
    navigate('/admin/quan-ly-sp/them-san-pham');
  }, [navigate]);

  const handleToggleStatus = useCallback(async () => {
    try {
      await toggleStatusSP(confirmModal.id);
      setAlertMessage('Chuyển đổi trạng thái sản phẩm thành công');
      setAlertType('success');
      await fetchData(currentPage, pageSize, searchTerm);
    } catch (err) {
      setAlertMessage(err.message || 'Chuyển đổi trạng thái sản phẩm thất bại');
      setAlertType('error');
    } finally {
      setConfirmModal({ open: false, id: null, currentStatus: null });
    }
  }, [confirmModal.id, currentPage, pageSize, searchTerm, fetchData]);

  const handlePageChange = useCallback((event, value) => {
    setCurrentPage(value - 1);
  }, []);

  const handleSearchInput = useCallback((e) => {
    setSearchInput(e.target.value);
    setError(null);
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

  const getStatusLabel = (trangThai, totalQuantity) => {
    if (totalQuantity === 0) return 'Hết Hàng';
    switch (trangThai) {
      case 1:
        return 'Đang Kinh Doanh';
      case 2:
        return 'Tạm Ngưng';
      default:
        return 'Không xác định';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress color="warning" size={60} />
      </Box>
    );
  }
  if (error && !products.length) {
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
              <TableCell align="center" sx={{ color: white, fontWeight: 700, width: '5%', border: 0 }}>#</TableCell>
              <TableCell sx={{ color: white, fontWeight: 700, width: '15%', border: 0 }}>MÃ SẢN PHẨM</TableCell>
              <TableCell sx={{ color: white, fontWeight: 700, width: '15%', border: 0 }}>TÊN SẢN PHẨM</TableCell>
              <TableCell sx={{ color: white, fontWeight: 700, width: '15%', border: 0 }}>TỔNG SỐ LƯỢNG</TableCell>
              <TableCell sx={{ color: white, fontWeight: 700, width: '15%', border: 0 }}>NGÀY TẠO</TableCell>
              <TableCell sx={{ color: white, fontWeight: 700, width: '15%', border: 0 }}>NGÀY SỬA</TableCell>
              <TableCell sx={{ color: white, fontWeight: 700, width: '15%', border: 0 }}>NGÀY XÓA</TableCell>
              <TableCell align="center" sx={{ color: white, fontWeight: 700, width: '10%', border: 0 }}>TRẠNG THÁI</TableCell>
              <TableCell align="center" sx={{ color: white, fontWeight: 700, width: '15%', border: 0 }}>HÀNH ĐỘNG</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(products) && products.length > 0 ? (
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
                  <TableCell align="center" sx={{ fontWeight: 600, color: black, border: 0 }}>
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
                  <TableCell sx={{ fontWeight: 600, color: black, border: 0 }}>
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
                    <Chip
                      label={getStatusLabel(product.trangThai, product.totalQuantity)}
                      icon={
                        product.totalQuantity === 0 ? (
                          <RemoveShoppingCartIcon sx={{ color: '#fff !important' }} />
                        ) : product.trangThai === 1 ? (
                          <CheckCircleIcon sx={{ color: '#fff !important' }} />
                        ) : (
                          <PauseCircleIcon sx={{ color: '#fff !important' }} />
                        )
                      }
                      sx={{
                        bgcolor:
                          product.totalQuantity === 0 ? '#e53935' :
                          product.trangThai === 1 ? '#a3e635' : '#6c757d',
                        color: white,
                        fontWeight: 600,
                        px: 1.5,
                        fontSize: 14,
                        borderRadius: '16px',
                      }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: 0 }}>
                    <Box display="flex" justifyContent="center" gap={0.5}>
                      <Tooltip title="Xem chi tiết" arrow>
                        <IconButton
                          sx={{
                            color: '#1976d2',
                            bgcolor: '#f4f8fd',
                            borderRadius: '50%',
                            width: 30,
                            height: 30,
                            transition: 'all 0.2s',
                            '&:hover': { bgcolor: '#e3f2fd', color: '#0d47a1' },
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
                            color: '#ffca28',
                            bgcolor: '#fff7f0',
                            borderRadius: '50%',
                            width: 30,
                            height: 30,
                            transition: 'all 0.2s',
                            '&:hover': { bgcolor: '#ffe0b2', color: '#ff6f00' },
                          }}
                          onClick={() => handleViewOrEdit(product, false)}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={product.totalQuantity === 0 ? 'Không thể chuyển đổi trạng thái' : (product.trangThai === 1 ? 'Tạm ngưng' : 'Đang kinh doanh')} arrow>
                        <span>
                          <IconButton
                            sx={{
                              color: product.totalQuantity === 0 ? '#b0bec5' : '#0288d1',
                              bgcolor: product.totalQuantity === 0 ? '#eceff1' : '#e1f5fe',
                              borderRadius: '50%',
                              width: 30,
                              height: 30,
                              transition: 'all 0.2s',
                              '&:hover': product.totalQuantity === 0 ? {} : { bgcolor: '#b3e5fc', color: '#01579b' },
                            }}
                            onClick={() =>
                              product.totalQuantity !== 0 &&
                              setConfirmModal({
                                open: true,
                                id: product.id,
                                currentStatus: product.trangThai,
                              })
                            }
                            disabled={product.totalQuantity === 0}
                            size="small"
                          >
                            <SyncIcon fontSize="small" />
                          </IconButton>
                        </span>
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
            Bạn có chắc muốn chuyển trạng thái sản phẩm sang "
            {confirmModal.currentStatus === 1 ? 'Tạm Ngưng' : 'Đang Kinh Doanh'}"?
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
          <OrangeButton variant="contained" onClick={handleToggleStatus}>
            Xác nhận
          </OrangeButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;
