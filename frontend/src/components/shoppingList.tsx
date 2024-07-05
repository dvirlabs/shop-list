import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, Button, TextField, Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box } from '@mui/material';

const ShoppingList: React.FC = () => {
    const [title, setTitle] = useState<string>('');
    const [tables, setTables] = useState<{ table_name: string; title: string; }[]>([]);

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const response = await axios.get('http://localhost:8000/tables'); 
                setTables(response.data);
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
                                {/* Render table rows based on your data structure */}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            ))}
        </Container>
    );
};

export default ShoppingList;
