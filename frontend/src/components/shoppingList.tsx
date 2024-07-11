import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, Button, TextField, Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, IconButton, Dialog, DialogTitle, DialogActions } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, DeleteForever as DeleteForeverIcon } from '@mui/icons-material';
import AddNewProduct from './AddNewProducts';
import EditProduct from './EditProduct';
import DeleteProduct from './DeleteProduct'; // Import DeleteProduct component
import { Table as TableType, Product } from '../utils/types';
import '../style/shoppingList.css'

const ShoppingList: React.FC = () => {
    const [title, setTitle] = useState<string>('');
    const [tables, setTables] = useState<TableType[]>([]);
    const [products, setProducts] = useState<{ [key: string]: Product[] }>({});
    const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const [currentTable, setCurrentTable] = useState<string>('');
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState<boolean>(false);
    const [tableToDelete, setTableToDelete] = useState<string>('');

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const response = await axios.get('http://localhost:8000/tables'); 
                const tables = response.data;
                setTables(tables);

                const productsData: { [key: string]: Product[] } = {};
                for (const table of tables) {
                    const productsResponse = await axios.get(`http://localhost:8000/products/${table.table_name}/`);
                    productsData[table.table_name] = productsResponse.data;
                }
                setProducts(productsData);
            } catch (error) {
                console.error('Error fetching tables', error);
            }
        };
        fetchTables();
    }, []);

    const createTable = async () => {
        if (!title) return;

        try {
            const response = await axios.post('http://localhost:8000/create_table/', { title });
            const newTable = { table_name: response.data.table_name, title };
            setTables(prevTables => [...prevTables, newTable]);
            localStorage.setItem('title', title); // Store title in localStorage
            setTitle('');
        } catch (error) {
            console.error('Error creating table', error);
        }
    };

    const refreshProducts = async (tableName: string) => {
        try {
            const response = await axios.get(`http://localhost:8000/products/${tableName}/`);
            setProducts(prevProducts => ({
                ...prevProducts,
                [tableName]: response.data
            }));
        } catch (error) {
            console.error('Error fetching products', error);
        }
    };

    const deleteProduct = async (productId: number, tableName: string) => {
        try {
            await axios.delete(`http://localhost:8000/products/${tableName}/${productId}`);
            refreshProducts(tableName);
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const deleteTable = async (tableName: string) => {
        try {
            await axios.delete(`http://localhost:8000/tables/${tableName}`);
            setTables(prevTables => prevTables.filter(table => table.table_name !== tableName));
        } catch (error) {
            console.error('Error deleting table:', error);
        }
        setDeleteConfirmationOpen(false);
    };

    const openEditDialog = (product: Product, tableName: string) => {
        setProductToEdit(product);
        setCurrentTable(tableName);
        setEditDialogOpen(true);
    };

    const closeEditDialog = () => {
        setEditDialogOpen(false);
        setProductToEdit(null);
    };

    const handleTableDeleteClick = (tableName: string) => {
        setTableToDelete(tableName);
        setDeleteConfirmationOpen(true);
    };

    const handleDeleteTableConfirmation = () => {
        deleteTable(tableToDelete);
    };

    const handleCloseDeleteConfirmation = () => {
        setDeleteConfirmationOpen(false);
    };

    return (
        <Container>
            <Typography align="center" variant="h3" gutterBottom>
                רשימת קניות
            </Typography>

            <Box display="flex" alignItems="center" mb={3}>
                <TextField
                    label="הכנס רשימת קניות חדשה"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    InputProps={{
                        sx: {
                            textAlign: 'right',
                            '& .MuiInputBase-input': {
                                textAlign: 'right',
                            }
                        }
                    }}
                />
                <Button variant="contained" color="primary" onClick={createTable} sx={{ ml: 2 }}>
                    צור רשימה
                </Button>
            </Box>

            {title && (
                <Typography variant="h5" gutterBottom>
                    {title}
                </Typography>
            )}
            {tables.map((table, index) => (
                <Box key={index} mb={4}>
                    <Box display="flex" alignItems="center">
                        <Typography variant="h6" gutterBottom>
                            {table.title}
                        </Typography>
                        <IconButton onClick={() => handleTableDeleteClick(table.table_name)} size="small" sx={{ ml: 2 }}>
                            <DeleteForeverIcon color='error' />
                        </IconButton>
                    </Box>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {/* <TableCell sx={{ textAlign: 'center' }}>ID</TableCell>  */}
                                    <TableCell sx={{ textAlign: 'center', backgroundColor: 'skyblue' }}>פעולות</TableCell>
                                    <TableCell sx={{ textAlign: 'center', backgroundColor: 'skyblue' }}>הערות</TableCell>
                                    <TableCell sx={{ textAlign: 'center', backgroundColor: 'skyblue' }}>לקנות</TableCell>
                                    <TableCell sx={{ textAlign: 'center', backgroundColor: 'skyblue' }}>שם מוצר</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {products[table.table_name]?.map((product) => (
                                    <TableRow key={product.id}>
                                        {/* <TableCell sx={{ textAlign: 'center' }}>{product.id}</TableCell> */}
                                        <TableCell sx={{ textAlign: 'center' }}>
                                            <DeleteProduct
                                                productId={product.id}
                                                tableName={table.table_name}
                                                onDeleteSuccess={() => refreshProducts(table.table_name)}
                                            />
                                            <IconButton onClick={() => openEditDialog(product, table.table_name)}>
                                                <EditIcon color='warning' />
                                            </IconButton>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: 'center' }}>{product.note}</TableCell>
                                        <TableCell sx={{ textAlign: 'center' }}>{product.buy ? 'כן' : 'לא'}</TableCell>
                                        <TableCell sx={{ textAlign: 'center' }}>{product.product_name}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <AddNewProduct tableName={table.table_name} onProductAdded={() => refreshProducts(table.table_name)} />
                </Box>
            ))}

            {productToEdit && (
                <EditProduct
                    product={productToEdit}
                    tableName={currentTable}
                    onProductEdited={() => refreshProducts(currentTable)}
                    open={editDialogOpen}
                    handleClose={closeEditDialog}
                />
            )}

            {/* Delete Table Confirmation Dialog */}
            <Dialog open={deleteConfirmationOpen} onClose={handleCloseDeleteConfirmation}>
                <DialogTitle>האם אתה בטוח שברצונך למחוק טבלה זו</DialogTitle>
                <DialogActions>
                    <Button onClick={handleCloseDeleteConfirmation} color="primary">
                        ביטול
                    </Button>
                    <Button onClick={handleDeleteTableConfirmation} color="secondary">
                        מחק טבלה
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ShoppingList;
