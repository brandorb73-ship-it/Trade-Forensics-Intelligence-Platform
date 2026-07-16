import React, { createContext, useContext, useState, useCallback } from 'react';
import Papa from 'papaparse';

const TradeDataContext = createContext();

export const TradeDataProvider = ({ children }) => {
  const [tradeData, setTradeData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // NEW: Central registry to store pre-calculated Intelligence Objects from all modules
  const [intelligenceRegistry, setIntelligenceRegistry] = useState({});

  // NEW: Stable function for modules to register their Intelligence Objects
  const registerIntelligence = useCallback((moduleId, intelligenceData) => {
    setIntelligenceRegistry((prevRegistry) => ({
      ...prevRegistry,
      [moduleId]: intelligenceData
    }));
  }, []);

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
          
          let cleanAmount = row['Amount($)'];
          if (cleanAmount !== undefined && cleanAmount !== null) {
            cleanAmount = parseFloat(cleanAmount.toString().replace(/,/g, ''));
          }
          
          let cleanUnitPrice = row['Unit Price($)'];
          if (cleanUnitPrice !== undefined && cleanUnitPrice !== null) {
            cleanUnitPrice = parseFloat(cleanUnitPrice.toString().replace(/,/g, ''));
          }

          // Dynamic Formatting Cleanup for Quantities to ensure pricing metrics calculate accurately
          let cleanQuantity = row['Quantity'];
          if (cleanQuantity !== undefined && cleanQuantity !== null) {
            cleanQuantity = parseFloat(cleanQuantity.toString().replace(/,/g, ''));
          }

          // Forensics Rule Engine: Detect Disguised Shipments
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
            Quantity: isNaN(cleanQuantity) ? 0 : cleanQuantity,
            QuantityUnit: row['Quantity Unit'] || 'PCS',
            Weight: row['Weight(Kg)'] !== undefined ? row['Weight(Kg)'] : 0,
            Amount: isNaN(cleanAmount) ? 0 : cleanAmount,
            UnitPrice: isNaN(cleanUnitPrice) ? 0 : cleanUnitPrice,
            OriginCountry: row['Origin Country'] || 'UNKNOWN',
            DestinationCountry: row['Destination Country'] || 'UNKNOWN',
            TransportationMode: row['Mode of Transportation'] || 'UNKNOWN',
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
    <TradeDataContext.Provider 
      value={{ 
        tradeData, 
        setTradeData, 
        uploadFile, 
        isLoading, 
        processRawData,
        // NEW values exposed to the application
        intelligenceRegistry,
        registerIntelligence 
      }}
    >
      {children}
    </TradeDataContext.Provider>
  );
};

export const useTradeData = () => useContext(TradeDataContext);

export default TradeDataProvider;
