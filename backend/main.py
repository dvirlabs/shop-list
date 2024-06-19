from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import List, Optional
from pydantic import BaseModel

# SQLAlchemy models
Base = declarative_base()

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String, index=True)
    buy = Column(Boolean)
    note = Column(String)

# Database connection URL
SQLALCHEMY_DATABASE_URL = "postgresql://shop_user:shop123456@192.168.1.28/shop_list"

# Create engine and session
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

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

# Pydantic model for API request and response
class ProductBase(BaseModel):
    product_name: str
    buy: bool
    note: Optional[str]

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    id: int

class ProductSchema(BaseModel):
    id: int
    product_name: str
    buy: bool
    note: Optional[str]

# Dependency to get SQLAlchemy session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Routes for CRUD operations
@app.post("/products/", response_model=ProductSchema)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    db_product = Product(product_name=product.product_name, buy=product.buy, note=product.note)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.put("/products/{product_id}", response_model=ProductSchema)
def update_product(product_id: int, product: ProductUpdate, db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product:
        db_product.product_name = product.product_name
        db_product.buy = product.buy
        db_product.note = product.note
        db.commit()
        db.refresh(db_product)
        return db_product
    raise HTTPException(status_code=404, detail="Product not found")

@app.delete("/products/{product_id}", response_model=ProductSchema)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product:
        db.delete(db_product)
        db.commit()
        return db_product
    raise HTTPException(status_code=404, detail="Product not found")

@app.get("/products/", response_model=List[ProductSchema])
def read_products(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    products = db.query(Product).offset(skip).limit(limit).all()
    return products

# New route to fetch all products
@app.get("/table", response_model=List[ProductSchema])
def get_all_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return products

# If you want to run the FastAPI server directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
