// src/api/types.ts

// RNG
export interface GenerateRequest {
    from_num: string; // обязательный параметр
    to_num: string;   // обязательный параметр
    count?: number;       // default: 5
    base?: number;        // default: 10
    uniq_only?: boolean;  // default: true
    format?: 'json' | 'txt'; // default: 'json'
    audio_file?: File | Blob; // аудио файл для записи
}

export interface GenerateResponse {
    numbers: string[]; // массив сгенерированных чисел
    seed: string; // случайный сид
    graphs: string[]; // графики звуков в base64 или URL
    executed_sources?: Array<{
        id: number;
        name: string;
        url: string;
        ext: string;
        artist: string;
        source: string;
        lat: number;
        lng: number;
        link: string;
        city: string;
        country: string;
    }>; // источники звуков
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
    p_value?: number;
    error?: string;
    statistics?: any;
    results?: Array<{
        template: number[];
        p_value: number;
        success: boolean;
    }>;
}

export interface NistResponse {
    [testName: string]: NistTestData;
}