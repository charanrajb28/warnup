// ─── Core result types matching enterprise prompts ─────────────────────────

export type ModuleType = "mediscan" | "voicebridge" | "docunlock" | "newsfilter" | "safetynet";

// ── MediScan ────────────────────────────────────────────────────────────────
export interface MediScanResult {
  patientSummary: { name: string; age: string; gender: string; bloodType: string; bmi?: string; smokingStatus?: string };
  charlsonComorbidityIndex?: { score: number; interpretation: string; tenYearSurvivalRate: string; conditions: string[] };
  vitalSigns: Array<{ name: string; value: string; unit?: string; status: string; note: string }>;
  diagnoses: Array<{ condition: string; icd10: string; severity: string; acuity?: string; date?: string; evidence?: string }>;
  differentialDiagnoses?: Array<{ condition: string; probability: string; distinguishingFeature: string }>;
  medications: Array<{ name: string; genericName?: string; dosage: string; frequency: string; route?: string; purpose: string; adherenceRisk?: string }>;
  drugInteractions?: Array<{ drug1: string; drug2: string; severity: string; effect: string; recommendation: string }>;
  allergies: Array<{ allergen: string; type?: string; reaction: string; severity: string; crossReactivity?: string[] }>;
  riskScores?: Array<{ scoreName: string; score: string; interpretation: string; recommendation: string }>;
  labResults: Array<{ test: string; value: string; unit?: string; normalRange: string; status: string; clinicalSignificance?: string }>;
  criticalFlags: Array<{ flag: string; urgency: string; potentialConsequence?: string; immediateAction: string; timeframe?: string }>;
  soapNote?: { subjective: string; objective: string; assessment: string; plan: string };
  careProtocol?: { immediateActions: string[]; shortTermPlan: string[]; longTermManagement: string[]; specialistReferrals: string[]; followUpSchedule: string; patientEducation: string[] };
  triagePriority?: string;
  recommendations: string[];
  confidenceScore: number;
  dataQuality: string;
  summary: string;
}

// ── VoiceBridge ─────────────────────────────────────────────────────────────
export interface VoiceBridgeResult {
  transcription: string;
  rawTranscription?: string;
  detectedLanguage: string;
  speakers?: Array<{ id: string; role: string; wordCount: number; dominance: number }>;
  emotionTimeline?: Array<{ timestamp: string; speaker: string; emotion: string; intensity: string; trigger?: string }>;
  intent: { primary: string; secondary?: string[]; category: string; urgency: string; sentiment: string; escalationTrigger?: boolean };
  entities: Array<{ type: string; value: string; context: string; sensitive?: boolean }>;
  complianceFlags?: Array<{ type: string; description: string; severity: string; recommendation: string }>;
  actionItems: Array<{ action: string; priority: string; assignedTo: string; department?: string; deadline?: string }>;
  crmFields?: { contactReason: string; resolutionStatus: string; caseCategory: string; priority: string; suggestedQueue: string; callDisposition: string; followUpRequired: boolean; followUpDate?: string };
  keyFacts: string[];
  requestedServices: string[];
  suggestedResponse: string;
  escalationPath?: string[];
  flags: Array<{ type: string; description: string; severity: string }>;
  confidenceScore: number;
  summary: string;
  executiveSummary?: string;
}

// ── DocUnlock ────────────────────────────────────────────────────────────────
export interface DocUnlockResult {
  documentType: string;
  documentSubtype?: string;
  jurisdiction?: string;
  governingLaw?: string;
  documentDate?: string;
  effectiveDate?: string;
  expirationDate?: string;
  parties: Array<{ role: string; name: string; entityType?: string; contact?: string; signatoryAuthority?: string }>;
  keyFields: Array<{ field: string; value: string; confidence: string; pageRef?: string }>;
  obligationMatrix?: Array<{ party: string; obligation: string; deadline?: string; condition?: string; consequence: string; priority: string }>;
  importantClauses: Array<{ clauseName?: string; clause: string; implication: string; riskRating: string; recommendation?: string }>;
  complianceChecklist?: Array<{ regulation: string; status: string; finding: string; remediation?: string }>;
  financialTerms?: { totalValue?: string; currency?: string; paymentSchedule: string[]; penalties: string[] };
  numbers: Array<{ label: string; value: string; currency?: string; type: string; context?: string }>;
  dates: Array<{ label: string; date: string; significance: string; urgency?: string }>;
  terminationClauses?: Array<{ trigger: string; noticePeriod: string; consequences: string }>;
  liabilityExposure?: { capAmount?: string; exclusions: string[]; indemnification: string[] };
  redFlags: Array<{ issue: string; severity: string; legalRisk?: string; recommendation: string; urgency?: string }>;
  riskScore?: { overall: number; legal: number; financial: number; operational: number };
  actions: Array<{ action: string; deadline?: string; responsible: string; priority?: string }>;
  summary: string;
  legalSummary?: string;
  nextSteps: string[];
  confidenceScore: number;
  dataCompleteness: string;
}

