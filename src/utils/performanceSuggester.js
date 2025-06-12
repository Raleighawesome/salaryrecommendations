/**
 * Performance Rating Suggester
 * 
 * Provides intelligent suggestions for missing performance ratings
 * based on salary, comparatio, tenure, and other available data.
 */

class PerformanceSuggester {
    constructor() {
        this.suggestions = [];
        this.suggestionHistory = [];
    }

    /**
     * Generate performance rating suggestions for employees with missing ratings
     * @param {Array} employees - Array of employee objects
     * @returns {Object} Suggestion results
     */
    generateSuggestions(employees) {
        this.suggestions = [];
        const employeesNeedingSuggestions = employees.filter(emp => !emp.performanceRating);
        
        if (employeesNeedingSuggestions.length === 0) {
            return {
                suggestions: [],
                totalSuggestions: 0,
                message: 'All employees have performance ratings'
            };
        }

        // Analyze existing performance data to establish baselines
        const performanceBaseline = this.analyzePerformanceBaseline(employees);
        
        // Generate suggestions for each employee
        for (const employee of employeesNeedingSuggestions) {
            const suggestion = this.suggestPerformanceRating(employee, employees, performanceBaseline);
            if (suggestion) {
                this.suggestions.push(suggestion);
            }
        }

        return {
            suggestions: this.suggestions,
            totalSuggestions: this.suggestions.length,
            baseline: performanceBaseline,
            message: `Generated ${this.suggestions.length} performance rating suggestions`
        };
    }

    /**
     * Analyze existing performance data to establish baselines
     * @param {Array} employees - Array of all employees
     * @returns {Object} Performance baseline data
     */
    analyzePerformanceBaseline(employees) {
        const employeesWithRatings = employees.filter(emp => emp.performanceRating);
        
        if (employeesWithRatings.length === 0) {
            return this.getDefaultBaseline();
        }

        const ratings = employeesWithRatings.map(emp => emp.performanceRating.numeric);
        const comparatios = employeesWithRatings.map(emp => emp.comparatio).filter(c => c !== null);
        const salaries = employeesWithRatings.map(emp => emp.salary?.amount).filter(s => s > 0);

        // Calculate statistics
        const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
        const avgComparatio = comparatios.length > 0 ? 
            comparatios.reduce((sum, c) => sum + c, 0) / comparatios.length : 1.0;
        const avgSalary = salaries.length > 0 ?
            salaries.reduce((sum, s) => sum + s, 0) / salaries.length : 75000;

        // Analyze correlations
        const correlations = this.analyzeCorrelations(employeesWithRatings);

        return {
            averageRating: avgRating,
            averageComparatio: avgComparatio,
            averageSalary: avgSalary,
            ratingDistribution: this.calculateRatingDistribution(ratings),
            correlations: correlations,
            sampleSize: employeesWithRatings.length
        };
    }

    /**
     * Get default baseline when no performance data exists
     * @returns {Object} Default baseline
     */
    getDefaultBaseline() {
        return {
            averageRating: 3.0,
            averageComparatio: 1.0,
            averageSalary: 75000,
            ratingDistribution: {
                1: 0.05, 2: 0.15, 3: 0.60, 4: 0.15, 5: 0.05
            },
            correlations: {
                salaryToRating: 0.3,
                comparatioToRating: 0.4,
                tenureToRating: 0.2
            },
            sampleSize: 0
        };
    }

    /**
     * Calculate rating distribution
     * @param {Array} ratings - Array of numeric ratings
     * @returns {Object} Distribution by rating level
     */
    calculateRatingDistribution(ratings) {
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        
        for (const rating of ratings) {
            const rounded = Math.round(rating);
            if (rounded >= 1 && rounded <= 5) {
                distribution[rounded]++;
            }
        }

        // Convert to percentages
        const total = ratings.length;
        for (const key in distribution) {
            distribution[key] = distribution[key] / total;
        }

        return distribution;
    }

