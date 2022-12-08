import { CartesianGrid, Label, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import Head from 'next/head';
import Image from 'next/image'
import { SimulatedResults } from '../components/simulation';
import blackLogo from '../public/black-logo.png'
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

  //Simulation results
  const [plotData, setPlotData] = useState<SimulatedResults[]>([])

  //control variables
  const [initialSupplyCheck, setInitialSupplyCheck] = useState(true);
  const [borrowCheck, setBorrowCheck] = useState(true);
  const [supplyCheck, setSupplyCheck] = useState(true);

  //logs variable

  /// INTERFACE JS

  // IMPLEMENT INPUT VALIDATION HERE
  function inputValidation(field: string, input: string) {
    console.log({ plotData })
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
  function runSimulation() {
    const results = simulate(initialSupply, 0.001, 0.0001, interestFormula, supplyFormula, borrowFormula)
    setPlotData(results)
    console.log({ plotData })
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Interest Rate Simulator</title>
        <meta name="description" content="Risk's DAO DEFI interest rate simulator" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.logo}>
          <Image
            src={blackLogo} alt="Risk DAO logo" />
        </div>
        <h1 className={styles.title}>Welcome to Risk DAO's interest rate simulator.</h1>
        <p className={styles.description}><a href="https://perdu.com">Read the paper</a> or get started by inputing your variables:</p>
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
            Inputs Checks:
            <br />
            <br />
            <div className={styles.controlChecks}>
              Initial supply: {initialSupplyCheck ? '✅' : '❌'}
              <br />
              Borrow function: {borrowCheck ? '✅' : '❌'}
              <br />
              Supply function: {supplyCheck ? '✅' : '❌'}
            </div>
            <br />
            <br />

            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
              <button
                disabled={!(initialSupplyCheck && borrowCheck && supplyCheck)}
                onClick={(e) => runSimulation()}
              >
                run simulation
              </button>
            </div>
          </div>
        </div>
          <div className={styles.graphsContainer}>
            <div className={styles.supplyGraph}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  width={500}
                  height={300}
                  data={plotData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="util"><Label value="Utilization" position="bottom" offset={1}/></XAxis>
                  <YAxis />
                  <Tooltip />
                  <Legend layout='vertical' verticalAlign='bottom' />
                  <Line type="monotone" dataKey="borrowApy" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="supplyApy" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className={styles.borrowGraph}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  width={500}
                  height={300}
                  data={plotData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="util"><Label value="Utilization" position="bottom" offset={1}/></XAxis>
                  <YAxis />
                  <Tooltip />
                  <Legend layout='vertical' verticalAlign='bottom' />
                  <Line type="monotone" dataKey="supply" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="borrow" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
        </div>
      </main>
      <footer className={styles.footer}>Powered by la Tribu</footer>
    </div>
  );
}
