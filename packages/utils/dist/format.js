"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatNumber = formatNumber;
exports.formatCurrency = formatCurrency;
exports.formatPercentage = formatPercentage;
exports.formatCompactNumber = formatCompactNumber;
exports.formatMetric = formatMetric;
exports.truncate = truncate;
exports.slugify = slugify;
exports.capitalize = capitalize;
exports.camelCase = camelCase;
// Number formatting utilities
function formatNumber(value, options) {
    return new Intl.NumberFormat('en-US', options).format(value);
}
function formatCurrency(value, currency = 'USD') {
    return formatNumber(value, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}
function formatPercentage(value, decimals = 1) {
    return formatNumber(value / 100, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}
function formatCompactNumber(value) {
    if (value >= 1000000) {
        return formatNumber(value / 1000000, { maximumFractionDigits: 1 }) + 'M';
    }
    if (value >= 1000) {
        return formatNumber(value / 1000, { maximumFractionDigits: 1 }) + 'K';
    }
    return formatNumber(value, { maximumFractionDigits: 0 });
}
function formatMetric(value, type = 'number') {
    switch (type) {
        case 'currency':
            return formatCurrency(value);
        case 'percentage':
            return formatPercentage(value);
        case 'compact':
            return formatCompactNumber(value);
        default:
            return formatNumber(value);
    }
}
// String utilities
function truncate(str, length, suffix = '...') {
    if (str.length <= length)
        return str;
    return str.slice(0, length - suffix.length) + suffix;
}
function slugify(str) {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
function camelCase(str) {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => index === 0 ? word.toLowerCase() : word.toUpperCase())
        .replace(/\s+/g, '');
}
