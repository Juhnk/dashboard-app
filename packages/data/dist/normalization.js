"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeData = normalizeData;
exports.mapFields = mapFields;
exports.transformValues = transformValues;
exports.normalizeCurrency = normalizeCurrency;
exports.normalizePercentages = normalizePercentages;
function normalizeData(data, rules) {
    return data.map(row => {
        const normalized = { ...row };
        rules.forEach(rule => {
            const value = row[rule.field];
            if (value === null || value === undefined) {
                normalized[rule.field] = rule.default ?? null;
                return;
            }
            switch (rule.type) {
                case 'number':
                    normalized[rule.field] = parseFloat(value);
                    if (isNaN(normalized[rule.field])) {
                        normalized[rule.field] = rule.default ?? 0;
                    }
                    break;
                case 'string':
                    normalized[rule.field] = String(value).trim();
                    break;
                case 'boolean':
                    normalized[rule.field] = Boolean(value);
                    break;
                case 'date':
                    const date = new Date(value);
                    normalized[rule.field] = isNaN(date.getTime())
                        ? rule.default ?? null
                        : date.toISOString();
                    break;
                default:
                    normalized[rule.field] = value;
            }
        });
        return normalized;
    });
}
// Field mapping utilities
function mapFields(data, mapping) {
    return data.map(row => {
        const mapped = {};
        Object.entries(row).forEach(([originalField, value]) => {
            const newField = mapping[originalField] || originalField;
            mapped[newField] = value;
        });
        return mapped;
    });
}
function transformValues(data, transforms) {
    return data.map(row => {
        const transformed = { ...row };
        transforms.forEach(({ field, transform }) => {
            if (field in transformed) {
                transformed[field] = transform(transformed[field]);
            }
        });
        return transformed;
    });
}
// Standardize currency values
function normalizeCurrency(data, currencyFields, targetCurrency = 'USD') {
    // In a real implementation, this would use exchange rates
    // For now, just ensure values are numbers
    return data.map(row => {
        const normalized = { ...row };
        currencyFields.forEach(field => {
            if (field in normalized) {
                const value = normalized[field];
                if (typeof value === 'string') {
                    // Remove currency symbols and convert to number
                    normalized[field] = parseFloat(value.replace(/[^0-9.-]/g, ''));
                }
            }
        });
        return normalized;
    });
}
// Percentage normalization
function normalizePercentages(data, percentageFields, isDecimal = false) {
    return data.map(row => {
        const normalized = { ...row };
        percentageFields.forEach(field => {
            if (field in normalized) {
                let value = parseFloat(normalized[field]);
                if (!isNaN(value)) {
                    // Convert to decimal if needed
                    normalized[field] = isDecimal ? value : value / 100;
                }
            }
        });
        return normalized;
    });
}
