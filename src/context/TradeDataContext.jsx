import React, { createContext, useContext, useState } from 'react';
import Papa from 'papaparse';

const TradeDataContext = createContext();

export const TradeDataProvider = ({ children }) => {
  const [tradeData, setTradeData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Robust cleaner to normalize CSV headers regardless of source anomalies
  const cleanKey = (str) => {
    if (!str) return '';
    return str.toString().trim().toUpperCase().replace(/\s+/g, '');
  };

  const processRawData = (csvString) => {
    setIsLoading(true);
    Papa.parse(csvString, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const enriched = results.data.map((row, index) => {
          // Create a normalized, case-insensitive map of the row data
          const normalizedRow = {};
          Object.keys(row).forEach(key => {
            normalizedRow[cleanKey(key)] = row[key];
          });

          // Match data against normalized headers
          const product = normalizedRow['PRODUCT'] || normalizedRow['PRODUCTDESCRIPTION'] || '';
          const hsCode = String(normalizedRow['HSCODE'] || '');
          const amount = parseFloat(normalizedRow['AMOUNT($)'] || normalizedRow['AMOUNT'] || 0);
          const unitPrice = parseFloat(normalizedRow['UNITPRICE($)'] || normalizedRow['UNITPRICE'] || 0);

          // Forensics Rule Engine: Detect Disguised Shipments
          let hsRisk = 'low';
          if (product.toUpperCase().includes('SEMAGLUTIDE') && hsCode.startsWith('9101')) {
            hsRisk = 'high'; 
          }

          return {
            id: index,
            Date: normalizedRow['DATE'] || 'N/A',
            HSCode: hsCode,
            Product: product || 'UNSPECIFIED CARGO',
            Brand: normalizedRow['BRAND'] || 'UNBRANDED / GRAY',
            Exporter: normalizedRow['EXPORTER'] || 'UNKNOWN EXPORTER',
            Importer: normalizedRow['IMPORTER'] || 'UNKNOWN IMPORTER',
            Amount: isNaN(amount) ? 0 : amount,
            UnitPrice: isNaN(unitPrice) ? 0 : unitPrice,
            OriginCountry: normalizedRow['ORIGINCOUNTRY'] || 'UNKNOWN',
            DestinationCountry: normalizedRow['DESTINATIONCOUNTRY'] || 'UNKNOWN',
            hsRisk
          };
        });

        setTradeData(enriched);
        setIsLoading(false);
      },
      error: (err) => {
        console.error("Parsing error:", err);
        setIsLoading(false);
      }
    });
  };

  const uploadFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => processRawData(e.target.result);
    reader.readAsText(file);
  };

  return (
    <TradeDataContext.Provider value={{ tradeData, setTradeData, uploadFile, isLoading, processRawData }}>
      {children}
    </TradeDataContext.Provider>
  );
};

export const useTradeData = () => useContext(TradeDataContext);
