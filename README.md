# Team Analyzer

A comprehensive web-based application for analyzing employee data, planning salary raises, and making data-driven team management decisions.

## 🚀 Features

### Data Management
- **CSV File Upload**: Import employee data with intelligent validation
- **Data Validation**: Automatic detection of duplicates and data quality issues
- **Multi-Currency Support**: Handle salaries in different currencies
- **Performance Suggestions**: AI-powered performance rating suggestions

### Data Analysis
- **Interactive Data Table**: Virtual scrolling for large datasets (10,000+ employees)
- **Advanced Filtering**: Filter by country, salary range, performance, and more
- **Live Search**: Real-time search across employee names and titles
- **Data Integrity Checking**: Comprehensive validation with quality scoring

### Raise Planning
- **Scenario Modeling**: Create and compare different raise scenarios
- **Budget Planning**: Set budget constraints and optimize distribution
- **Performance-Based Raises**: Allocate raises based on performance ratings
- **Approval Workflow**: Built-in approval process for high raises

### Analytics & Insights
- **Team Metrics Dashboard**: Headcount, average salary, performance distribution
- **Salary Visualizations**: Histograms, box plots, and distribution charts
- **Performance Analysis**: Correlation between performance and compensation
- **Equity Insights**: Pay gap analysis and equity recommendations

### Export & Sharing
- **Multiple Formats**: Export to Google Sheets, CSV, PDF, and Excel
- **Customizable Reports**: Choose data, charts, and formatting options
- **Data Anonymization**: Remove sensitive information for sharing
- **Template System**: Pre-built export templates for common use cases

## 🛠️ Getting Started

### Prerequisites
- Modern web browser (Chrome 80+, Safari 13+, Firefox 75+, Edge 80+)
- CSV file with employee data

### Installation
1. Clone or download the repository
2. Open `index.html` in your web browser
3. No server setup required - runs entirely in the browser

### Quick Start
1. **Upload Data**: Click "Choose File" and select your CSV file
2. **Review Data**: Check the uploaded data in the Table tab
3. **Plan Raises**: Use the Raises tab to model salary increases
4. **View Analytics**: Explore insights in the Analytics tab
5. **Export Results**: Save your analysis using the Export tab

## 📊 CSV File Format

The application supports Red Hat compensation report format and other standard HR CSV formats.

*The parser automatically detects commas, semicolons, or tabs as the delimiter.*

### Required Columns
- `Employee Full name`: Employee full name
- `Business Title`: Job title or role
- `Country`: Country location
- `Total Base Pay`: Current salary amount (numeric)
- `Comparatio`: Salary comparatio (percentage or decimal) - calculated as current salary ÷ mid pay grade value
- `Overall Performance Rating`: Performance rating

### Optional Columns (Enhances Functionality)
- `Identified as Future Talent?`: Future talent flag (Yes/No)
- `Manager Full name`: Manager's name
- `Latest Hire Date`: Employee hire date
- `Last Salary Change Date`: Date of last salary change
- `Currency`: Currency code (USD, EUR, GBP, INR, etc.)
- `Grade Band`: Employee grade/level
- `Location`: Office location
- `Management Level`: Management level description
- `Below Range Minimum?`: Flag for below range salaries

### Supported Performance Ratings
- **High Impact Performer** (5/5)
- **Successful Performer** (4/5)
- **Evolving Performer** (3/5)
- **Needs Improvement** (2/5)
- **Unsatisfactory** (1/5)

### Example Red Hat CSV Structure
```csv
Employee Number,Employee Full name,Business Title,Country,Total Base Pay,Currency,Comparatio,Overall Performance Rating,Identified as Future Talent?,Manager Full name
103903,"Jones, Asa",Senior Software Engineer,United States of America,"141,917.00",USD,92%,High Impact Performer,Yes,"Riley, Andrew Michael"
16005271,"Chowdhury, Soumyadip",Senior Software Engineer,India,"837,654.00",INR,74%,Successful Performer,Yes,"Kulkarni, Ketan Sanjeev"
```

## 📊 Understanding Salary Comparatio

**Comparatio** is a key metric for compensation analysis that represents how an employee's current salary compares to the midpoint of their pay grade range.

### Calculation
```
Comparatio = Current Salary ÷ Mid Pay Grade Value
```

### Example
- Bobby's salary: $151,000
- Mid pay grade for his title/location: $184,857
- Comparatio: $151,000 ÷ $184,857 = 0.82 (or 82%)

### Interpretation
- **< 80%**: Below market rate, potential flight risk
- **80-90%**: Below midpoint, room for growth
- **90-110%**: At market rate, well-positioned
- **110-120%**: Above midpoint, experienced performer
- **> 120%**: Premium pay, likely top performer

The application uses comparatio values to:
- Identify compensation equity issues
- Suggest performance ratings based on pay positioning
- Calculate appropriate raise recommendations
- Flag employees who may be underpaid relative to their role

## 🎯 Key Features Explained

### Data Validation
The system automatically validates your data and provides:
- **Duplicate Detection**: Identifies potential duplicate employees
- **Data Quality Scoring**: Grades your data quality (A+ to F)
- **Missing Data Suggestions**: AI-powered suggestions for missing performance ratings
- **Currency Validation**: Ensures valid currency codes and amounts

