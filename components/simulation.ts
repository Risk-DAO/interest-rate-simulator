import os from "os"

console.log(os.hostname)
function borrowDemand(borrowFormula:string, interestRate:number) {
    // console.log({borrowFormula}, {interestRate})  
    return eval(borrowFormula)
}
function supplyDemand(supplyFormula:string, interestRate:number) {
    // console.log({supplyFormula}, {interestRate})
    return eval(supplyFormula)
}

function protocolInterestRate(interestRateFormula:string, supply:number, borrow:number) {
    // console.log({interestRateFormula}, {supply}, {borrow})
    return eval(interestRateFormula)
}

//////////////////////////////////////////////////////////////////////////////////////////


function findNewSupply(supply:number, borrow:number, step:number, interestRateFormula:string, supplyFormula:string) {
    for(let newSupply = supply ; ; newSupply += step) {
        const utilization = borrow / newSupply
        const interestRate = protocolInterestRate(interestRateFormula, newSupply, borrow) * utilization
        if(supplyDemand(supplyFormula, interestRate) < newSupply) {
            return newSupply - step
        }
    }
}

function findNewBorrow(supply:number, borrow:number, step:number, interestRateFormula:string, borrowFormula:string) {
    for(let newBorrow = borrow ; ; newBorrow += step) {
        const interestRate = protocolInterestRate(interestRateFormula, supply, newBorrow)
        if(borrowDemand(borrowFormula, interestRate) < newBorrow) {
            return newBorrow - step
        }
        if(newBorrow >= supply) {
            return newBorrow - step;
        }
    }
}


let initialSupplyRate = 0;
let initialBorrowRate = 0;
function findInitialBorrow(initialSupply:number, stepSize:number, supplyFormula:string, borrowFormula:string) {
    // find supply interest rate
    let supplyInterestRate = 0
    while(supplyDemand(supplyFormula, supplyInterestRate) < initialSupply) {
        supplyInterestRate += stepSize
    }
    initialSupplyRate = Number(supplyInterestRate.toFixed(2))
    // console.log({supplyInterestRate})
    let borrow = 0
    while(true) {
        const borrowRate = borrow * supplyInterestRate / initialSupply
        initialBorrowRate = Number(borrowRate.toFixed(2))
        const borrowDemandResult = borrowDemand(borrowFormula, borrowRate)
        
        if(borrowDemandResult < borrow) break
        if(borrowDemandResult >= initialSupply) return initialSupply

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
    apy: number
}

export function simulateSteps(initialSupply:number, stepSize:number, minChange:number, interestRateFormula:string, supplyFormula:string, borrowFormula:string) : StepsResults[] {
    let currentSupply = initialSupply
    let newSupply = initialSupply;
    let currentBorrow = findInitialBorrow(initialSupply, stepSize, supplyFormula, borrowFormula)
    let computing = true;
    let supply = false;
    let round = 0;
    let failsafe = 0
    const results: StepsResults[] = [{
        round: round,
        axis: 0,
        type: "Supply",
        value: initialSupply,
        apy: Number((protocolInterestRate(interestRateFormula, currentSupply, currentBorrow) * (currentBorrow / currentSupply)).toFixed(3))
    }];


    while(computing){
        failsafe += 1
        round += 1
        if(supply){
            currentSupply = newSupply
            newSupply = findNewSupply(currentSupply, currentBorrow, stepSize, interestRateFormula, supplyFormula);
            results.push({
                round: round,
                axis: 0,
                type: "Supply",
                value: Number(newSupply.toFixed(3)),
                apy: Number((protocolInterestRate(interestRateFormula, currentSupply, currentBorrow) * (currentBorrow / newSupply)).toFixed(3))
            })
            supply = !supply
            if(newSupply / currentSupply < (1 + minChange)){
                computing = false
            }
        }
        else if(!supply){
            currentBorrow = findNewBorrow(newSupply, currentBorrow, stepSize, interestRateFormula, borrowFormula);
            results.push({
                round: round,
                axis: 1,
                type: "Borrow",
                value: Number(currentBorrow.toFixed(3)),
                apy: Number((protocolInterestRate(interestRateFormula, currentSupply, currentBorrow)).toFixed(3))
            })
            supply = !supply
        }
        if(failsafe > 300){
            break
        }
    }
    return results
}

export function simulate(initialSupply:number, stepSize:number, minChange:number, interestRateFormula:string, supplyFormula:string, borrowFormula:string) : StepsResults[] {
    let currentSupply = initialSupply
    let currentBorrow = findInitialBorrow(initialSupply, stepSize, supplyFormula, borrowFormula)
    let firstIteration = true;
    let round = 0;
    const results: StepsResults[] = [{
        round: round,
        axis: 0,
        type: "Supply",
        value: initialSupply,
        apy: initialSupplyRate,
    }];
    round += 1
    results.push({
        round: round,
        axis: 1,
        type: "Borrow",
        value: Number(currentBorrow.toFixed(2)),
        apy: initialBorrowRate,
    })

    // console.log("initial borrow", currentBorrow)

    while(true) {
        const newSupply = findNewSupply(currentSupply, currentBorrow, stepSize, interestRateFormula, supplyFormula)
        const newBorrow = findNewBorrow(newSupply, currentBorrow, stepSize, interestRateFormula, borrowFormula)        

        if(newSupply / currentSupply < (1 + minChange)) {
            if(firstIteration){
            const util = currentBorrow / currentSupply
            const supplyApy = protocolInterestRate(interestRateFormula, currentSupply, currentBorrow) * util
            const borrowApy = protocolInterestRate(interestRateFormula, currentSupply, currentBorrow)
            results.push({
                round: round,
                axis: 0,
                type: "Supply",
                value: Number(currentSupply.toFixed(2)),
                apy: Number(supplyApy.toFixed(2))
            })
            round += 1
            results.push({
                round: round,
                axis: 1,
                type: "Borrow",
                value: Number(currentBorrow.toFixed(2)),
                apy: Number(borrowApy.toFixed(2)),
            })
        }
            break
        }

        currentSupply = newSupply
        currentBorrow = newBorrow

        const util = currentBorrow / currentSupply
        const supplyApy = protocolInterestRate(interestRateFormula, currentSupply, currentBorrow) * util
        const borrowApy = protocolInterestRate(interestRateFormula,currentSupply, currentBorrow)
        round += 1
        results.push({
            round: round,
            axis: 0,
            type: "Supply",
            value: Number(currentSupply.toFixed(2)),
            apy: Number(supplyApy.toFixed(2))
        })
        round += 1
        results.push({
            round: round,
            axis: 1,
            type: "Borrow",
            value: Number(currentBorrow.toFixed(2)),
            apy: Number(borrowApy.toFixed(2)),
        })
        

        // console.log({currentSupply}, {supplyApy}, {currentBorrow}, {borrowApy})
        firstIteration = false;
    }
    return results;
}

// simulate(1, 0.001, 0.0001, '70 * borrow / supply', '6 * interestRate', '100 - 5 * interestRate')