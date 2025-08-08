import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Typography
} from '@mui/material';

const CustomConfirm = ({
    open,
    title,
    message,
    onCancel,
    onConfirm,
    confirmLabel = 'Xác nhận',
    confirmColor = 'error',
    confirmVariant = 'contained',
}) => {
    return (
        <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
            <DialogTitle>{title || 'Xác nhận'}</DialogTitle>
            <DialogContent>
                <Typography>{message}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} color="inherit">Huỷ</Button>
                <Button onClick={onConfirm} color={confirmColor} variant={confirmVariant}>
                    {confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
};


export default CustomConfirm;
