import type { FunctionComponent } from 'react';
import { useState } from 'react';
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
	const [result, setResult] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isFiltersOpen, setIsFiltersOpen] = useState(false);

	const handleGenerate = async () => {
		setIsLoading(true);
		try {
			// Вызываем через API-клиент
			const response: GenerateResponse = await generateRandomNumbers({
				from_num: '0',
				to_num: '1000',
				count: 1,
				base: 10,
				uniq_only: true,
				format: 'json',
			});
			setResult(response.numbers?.[0] || '404');
		} catch (err) {
			console.error(err);
			setResult('ERROR');
		} finally {
			setIsLoading(false);
		}
	};

	const handleOpenFilters = () => {
		setIsFiltersOpen(true);
	};

	const handleGenerateSuccess = (data: GenerateResponse) => {
		setResult(data.numbers?.[0] || '404');
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
						{result || '404'}
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
					<div className={styles.div17} />
					<div className={styles.div17} />
					<div className={styles.div17} />
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
