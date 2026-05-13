import { useState } from "react";
import axios from "axios";
import ResultCard from "./ResultCard";
import Loader from "./Loader";

const API_URL = import.meta.env.VITE_API_URL;

function UploadSection() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
  if (!file || !jobDescription) {
    alert("Please upload resume and add job description");
    return;
  }

  try {
    setLoading(true);

    // 1. Upload resume PDF
    const formData = new FormData();
    formData.append("resume", file);

    const uploadResponse = await axios.post(
     `${API_URL}/upload`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    console.log("UPLOAD RESPONSE:", uploadResponse);

    const resumeText = uploadResponse.data.text;

    // 2. Send for matching
    const matchResponse = await axios.post(
       `${API_URL}/match`,
      {
        resumeText,
        jobDescription,
      }
    );

    setResult(matchResponse.data);
  } catch (error) {
    console.error("ERROR:", error);
    alert("Something went wrong while analyzing resume");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="w-full max-w-4xl rounded-3xl bg-slate-800 p-8 shadow-2xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-cyan-400">
          AI Resume Screening System
        </h1>
        <p className="mt-3 text-slate-300">
          Upload resume and compare with job description using AI logic
        </p>
      </div>

      {/* Upload Resume */}
      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-lg font-semibold">
            Upload Resume (PDF)
          </label>

          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full rounded-xl border border-slate-600 bg-slate-700 p-4 text-white"
          />
        </div>

        {/* Job Description */}
        <div>
          <label className="mb-2 block text-lg font-semibold">
            Job Description
          </label>

          <textarea
            rows="8"
            placeholder="Paste Job Description Here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full rounded-xl border border-slate-600 bg-slate-700 p-4 text-white outline-none"
          />
        </div>

        {/* Button */}
        <button
          onClick={handleAnalyze}
          className="w-full rounded-xl bg-cyan-400 px-6 py-4 text-lg font-bold text-black transition hover:bg-cyan-300"
        >
          Analyze Resume
        </button>

        {/* Loader */}
        {loading && <Loader />}

        {/* Result */}
        {result && <ResultCard result={result} />}
      </div>
    </div>
  );
}

export default UploadSection;