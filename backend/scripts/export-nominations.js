import { generateNominationsReport } from '../services/export-service.js';
await generateNominationsReport();
console.log('Exported to results/results.xlsx');