### Raise Planning
Create sophisticated raise scenarios with:
- **Budget Constraints**: Set total budget and country-specific limits
- **Performance Weighting**: Allocate raises based on performance ratings
- **Equity Focus**: Address pay gaps and improve compensation equity
- **Approval Thresholds**: Automatic flagging of raises requiring approval

### Analytics Dashboard
Comprehensive insights including:
- **Team Overview**: Headcount, average salary, performance distribution
- **Salary Analysis**: Distribution charts, percentiles, and outlier detection
- **Performance Correlation**: Relationship between performance and compensation
- **Country Comparisons**: Salary and performance metrics by location

## 🔧 Browser Compatibility

### Fully Supported Browsers
- **Chrome 80+**: Full feature support
- **Safari 13+**: Full feature support
- **Firefox 75+**: Full feature support
- **Edge 80+**: Full feature support

### Graceful Degradation
- Older browsers receive fallback functionality
- Automatic detection of browser capabilities
- Performance optimizations for mobile devices
- Warning notifications for unsupported features

## 📱 Mobile Support

While optimized for desktop use, Team Analyzer provides:
- Responsive design for mobile devices
- Touch-friendly interface elements
- Simplified navigation on smaller screens
- Core functionality available on mobile

## 🔒 Privacy & Security

### Data Security
- **Local Processing**: All data processing occurs in your browser
- **No Server Storage**: Data never leaves your device
- **HTTPS Support**: Secure connection when served over HTTPS
- **Data Anonymization**: Built-in options to remove sensitive information

### Privacy Features
- No user tracking or analytics
- No external data transmission
- Local storage only for user preferences
- Complete data control and ownership

## 🚨 Troubleshooting

### Common Issues

#### File Upload Problems
- **File too large**: Split large files or remove unnecessary columns
- **Invalid format**: Ensure file is in CSV format with proper encoding (UTF-8)
- **Missing columns**: Verify required columns are present and correctly named
- **Special characters**: Use UTF-8 encoding for international characters

#### Performance Issues
- **Slow loading**: Large datasets (10,000+ rows) may take time to process
- **Memory usage**: Close other browser tabs if experiencing slowdowns
- **Browser compatibility**: Update to latest browser version for best performance

#### Data Validation Errors
- **Duplicate employees**: Review and merge duplicate entries
- **Invalid currencies**: Use standard 3-letter currency codes (USD, EUR, GBP, INR)
- **Missing performance ratings**: Use the suggestion system or manually enter ratings
- **Salary format**: Ensure salary amounts are numeric values (commas are automatically handled)
- **Column mapping**: Ensure required columns match expected names (case-sensitive)
- **Performance ratings**: Use supported rating text or numeric values (1-5)

### Getting Help
- Press `?` key or click the help button for in-app documentation
- Use the guided tour for new users
- Check browser console for technical error messages

## 🎓 Advanced Usage

### Scenario Modeling
1. **Budget-Based**: Set total budget and let the system optimize distribution
2. **Performance-Based**: Allocate raises primarily based on performance ratings
3. **Equity-Based**: Focus on closing pay gaps and improving compensation equity
4. **Custom**: Create your own criteria using multiple factors

### Export Options
- **Google Sheets**: Direct integration for collaborative analysis
- **PDF Reports**: Professional reports with charts and summaries
- **CSV Data**: Raw data export for further analysis
- **Excel Format**: Compatible with Microsoft Excel

### Data Quality Optimization
- Review data quality report after upload
- Address critical issues before analysis
- Use performance suggestion system
- Validate currency and country data

## 🔄 Updates & Maintenance

### Browser Cache
- Clear browser cache if experiencing issues after updates
- Hard refresh (Ctrl+F5 or Cmd+Shift+R) to reload all assets

### Data Backup
- Export your analysis regularly
- Save CSV files with any manual corrections
- Use multiple export formats for redundancy

## 📞 Support

### Self-Help Resources
- Built-in help system (press `?` key)
- Interactive guided tour for new users
- Comprehensive documentation within the app
- Troubleshooting guides for common issues

### Technical Requirements
- JavaScript enabled
- Local storage available
- File API support
- Modern CSS support (Grid, Flexbox)

## 🏗️ Technical Architecture

### Frontend Technologies
- **Vanilla JavaScript**: No external dependencies
- **CSS Grid & Flexbox**: Modern layout techniques
- **HTML5 File API**: Client-side file processing
- **Canvas API**: Chart rendering and visualizations

### Performance Features
- **Virtual Scrolling**: Efficient handling of large datasets
- **Lazy Loading**: Components loaded as needed
- **Memory Management**: Automatic cleanup and optimization
- **Progressive Enhancement**: Core features work on all browsers

### Browser Compatibility System
- **Feature Detection**: Automatic capability testing
- **Polyfills**: Fallbacks for missing features
- **Graceful Degradation**: Reduced functionality on older browsers
- **Performance Optimization**: Adaptive features based on device capabilities

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please ensure:
- Code follows existing patterns
- Browser compatibility is maintained
- Documentation is updated
- Testing across multiple browsers

---

**Team Analyzer** - Making data-driven team management decisions simple and effective. 