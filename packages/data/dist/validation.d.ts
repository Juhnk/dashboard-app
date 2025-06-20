export interface ValidationRule {
    field: string;
    type: 'required' | 'type' | 'range' | 'pattern' | 'custom';
    dataType?: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
    validate?: (value: any, row: Record<string, any>) => boolean;
}
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
}
export interface ValidationError {
    field: string;
    value: any;
    rule: string;
    message: string;
    rowIndex?: number;
}
export declare function validateData(data: Record<string, any>[], rules: ValidationRule[]): ValidationResult;
export interface DataQualityReport {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    completeness: Record<string, number>;
    uniqueness: Record<string, number>;
    patterns: Record<string, Record<string, number>>;
}
export declare function analyzeDataQuality(data: Record<string, any>[], fields?: string[]): DataQualityReport;
export interface DataSchema {
    fields: Array<{
        name: string;
        type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
        required?: boolean;
        nullable?: boolean;
    }>;
}
export declare function validateSchema(data: Record<string, any>[], schema: DataSchema): ValidationResult;
//# sourceMappingURL=validation.d.ts.map