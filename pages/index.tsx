import { CartesianGrid, Label, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { SimulatedResults, StepsResults } from '../components/simulation';
import { simulate, simulateSteps } from '../components/simulation';

import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useState } from 'react';

export default function Home() {
  // Simulation parameters initialization
  const [stepSize, setStepSize] = useState(0.0001);
  const [minChange, setMinChange] = useState(0.001);
  const [interestFormula, setinterestFormula] = useState('70 * borrow / supply');
  const [initialSupply, setInitialSupply] = useState(1);
  const [borrowFormula, setBorrowFormula] = useState('100 - 5 * interestRate');
  const [supplyFormula, setSupplyFormula] = useState('6 * interestRate');

  //Simulation results
  const [plotData, setPlotData] = useState<SimulatedResults[]>([])
  const [stepData, setStepData] = useState<StepsResults[]>([])

  //control variables
  const [initialSupplyCheck, setInitialSupplyCheck] = useState(true);
  const [borrowCheck, setBorrowCheck] = useState(true);
  const [supplyCheck, setSupplyCheck] = useState(true);
  const [interestCheck, setInterestCheck] = useState(true);
  const [terminal, setTerminal] = useState(false);

  //logs variable

  /// INTERFACE JS

  // IMPLEMENT INPUT VALIDATION HERE
  function inputValidation(field: string, input: string) {
    if (field === 'initialSupply') {
      let inputValue: number = Number(input);
      if (inputValue > 0) {
        setInitialSupplyCheck(true);
        setInitialSupply(inputValue);
      } else {
        setInitialSupplyCheck(false);
        setInitialSupply(inputValue);
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
    else if (field === 'interestFormula') {
      if (input.includes('supply') && input.includes('borrow')) {
        setInterestCheck(true);
        setinterestFormula(input);
      } else {
        setInterestCheck(false);
        setinterestFormula(input);
      }
    }
  }
  function runSimulation() {
    const results = simulate(initialSupply, minChange, stepSize, interestFormula, supplyFormula, borrowFormula)
    setPlotData(results)
  }
  function runStepSimulation(){
    const results = simulateSteps(initialSupply, minChange, stepSize, interestFormula, supplyFormula, borrowFormula)
    setStepData(results)
    console.log({results})
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Interest Rate Simulator</title>
        <meta name="description" content="Risk's DAO DEFI interest rate simulator" />
        <link className={styles.favicon} rel="icon" href="/favicon.svg" />
      </Head>
      <main className={styles.main}>
        <div className={styles.logo}>
          <img src="black-logo.png" alt="Risk DAO logo" />
        </div>
        <h1 className={styles.title}>Welcome to Risk DAO&apos;s interest rate simulator.</h1>
        <p className={styles.description}><a href="https://medium.com/risk-dao">Read the paper</a> or get started by inputing your variables:</p>
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
            Interest Rate Function:
            <br />
            <input
              type="text"
              placeholder="0"
              value={interestFormula}
              onChange={(e) => inputValidation('interestFormula', e.target.value)}
              title="Must be a function of borrow and supply"
            />
            <br />
            <br />
            Step Size:
            <br />
            <input
              type="text"
              placeholder="0"
              value={stepSize}
              onChange={(e) => inputValidation('supplyFormula', e.target.value)}
              disabled={true}
              title="step size is fixed at the moment"
            />
            <br />
            <br />
            Minimum change:
            <br />
            <input
              type="text"
              placeholder="0"
              value={minChange}
              onChange={(e) => inputValidation('supplyFormula', e.target.value)}
              disabled={true}
              title="minimum change is fixed at the moment"
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
              <br />
              interest function: {interestCheck ? '✅' : '❌'}
            </div>
            <br />
            <br />

            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <button
                onClick={(e) => setTerminal(!terminal)}
              >
                toggle terminal
              </button>
              <button
                disabled={!(initialSupplyCheck && borrowCheck && supplyCheck && interestCheck)}
                onClick={(e) => runSimulation()}
              >
                run simulation
              </button>
              <button
                disabled={!(initialSupplyCheck && borrowCheck && supplyCheck && interestCheck)}
                onClick={(e) => runStepSimulation()}
              >
                run step simulation
              </button>
            </div>
          </div>
        </div>
        {terminal ?<div className={styles.terminal}>
          {plotData.map((point, i) => <p className='code' key={i}>Utilization: {point.util} Borrow :{point.borrow} Supply: {point.supply} SupplyAPY{point.supplyApy} BorrowAPY:{point.borrowApy}</p>)}
        </div> : ""}
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
                <XAxis dataKey="borrow"><Label value="Borrow" position="bottom" offset={0} /></XAxis>
                <YAxis><Label value="APY" position={'left'} offset={-15} /></YAxis>
                <YAxis />
                <Tooltip label="Borrow"/>
                <Legend layout='horizontal' verticalAlign='bottom'  wrapperStyle={{position:"relative"}} />
                <Line type="monotone" dataKey="supplyApy" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="borrowApy" stroke="#82ca9d" />
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
                <XAxis dataKey="supply"><Label value="Supply" position="bottom" offset={0} /></XAxis>
                <YAxis><Label value="APY" position={'left'} offset={-15} /></YAxis>
                <Tooltip />
                <Legend layout='horizontal' verticalAlign='bottom' wrapperStyle={{position:"relative"}}/>
                <Line type="monotone" dataKey="supplyApy" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="borrowApy" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
      <footer className={styles.footer}>
        <h2>Join the DAO</h2>
        <div className={styles.footerLogos}>
          <a
            href="https://twitter.com/Risk_DAO"
            target="_blank"
            rel="noreferrer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
            </svg>
          </a>
          <a
                href="https://discord.gg/NYyeDQDDvM"
                target="_blank"
                rel="noreferrer"
              >
                <svg
                  width="24"
                  height="24"
                  xmlns="http://www.w3.org/2000/svg"
                  fillRule="evenodd"
                  clipRule="evenodd"
                >
                  <path d="M19.54 0c1.356 0 2.46 1.104 2.46 2.472v21.528l-2.58-2.28-1.452-1.344-1.536-1.428.636 2.22h-13.608c-1.356 0-2.46-1.104-2.46-2.472v-16.224c0-1.368 1.104-2.472 2.46-2.472h16.08zm-4.632 15.672c2.652-.084 3.672-1.824 3.672-1.824 0-3.864-1.728-6.996-1.728-6.996-1.728-1.296-3.372-1.26-3.372-1.26l-.168.192c2.04.624 2.988 1.524 2.988 1.524-1.248-.684-2.472-1.02-3.612-1.152-.864-.096-1.692-.072-2.424.024l-.204.024c-.42.036-1.44.192-2.724.756-.444.204-.708.348-.708.348s.996-.948 3.156-1.572l-.12-.144s-1.644-.036-3.372 1.26c0 0-1.728 3.132-1.728 6.996 0 0 1.008 1.74 3.66 1.824 0 0 .444-.54.804-.996-1.524-.456-2.1-1.416-2.1-1.416l.336.204.048.036.047.027.014.006.047.027c.3.168.6.3.876.408.492.192 1.08.384 1.764.516.9.168 1.956.228 3.108.012.564-.096 1.14-.264 1.74-.516.42-.156.888-.384 1.38-.708 0 0-.6.984-2.172 1.428.36.456.792.972.792.972zm-5.58-5.604c-.684 0-1.224.6-1.224 1.332 0 .732.552 1.332 1.224 1.332.684 0 1.224-.6 1.224-1.332.012-.732-.54-1.332-1.224-1.332zm4.38 0c-.684 0-1.224.6-1.224 1.332 0 .732.552 1.332 1.224 1.332.684 0 1.224-.6 1.224-1.332 0-.732-.54-1.332-1.224-1.332z" />
                </svg>
              </a>
              <a
                href="https://medium.com/risk-dao"
                target="_blank"
                rel="noreferrer"
              >
                <svg
                  width="24"
                  height="24"
                  xmlns="http://www.w3.org/2000/svg"
                  fillRule="evenodd"
                  clipRule="evenodd"
                >
                  <path d="M2.846 6.887c.03-.295-.083-.586-.303-.784l-2.24-2.7v-.403h6.958l5.378 11.795 4.728-11.795h6.633v.403l-1.916 1.837c-.165.126-.247.333-.213.538v13.498c-.034.204.048.411.213.537l1.871 1.837v.403h-9.412v-.403l1.939-1.882c.19-.19.19-.246.19-.537v-10.91l-5.389 13.688h-.728l-6.275-13.688v9.174c-.052.385.076.774.347 1.052l2.521 3.058v.404h-7.148v-.404l2.521-3.058c.27-.279.39-.67.325-1.052v-10.608z" />
                </svg>
              </a>
              <a
                href="https://github.com/Risk-DAO"
                target="_blank"
                rel="noreferrer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
          </div>
      </footer>
    </div>
  );
}
