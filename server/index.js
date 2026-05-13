const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const pdfjsLib = require("pdfjs-dist"); // standard build
const skillsDatabase = require("./skills");

const app = express();

app.use(cors({
  origin: ["http://localhost:3000",
    "https://your-vercel-app.vercel.app"]
}));
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
    fs.unlinkSync(req.file.path);


    res.json({ text });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to parse PDF" });
  }
});

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
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
