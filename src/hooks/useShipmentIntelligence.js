import { useMemo, useEffect } from 'react';

export function useShipmentIntelligence(tradeData, registerIntelligence) {
  const { augmentedData, intelligenceObject } = useMemo(() => {
    if (!tradeData || tradeData.length === 0) {
      return { augmentedData: [], intelligenceObject: null };
    }

    let totalValue = 0;
    let totalQty = 0;
    const exporters = new Set();
    const importers = new Set();
    const brands = new Set();
    const products = new Set();
    const hsCodes = new Set();
    const origins = new Set();
    const destinations = new Set();
    const routes = new Map();

    // Pass 1: Establish Baselines for Analytics
    const productPriceMap = new Map();
    tradeData.forEach((row) => {
      totalValue += row.Amount || 0;
      totalQty += row.Quantity || 0;
      exporters.add(row.Exporter);
      importers.add(row.Importer);
      brands.add(row.Brand);
      products.add(row.Product);
      hsCodes.add(row.HSCode);
      origins.add(row.OriginCountry);
      destinations.add(row.DestinationCountry);

      const routeKey = `${row.OriginCountry} -> ${row.DestinationCountry}`;
      routes.set(routeKey, (routes.get(routeKey) || 0) + 1);

      if (!productPriceMap.has(row.Product)) {
        productPriceMap.set(row.Product, { sum: 0, count: 0 });
      }
      const pp = productPriceMap.get(row.Product);
      pp.sum += row.UnitPrice || 0;
      pp.count += 1;
    });

    const productAvgPrice = new Map();
    productPriceMap.forEach((val, key) => {
      productAvgPrice.set(key, val.sum / val.count);
    });

    // Pass 2: Calculate Risk, Flags, and Generate Evidence
    const evidenceList = [];
    let criticalCount = 0;
    let highCount = 0;

    const augmented = tradeData.map((row) => {
      const flags = [];
      let riskScore = 'Low';
      let riskWeight = 0;

      // Rule: HS Disguise
      if (row.hsRisk === 'high') {
        flags.push('Potential Origin Manipulation', 'HS Disguise');
        riskWeight += 3;
      }

      // Rule: Price Outlier
      const avgPrice = productAvgPrice.get(row.Product);
      if (avgPrice > 0) {
        if (row.UnitPrice > avgPrice * 2) {
          flags.push('Price Outlier (High)');
          riskWeight += 2;
        } else if (row.UnitPrice < avgPrice * 0.5) {
          flags.push('Price Outlier (Low)', 'Potential Grey Market');
          riskWeight += 2;
        }
      }

      // Rule: High Value
      if (row.Amount > 500000) {
        flags.push('High Value Shipment');
        riskWeight += 1;
      }

      // Determine Final Risk Level
      if (riskWeight >= 4) {
        riskScore = 'Critical';
        criticalCount++;
      } else if (riskWeight >= 2) {
        riskScore = 'High';
        highCount++;
      } else if (riskWeight === 1) {
        riskScore = 'Medium';
      }

      const augmentedRow = { ...row, riskScore, flags };

      // Generate Evidence Object for High/Critical
      if (riskWeight >= 2) {
        evidenceList.push({
          shipmentID: row.id,
          exporter: row.Exporter,
          importer: row.Importer,
          product: row.Product,
          brand: row.Brand,
          HSCode: row.HSCode,
          origin: row.OriginCountry,
          destination: row.DestinationCountry,
          quantity: row.Quantity,
          value: row.Amount,
          unitPrice: row.UnitPrice,
          riskScore,
          triggeredRules: flags,
          explanation: `Automated detection triggered due to ${flags.join(' and ')}.`
        });
      }

      return augmentedRow;
    });

    // Compile Top Metrics
    const topRoutes = Array.from(routes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([route, count]) => ({ route, count }));

    const metrics = {
      totalShipments: tradeData.length,
      totalValue,
      totalQty,
      avgValue: totalValue / tradeData.length,
      avgUnitPrice: totalValue / totalQty,
      distinctExporters: exporters.size,
      distinctImporters: importers.size,
      distinctBrands: brands.size,
      distinctProducts: products.size,
      distinctHSCodes: hsCodes.size,
      distinctOrigins: origins.size,
      distinctDestinations: destinations.size
    };

    // Generate Dynamic Executive Summary
    const executiveSummary = `The imported dataset contains ${metrics.totalShipments.toLocaleString()} shipments involving ${metrics.distinctExporters} exporters across ${metrics.distinctOrigins} origin jurisdictions. Analysis identified ${criticalCount + highCount} shipments exhibiting elevated forensic risk, primarily driven by price deviations and structural anomalies. No evidence alone confirms wrongdoing; however, these shipments warrant further examination.`;

    const generatedIntelligence = {
      section: "Shipment Ledger",
      executiveSummary,
      metrics,
      findings: [
        { title: "Risk Distribution", description: `${criticalCount} Critical and ${highCount} High risk shipments identified.` },
        { title: "Trade Concentration", description: `${topRoutes[0]?.route} represents the highest volume corridor.` }
      ],
      anomalies: evidenceList.map(e => e.triggeredRules).flat().filter((v, i, a) => a.indexOf(v) === i),
      evidence: evidenceList,
      recommendations: [
        "Review customs declarations for critical risk entries.",
        "Compare invoice values against global medians.",
        "Investigate beneficial ownership of top anomalous exporters.",
        "Request additional customs documentation for diverted routes."
      ],
      confidence: tradeData.length > 100 ? 92 : 75,
      charts: { topRoutes },
      topEntities: [], 
      topRoutes,
      topProducts: []
    };

    return { augmentedData: augmented, intelligenceObject: generatedIntelligence };
  }, [tradeData]);

  // Register Intelligence Object with Context
  useEffect(() => {
    if (intelligenceObject && registerIntelligence) {
      registerIntelligence("Shipment Ledger", intelligenceObject);
    }
  }, [intelligenceObject, registerIntelligence]);

  return { augmentedData, intelligenceObject };
}
