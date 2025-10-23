import type { FunctionComponent } from 'react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GenerateResponse } from '../../logics/types';

import styles from './Record.module.css';
import Chevron from '../../assets/icons/Chevron.svg'
import SoundWave from '../../assets/icons/SoundWave.svg'

const Record: FunctionComponent = () => {
	const navigate = useNavigate();
	const [isRecording, setIsRecording] = useState(false);
	const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
	const [audioURL, setAudioURL] = useState<string | null>(null);
	const [recordingTime, setRecordingTime] = useState(0);
	const [result, setResult] = useState<string | string[] | null>(null);
	const [seed, setSeed] = useState<string | null>(null);
	const [graph, setGraph] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const audioChunksRef = useRef<Blob[]>([]);
	const timerRef = useRef<number | null>(null);

	const handleBack = () => {
		navigate('/');
	};

	const startRecording = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const mediaRecorder = new MediaRecorder(stream);
			mediaRecorderRef.current = mediaRecorder;
			audioChunksRef.current = [];

			mediaRecorder.ondataavailable = (event) => {
				audioChunksRef.current.push(event.data);
			};

			mediaRecorder.onstop = () => {
				const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
				setRecordedAudio(audioBlob);
				const url = URL.createObjectURL(audioBlob);
				setAudioURL(url);
				stream.getTracks().forEach(track => track.stop());
			};

			mediaRecorder.start();
			setIsRecording(true);
			setRecordingTime(0);

			// Таймер для ограничения записи до 10 секунд
			timerRef.current = setInterval(() => {
				setRecordingTime(prev => {
					if (prev >= 9) {
						stopRecording();
						return 10;
					}
					return prev + 1;
				});
			}, 1000);

		} catch (err) {
			console.error('Ошибка доступа к микрофону:', err);
			setError('Не удалось получить доступ к микрофону');
		}
	};

	const stopRecording = () => {
		if (mediaRecorderRef.current && isRecording) {
			mediaRecorderRef.current.stop();
			setIsRecording(false);
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		}
	};

	const handleGenerateFromAudio = async () => {
		if (!recordedAudio) {
			setError('Сначала запишите аудио');
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const formData = new FormData();
			formData.append('audio', recordedAudio, 'recording.wav');
			formData.append('from_num', '1');
			formData.append('to_num', '1000');
			formData.append('count', '1');
			formData.append('base', '10');
			formData.append('uniq_only', 'true');
			formData.append('format', 'json');

			console.log('Record - Отправляем аудио на бекенд...');
			console.log('Record - Размер аудио файла:', recordedAudio.size, 'байт');
			console.log('Record - Тип аудио файла:', recordedAudio.type);

			const response = await fetch('http://404-team.ru:8000/api/v1/rng/generate', {
				method: 'POST',
				body: formData,
			});

			console.log('Record - Статус ответа:', response.status);
			console.log('Record - Заголовки ответа:', Object.fromEntries(response.headers.entries()));

			if (!response.ok) {
				throw new Error(`Ошибка ${response.status}`);
			}

			const data: GenerateResponse = await response.json();
			console.log('Record - Ответ от бекенда:', data);
			console.log('Record - Сгенерированные числа:', data.numbers);
			console.log('Record - Сид:', data.seed);
			console.log('Record - Графики:', data.graphs);

			setResult(data.numbers?.length === 1 ? data.numbers[0] : data.numbers || '404');
			setSeed(data.seed || null);
			setGraph(data.graphs?.[0] || null);
		} catch (err) {
			console.error('Record - Ошибка при генерации из аудио:', err);
			setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
		} finally {
			setIsLoading(false);
		}
	};


	useEffect(() => {
		return () => {
			if (audioURL) {
				URL.revokeObjectURL(audioURL);
			}
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		};
	}, [audioURL]);

	return (
		<div className={styles.home}>
			<div className={styles.menuParent}>
				<div className={styles.menu}>
					<img src={Chevron} className={styles.groupIcon} alt="" onClick={handleBack} />
				</div>
				
				{/* Модальное окно записи звука */}
				<div className={styles.modalOverlay} onClick={handleBack}>
					<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
						<button className={styles.closeButton} onClick={handleBack}>
							&times;
						</button>
						<div className={styles.modalTitle}>
							попробуйте функцию с генерацией числа с помощью <b>своего звука</b>
						</div>
						
						<div className={styles.soundWaveContainer}>
							<img src={SoundWave} className={styles.soundWaveIcon} alt="" />
						</div>
						
						<div className={styles.microphoneContainer}>
							<div className={`${styles.microphoneIcon} ${isRecording ? styles.recording : ''}`}>
								{isRecording ? '🎤' : '🎤'}
							</div>
						</div>
						
						<div className={styles.modalActions}>
							{!isRecording && !recordedAudio && (
								<button className={styles.generateButton} onClick={startRecording}>
									сгенерировать
								</button>
							)}
							
							{isRecording && (
								<button className={styles.generateButton} onClick={stopRecording}>
									остановить запись
								</button>
							)}

							{recordedAudio && (
								<button className={styles.generateButton} onClick={handleGenerateFromAudio} disabled={isLoading}>
									{isLoading ? 'Генерация...' : 'сгенерировать'}
								</button>
							)}
						</div>

						{isRecording && (
							<div className={styles.recordingIndicator}>
								<div className={styles.recordingText}>Запись... {recordingTime}с</div>
							</div>
						)}

						{error && <div className={styles.error}>{error}</div>}
					</div>
				</div>

				{/* Результат генерации */}
				{result && (
					<div className={styles.resultContainer}>
						<div className={styles.resultTitle}>Результат генерации:</div>
						<div className={styles.resultNumber}>
							{Array.isArray(result) ? (
								<div className={styles.multipleNumbers}>
									{result.map((num, index) => (
										<div key={index} className={styles.numberItem}>{num}</div>
									))}
								</div>
							) : (
								<div className={styles.singleNumber}>{result}</div>
							)}
						</div>
						
						{seed && (
							<div className={styles.seedInfo}>
								<div className={styles.seedLabel}>Сид:</div>
								<div className={styles.seedValue}>{seed}</div>
							</div>
						)}

						{graph && (
							<div className={styles.graphContainer}>
								<div className={styles.graphLabel}>График звука:</div>
								<img src={graph} alt="График звука" className={styles.graphImage} />
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default Record;
