import os
import pandas as pd

# -----------------------------
# Paths
# -----------------------------
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

RAW_DATA_PATH = os.path.join(
    BASE_DIR, "data", "raw", "Seniors.csv"
)

CLEANED_DATA_DIR = os.path.join(
    BASE_DIR, "data", "cleaned"
)

CLEANED_DATA_PATH = os.path.join(
    CLEANED_DATA_DIR, "seniors.csv"
)

# -----------------------------
# Create cleaned directory if needed
# -----------------------------
os.makedirs(CLEANED_DATA_DIR, exist_ok=True)

# -----------------------------
# Load raw seniors data
# -----------------------------
df = pd.read_csv(RAW_DATA_PATH)

# -----------------------------
# Select and rename columns
# -----------------------------
columns_to_keep = {
    "ACCOUNTNO": "account_number",
    "Exempt_Actual_Value": "exempt_actual_value",
    "Taxes_Exempted": "taxes_exempted",
}

df_cleaned = df[list(columns_to_keep.keys())].rename(columns=columns_to_keep)

# -----------------------------
# Save cleaned data
# -----------------------------
df_cleaned.to_csv(CLEANED_DATA_PATH, index=False)

print(f"Cleaned seniors data written to: {CLEANED_DATA_PATH}")
print(f"Rows: {len(df_cleaned)}")
