export declare const CHART_COLORS: string[];
export declare function getChartColor(index: number): string;
export declare function generateColorPalette(count: number): string[];
export declare function hexToRgb(hex: string): {
    r: number;
    g: number;
    b: number;
} | null;
export declare function rgbToHex(r: number, g: number, b: number): string;
export declare function adjustOpacity(color: string, opacity: number): string;
export declare function darkenColor(color: string, amount: number): string;
export declare function lightenColor(color: string, amount: number): string;
//# sourceMappingURL=colors.d.ts.map