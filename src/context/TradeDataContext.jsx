import React, { createContext, useContext, useState } from 'react';
import Papa from 'papaparse';

const TradeDataContext = createContext();

export const TradeDataProvider = ({ children }) => {
  const [tradeData, setTradeData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const processRawData = (csvString) => {
    setIsLoading(true);
    Papa.parse(csvString, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const enriched = results.data.map((row, index) => {
          const rawProduct = row['PRODUCT'] || '';
          const rawHsCode = String(row['HS Code'] || '');
          const rawAmount = parseFloat(row['Amount($)']);
          const rawUnitPrice = parseFloat(row['Unit Price($)']);

          let hsRisk = 'low';
          if (rawProduct.toUpperCase().includes('SEMAGLUTIDE') && rawHsCode.startsWith('9101')) {
            hsRisk = 'high'; 
          }

          return {
            id: index,
            Date: row['Date'] || 'N/A',
            HSCode: rawHsCode,
            Product: rawProduct || 'UNSPECIFIED CARGO',
            Brand: row['Brand'] || 'UNBRANDED / GRAY',
            Exporter: row['Exporter'] || 'UNKNOWN EXPORTER',
            Importer: row['Importer'] || 'UNKNOWN IMPORTER',
            Amount: isNaN(rawAmount) ? 0 : rawAmount,
            UnitPrice: isNaN(rawUnitPrice) ? 0 : rawUnitPrice,
            OriginCountry: row['Origin Country'] || 'UNKNOWN',
            DestinationCountry: row['Destination Country'] || 'UNKNOWN',
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
