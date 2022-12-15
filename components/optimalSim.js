function findSupplyAccordingToInterestRate(initialSupply, stepSize, supplyDemandFunction, borrowInterestRate, borrowSize) {
    let supply = initialSupply
    while(true) {
        if(supply > supplyDemandFunction(borrowInterestRate * borrowSize / supply)) break
        supply += stepSize

    }

    return supply;
}


function findOptimalInterestRate(maxInterestRate, stepSize, supplyDemandFunction, borrowDemandFunction) {
    let optimalRate = stepSize
    let optimalBorrow = 0
    let optimalSupply = 0
    for(let currentInterestRate = stepSize ; currentInterestRate < maxInterestRate ; currentInterestRate += stepSize) {
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

//simulate(1, 0.001, 0.0001, protocolInterestRate, supplyDemand, borrowDemand)
console.log(findOptimalInterestRate(100, 0.001, supplyDemand, borrowDemand))