from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import uvicorn
from db_utils import get_db, create_product, update_product, delete_product, read_products, get_all_products, ProductCreate, ProductUpdate, ProductSchema

# Initialize FastAPI
app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend URL during development
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Routes for CRUD operations
@app.post("/products/", response_model=ProductSchema)
def create_product_route(product: ProductCreate, db=Depends(get_db)):
    return create_product(db, product)

@app.put("/products/{product_id}", response_model=ProductSchema)
def update_product_route(product_id: int, product: ProductUpdate, db=Depends(get_db)):
    updated_product = update_product(db, product_id, product)
    if updated_product:
        return updated_product
    raise HTTPException(status_code=404, detail="Product not found")

@app.delete("/products/{product_id}", response_model=ProductSchema)
def delete_product_route(product_id: int, db=Depends(get_db)):
    deleted_product = delete_product(db, product_id)
    if deleted_product:
        return deleted_product
    raise HTTPException(status_code=404, detail="Product not found")

@app.get("/products/", response_model=List[ProductSchema])
def read_products_route(skip: int = 0, limit: int = 10, db=Depends(get_db)):
    return read_products(db, skip, limit)

# New route to fetch all products
@app.get("/table", response_model=List[ProductSchema])
def get_all_products_route(db=Depends(get_db)):
    return get_all_products(db)

# If you want to run the FastAPI server directly
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", reload=True, port=8000)
