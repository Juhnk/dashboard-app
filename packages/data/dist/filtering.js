"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterData = filterData;
exports.filterByDateRange = filterByDateRange;
exports.removeDuplicates = removeDuplicates;
exports.sampleData = sampleData;
exports.getTopN = getTopN;
// Apply filters to data
function filterData(data, filters) {
    return data.filter(row => applyFilter(row, filters));
}
function applyFilter(row, filter) {
    if ('filters' in filter) {
        // It's a FilterGroup
        const results = filter.filters.map(f => applyFilter(row, f));
        return filter.operator === 'AND'
            ? results.every(Boolean)
            : results.some(Boolean);
    }
    // It's a single Filter
    const fieldValue = row[filter.field];
    switch (filter.operator) {
        case 'equals':
            return fieldValue === filter.value;
        case 'not_equals':
            return fieldValue !== filter.value;
        case 'contains':
            return String(fieldValue).includes(String(filter.value));
        case 'not_contains':
            return !String(fieldValue).includes(String(filter.value));
        case 'starts_with':
            return String(fieldValue).startsWith(String(filter.value));
        case 'ends_with':
            return String(fieldValue).endsWith(String(filter.value));
        case 'greater_than':
            return Number(fieldValue) > Number(filter.value);
        case 'greater_than_or_equal':
            return Number(fieldValue) >= Number(filter.value);
        case 'less_than':
            return Number(fieldValue) < Number(filter.value);
        case 'less_than_or_equal':
            return Number(fieldValue) <= Number(filter.value);
        case 'between':
            if (!filter.values || filter.values.length !== 2)
                return false;
            const [min, max] = filter.values.map(Number);
            const numValue = Number(fieldValue);
            return numValue >= min && numValue <= max;
        case 'in':
            return filter.values?.includes(fieldValue) ?? false;
        case 'not_in':
            return !(filter.values?.includes(fieldValue) ?? false);
        case 'is_null':
            return fieldValue === null || fieldValue === undefined;
        case 'is_not_null':
            return fieldValue !== null && fieldValue !== undefined;
        default:
            return true;
    }
}
// Date range filtering
function filterByDateRange(data, dateField, startDate, endDate) {
    return data.filter(row => {
        const rowDate = new Date(row[dateField]);
        if (isNaN(rowDate.getTime())) {
            return false;
        }
        if (startDate) {
            const start = new Date(startDate);
            if (rowDate < start)
                return false;
        }
        if (endDate) {
            const end = new Date(endDate);
            if (rowDate > end)
                return false;
        }
        return true;
    });
}
// Remove duplicate rows
function removeDuplicates(data, uniqueFields) {
    const seen = new Set();
    return data.filter(row => {
        const key = uniqueFields.map(field => row[field]).join('|');
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}
// Sampling utilities
function sampleData(data, sampleSize, method = 'random') {
    if (sampleSize >= data.length) {
        return [...data];
    }
    switch (method) {
        case 'first':
            return data.slice(0, sampleSize);
        case 'last':
            return data.slice(-sampleSize);
        case 'random':
            const shuffled = [...data].sort(() => Math.random() - 0.5);
            return shuffled.slice(0, sampleSize);
        default:
            return data.slice(0, sampleSize);
    }
}
// Top/Bottom N filtering
function getTopN(data, metric, n, ascending = false) {
    const sorted = [...data].sort((a, b) => {
        const aValue = Number(a[metric]) || 0;
        const bValue = Number(b[metric]) || 0;
        return ascending ? aValue - bValue : bValue - aValue;
    });
    return sorted.slice(0, n);
}
