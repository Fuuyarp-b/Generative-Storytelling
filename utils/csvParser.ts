import Papa from 'papaparse';
import { CSVRow, DataStats } from '../types';

export const parseCSV = (file: File): Promise<CSVRow[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        resolve(results.data as CSVRow[]);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

// Heuristic logic to analyze the specific H_ZCSR181H structure or generic sales data
export const analyzeStats = (data: CSVRow[]): DataStats => {
  if (data.length === 0) {
    return {
      totalRows: 0,
      totalAmount: 0,
      topBA: null,
      monthlyTrend: [],
      categoryBreakdown: [],
      headers: [],
    };
  }

  const headers = Object.keys(data[0]);

  // Attempt to find relevant columns based on common naming conventions
  const amountKey = headers.find(h => /amount|price|value|net|sales/i.test(h)) || headers.find(h => typeof data[0][h] === 'number');
  const dateKey = headers.find(h => /date|month|year|day|time/i.test(h));
  // BA could be "Business Area", "Sold-to", "Customer", or explicitly "BA"
  const baKey = headers.find(h => /ba|business|sold-to|customer|agent/i.test(h)) || headers.find(h => typeof data[0][h] === 'string');
  const categoryKey = headers.find(h => /category|group|type|material/i.test(h));

  let totalAmount = 0;
  const baMap = new Map<string, number>();
  const monthMap = new Map<string, number>();
  const categoryMap = new Map<string, number>();

  data.forEach(row => {
    const amount = amountKey ? Number(row[amountKey]) || 0 : 0;
    totalAmount += amount;

    if (baKey && row[baKey]) {
      const ba = String(row[baKey]);
      baMap.set(ba, (baMap.get(ba) || 0) + amount);
    }

    if (dateKey && row[dateKey]) {
      // Simple date parsing
      const dateStr = String(row[dateKey]);
      let month = "Unknown";
      try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        } else {
            // Try generic parsing YYYYMM or DD.MM.YYYY if standard fails
            month = dateStr.substring(0, 7); 
        }
      } catch (e) {
        month = dateStr;
      }
      monthMap.set(month, (monthMap.get(month) || 0) + amount);
    }

    if (categoryKey && row[categoryKey]) {
      const cat = String(row[categoryKey]);
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + amount);
    }
  });

  // Top BA
  let topBA = null;
  if (baMap.size > 0) {
    const sortedBA = [...baMap.entries()].sort((a, b) => b[1] - a[1]);
    topBA = { name: sortedBA[0][0], value: sortedBA[0][1] };
  }

  // Monthly Trend
  const monthlyTrend = [...monthMap.entries()]
    .map(([month, value]) => ({ month, value }))
    // Basic attempt to sort chronologically if possible, otherwise keep insertion order or simple alphanumeric
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()); 
    
  // Category Breakdown
  const categoryBreakdown = [...categoryMap.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // Top 5 categories

  return {
    totalRows: data.length,
    totalAmount,
    topBA,
    monthlyTrend,
    categoryBreakdown,
    headers
  };
};