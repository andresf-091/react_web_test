import type { FunctionComponent } from 'react';
import styles from './Register.module.css';


const Register: FunctionComponent = () => {
    return (
        <div className={styles.register}>
            <b className={styles.b}>Добро пожаловать</b>
            <div className={styles.parent}>
                <div className={styles.div}>Регистрация</div>
                <b className={styles.registerB}>Войти</b>
                <div className={styles.registerDiv}>
                    <div className={styles.div2}>почта</div>
                    <div className={styles.child} />
                    <div className={styles.div2}>имя</div>
                    <div className={styles.child} />
                    <div className={styles.div2}>пароль</div>
                    <div className={styles.child} />
                </div>
                <div className={styles.div5}>
                    <div className={styles.div2}>Зарегистрироваться</div>
                </div>
            </div>
        </div>);
};

export default Register;
