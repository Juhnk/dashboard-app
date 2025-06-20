export type AggregationFunction = 'sum' | 'avg' | 'count' | 'max' | 'min' | 'median';
export declare function aggregateData(data: Record<string, any>[], metrics: string[], dimensions: string[], aggregationType?: AggregationFunction): Record<string, any>[];
export declare function mergeDataSources(dataSources: Array<{
    id: string;
    data: Record<string, any>[];
    mapping: Record<string, string>;
}>, joinKeys?: string[]): Record<string, any>[];
export declare function aggregateTimeSeries(data: Record<string, any>[], dateField: string, metrics: string[], interval?: 'day' | 'week' | 'month'): Record<string, any>[];
//# sourceMappingURL=aggregation.d.ts.map