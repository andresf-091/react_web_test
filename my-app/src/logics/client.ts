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
    if (contentType?.includes('multipart/mixed')) {
        console.log('API Client - Обнаружен multipart ответ, парсим...');
        const multipartData = await parseMultipartResponse(response);
        console.log('API Client - Multipart данные:', multipartData);
        return multipartData as unknown as T;
    } else if (contentType?.includes('application/json')) {
        const jsonData = await response.json();
        console.log('API Client - JSON ответ:', jsonData);
        return jsonData;
    }

    const textData = await response.text();
    console.log('API Client - Текстовый ответ:', textData);
    return textData as unknown as T;
};

// Функция для парсинга multipart ответа
const parseMultipartResponse = async (response: Response): Promise<GenerateResponse> => {
    const text = await response.text();
    console.log('Multipart parser - Получен текст ответа:', text.substring(0, 500) + '...');
    
    // Ищем boundary в заголовке
    const contentType = response.headers.get('content-type') || '';
    const boundaryMatch = contentType.match(/boundary="([^"]+)"/);
    
    if (!boundaryMatch) {
        throw new Error('Не найден boundary в multipart ответе');
    }
    
    const boundary = boundaryMatch[1];
    console.log('Multipart parser - Boundary:', boundary);
    
    // Разделяем части по boundary
    const parts = text.split(`--${boundary}`);
    console.log('Multipart parser - Найдено частей:', parts.length);
    
    const result: GenerateResponse = {
        numbers: [],
        seed: '',
        graphs: []
    };
    
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i].trim();
        if (!part || part === '--') continue;
        
        console.log(`Multipart parser - Обрабатываем часть ${i}:`, part.substring(0, 200) + '...');
        
        // Пропускаем первую часть, если она содержит только заголовки всего ответа
        if (i === 0 && part.includes('Content-Type: multipart/mixed')) {
            console.log('Multipart parser - Пропускаем заголовочную часть');
            continue;
        }
        
        // Ищем заголовки части (пробуем разные варианты разделителей)
        let headerEndIndex = part.indexOf('\r\n\r\n');
        if (headerEndIndex === -1) {
            headerEndIndex = part.indexOf('\n\n');
        }
        if (headerEndIndex === -1) {
            console.log('Multipart parser - Не найдены заголовки в части, пропускаем');
            console.log('Multipart parser - Содержимое части:', part.substring(0, 200));
            continue;
        }
        
        const headers = part.substring(0, headerEndIndex);
        // Определяем длину разделителя
        const separatorLength = part.indexOf('\r\n\r\n') !== -1 ? 4 : 2;
        const content = part.substring(headerEndIndex + separatorLength).trim();
        
        console.log('Multipart parser - Заголовки части:', headers);
        console.log('Multipart parser - Размер контента:', content.length);
        console.log('Multipart parser - Первые 200 символов контента:', content.substring(0, 200));
        console.log('Multipart parser - Последние 200 символов контента:', content.substring(Math.max(0, content.length - 200)));
        
        // Проверяем тип контента
        if (headers.includes('Content-Type: application/json')) {
            console.log('Multipart parser - Найдена JSON часть');
            
            // Декодируем base64
            try {
                // Убираем все переносы строк и пробелы из base64
                const cleanContent = content.replace(/\r?\n/g, '').replace(/\s/g, '');
                console.log('Multipart parser - Очищенный base64:', cleanContent.substring(0, 100) + '...');
                
                const decodedContent = atob(cleanContent);
                console.log('Multipart parser - Декодированный JSON:', decodedContent);
                
                const jsonData = JSON.parse(decodedContent);
                console.log('Multipart parser - Парсированный JSON:', jsonData);
                
                result.numbers = jsonData.result || [];
                result.seed = jsonData.seed || '';
                result.executed_sources = jsonData.executed_sources || [];
                
                console.log('Multipart parser - Установлены данные:', {
                    numbers: result.numbers,
                    seed: result.seed,
                    sourcesCount: result.executed_sources?.length || 0
                });
                
            } catch (error) {
                console.error('Multipart parser - Ошибка декодирования JSON:', error);
                console.error('Multipart parser - Содержимое для декодирования:', content.substring(0, 200));
                
                // Попробуем альтернативный способ декодирования
                try {
                    console.log('Multipart parser - Пробуем альтернативное декодирование...');
                    const alternativeDecoded = atob(content);
                    const alternativeJson = JSON.parse(alternativeDecoded);
                    console.log('Multipart parser - Альтернативное декодирование успешно:', alternativeJson);
                    
                    result.numbers = alternativeJson.result || [];
                    result.seed = alternativeJson.seed || '';
                    result.executed_sources = alternativeJson.executed_sources || [];
                } catch (altError) {
                    console.error('Multipart parser - Альтернативное декодирование тоже не удалось:', altError);
                }
            }
        } else if (headers.includes('Content-Type: application/png')) {
            console.log('Multipart parser - Найдена PNG часть');
            
            // Очищаем base64 данные от переносов строк
            const cleanImageContent = content.replace(/\r?\n/g, '').replace(/\s/g, '');
            console.log('Multipart parser - Очищенный PNG base64:', cleanImageContent.substring(0, 50) + '...');
            
            // Создаем data URL для изображения
            const imageDataUrl = `data:image/png;base64,${cleanImageContent}`;
            result.graphs.push(imageDataUrl);
            
            console.log('Multipart parser - Добавлен график, всего графиков:', result.graphs.length);
        }
    }
    
    console.log('Multipart parser - Итоговый результат:', result);
    return result;
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

    // Добавляем аудио файл если он есть
    if (data.audio_file) {
        formData.append('audio', data.audio_file, 'recording.wav');
        console.log('API Client - Добавлен аудио файл:', data.audio_file);
    }

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

