require("dotenv").config();

const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const analyzeResumeWithAI = async ({
  resumeText,
  skills
}) => {
  const prompt = `
You are an expert technical recruiter and resume evaluator.

Analyze the following candidate resume.

RESUME TEXT:
${resumeText}

DETECTED SKILLS:
${skills.join(", ")}

Return ONLY valid JSON with this exact structure:

{
  "score": 0,
  "summary": "",
  "strengths": [],
  "weaknesses": [],
  "missingSkills": [],
  "suggestions": []
}

Rules:
- score must be between 0 and 100.
- strengths should contain 3 to 5 points.
- weaknesses should contain 2 to 5 points.
- missingSkills should contain relevant skills the candidate should consider learning.
- suggestions should contain 3 to 5 practical improvements.
- Do not invent experience that is not present in the resume.
`;

  const response = await client.responses.create({
    model: "gpt-5-mini",
    input: prompt
  });

  const output = response.output_text;

  try {
    return JSON.parse(output);
  } catch (error) {
    console.error("AI returned invalid JSON:", output);
    throw new Error(
      "AI returned an invalid analysis format"
    );
  }
};

module.exports = {
  analyzeResumeWithAI
};