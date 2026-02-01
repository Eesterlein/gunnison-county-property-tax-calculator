/**
 * Property Lookup
 * Handles property search by account number or address
 */

console.log('property-lookup.js: Script loaded');

class PropertyLookup {
    constructor(dataLoader) {
        this.dataLoader = dataLoader;
        this.currentProperty = null;
    }

    lookupByAccount(accountNumber) {
        if (!this.dataLoader || !this.dataLoader.loaded) {
            return {
                success: false,
                error: 'Data is still loading. Please wait a moment and try again.'
            };
        }
        
        const account = accountNumber.trim().toUpperCase();
        console.log('PropertyLookup: Looking up account:', account);
        
        const property = this.dataLoader.getPropertyByAccount(account);
        
        if (property) {
            console.log('PropertyLookup: Property found:', property);
            this.currentProperty = property;
            return {
                success: true,
                property: property
            };
        } else {
            console.log('PropertyLookup: Property not found for account:', account);
            return {
                success: false,
                error: 'Property not found. Please check the account number and try again.'
            };
        }
    }

    lookupByAddress(addressQuery) {
        if (!this.dataLoader || !this.dataLoader.loaded) {
            return {
                success: false,
                error: 'Data is still loading. Please wait a moment and try again.'
            };
        }
        
        console.log('PropertyLookup: Looking up address:', addressQuery);
        const results = this.dataLoader.searchAddresses(addressQuery);
        console.log('PropertyLookup: Found', results.length, 'matches');
        
        if (results.length === 0) {
            return {
                success: false,
                error: 'No properties found matching that address.'
            };
        }
        
        if (results.length === 1) {
            // Auto-select if only one result
            const property = this.dataLoader.getPropertyByAccount(results[0].account_number);
            if (property) {
                console.log('PropertyLookup: Auto-selecting single result');
                this.currentProperty = property;
                return {
                    success: true,
                    property: property
                };
            }
        }
        
        return {
            success: true,
            suggestions: results
        };
    }

    getCurrentProperty() {
        return this.currentProperty;
    }

    formatPropertyDisplay(property) {
        if (!property) return '';
        
        const addr = property.address;
        const market = property.market;
        
        return `
            <div class="property-details">
                <p><strong>Account Number:</strong> ${addr.account_number}</p>
                <p><strong>Address:</strong> ${addr.site_address}</p>
                <p><strong>Property Type:</strong> ${addr.property_type}</p>
                <p><strong>Parcel Number:</strong> ${addr.parcel_number}</p>
                <p><strong>Actual Value:</strong> $${this.formatCurrency(market.total_actual_value)}</p>
                <p><strong>Tax District:</strong> ${market.tax_district}</p>
                <p><strong>Tax Year:</strong> ${market.tax_year}</p>
            </div>
        `;
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('en-US').format(value);
    }
}

// Create global instance
const propertyLookup = new PropertyLookup(dataLoader);
