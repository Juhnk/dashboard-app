export interface NormalizationRule {
    field: string;
    type: 'number' | 'string' | 'boolean' | 'date';
    format?: string;
    default?: any;
}
export declare function normalizeData(data: Record<string, any>[], rules: NormalizationRule[]): Record<string, any>[];
export declare function mapFields(data: Record<string, any>[], mapping: Record<string, string>): Record<string, any>[];
export interface TransformRule {
    field: string;
    transform: (value: any) => any;
}
export declare function transformValues(data: Record<string, any>[], transforms: TransformRule[]): Record<string, any>[];
export declare function normalizeCurrency(data: Record<string, any>[], currencyFields: string[], targetCurrency?: string): Record<string, any>[];
export declare function normalizePercentages(data: Record<string, any>[], percentageFields: string[], isDecimal?: boolean): Record<string, any>[];
//# sourceMappingURL=normalization.d.ts.map