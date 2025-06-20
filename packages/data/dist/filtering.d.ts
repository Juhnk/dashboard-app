export type FilterOperator = 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'greater_than_or_equal' | 'less_than' | 'less_than_or_equal' | 'between' | 'in' | 'not_in' | 'is_null' | 'is_not_null';
export interface Filter {
    field: string;
    operator: FilterOperator;
    value?: any;
    values?: any[];
}
export interface FilterGroup {
    operator: 'AND' | 'OR';
    filters: (Filter | FilterGroup)[];
}
export declare function filterData(data: Record<string, any>[], filters: Filter | FilterGroup): Record<string, any>[];
export declare function filterByDateRange(data: Record<string, any>[], dateField: string, startDate?: Date | string, endDate?: Date | string): Record<string, any>[];
export declare function removeDuplicates(data: Record<string, any>[], uniqueFields: string[]): Record<string, any>[];
export declare function sampleData(data: Record<string, any>[], sampleSize: number, method?: 'random' | 'first' | 'last'): Record<string, any>[];
export declare function getTopN(data: Record<string, any>[], metric: string, n: number, ascending?: boolean): Record<string, any>[];
//# sourceMappingURL=filtering.d.ts.map