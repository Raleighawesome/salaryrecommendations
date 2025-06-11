# Team Analyzer Product Requirements Document (PRD)

## Introduction/Overview
The Team Analyzer is a browser-based tool designed specifically for people managers to make informed salary decisions for their teams. It enables secure, local analysis of employee CSV data to generate compensation insights, raise recommendations, and exportable reports. All data processing occurs entirely in the browser with no server-side dependencies, ensuring complete data privacy and security.

## Goals
- **Secure local analysis**: All data is processed in the browser with no server-side dependencies or data transmission
- **Actionable salary insights**: Provide managers with clear visibility into team compensation gaps, outliers, and optimization opportunities  
- **Budget optimization**: Enable managers to effectively distribute salary budgets across their teams with flexible modeling
- **Leadership communication**: Generate consumable reports and recommendations for leadership approval
- **Intelligent data handling**: Make smart decisions about data quality while giving users control over adjustments

## User Stories
- **US-1**: As a manager, I want to see my entire team's metrics at a glance so that I can understand any gaps or outliers that might exist on my team
- **US-2**: As a manager, I want to apply the budget I am given during salary cycles and play with amounts so that I can determine how to spread my budget across my team most effectively  
- **US-3**: As a manager, I want to provide leadership a consumable overview of the changes I want to propose so that I can improve my team's salary as effectively as possible
- **US-4**: As a manager, I want to filter and search my team data in multiple ways so that I can analyze different segments and scenarios
- **US-5**: As a manager, I want the tool to handle data quality issues intelligently so that I can focus on decision-making rather than data cleanup

## Functional Requirements

### Data Import & Processing
- **FR-1**: The system must allow users to upload CSV files containing employee data with progress indicator
- **FR-2**: The system must automatically parse CSV data and validate required columns (`Employee Full name`, `Business Title`, `Country`, `Total Base Pay`, `Comparatio`, `Overall Performance Rating`)
- **FR-3**: The system must handle missing or malformed data gracefully, notifying users of issues while making intelligent assumptions where possible
- **FR-4**: The system must detect and highlight duplicate employee names, allowing users to merge duplicate records
- **FR-5**: The system must suggest performance ratings for employees with missing ratings, with user editing capability
- **FR-6**: The system must support multiple currencies in salary data

### Data Analysis & Visualization  
- **FR-7**: The system must provide combinable filters for country, salary range, performance rating, and future talent flag
- **FR-8**: The system must support partial-match search across employee names and titles with live debounced input
- **FR-9**: The system must display employee data in a table with virtual scrolling for datasets of 10,000+ employees
- **FR-10**: The system must provide keyboard navigation and row selection capabilities
- **FR-11**: The system must generate visualizations including salary distributions, performance vs compensation, country breakdowns, and comparatio trends

### Raise Calculations & Recommendations
- **FR-12**: The system must allow managers to configure raise calculation weights for performance, time in role, time since raise, and comparatio
- **FR-13**: The system must calculate raise recommendations with country-specific constraints:
  - US raises: Flag recommendations over 12% as requiring VP sign-off
  - India raises: Allow recommendations between 10-50%
- **FR-14**: The system must provide real-time budget modeling allowing managers to adjust individual raise amounts
- **FR-15**: The system must track total budget utilization and provide budget distribution insights

### Insights & Reporting
- **FR-16**: The system must identify and highlight retention risks, overdue raises, and below-range salaries
- **FR-17**: The system must generate exportable reports in Google Sheets and CSV formats
- **FR-18**: The system must provide summary insights suitable for leadership presentation

### User Experience
- **FR-19**: The system must provide responsive design supporting tablets and mobile devices
- **FR-20**: The system must implement accessibility features including keyboard navigation hints
- **FR-21**: The system must handle errors gracefully with subtle notifications that don't interrupt workflow

## Technical Considerations
- **Browser Support**: Must support Chrome and Safari browsers
- **Performance**: Maximum load time of 20 seconds for datasets up to 10,000+ employees
- **Security**: All processing occurs locally in browser - no data transmission to external servers
- **File Handling**: Support standard CSV formats with intelligent encoding detection
- **Memory Management**: Implement virtual scrolling and efficient data structures for large datasets

## Design Considerations
- **Error Handling**: Errors should fail gracefully with subtle, non-intrusive notifications
- **Data Quality**: Provide user control over data adjustments while making intelligent defaults
- **Workflow**: Optimize for manager decision-making workflow from data upload to leadership presentation

## Success Metrics
- Correct parsing of uploaded CSV files with graceful handling of data quality issues
- Ability to handle 10,000+ employees with load times under 20 seconds
- Successful identification of compensation outliers and budget optimization opportunities
- Manager ability to generate leadership-ready salary recommendations efficiently
- Zero data security incidents due to local-only processing

## Non-Goals (Out of Scope)
- Server-side storage or authentication systems
- Real-time collaboration between multiple users  
- Integration with payroll or HRIS systems
- Advanced analytics beyond compensation and performance correlation
- Multi-language localization beyond currency support

## Open Questions
- Should the tool support additional export formats beyond Google Sheets and CSV?
- Are there specific visualization preferences for leadership presentations?
- Should there be audit trails for tracking changes to raise recommendations?
- Are there additional country-specific raise constraints beyond US and India?

