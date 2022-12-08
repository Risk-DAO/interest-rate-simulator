import Head from 'next/head';
import { simulate } from '../components/simulation';
import styles from '../styles/Home.module.css';
import { useState } from 'react';

export default function Home() {
  // Simulation parameters initialization
  const stepSize: number = 0.0001;
  const minChange: number = 0.001;
  const [interestFormula, setinterestFormula] = useState('70 * borrow / supply');
  const [initialSupply, setInitialSupply] = useState(1);
  const [borrowFormula, setBorrowFormula] = useState('100 - 5 * interestRate');
  const [supplyFormula, setSupplyFormula] = useState('6 * interestRate');

  //control variables
  const [initialSupplyCheck, setInitialSupplyCheck] = useState(true);
  const [borrowCheck, setBorrowCheck] = useState(true);
  const [supplyCheck, setSupplyCheck] = useState(true);

  //logs variable
  const [simulationLog, setSimulationLog] = useState<string[]>([]);

  /// INTERFACE JS
  interface LogLineProps {
    id: number;
    line: string;
  }
  function LogLine(props: LogLineProps) {
    return (
      <li key={props.id} className={styles.code}>
        {props.line}
      </li>
    );
  }
  function updateLogs(log: string) {
    setSimulationLog([...simulationLog, log]);
  }

  // IMPLEMENT INPUT VALIDATION HERE
  function inputValidation(field: string, input: string) {
    if (field === 'initialSupply') {
      let inputValue: number = Number(input);
      if (inputValue > 0) {
        setInitialSupplyCheck(true);
        setInitialSupply(inputValue);
      } else {
        setInitialSupplyCheck(false);
      }
    } else if (field === 'borrowFormula') {
      if (input.includes('interestRate')) {
        setBorrowCheck(true);
        setBorrowFormula(input);
      } else {
        setBorrowCheck(false);
        setBorrowFormula(input);
      }
    } else if (field === 'supplyFormula') {
      if (input.includes('interestRate')) {
        setSupplyCheck(true);
        setSupplyFormula(input);
      } else {
        setSupplyCheck(false);
        setSupplyFormula(input);
      }
    }
  }
  function runSimulation(){
    const results = simulate(initialSupply, 0.001, 0.0001, interestFormula, supplyFormula, borrowFormula)
    console.log({results})
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
          <div className={styles.inputs}>
            Initial Supply:
            <br />
            <input
              type="number"
              value={initialSupply}
              placeholder="0"
              onChange={(e) => inputValidation('initialSupply', e.target.value)}
            />
            <br />
            <br />
            Borrow Function:
            <br />
            <input
              type="text"
              placeholder="0"
              value={borrowFormula}
              onChange={(e) => inputValidation('borrowFormula', e.target.value)}
              title="Must be a function of interestRate"
            />
            <br />
            <br />
            Supply Function:
            <br />
            <input
              type="text"
              placeholder="0"
              value={supplyFormula}
              onChange={(e) => inputValidation('supplyFormula', e.target.value)}
              title="Must be a function of interestRate"
            />
            <br />
            <br />
          </div>
          <div className={styles.control}>
            Inputs Check
            <br />
            <br />
            initial supply: {initialSupplyCheck ? '✅' : '❌'}
            <br />
            Borrow function: {borrowCheck ? '✅' : '❌'}
            <br />
            Supply function: {supplyCheck ? '✅' : '❌'}
            <br />
            <br />
            <div style={{display:'flex', flexDirection: 'row', justifyContent: 'center' }}>
              <button
                disabled={!(initialSupplyCheck && borrowCheck && supplyCheck)}
                onClick={(e) => runSimulation()}
              >
                run simulation
              </button>
            </div>
          </div>
        </div>
        {/* FAKE TERMINAL FOR SIMULATION OUTPUT */}
        <div className={styles.fakeMenu}>
          <div className={styles.fakeButtons + ' ' + styles.fakeClose}></div>
          <div className={styles.fakeButtons + ' ' + styles.fakeMinimize}></div>
          <div className={styles.fakeButtons + ' ' + styles.fakeZoom}></div>
        </div>

        <div className={styles.fakeScreen}>
          <ol>
            {simulationLog.map((line, i) => {
              return <LogLine id={i} line={line} />;
            })}
          </ol>
        </div>
      </main>
      <footer className={styles.footer}>Powered by la Tribu</footer>
    </div>
  );
}
