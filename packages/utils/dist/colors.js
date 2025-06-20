"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHART_COLORS = void 0;
exports.getChartColor = getChartColor;
exports.generateColorPalette = generateColorPalette;
exports.hexToRgb = hexToRgb;
exports.rgbToHex = rgbToHex;
exports.adjustOpacity = adjustOpacity;
exports.darkenColor = darkenColor;
exports.lightenColor = lightenColor;
// Chart color utilities
exports.CHART_COLORS = [
    '#2563eb', // Blue
    '#10b981', // Green
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#14b8a6', // Teal
    '#f97316', // Orange
    '#84cc16', // Lime
    '#06b6d4', // Cyan
    '#6366f1', // Indigo
    '#a855f7', // Fuchsia
];
function getChartColor(index) {
    return exports.CHART_COLORS[index % exports.CHART_COLORS.length];
}
function generateColorPalette(count) {
    if (count <= exports.CHART_COLORS.length) {
        return exports.CHART_COLORS.slice(0, count);
    }
    // Generate additional colors by varying saturation and lightness
    const colors = [...exports.CHART_COLORS];
    const baseHues = [220, 160, 45, 0, 270, 320, 180, 25, 80, 190, 240, 290];
    for (let i = exports.CHART_COLORS.length; i < count; i++) {
        const hue = baseHues[i % baseHues.length];
        const saturation = 60 + (i % 3) * 15; // 60%, 75%, 90%
        const lightness = 45 + (i % 2) * 10; // 45%, 55%
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    return colors;
}
// Color manipulation utilities
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
}
function rgbToHex(r, g, b) {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
function adjustOpacity(color, opacity) {
    const rgb = hexToRgb(color);
    if (!rgb)
        return color;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}
function darkenColor(color, amount) {
    const rgb = hexToRgb(color);
    if (!rgb)
        return color;
    const factor = 1 - amount;
    return rgbToHex(Math.round(rgb.r * factor), Math.round(rgb.g * factor), Math.round(rgb.b * factor));
}
function lightenColor(color, amount) {
    const rgb = hexToRgb(color);
    if (!rgb)
        return color;
    const factor = amount;
    return rgbToHex(Math.round(rgb.r + (255 - rgb.r) * factor), Math.round(rgb.g + (255 - rgb.g) * factor), Math.round(rgb.b + (255 - rgb.b) * factor));
}
