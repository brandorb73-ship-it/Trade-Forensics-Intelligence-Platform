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

    const productToHsCodes = new Map();

    // Pass 1: Baseline Analysis & Normalization
    tradeData.forEach((row) => {
      // Clean numeric values to prevent NaN
      const cleanAmount = parseFloat(row.Amount?.toString().replace(/[^0-9.-]+/g, "")) || 0;
      const cleanQty = parseFloat(row.Quantity?.toString().replace(/[^0-9.-]+/g, "")) || 0;
      
      totalValue += cleanAmount;
      totalQty += cleanQty;
      
      if (row.Exporter) exporters.add(row.Exporter);
      if (row.Importer) importers.add(row.Importer);
      if (row.Brand) brands.add(row.Brand);
      if (row.Product) products.add(row.Product);
      if (row.HSCode) hsCodes.add(row.HSCode);
      if (row.OriginCountry) origins.add(row.OriginCountry);
      if (row.DestinationCountry) destinations.add(row.DestinationCountry);

      const routeKey = `${row.OriginCountry} ➔ ${row.DestinationCountry}`;
      routes.set(routeKey, (routes.get(routeKey) || 0) + 1);

      if (row.Product && row.HSCode) {
        // Normalize product descriptions to catch hidden variance (e.g., casing/spaces)
        const normProduct = row.Product.toString().toLowerCase().trim();
        const normHs = row.HSCode.toString().trim();
        if (!productToHsCodes.has(normProduct)) {
          productToHsCodes.set(normProduct, new Set());
        }
        productToHsCodes.get(normProduct).add(normHs);
      }
    });

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

    // Pass 2: Risk Flagging with Explicit Threshold Context
    const augmented = tradeData.map((row) => {
      const flags = [];
      let riskScore = 'Low';
      let riskWeight = 0;
      const normProduct = row.Product?.toString().toLowerCase().trim();
      const hasHsVariance = normProduct ? productsWithVariance.has(normProduct) : false;

      if (hasHsVariance) {
        flags.push('HS Code Variance Detected (+2 pts)');
        riskWeight += 2;
      }

      if (row.hsRisk === 'high') {
        flags.push('Potential Origin Manipulation / HS Disguise (+3 pts)');
        riskWeight += 3;
      }

      const cleanAmount = parseFloat(row.Amount?.toString().replace(/[^0-9.-]+/g, "")) || 0;
      if (cleanAmount > 500000) {
        flags.push('High Value Transaction Threshold Met (+1 pt)');
        riskWeight += 1;
      }

      // Explicit Threshold Mapping
      let riskContext = "Routine verification.";
      if (riskWeight >= 4) {
        riskScore = 'Critical';
        riskContext = `Threshold Met (Score: ${riskWeight} >= 4 pts). Mandatory audit required.`;
        criticalCount++;
      } else if (riskWeight >= 2) {
        riskScore = 'High';
        riskContext = `Threshold Met (Score: ${riskWeight} >= 2 pts). Elevated scrutiny advised.`;
        highCount++;
      } else if (riskWeight === 1) {
        riskScore = 'Medium';
        riskContext = `Threshold Met (Score: ${riskWeight} = 1 pt). Standard review.`;
        mediumCount++;
      }

      totalRiskPoints += riskWeight;

      const augmentedRow = { 
        ...row, 
        riskScore, 
        riskContext,
        riskWeight,
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
          weight: row.Weight,
          transportMode: row.TransportMode,
          value: row.Amount,
          unitPrice: row.UnitPrice,
          riskScore,
          triggeredRules: flags,
          explanation: `Transaction flagged containing anomalies: ${flags.join(', ')}.`
        });
      }

      return augmentedRow;
    });

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
