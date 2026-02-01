# GitHub Pages Deployment Guide

## Pre-Deployment Checklist

### ✅ Completed
- [x] `.gitignore` created and configured
- [x] All required JSON files exist in `assets/data/`
- [x] All required PDF files exist in `assets/maps/`
- [x] Asset paths use absolute paths (compatible with GitHub Pages)
- [x] No localhost references in code
- [x] No raw data files will be committed (excluded via .gitignore)

### Required Files for Deployment

**Include (will be committed):**
- `index.html` - Disclaimer gate page
- `calculator.html` - Main calculator interface
- `assets/css/styles.css` - Stylesheet
- `assets/js/*.js` - All JavaScript files
- `assets/data/*.json` - All JSON data files (4 files)
- `assets/maps/*.pdf` - All PDF map files (2 files)
- `cleaning/*.py` - Data cleaning scripts (for reference)
- `data/cleaned/*.csv` - Cleaned CSV files (for reference)
- `README.md` - Project documentation
- `.gitignore` - Git ignore rules

**Exclude (ignored via .gitignore):**
- `venv/` - Python virtual environment
- `data/raw/` - Raw CSV source files
- `__pycache__/` - Python cache files
- `.DS_Store` - macOS system files

## Deployment Steps

### 1. Verify Files Are Ready
```bash
# Check that required files exist
ls -la assets/data/*.json
ls -la assets/maps/*.pdf

# Verify .gitignore is working
git status --ignored | grep -E "(venv|data/raw)"
```

### 2. Stage and Commit Files
```bash
# Add all files (venv/ and data/raw/ will be ignored)
git add .

# Review what will be committed
git status

# Commit with descriptive message
git commit -m "Prepare project for GitHub Pages deployment"
```

### 3. Add Remote and Push
```bash
# Add remote repository
git remote add origin https://github.com/Eesterlein/gunnison-county-property-tax-calculator.git

# Push to main branch
git branch -M main
git push -u origin main
```

### 4. Enable GitHub Pages (Manual Step)

After pushing, go to the repository settings:

1. Navigate to **Settings** → **Pages**
2. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
3. Click **Save**

The site will be available at:
`https://eesterlein.github.io/gunnison-county-property-tax-calculator/`

## Post-Deployment Verification

1. ✅ Test property lookup functionality
2. ✅ Verify JSON data files load correctly
3. ✅ Test PDF map links open correctly
4. ✅ Confirm calculations work as expected
5. ✅ Check mobile responsiveness
6. ✅ Verify accessibility features

## Notes

- This is a **static site only** - no backend required
- All data is preprocessed and bundled client-side
- Raw data files are intentionally excluded from the repository
- The calculator uses absolute paths (`/assets/...`) which work correctly on GitHub Pages

## Troubleshooting

If assets don't load on GitHub Pages:
- Verify paths use leading slash (`/assets/...` not `./assets/...`)
- Check that JSON files are in `assets/data/` directory
- Ensure PDF files are in `assets/maps/` directory
- Clear browser cache and hard refresh
