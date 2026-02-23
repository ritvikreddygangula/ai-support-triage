const OpenAI = require('openai');
const { z } = require('zod');

const CATEGORIES = ['BILLING', 'ACCOUNT_LOGIN', 'BUG_CRASH', 'FEATURE_REQUEST', 'SHIPPING', 'GENERAL'];
const URGENCIES = ['LOW', 'MEDIUM', 'HIGH'];
const SENTIMENTS = ['CALM', 'FRUSTRATED', 'ANGRY'];

const llmOutputSchema = z.object({
  category: z.enum(CATEGORIES),
  urgency: z.enum(URGENCIES),
  sentiment: z.enum(SENTIMENTS),
  suggestedResponse: z.string().min(1),
  confidence: z.number().min(0).max(1),
  rationale: z.string().min(1),
});

const SYSTEM_PROMPT = `You classify support tickets. Respond with ONLY valid JSON, no markdown or extra text.

Schema:
{
  "category": "one of: BILLING, ACCOUNT_LOGIN, BUG_CRASH, FEATURE_REQUEST, SHIPPING, GENERAL",
  "urgency": "one of: LOW, MEDIUM, HIGH",
  "sentiment": "one of: CALM, FRUSTRATED, ANGRY",
  "suggestedResponse": "2-6 sentences, friendly and actionable reply to the customer",
  "confidence": number 0 to 1,
  "rationale": "1-2 sentences explaining your classification"
}`;

function buildUserPrompt(subject, description, customerEmail) {
  let text = `Subject: ${subject}\nDescription: ${description}`;
  if (customerEmail) text += `\nCustomer email: ${customerEmail}`;
  return text;
}

async function callOpenAI(content, fixJson = false) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const openai = new OpenAI({ apiKey });
  let userContent = buildUserPrompt(content.subject, content.description, content.customerEmail);
  if (fixJson) {
    userContent += '\n\nYour previous response had invalid JSON. Please respond with ONLY valid JSON that matches the schema exactly.';
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userContent },
    ],
    temperature: 0.3,
  });

  const rawText = response.choices[0]?.message?.content?.trim() || '';
  return rawText;
}

function parseAndValidate(rawText) {
  // Strip markdown code blocks if present
  let cleaned = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return { success: false, error: 'Invalid JSON' };
  }

  const result = llmOutputSchema.safeParse(parsed);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.message };
}

async function classifyTicket(ticket) {
  const content = {
    subject: ticket.subject,
    description: ticket.description,
    customerEmail: ticket.customerEmail,
  };

  let rawText = await callOpenAI(content, false);
  let validated = parseAndValidate(rawText);

  if (!validated.success) {
    rawText = await callOpenAI(content, true);
    validated = parseAndValidate(rawText);
  }

  if (validated.success) {
    return {
      modelName: 'gpt-4o-mini',
      rawModelText: rawText,
      parsedJson: validated.data,
      confidence: validated.data.confidence,
    };
  }

  // Fallback: store raw text, confidence 0, safe response
  return {
    modelName: 'gpt-4o-mini',
    rawModelText: rawText,
    parsedJson: {
      category: 'GENERAL',
      urgency: 'MEDIUM',
      sentiment: 'CALM',
      suggestedResponse: 'We need to manually review this ticket. Our team will get back to you shortly.',
      rationale: 'JSON validation failed',
    },
    confidence: 0,
  };
}

module.exports = { classifyTicket };