    /**
     * Analyze correlations between performance and other factors
     * @param {Array} employees - Employees with performance ratings
     * @returns {Object} Correlation analysis
     */
    analyzeCorrelations(employees) {
        const correlations = {
            salaryToRating: 0,
            comparatioToRating: 0,
            tenureToRating: 0
        };

        if (employees.length < 3) {
            return correlations; // Not enough data for meaningful correlation
        }

        // Calculate salary-to-rating correlation
        const salaryRatingPairs = employees
            .filter(emp => emp.salary?.amount > 0)
            .map(emp => [emp.salary.amount, emp.performanceRating.numeric]);
        
        if (salaryRatingPairs.length >= 3) {
            correlations.salaryToRating = this.calculateCorrelation(salaryRatingPairs);
        }

        // Calculate comparatio-to-rating correlation
        const comparatioRatingPairs = employees
            .filter(emp => emp.comparatio !== null)
            .map(emp => [emp.comparatio, emp.performanceRating.numeric]);
        
        if (comparatioRatingPairs.length >= 3) {
            correlations.comparatioToRating = this.calculateCorrelation(comparatioRatingPairs);
        }

        // Calculate tenure-to-rating correlation
        const tenureRatingPairs = employees
            .filter(emp => emp.timeInRole !== null)
            .map(emp => [emp.timeInRole, emp.performanceRating.numeric]);
        
        if (tenureRatingPairs.length >= 3) {
            correlations.tenureToRating = this.calculateCorrelation(tenureRatingPairs);
        }

        return correlations;
    }

    /**
     * Calculate Pearson correlation coefficient
     * @param {Array} pairs - Array of [x, y] pairs
     * @returns {number} Correlation coefficient (-1 to 1)
     */
    calculateCorrelation(pairs) {
        const n = pairs.length;
        if (n < 2) return 0;

        const sumX = pairs.reduce((sum, pair) => sum + pair[0], 0);
        const sumY = pairs.reduce((sum, pair) => sum + pair[1], 0);
        const sumXY = pairs.reduce((sum, pair) => sum + pair[0] * pair[1], 0);
        const sumX2 = pairs.reduce((sum, pair) => sum + pair[0] * pair[0], 0);
        const sumY2 = pairs.reduce((sum, pair) => sum + pair[1] * pair[1], 0);

        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

        return denominator === 0 ? 0 : numerator / denominator;
    }

    /**
     * Suggest performance rating for a specific employee
     * @param {Object} employee - Employee needing suggestion
     * @param {Array} allEmployees - All employees for comparison
     * @param {Object} baseline - Performance baseline data
     * @returns {Object} Performance suggestion
     */
    suggestPerformanceRating(employee, allEmployees, baseline) {
        const factors = this.analyzeEmployeeFactors(employee, allEmployees, baseline);
        const suggestedRating = this.calculateSuggestedRating(factors, baseline);
        const confidence = this.calculateSuggestionConfidence(factors, baseline);

        return {
            employeeId: employee.id,
            employeeName: employee.name,
            employee: employee, // Include full employee object
            suggestedRating: {
                numeric: suggestedRating,
                text: this.getPerformanceText(suggestedRating),
                confidence: confidence
            },
            factors: factors,
            reasoning: this.generateReasoning(factors, suggestedRating),
            alternatives: this.generateAlternatives(suggestedRating, factors),
            isEditable: true,
            suggestedAt: new Date().toISOString()
        };
    }

    /**
     * Analyze factors that influence performance rating suggestion
     * @param {Object} employee - Employee to analyze
     * @param {Array} allEmployees - All employees for comparison
     * @param {Object} baseline - Performance baseline
     * @returns {Object} Factor analysis
     */
    analyzeEmployeeFactors(employee, allEmployees, baseline) {
        const factors = {
            salary: this.analyzeSalaryFactor(employee, allEmployees, baseline),
            comparatio: this.analyzeComparatioFactor(employee, baseline),
            tenure: this.analyzeTenureFactor(employee, baseline),
            country: this.analyzeCountryFactor(employee, allEmployees),
            title: this.analyzeTitleFactor(employee, allEmployees),
            futureTalent: employee.futureTalent || false
        };

        return factors;
    }

