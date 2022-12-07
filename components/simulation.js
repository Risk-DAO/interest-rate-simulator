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
    //return 2 * 1.09544512 * borrow / supply    
    return 70 * borrow / supply
}

//////////////////////////////////////////////////////////////////////////////////////////


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

function findInitialBorrow(initialSupply, stepSize, supplyDemandFunction, borrowDemandFunction) {
    // find supply interest rate
    let supplyInterestRate = 0
    while(supplyDemandFunction(supplyInterestRate) < initialSupply) {
        supplyInterestRate += stepSize
    }

    console.log({supplyInterestRate})
    let borrow = 0
    while(true) {
        const borrowRate = borrow * supplyInterestRate / initialSupply
        const borrowDemand = borrowDemandFunction(borrowRate)

        if(borrowDemand < borrow) break
        if(borrowDemand >= initialSupply) return initialSupply

        console.log({borrowRate}, {borrow})

        borrow += stepSize
    }

    return borrow
}

function simulate(initialSupply, stepSize, minChange, interestRateFunction, supplyDemandFunction, borrowDemandFunction) {
    let currentSupply = initialSupply
    let currentBorrow = findInitialBorrow(initialSupply, stepSize, supplyDemandFunction, borrowDemandFunction)

    console.log("initial borrow", currentBorrow)

    while(true) {
        const newSupply = findNewSupply(currentSupply, currentBorrow, stepSize, interestRateFunction, supplyDemandFunction)
        const newBorrow = findNewBorrow(newSupply, currentBorrow, stepSize, interestRateFunction, borrowDemandFunction)        

        if(newSupply / currentSupply < (1 + minChange)) break

        currentSupply = newSupply
        currentBorrow = newBorrow

        const util = currentBorrow / currentSupply
        const supplyApy = interestRateFunction(currentSupply, currentBorrow) * util
        const borrowApy = interestRateFunction(currentSupply, currentBorrow)

        console.log({currentSupply}, {supplyApy}, {currentBorrow}, {borrowApy})
    }
}
simulate(1, 0.001, 0.0001, protocolInterestRate, supplyDemand, borrowDemand)


export default simulate();