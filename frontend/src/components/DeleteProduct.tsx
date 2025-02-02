// DeleteProduct.tsx

import React from 'react';
import { IconButton, Dialog, DialogTitle, DialogActions, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

interface DeleteProductProps {
    productId: number;
    tableName: string;
    onDeleteSuccess: () => void;
}

const DeleteProduct: React.FC<DeleteProductProps> = ({ productId, tableName, onDeleteSuccess }) => {
    const [open, setOpen] = React.useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:8000/products/${tableName}/${productId}`);
            onDeleteSuccess(); // Trigger parent component's refresh
            handleClose(); // Close the dialog after deletion
        } catch (error) {
            console.error('Error deleting product', error);
        }
    };

    return (
        <>
            <IconButton onClick={handleOpen}>
                <DeleteIcon color='error' />
            </IconButton>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>האם אתה בטוח שברצונך למחוק מוצר זה</DialogTitle>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        ביטול
                    </Button>
                    <Button onClick={handleDelete} color="secondary">
                        מחק
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default DeleteProduct;
