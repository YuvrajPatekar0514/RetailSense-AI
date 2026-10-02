"""
Unit Test for Data Integrity and Raw File Existence
"""
import os
import pandas as pd

def test_raw_dataset_exists():
    path = "data/raw/ecommerce_transactions.csv"
    assert os.path.exists(path), f"Raw dataset {path} missing"

def test_raw_dataset_schema():
    df = pd.read_csv("data/raw/ecommerce_transactions.csv")
    expected_cols = [
        "Transaction_ID", "User_Name", "Age", "Country", 
        "Product_Category", "Purchase_Amount", "Payment_Method", "Transaction_Date"
    ]
    assert list(df.columns) == expected_cols
    assert len(df) == 50000
    assert df.isnull().sum().sum() == 0
