import type { FunctionComponent } from 'react';
import { useState } from 'react';
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
	const [isLoading, setIsLoading] = useState(false);
	const [isFiltersOpen, setIsFiltersOpen] = useState(false);

	const handleGenerate = async () => {
		setIsLoading(true);
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
		
		setResult(data.numbers?.length === 1 ? data.numbers[0] : data.numbers || '404');
		setSeed(data.seed || null);
		setGraphs(data.graphs || []);
	};

	const handleGoToCheck = () => {
		navigate('/check');
	};

	const handleGoToRecord = () => {
		navigate('/record');
	};
	return (
		<div className={styles.home}>
			<div className={styles.menuParent}>
				<div className={styles.menu}>
					<img src={Menu} className={styles.groupIcon} alt="" />
				</div>
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
						{result ? (
							Array.isArray(result) ? (
								<div className={styles.multipleNumbers}>
									{result.map((num, index) => (
										<div key={index} className={styles.numberItem}>{num}</div>
									))}
								</div>
							) : (
								<div className={styles.singleNumber}>{result}</div>
							)
						) : (
							<div className={styles.singleNumber}>404</div>
						)}
						{isLoading && <div className={styles.loader}>генерация</div>}
						{seed && (
							<div className={styles.seedInfo}>
								<div className={styles.seedLabel}>Сид:</div>
								<div className={styles.seedValue}>{seed}</div>
							</div>
						)}
						{graphs.length > 0 && (
							<div className={styles.graphsContainer}>
								<div className={styles.graphsLabel}>Графики звуков:</div>
								<div className={styles.graphs}>
									{graphs.map((graph, index) => (
										<img 
											key={index} 
											src={graph} 
											alt={`График звука ${index + 1}`}
											className={styles.graphImage}
										/>
									))}
								</div>
							</div>
						)}
					</div>
					<div className={styles.div3}>
						<button className={styles.div4} onClick={handleGenerate}>
							<div className={styles.div5}>сгенерировать</div>
						</button>
						<button className={styles.div6} onClick={handleOpenFilters}>
							<div className={styles.div7}>фильтры</div>
						</button>
						<button className={styles.div6} onClick={handleGoToCheck}>
							<div className={styles.div7}>проверить</div>
						</button>
						<button className={styles.div6} onClick={handleGoToRecord}>
							<div className={styles.div7}>записать</div>
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
				<div className={styles.finalNumber}>404</div>
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
