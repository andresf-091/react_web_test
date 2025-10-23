// src/api/types.ts

// RNG
export interface GenerateRequest {
    from_num: string;
    to_num: string;
    count?: number;       // default: 5
    base?: number;        // default: 10
    uniq_only?: boolean;  // default: true
    format?: 'json' | 'txt'; // default: 'json'
}

export interface GenerateResponse {
    numbers: string[]; // или string, если format='txt'
}

// NIST
export type NistTestType =
    | 'frequency'
    | 'block_frequency'
    | 'runs'
    | 'longest_runs'
    | 'matrix_rank'
    | 'dft'
    | 'template'
    | 'overlapping_template'
    | 'universal'
    | 'linear_complexity'
    | 'serial'
    | 'approximate_entropy'
    | 'cumulative_sums'
    | 'random_excursions'
    | 'random_excursions_variant';

export const ALL_NIST_TESTS: NistTestType[] = [
    'frequency',
    'block_frequency',
    'runs',
    'longest_runs',
    'matrix_rank',
    'dft',
    'template',
    'overlapping_template',
    'universal',
    'linear_complexity',
    'serial',
    'approximate_entropy',
    'cumulative_sums',
    'random_excursions',
    'random_excursions_variant',
];

export interface NistRequest {
    sequence?: string;
    included_tests?: NistTestType[];
}

// Пример ответа от NIST (уточните у бэка, но обычно — объект с результатами)
export interface NistTestResult {
    test_name: string;
    p_value: number;
    passed: boolean;
    // ... другие поля, если есть
}

export interface NistResponse {
    results: NistTestResult[];
    summary: {
        total: number;
        passed: number;
        failed: number;
    };
}