// src/api/types.ts

// RNG
export interface GenerateRequest {
    from_num: string; // обязательный параметр
    to_num: string;   // обязательный параметр
    count?: number;       // default: 5
    base?: number;        // default: 10
    uniq_only?: boolean;  // default: true
    format?: 'json' | 'txt'; // default: 'json'
}

export interface GenerateResponse {
    numbers: string[]; // массив сгенерированных чисел
    seed: string; // случайный сид
    graphs: string[]; // графики звуков в base64 или URL
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
    sequence?: string; // строка из нулей и единиц
    file?: File; // файл со строкой из нулей и единиц
    included_tests?: NistTestType[];
}

// Формат ответа от NIST API - словарь с результатами тестов
export interface NistTestData {
    success: boolean;
    // другие поля теста, если есть
}

export interface NistResponse {
    [testName: string]: NistTestData;
}