    /**
     * Analyze salary factor for performance suggestion
     * Calculates salary average based on employees with same title and country
     * @param {Object} employee - Employee to analyze
     * @param {Array} allEmployees - All employees for comparison
     * @param {Object} baseline - Performance baseline
     * @returns {Object} Salary factor analysis
     */
    analyzeSalaryFactor(employee, allEmployees, baseline) {
        if (!employee.salary || employee.salary.amount <= 0) {
            return { score: 0, weight: 0, reason: 'No salary data available' };
        }

        // Find employees with same title and country for more accurate comparison
        const comparablePeers = allEmployees.filter(emp => 
            emp.title === employee.title && 
            emp.country === employee.country && 
            emp.salary && 
            emp.salary.amount > 0 &&
            emp.id !== employee.id // Exclude the employee being analyzed
        );

        let averageSalary;
        let comparisonGroup;
        let sampleSize;

        if (comparablePeers.length >= 3) {
            // Use peers with same title and country (minimum 3 for statistical relevance)
            averageSalary = comparablePeers.reduce((sum, emp) => sum + emp.salary.amount, 0) / comparablePeers.length;
            comparisonGroup = `${employee.title} in ${employee.country}`;
            sampleSize = comparablePeers.length;
        } else {
            // Fallback to same title across all countries
            const sameTitlePeers = allEmployees.filter(emp => 
                emp.title === employee.title && 
                emp.salary && 
                emp.salary.amount > 0 &&
                emp.id !== employee.id
            );

            if (sameTitlePeers.length >= 2) {
                averageSalary = sameTitlePeers.reduce((sum, emp) => sum + emp.salary.amount, 0) / sameTitlePeers.length;
                comparisonGroup = `${employee.title} (all countries)`;
                sampleSize = sameTitlePeers.length;
            } else {
                // Final fallback to global average
                averageSalary = baseline.averageSalary;
                comparisonGroup = 'all employees';
                sampleSize = baseline.sampleSize || 0;
            }
        }

        const salaryRatio = employee.salary.amount / averageSalary;
        let score = 3.0; // Default to average

        // More nuanced scoring based on salary positioning
        if (salaryRatio >= 1.4) score = 4.8; // Significantly above average
        else if (salaryRatio >= 1.2) score = 4.3; // Well above average
        else if (salaryRatio >= 1.1) score = 3.8; // Above average
        else if (salaryRatio >= 0.9) score = 3.2; // At average
        else if (salaryRatio >= 0.8) score = 2.7; // Below average
        else score = 2.2; // Significantly below average

        const formattedEmployeeSalary = employee.salary.formatted || `${employee.salary.currency || 'USD'} ${employee.salary.amount.toLocaleString()}`;
        const formattedAverageSalary = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: employee.salary.currency || 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(averageSalary);

        return {
            score: score,
            weight: Math.abs(baseline.correlations.salaryToRating || 0.3) * 0.4, // Higher weight for targeted comparison
            reason: `Salary ${formattedEmployeeSalary} is ${Math.round(salaryRatio * 100)}% of average ${formattedAverageSalary} for ${comparisonGroup} (sample: ${sampleSize})`,
            salaryRatio: salaryRatio,
            averageSalary: averageSalary,
            comparisonGroup: comparisonGroup,
            sampleSize: sampleSize,
            employeeSalary: employee.salary.amount
        };
    }

    /**
     * Analyze comparatio factor for performance suggestion
     * Comparatio = Current Salary ÷ Mid Pay Grade Value
     * Used to assess if employee's performance aligns with their pay positioning
     * @param {Object} employee - Employee to analyze
     * @param {Object} baseline - Performance baseline
     * @returns {Object} Comparatio factor analysis
     */
    analyzeComparatioFactor(employee, baseline) {
        if (!employee.comparatio) {
            return { score: 0, weight: 0, reason: 'No comparatio data available' };
        }

        let score = 3.0; // Default to average
        let performanceLevel = '';
        let reason = '';

        // Updated logic based on correct comparatio interpretation
        // Higher comparatio suggests higher performance (paid above midpoint)
        // Lower comparatio may indicate underperformance or being underpaid
        
        if (employee.comparatio >= 1.2) {
            score = 4.8; // Very high performance - paid at premium
            performanceLevel = 'exceptional';
            reason = `Comparatio of ${(employee.comparatio * 100).toFixed(0)}% indicates premium pay positioning, suggesting exceptional performance`;
        } else if (employee.comparatio >= 1.1) {
            score = 4.2; // High performance - paid above midpoint
            performanceLevel = 'high';
            reason = `Comparatio of ${(employee.comparatio * 100).toFixed(0)}% indicates above-midpoint positioning, suggesting strong performance`;
        } else if (employee.comparatio >= 0.9) {
            score = 3.5; // Good performance - paid around midpoint
            performanceLevel = 'good';
            reason = `Comparatio of ${(employee.comparatio * 100).toFixed(0)}% indicates market-rate positioning, suggesting solid performance`;
        } else if (employee.comparatio >= 0.8) {
            score = 2.8; // Below average - paid below midpoint
            performanceLevel = 'developing';
            reason = `Comparatio of ${(employee.comparatio * 100).toFixed(0)}% indicates below-midpoint positioning, may suggest developing performance or underpaid status`;
        } else {
            score = 2.2; // Low - significantly below midpoint
            performanceLevel = 'needs attention';
            reason = `Comparatio of ${(employee.comparatio * 100).toFixed(0)}% indicates significantly below-market positioning, requires performance or compensation review`;
        }

        // Adjust weight based on how reliable comparatio is as a performance indicator
        // Strong correlation means higher weight
        const correlationWeight = Math.abs(baseline.correlations.comparatioToRating || 0.4);
        
        return {
            score: score,
            weight: correlationWeight * 0.5, // Comparatio is a strong indicator when correlated
            reason: reason,
            comparatio: employee.comparatio,
            performanceLevel: performanceLevel,
            comparatioPercent: (employee.comparatio * 100).toFixed(0) + '%'
        };
    }

