import type { FunctionComponent } from 'react';

import styles from './Check.module.css';
import Chevron from '../../assets/icons/Chevron.svg'
import Arrow from '../../assets/icons/Arrow.svg'


const Check: FunctionComponent = () => {
	return (
		<div className={styles.home}>
			<div className={styles.menuParent}>
				<div className={styles.menu}>
					<img src={Chevron} className={styles.groupIcon} alt="" />
				</div>
				<div className={styles.frame}>
					<div className={styles.frameElChild} />
					<div className={styles.div}>
						<span>{`Проверить `}</span>
						<b className={styles.b}>качество работы</b>
						<span> нашего генератора случайных чисел</span>
					</div>
					<img src={Arrow} className={styles.arrowIcon} alt="" />
					<div className={styles.ellipse}></div>
					<button className={styles.button} onClick={() => ''}>выгрузить данные</button>
				</div>
			</div>
		</div>
	);
};

export default Check;
