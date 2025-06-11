/**
 * Raise Calculation Engine
 * 
 * Handles salary raise calculations with country-specific constraints,
 * performance-based recommendations, and approval workflows.
 */

// Country-specific raise constraints and rules
const COUNTRY_CONSTRAINTS = {
    'US': {
        maxRaise: 0.12, // 12% maximum without VP approval
        vpApprovalThreshold: 0.12,
        typicalRange: { min: 0.03, max: 0.08 },
        currency: 'USD',
        budgetCycle: 'annual'
    },
    'India': {
        maxRaise: 0.50, // 50% maximum
        vpApprovalThreshold: 0.25, // VP approval for raises > 25%
        typicalRange: { min: 0.10, max: 0.20 },
        currency: 'INR',
        budgetCycle: 'annual'
    },
    'UK': {
        maxRaise: 0.15, // 15% maximum
        vpApprovalThreshold: 0.12,
        typicalRange: { min: 0.03, max: 0.10 },
        currency: 'GBP',
        budgetCycle: 'annual'
    },
    'Canada': {
        maxRaise: 0.12, // 12% maximum
        vpApprovalThreshold: 0.10,
        typicalRange: { min: 0.03, max: 0.08 },
        currency: 'CAD',
        budgetCycle: 'annual'
    },
    'Germany': {
        maxRaise: 0.10, // 10% maximum
        vpApprovalThreshold: 0.08,
        typicalRange: { min: 0.02, max: 0.06 },
        currency: 'EUR',
        budgetCycle: 'annual'
    }
};

// Performance-based raise multipliers
const PERFORMANCE_MULTIPLIERS = {
    1: 0.5,   // Below expectations - 50% of typical raise
    2: 0.75,  // Meets some expectations - 75% of typical raise
    3: 1.0,   // Meets expectations - 100% of typical raise
    4: 1.3,   // Exceeds expectations - 130% of typical raise
    5: 1.6    // Far exceeds expectations - 160% of typical raise
};

// Risk factors that affect raise recommendations
const RISK_FACTORS = {
    'flight_risk': 1.2,     // 20% increase for flight risk employees
    'promotion_ready': 1.15, // 15% increase for promotion-ready employees
    'new_hire': 0.8,        // 20% decrease for employees < 1 year
    'recent_raise': 0.7     // 30% decrease for employees with recent raises
};

/**
 * Calculate recommended raise percentage based on performance and constraints
 */
function calculateRecommendedRaise(employee, countryConstraints) {
    const { performance, country, tenure, riskIndicators } = employee;
    
    // Start with typical range midpoint for the country
    const baseRaise = (countryConstraints.typicalRange.min + countryConstraints.typicalRange.max) / 2;
    
    // Apply performance multiplier
    const performanceMultiplier = PERFORMANCE_MULTIPLIERS[performance] || 1.0;
    let recommendedRaise = baseRaise * performanceMultiplier;
    
    // Apply risk factor adjustments
    if (riskIndicators) {
        riskIndicators.forEach(risk => {
            const multiplier = RISK_FACTORS[risk];
            if (multiplier) {
                recommendedRaise *= multiplier;
            }
        });
    }
    
    // Ensure within country constraints
    recommendedRaise = Math.min(recommendedRaise, countryConstraints.maxRaise);
    recommendedRaise = Math.max(recommendedRaise, 0); // No negative raises
    
    return {
        percentage: recommendedRaise,
        baseRaise,
        performanceMultiplier,
        appliedRiskFactors: riskIndicators || [],
        withinConstraints: recommendedRaise <= countryConstraints.maxRaise,
        requiresApproval: recommendedRaise > countryConstraints.vpApprovalThreshold
    };
}

/**
 * Calculate new salary and total cost impact
 */
function calculateSalaryImpact(currentSalary, raisePercentage, currency = 'USD') {
    const raiseAmount = currentSalary * raisePercentage;
    const newSalary = currentSalary + raiseAmount;
    
    // Estimate total cost including benefits (typically 1.3x salary)
    const benefitsMultiplier = 1.3;
    const currentTotalCost = currentSalary * benefitsMultiplier;
    const newTotalCost = newSalary * benefitsMultiplier;
    const totalCostIncrease = newTotalCost - currentTotalCost;
    
    return {
        currentSalary,
        raiseAmount,
        newSalary,
        raisePercentage,
        currentTotalCost,
        newTotalCost,
        totalCostIncrease,
        currency
    };
}

/**
 * Validate raise against country constraints
 */
function validateRaise(employee, raisePercentage) {
    const country = employee.country || 'US';
    const constraints = COUNTRY_CONSTRAINTS[country] || COUNTRY_CONSTRAINTS['US'];
    
    const validation = {
        isValid: true,
        warnings: [],
        errors: [],
        requiresApproval: false
    };
    
    // Check maximum raise constraint
    if (raisePercentage > constraints.maxRaise) {
        validation.isValid = false;
        validation.errors.push(
            `Raise of ${(raisePercentage * 100).toFixed(1)}% exceeds maximum of ${(constraints.maxRaise * 100).toFixed(1)}% for ${country}`
        );
    }
    
    // Check if VP approval is required
    if (raisePercentage > constraints.vpApprovalThreshold) {
        validation.requiresApproval = true;
        validation.warnings.push(
            `Raise of ${(raisePercentage * 100).toFixed(1)}% requires VP approval (threshold: ${(constraints.vpApprovalThreshold * 100).toFixed(1)}%)`
        );
    }
    
    // Check if raise is unusually low
    if (raisePercentage < constraints.typicalRange.min * 0.5) {
        validation.warnings.push(
            `Raise of ${(raisePercentage * 100).toFixed(1)}% is unusually low for ${country} (typical range: ${(constraints.typicalRange.min * 100).toFixed(1)}%-${(constraints.typicalRange.max * 100).toFixed(1)}%)`
        );
    }
    
    // Check if raise is unusually high (but within max)
    if (raisePercentage > constraints.typicalRange.max * 1.5 && raisePercentage <= constraints.maxRaise) {
        validation.warnings.push(
            `Raise of ${(raisePercentage * 100).toFixed(1)}% is unusually high for ${country} (typical range: ${(constraints.typicalRange.min * 100).toFixed(1)}%-${(constraints.typicalRange.max * 100).toFixed(1)}%)`
        );
    }
    
    return validation;
}

