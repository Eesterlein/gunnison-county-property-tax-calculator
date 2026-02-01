import os
import pandas as pd

# -----------------------------
# Paths
# -----------------------------
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

RAW_DATA_PATH = os.path.join(
    BASE_DIR, "data", "raw", "Adjustments.csv"
)

CLEANED_DATA_DIR = os.path.join(
    BASE_DIR, "data", "cleaned"
)

CLEANED_DATA_PATH = os.path.join(
    CLEANED_DATA_DIR, "adjustments.csv"
)

# -----------------------------
# Create cleaned directory if needed
# -----------------------------
os.makedirs(CLEANED_DATA_DIR, exist_ok=True)

# -----------------------------
# Load raw adjustments data
# -----------------------------
df = pd.read_csv(RAW_DATA_PATH)

# -----------------------------
# Select and rename columns
# -----------------------------
columns_to_keep = {
    "ACCOUNTNO": "account_number",
}

df_cleaned = df[list(columns_to_keep.keys())].rename(columns=columns_to_keep)

# -----------------------------
# Save cleaned data
# -----------------------------
df_cleaned.to_csv(CLEANED_DATA_PATH, index=False)

print(f"Cleaned adjustments data written to: {CLEANED_DATA_PATH}")
print(f"Rows: {len(df_cleaned)}")
