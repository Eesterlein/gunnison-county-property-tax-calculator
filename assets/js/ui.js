/**
 * UI Controller
 * Manages user interface interactions and state
 */

console.log('ui.js: Script loaded');

class UIController {
    constructor() {
        this.currentProperty = null;
        this.currentPropertyType = null;
        this.assessedValues = null;
        this.taxResults = null;
        console.log('UIController: Initializing...');
    }

    init() {
        console.log('UIController: Starting initialization...');
        console.log('UIController: dataLoader exists?', typeof dataLoader !== 'undefined');
        console.log('UIController: dataLoader.loadAll exists?', typeof dataLoader?.loadAll === 'function');
        
        // Load data first
        if (typeof dataLoader === 'undefined') {
            console.error('UIController: dataLoader is not defined!');
            this.showError('Data loader not found. Please check that all scripts are loaded.');
            return;
        }
        
        dataLoader.loadAll().then(loaded => {
            console.log('UIController: loadAll promise resolved, loaded =', loaded);
            if (loaded) {
                console.log('UIController: Data loaded, setting up event listeners...');
                this.setupEventListeners();
                console.log('UIController: Initialization complete');
            } else {
                console.error('UIController: Failed to load data (loaded = false)');
                this.showError('Failed to load property data. Please check the browser console for details and refresh the page.');
            }
        }).catch(error => {
            console.error('UIController: Error during initialization:', error);
            console.error('UIController: Error details:', error.message, error.stack);
            this.showError(`An error occurred while loading the calculator: ${error.message}. Please check the console and refresh the page.`);
        });
    }

