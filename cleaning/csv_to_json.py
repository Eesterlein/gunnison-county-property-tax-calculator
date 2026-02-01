import os
import json
import pandas as pd

# -----------------------------
# Paths
# -----------------------------
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

CLEANED_DATA_DIR = os.path.join(BASE_DIR, "data", "cleaned")
ASSETS_DATA_DIR = os.path.join(BASE_DIR, "assets", "data")

# Create assets/data directory if needed
os.makedirs(ASSETS_DATA_DIR, exist_ok=True)

# -----------------------------
# File mappings: CSV -> JSON
# -----------------------------
file_mappings = {
    "addresses.csv": "addresses.json",
    "market.csv": "market.json",
    "seniors.csv": "seniors.json",
    "adjustments.csv": "adjustments.json",
}

# -----------------------------
# Convert each CSV to JSON
# -----------------------------
for csv_file, json_file in file_mappings.items():
    csv_path = os.path.join(CLEANED_DATA_DIR, csv_file)
    json_path = os.path.join(ASSETS_DATA_DIR, json_file)
    
    if os.path.exists(csv_path):
        # Read CSV
        df = pd.read_csv(csv_path)
        
        # Replace NaN/NaT with None (which becomes null in JSON)
        df = df.fillna(None)
        
        # Convert to list of dictionaries, ensuring NaN becomes None
        data = df.to_dict('records')
        
        # Clean any remaining NaN values in the data
        def clean_nan(obj):
            if isinstance(obj, dict):
                return {k: clean_nan(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [clean_nan(item) for item in obj]
            elif pd.isna(obj) if hasattr(pd, 'isna') else (obj != obj):  # NaN check
                return None
            return obj
        
        data = clean_nan(data)
        
        # Write JSON (compact format for better browser performance)
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False)
        
        print(f"Converted {csv_file} -> {json_file} ({len(data)} records)")
    else:
        print(f"Warning: {csv_file} not found, skipping")

print("\nAll conversions complete!")
