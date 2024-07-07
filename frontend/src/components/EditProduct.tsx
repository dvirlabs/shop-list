import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, Switch } from '@mui/material';
import { Product } from '../utils/types';

interface EditProductProps {
    product: Product;
    tableName: string;
    onProductEdited: () => void;
    open: boolean;
    handleClose: () => void;
}

const EditProduct: React.FC<EditProductProps> = ({ product, tableName, onProductEdited, open, handleClose }) => {
    const [productData, setProductData] = useState<Product>(product);

    useEffect(() => {
        setProductData(product);
    }, [product]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProductData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleBuyChange = () => {
        setProductData(prevData => ({
            ...prevData,
            buy: !prevData.buy
        }));
    };

    const editProduct = async () => {
        try {
            await axios.put(`http://localhost:8000/products/${tableName}/${productData.id}`, productData);
            onProductEdited();
            handleClose();
        } catch (error) {
            console.error('Error editing product:', error);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogContent>
                <TextField
                    name="product_name"
                    label="Product Name"
                    value={productData.product_name}
                    onChange={handleInputChange}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                />
                <FormControlLabel
                    control={<Switch checked={productData.buy} onChange={handleBuyChange} />}
                    label="Buy"
                />
                <TextField
                    name="note"
                    label="Note"
                    value={productData.note || ''}
                    onChange={handleInputChange}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={editProduct} color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditProduct;
