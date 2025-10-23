import type {
    GenerateRequest,
    GenerateResponse,
    NistRequest,
    NistResponse,
} from './types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://404-team.ru/api/v1';

const request = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const url = `${BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
    
    console.log('API Client - Отправляем запрос на:', url);
    console.log('API Client - Опции запроса:', {
        method: options.method,
        headers: options.headers,
        body: options.body instanceof FormData ? '[FormData]' : options.body
    });

    const response = await fetch(url, {
        ...options,
    });

    console.log('API Client - Получен ответ:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
        let message = `Ошибка ${response.status}`;
        try {
            const error = await response.json();
            message = error.detail || error.message || message;
            console.error('API Client - Ошибка от сервера:', error);
        } catch {
            console.error('API Client - Не удалось распарсить ошибку');
        }
        throw new Error(message);
    }

    if (response.status === 204) return undefined as unknown as T;

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
        const jsonData = await response.json();
        console.log('API Client - JSON ответ:', jsonData);
        return jsonData;
    }

    const textData = await response.text();
    console.log('API Client - Текстовый ответ:', textData);
    return textData as unknown as T;
};

// Вспомогательная функция для преобразования объекта в FormData
const objectToFormData = (obj: Record<string, any>): FormData => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
                // Если поле — массив, отправляем каждый элемент как отдельное поле
                value.forEach((item) => formData.append(key, item));
            } else {
                formData.append(key, value);
            }
        }
    }
    return formData;
};

// RNG API (form-data)
export const generateRandomNumbers = (
    data: GenerateRequest
): Promise<GenerateResponse> => {
    console.log('API Client - Подготавливаем FormData для генерации:', data);
    
    const formData = objectToFormData({
        from_num: data.from_num,
        to_num: data.to_num,
        count: data.count,
        base: data.base,
        uniq_only: data.uniq_only,
        format: data.format,
    });

    console.log('API Client - FormData содержимое:');
    for (const [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
    }

    return request<GenerateResponse>('rng/generate', {
        method: 'POST',
        body: formData,
        // Не указываем Content-Type — браузер сам установит нужный boundary
    });
};

// NIST API (form-data)
export const runNistTests = (data: NistRequest): Promise<NistResponse> => {
    const formData = new FormData();
    
    if (data.file) {
        formData.append('file', data.file);
    } else if (data.sequence) {
        formData.append('sequence', data.sequence);
    }
    
    if (data.included_tests) {
        data.included_tests.forEach(test => {
            formData.append('included_tests', test);
        });
    }

    return request<NistResponse>('nist/check', {
        method: 'POST',
        body: formData,
    });
};