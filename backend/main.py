# main.py

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import uvicorn
import psycopg2
from psycopg2.extras import RealDictCursor
from pydantic import BaseModel
from db_utils import get_db, create_product_in_table, update_product, delete_product, read_products, get_all_tables, create_new_table, ProductCreate, ProductUpdate, ProductSchema, TableMetadata

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes for CRUD operations

@app.post("/products/{table_name}/", response_model=ProductSchema)
def add_product_to_table_route(table_name: str, product: ProductCreate, db=Depends(get_db)):
    return create_product_in_table(db, table_name, product)

@app.put("/products/{table_name}/{product_id}", response_model=ProductSchema)
def update_product_route(table_name: str, product_id: int, product: ProductUpdate, db=Depends(get_db)):
    updated_product = update_product(db, table_name, product_id, product)
    if updated_product:
        return updated_product
    raise HTTPException(status_code=404, detail="Product not found")

@app.delete("/products/{table_name}/{product_id}", response_model=ProductSchema)
def delete_product_route(table_name: str, product_id: int, db=Depends(get_db)):
    deleted_product = delete_product(db, table_name, product_id)
    if deleted_product:
        return deleted_product
    raise HTTPException(status_code=404, detail="Product not found")

@app.get("/products/{table_name}/", response_model=List[ProductSchema])
def read_products_route(table_name: str, skip: int = 0, limit: int = 10, db=Depends(get_db)):
    return read_products(db, table_name, skip, limit)

@app.get("/tables", response_model=List[TableMetadata])
def get_all_tables_route(db=Depends(get_db)):
    return get_all_tables(db)

@app.post("/create_table/")
async def create_table_route(request: Request, db=Depends(get_db)):
    data = await request.json()
    title = data['title']
    new_table_name = create_new_table(db, title)
    return {"table_name": new_table_name, "title": title}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", reload=True, port=8000)