// NIST API (query parameters)
export const runNistTests = async (data: NistRequest): Promise<NistResponse> => {
    console.log('API Client - Подготавливаем запрос для NIST тестов:', data);
    
    if (data.file) {
        // Если есть файл, используем FormData
        const formData = new FormData();
        formData.append('file', data.file);
        
        // Добавляем тесты как query параметры
        if (data.included_tests) {
            data.included_tests.forEach(test => {
                formData.append('included_tests', test);
            });
        }
        
        console.log('API Client - Отправляем файл с тестами');
        console.log('API Client - FormData содержимое:');
        for (const [key, value] of formData.entries()) {
            console.log(`  ${key}:`, value);
        }
        
        return request<NistResponse>('nist/check', {
            method: 'POST',
            body: formData,
        });
    } else if (data.sequence) {
        // Если есть последовательность, используем query параметры
        const params = new URLSearchParams();
        params.append('sequence', data.sequence);
        
        // Добавляем тесты как query параметры
        if (data.included_tests) {
            data.included_tests.forEach(test => {
                params.append('included_tests', test);
            });
        }
        
        const fullUrl = `${BASE_URL}/nist/check?${params.toString()}`;
        
        console.log('API Client - Отправляем последовательность:', data.sequence.substring(0, 100) + '...');
        console.log('API Client - URL:', fullUrl);
        
        // Используем прямой fetch для query параметров
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
            },
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

        if (response.status === 204) return undefined as unknown as NistResponse;

        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
            return await response.json() as NistResponse;
        } else {
            throw new Error('Неожиданный тип контента: ' + contentType);
        }
    } else {
        throw new Error('Необходимо предоставить либо файл, либо последовательность');
    }
};

// Функция для скачивания бинарного файла
export const downloadBinaryFile = async (length: number = 1000000): Promise<void> => {
    console.log('API Client - Запрашиваем бинарный файл длиной:', length);
    
    try {
        const response = await fetch(`${BASE_URL}/rng/generate/binary-file?length=${length}`, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
            },
        });
        
        console.log('API Client - Статус ответа:', response.status);
        console.log('API Client - Заголовки ответа:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
        }
        
        // Получаем имя файла из заголовка Content-Disposition
        const contentDisposition = response.headers.get('content-disposition');
        let filename = 'random.txt';
        
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
            if (filenameMatch) {
                filename = filenameMatch[1];
            }
        }
        
        console.log('API Client - Имя файла для скачивания:', filename);
        
        // Получаем содержимое файла
        const blob = await response.blob();
        console.log('API Client - Размер файла:', blob.size, 'байт');
        
        // Создаем ссылку для скачивания
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log('API Client - Файл успешно скачан:', filename);
        
    } catch (error) {
        console.error('API Client - Ошибка при скачивании файла:', error);
        throw error;
    }
};