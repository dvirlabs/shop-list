import React, { useEffect, useState } from 'react';
import '../style/productsTable.css';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';

interface Product {
  id: number;
  product_name: string;
  buy: boolean;
  note: string;
}

const ProductTable: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [productName, setProductName] = useState('');
  const [buy, setBuy] = useState(false);
  const [note, setNote] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:8000/products/');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct = { product_name: productName, buy, note };

    try {
      const response = await fetch('http://localhost:8000/products/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const addedProduct = await response.json();
      setProducts([...products, addedProduct]);
      setProductName('');
      setBuy(false);
      setNote('');
      setShowModal(false);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <h2>Products</h2>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => setShowModal(true)}
      >
        Add Product
      </Button>
      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <DialogTitle>
          Add New Product
          <IconButton
            aria-label="close"
            onClick={() => setShowModal(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleAddProduct}>
            <TextField
              margin="dense"
              label="Product Name"
              type="text"
              fullWidth
              variant="outlined"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={buy}
                  onChange={(e) => setBuy(e.target.checked)}
                />
              }
              label="Buy"
            />
            <TextField
              margin="dense"
              label="Note"
              type="text"
              fullWidth
              variant="outlined"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <DialogActions>
              <Button onClick={() => setShowModal(false)} color="secondary">
                Cancel
              </Button>
              <Button className='add-btn' type="submit" color="primary">
                Add Product
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: '30px' }}>ID</TableCell>
              <TableCell sx={{ fontSize: '30px' }}>Product Name</TableCell>
              <TableCell sx={{ fontSize: '30px' }}>Buy</TableCell>
              <TableCell sx={{ fontSize: '30px' }}>Note</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell sx={{ fontSize: '25px' }}>{product.id}</TableCell>
                <TableCell sx={{ fontSize: '25px' }}>{product.product_name}</TableCell>
                <TableCell sx={{ fontSize: '25px' }}>{product.buy ? 'Yes' : 'No'}</TableCell>
                <TableCell sx={{ fontSize: '25px' }}>{product.note}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ProductTable;
