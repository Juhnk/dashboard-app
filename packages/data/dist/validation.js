"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateData = validateData;
exports.analyzeDataQuality = analyzeDataQuality;
exports.validateSchema = validateSchema;
// Validate data against rules
function validateData(data, rules) {
    const errors = [];
    data.forEach((row, index) => {
        rules.forEach(rule => {
            const value = row[rule.field];
            const error = validateField(value, rule, row);
            if (error) {
                errors.push({
                    ...error,
                    rowIndex: index
                });
            }
        });
    });
    return {
        valid: errors.length === 0,
        errors
    };
}
function validateField(value, rule, row) {
    switch (rule.type) {
        case 'required':
            if (value === null || value === undefined || value === '') {
                return {
                    field: rule.field,
                    value,
                    rule: 'required',
                    message: rule.message || `${rule.field} is required`
                };
            }
            break;
        case 'type':
            if (!validateType(value, rule.dataType)) {
                return {
                    field: rule.field,
                    value,
                    rule: 'type',
                    message: rule.message || `${rule.field} must be of type ${rule.dataType}`
                };
            }
            break;
        case 'range':
            const numValue = Number(value);
            if (!isNaN(numValue)) {
                if (rule.min !== undefined && numValue < rule.min) {
                    return {
                        field: rule.field,
                        value,
                        rule: 'range',
                        message: rule.message || `${rule.field} must be at least ${rule.min}`
                    };
                }
                if (rule.max !== undefined && numValue > rule.max) {
                    return {
                        field: rule.field,
                        value,
                        rule: 'range',
                        message: rule.message || `${rule.field} must be at most ${rule.max}`
                    };
                }
            }
            break;
        case 'pattern':
            if (rule.pattern && !rule.pattern.test(String(value))) {
                return {
                    field: rule.field,
                    value,
                    rule: 'pattern',
                    message: rule.message || `${rule.field} does not match required pattern`
                };
            }
            break;
        case 'custom':
            if (rule.validate && !rule.validate(value, row)) {
                return {
                    field: rule.field,
                    value,
                    rule: 'custom',
                    message: rule.message || `${rule.field} failed custom validation`
                };
            }
            break;
    }
    return null;
}
function validateType(value, dataType) {
    if (value === null || value === undefined) {
        return true; // Allow null/undefined for type validation
    }
    switch (dataType) {
        case 'string':
            return typeof value === 'string';
        case 'number':
            return typeof value === 'number' && !isNaN(value);
        case 'boolean':
            return typeof value === 'boolean';
        case 'date':
            return !isNaN(new Date(value).getTime());
        case 'array':
            return Array.isArray(value);
        case 'object':
            return typeof value === 'object' && !Array.isArray(value);
        default:
            return true;
    }
}
function analyzeDataQuality(data, fields) {
    if (data.length === 0) {
        return {
            totalRows: 0,
            validRows: 0,
            invalidRows: 0,
            completeness: {},
            uniqueness: {},
            patterns: {}
        };
    }
    const fieldsToAnalyze = fields || Object.keys(data[0]);
    const completeness = {};
    const uniqueness = {};
    const patterns = {};
    fieldsToAnalyze.forEach(field => {
        const values = data.map(row => row[field]);
        const nonNullValues = values.filter(v => v !== null && v !== undefined);
        const uniqueValues = new Set(values);
        // Calculate completeness
        completeness[field] = (nonNullValues.length / data.length) * 100;
        // Calculate uniqueness
        uniqueness[field] = (uniqueValues.size / data.length) * 100;
        // Calculate value patterns (top 10 most frequent)
        const frequency = {};
        values.forEach(value => {
            const key = String(value);
            frequency[key] = (frequency[key] || 0) + 1;
        });
        patterns[field] = Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .reduce((acc, [key, count]) => {
            acc[key] = count;
            return acc;
        }, {});
    });
    return {
        totalRows: data.length,
        validRows: data.length, // Would be calculated based on validation rules
        invalidRows: 0,
        completeness,
        uniqueness,
        patterns
    };
}
function validateSchema(data, schema) {
    const errors = [];
    data.forEach((row, index) => {
        schema.fields.forEach(field => {
            const value = row[field.name];
            // Check required fields
            if (field.required && (value === null || value === undefined)) {
                errors.push({
                    field: field.name,
                    value,
                    rule: 'required',
                    message: `${field.name} is required`,
                    rowIndex: index
                });
                return;
            }
            // Check nullable
            if (!field.nullable && value === null) {
                errors.push({
                    field: field.name,
                    value,
                    rule: 'nullable',
                    message: `${field.name} cannot be null`,
                    rowIndex: index
                });
                return;
            }
            // Check type
            if (value !== null && value !== undefined && !validateType(value, field.type)) {
                errors.push({
                    field: field.name,
                    value,
                    rule: 'type',
                    message: `${field.name} must be of type ${field.type}`,
                    rowIndex: index
                });
            }
        });
    });
    return {
        valid: errors.length === 0,
        errors
    };
}
