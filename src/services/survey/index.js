// ============================================================================
// P1 — SURVEY SERVICE           STATUS: STUB (written by P4)
// ----------------------------------------------------------------------------
// P1: your survey UI writes its result here. The screen is yours to design;
// only the returned object shape is frozen.
// ============================================================================
import { validateSurveyAnswers } from "../../contracts/index.js";
import { mockSurveyAnswers } from "../../data/mockData.js";

let _answers = null;

/** Called by the Survey screen when the user finishes. */
export async function saveSurveyAnswers(answers) {
  const errs = validateSurveyAnswers(answers);
  if (errs.length) console.warn("[survey] contract violation:", errs);
  _answers = answers;
  return answers;
}

/** @returns {Promise<import('../../contracts/survey.js').SurveyAnswers>} */
export async function getSurveyAnswers() {
  // ---- STUB BODY: returns mock until P1's screen is wired ----
  return _answers ?? { ...mockSurveyAnswers, completedAt: new Date().toISOString() };
  // ---- END STUB BODY ----
}
