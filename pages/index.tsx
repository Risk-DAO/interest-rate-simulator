import { CartesianGrid, Label, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { StepsResults, findOptimalInterestRate, simulate } from '../components/simulation';
import { useEffect, useState } from 'react';

import Head from 'next/head';
import { PacmanLoader } from 'react-spinners';
import { SimulatedResults } from '../components/simulation';
import styles from '../styles/Home.module.css';

export default function Home() {
  // Simulation parameters initialization
  const [stepSize, setStepSize] = useState(0.0001);
  const [minChange, setMinChange] = useState(0.001);
  const [interestFormula, setInterestFormula] = useState('70 * borrow / supply');
  const [initialSupply, setInitialSupply] = useState(1);
  const [borrowFormula, setBorrowFormula] = useState('100 - 5 * interestRate');
  const [supplyFormula, setSupplyFormula] = useState('6 * interestRate');

  //Simulation results
  const [plotData, setPlotData] = useState<SimulatedResults[] | null>(null);
  const [stepData, setStepData] = useState<lineArray | null>(null);
  const [onePlot, setOnePlot] = useState<StepsResults[] | null>(null);
  const [simulationLogs, setSimulationLogs] = useState<logs[] | null>(null);
  const [optimalInterest, setOptimalInterest] = useState<optimalResults | null>();
  const [finalSupply, setFinalSupply] = useState(0);
  const [finalSupplyRate, setFinalSupplyRate] = useState(0);
  const [finalBorrow, setFinalBorrow] = useState(0);
  const [finalBorrowRate, setFinalBorrowRate] = useState(0);

  //control variables
  const [loading, setLoading] = useState(false);

  //interest function defaults
  const withoutKink = '70 * borrow / supply';
  const withKink = 'borrow/supply > 0.7 ? (borrow/supply) * 0.9 : (borrow/supply) * 0.7';

  /// INTERFACE JS
  type lineArray = {
    globalResult: StepsResults[];
    supplyResult: StepsResults[];
    borrowResult: StepsResults[];
  };
  type logs = {
    step: number;
    type: string;
    value: number;
    apy: number;
    util: number;
  };
  type optimalResults = {
    optimalBorrow: number;
    optimalRate: number;
    optimalSupply: number;
    utilization: number;
  };

  useEffect(() => {
    //setLoading(false);
  }, [loading]);

  function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

  async function runStepSimulation() {
    setLoading(true);
    setOnePlot(null);
    setOptimalInterest(null);
    setSimulationLogs(null);
    await sleep(500);
    let finalSupply = 0;
    let finalSupplyRate = 0;
    let finalBorrow = 0;
    let finalBorrowRate = 0;
    let logArray = [];
    const results = simulate(initialSupply, minChange, stepSize, interestFormula, supplyFormula, borrowFormula);
    setOnePlot(results);
    for (let i = 0; i < results.length; i++) {
      logArray.push({
        step: results[i].round,
        type: results[i].type,
        value: results[i].value,
        apy: results[i].apy,
        util: results[i].util,
      });
      if (results[i].type === 'Supply') {
        finalSupply = results[i].value;
        finalSupplyRate = results[i].apy;
      } else if (results[i].type === 'Borrow') {
        finalBorrow = results[i].value;
        finalBorrowRate = results[i].apy;
      }
    }
    logArray = logArray.slice(-2);
    setFinalSupply(finalSupply);
    setFinalSupplyRate(finalSupplyRate);
    setFinalBorrow(finalBorrow);
    setFinalBorrowRate(finalBorrowRate);
    setSimulationLogs(logArray);
    setOptimalInterest(findOptimalInterestRate(100, 0.01, supplyFormula, borrowFormula));
    setLoading(false);
  }

  const customDot: object = (props: any) => {
    const { cx, cy, stroke, payload, value } = props;
    if (payload.round % 2 === 0) {
      return (
        <svg x={cx - 8} y={cy - 8} width={50} height={50} fill="green" viewBox="0 0 1024 1024">
          <path
            d="
        M 100, 100
        m 0, 0
        a 75,75 0 1,0 150,0
        a 75,75 0 1,0 -150,0
        "
          />
        </svg>
      );
    } else {
      return (
        <svg x={cx - 8} y={cy - 8} width={50} height={50} fill="red" viewBox="0 0 1024 1024">
          <path
            d="
        M 100, 100
        m 0, 0
        a 75,75 0 1,0 150,0
        a 75,75 0 1,0 -150,0
        "
          />
        </svg>
      );
    }
  };

  const customTooltip = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      return (
        <div className={styles.customTooltip}>
          <p className="label">{`Step : ${payload[0].payload.round}`}</p>
          <p className="desc">{`${payload[0].payload.type} : ${payload[0].payload.value}M`}</p>
          <p className="desc">{`APY : ${payload[0].payload.apy}%`}</p>
        </div>
      );
    }
    return null;
  };

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
        <p className={styles.description}>
          <a href="https://medium.com/risk-dao">Read the paper</a> or get started by inputing your variables:
        </p>
        <div className={styles.contentTerminal}>
          <div className={styles.userContent}>
            <div className={styles.grid}>
              <div className={styles.inputs}>
                <label>Initial Supply (M):</label>
                <input
                  type="number"
                  minLength={1}
                  value={initialSupply}
                  onChange={(e) => setInitialSupply(Number(e.target.value))}
                />
                <label>Borrow Function:</label>
                <input
                  type="text"
                  placeholder="0"
                  value={borrowFormula}
                  onChange={(e) => setBorrowFormula(e.target.value)}
                  title="Must be a function of interestRate"
                />
                <label>Supply Function:</label>
                <input
                  type="text"
                  placeholder="0"
                  value={supplyFormula}
                  onChange={(e) => setSupplyFormula(e.target.value)}
                  title="Must be a function of interestRate"
                />
              </div>
              <div className={styles.inputs}>
                <label>Interest Rate Function:</label>
                <textarea
                  rows={5}
                  cols={30}
                  name="text"
                  placeholder="Enter text"
                  onChange={(e) => setInterestFormula(e.target.value)}
                  value={interestFormula}
                ></textarea>
                <div className={styles.presetButtons}>
                  <button onClick={(e) => setInterestFormula(withoutKink)}>without kink preset</button>
                  <button onClick={(e) => setInterestFormula(withKink)}>with kink preset</button>
                </div>
              </div>
            </div>
            <div className={styles.functionButtons}>
              {loading ? '' : <button onClick={(e) => runStepSimulation()}>run step simulation</button>}
              <PacmanLoader loading={loading} size={15} />
            </div>
          </div>
        </div>
        <div className={styles.graphsContainer}>
          <div className={styles.centering}></div>
            <div className={styles.supplyGraph}>
              
          {!loading ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  width={500}
                  height={300}
                  data={onePlot ? onePlot : undefined}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 15,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="round">
                    <Label value="Simulation Step" position="bottom" offset={0} />
                  </XAxis>
                  <YAxis unit="M">
                    <Label value="Value" position={'left'} angle={-90} offset={-10} />
                  </YAxis>
                  <YAxis />
                  <Tooltip content={customTooltip} />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} dot={customDot} />
                </LineChart>
              </ResponsiveContainer>) : (
            ''
          )}
            </div>
          
          <div className={styles.terminal}>
            {simulationLogs && optimalInterest ?  
            <table>
              <thead><tr>Simulation Results:</tr></thead>
              <br/>
              <tbody>
                <tr><td>Final Supply:</td><td>{simulationLogs[0].value}M</td></tr>
                <tr><td>Final Supply APY:</td><td>{simulationLogs[0].apy}%</td></tr>
                <br/>
                <tr><td>Final Borrow:</td><td>{simulationLogs[1].value}M</td></tr>
                <tr><td>Final Borrow APY:</td><td>{simulationLogs[1].apy}%</td></tr>
                <br/>
                <tr><td>Utilization:</td><td>{simulationLogs[1].util * 100}%</td></tr>
                <br/>
                <tr><td>Optimal Interest Rate:</td><td>{Number(optimalInterest.optimalRate.toFixed(2))}%</td></tr>
                <tr><td>% of maximal TVL achieved:</td><td>{Number((finalSupply / optimalInterest.optimalRate).toFixed(2))}%</td></tr>
                <tr><td>% of maximal revenues achieved:</td><td>{Number(
                  (
                    (finalBorrow * finalBorrowRate) /
                    (optimalInterest.optimalBorrow * optimalInterest.optimalRate) * 100
                  ).toFixed(2),
                )}
                %</td></tr>
            </tbody>
            </table>
           : ''}
          </div>
        </div>
        {/* <button onClick={(e) => setLoading(!loading)}>run optimal simulation</button> */}
      </main>
      <footer className={styles.footer}>
        <h2>Join the DAO</h2>
        <div className={styles.footerLogos}>
          <a href="https://twitter.com/Risk_DAO" target="_blank" rel="noreferrer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
            </svg>
          </a>
          <a href="https://discord.gg/NYyeDQDDvM" target="_blank" rel="noreferrer">
            <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd">
              <path d="M19.54 0c1.356 0 2.46 1.104 2.46 2.472v21.528l-2.58-2.28-1.452-1.344-1.536-1.428.636 2.22h-13.608c-1.356 0-2.46-1.104-2.46-2.472v-16.224c0-1.368 1.104-2.472 2.46-2.472h16.08zm-4.632 15.672c2.652-.084 3.672-1.824 3.672-1.824 0-3.864-1.728-6.996-1.728-6.996-1.728-1.296-3.372-1.26-3.372-1.26l-.168.192c2.04.624 2.988 1.524 2.988 1.524-1.248-.684-2.472-1.02-3.612-1.152-.864-.096-1.692-.072-2.424.024l-.204.024c-.42.036-1.44.192-2.724.756-.444.204-.708.348-.708.348s.996-.948 3.156-1.572l-.12-.144s-1.644-.036-3.372 1.26c0 0-1.728 3.132-1.728 6.996 0 0 1.008 1.74 3.66 1.824 0 0 .444-.54.804-.996-1.524-.456-2.1-1.416-2.1-1.416l.336.204.048.036.047.027.014.006.047.027c.3.168.6.3.876.408.492.192 1.08.384 1.764.516.9.168 1.956.228 3.108.012.564-.096 1.14-.264 1.74-.516.42-.156.888-.384 1.38-.708 0 0-.6.984-2.172 1.428.36.456.792.972.792.972zm-5.58-5.604c-.684 0-1.224.6-1.224 1.332 0 .732.552 1.332 1.224 1.332.684 0 1.224-.6 1.224-1.332.012-.732-.54-1.332-1.224-1.332zm4.38 0c-.684 0-1.224.6-1.224 1.332 0 .732.552 1.332 1.224 1.332.684 0 1.224-.6 1.224-1.332 0-.732-.54-1.332-1.224-1.332z" />
            </svg>
          </a>
          <a href="https://medium.com/risk-dao" target="_blank" rel="noreferrer">
            <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd">
              <path d="M2.846 6.887c.03-.295-.083-.586-.303-.784l-2.24-2.7v-.403h6.958l5.378 11.795 4.728-11.795h6.633v.403l-1.916 1.837c-.165.126-.247.333-.213.538v13.498c-.034.204.048.411.213.537l1.871 1.837v.403h-9.412v-.403l1.939-1.882c.19-.19.19-.246.19-.537v-10.91l-5.389 13.688h-.728l-6.275-13.688v9.174c-.052.385.076.774.347 1.052l2.521 3.058v.404h-7.148v-.404l2.521-3.058c.27-.279.39-.67.325-1.052v-10.608z" />
            </svg>
          </a>
          <a href="https://github.com/Risk-DAO" target="_blank" rel="noreferrer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}
