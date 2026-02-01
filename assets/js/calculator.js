/**
 * Tax Calculator
 * Performs property tax calculations
 */

console.log('calculator.js: Script loaded');

class TaxCalculator {
    constructor(dataLoader) {
        this.dataLoader = dataLoader;
    }

    calculateAssessedValue(actualValue, propertyType) {
        const rates = this.dataLoader.getAssessmentRates(propertyType);
        
        // Single rate for Commercial and Vacant (non-residential properties)
        if (rates.singleRate === true) {
            const assessedValue = actualValue * rates.rate;
            return {
                actualValue: actualValue,
                singleRate: true,
                rate: rates.rate,
                assessedValue: assessedValue
            };
        }
        
        // Dual rate for Residential
        const localGovAssessed = actualValue * rates.localGovernment;
        const schoolAssessed = actualValue * rates.schoolDistrict;
        
        return {
            actualValue: actualValue,
            singleRate: false,
            localGovernment: {
                rate: rates.localGovernment,
                assessedValue: localGovAssessed
            },
            schoolDistrict: {
                rate: rates.schoolDistrict,
                assessedValue: schoolAssessed
            }
        };
    }

    calculateTaxes(assessedValues, millLevies) {
        // Single rate calculation (Commercial/Vacant Land)
        if (assessedValues.singleRate === true) {
            const totalMillLevy = parseFloat(millLevies.totalMillLevy || (millLevies.localGovernment + millLevies.schoolDistrict));
            const totalTax = (assessedValues.assessedValue * totalMillLevy) / 1000;
            
            return {
                singleRate: true,
                assessedValue: assessedValues.assessedValue,
                totalMillLevy: totalMillLevy,
                total: totalTax
            };
        }
        
        // Dual rate calculation (Residential)
        const localGovTax = (assessedValues.localGovernment.assessedValue * millLevies.localGovernment) / 1000;
        const schoolTax = (assessedValues.schoolDistrict.assessedValue * millLevies.schoolDistrict) / 1000;
        const totalTax = localGovTax + schoolTax;
        
        return {
            singleRate: false,
            localGovernment: {
                assessedValue: assessedValues.localGovernment.assessedValue,
                millLevy: millLevies.localGovernment,
                tax: localGovTax
            },
            schoolDistrict: {
                assessedValue: assessedValues.schoolDistrict.assessedValue,
                millLevy: millLevies.schoolDistrict,
                tax: schoolTax
            },
            total: totalTax
        };
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    }

    formatNumber(value) {
        return new Intl.NumberFormat('en-US').format(value);
    }

    formatPercentage(value) {
        return (value * 100).toFixed(2) + '%';
    }
}

// Create global instance
const taxCalculator = new TaxCalculator(dataLoader);
