"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uniqBy = exports.sortBy = exports.groupBy = exports.omit = exports.pick = exports.merge = exports.throttle = exports.debounce = exports.isBefore = exports.isAfter = exports.addDays = exports.subDays = exports.endOfDay = exports.startOfDay = exports.parseISO = exports.format = void 0;
exports.isString = isString;
exports.isNumber = isNumber;
exports.isDate = isDate;
exports.isObject = isObject;
exports.chunk = chunk;
exports.unique = unique;
exports.shuffle = shuffle;
// Date utilities
var date_fns_1 = require("date-fns");
Object.defineProperty(exports, "format", { enumerable: true, get: function () { return date_fns_1.format; } });
Object.defineProperty(exports, "parseISO", { enumerable: true, get: function () { return date_fns_1.parseISO; } });
Object.defineProperty(exports, "startOfDay", { enumerable: true, get: function () { return date_fns_1.startOfDay; } });
Object.defineProperty(exports, "endOfDay", { enumerable: true, get: function () { return date_fns_1.endOfDay; } });
Object.defineProperty(exports, "subDays", { enumerable: true, get: function () { return date_fns_1.subDays; } });
Object.defineProperty(exports, "addDays", { enumerable: true, get: function () { return date_fns_1.addDays; } });
Object.defineProperty(exports, "isAfter", { enumerable: true, get: function () { return date_fns_1.isAfter; } });
Object.defineProperty(exports, "isBefore", { enumerable: true, get: function () { return date_fns_1.isBefore; } });
// Lodash utilities
var lodash_es_1 = require("lodash-es");
Object.defineProperty(exports, "debounce", { enumerable: true, get: function () { return lodash_es_1.debounce; } });
Object.defineProperty(exports, "throttle", { enumerable: true, get: function () { return lodash_es_1.throttle; } });
Object.defineProperty(exports, "merge", { enumerable: true, get: function () { return lodash_es_1.merge; } });
Object.defineProperty(exports, "pick", { enumerable: true, get: function () { return lodash_es_1.pick; } });
Object.defineProperty(exports, "omit", { enumerable: true, get: function () { return lodash_es_1.omit; } });
Object.defineProperty(exports, "groupBy", { enumerable: true, get: function () { return lodash_es_1.groupBy; } });
Object.defineProperty(exports, "sortBy", { enumerable: true, get: function () { return lodash_es_1.sortBy; } });
Object.defineProperty(exports, "uniqBy", { enumerable: true, get: function () { return lodash_es_1.uniqBy; } });
// Custom utilities
__exportStar(require("./format"), exports);
__exportStar(require("./validation"), exports);
__exportStar(require("./colors"), exports);
// Type guards
function isString(value) {
    return typeof value === 'string';
}
function isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
}
function isDate(value) {
    return value instanceof Date && !isNaN(value.getTime());
}
function isObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
// Array utilities
function chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}
function unique(array) {
    return [...new Set(array)];
}
function shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
