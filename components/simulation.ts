function findNewSupply(supply:number, borrow:number, step:number, interestRateFunction:Function, supplyFunction:Function) {
    for(let newSupply = supply ; ; newSupply += step) {
        const utilization = borrow / newSupply
        const interestRate = interestRateFunction(newSupply, borrow) * utilization
        if(supplyFunction(interestRate) < newSupply) {
            return newSupply - step
        }
    }
}

function findNewBorrow(supply:number, borrow:number, step:number, interestRateFunction:Function, borrowFunction:Function) {
    for(let newBorrow = borrow ; ; newBorrow += step) {
        const interestRate = interestRateFunction(supply, newBorrow)
        if(borrowFunction(interestRate) < newBorrow) {
            return newBorrow - step
        }
        if(newBorrow >= supply) {
            return newBorrow - step;
        }
    }
}


let initialSupplyRate = 0;
let initialBorrowRate = 0;
function findInitialBorrow(initialSupply:number, stepSize:number, supplyFunction:Function, borrowFunction:Function) {
    // find supply interest rate
    let supplyInterestRate = 0
    while(supplyFunction(supplyInterestRate) < initialSupply) {
        supplyInterestRate += stepSize
    }
    initialSupplyRate = Number(supplyInterestRate.toFixed(2))
    // console.log({supplyInterestRate})
    let borrow = 0
    while(true) {
        const borrowRate = borrow * supplyInterestRate / initialSupply
        initialBorrowRate = Number(borrowRate.toFixed(2))
        const borrowDemandResult = borrowFunction(borrowRate)
        
        if(borrowDemandResult < borrow) break
        if(borrowDemandResult >= initialSupply){
            initialBorrowRate = Number((initialSupply * supplyInterestRate / initialSupply).toFixed(2))
            return initialSupply
        } 

        // console.log({borrowRate}, {borrow})

        borrow += stepSize
    }

    return borrow
}

export type SimulatedResults = {
    util:number,
    supply:number,
    supplyApy:number,
    borrow:number,
    borrowApy:number
}

export type StepsResults = {
    round: number,
    axis: number,
    type: string,
    value: number,
    apy: number,
    util: number
}

export function simulate(initialSupply:number, stepSize:number, minChange:number, interestRateFormula:string, supplyFormula:string, borrowFormula:string) : StepsResults[] {
    const interestRateFct = new Function('supply', 'borrow', `return ${interestRateFormula}`);
    const supplyFct = new Function('interestRate', `return ${supplyFormula}`);
    const borrowFct = new Function('interestRate', `return ${borrowFormula}`);
    
    return simulateWithFct(initialSupply, stepSize, minChange, interestRateFct, supplyFct, borrowFct);
}

export function simulateWithFct(initialSupply:number, stepSize:number, minChange:number, interestRateFunction:Function, supplyFunction:Function, borrowFunction:Function) : StepsResults[] {
    let currentSupply = initialSupply
    let currentBorrow = findInitialBorrow(initialSupply, stepSize, supplyFunction, borrowFunction)
    let firstIteration = true;
    let round = 0;
    const results: StepsResults[] = [{
        round: round,
        axis: 0,
        type: "Supply",
        value: initialSupply,
        apy: initialSupplyRate,
        util: 0
    }];
    round += 1
    results.push({
        round: round,
        axis: 1,
        type: "Borrow",
        value: Number(currentBorrow.toFixed(2)),
        apy: initialBorrowRate,
        util: 0
    })

    // console.log("initial borrow", currentBorrow)

    while(true) {
        const newSupply = findNewSupply(currentSupply, currentBorrow, stepSize, interestRateFunction, supplyFunction)
        const newBorrow = findNewBorrow(newSupply, currentBorrow, stepSize, interestRateFunction, borrowFunction)        

        if(newSupply / currentSupply < (1 + minChange)) {
            if(firstIteration){
            const util = currentBorrow / currentSupply
            const supplyApy = interestRateFunction(currentSupply, currentBorrow) * util
            const borrowApy = interestRateFunction(currentSupply, currentBorrow)
            results.push({
                round: round,
                axis: 0,
                type: "Supply",
                value: Number(currentSupply.toFixed(2)),
                apy: Number(supplyApy.toFixed(2)),
                util: Number(util.toFixed(2))
            })
            round += 1
            results.push({
                round: round,
                axis: 1,
                type: "Borrow",
                value: Number(currentBorrow.toFixed(2)),
                apy: Number(borrowApy.toFixed(2)),
                util: Number(util.toFixed(2))
            })
        }
            break
        }

        currentSupply = newSupply
        currentBorrow = newBorrow

        const util = currentBorrow / currentSupply
        const supplyApy = interestRateFunction(currentSupply, currentBorrow) * util
        const borrowApy = interestRateFunction(currentSupply, currentBorrow)
        round += 1
        results.push({
            round: round,
            axis: 0,
            type: "Supply",
            value: Number(currentSupply.toFixed(2)),
            apy: Number(supplyApy.toFixed(2)),
            util: Number(util.toFixed(2))
        })
        round += 1
        results.push({
            round: round,
            axis: 1,
            type: "Borrow",
            value: Number(currentBorrow.toFixed(2)),
            apy: Number(borrowApy.toFixed(2)),
            util: Number(util.toFixed(2))
        })
        

        // console.log({currentSupply}, {supplyApy}, {currentBorrow}, {borrowApy})
        firstIteration = false;
    }
    return results;
}

function findSupplyAccordingToInterestRate(initialSupply:number, stepSize:number, supplyFunction:Function, borrowInterestRate:number, borrowSize:number) {
    let supply = initialSupply
    while(true) {
        // console.log({supply})
        // console.log({stepSize})
        let inf = borrowInterestRate * borrowSize / supply
        let variable = supplyFunction(inf)
        // console.log({variable})
        if(supply > variable) {break}
        supply += stepSize
    }

    return supply;
}


export function findOptimalInterestRate(maxInterestRate:number, stepSize:number, supplyFormula: string, borrowFormula: string) {
    const supplyFct = new Function('interestRate', `return ${supplyFormula}`);
    const borrowFct = new Function('interestRate', `return ${borrowFormula}`);
    let optimalRate = stepSize
    let optimalBorrow = 0
    let optimalSupply = 0
    for(let currentInterestRate = stepSize ; currentInterestRate < maxInterestRate ; currentInterestRate += stepSize) {
        let borrowAmount = borrowFct(currentInterestRate)
        if(borrowAmount < 0) continue
        const supply = findSupplyAccordingToInterestRate(0, stepSize, supplyFct, currentInterestRate, borrowAmount)
        //console.log({borrowAmount},{supply},{currentInterestRate})
        if(supply < borrowAmount) borrowAmount = supply

        if(optimalBorrow * optimalRate < borrowAmount * currentInterestRate) {
            // new optimum
            optimalRate = currentInterestRate
            optimalBorrow = borrowAmount
            optimalSupply = supply
        }
    }

    const utilization = optimalBorrow / optimalSupply
    return {optimalRate, optimalBorrow, optimalSupply, utilization}
}
// simulate(1, 0.001, 0.0001, '70 * borrow / supply', '6 * interestRate', '100 - 5 * interestRate')
// console.log(findOptimalInterestRate(100, 0.01,'6 * interestRate', '100 - 5 * interestRate'))