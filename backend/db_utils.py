# db_utils.py
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import List, Optional
from pydantic import BaseModel

# Database connection parameters
DATABASE_URL = "postgresql://shop_user:123456@localhost:5432/shop_list"


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

def get_db():
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    try:
        yield conn
    finally:
        conn.close()

def create_product(db, product: ProductCreate) -> ProductSchema:
    with db.cursor() as cursor:
        cursor.execute(
            "INSERT INTO products (product_name, buy, note) VALUES (%s, %s, %s) RETURNING id, product_name, buy, note",
            (product.product_name, product.buy, product.note)
        )
        new_product = cursor.fetchone()
        db.commit()
        return new_product

def update_product(db, product_id: int, product: ProductUpdate) -> Optional[ProductSchema]:
    with db.cursor() as cursor:
        cursor.execute(
            "UPDATE products SET product_name = %s, buy = %s, note = %s WHERE id = %s RETURNING id, product_name, buy, note",
            (product.product_name, product.buy, product.note, product_id)
        )
        updated_product = cursor.fetchone()
        db.commit()
        return updated_product

def delete_product(db, product_id: int) -> Optional[ProductSchema]:
    with db.cursor() as cursor:
        cursor.execute(
            "DELETE FROM products WHERE id = %s RETURNING id, product_name, buy, note",
            (product_id,)
        )
        deleted_product = cursor.fetchone()
        db.commit()
        return deleted_product

def read_products(db, skip: int = 0, limit: int = 10) -> List[ProductSchema]:
    with db.cursor() as cursor:
        cursor.execute(
            "SELECT id, product_name, buy, note FROM products ORDER BY id OFFSET %s LIMIT %s",
            (skip, limit)
        )
        products = cursor.fetchall()
        return products

def get_all_products(db) -> List[ProductSchema]:
    with db.cursor() as cursor:
        cursor.execute("SELECT id, product_name, buy, note FROM products")
        products = cursor.fetchall()
        return products
