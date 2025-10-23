import type { FunctionComponent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { downloadBinaryFile } from '../../logics/client';

import styles from './Download.module.css';
import Menu from '../../assets/icons/Menu.svg'
import Arrow from '../../assets/icons/Arrow.svg'

const Download: FunctionComponent = () => {
	const navigate = useNavigate();
	const [isDownloading, setIsDownloading] = useState(false);
	const [downloadProgress, setDownloadProgress] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [fileLength, setFileLength] = useState(1000000);

	const handleBack = () => {
		navigate('/');
	};

	const handleDownload = async () => {
		setIsDownloading(true);
		setError(null);
		setDownloadProgress(0);

		try {
			console.log('Download - Начинаем скачивание файла длиной:', fileLength);
			
			// Симуляция прогресса (так как мы не можем отслеживать реальный прогресс)
			const progressInterval = setInterval(() => {
				setDownloadProgress(prev => {
					if (prev >= 90) {
						clearInterval(progressInterval);
						return 90;
					}
					return prev + Math.random() * 10;
				});
			}, 200);

			await downloadBinaryFile(fileLength);
			
			clearInterval(progressInterval);
			setDownloadProgress(100);
			
			console.log('Download - Файл успешно скачан');
			
			// Сбрасываем прогресс через 2 секунды
			setTimeout(() => {
				setDownloadProgress(0);
			}, 2000);
			
		} catch (err) {
			console.error('Download - Ошибка при скачивании:', err);
			setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
		} finally {
			setIsDownloading(false);
		}
	};

	return (
		<div className={styles.download}>
			<div className={styles.menuParent}>
				<div className={styles.menu}>
					<img src={Menu} className={styles.groupIcon} alt="" />
				</div>
				<div className={styles.gen}>
					<div className={styles.div}>скачивание файла</div>
				</div>
				<div className={styles.opr}>
					<div className={styles.homeDiv}>
						<span>Скачайте текстовый файл с </span>
						<span className={styles.span}>случайными битами (0 и 1)</span>
						<span>, сгенерированными на основе звуков с разных уголков земли</span>
					</div>
				</div>
				
				<div className={styles.downloadSection}>
					<div className={styles.downloadCard}>
						<div className={styles.cardTitle}>Бинарный файл</div>
						<div className={styles.cardDescription}>
							Файл содержит последовательность из нулей и единиц, 
							сгенерированную на основе реальных звуков природы
						</div>
						
						<div className={styles.lengthSelector}>
							<label className={styles.lengthLabel}>Длина последовательности:</label>
							<select 
								className={styles.lengthSelect}
								value={fileLength}
								onChange={(e) => setFileLength(Number(e.target.value))}
								disabled={isDownloading}
							>
								<option value={100000}>100,000 бит</option>
								<option value={500000}>500,000 бит</option>
								<option value={1000000}>1,000,000 бит</option>
								<option value={2000000}>2,000,000 бит</option>
								<option value={5000000}>5,000,000 бит</option>
							</select>
						</div>

						{downloadProgress > 0 && (
							<div className={styles.progressSection}>
								<div className={styles.progressBar}>
									<div 
										className={styles.progressFill}
										style={{ width: `${downloadProgress}%` }}
									/>
								</div>
								<div className={styles.progressText}>
									{isDownloading ? 'Скачивание...' : 'Готово!'}
								</div>
							</div>
						)}

						<button 
							className={styles.downloadButton}
							onClick={handleDownload}
							disabled={isDownloading}
						>
							{isDownloading ? 'Скачивание...' : 'Скачать файл'}
						</button>

						{error && (
							<div className={styles.error}>
								Ошибка: {error}
							</div>
						)}
					</div>
				</div>

				<div className={styles.div3}>
					<button className={styles.div4} onClick={handleBack}>
						<div className={styles.div5}>назад</div>
					</button>
				</div>
				
				<img src={Arrow} className={styles.icon3} alt="" />
			</div>
		</div>
	);
};

export default Download;
