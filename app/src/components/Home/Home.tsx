import type { FunctionComponent } from 'react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FiltersModal from '../FiltersModal/FiltersModal';
import type { GenerateResponse } from '../../logics/types';
import { generateRandomNumbers } from '../../logics/client';

import styles from './Home.module.css';
import Menu from '../../assets/icons/Menu.svg'
import Map from '../../assets/icons/Map.svg'
import Waves from '../../assets/icons/Waves.svg'
import ArrowsA from '../../assets/icons/ArrowsA.svg'
import ArrowsV from '../../assets/icons/ArrowsV.svg'
import ArrowsP from '../../assets/icons/ArrowsP.svg'
import Line from '../../assets/icons/Line.svg'
import Arrow from '../../assets/icons/Arrow.svg'
import ArrowWave from '../../assets/icons/ArrowWave.svg'
import SoundWave from '../../assets/icons/SoundWave.svg'


const Home: FunctionComponent = () => {
	const navigate = useNavigate();
	const [result, setResult] = useState<string | string[] | null>(null);
	const [seed, setSeed] = useState<string | null>(null);
	const [graphs, setGraphs] = useState<string[]>([]);
	const [sources, setSources] = useState<Array<{
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
	}> | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isFiltersOpen, setIsFiltersOpen] = useState(false);
	const [isUserGenerated, setIsUserGenerated] = useState(false);
	const [isPlayingAudio, setIsPlayingAudio] = useState(false);
	const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
	const [animatedNumber, setAnimatedNumber] = useState('404');
	const [loadingNumber, setLoadingNumber] = useState('404');
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [copiedSequence, setCopiedSequence] = useState(false);
	
	const audioRefs = useRef<HTMLAudioElement[]>([]);
	const animationIntervalRef = useRef<number | null>(null);

	// Функция для генерации случайного числа с приоритетом для 404
	const generateRandomNumber = () => {
		const random = Math.random();
		// 404 появляется в 30% случаев
		if (random < 0.3) {
			return '404';
		}
		// Остальные числа от 1 до 1000
		return Math.floor(Math.random() * 1000) + 1;
	};

	// Анимация чисел
	const startNumberAnimation = () => {
		if (animationIntervalRef.current) {
			clearInterval(animationIntervalRef.current);
		}
		
		animationIntervalRef.current = setInterval(() => {
			setAnimatedNumber(generateRandomNumber().toString());
		}, 500); // Меняем число каждые 500мс (реже для производительности)
	};

	// Остановка анимации
	const stopNumberAnimation = () => {
		if (animationIntervalRef.current) {
			clearInterval(animationIntervalRef.current);
			animationIntervalRef.current = null;
		}
	};

	// Анимация загрузки
	const startLoadingAnimation = () => {
		const loadingInterval = setInterval(() => {
			setLoadingNumber(generateRandomNumber().toString());
		}, 100); // Быстрее чем обычная анимация
		
		// Останавливаем через 3 секунды
		setTimeout(() => {
			clearInterval(loadingInterval);
		}, 3000);
	};

	// Автоматическое воспроизведение аудио после генерации
	const playAudioSources = async () => {
		if (!sources || sources.length === 0 || isPlayingAudio) return;
		
		console.log('Начинаем воспроизведение аудио источников:', sources.length);
		setIsPlayingAudio(true);
		setCurrentAudioIndex(0);
		
		// Создаем аудио элементы для каждого источника
		const audioElements: HTMLAudioElement[] = [];
		sources.slice(0, 3).forEach((source, index) => {
			console.log(`Создаем аудио элемент ${index + 1}:`, source.url);
			const audio = new Audio(source.url);
			audio.crossOrigin = 'anonymous';
			audio.volume = 0.7; // Устанавливаем громкость
			audioElements.push(audio);
		});
		
		audioRefs.current = audioElements;
		
		// Воспроизводим по 5 секунд каждый звук
		for (let i = 0; i < audioElements.length; i++) {
			console.log(`Воспроизводим источник ${i + 1}/${audioElements.length}`);
			setCurrentAudioIndex(i);
			const audio = audioElements[i];
			
			try {
				// Пытаемся воспроизвести
				const playPromise = audio.play();
				if (playPromise !== undefined) {
					await playPromise;
					console.log(`Аудио ${i + 1} успешно запущено`);
					await new Promise(resolve => setTimeout(resolve, 5000));
					audio.pause();
					audio.currentTime = 0;
					console.log(`Аудио ${i + 1} остановлено`);
				}
			} catch (error) {
				console.error(`Ошибка воспроизведения аудио ${i + 1}:`, error);
				// Продолжаем с следующим аудио даже если текущее не воспроизвелось
			}
		}
		
		console.log('Воспроизведение завершено');
		setIsPlayingAudio(false);
		setCurrentAudioIndex(0);
	};

	const handleGenerate = async () => {
		setIsLoading(true);
		stopNumberAnimation(); // Останавливаем анимацию
		startLoadingAnimation(); // Запускаем анимацию загрузки
		
		try {
			// Вызываем через API-клиент
			const response: GenerateResponse = await generateRandomNumbers({
				from_num: '1',
				to_num: '1000',
				count: 1,
				base: 10,
				uniq_only: true,
				format: 'json',
			});
			
			console.log('Home - Ответ от бекенда:', response);
			console.log('Home - Сгенерированные числа:', response.numbers);
			console.log('Home - Сид:', response.seed);
			console.log('Home - Графики:', response.graphs);
			
			setResult(response.numbers?.length === 1 ? response.numbers[0] : response.numbers || '404');
			setSeed(response.seed || null);
			setGraphs(response.graphs || []);
			setSources(response.executed_sources || null);
			setIsUserGenerated(true);
			
			// Автоматически воспроизводим аудио после генерации
			setTimeout(() => {
				playAudioSources();
			}, 1000);
			
		} catch (err) {
			console.error('Home - Ошибка при генерации:', err);
			setResult('ERROR');
			setSeed(null);
			setGraphs([]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleOpenFilters = () => {
		setIsFiltersOpen(true);
	};

	const handleGenerateSuccess = (data: GenerateResponse) => {
		console.log('Home - Ответ от фильтров:', data);
		console.log('Home - Сгенерированные числа из фильтров:', data.numbers);
		console.log('Home - Сид из фильтров:', data.seed);
		console.log('Home - Графики из фильтров:', data.graphs);
		
		stopNumberAnimation(); // Останавливаем анимацию
		startLoadingAnimation(); // Запускаем анимацию загрузки
		
		setResult(data.numbers?.length === 1 ? data.numbers[0] : data.numbers || '404');
		setSeed(data.seed || null);
		setGraphs(data.graphs || []);
		setSources(data.executed_sources || null);
		setIsUserGenerated(true);
		
		// Автоматически воспроизводим аудио после генерации
		setTimeout(() => {
			playAudioSources();
		}, 1000);
	};

	const handleGoToCheck = () => {
		navigate('/check');
	};

	const handleGoToRecord = () => {
		navigate('/record');
	};

	const handleGoToDownload = () => {
		navigate('/download');
	};

	// Функция для обработки результатов от записи звука
	const handleRecordResults = (data: GenerateResponse) => {
		console.log('Home - Получены результаты от записи:', data);
		
		setResult(data.numbers?.length === 1 ? data.numbers[0] : data.numbers || '404');
		setSeed(data.seed || null);
		setGraphs(data.graphs || []);
		setSources(data.executed_sources || null);
		setIsUserGenerated(true);
		
		// Автоматически воспроизводим аудио после генерации
		setTimeout(() => {
			playAudioSources();
		}, 1000);
	};

	const handleMenuClick = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	const handleMenuClose = () => {
		setIsMenuOpen(false);
	};

	// Функция для копирования последовательности
	const handleCopySequence = async () => {
		if (Array.isArray(result)) {
			const sequence = result.join(', ');
			try {
				await navigator.clipboard.writeText(sequence);
				setCopiedSequence(true);
				setTimeout(() => setCopiedSequence(false), 2000);
			} catch (err) {
				console.error('Ошибка копирования:', err);
			}
		}
	};

	// Запускаем анимацию чисел при загрузке компонента
	useEffect(() => {
		if (!isUserGenerated) {
			startNumberAnimation();
		}
		
		return () => {
			stopNumberAnimation();
			// Очистка аудио при размонтировании
			audioRefs.current.forEach(audio => {
				audio.pause();
				audio.src = '';
			});
		};
	}, [isUserGenerated]);

	// Проверяем результаты от записи звука при загрузке
	useEffect(() => {
		const recordResults = localStorage.getItem('recordResults');
		if (recordResults) {
			try {
				const data = JSON.parse(recordResults);
				handleRecordResults(data);
				localStorage.removeItem('recordResults'); // Очищаем после использования
			} catch (error) {
				console.error('Ошибка парсинга результатов записи:', error);
				localStorage.removeItem('recordResults');
			}
		}
	}, []);

	return (
		<div className={styles.home}>
			<div className={styles.menuParent}>
				<div className={styles.menu} onClick={handleMenuClick}>
					<img src={Menu} className={styles.groupIcon} alt="" />
				</div>
				{isMenuOpen && (
					<div className={styles.dropdownMenu}>
						<div className={styles.menuItem} onClick={() => { handleGoToRecord(); handleMenuClose(); }}>
							записать
						</div>
						<div className={styles.menuItem} onClick={() => { handleGoToCheck(); handleMenuClose(); }}>
							проверить
						</div>
						<div className={styles.menuItem} onClick={() => { handleGoToDownload(); handleMenuClose(); }}>
							скачать
						</div>
					</div>
				)}
				<div className={styles.gen}>
					<div className={styles.div}>генератор чисел</div>
				</div>
				<div className={styles.opr}>
					<div className={styles.homeDiv}>
						<span>{`- наша программа генерирует числа `}</span>
						<span className={styles.span}>на основе звуков с разных уголков земли,<br /></span>
						<span> благодаря визуализации вы убедитесь в истинной случайности полученных значений</span>
					</div>
				</div>
				<div className={styles.frameEl}>
					<div className={styles.frameElChild} />
					<div className={styles.elGen}>
						<div className={styles.elGenChild} />
						<div>
							<p className={styles.p}>генерация<br /> чисeл с помощью</p>
							<span className={styles.p2}>{`своего звука `}</span>
						</div>
					</div>
					<div className={styles.div8}>
						{isLoading ? (
							<div className={styles.singleNumber} style={{opacity: 0.7, animation: 'pulse 0.5s infinite'}}>
								{loadingNumber}
							</div>
						) : isUserGenerated ? (
							result ? (
								Array.isArray(result) ? (
									<div className={styles.sequenceContainer}>
										{result.length <= 5 ? (
											<div className={styles.multipleNumbers}>
												{result.map((num, index) => (
													<div key={index} className={styles.numberItem}>{num}</div>
												))}
											</div>
										) : (
											<div className={styles.longSequence}>
												<div className={styles.sequenceText}>
													{result.slice(0, 3).join(', ')}... (+{result.length - 3} чисел)
												</div>
												<button 
													className={styles.copyButton}
													onClick={handleCopySequence}
													disabled={copiedSequence}
												>
													{copiedSequence ? '✓ Скопировано' : '📋 Копировать'}
												</button>
											</div>
										)}
									</div>
								) : (
									<div className={styles.singleNumber}>{result}</div>
								)
							) : (
								<div className={styles.singleNumber}>404</div>
							)
						) : (
							<div className={styles.singleNumber}>{animatedNumber}</div>
						)}
						{isLoading && <div className={styles.loader}>генерация</div>}
					</div>
					<div className={styles.div3}>
						<button className={styles.div4} onClick={handleGenerate}>
							<div className={styles.div5}>сгенерировать</div>
						</button>
						<button className={styles.div6} onClick={handleOpenFilters}>
							<div className={styles.div7}>фильтры</div>
						</button>
					</div>
					<img src={SoundWave} draggable="false" className={styles.soundWave} alt="" />
				</div>
				<div className={styles.wrapper}>
					<div className={styles.div2}>
						<span>{`Как мы генерируем числа `}</span>
						<span className={styles.homeSpan}>на основе звуков с разных уголков земли</span>
						<span>?</span>
					</div>
				</div>
				<div className={styles.div10}>
					<img draggable="false" src={Map} className={styles.child} alt="map" />
				</div>
				<img src={Waves} draggable="false" className={styles.icon} alt="" />
				<div className={styles.div14}>
					<div className={styles.div15}>Превращаем колебания в частотные спектры</div>
				</div>
				<div className={styles.div16}>
					<div className={styles.div17}>
						{graphs[0] && <img src={graphs[0]} alt="График звука 1" className={styles.spectrumGraph} />}
					</div>
					<div className={styles.div17}>
						{graphs[1] && <img src={graphs[1]} alt="График звука 2" className={styles.spectrumGraph} />}
					</div>
					<div className={styles.div17}>
						{graphs[2] && <img src={graphs[2]} alt="График звука 3" className={styles.spectrumGraph} />}
					</div>
				</div>
				<div className={styles.div20}>
					<div className={styles.v}>
						<img src={ArrowsA} className={styles.icon1} alt="" />
						<div className={styles.typeFloat64}>(type float64)</div>
						<div className={styles.a10845841}>число aᵢ = 1,0845841</div>
						<div className={styles.div28}>
							<span>01011000</span>
							<span className={styles.span4}>1110101011...</span>
						</div>
					</div>
					<div className={styles.v}>
						<img src={ArrowsP} className={styles.icon1} alt="" />
						<div className={styles.typeFloat64}>(type float64)</div>
						<div className={styles.a10845841}>число pᵢ = 6,2054808</div>
						<div className={styles.div28}>
							<span>11010001</span>
							<span className={styles.span4}>0001101001...</span>
						</div>
					</div>
					<div className={styles.v}>
						<img src={ArrowsV} className={styles.icon1} alt="" />
						<div className={styles.typeFloat64}>(type float64)</div>
						<div className={styles.a10845841}>число vᵢ = 0,4840082</div>
						<div className={styles.div28}>
							<span>01011000</span>
							<span className={styles.span4}>1110101011...</span>
						</div>
					</div>
				</div>
				<img src={Line} className={styles.icon2} alt="" />
				<div className={styles.featuresContainer}>
					<span>{`features = `}</span>
					<span className={styles.span4}>строковая сумма первых 8-ми бит амплитуд каждой частоты</span>
				</div>
				<img src={Arrow} className={styles.icon3} alt="" />
				<div className={styles.blake2bParent}>
					<div className={styles.blake2b}>blake2b</div>
					<div>
						<div className={styles.cloud1}></div>
						<div className={styles.describtion1}>криптографическая<br />хэш-функция</div>
					</div>
				</div>
				<img src={Arrow} className={styles.icon3} alt="" />
				<div className={styles.hashSeedParent}>
					<div>
						<div className={styles.hashSeed}>hash - seed</div>
						<div className={styles.hashSeedChild}>32 бит</div>
					</div>
					<img src={ArrowWave} className={styles.icon4} alt="" />
					<div>
						<div className={styles.cloud2}></div>
						<div className={styles.describtion2}>хранит<br />всю энтропию</div>
					</div>
				</div>
				<img src={Arrow} className={styles.icon3} alt="" />
				<div className={styles.rngText}>RNG</div>
				<div className={styles.entropyText}>Random Number Generation</div>
				<img src={Arrow} className={styles.icon3} alt="" />
				<div className={styles.finalNumber}>
					{isUserGenerated && result && !Array.isArray(result) ? result : '404'}
				</div>
				
				{/* Источники звуков - добавляем после графиков */}
				{sources && sources.length > 0 && (
					<div className={styles.sourcesContainer}>
						<div className={styles.sourcesLabel}>Источники звуков:</div>
						<div className={styles.sources}>
							{sources.map((source, index) => (
								<div key={source.id} className={styles.sourceItem}>
									<div className={styles.sourceName}>{source.name}</div>
									<div className={styles.sourceLocation}>{source.city}, {source.country}</div>
									<div className={styles.sourceArtist}>{source.artist}</div>
									{isPlayingAudio && currentAudioIndex === index && (
										<div className={styles.playingIndicator}>🔊 Воспроизведение...</div>
									)}
								</div>
							))}
						</div>
					</div>
				)}
				
				{/* Кнопка воспроизведения */}
				{!isPlayingAudio && sources && sources.length > 0 && (
					<div className={styles.playAllContainer}>
						<button 
							className={styles.playButton}
							onClick={() => playAudioSources()}
						>
							🔊 Воспроизвести все источники
						</button>
					</div>
				)}
				
				{/* Сид - добавляем в самом низу */}
				{seed && (
					<div className={styles.finalSeed}>
						<div className={styles.seedLabel}>Сид:</div>
						<div className={styles.seedValue}>{seed}</div>
					</div>
				)}
			</div>
			<FiltersModal
				isOpen={isFiltersOpen}
				onClose={() => setIsFiltersOpen(false)}
				onGenerateSuccess={handleGenerateSuccess}
			/>
		</div>
	);
};

export default Home;
