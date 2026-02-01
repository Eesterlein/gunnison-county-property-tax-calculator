/**
 * Data Loader
 * Loads JSON data files and provides access to property data
 */

console.log('data-loader.js: Script loaded');

class DataLoader {
    constructor() {
        this.addresses = null;
        this.market = null;
        this.seniors = null;
        this.adjustments = null;
        this.loaded = false;
    }

    async loadAll() {
        try {
            console.log('Starting data load...');
            console.log('Current location:', window.location.href);
            console.log('Current pathname:', window.location.pathname);
            
            // Use relative paths for GitHub Pages compatibility (works on both localhost and GitHub Pages)
            const cacheBuster = '?v=' + Date.now();
            const addressesUrl = 'assets/data/addresses.json' + cacheBuster;
            const marketUrl = 'assets/data/market.json' + cacheBuster;
            const seniorsUrl = 'assets/data/seniors.json' + cacheBuster;
            const adjustmentsUrl = 'assets/data/adjustments.json' + cacheBuster;
            
            console.log('Loading from URLs:', { addressesUrl, marketUrl, seniorsUrl, adjustmentsUrl });
            
            const fetchPromises = [
                fetch(addressesUrl, {cache: 'no-store'}).then(async r => {
                    console.log('✓ Addresses fetch initiated:', addressesUrl);
                    console.log('  Response status:', r.status, r.statusText);
                    console.log('  Response URL:', r.url);
                    console.log('  Response headers:', Object.fromEntries(r.headers.entries()));
                    
                    if (!r.ok) {
                        const text = await r.text();
                        console.error('✗ Addresses fetch failed. Response text:', text.substring(0, 500));
                        throw new Error(`Failed to load addresses.json: ${r.status} ${r.statusText} from ${r.url}`);
                    }
                    const data = await r.json();
                    console.log('✓ Addresses loaded successfully:', data.length, 'records');
                    return data;
                }).catch(err => {
                    console.error('✗ Addresses fetch exception:', err);
                    throw err;
                }),
                fetch(marketUrl, {cache: 'no-store'}).then(async r => {
                    console.log('✓ Market fetch initiated:', marketUrl);
                    console.log('  Response status:', r.status, r.statusText);
                    if (!r.ok) {
                        const text = await r.text();
                        console.error('✗ Market fetch failed. Response text:', text.substring(0, 500));
                        throw new Error(`Failed to load market.json: ${r.status} ${r.statusText} from ${r.url}`);
                    }
                    const data = await r.json();
                    console.log('✓ Market loaded successfully:', data.length, 'records');
                    return data;
                }).catch(err => {
                    console.error('✗ Market fetch exception:', err);
                    throw err;
                }),
                fetch(seniorsUrl, {cache: 'no-store'}).then(async r => {
                    console.log('✓ Seniors fetch initiated:', seniorsUrl);
                    console.log('  Response status:', r.status, r.statusText);
                    if (!r.ok) {
                        const text = await r.text();
                        console.error('✗ Seniors fetch failed. Response text:', text.substring(0, 500));
                        throw new Error(`Failed to load seniors.json: ${r.status} ${r.statusText} from ${r.url}`);
                    }
                    const data = await r.json();
                    console.log('✓ Seniors loaded successfully:', data.length, 'records');
                    return data;
                }).catch(err => {
                    console.error('✗ Seniors fetch exception:', err);
                    throw err;
                }),
                fetch(adjustmentsUrl, {cache: 'no-store'}).then(async r => {
                    console.log('✓ Adjustments fetch initiated:', adjustmentsUrl);
                    console.log('  Response status:', r.status, r.statusText);
                    if (!r.ok) {
                        const text = await r.text();
                        console.error('✗ Adjustments fetch failed. Response text:', text.substring(0, 500));
                        throw new Error(`Failed to load adjustments.json: ${r.status} ${r.statusText} from ${r.url}`);
                    }
                    const data = await r.json();
                    console.log('✓ Adjustments loaded successfully:', data.length, 'records');
                    return data;
                }).catch(err => {
                    console.error('✗ Adjustments fetch exception:', err);
                    throw err;
                })
            ];
            
            console.log('Waiting for all fetch promises to resolve...');
            const [addresses, market, seniors, adjustments] = await Promise.all(fetchPromises);
            console.log('All fetch promises resolved successfully!');

            this.addresses = addresses;
            this.market = market;
            this.seniors = seniors;
            this.adjustments = adjustments;
            this.loaded = true;

            // Create lookup maps for faster access
            this.addressMap = new Map();
            this.marketMap = new Map();
            this.seniorsMap = new Map();
            this.adjustmentsSet = new Set();

            // Index addresses by account number
            addresses.forEach(addr => {
                this.addressMap.set(addr.account_number, addr);
            });

            // Index market data by account number
            market.forEach(m => {
                this.marketMap.set(m.account_number, m);
            });

            // Index seniors by account number
            seniors.forEach(s => {
                this.seniorsMap.set(s.account_number, s);
            });

            // Index adjustments as a set
            adjustments.forEach(a => {
                this.adjustmentsSet.add(a.account_number);
            });

            console.log('Data loaded successfully:');
            console.log(`  - Addresses: ${addresses.length} records`);
            console.log(`  - Market: ${market.length} records`);
            console.log(`  - Seniors: ${seniors.length} records`);
            console.log(`  - Adjustments: ${adjustments.length} records`);
            return true;
        } catch (error) {
            console.error('=== DATA LOADING ERROR ===');
            console.error('Error message:', error.message);
            console.error('Error name:', error.name);
            console.error('Full error:', error);
            console.error('Stack trace:', error.stack);
            console.error('=== END ERROR ===');
            return false;
        }
    }

    getPropertyByAccount(accountNumber) {
        if (!this.loaded) return null;
        
        const address = this.addressMap.get(accountNumber);
        const market = this.marketMap.get(accountNumber);
        
        if (!address || !market) return null;
        
        return {
            account_number: accountNumber,
            address: address,
            market: market,
            hasSeniorExemption: this.seniorsMap.has(accountNumber),
            hasAdjustment: this.adjustmentsSet.has(accountNumber),
            seniorData: this.seniorsMap.get(accountNumber) || null
        };
    }

    searchAddresses(query) {
        if (!this.loaded || !query) return [];
        
        const lowerQuery = query.toLowerCase().trim();
        if (lowerQuery.length < 2) return [];
        
        const results = [];
        for (const addr of this.addresses) {
            if (addr.site_address && addr.site_address.toLowerCase().includes(lowerQuery)) {
                results.push(addr);
                if (results.length >= 10) break; // Limit to 10 results
            }
        }
        
        return results;
    }

    getAssessmentRates(propertyType) {
        // Colorado assessment rates by property type
        const rates = {
            'Residential': {
                singleRate: false,
                localGovernment: 0.0625,  // 6.25%
                schoolDistrict: 0.0705    // 7.05%
            },
            'Commercial': {
                singleRate: true,
                rate: 0.27  // 27%
            },
            'Vacant Land': {
                singleRate: true,
                rate: 0.27  // 27%
            }
        };
        
        return rates[propertyType] || rates['Residential'];
    }
}

// Create global instance
const dataLoader = new DataLoader();
console.log('data-loader.js: Global dataLoader instance created');
