/**
 * Data Validator Utility
 * 
 * Handles data validation, duplicate detection, and merging capabilities
 * for employee data processing.
 */

class DataValidator {
    constructor() {
        this.duplicates = [];
        this.mergeHistory = [];
    }

    /**
     * Detect duplicate employees in the dataset
     * @param {Array} employees - Array of employee objects
     * @returns {Object} Duplicate detection results
     */
    detectDuplicates(employees) {
        this.duplicates = [];
        const duplicateGroups = new Map();
        const processed = new Set();

        for (let i = 0; i < employees.length; i++) {
            if (processed.has(i)) continue;

            const employee = employees[i];
            const duplicateGroup = [i];

            // Find potential duplicates
            for (let j = i + 1; j < employees.length; j++) {
                if (processed.has(j)) continue;

                const otherEmployee = employees[j];
                const similarity = this.calculateSimilarity(employee, otherEmployee);

                if (similarity.isDuplicate) {
                    duplicateGroup.push(j);
                    processed.add(j);
                }
            }

            if (duplicateGroup.length > 1) {
                const groupId = `dup_${Date.now()}_${i}`;
                duplicateGroups.set(groupId, {
                    id: groupId,
                    indices: duplicateGroup,
                    employees: duplicateGroup.map(idx => employees[idx]),
                    confidence: this.calculateGroupConfidence(duplicateGroup.map(idx => employees[idx])),
                    suggestedMerge: this.suggestMerge(duplicateGroup.map(idx => employees[idx]))
                });
            }

            processed.add(i);
        }

        this.duplicates = Array.from(duplicateGroups.values());

        return {
            duplicateGroups: this.duplicates,
            totalDuplicates: this.duplicates.length,
            affectedEmployees: this.duplicates.reduce((sum, group) => sum + group.indices.length, 0),
            suggestions: this.duplicates.map(group => ({
                groupId: group.id,
                action: 'merge',
                confidence: group.confidence,
                preview: this.createMergePreview(group.employees)
            }))
        };
    }

    /**
     * Calculate similarity between two employees
     * @param {Object} emp1 - First employee
     * @param {Object} emp2 - Second employee
     * @returns {Object} Similarity analysis
     */
    calculateSimilarity(emp1, emp2) {
        const similarities = {
            name: this.compareNames(emp1.name, emp2.name),
            title: this.compareStrings(emp1.title, emp2.title),
            country: emp1.country === emp2.country,
            salary: this.compareSalaries(emp1.salary, emp2.salary)
        };

        // Calculate overall similarity score
        let score = 0;
        let weights = {
            name: 0.5,      // Name is most important
            title: 0.2,     // Title is moderately important
            country: 0.2,   // Country helps confirm
            salary: 0.1     // Salary can vary but helps
        };

        score += similarities.name.score * weights.name;
        score += similarities.title.score * weights.title;
        score += (similarities.country ? 1 : 0) * weights.country;
        score += similarities.salary.score * weights.salary;

        const isDuplicate = score >= 0.8 || similarities.name.score >= 0.9;

        return {
            isDuplicate,
            score,
            similarities,
            reasons: this.getSimilarityReasons(similarities, score)
        };
    }

    /**
     * Compare employee names with fuzzy matching
     * @param {string} name1 - First name
     * @param {string} name2 - Second name
     * @returns {Object} Name comparison result
     */
    compareNames(name1, name2) {
        if (!name1 || !name2) return { score: 0, reason: 'Missing name' };

        const clean1 = this.cleanName(name1);
        const clean2 = this.cleanName(name2);

        // Exact match
        if (clean1 === clean2) {
            return { score: 1.0, reason: 'Exact match' };
        }

        // Check for name variations (first/last name swapped, middle names, etc.)
        const parts1 = clean1.split(' ').filter(p => p.length > 1);
        const parts2 = clean2.split(' ').filter(p => p.length > 1);

        // Check if all parts of one name are contained in the other
        const containsAll1 = parts1.every(part => 
            parts2.some(p => this.levenshteinDistance(part, p) <= 1)
        );
        const containsAll2 = parts2.every(part => 
            parts1.some(p => this.levenshteinDistance(part, p) <= 1)
        );

        if (containsAll1 || containsAll2) {
            return { score: 0.9, reason: 'Name parts match with variations' };
        }

        // Fuzzy string matching
        const distance = this.levenshteinDistance(clean1, clean2);
        const maxLength = Math.max(clean1.length, clean2.length);
        const similarity = 1 - (distance / maxLength);

        if (similarity >= 0.8) {
            return { score: similarity, reason: 'High fuzzy match' };
        }

        return { score: similarity, reason: 'Low similarity' };
    }

