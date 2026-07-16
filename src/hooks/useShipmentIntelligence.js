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

    // Map to identify HS Code Variance (same product, multiple HS Codes)
    const productToHsCodes = new Map();

    // Pass 1: Baseline Analysis
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

      const routeKey = `${row.OriginCountry} ➔ ${row.DestinationCountry}`;
      routes.set(routeKey, (routes.get(routeKey) || 0) + 1);

      if (row.Product) {
        if (!productToHsCodes.has(row.Product)) {
          productToHsCodes.set(row.Product, new Set());
        }
        productToHsCodes.get(row.Product).add(row.HSCode);
      }
    });

    // Detect products with multi-HS variance
    const productsWithVariance = new Set();
    productToHsCodes.forEach((codes, prod) => {
      if (codes.size > 1) {
        productsWithVariance.add(prod);
      }
    });

    const averageValue = totalValue / tradeData.length;
    let totalRiskPoints = 0;
    const evidenceList = [];
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;

    // Pass 2: Risk Flagging and Enrichment
    const augmented = tradeData.map((row) => {
      const flags = [];
      let riskScore = 'Low';
      let riskWeight = 0;

      // Rule: HS Code Variance Detected
      const hasHsVariance = productsWithVariance.has(row.Product);
      if (hasHsVariance) {
        flags.push('HS Code Variance Detected');
        riskWeight += 2;
      }

      // Rule: Semaglutide Customs Check / Origin Mismatch
      if (row.hsRisk === 'high') {
        flags.push('Potential Origin Manipulation', 'HS Disguise');
        riskWeight += 3;
      }

      // Rule: High Value Threshold
      if (row.Amount > 500000) {
        flags.push('High Value Transaction');
        riskWeight += 1;
      }

      // Determine Risk Grade
      if (riskWeight >= 4) {
        riskScore = 'Critical';
        criticalCount++;
      } else if (riskWeight >= 2) {
        riskScore = 'High';
        highCount++;
      } else if (riskWeight === 1) {
        riskScore = 'Medium';
        mediumCount++;
      }

      totalRiskPoints += riskWeight;

      const augmentedRow = { 
        ...row, 
        riskScore, 
        flags,
        hasHsVariance 
      };

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
          explanation: `Transaction flagged containing anomalies: ${flags.join(', ')}.`
        });
      }

      return augmentedRow;
    });

    // Score from 0 to 100 representing manifest risk severity
    const maxPossiblePoints = tradeData.length * 4;
    const forensicIndex = Math.min(100, Math.round((totalRiskPoints / (maxPossiblePoints || 1)) * 1000) / 10);

    const metrics = {
      totalShipments: tradeData.length,
      totalValue,
      totalQty,
      avgValue: averageValue,
      distinctExporters: exporters.size,
      distinctImporters: importers.size,
      distinctBrands: brands.size,
      distinctProducts: products.size,
      distinctHSCodes: hsCodes.size,
      distinctOrigins: origins.size,
      distinctDestinations: destinations.size,
      hsVarianceCount: productsWithVariance.size,
      forensicIndex
    };

    const executiveSummary = `The analyzed dataset reflects ${metrics.totalShipments.toLocaleString()} shipments spanning ${metrics.distinctOrigins} origin hubs and ${metrics.distinctDestinations} target nations. A cumulative Forensic Risk Index of ${forensicIndex}% was measured, with ${criticalCount + highCount} shipments isolated for active intelligence review based on anomalous classification routing patterns and classification shifts.`;

    const generatedIntelligence = {
      section: "Shipment Ledger",
      executiveSummary,
      metrics,
      findings: [
        { title: "Classification Anomalies", description: `${metrics.hsVarianceCount} product descriptions declared under shifting tariffs.` },
        { title: "Risk Demographics", description: `${criticalCount} Critical, ${highCount} High, and ${mediumCount} Medium entries tracked.` }
      ],
      anomalies: Array.from(new Set(evidenceList.flatMap(e => e.triggeredRules))),
      evidence: evidenceList,
      recommendations: [
        "Audit declaration routes involving products flagged for HS Code variance.",
        "Request physical verification certificates of origin on high-risk transport corridors.",
        "Perform deep transactional lookup on entities flagged with high relationship density.",
        "Compare pricing variances against globally established customs clearing averages."
      ],
      confidence: tradeData.length > 50 ? 95 : 70,
      charts: {}
    };

    return { augmentedData: augmented, intelligenceObject: generatedIntelligence };
  }, [tradeData]);

  useEffect(() => {
    if (intelligenceObject && registerIntelligence) {
      registerIntelligence("Shipment Ledger", intelligenceObject);
    }
  }, [intelligenceObject, registerIntelligence]);

  return { augmentedData, intelligenceObject };
}
