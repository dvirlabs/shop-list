import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, Button, TextField, Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box } from '@mui/material';
import { AddNewProduct } from '../assets/index'; // Adjust the import path as needed

type Product = {
    id: number;
    product_name: string;
    buy: boolean;
    note?: string;
};

type ProductsState = {
    [key: string]: Product[];
};

const ShoppingList: React.FC = () => {
    const [title, setTitle] = useState<string>('');
    const [tables, setTables] = useState<{ table_name: string; title: string; }[]>([]);
    const [products, setProducts] = useState<ProductsState>({});

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const response = await axios.get('http://localhost:8000/tables'); 
                const tables = response.data;
                setTables(tables);

                // Fetch products for each table
                const productsData: ProductsState = {};
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

    return (
        <Container>
            <Typography variant="h3" gutterBottom>
                Shopping List
            </Typography>

            <Box display="flex" alignItems="center" mb={3}>
                <TextField
                    label="Enter list title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                />
                <Button variant="contained" color="primary" onClick={createTable} sx={{ ml: 2 }}>
                    Create Table
                </Button>
            </Box>

            {title && (
                <Typography variant="h5" gutterBottom>
                    {title}
                </Typography>
            )}

            {tables.map((table, index) => (
                <Box key={index} mb={4}>
                    <Typography variant="h6" gutterBottom>
                        {table.title}
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Product Name</TableCell>
                                    <TableCell>Buy</TableCell>
                                    <TableCell>Note</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {products[table.table_name]?.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>{product.id}</TableCell>
                                        <TableCell>{product.product_name}</TableCell>
                                        <TableCell>{product.buy ? 'Yes' : 'No'}</TableCell>
                                        <TableCell>{product.note}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <AddNewProduct tableName={table.table_name} onProductAdded={() => refreshProducts(table.table_name)} />
                </Box>
            ))}
        </Container>
    );
};

export default ShoppingList;
