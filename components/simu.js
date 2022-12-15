const initialSupply = 1
const stepSize = 0.0001
const minChange = 0.001

const borrowDemand = function(interestRate) {
    return 100 - 5 * interestRate
}

const supplyDemand = function(interestRate) {
    return 6 * interestRate
}

const protocolInterestRate = function(supply, borrow) { 
    return 70 * borrow / supply
}

//////////////////////////////////////////////////////////////////////////////////////////
borrowFormula = '100 - 5 * interestRate'
supplyFormula = '6 * interestRate'

function findNewSupply(supply, borrow, step, interestRateFunction, supplyDemandFunction) {
    for(let newSupply = supply ; ; newSupply += step) {
        const utilization = borrow / newSupply
        const interstRate = interestRateFunction(newSupply, borrow) * utilization
        if(supplyDemandFunction(interstRate) < newSupply) {
            return newSupply - step
        }
    }
}

function findNewBorrow(supply, borrow, step, interestRateFunction, borrowDemandFunction) {
    for(let newBorrow = borrow ; ; newBorrow += step) {
        const interestRate = interestRateFunction(supply, newBorrow)
        if(borrowDemandFunction(interestRate) < newBorrow) {
            return newBorrow - step
        }
        if(newBorrow >= supply) {
            return newBorrow - step;
        }
    }
}

let initialSupplyRate = undefined;
let initialBorrowRate = undefined;
function findInitialBorrow(initialSupply, stepSize, supplyDemandFunction, borrowDemandFunction) {
    // find supply interest rate
    let supplyInterestRate = 0
    while(supplyDemandFunction(supplyInterestRate) < initialSupply) {
        supplyInterestRate += stepSize
    }
    initialSupplyRate = supplyInterestRate
    console.log({supplyInterestRate})
    let borrow = 0
    while(true) {
        const borrowRate = borrow * supplyInterestRate / initialSupply
        initialBorrowRate = borrowRate
        const borrowDemand = borrowDemandFunction(borrowRate)

        if(borrowDemand < borrow) break
        if(borrowDemand >= initialSupply) return initialSupply

        console.log({borrowRate}, {borrow})

        borrow += stepSize
    }

    return borrow
}

function simulate(initialSupply, stepSize, minChage, interestRateFunction, supplyDemandFunction, borrowDemandFunction) {
    let currentSupply = initialSupply
    let currentBorrow = findInitialBorrow(initialSupply, stepSize, supplyDemandFunction, borrowDemandFunction)

    console.log("initial borrow", currentBorrow)

    while(true) {
        const newSupply = findNewSupply(currentSupply, currentBorrow, stepSize, interestRateFunction, supplyDemandFunction)
        const newBorrow = findNewBorrow(newSupply, currentBorrow, stepSize, interestRateFunction, borrowDemandFunction)        

        if(newSupply / currentSupply < (1 + minChage)) break

        currentSupply = newSupply
        currentBorrow = newBorrow

        const util = currentBorrow / currentSupply
        const supplyApy = interestRateFunction(currentSupply, currentBorrow) * util
        const borrowApy = interestRateFunction(currentSupply, currentBorrow)

        console.log({initialBorrowRate})
        console.log({currentSupply}, {supplyApy}, {currentBorrow}, {borrowApy})
    }
}


function findSupplyAccordingToInterestRate(initialSupply, stepSize, supplyDemandFunction, borrowInterestRate, borrowSize) {
    let supply = initialSupply
    while(true) {
        if(supply > supplyDemandFunction(borrowInterestRate * borrowSize / supply)) break
        supply += stepSize

    }

    return supply;
}


function findOptimalInterestRate(maxInteresrRate, stepSize, supplyDemandFunction, borrowDemandFunction) {
    let optimalRate = stepSize
    let optimalBorrow = 0
    let optimalSupply = 0
    for(let currentInterestRate = stepSize ; currentInterestRate < maxInteresrRate ; currentInterestRate += stepSize) {
        let borrowAmount = borrowDemandFunction(currentInterestRate)
        if(borrowAmount < 0) continue
        const supply = findSupplyAccordingToInterestRate(0, stepSize, supplyDemandFunction, currentInterestRate, borrowAmount)
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

// simulate(1, 0.001, 0.0001, protocolInterestRate, supplyDemand, borrowDemand)
console.log(findOptimalInterestRate(100, 0.001, supplyDemand, borrowDemand))