    /**
     * Analyze tenure factor for performance suggestion
     * @param {Object} employee - Employee to analyze
     * @param {Object} baseline - Performance baseline
     * @returns {Object} Tenure factor analysis
     */
    analyzeTenureFactor(employee, baseline) {
        if (!employee.timeInRole) {
            return { score: 0, weight: 0, reason: 'No tenure data' };
        }

        let score = 3.0; // Default to average
        let reason = '';

        if (employee.timeInRole < 6) {
            score = 2.8; // Slightly below average for new employees
            reason = 'New in role (< 6 months)';
        } else if (employee.timeInRole < 12) {
            score = 3.0; // Average for employees under 1 year
            reason = 'Building experience (6-12 months)';
        } else if (employee.timeInRole < 24) {
            score = 3.2; // Slightly above average for experienced
            reason = 'Experienced in role (1-2 years)';
        } else {
            score = 3.5; // Higher for very experienced
            reason = 'Very experienced in role (2+ years)';
        }

        return {
            score: score,
            weight: Math.abs(baseline.correlations.tenureToRating) * 0.2,
            reason: reason,
            timeInRole: employee.timeInRole
        };
    }

    /**
     * Analyze country factor for performance suggestion
     * @param {Object} employee - Employee to analyze
     * @param {Array} allEmployees - All employees for comparison
     * @returns {Object} Country factor analysis
     */
    analyzeCountryFactor(employee, allEmployees) {
        const countryEmployees = allEmployees.filter(emp => 
            emp.country === employee.country && emp.performanceRating
        );

        if (countryEmployees.length === 0) {
            return { score: 0, weight: 0, reason: 'No country performance data' };
        }

        const avgCountryRating = countryEmployees.reduce((sum, emp) => 
            sum + emp.performanceRating.numeric, 0) / countryEmployees.length;

        return {
            score: avgCountryRating,
            weight: 0.1,
            reason: `Average performance in ${employee.country} is ${avgCountryRating.toFixed(1)}`,
            countryAverage: avgCountryRating,
            sampleSize: countryEmployees.length
        };
    }

    /**
     * Analyze title factor for performance suggestion
     * @param {Object} employee - Employee to analyze
     * @param {Array} allEmployees - All employees for comparison
     * @returns {Object} Title factor analysis
     */
    analyzeTitleFactor(employee, allEmployees) {
        // Find employees with similar titles
        const similarTitleEmployees = allEmployees.filter(emp => 
            emp.title && emp.performanceRating && 
            this.areTitlesSimilar(employee.title, emp.title)
        );

        if (similarTitleEmployees.length === 0) {
            return { score: 0, weight: 0, reason: 'No similar title performance data' };
        }

        const avgTitleRating = similarTitleEmployees.reduce((sum, emp) => 
            sum + emp.performanceRating.numeric, 0) / similarTitleEmployees.length;

        return {
            score: avgTitleRating,
            weight: 0.15,
            reason: `Average performance for similar titles is ${avgTitleRating.toFixed(1)}`,
            titleAverage: avgTitleRating,
            sampleSize: similarTitleEmployees.length
        };
    }

    /**
     * Check if two job titles are similar
     * @param {string} title1 - First title
     * @param {string} title2 - Second title
     * @returns {boolean} Whether titles are similar
     */
    areTitlesSimilar(title1, title2) {
        const clean1 = title1.toLowerCase().replace(/[^a-z\s]/g, '');
        const clean2 = title2.toLowerCase().replace(/[^a-z\s]/g, '');
        
        // Check for common keywords
        const keywords1 = clean1.split(' ').filter(word => word.length > 2);
        const keywords2 = clean2.split(' ').filter(word => word.length > 2);
        
        const commonKeywords = keywords1.filter(word => keywords2.includes(word));
        return commonKeywords.length >= 1; // At least one common keyword
    }

