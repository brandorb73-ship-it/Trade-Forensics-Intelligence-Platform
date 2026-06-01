import React, { createContext, useContext, useState } from 'react';
import Papa from 'papaparse';

const TradeDataContext = createContext();

export const TradeDataProvider = ({ children }) => {
  const [tradeData, setTradeData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Helper to parse CSV string or file
  const processRawData = (csvString) => {
    setIsLoading(true);
    Papa.parse(csvString, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Enrich data with immediate forensic indicators
        const enriched = results.data.map((row, index) => {
          // Rule: Flag anomalous HS Code for Semaglutide
          let hsRisk = 'low';
          if (row['PRODUCT']?.includes('SEMAGLUTIDE') && String(row['HS Code']).startsWith('9101')) {
            hsRisk = 'high'; // Misclassified as a watch!
          }

          return {
            id: index,
            ...row,
            hsRisk,
            // Clean up anonymized text display fields if necessary
            Exporter: row['Exporter'] || 'UNKNOWN EXPORTER',
            Importer: row['Importer'] || 'UNKNOWN IMPORTER',
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
