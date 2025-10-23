import { useState } from 'react';
import styles from './FiltersModal.module.css';
import { generateRandomNumbers } from '../../logics/client'; // Импортируем ваш API-метод
import type { GenerateResponse } from '../../logics/types';

interface FiltersModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerateSuccess: (data: GenerateResponse) => void; // Передаём результат в родительский компонент
}

const FiltersModal = ({ isOpen, onClose, onGenerateSuccess }: FiltersModalProps) => {
    const [repeat, setRepeat] = useState(false);
    const [base, setBase] = useState(2);
    const [rangeFrom, setRangeFrom] = useState(1);
    const [rangeTo, setRangeTo] = useState(10_000_000);
    const [sequenceLength, setSequenceLength] = useState(1);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (rangeFrom >= rangeTo) {
            alert('Начало диапазона должно быть меньше конца');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Подготовим тело запроса в соответствии с вашей схемой
            const requestData = {
                from_num: rangeFrom.toString(),
                to_num: rangeTo.toString(),
                count: sequenceLength,
                base: base,
                uniq_only: !repeat, // если repeat = true, то uniq_only = false
                format: 'json' as const,
            };

            const response = await generateRandomNumbers(requestData);
            onGenerateSuccess(response); // Передаём результат в родительский компонент
            onClose(); // Закрываем модалку после успешной генерации
        } catch (err) {
            console.error('Ошибка генерации:', err);
            setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    &times;
                </button>

                <h2 className={styles.title}>фильтры</h2>

                {/* Повторение чисел */}
                <div className={styles.filterRow}>
                    <span className={styles.label}>повторение чисел</span>
                    <input
                        type="checkbox"
                        checked={repeat}
                        onChange={(e) => setRepeat(e.target.checked)}
                        className={styles.checkbox}
                    />
                </div>

                {/* Система счисления */}
                <div className={styles.filterRow}>
                    <span className={styles.label}>система счисления</span>
                    <input
                        type="number"
                        value={base}
                        onChange={(e) => setBase(Number(e.target.value))}
                        min={2}
                        max={16}
                        className={styles.numberInput}
                    />
                </div>

                {/* Диапазон числа */}
                <div className={styles.filterRow}>
                    <span className={styles.label}>диапазон числа</span>
                    <div className={styles.rangeGroup}>
                        <input
                            type="number"
                            value={rangeFrom}
                            onChange={(e) => setRangeFrom(Number(e.target.value))}
                            min={1}
                            max={rangeTo - 1}
                            className={styles.numberInput}
                        />
                        <span className={styles.rangeSeparator}>—</span>
                        <input
                            type="number"
                            value={rangeTo}
                            onChange={(e) => setRangeTo(Number(e.target.value))}
                            min={rangeFrom + 1}
                            max={10_000_000}
                            className={styles.numberInput}
                        />
                    </div>
                </div>

                {/* Длина последовательности */}
                <div className={styles.filterRow}>
                    <span className={styles.label}>длина последовательности</span>
                    <input
                        type="number"
                        value={sequenceLength}
                        onChange={(e) => setSequenceLength(Number(e.target.value))}
                        min={1}
                        max={10_000_000}
                        className={styles.numberInput}
                    />
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <button
                    className={styles.generateButton}
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? 'Генерация...' : 'сгенерировать'}
                </button>
            </div>
        </div>
    );
};

export default FiltersModal;