    /**
     * Calculate suggested rating based on factors
     * @param {Object} factors - Factor analysis
     * @param {Object} baseline - Performance baseline
     * @returns {number} Suggested rating (1-5)
     */
    calculateSuggestedRating(factors, baseline) {
        let weightedSum = 0;
        let totalWeight = 0;

        // Add weighted factors
        for (const factor of Object.values(factors)) {
            if (factor.weight > 0 && factor.score > 0) {
                weightedSum += factor.score * factor.weight;
                totalWeight += factor.weight;
            }
        }

        // If no factors available, use baseline average
        if (totalWeight === 0) {
            return baseline.averageRating;
        }

        let suggestedRating = weightedSum / totalWeight;

        // Apply future talent boost
        if (factors.futureTalent) {
            suggestedRating += 0.3;
        }

        // Ensure rating is within bounds
        suggestedRating = Math.max(1, Math.min(5, suggestedRating));

        // Round to nearest 0.5
        return Math.round(suggestedRating * 2) / 2;
    }

    /**
     * Calculate confidence in the suggestion
     * @param {Object} factors - Factor analysis
     * @param {Object} baseline - Performance baseline
     * @returns {number} Confidence score (0-1)
     */
    calculateSuggestionConfidence(factors, baseline) {
        let confidence = 0.3; // Base confidence

        // Add confidence based on available factors
        const factorWeights = Object.values(factors).reduce((sum, factor) => sum + factor.weight, 0);
        confidence += factorWeights * 0.5;

        // Boost confidence if we have good baseline data
        if (baseline.sampleSize > 10) {
            confidence += 0.2;
        } else if (baseline.sampleSize > 5) {
            confidence += 0.1;
        }

        return Math.min(1, confidence);
    }

    /**
     * Generate reasoning for the suggestion
     * @param {Object} factors - Factor analysis
     * @param {number} suggestedRating - Suggested rating
     * @returns {Array} Array of reasoning statements
     */
    generateReasoning(factors, suggestedRating) {
        const reasoning = [];

        // Add factor-based reasoning
        for (const [factorName, factor] of Object.entries(factors)) {
            if (factor.weight > 0.1 && factor.reason) {
                reasoning.push(factor.reason);
            }
        }

        // Add overall assessment
        if (suggestedRating >= 4) {
            reasoning.push('Overall indicators suggest above-average performance');
        } else if (suggestedRating >= 3) {
            reasoning.push('Overall indicators suggest average performance');
        } else {
            reasoning.push('Overall indicators suggest below-average performance');
        }

        return reasoning;
    }

    /**
     * Generate alternative rating options
     * @param {number} suggestedRating - Primary suggested rating
     * @param {Object} factors - Factor analysis
     * @returns {Array} Array of alternative ratings
     */
    generateAlternatives(suggestedRating, factors) {
        const alternatives = [];
        
        // Add ±0.5 alternatives
        if (suggestedRating > 1.5) {
            alternatives.push({
                rating: suggestedRating - 0.5,
                text: this.getPerformanceText(suggestedRating - 0.5),
                reason: 'Conservative estimate'
            });
        }
        
        if (suggestedRating < 4.5) {
            alternatives.push({
                rating: suggestedRating + 0.5,
                text: this.getPerformanceText(suggestedRating + 0.5),
                reason: 'Optimistic estimate'
            });
        }

        return alternatives;
    }

    /**
     * Get performance text from numeric rating
     * @param {number} rating - Numeric rating
     * @returns {string} Performance text
     */
    getPerformanceText(rating) {
        if (rating >= 4.5) return 'Outstanding';
        if (rating >= 3.5) return 'Exceeds Expectations';
        if (rating >= 2.5) return 'Meets Expectations';
        if (rating >= 1.5) return 'Below Expectations';
        return 'Needs Improvement';
    }

    /**
     * Apply a suggestion to an employee
     * @param {string} employeeId - Employee ID
     * @param {Object} suggestion - Suggestion to apply
     * @param {Array} employees - Array of employees
     * @returns {Array} Updated employees array
     */
    applySuggestion(employeeId, suggestion, employees) {
        const updatedEmployees = employees.map(employee => {
            if (employee.id === employeeId) {
                return {
                    ...employee,
                    performanceRating: {
                        numeric: suggestion.suggestedRating.numeric,
                        text: suggestion.suggestedRating.text,
                        original: `Suggested: ${suggestion.suggestedRating.text}`,
                        isSuggested: true,
                        appliedAt: new Date().toISOString()
                    }
                };
            }
            return employee;
        });

        // Record in history
        this.suggestionHistory.push({
            employeeId,
            suggestion,
            appliedAt: new Date().toISOString()
        });

        return updatedEmployees;
    }

    /**
     * Get suggestion history
     * @returns {Array} Array of applied suggestions
     */
    getSuggestionHistory() {
        return this.suggestionHistory;
    }
}

// Export for use in other modules
window.PerformanceSuggester = PerformanceSuggester; 