/**
 * Calculate raises for a team with budget constraints
 */
function calculateTeamRaises(employees, budgetConstraints = {}) {
    const results = {
        employees: [],
        totalCurrentCost: 0,
        totalNewCost: 0,
        totalBudgetIncrease: 0,
        budgetUtilization: 0,
        approvalRequired: [],
        budgetExceeded: false,
        recommendations: []
    };
    
    // Calculate individual raises
    employees.forEach(employee => {
        const country = employee.country || 'US';
        const constraints = COUNTRY_CONSTRAINTS[country] || COUNTRY_CONSTRAINTS['US'];
        
        // Get recommended raise
        const recommendation = calculateRecommendedRaise(employee, constraints);
        
        // Calculate salary impact
        const impact = calculateSalaryImpact(
            employee.currentSalary,
            recommendation.percentage,
            employee.currency
        );
        
        // Validate raise
        const validation = validateRaise(employee, recommendation.percentage);
        
        const employeeResult = {
            ...employee,
            recommendation,
            impact,
            validation,
            constraints
        };
        
        results.employees.push(employeeResult);
        results.totalCurrentCost += impact.currentTotalCost;
        results.totalNewCost += impact.newTotalCost;
        
        if (validation.requiresApproval) {
            results.approvalRequired.push(employeeResult);
        }
    });
    
    results.totalBudgetIncrease = results.totalNewCost - results.totalCurrentCost;
    
    // Check budget constraints
    if (budgetConstraints.maxIncrease) {
        results.budgetUtilization = results.totalBudgetIncrease / budgetConstraints.maxIncrease;
        results.budgetExceeded = results.totalBudgetIncrease > budgetConstraints.maxIncrease;
        
        if (results.budgetExceeded) {
            results.recommendations.push({
                type: 'budget_exceeded',
                message: `Total budget increase of ${results.totalBudgetIncrease.toLocaleString()} exceeds maximum of ${budgetConstraints.maxIncrease.toLocaleString()}`,
                severity: 'error'
            });
        }
    }
    
    // Add recommendations for optimization
    if (results.budgetUtilization > 0.9) {
        results.recommendations.push({
            type: 'budget_warning',
            message: `Budget utilization is ${(results.budgetUtilization * 100).toFixed(1)}% - consider reviewing high raises`,
            severity: 'warning'
        });
    }
    
    return results;
}

/**
 * Generate raise scenarios for budget planning
 */
function generateRaiseScenarios(employees, budgetAmount) {
    const scenarios = {
        conservative: { multiplier: 0.8, name: 'Conservative (80% of recommended)' },
        recommended: { multiplier: 1.0, name: 'Recommended (100% of recommended)' },
        aggressive: { multiplier: 1.2, name: 'Aggressive (120% of recommended)' }
    };
    
    const results = {};
    
    Object.entries(scenarios).forEach(([key, scenario]) => {
        const adjustedEmployees = employees.map(emp => ({
            ...emp,
            adjustedRaise: true,
            raiseMultiplier: scenario.multiplier
        }));
        
        const calculation = calculateTeamRaises(adjustedEmployees, { maxIncrease: budgetAmount });
        
        // Apply scenario multiplier to recommendations
        calculation.employees.forEach(emp => {
            emp.recommendation.percentage *= scenario.multiplier;
            emp.impact = calculateSalaryImpact(
                emp.currentSalary,
                emp.recommendation.percentage,
                emp.currency
            );
        });
        
        // Recalculate totals
        calculation.totalCurrentCost = calculation.employees.reduce((sum, emp) => sum + emp.impact.currentTotalCost, 0);
        calculation.totalNewCost = calculation.employees.reduce((sum, emp) => sum + emp.impact.newTotalCost, 0);
        calculation.totalBudgetIncrease = calculation.totalNewCost - calculation.totalCurrentCost;
        calculation.budgetUtilization = calculation.totalBudgetIncrease / budgetAmount;
        
        results[key] = {
            ...scenario,
            ...calculation
        };
    });
    
    return results;
}

/**
 * Export the raise calculator functions
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        COUNTRY_CONSTRAINTS,
        PERFORMANCE_MULTIPLIERS,
        RISK_FACTORS,
        calculateRecommendedRaise,
        calculateSalaryImpact,
        validateRaise,
        calculateTeamRaises,
        generateRaiseScenarios
    };
} else {
    // Make functions available globally
    window.COUNTRY_CONSTRAINTS = COUNTRY_CONSTRAINTS;
    window.PERFORMANCE_MULTIPLIERS = PERFORMANCE_MULTIPLIERS;
    window.RISK_FACTORS = RISK_FACTORS;
    window.calculateRecommendedRaise = calculateRecommendedRaise;
    window.calculateSalaryImpact = calculateSalaryImpact;
    window.validateRaise = validateRaise;
    window.calculateTeamRaises = calculateTeamRaises;
    window.generateRaiseScenarios = generateRaiseScenarios;
} 