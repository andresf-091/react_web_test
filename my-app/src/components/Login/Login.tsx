import type { FunctionComponent } from 'react';
import styles from './Login.module.css';


const Login: FunctionComponent = () => {
    return (
        <div className={styles.login}>
            <b className={styles.b}>Добро пожаловать</b>
            <div className={styles.div}>
                <div className={styles.loginDiv}>Войти</div>
            </div>
            <div className={styles.div2}>
                <div className={styles.loginDiv}>Регистрация</div>
            </div>
        </div>);
};

export default Login;
