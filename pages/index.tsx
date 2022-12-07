import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useState } from 'react';

export default function Home() {
  // Simulation parameters initialization
  const stepSize: number = 0.0001;
  const minChange: number = 0.001;
  const [interestFormula, setinterestFormula] = useState('70 * borrow / supply');
  const [initialSupply, setInitialSupply] = useState('1');
  const [borrowFormula, setBorrowFormula] = useState('100 - 5 * interestRate');
  const [supplyFormula, setSupplyFormula] = useState('6 * interestRate');

  //control variables
  const [initialSupplyCheck, setInitialSupplyCheck] = useState(true);
  const [borrowCheck, setBorrowCheck] = useState(true);
  const [supplyCheck, setSupplyCheck] = useState(true);

  //logs variable
  const [simulationLog, setSimulationLog] = useState<string[]>([]);

  //// SIMULATION JS
  function supplyDemand(supplyFormula: string, interestRate: number) {
    const supplyEvalResults: number = eval(supplyFormula);
    return supplyEvalResults;
  }
  function borrowDemand(borrowFormula: string, interestRate: number) {
    const borrowEvalResults: number = eval(borrowFormula);
    return borrowEvalResults;
  }
  function protocolInterestRate(interestFormula: string, supply: number, borrow: number) {
    const interestEvalResults: number = eval(interestFormula);
    return interestEvalResults;
  }
  function findNewSupply(
    supply: number,
    borrow: number,
    step: number,
    interestRateFunction: Function,
    supplyDemandFunction: Function,
  ) {
    for (let newSupply = supply; ; newSupply += step) {
      const utilization = borrow / newSupply;
      const interstRate = interestRateFunction(newSupply, borrow) * utilization;
      if (supplyDemandFunction(interstRate) < newSupply) {
        return newSupply - step;
      }
    }
  }
  function findNewBorrow(
    supply: number,
    borrow: number,
    step: number,
    interestRateFunction: Function,
    borrowDemandFunction: Function,
  ) {
    for (let newBorrow = borrow; ; newBorrow += step) {
      const interestRate = interestRateFunction(supply, newBorrow);
      if (borrowDemandFunction(interestRate) < newBorrow) {
        return newBorrow - step;
      }
      if (newBorrow >= supply) {
        return newBorrow - step;
      }
    }
  }
  function findInitialBorrow(
    initialSupply: number,
    stepSize: number,
    supplyDemandFunction: Function,
    borrowDemandFunction: Function,
  ) {
    // find supply interest rate
    let supplyInterestRate = 0;
    while (supplyDemandFunction(supplyInterestRate) < initialSupply) {
      supplyInterestRate += stepSize;
    }

    console.log({ supplyInterestRate });
    setSimulationLog([...simulationLog, `supplyinterestrate is ${supplyInterestRate}`]);
    let borrow = 0;
    while (true) {
      const borrowRate = (borrow * supplyInterestRate) / initialSupply;
      const borrowDemand = borrowDemandFunction(borrowRate);

      if (borrowDemand < borrow) break;
      if (borrowDemand >= initialSupply) return initialSupply;

      console.log({ borrowRate }, { borrow });
      setSimulationLog([...simulationLog, `${borrowRate} is ${borrow}`]);

      borrow += stepSize;
    }

    return borrow;
  }
  function simulate(
    initialSupply: number,
    stepSize: number,
    minChange: number,
    interestRateFunction: Function,
    supplyDemandFunction: Function,
    borrowDemandFunction: Function,
  ) {
    setSimulationLog([]);
    let currentSupply = initialSupply;
    let currentBorrow = findInitialBorrow(initialSupply, stepSize, supplyDemandFunction, borrowDemandFunction);

    console.log('initial borrow', currentBorrow);
    setSimulationLog([...simulationLog, `initial borrow is ${currentBorrow}`]);

    while (true) {
      const newSupply = findNewSupply(
        currentSupply,
        currentBorrow,
        stepSize,
        interestRateFunction,
        supplyDemandFunction,
      );
      const newBorrow = findNewBorrow(newSupply, currentBorrow, stepSize, interestRateFunction, borrowDemandFunction);

      if (newSupply / currentSupply < 1 + minChange) {
        console.log('simulation is done');
        break;
      }

      currentSupply = newSupply;
      currentBorrow = newBorrow;

      const util = currentBorrow / currentSupply;
      const supplyApy = interestRateFunction(currentSupply, currentBorrow) * util;
      const borrowApy = interestRateFunction(currentSupply, currentBorrow);

      console.log({ currentSupply }, { supplyApy }, { currentBorrow }, { borrowApy });
    }
  }

  /// END SIMULATION JS

  /// INTERFACE JS
  interface LogLineProps {
    id: number;
    line: string;
  }
  function LogLine(props: LogLineProps) {
    return (
      <li key={props.id} className={props.id % 2 ? styles.line0 : styles.line1}>
        {props.line}
      </li>
    );
  }

  // IMPLEMENT INPUT VALIDATION HERE
  function inputValidation(field: string, input: string) {
    if (field === 'initialSupply') {
      let inputValue: number = Number(input);
      if (inputValue > 0) {
        setInitialSupplyCheck(true);
        setInitialSupply(input);
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
    console.log(simulationLog);
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
            />
            <br />
            <br />
            <div style={{ flexDirection: 'row', justifyContent: 'center' }}>
              <button
                disabled={!(initialSupplyCheck && borrowCheck && supplyCheck)}
                onClick={(e) => simulate(1, 0.001, 0.0001, protocolInterestRate, supplyDemand, borrowDemand)}
              >
                run simulation
              </button>
            </div>
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
