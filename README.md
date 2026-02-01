# Gunnison County Property Tax Calculator

Educational, client-side property tax calculator for Gunnison County, Colorado. Uses publicly available data to demonstrate how assessed values and mill levies are used to estimate property taxes. Not an official tax system.

This tool helps users understand how property taxes are calculated but does not replace official tax bills or county records.

## Project Structure

```
Gunnison County Property Tax Calculator/
├── index.html              # Disclaimer gate page
├── calculator.html         # Main calculator interface
├── assets/
│   ├── css/
│   │   └── styles.css     # Stylesheet
│   ├── js/
│   │   ├── data-loader.js      # Data loading and indexing
│   │   ├── property-lookup.js  # Property search functionality
│   │   ├── calculator.js       # Tax calculation logic
│   │   └── ui.js               # UI controller
│   ├── data/              # JSON data files (generated)
│   │   ├── addresses.json
│   │   ├── market.json
│   │   ├── seniors.json
│   │   └── adjustments.json
│   └── maps/              # PDF map files
│       ├── Tax_Districts.pdf
│       └── taxing authorities .pdf
├── cleaning/              # Data cleaning scripts
│   ├── clean_addresses.py
│   ├── clean_market.py
│   ├── clean_seniors.py
│   ├── clean_adjustments.py
│   └── csv_to_json.py
└── data/
    ├── raw/               # Original CSV files (excluded from repo)
    └── cleaned/          # Cleaned CSV files
```

## Setup Instructions

### 1. Clean Raw Data

Run the cleaning scripts to prepare the data:

```bash
cd cleaning
python clean_addresses.py
python clean_market.py
python clean_seniors.py
python clean_adjustments.py
```

### 2. Convert CSV to JSON

Convert cleaned CSV files to JSON for the web application:

```bash
python csv_to_json.py
```

This will create JSON files in `assets/data/` directory.

### 3. Local Development

Start a local web server:

```bash
python -m http.server
```

Then open your browser to:
```
http://localhost:8000
```

**Note:** Modern browsers restrict loading local files via `file://`, so a local server is required for development.

## Usage

1. **Disclaimer Page**: Users must acknowledge the disclaimer before accessing the calculator
2. **Property Lookup**: Users can search by account number or address
3. **Assessment Calculation**: The calculator shows assessment rates and calculates assessed values
4. **Tax Estimation**: Final tax estimate is calculated and displayed with clear disclaimers

## Features

- Property lookup by account number or address
- Step-by-step calculation explanations
- Support for Residential, Commercial, and Vacant Land property types
- Hypothetical property estimation mode
- Exemption and adjustment flagging (informational only)
- Appeals education section
- Responsive design for mobile, tablet, and desktop
- Accessibility features (WCAG 2.1 AA compliant)

## Data Updates

To update the data:

1. Replace files in `data/raw/` with new CSV files
2. Run all cleaning scripts
3. Run `csv_to_json.py` to regenerate JSON files
4. Redeploy the static files

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This is a public-facing educational tool for Gunnison County, Colorado.

## Disclaimer

This calculator provides estimates for educational purposes only. Official tax bills and county records control all tax calculations.
