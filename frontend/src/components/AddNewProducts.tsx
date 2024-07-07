import React, { useState } from 'react';
import axios from 'axios';
import { Button, TextField, Box, Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, Switch } from '@mui/material';
import '../style/AddNewProducts.css'

interface AddNewProductProps {
    tableName: string;
    onProductAdded: () => void;
}

const AddNewProduct: React.FC<AddNewProductProps> = ({ tableName, onProductAdded }) => {
    const [productData, setProductData] = useState({
        product_name: '',
        buy: false,
        note: ''
    });
    const [open, setOpen] = useState(false); // State for controlling the dialog visibility

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

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

    const addProduct = async () => {
        try {
            await axios.post(`http://localhost:8000/products/${tableName}/`, productData);
            setProductData({
                product_name: '',
                buy: false,
                note: ''
            });
            onProductAdded(); // Trigger parent component's refresh
            handleClose(); // Close the dialog after adding the product
        } catch (error) {
            console.error('Error adding product:', error);
        }
    };

    return (
        <>
            <Box className="add-btn" display="flex" alignItems="center" mb={3}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpen} // Open the dialog on button click
                    sx={{ ml: 2 }}
                >
                    הוסף מוצר
                </Button>
            </Box>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>הוסף מוצר חדש</DialogTitle>
                <DialogContent>
                    <TextField
                        name="product_name"
                        label="שם מוצר"
                        value={productData.product_name}
                        onChange={handleInputChange}
                        variant="outlined"
                        fullWidth
                        margin="normal"
                    />
                    <FormControlLabel
                        control={<Switch checked={productData.buy} onChange={handleBuyChange} />}
                        label="?לקנות"
                    />
                    <TextField
                        name="note"
                        label="הערות"
                        value={productData.note}
                        onChange={handleInputChange}
                        variant="outlined"
                        fullWidth
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        ביטול
                    </Button>
                    <Button onClick={addProduct} color="primary">
                        הוסף
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default AddNewProduct;
