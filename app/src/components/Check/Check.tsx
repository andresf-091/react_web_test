import type { FunctionComponent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { NistResponse } from '../../logics/types';
import { runNistTests } from '../../logics/client';

import styles from './Check.module.css';
import Chevron from '../../assets/icons/Chevron.svg'

const Check: FunctionComponent = () => {
	const navigate = useNavigate();
	const [sequence, setSequence] = useState('');
	const [file, setFile] = useState<File | null>(null);
	const [results, setResults] = useState<NistResponse | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const passedCount = results ? Object.values(results).filter(test => test.success).length : 0;
	const totalCount = results ? Object.keys(results).length : 0;

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (selectedFile) {
			setFile(selectedFile);
			setSequence(''); // очищаем текстовое поле
		}
	};

	const handleSequenceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setSequence(e.target.value);
		setFile(null); // очищаем файл
	};


	const handleRunTests = async () => {
		if (!sequence && !file) {
			setError('Пожалуйста, введите последовательность или загрузите файл');
			return;
		}

		setLoading(true);
		setError(null);

		try {
			console.log('Check - Отправляем запрос на NIST проверку...');

			// Используем наш API клиент
			const data: NistResponse = await runNistTests({
				sequence: sequence || undefined,
				file: file || undefined,
				included_tests: [
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
					'random_excursions_variant'
				]
			});

			console.log('Check - Ответ от бекенда:', data);
			console.log('Check - Количество тестов:', Object.keys(data).length);
			console.log('Check - Пройденные тесты:', Object.values(data).filter(test => test.success).length);
			
			setResults(data);
		} catch (err) {
			console.error('Check - Ошибка выполнения NIST тестов:', err);
			setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
		} finally {
			setLoading(false);
		}
	};

	const handleBack = () => {
		navigate('/');
	};

	return (
		<div className={styles.home}>
			<div className={styles.menuParent}>
				<div className={styles.menu}>
					<img src={Chevron} className={styles.groupIcon} alt="" onClick={handleBack} />
				</div>
				
				<div className={styles.content}>
					<div className={styles.inputSection}>
						<div className={styles.title}>
							Введите свою последовательность чисел, для проверки генерации:
						</div>
						
						<div className={styles.inputContainer}>
							<div className={styles.textInputGroup}>
								<label className={styles.inputLabel}>Последовательность (0 и 1):</label>
								<textarea
									value={sequence}
									onChange={handleSequenceChange}
									placeholder="Введите последовательность из нулей и единиц..."
									className={styles.textarea}
									disabled={!!file}
								/>
							</div>

							<div className={styles.fileInputGroup}>
								<label className={styles.inputLabel}>Или загрузите файл (.txt):</label>
								<input
									type="file"
									accept=".txt"
									onChange={handleFileChange}
									className={styles.fileInput}
									disabled={!!sequence}
								/>
							</div>
						</div>

						<button className={styles.checkButton} onClick={handleRunTests} disabled={loading}>
							{loading ? 'Проверка...' : 'проверить генерацию'}
						</button>
					</div>

					{loading && (
						<div className={styles.loadingSection}>
							<div className={styles.loadingSpinner}></div>
							<div className={styles.loadingText}>Выполняется проверка тестов...</div>
						</div>
					)}

					{results && (
						<div className={styles.resultsSection}>
							<div className={styles.resultsTitle}>Проверка тестов</div>
							<div className={styles.testsGrid}>
								{Object.entries(results).map(([testName, testData]) => (
									<div key={testName} className={`${styles.testCard} ${testData.success ? styles.passed : styles.failed}`}>
										<div className={styles.testStatus}>
											{testData.success ? 'пройден успешно' : 'не пройден'}
										</div>
										<div className={styles.testName}>{testName}</div>
									</div>
								))}
							</div>
							
							<div className={styles.summarySection}>
								<div className={styles.progressLine}>
									<div className={styles.progressDot}></div>
									<div className={styles.progressDot}></div>
									<div className={styles.progressDot}></div>
									<div className={styles.progressDot}></div>
								</div>
								<div className={styles.summaryNumbers}>
									<div className={styles.passedCount}>{passedCount}</div>
									<div className={styles.totalCount}>{totalCount}</div>
									<div className={styles.summaryText}>тестов пройдено</div>
								</div>
							</div>
						</div>
					)}

					{error && <div className={styles.error}>{error}</div>}
				</div>
			</div>
		</div>
	);
};

export default Check;