// ── NewsFilter ───────────────────────────────────────────────────────────────
export interface NewsFilterResult {
  headline: string;
  suggestedAccurateHeadline?: string;
  originalSource: string;
  sourceCredibilityScore?: number;
  sourceCredibilityReason?: string;
  publishDate?: string;
  category: string;
  geography: { countries: string[]; cities: string[]; region?: string };
  keyFacts: Array<{ fact: string; verifiable: boolean; confidence: string; sources?: string[] }>;
  claims: Array<{ claim: string; claimType?: string; status: string; contradictingEvidence?: string; source?: string; explanation?: string }>;
  propagandaTechniques?: Array<{ technique: string; example: string; severity: string }>;
  biasAnalysis?: { politicalLeaning?: string; framing: string; omissions: string[]; loadedLanguage: string[]; emotionalAppeal?: string };
  people: Array<{ name: string; role: string; organization?: string; quoted?: boolean }>;
  organizations: Array<{ name: string; type: string; role: string; credibility?: string }>;
  timeline: Array<{ date: string; event: string; source?: string }>;
  impactAssessment: { severity: string; affectedPopulation: string; urgency: string; economicImpact?: string; stabilityRisk?: string };
  osintClassification?: { informationType: string; relevantToSectors: string[]; geopoliticalRisk: string; marketSensitivity: string };
  misinformationRisk: string;
  actionableAlerts: Array<{ alert: string; for: string; priority: string; action?: string }>;
  summary: string;
  analystBrief?: string;
  confidenceScore: number;
}

// ── SafetyNet ────────────────────────────────────────────────────────────────
export interface SafetyNetResult {
  incidentId?: string;
  emergencyType: string;
  emergencySubtype?: string;
  icsLevel?: string;
  severity: string;
  location: { described: string; landmarks: string[]; accessRoutes?: string[]; evacuationZones?: string[]; jurisdiction?: string };
  incidentCommandStructure?: { commandPost?: string; sections?: { operations: string; planning: string; logistics: string; finance: string } };
  personsInvolved: Array<{ role: string; description: string; condition?: string; triageTag?: string; location?: string }>;
  casualtyAssessment?: { estimated: { total: number; critical: number; serious: number; minor: number; fatalities: number } };
  triageProtocol?: { system: string; immediateActions: string[]; treatmentSectors: string[] };
  immediateRisks: Array<{ risk: string; probability: string; impact?: string; mitigation: string; timeframe?: string }>;
  hazmatAssessment?: { present: boolean; substance?: string; level?: string; ppeRequired?: string[]; evacuationRadius?: string };
  responseActions: Array<{ action: string; priority: number; agency: string; nimsResourceType?: string; timeFrame: string; status?: string }>;
  resourcesNeeded: string[] | Array<{ resource: string; quantity: string; priority: string }>;
  communicationPlan?: { notifyAgencies: string[]; mutualAidActivated?: boolean; publicAlert: boolean; mediaGuidance: string };
  evacuationPlan?: { required: boolean; zones: string[]; routes: string[]; shelterLocations: string[] };
  timeline: Array<{ time: string; action: string; status: string; unit?: string }>;
  confidenceScore: number;
  summary: string;
  commandBrief?: string;
}

export type AnalysisResult = MediScanResult | VoiceBridgeResult | DocUnlockResult | NewsFilterResult | SafetyNetResult;

export interface AnalysisResponse {
  success: boolean;
  module: ModuleType;
  result?: AnalysisResult;
  error?: string;
  processingTime?: number;
}
