import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useState } from 'react';

export default function Home() {
  // Simulation parameters initialization
  const stepSize: number = 0.0001;
  const minChange: number = 0.001;
  const [interestFormula, setinterestFormula] = useState('70 * borrow / supply');
  const [initialSupply, setInitialSupply] = useState('1');
  const [borrowFormula, setborrowFormula] = useState('100 - 5 * interestRate');
  const [supplyFormula, setSupplyFormula] = useState('6 * interestRate');

  function supplyDemand(supplyFormula: string, interestRate: number) {
    if (supplyFormula.includes('interestRate')) {
      const EvalResults: number = eval(supplyFormula);
      console.log('evalresults are', EvalResults);
      return EvalResults;
    } else {
      console.log("error doesn't contain interest rate");
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Interest Rate Simulator</title>
        <meta name="description" content="Risk's DAO DEFI interest rate simulator" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to Risk DAO's interest rate simulator.</h1>

        <p className={styles.description}>Get started by inputing your variables:</p>

        <div className={styles.grid}>
          <div className={styles.card}>
            Initial Supply (in millions):
            <br />
            <input
              type="number"
              value={initialSupply}
              placeholder="0"
              onChange={(e) => setInitialSupply(e.target.value)}
            />
            <br />
            <br />
            Borrow Function (as javascript):
            <br />
            <input
              type="text"
              placeholder="0"
              value={borrowFormula}
              onChange={(e) => setborrowFormula(e.target.value)}
            />
            <br />
            <br />
            Supply Function (as javascript):
            <br />
            <input
              type="text"
              placeholder="0"
              value={supplyFormula}
              onChange={(e) => setSupplyFormula(e.target.value)}
            />
            <br />
            <br />
            <div className={styles.alignCenter}>
              <button onClick={(e) => supplyDemand(supplyFormula, 10)}>run simulation</button>
            </div>
          </div>
          <div className={styles.card}>
            Current inputs are:
            <br />
            <br />
            initial supply: {initialSupply}
            <br />
            Borrow function: {borrowFormula}
            <br />
            Supply function: {supplyFormula}
          </div>
        </div>
        {/* FAKE TERMINAL FOR SIMULATION OUTPUT */}
        <div className={styles.fakeMenu}>
          <div className={styles.fakeButtons + ' ' + styles.fakeClose}></div>
          <div className={styles.fakeButtons + ' ' + styles.fakeMinimize}></div>
          <div className={styles.fakeButtons + ' ' + styles.fakeZoom}></div>
        </div>

        <div className={styles.fakeScreen}>{/* SIMULATION OUTPUT HERE */}</div>
      </main>
      <footer className={styles.footer}>Powered by la Tribu</footer>
    </div>
  );
}