    setupEventListeners() {
        console.log('UIController: Setting up event listeners...');
        
        // Tab switching
        const tabButtons = document.querySelectorAll('.tab-button');
        console.log(`UIController: Found ${tabButtons.length} tab buttons`);
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                console.log('UIController: Tab button clicked:', e.target.dataset.tab);
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Lookup type radio buttons
        const radioButtons = document.querySelectorAll('input[name="lookup-type"]');
        console.log(`UIController: Found ${radioButtons.length} radio buttons`);
        radioButtons.forEach(radio => {
            radio.addEventListener('change', (e) => {
                console.log('UIController: Lookup type changed:', e.target.value);
                this.toggleLookupInputs(e.target.value);
            });
        });

        // Account number lookup button
        const lookupButton = document.getElementById('lookup-button');
        if (lookupButton) {
            console.log('UIController: Found lookup button');
            lookupButton.addEventListener('click', () => {
                console.log('UIController: Lookup button clicked');
                this.handleLookup();
            });
        } else {
            console.error('UIController: Lookup button not found!');
        }

        // Address search
        const addressInput = document.getElementById('address-search');
        if (addressInput) {
            addressInput.addEventListener('input', (e) => {
                this.handleAddressSearch(e.target.value);
            });

            addressInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const suggestions = document.querySelectorAll('.suggestion-item');
                    if (suggestions.length > 0) {
                        suggestions[0].click();
                    }
                }
            });
        } else {
            console.warn('UIController: Address input not found');
        }

        // Hypothetical property button
        const hypotheticalButton = document.getElementById('use-hypothetical-button');
        if (hypotheticalButton) {
            hypotheticalButton.addEventListener('click', () => {
                console.log('UIController: Hypothetical property button clicked');
                this.handleHypotheticalProperty();
            });
        } else {
            console.warn('UIController: Hypothetical button not found');
        }

        // Tax district map button
        const taxDistrictMapButton = document.getElementById('view-tax-district-map-button');
        if (taxDistrictMapButton) {
            taxDistrictMapButton.addEventListener('click', () => {
                console.log('UIController: Tax district map button clicked');
                window.open('/assets/maps/Tax_Districts.pdf', '_blank', 'noopener,noreferrer');
            });
        }

        // Taxing authorities button
        const taxingAuthoritiesButton = document.getElementById('view-taxing-authorities-button');
        if (taxingAuthoritiesButton) {
            taxingAuthoritiesButton.addEventListener('click', () => {
                console.log('UIController: Taxing authorities button clicked');
                // URL encode the filename to handle spaces (filename has space before .pdf)
                const pdfPath = encodeURI('/assets/maps/taxing authorities .pdf');
                window.open(pdfPath, '_blank', 'noopener,noreferrer');
            });
        }

        // Tax district lookup for hypothetical mode
        const hypotheticalTaxDistrict = document.getElementById('hypothetical-tax-district');
        if (hypotheticalTaxDistrict) {
            hypotheticalTaxDistrict.addEventListener('blur', () => {
                this.lookupTaxDistrictMillLevies();
            });
            hypotheticalTaxDistrict.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.lookupTaxDistrictMillLevies();
                }
            });
        }

        // Calculate assessed value button
        const calculateAssessedButton = document.getElementById('calculate-assessed-button');
        if (calculateAssessedButton) {
            calculateAssessedButton.addEventListener('click', () => {
                console.log('UIController: Calculate assessed value button clicked');
                this.calculateAssessedValue();
            });
        } else {
            console.warn('UIController: Calculate assessed button not found');
        }

        // Estimate taxes button
        const estimateTaxesButton = document.getElementById('estimate-taxes-button');
        if (estimateTaxesButton) {
            estimateTaxesButton.addEventListener('click', () => {
                console.log('UIController: Estimate taxes button clicked');
                this.estimateTaxes();
            });
        } else {
            console.warn('UIController: Estimate taxes button not found');
        }

        // Collapsible sections
        document.querySelectorAll('.collapsible-header').forEach(header => {
            header.addEventListener('click', () => {
                this.toggleCollapsible(header);
            });
        });

        // Reset button
        const resetButton = document.getElementById('reset-button');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                console.log('UIController: Reset button clicked');
                this.resetCalculator();
            });
        } else {
            console.warn('UIController: Reset button not found');
        }
    }

    switchTab(tabName) {
        // Reset calculator state when switching tabs
        this.resetCalculatorState();
        
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });
        document.getElementById(`tab-${tabName}`).classList.add('active');
        document.getElementById(`tab-${tabName}`).setAttribute('aria-selected', 'true');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    toggleLookupInputs(type) {
        console.log('UIController: Toggling lookup inputs to:', type);
        const accountGroup = document.getElementById('account-input-group');
        const addressGroup = document.getElementById('address-input-group');
        const suggestions = document.getElementById('address-suggestions');
        
        if (type === 'account') {
            if (accountGroup) accountGroup.style.display = 'block';
            if (addressGroup) addressGroup.style.display = 'none';
            if (suggestions) suggestions.innerHTML = '';
        } else {
            if (accountGroup) accountGroup.style.display = 'none';
            if (addressGroup) addressGroup.style.display = 'block';
            // Make address input group relative for suggestions positioning
            if (addressGroup) addressGroup.style.position = 'relative';
        }
    }

    handleLookup() {
        console.log('UIController: handleLookup called');
        
        if (!dataLoader.loaded) {
            console.error('UIController: Data not loaded yet');
            this.showError('Data is still loading. Please wait a moment and try again.');
            return;
        }
        
        const lookupTypeRadio = document.querySelector('input[name="lookup-type"]:checked');
        if (!lookupTypeRadio) {
            console.error('UIController: No lookup type selected');
            this.showError('Please select a lookup method.');
            return;
        }
        
        const lookupType = lookupTypeRadio.value;
        console.log('UIController: Lookup type:', lookupType);
        
        if (lookupType === 'account') {
            const accountNumber = document.getElementById('account-number').value.trim();
            console.log('UIController: Account number entered:', accountNumber);
            
            if (!accountNumber) {
                this.showError('Please enter an account number.');
                return;
            }
            
            const result = propertyLookup.lookupByAccount(accountNumber);
            console.log('UIController: Lookup result:', result);
            
            if (result.success) {
                this.displayProperty(result.property);
            } else {
                this.showError(result.error);
            }
        } else {
            const address = document.getElementById('address-search').value.trim();
            console.log('UIController: Address entered:', address);
            
            if (!address) {
                this.showError('Please enter an address.');
                return;
            }
            
            const result = propertyLookup.lookupByAddress(address);
            console.log('UIController: Address lookup result:', result);
            
            if (result.success && result.property) {
                this.displayProperty(result.property);
            } else if (result.success && result.suggestions) {
                // Show suggestions - user should select one
                this.showError('Please select a property from the suggestions.');
            } else {
                this.showError(result.error);
            }
        }
    }

    handleAddressSearch(query) {
        const suggestionsDiv = document.getElementById('address-suggestions');
        if (!suggestionsDiv) {
            console.warn('UIController: Address suggestions div not found');
            return;
        }
        
        if (query.length < 2) {
            suggestionsDiv.innerHTML = '';
            return;
        }
        
        if (!dataLoader.loaded) {
            console.warn('UIController: Data not loaded yet for address search');
            suggestionsDiv.innerHTML = '<div class="suggestion-item">Loading data...</div>';
            return;
        }
        
        console.log('UIController: Searching addresses for:', query);
        const results = dataLoader.searchAddresses(query);
        console.log('UIController: Found', results.length, 'address matches');
        
        if (results.length === 0) {
            suggestionsDiv.innerHTML = '<div class="suggestion-item">No properties found</div>';
            return;
        }
        
        suggestionsDiv.innerHTML = results.map(addr => {
            return `<div class="suggestion-item" role="option" tabindex="0" data-account="${addr.account_number}">${addr.site_address}</div>`;
        }).join('');
        
        // Add click handlers to suggestions
        suggestionsDiv.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const account = item.dataset.account;
                console.log('UIController: Address suggestion selected:', account);
                const property = dataLoader.getPropertyByAccount(account);
                if (property) {
                    const addressInput = document.getElementById('address-search');
                    if (addressInput) {
                        addressInput.value = property.address.site_address;
                    }
                    suggestionsDiv.innerHTML = '';
                    this.displayProperty(property);
                } else {
                    console.error('UIController: Property not found for account:', account);
                    this.showError('Error loading property data.');
                }
            });
            
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    item.click();
                }
            });
        });
    }

    displayProperty(property) {
        console.log('UIController: Displaying property:', property);
        this.currentProperty = property;
        this.currentPropertyType = property.address.property_type;
        
        // Show property details
        const resultsBox = document.getElementById('property-results');
        const detailsDiv = document.getElementById('property-details');
        
        if (!resultsBox || !detailsDiv) {
            console.error('UIController: Property results elements not found');
            this.showError('Error displaying property information.');
            return;
        }
        
        detailsDiv.innerHTML = propertyLookup.formatPropertyDisplay(property);
        resultsBox.style.display = 'block';
        
        // Show assessment section
        const assessmentSection = document.getElementById('assessment-section');
        if (assessmentSection) {
            assessmentSection.style.display = 'block';
            this.displayAssessmentRates();
        } else {
            console.error('UIController: Assessment section not found');
        }
        
        // Check for exemptions
        this.checkExemptions(property);
        
        // Scroll to results
        resultsBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    displayAssessmentRates() {
        const propertyType = this.currentProperty.address.property_type;
        const rates = dataLoader.getAssessmentRates(propertyType);
        
        const displayDiv = document.getElementById('assessment-rates-display');
        
        if (rates.singleRate === true) {
            // Single rate for Commercial/Vacant Land
            displayDiv.innerHTML = `
                <h3>Assessment Rate for ${propertyType} Properties</h3>
                <div class="calculation-step">
                    <p><strong>Assessment Rate:</strong> ${taxCalculator.formatPercentage(rates.rate)}</p>
                    <p>This rate applies to all property taxes (county, municipal, school district, and special districts).</p>
                </div>
                <p><em>Note: This rate is set by Colorado law and is informational only.</em></p>
            `;
        } else {
            // Dual rate for Residential
            displayDiv.innerHTML = `
                <h3>Assessment Rates for ${propertyType} Properties</h3>
                <div class="calculation-step">
                    <p><strong>Local Government Rate:</strong> ${taxCalculator.formatPercentage(rates.localGovernment)}</p>
                    <p>This rate applies to county, municipal, and special district taxes.</p>
                </div>
                <div class="calculation-step">
                    <p><strong>School District Rate:</strong> ${taxCalculator.formatPercentage(rates.schoolDistrict)}</p>
                    <p>This rate applies to school district taxes.</p>
                </div>
                <p><em>Note: These rates are set by Colorado law and are informational only.</em></p>
            `;
        }
    }

    calculateAssessedValue() {
        console.log('UIController: calculateAssessedValue called');
        
        if (!this.currentProperty) {
            console.error('UIController: No property selected');
            this.showError('Please look up a property first.');
            return;
        }
        
        const actualValue = this.currentProperty.market.total_actual_value;
        const propertyType = this.currentProperty.address.property_type;
        
        console.log('UIController: Calculating assessed value:', {
            actualValue,
            propertyType
        });
        
        this.assessedValues = taxCalculator.calculateAssessedValue(actualValue, propertyType);
        
        console.log('UIController: Assessed values calculated:', this.assessedValues);
        
        const resultsDiv = document.getElementById('assessed-value-results');
        if (!resultsDiv) {
            console.error('UIController: Assessed value results div not found');
            this.showError('Error displaying calculation results.');
            return;
        }
        
        // Display based on single-rate vs dual-rate
        if (this.assessedValues.singleRate === true) {
            // Single rate calculation (Commercial/Vacant Land)
            resultsDiv.innerHTML = `
                <h3>Assessed Value Calculation</h3>
                <div class="calculation-step">
                    <p><strong>Actual Value:</strong> ${taxCalculator.formatCurrency(this.assessedValues.actualValue)}</p>
                </div>
                <div class="calculation-step">
                    <p><strong>Assessed Value (${taxCalculator.formatPercentage(this.assessedValues.rate)}):</strong></p>
                    <p class="calculation-formula">
                        ${taxCalculator.formatCurrency(this.assessedValues.actualValue)} × ${taxCalculator.formatPercentage(this.assessedValues.rate)} = 
                        ${taxCalculator.formatCurrency(this.assessedValues.assessedValue)}
                    </p>
                    <p>This assessed value is used to calculate all property taxes.</p>
                </div>
            `;
        } else {
            // Dual rate calculation (Residential)
            resultsDiv.innerHTML = `
                <h3>Assessed Value Calculation</h3>
                <div class="calculation-step">
                    <p><strong>Actual Value:</strong> ${taxCalculator.formatCurrency(this.assessedValues.actualValue)}</p>
                </div>
                <div class="calculation-step">
                    <p><strong>Local Government Assessed Value (${taxCalculator.formatPercentage(this.assessedValues.localGovernment.rate)}):</strong></p>
                    <p class="calculation-formula">
                        ${taxCalculator.formatCurrency(this.assessedValues.actualValue)} × ${taxCalculator.formatPercentage(this.assessedValues.localGovernment.rate)} = 
                        ${taxCalculator.formatCurrency(this.assessedValues.localGovernment.assessedValue)}
                    </p>
                    <p>This value is used to calculate taxes for counties, municipalities, and special districts.</p>
                </div>
                <div class="calculation-step">
                    <p><strong>School District Assessed Value (${taxCalculator.formatPercentage(this.assessedValues.schoolDistrict.rate)}):</strong></p>
                    <p class="calculation-formula">
                        ${taxCalculator.formatCurrency(this.assessedValues.actualValue)} × ${taxCalculator.formatPercentage(this.assessedValues.schoolDistrict.rate)} = 
                        ${taxCalculator.formatCurrency(this.assessedValues.schoolDistrict.assessedValue)}
                    </p>
                    <p>This value is used to calculate school district taxes.</p>
                </div>
            `;
        }
        resultsDiv.style.display = 'block';
        
        // Show mill levy section
        const millLevySection = document.getElementById('mill-levy-section');
        if (millLevySection) {
            millLevySection.style.display = 'block';
            this.displayMillLevies();
        } else {
            console.error('UIController: Mill levy section not found');
        }
        
        // Scroll to results
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    displayMillLevies() {
        if (!this.currentProperty) return;
        
        const market = this.currentProperty.market;
        const displayDiv = document.getElementById('mill-levy-display');
        
        displayDiv.innerHTML = `
            <h3>Tax District Information</h3>
            <div class="calculation-step">
                <p><strong>Tax District:</strong> ${market.tax_district}</p>
                <p><strong>Local Government Mill Levy:</strong> ${market.lg_mill_levy} mills</p>
                <p><strong>School District Mill Levy:</strong> ${market.school_mill_levy} mills</p>
                <p><strong>Total Mill Levy:</strong> ${market.total_mill_levy} mills</p>
            </div>
            <p><em>Note: Mill levies are set by local taxing authorities. 1 mill = $1 tax per $1,000 of assessed value.</em></p>
        `;
        
        // Show tax estimation section
        document.getElementById('tax-estimation-section').style.display = 'block';
    }

    estimateTaxes() {
        console.log('UIController: estimateTaxes called');
        
        if (!this.assessedValues || !this.currentProperty) {
            console.error('UIController: Missing assessed values or property');
            this.showError('Please calculate assessed values first.');
            return;
        }
        
        const market = this.currentProperty.market;
        const millLevies = {
            localGovernment: parseFloat(market.lg_mill_levy),
            schoolDistrict: parseFloat(market.school_mill_levy),
            totalMillLevy: parseFloat(market.total_mill_levy)
        };
        
        console.log('UIController: Calculating taxes with mill levies:', millLevies);
        
        this.taxResults = taxCalculator.calculateTaxes(this.assessedValues, millLevies);
        
        console.log('UIController: Tax results:', this.taxResults);
        
        const resultsDiv = document.getElementById('tax-estimation-results');
        if (!resultsDiv) {
            console.error('UIController: Tax estimation results div not found');
            this.showError('Error displaying tax estimation results.');
            return;
        }
        
        // Display based on single-rate vs dual-rate
        if (this.taxResults.singleRate === true) {
            // Single rate calculation (Commercial/Vacant Land)
            resultsDiv.innerHTML = `
                <h3>Tax Estimation</h3>
                <div class="calculation-step">
                    <p><strong>Total Property Tax:</strong></p>
                    <p class="calculation-formula">
                        ${taxCalculator.formatCurrency(this.taxResults.assessedValue)} × ${this.taxResults.totalMillLevy} ÷ 1,000 = 
                        ${taxCalculator.formatCurrency(this.taxResults.total)}
                    </p>
                    <p>This calculation uses the total mill levy for all taxing districts.</p>
                </div>
                <div class="final-estimate">
                    <p>Estimated Total Property Tax:</p>
                    <p>${taxCalculator.formatCurrency(this.taxResults.total)}</p>
                </div>
                <div class="warning-banner" role="alert">
                    <strong>⚠️ Important:</strong> This is an estimate for educational purposes only. 
                    Your official tax bill may differ due to exemptions, adjustments, or changes in mill levies.
                </div>
            `;
        } else {
            // Dual rate calculation (Residential)
            resultsDiv.innerHTML = `
                <h3>Tax Estimation</h3>
                <div class="calculation-step">
                    <p><strong>Local Government Tax:</strong></p>
                    <p class="calculation-formula">
                        ${taxCalculator.formatCurrency(this.taxResults.localGovernment.assessedValue)} × ${this.taxResults.localGovernment.millLevy} ÷ 1,000 = 
                        ${taxCalculator.formatCurrency(this.taxResults.localGovernment.tax)}
                    </p>
                </div>
                <div class="calculation-step">
                    <p><strong>School District Tax:</strong></p>
                    <p class="calculation-formula">
                        ${taxCalculator.formatCurrency(this.taxResults.schoolDistrict.assessedValue)} × ${this.taxResults.schoolDistrict.millLevy} ÷ 1,000 = 
                        ${taxCalculator.formatCurrency(this.taxResults.schoolDistrict.tax)}
                    </p>
                </div>
                <div class="final-estimate">
                    <p>Estimated Total Property Tax:</p>
                    <p>${taxCalculator.formatCurrency(this.taxResults.total)}</p>
                </div>
                <div class="warning-banner" role="alert">
                    <strong>⚠️ Important:</strong> This is an estimate for educational purposes only. 
                    Your official tax bill may differ due to exemptions, adjustments, or changes in mill levies.
                </div>
            `;
        }
        resultsDiv.style.display = 'block';
        
        // Scroll to results
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    lookupTaxDistrictMillLevies() {
        const taxDistrictInput = document.getElementById('hypothetical-tax-district');
        if (!taxDistrictInput || !dataLoader.loaded) return;
        
        const taxDistrict = taxDistrictInput.value.trim();
        if (!taxDistrict) return;
        
        // Find first property with matching tax district
        const matchingProperty = dataLoader.market.find(m => 
            String(m.tax_district) === String(taxDistrict)
        );
        
        const lgMillInput = document.getElementById('hypothetical-lg-mill');
        const schoolMillInput = document.getElementById('hypothetical-school-mill');
        const millLevyNote = document.getElementById('mill-levy-note');
        
        if (matchingProperty) {
            // Auto-populate mill levies
            if (lgMillInput) lgMillInput.value = matchingProperty.lg_mill_levy;
            if (schoolMillInput) schoolMillInput.value = matchingProperty.school_mill_levy;
            
            // Remove existing note if present
            if (millLevyNote) millLevyNote.remove();
            
            // Add success note
            const note = document.createElement('div');
            note.id = 'mill-levy-note';
            note.className = 'help-text';
            note.style.color = '#006600';
            note.style.marginTop = '0.5rem';
            note.textContent = 'Mill levies loaded based on selected tax district.';
            
            const taxDistrictGroup = taxDistrictInput.closest('.input-group');
            if (taxDistrictGroup) {
                taxDistrictGroup.appendChild(note);
            }
            
            console.log('UIController: Mill levies loaded for tax district:', taxDistrict);
        } else {
            // Remove existing note if present
            if (millLevyNote) millLevyNote.remove();
            
            // Show validation error
            const note = document.createElement('div');
            note.id = 'mill-levy-note';
            note.className = 'help-text';
            note.style.color = '#cc0000';
            note.style.marginTop = '0.5rem';
            note.textContent = 'Tax district not found. Please verify the district number or enter mill levies manually.';
            
            const taxDistrictGroup = taxDistrictInput.closest('.input-group');
            if (taxDistrictGroup) {
                taxDistrictGroup.appendChild(note);
            }
            
            console.log('UIController: Tax district not found:', taxDistrict);
        }
    }

    handleHypotheticalProperty() {
        console.log('UIController: handleHypotheticalProperty called');
        
        const propertyTypeEl = document.getElementById('hypothetical-property-type');
        const actualValueEl = document.getElementById('hypothetical-actual-value');
        const taxDistrictEl = document.getElementById('hypothetical-tax-district');
        const lgMillEl = document.getElementById('hypothetical-lg-mill');
        const schoolMillEl = document.getElementById('hypothetical-school-mill');
        
        if (!propertyTypeEl || !actualValueEl || !taxDistrictEl || !lgMillEl || !schoolMillEl) {
            console.error('UIController: Hypothetical property input elements not found');
            this.showError('Error: Form elements not found.');
            return;
        }
        
        const propertyType = propertyTypeEl.value;
        const actualValue = parseFloat(actualValueEl.value);
        const taxDistrict = taxDistrictEl.value.trim();
        const lgMill = parseFloat(lgMillEl.value);
        const schoolMill = parseFloat(schoolMillEl.value);
        
        console.log('UIController: Hypothetical property inputs:', {
            propertyType,
            actualValue,
            taxDistrict,
            lgMill,
            schoolMill
        });
        
        // Validation
        if (!actualValue || actualValue <= 0 || isNaN(actualValue)) {
            this.showError('Please enter a valid actual value.');
            return;
        }
        
        if (!taxDistrict) {
            this.showError('Please enter a tax district.');
            return;
        }
        
        // Verify tax district exists
        if (!dataLoader.loaded) {
            this.showError('Data is still loading. Please wait a moment and try again.');
            return;
        }
        
        const matchingProperty = dataLoader.market.find(m => 
            String(m.tax_district) === String(taxDistrict)
        );
        
        if (!matchingProperty) {
            this.showError('Tax district not found. Please verify the district number or enter mill levies manually.');
            return;
        }
        
        if (!lgMill || lgMill <= 0 || isNaN(lgMill)) {
            this.showError('Please enter a valid local government mill levy.');
            return;
        }
        
        if (!schoolMill || schoolMill <= 0 || isNaN(schoolMill)) {
            this.showError('Please enter a valid school district mill levy.');
            return;
        }
        
        // Create a mock property object
        this.currentProperty = {
            address: {
                property_type: propertyType,
                account_number: 'HYPOTHETICAL',
                site_address: 'Hypothetical Property'
            },
            market: {
                total_actual_value: actualValue,
                tax_district: taxDistrict || 'N/A',
                lg_mill_levy: lgMill,
                school_mill_levy: schoolMill,
                tax_year: new Date().getFullYear()
            },
            hasSeniorExemption: false,
            hasAdjustment: false
        };
        
        this.currentPropertyType = propertyType;
        
        console.log('UIController: Hypothetical property created:', this.currentProperty);
        
        // Hide lookup results, show assessment section
        const propertyResults = document.getElementById('property-results');
        if (propertyResults) {
            propertyResults.style.display = 'none';
        }
        
        const assessmentSection = document.getElementById('assessment-section');
        if (assessmentSection) {
            assessmentSection.style.display = 'block';
            this.displayAssessmentRates();
            // Scroll to assessment section
            assessmentSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            console.error('UIController: Assessment section not found');
            this.showError('Error displaying assessment section.');
        }
    }

    checkExemptions(property) {
        const exemptionsDiv = document.getElementById('exemptions-display');
        const exemptionsSection = document.getElementById('exemptions-section');
        
        if (property.hasSeniorExemption || property.hasAdjustment) {
            let flagsHTML = '<div class="exemption-flags-container" role="alert">';
            
            // Mosquito adjustment flag
            if (property.hasAdjustment) {
                flagsHTML += `
                    <div class="exemption-flag mosquito" aria-label="Mosquito district adjustment may apply">
                        <span class="flag-icon" aria-hidden="true">🦟</span>
                        <span class="flag-text">Mosquito district adjustment may apply</span>
                    </div>
                `;
            }
            
            // Senior exemption flag
            if (property.hasSeniorExemption) {
                flagsHTML += `
                    <div class="exemption-flag senior" aria-label="Senior exemption may apply">
                        <span class="flag-icon" aria-hidden="true">🎖</span>
                        <span class="flag-text">Senior exemption may apply</span>
                    </div>
                `;
            }
            
            flagsHTML += '</div>';
            
            // Explanatory text below flags
            flagsHTML += `
                <div class="exemption-explanation">
                    <p>The estimate shown reflects the base tax calculation before exemptions or adjustments.</p>
                    <p>For details about exemptions and adjustments, please contact the 
                    <a href="https://www.gunnisoncounty.org" target="_blank" rel="noopener">Gunnison County Assessor's Office</a>.</p>
                </div>
            `;
            
            exemptionsDiv.innerHTML = flagsHTML;
            exemptionsSection.style.display = 'block';
        } else {
            exemptionsSection.style.display = 'none';
        }
    }

    toggleCollapsible(header) {
        const content = header.nextElementSibling;
        const isExpanded = header.getAttribute('aria-expanded') === 'true';
        
        header.setAttribute('aria-expanded', !isExpanded);
        content.classList.toggle('active');
    }

    resetCalculatorState() {
        console.log('UIController: Resetting calculator state...');
        
        // Clear state
        this.currentProperty = null;
        this.currentPropertyType = null;
        this.assessedValues = null;
        this.taxResults = null;
        
        // Clear lookup input fields
        const accountInput = document.getElementById('account-number');
        if (accountInput) accountInput.value = '';
        
        const addressInput = document.getElementById('address-search');
        if (addressInput) addressInput.value = '';
        
        const addressSuggestions = document.getElementById('address-suggestions');
        if (addressSuggestions) addressSuggestions.innerHTML = '';
        
        // Clear hypothetical input fields
        const hypotheticalActualValue = document.getElementById('hypothetical-actual-value');
        if (hypotheticalActualValue) hypotheticalActualValue.value = '';
        
        const hypotheticalTaxDistrict = document.getElementById('hypothetical-tax-district');
        if (hypotheticalTaxDistrict) hypotheticalTaxDistrict.value = '';
        
        const hypotheticalLgMill = document.getElementById('hypothetical-lg-mill');
        if (hypotheticalLgMill) hypotheticalLgMill.value = '';
        
        const hypotheticalSchoolMill = document.getElementById('hypothetical-school-mill');
        if (hypotheticalSchoolMill) hypotheticalSchoolMill.value = '';
        
        // Clear mill levy note if it exists
        const millLevyNote = document.getElementById('mill-levy-note');
        if (millLevyNote) millLevyNote.remove();
        
        // Reset radio buttons to account lookup
        const accountRadio = document.querySelector('input[name="lookup-type"][value="account"]');
        if (accountRadio) accountRadio.checked = true;
        this.toggleLookupInputs('account');
        
        // Hide all result sections
        const sectionsToHide = [
            'property-results',
            'assessment-section',
            'mill-levy-section',
            'tax-estimation-section',
            'exemptions-section'
        ];
        
        sectionsToHide.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = 'none';
            }
        });
        
        // Clear display divs
        const displayDivs = [
            'property-details',
            'assessment-rates-display',
            'assessed-value-results',
            'mill-levy-display',
            'tax-estimation-results',
            'exemptions-display'
        ];
        
        displayDivs.forEach(divId => {
            const div = document.getElementById(divId);
            if (div) {
                div.innerHTML = '';
            }
        });
        
        console.log('UIController: Calculator state reset complete');
    }

    resetCalculator() {
        console.log('UIController: Resetting calculator...');
        this.resetCalculatorState();
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        console.log('UIController: Calculator reset complete');
    }

    showError(message) {
        console.error('UIController: Error:', message);
        // Simple error display - could be enhanced with a toast or modal
        alert(message); // Replace with better UI in production
    }
}

// Initialize UI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded: Initializing UI controller...');
    console.log('DOMContentLoaded: Checking for dataLoader...', typeof dataLoader !== 'undefined');
    
    // Wait a tiny bit to ensure all scripts are loaded
    setTimeout(() => {
        if (typeof dataLoader === 'undefined') {
            console.error('DOMContentLoaded: dataLoader is still undefined after timeout!');
            alert('Error: Data loader script failed to load. Please refresh the page.');
            return;
        }
        
        console.log('DOMContentLoaded: dataLoader found, creating UI controller...');
        const ui = new UIController();
        ui.init();
        // Make ui available globally for debugging
        window.uiController = ui;
        window.dataLoader = dataLoader; // Also expose for debugging
    }, 100);
});
