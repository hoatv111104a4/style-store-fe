import React from 'react';
import { Snackbar, Alert } from '@mui/material';

const CustomAlert = ({ alertOpen, alertMessage, alertSeverity, onClose }) => {
    return (
        <Snackbar
            open={alertOpen}
            autoHideDuration={3000}
            onClose={onClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            sx={{ mt: 8 }}
        >
            <Alert
                onClose={onClose}
                severity={alertSeverity}
                variant="filled"
                sx={{
                    fontWeight: 'bold',
                    color: 'white',
                    backgroundColor:
                        alertSeverity === 'success' ? '#4caf50' :
                            alertSeverity === 'warning' ? '#ff9800' :
                                alertSeverity === 'error' ? '#f44336' :
                                    '#2196f3'
                }}
            >
                {alertMessage}
            </Alert>
        </Snackbar>
    );
};

export default CustomAlert;
