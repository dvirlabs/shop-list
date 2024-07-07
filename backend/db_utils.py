import psycopg2
from psycopg2.extras import RealDictCursor
from typing import List, Optional
from pydantic import BaseModel

DATABASE_URL = "postgresql://shop_user:123456@localhost:5432/shop_list"

# Database connection setup
def get_db():
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    try:
        yield conn
    finally:
        conn.close()

# Models
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

class TableMetadata(BaseModel):
    table_name: str
    title: str

# Database operations
def create_product_in_table(db, table_name: str, product: ProductCreate) -> ProductSchema:
    with db.cursor() as cursor:
        cursor.execute(
            f"INSERT INTO {table_name} (product_name, buy, note) VALUES (%s, %s, %s) RETURNING id, product_name, buy, note",
            (product.product_name, product.buy, product.note)
        )
        new_product = cursor.fetchone()
        db.commit()
        return new_product

def update_product(db, table_name: str, product_id: int, product: ProductUpdate) -> Optional[ProductSchema]:
    with db.cursor() as cursor:
        cursor.execute(
            f"UPDATE {table_name} SET product_name = %s, buy = %s, note = %s WHERE id = %s RETURNING id, product_name, buy, note",
            (product.product_name, product.buy, product.note, product_id)
        )
        updated_product = cursor.fetchone()
        db.commit()
        return updated_product

def delete_product(db, table_name: str, product_id: int) -> Optional[ProductSchema]:
    with db.cursor() as cursor:
        cursor.execute(
            f"DELETE FROM {table_name} WHERE id = %s RETURNING id, product_name, buy, note",
            (product_id,)
        )
        deleted_product = cursor.fetchone()
        db.commit()
        return deleted_product

def read_products(db, table_name: str, skip: int = 0, limit: int = 10) -> List[ProductSchema]:
    with db.cursor() as cursor:
        cursor.execute(
            f"SELECT id, product_name, buy, note FROM {table_name} ORDER BY id OFFSET %s LIMIT %s",
            (skip, limit)
        )
        products = cursor.fetchall()
        return products

def get_all_tables(db) -> List[TableMetadata]:
    with db.cursor() as cursor:
        cursor.execute("SELECT table_name, title FROM table_metadata")
        tables = cursor.fetchall()
        return tables

def create_new_table(db, title: str) -> str:
    with db.cursor() as cursor:
        # Check if the table already exists
        cursor.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_name LIKE 'products_%'")
        table_count_row = cursor.fetchone()

        # Extract count if result exists
        if table_count_row:
            table_count = table_count_row.get('count', 0)
        else:
            table_count = 0
        
        new_table_name = f"products_{table_count + 1}"
        
        # Create the new table
        cursor.execute(
            f"""
            CREATE TABLE IF NOT EXISTS {new_table_name} (
                id SERIAL PRIMARY KEY,
                product_name VARCHAR(255) NOT NULL,
                buy BOOLEAN NOT NULL,
                note TEXT
            )
            """
        )

        # Insert metadata into table_metadata
        cursor.execute(
            "INSERT INTO table_metadata (table_name, title) VALUES (%s, %s)",
            (new_table_name, title)
        )

        db.commit()
        return new_table_name

def delete_table(db, table_name: str) -> bool:
    try:
        with db.cursor() as cursor:
            cursor.execute(f"DROP TABLE IF EXISTS {table_name}")
            cursor.execute("DELETE FROM table_metadata WHERE table_name = %s", (table_name,))
            db.commit()
        return True  # Return True if deletion was successful
    except psycopg2.Error as e:
        print(f"Database error occurred while deleting table {table_name}: {e}")
        return False  # Return False indicating deletion failed
