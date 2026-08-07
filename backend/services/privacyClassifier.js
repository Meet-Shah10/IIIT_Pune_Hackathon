/**
 * services/privacyClassifier.js
 *
 * Hybrid privacy-sensitivity classifier: an LLM call for nuanced judgment,
 * plus a deterministic regex floor that force-upgrades anything the LLM
 * might soft-pedal (phone numbers, emails, medical/financial terms).
 *
 * Contract — this is the shape every other module should rely on, so
 * whoever builds the negotiation UI or the storage layer can start coding
 * against it immediately, independent of this file's internals:
 *
 *   classifySensitivity(memoryText, category) -> Promise<{
 *     memory: string,
 *     category: string,
 *     sensitivity: "low" | "medium" | "high" | "critical",
 *     source: "llm" | "rule_upgrade" | "llm+rule_upgrade",
 *     reasoning: string,
 *   }>
 *
 * Zero dependency on Express, the DB, or the chat flow — testable standalone
 * (see bottom of file / test/privacyClassifier.test.js).
 */

const { chatCompletion } = require("../config/nvidia");

// ---------------------------------------------------------------------------
// 1. Sensitivity tiers — ordered so we can take the max of rule vs LLM result
// ---------------------------------------------------------------------------

const TIER = { low: 0, medium: 1, high: 2, critical: 3 };
const TIER_NAME_BY_RANK = ["low", "medium", "high", "critical"];

// ---------------------------------------------------------------------------
// 2. Deterministic rule floor
//    These only ever push the tier UP, never down. Keep this list short and
//    high-precision — it exists to catch the unambiguous cases, not to do
//    the nuanced classification work (that's the LLM's job).
// ---------------------------------------------------------------------------

const RULE_FLOOR = [
  { pattern: /\b\d{10}\b|\+?\d{1,3}[-.\s]?\d{3,5}[-.\s]?\d{3,5}\b/, tier: "high", label: "phone-number-like pattern" },
  { pattern: /[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}/, tier: "high", label: "email address" },
  { pattern: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/, tier: "critical", label: "card-number-like pattern" },
  { pattern: /\b[A-Z]{5}\d{4}[A-Z]\b/, tier: "critical", label: "PAN-like ID pattern" },
  { pattern: /\b\d{4}\s?\d{4}\s?\d{4}\b/, tier: "critical", label: "Aadhaar-like ID pattern" },
  {
    pattern: /\b(diagnos(ed|is)|diabetes|cancer|hiv|depression|anxiety disorder|medication|prescription|therapy|mental health|surgery)\b/i,
    tier: "critical",
    label: "medical/health term",
  },
  {
    pattern: /\b(bank account|account number|salary|income|credit score|loan|debt|ifsc)\b/i,
    tier: "high",
    label: "financial term",
  },
  {
    pattern: /\b\d+\s+[A-Za-z0-9\s]+(street|st\.|road|rd\.|avenue|ave\.|apartment|apt\.|flat)\b/i,
    tier: "medium",
    label: "specific address",
  },
];

/**
 * @param {string} text
 * @returns {{ tier: string, label: string } | null}
 */
function ruleFloor(text) {
  let best = null;
  for (const rule of RULE_FLOOR) {
    if (rule.pattern.test(text)) {
      if (!best || TIER[rule.tier] > TIER[best.tier]) {
        best = { tier: rule.tier, label: rule.label };
      }
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// 3. LLM classification
// ---------------------------------------------------------------------------

const CLASSIFICATION_PROMPT = (memoryText, category) => `You classify how privacy-sensitive a piece of remembered
information about a user is, on this exact scale:

- low: harmless preference or fact (favourite colour, favourite food, programming language)
- medium: mildly personal but low-risk if exposed (current city, job title, hobby)
- high: personal contact/financial info, or something most people would not want shared casually (phone number, workplace, income bracket)
- critical: sensitive category data that could cause real harm if exposed (health/medical condition, sexuality, religion, immigration status, exact home address, government ID numbers)

Return ONLY valid JSON, no other text:
{"sensitivity": "low" | "medium" | "high" | "critical", "reasoning": "<one short sentence>"}

Memory to classify: "${memoryText}"
Category (if known): ${category || "unknown"}
`;

/**
 * @param {string} memoryText
 * @param {string} [category]
 * @returns {Promise<{ tier: string, reasoning: string }>}
 */
async function llmClassify(memoryText, category) {
  const prompt = CLASSIFICATION_PROMPT(memoryText, category);

  let raw;
  try {
    raw = await chatCompletion([{ role: "user", content: prompt }], { temperature: 0, jsonMode: true });
  } catch (err) {
    // Network/API failure — fail safe toward medium, never toward low.
    return { tier: "medium", reasoning: `LLM call failed (${err.message}); defaulted to medium as a safe fallback` };
  }

  try {
    const parsed = JSON.parse(raw);
    const tier = String(parsed.sensitivity || "").toLowerCase();
    if (!(tier in TIER)) throw new Error("unrecognised tier");
    return { tier, reasoning: parsed.reasoning || "" };
  } catch {
    return { tier: "medium", reasoning: "LLM response unparseable; defaulted to medium as a safe fallback" };
  }
}

// ---------------------------------------------------------------------------
// 4. Public entry point — combine rule floor + LLM, take the max
// ---------------------------------------------------------------------------

/**
 * @param {string} memoryText
 * @param {string} [category]
 * @returns {Promise<{memory: string, category: string, sensitivity: string, source: string, reasoning: string}>}
 */
async function classifySensitivity(memoryText, category) {
  const floor = ruleFloor(memoryText);
  const { tier: llmTier, reasoning: llmReasoning } = await llmClassify(memoryText, category);

  let finalTier, reasoning, source;
  if (floor && TIER[floor.tier] > TIER[llmTier]) {
    finalTier = floor.tier;
    reasoning = `Rule floor: ${floor.label}`;
    source = "rule_upgrade";
  } else if (floor) {
    finalTier = llmTier;
    reasoning = llmReasoning;
    source = "llm+rule_upgrade";
  } else {
    finalTier = llmTier;
    reasoning = llmReasoning;
    source = "llm";
  }

  return {
    memory: memoryText,
    category: category || "unknown",
    sensitivity: finalTier,
    source,
    reasoning,
  };
}

module.exports = { classifySensitivity, ruleFloor, llmClassify, TIER, TIER_NAME_BY_RANK };
