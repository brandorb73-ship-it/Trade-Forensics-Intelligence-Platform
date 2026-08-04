import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import Papa from 'papaparse';

const TradeDataContext = createContext();

export const TradeDataProvider = ({ children }) => {
  const [tradeData, setTradeData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Central registry to store pre-calculated Intelligence Objects from all investigation modules
  const [intelligenceRegistry, setIntelligenceRegistry] = useState({});

  // Stable function for modules to register their Intelligence Objects without recalculation
  const registerIntelligence = useCallback((moduleId, intelligenceData) => {
    setIntelligenceRegistry((prevRegistry) => ({
      ...prevRegistry,
      [moduleId]: {
        ...intelligenceData,
        timestamp: new Date().toISOString()
      }
    }));
  }, []);

  // Helper to retrieve structured intelligence or generate a safe fallback object without duplicating math
  const getModuleIntelligence = useCallback((moduleId, fallbackData = {}) => {
    return intelligenceRegistry[moduleId] || fallbackData;
  }, [intelligenceRegistry]);

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

  // Memoized Shared Evidence Repository assembler across registered module intelligence
  const assembledEvidenceRepository = useMemo(() => {
    const evidenceList = [];
    Object.entries(intelligenceRegistry).forEach(([sourceModule, intel]) => {
      if (intel && Array.isArray(intel.evidenceItems)) {
        intel.evidenceItems.forEach((item) => {
          evidenceList.push({
            id: item.id || `${sourceModule}-${Math.random().toString(36).substr(2, 6)}`,
            sourceModule,
            severity: item.severity || 'Medium',
            indicators: item.indicators || ['General Operational Variance'],
            confidence: item.confidence || '85%',
            supportingTransactions: item.supportingTransactions || 0,
            linkedEntities: item.linkedEntities || [],
            description: item.description || 'Verified anomaly detected by specialized analytical module.'
          });
        });
      }
    });
    return evidenceList;
  }, [intelligenceRegistry]);

  return (
    <TradeDataContext.Provider 
      value={{ 
        tradeData, 
        setTradeData, 
        uploadFile, 
        isLoading, 
        processRawData,
        intelligenceRegistry,
        registerIntelligence,
        getModuleIntelligence,
        assembledEvidenceRepository
      }}
    >
      {children}
    </TradeDataContext.Provider>
  );
};

export const useTradeData = () => useContext(TradeDataContext);

export default TradeDataProvider;