    /**
     * Clean name for comparison
     * @param {string} name - Name to clean
     * @returns {string} Cleaned name
     */
    cleanName(name) {
        return name.toLowerCase()
            .replace(/[^\w\s]/g, '') // Remove punctuation
            .replace(/\s+/g, ' ')    // Normalize spaces
            .trim();
    }

    /**
     * Calculate Levenshtein distance between two strings
     * @param {string} str1 - First string
     * @param {string} str2 - Second string
     * @returns {number} Edit distance
     */
    levenshteinDistance(str1, str2) {
        const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

        for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,     // deletion
                    matrix[j - 1][i] + 1,     // insertion
                    matrix[j - 1][i - 1] + indicator // substitution
                );
            }
        }

        return matrix[str2.length][str1.length];
    }

    /**
     * Compare strings with fuzzy matching
     * @param {string} str1 - First string
     * @param {string} str2 - Second string
     * @returns {Object} String comparison result
     */
    compareStrings(str1, str2) {
        if (!str1 || !str2) return { score: 0 };

        const clean1 = str1.toLowerCase().trim();
        const clean2 = str2.toLowerCase().trim();

        if (clean1 === clean2) return { score: 1.0 };

        const distance = this.levenshteinDistance(clean1, clean2);
        const maxLength = Math.max(clean1.length, clean2.length);
        const similarity = 1 - (distance / maxLength);

        return { score: similarity };
    }

    /**
     * Compare salary objects
     * @param {Object} salary1 - First salary
     * @param {Object} salary2 - Second salary
     * @returns {Object} Salary comparison result
     */
    compareSalaries(salary1, salary2) {
        if (!salary1 || !salary2) return { score: 0 };

        // Convert to same currency for comparison (simplified)
        const amount1 = salary1.amount;
        const amount2 = salary2.amount;

        if (amount1 === amount2) return { score: 1.0 };

        // Consider salaries similar if within 10% of each other
        const difference = Math.abs(amount1 - amount2);
        const average = (amount1 + amount2) / 2;
        const percentDifference = difference / average;

        if (percentDifference <= 0.1) return { score: 0.9 };
        if (percentDifference <= 0.2) return { score: 0.7 };
        if (percentDifference <= 0.5) return { score: 0.5 };

        return { score: 0.2 };
    }

    /**
     * Get similarity reasons for display
     * @param {Object} similarities - Similarity object
     * @param {number} score - Overall score
     * @returns {Array} Array of reasons
     */
    getSimilarityReasons(similarities, score) {
        const reasons = [];

        if (similarities.name.score >= 0.9) {
            reasons.push(`Names are very similar (${similarities.name.reason})`);
        }
        if (similarities.title.score >= 0.8) {
            reasons.push('Job titles match closely');
        }
        if (similarities.country) {
            reasons.push('Same country/location');
        }
        if (similarities.salary.score >= 0.8) {
            reasons.push('Similar salary ranges');
        }

        if (reasons.length === 0) {
            reasons.push('Low overall similarity');
        }

        return reasons;
    }

    /**
     * Calculate confidence for a duplicate group
     * @param {Array} employees - Array of employees in the group
     * @returns {number} Confidence score (0-1)
     */
    calculateGroupConfidence(employees) {
        if (employees.length < 2) return 0;

        let totalSimilarity = 0;
        let comparisons = 0;

        for (let i = 0; i < employees.length; i++) {
            for (let j = i + 1; j < employees.length; j++) {
                const similarity = this.calculateSimilarity(employees[i], employees[j]);
                totalSimilarity += similarity.score;
                comparisons++;
            }
        }

        return comparisons > 0 ? totalSimilarity / comparisons : 0;
    }

    /**
     * Suggest how to merge duplicate employees
     * @param {Array} employees - Array of duplicate employees
     * @returns {Object} Merge suggestion
     */
    suggestMerge(employees) {
        if (employees.length < 2) return null;

        // Find the most complete record as the base
        const baseEmployee = this.findMostCompleteEmployee(employees);
        const mergedEmployee = { ...baseEmployee };

        // Merge data from other records
        for (const employee of employees) {
            if (employee.id === baseEmployee.id) continue;

            // Take non-null values from other records
            for (const [key, value] of Object.entries(employee)) {
                if (value !== null && value !== undefined && value !== '' && 
                    (mergedEmployee[key] === null || mergedEmployee[key] === undefined || mergedEmployee[key] === '')) {
                    mergedEmployee[key] = value;
                }
            }
        }

        return {
            baseEmployeeId: baseEmployee.id,
            mergedEmployee,
            conflicts: this.findMergeConflicts(employees),
            action: 'merge'
        };
    }

    /**
     * Find the most complete employee record
     * @param {Array} employees - Array of employees
     * @returns {Object} Most complete employee
     */
    findMostCompleteEmployee(employees) {
        let bestEmployee = employees[0];
        let bestScore = this.calculateCompletenessScore(employees[0]);

        for (let i = 1; i < employees.length; i++) {
            const score = this.calculateCompletenessScore(employees[i]);
            if (score > bestScore) {
                bestScore = score;
                bestEmployee = employees[i];
            }
        }

        return bestEmployee;
    }

    /**
     * Calculate completeness score for an employee
     * @param {Object} employee - Employee object
     * @returns {number} Completeness score
     */
    calculateCompletenessScore(employee) {
        const fields = [
            'name', 'title', 'country', 'salary', 'comparatio', 
            'performanceRating', 'futureTalent', 'timeInRole', 'timeSinceRaise'
        ];

        let score = 0;
        for (const field of fields) {
            if (employee[field] !== null && employee[field] !== undefined && employee[field] !== '') {
                score++;
            }
        }

        return score / fields.length;
    }

    /**
     * Find conflicts when merging employees
     * @param {Array} employees - Array of employees to merge
     * @returns {Array} Array of conflicts
     */
    findMergeConflicts(employees) {
        const conflicts = [];
        const fields = ['name', 'title', 'country', 'salary', 'performanceRating'];

        for (const field of fields) {
            const values = employees.map(emp => emp[field]).filter(val => val !== null && val !== undefined);
            const uniqueValues = [...new Set(values.map(val => JSON.stringify(val)))];

            if (uniqueValues.length > 1) {
                conflicts.push({
                    field,
                    values: uniqueValues.map(val => JSON.parse(val)),
                    suggestion: 'manual_review'
                });
            }
        }

        return conflicts;
    }

    /**
     * Create a preview of the merged employee
     * @param {Array} employees - Array of employees to merge
     * @returns {Object} Merge preview
     */
    createMergePreview(employees) {
        const suggestion = this.suggestMerge(employees);
        
        return {
            originalCount: employees.length,
            mergedEmployee: suggestion.mergedEmployee,
            conflicts: suggestion.conflicts,
            confidence: this.calculateGroupConfidence(employees)
        };
    }

    /**
     * Execute merge of duplicate employees
     * @param {string} groupId - ID of the duplicate group
     * @param {Array} employees - Full employee array
     * @param {Object} mergeDecision - User's merge decision
     * @returns {Array} Updated employee array
     */
    executeMerge(groupId, employees, mergeDecision) {
        const duplicateGroup = this.duplicates.find(group => group.id === groupId);
        if (!duplicateGroup) {
            throw new Error('Duplicate group not found');
        }

        // Create merged employee
        const mergedEmployee = mergeDecision.mergedEmployee || duplicateGroup.suggestedMerge.mergedEmployee;
        
        // Remove original employees and add merged one
        const indicesToRemove = duplicateGroup.indices.sort((a, b) => b - a); // Sort descending
        const updatedEmployees = [...employees];

        // Remove duplicates (in reverse order to maintain indices)
        for (const index of indicesToRemove) {
            updatedEmployees.splice(index, 1);
        }

        // Add merged employee
        updatedEmployees.push({
            ...mergedEmployee,
            id: `merged_${Date.now()}`,
            mergedFrom: duplicateGroup.indices.map(idx => employees[idx].id),
            mergedAt: new Date().toISOString()
        });

        // Record merge history
        this.mergeHistory.push({
            groupId,
            originalEmployees: duplicateGroup.employees,
            mergedEmployee,
            mergedAt: new Date().toISOString()
        });

        return updatedEmployees;
    }

    /**
     * Get merge history
     * @returns {Array} Array of merge operations
     */
    getMergeHistory() {
        return this.mergeHistory;
    }

    /**
     * Validate employee data quality
     * @param {Array} employees - Array of employees
     * @returns {Object} Data quality report
     */
    validateDataQuality(employees) {
        const issues = [];
        const warnings = [];

        for (const employee of employees) {
            // Check for missing critical data
            if (!employee.name || employee.name.trim() === '') {
                issues.push(`Employee ${employee.id}: Missing name`);
            }
            if (!employee.title || employee.title.trim() === '') {
                issues.push(`Employee ${employee.name || employee.id}: Missing job title`);
            }
            if (!employee.salary || employee.salary.amount <= 0) {
                issues.push(`Employee ${employee.name || employee.id}: Invalid salary`);
            }

            // Check for data quality warnings
            if (!employee.performanceRating) {
                warnings.push(`Employee ${employee.name || employee.id}: Missing performance rating`);
            }
            if (!employee.country || employee.country === 'Unknown') {
                warnings.push(`Employee ${employee.name || employee.id}: Missing or unknown country`);
            }
        }

        return {
            totalEmployees: employees.length,
            issues: issues,
            warnings: warnings,
            qualityScore: Math.max(0, 1 - (issues.length + warnings.length * 0.5) / employees.length)
        };
    }
}

// Export for use in other modules
window.DataValidator = DataValidator; 