export function parseAnalysis(text: string) {
  const extract = (key: string) => {
    const regex = new RegExp(`${key}:\\s*(.+)`, "i");
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  };

  return {
    verdict: extract("VERDICT"),
    confidence: extract("CONFIDENCE"),
    signalTier: extract("SIGNAL TIER"),
    primaryBet: extract("PRIMARY BET"),
    secondaryBet: extract("SECONDARY BET"),
    ev: extract("EV"),
    zComposite: extract("Z_COMPOSITE"),
    sosFlag: extract("SoS FLAG"),
    h2hSignal: extract("H2H SIGNAL"),
    dataStatus: extract("DATA STATUS"),
    impactSubRisk: extract("IMPACT SUB RISK"),
    rivalry: extract("RIVALRY"),
  };
}