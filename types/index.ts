export type ModuleType = "mediscan" | "voicebridge" | "docunlock" | "newsfilter" | "safetynet";

export type Severity = "low" | "medium" | "high" | "critical";
export type Status = "normal" | "warning" | "critical" | "abnormal";

// MediScan Types
export interface MediScanResult {
  patientSummary: {
    name: string;
    age: string;
    gender: string;
    bloodType: string;
  };
  vitalSigns: Array<{ name: string; value: string; status: string; note: string }>;
  diagnoses: Array<{ condition: string; icd10: string | null; severity: string; date: string | null }>;
  medications: Array<{ name: string; dosage: string; frequency: string; purpose: string }>;
  allergies: Array<{ allergen: string; reaction: string; severity: string }>;
  criticalFlags: Array<{ flag: string; urgency: string; action: string }>;
  labResults: Array<{ test: string; value: string; normalRange: string; status: string }>;
  recommendations: string[];
  confidenceScore: number;
  dataQuality: string;
  summary: string;
}

// VoiceBridge Types
export interface VoiceBridgeResult {
  transcription: string;
  detectedLanguage: string;
  intent: {
    primary: string;
    category: string;
    urgency: string;
    sentiment: string;
  };
  entities: Array<{ type: string; value: string; context: string }>;
  actionItems: Array<{ action: string; priority: string; assignedTo: string; deadline: string | null }>;
  keyFacts: string[];
  requestedServices: string[];
  suggestedResponse: string;
  flags: Array<{ type: string; description: string; severity: string }>;
  confidenceScore: number;
  summary: string;
}

// DocUnlock Types
export interface DocUnlockResult {
  documentType: string;
  documentDate: string | null;
  parties: Array<{ role: string; name: string; contact: string | null; identifier: string | null }>;
  keyFields: Array<{ field: string; value: string; confidence: string }>;
  importantClauses: Array<{ clause: string; implication: string; risk: string }>;
  numbers: Array<{ label: string; value: string; currency: string | null; type: string }>;
  dates: Array<{ label: string; date: string; significance: string }>;
  actions: Array<{ action: string; deadline: string | null; responsible: string }>;
  redFlags: Array<{ issue: string; severity: string; recommendation: string }>;
  summary: string;
  nextSteps: string[];
  confidenceScore: number;
  dataCompleteness: string;
}

// NewsFilter Types
export interface NewsFilterResult {
  headline: string;
  originalSource: string;
  publishDate: string | null;
  category: string;
  geography: { countries: string[]; cities: string[]; region: string | null };
  keyFacts: Array<{ fact: string; verifiable: boolean; confidence: string }>;
  claims: Array<{ claim: string; status: string; source: string | null }>;
  people: Array<{ name: string; role: string; organization: string | null }>;
  organizations: Array<{ name: string; type: string; role: string }>;
  timeline: Array<{ date: string; event: string }>;
  impactAssessment: { severity: string; affectedPopulation: string; urgency: string };
  misinformationRisk: string;
  biasIndicators: string[];
  actionableAlerts: Array<{ alert: string; for: string; priority: string }>;
  summary: string;
  confidenceScore: number;
}

// SafetyNet Types
export interface SafetyNetResult {
  emergencyType: string;
  severity: string;
  location: { described: string; landmarks: string[]; coordinates: null };
  personsInvolved: Array<{ role: string; description: string; condition: string | null }>;
  immediateRisks: Array<{ risk: string; probability: string; mitigation: string }>;
  responseActions: Array<{ action: string; priority: number; agency: string; timeFrame: string }>;
  resourcesNeeded: string[];
  communicationProtocol: { notifyAgencies: string[]; publicAlert: boolean; mediaGuidance: string };
  timeline: Array<{ time: string; action: string; status: string }>;
  confidenceScore: number;
  summary: string;
}

export type AnalysisResult = MediScanResult | VoiceBridgeResult | DocUnlockResult | NewsFilterResult | SafetyNetResult;

export interface AnalysisResponse {
  success: boolean;
  module: ModuleType;
  result?: AnalysisResult;
  error?: string;
  processingTime?: number;
}
