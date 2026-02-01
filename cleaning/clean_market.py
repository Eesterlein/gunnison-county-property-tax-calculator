import os
import pandas as pd

# -----------------------------
# Base paths
# -----------------------------
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

RAW_DATA_PATH = os.path.join(
    BASE_DIR, "data", "raw", "Market.csv"
)

CLEANED_DATA_DIR = os.path.join(
    BASE_DIR, "data", "cleaned"
)

CLEANED_DATA_PATH = os.path.join(
    CLEANED_DATA_DIR, "market.csv"
)

os.makedirs(CLEANED_DATA_DIR, exist_ok=True)

# -----------------------------
# Load raw market data
# -----------------------------
df = pd.read_csv(RAW_DATA_PATH)

# -----------------------------
# Select + rename columns
# -----------------------------
columns_to_keep = {
    "ACCOUNTNO": "account_number",
    "PARCELNO": "parcel_number",
    "TOTALACTUAL": "total_actual_value",
    "TOTALASSESSED": "total_assessed_precalc",
    "ALTASSESSED": "alt_assessed_precalc",
    "LG_MILL_LEVY": "lg_mill_levy",
    "SCHOOL_MILL_LEVY": "school_mill_levy",
    "TOTAL_MILL_LEVY": "total_mill_levy",
    "TAXDISTRICT": "tax_district",
    "TAXYEAR": "tax_year",
}

df_cleaned = df[list(columns_to_keep.keys())].rename(columns=columns_to_keep)

# -----------------------------
# Save cleaned data
# -----------------------------
df_cleaned.to_csv(CLEANED_DATA_PATH, index=False)

print(f"Cleaned market data written to: {CLEANED_DATA_PATH}")
print(f"Rows: {len(df_cleaned)}")
