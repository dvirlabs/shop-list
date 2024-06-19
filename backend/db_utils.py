# db_utils.py

from sqlalchemy import create_engine, Column, Integer, String, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from .models import Product as DBProduct
from typing import List

DATABASE_URL = "postgresql://shop_user:shop123456@192.168.1.28/shop_list"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String, index=True)
    buy = Column(Boolean, default=False)
    note = Column(Text, nullable=True)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
def get_products(db: Session) -> List[DBProduct]:
    return db.query(DBProduct).all()

def create_product(db: Session, product_name: str, buy: bool, note: str):
    db_product = Product(product_name=product_name, buy=buy, note=note)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product:
        db.delete(db_product)
        db.commit()
    return db_product

def update_product(db: Session, product_id: int, product_name: str, buy: bool, note: str):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product:
        db_product.product_name = product_name
        db_product.buy = buy
        db_product.note = note
        db.commit()
        db.refresh(db_product)
    return db_product
