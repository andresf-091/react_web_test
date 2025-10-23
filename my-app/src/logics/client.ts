import type {
    GenerateRequest,
    GenerateResponse,
    NistRequest,
    NistResponse,
} from './types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://62.217.177.201:8000/api/v1';

const request = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const url = `${BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

    const response = await fetch(url, {
        ...options,
    });

    if (!response.ok) {
        let message = `Ошибка ${response.status}`;
        try {
            const error = await response.json();
            message = error.detail || error.message || message;
        } catch {
            // ignore
        }
        throw new Error(message);
    }

    if (response.status === 204) return undefined as unknown as T;

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
        return response.json();
    }

    return response.text() as unknown as T;
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
    const formData = objectToFormData({
        from_num: data.from_num,
        to_num: data.to_num,
        count: data.count,
        base: data.base,
        uniq_only: data.uniq_only,
        format: data.format,
    });

    return request<GenerateResponse>('rng/generate', {
        method: 'POST',
        body: formData,
        // Не указываем Content-Type — браузер сам установит нужный boundary
    });
};

// NIST API (form-data)
export const runNistTests = (data: NistRequest): Promise<NistResponse> => {
    const formData = objectToFormData({
        sequence: data.sequence,
        included_tests: data.included_tests,
    });

    return request<NistResponse>('nist/run', {
        method: 'POST',
        body: formData,
    });
};