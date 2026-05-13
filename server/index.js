const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const pdfjsLib = require("pdfjs-dist"); // standard build
const { getSemanticScore } = require("./aiMatcher");
const skillsDatabase = require("./skills");

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/\.js/g, "js")
    .replace(/[^a-z0-9\s]/g, " ");
}

function extractSkills(text) {
  const normalized = normalizeText(text);

  const skills = [
    "react",
    "node",
    "mongodb",
    "express",
    "javascript",
    "python",
    "sql",
    "aws",
    "docker",
    "redux",
    "html",
    "css"
  ];

  return skills.filter(skill =>
    normalized.includes(skill)
  );
}
async function extractPdfText(filePath) {
  const dataBuffer = new Uint8Array(fs.readFileSync(filePath));

  const pdf = await pdfjsLib.getDocument({
    data: dataBuffer,
  }).promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);

    const content = await page.getTextContent();

    const strings = content.items.map((item) => item.str);

    text += strings.join(" ");
  }

  return text;
}
app.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No file uploaded" });

    const text = await extractPdfText(req.file.path);


    res.json({ text });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to parse PDF" });
  }
});

function extractSkills(text) {
  const skills = ["react","node","mongodb","express","javascript","python","sql","aws","docker","redux"];
  return skills.filter(skill => text.toLowerCase().includes(skill));
}
function generateExplanation(score, matched, missing) {
  if (score >= 80) {
    return [
      "Strong candidate profile detected",
      `Matched technical skills: ${matched.join(", ")}`,
      "Resume aligns well with core job requirements",
      "Recommended for interview shortlist"
    ];
  }

  if (score >= 50) {
    return [
      "Moderate alignment with job requirements",
      `Matched skills: ${matched.join(", ")}`,
      `Missing skills: ${missing.join(", ")}`,
      "Candidate may require additional upskilling"
    ];
  }

  return [
    "Low compatibility with current job role",
    `Missing important skills: ${missing.join(", ")}`,
    "Resume requires stronger alignment with job requirements"
  ];
}
function generateSuggestions(missing) {
  if (missing.length === 0) {
    return [
      "Your resume is well aligned with the job description."
    ];
  }

  return missing.map(
    (skill) =>
      `Consider adding or improving ${skill} related experience/projects in your resume.`
  );
}
function getScore(resumeText, jdText) {
  const normalize = (text) =>
    text
      .toLowerCase()
      .replace(/react\.js/g, "react")
      .replace(/node\.js/g, "node")
      .replace(/express\.js/g, "express")
      .replace(/[^a-z0-9\s]/g, " ");

  const resume = normalize(resumeText);
  const jd = normalize(jdText);

  

  // Extract skills from JD
  const jdSkills = skillsDatabase.filter((skill) =>
    jd.includes(skill)
  );

  // Extract skills from Resume
  const resumeSkills = skillsDatabase.filter((skill) =>
    resume.includes(skill)
  );

  // Find matched skills
  const matched = jdSkills.filter((skill) =>
    resumeSkills.includes(skill)
  );

  // Find missing skills
  const missing = jdSkills.filter(
    (skill) => !resumeSkills.includes(skill)
  );

  const total = jdSkills.length;

  const score =
    total === 0
      ? 0
      : Math.round((matched.length / total) * 100);

  return {
    score,
    matched,
    missing,
  };
}
function extractKeywords(text) {
  const stopwords = ["the","and","with","to","for","of","in","on","at","by","an","a"];
  return text
    .toLowerCase()
    .split(/[^a-zA-Z]+/) // split by non-letters
    .filter(word => word.length > 2 && !stopwords.includes(word));
}
app.post("/match", async (req, res) => {
  const { resumeText, jobDescription } = req.body;

  const result = getScore(resumeText, jobDescription);

  

  const semanticScore = result.score;

  const finalScore = Math.round(
    (result.score + semanticScore) / 2
  );
console.log("FINAL RESPONSE:", {
  score: finalScore,
  matched: result.matched,
  missing: result.missing,
  explanation: generateExplanation(
    finalScore,
    result.matched,
    result.missing
  ),
});
  res.json({
    score: finalScore,
    matched: result.matched,
    missing: result.missing,
    explanation: generateExplanation(
      finalScore,
      result.matched,
      result.missing
    ),
    suggestions: generateSuggestions(result.missing),
  });
});
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
