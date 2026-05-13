function ResultCard({ result }) {
  const getColor = (score) => {
    if (score >= 75) return "bg-green-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getTextColor = (score) => {
    if (score >= 75) return "text-green-400";
    if (score >= 40) return "text-yellow-400";
    return "text-red-400";
  };
  

  return (
    <div className="mt-8 rounded-2xl bg-slate-800 p-6 shadow-lg">
      <h2 className="mb-6 text-2xl font-bold text-cyan-400">
        Analysis Result
      </h2>

      {/* SCORE SECTION */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Match Score</p>

          <p className={`text-xl font-bold ${getTextColor(result.score)}`}>
            {result.score}%
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-4 w-full rounded-full bg-slate-700">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${getColor(
              result.score
            )}`}
            style={{ width: `${result.score}%` }}
          />
          <br/>
          <br/>
          <p className="mt-5 text-lg font-semibold text-cyan-300">
  {result.score >= 80
    ? "Excellent Match"
    : result.score >= 60
    ? "Good Match"
    : result.score >= 40
    ? "Moderate Match"
    : "Low Match"}
</p>
        </div>
      </div>
      <div className="mt-4">
  {result.score >= 80 ? (
    <span className="rounded-full bg-green-500 px-4 py-2 text-white font-bold">
      Recommended
    </span>
  ) : result.score >= 50 ? (
    <span className="rounded-full bg-yellow-500 px-4 py-2 text-black font-bold">
      Consider
    </span>
  ) : (
    <span className="rounded-full bg-red-500 px-4 py-2 text-white font-bold">
      Not Recommended
    </span>
  )}
</div>

      <p className="mt-10 text-slate-400">
  AI-powered ATS compatibility analysis based on resume-job matching.
</p>

      {/* SKILLS SECTION */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* MATCHED */}
        <div>
          <h3 className="mb-3 text-xl font-semibold text-green-400">
            Matched Skills
          </h3>

          {result.matched.length === 0 ? (
            <p className="text-slate-400">No matching skills found</p>
          ) : (
            <ul className="space-y-2">
              {result.matched.map((skill, index) => (
                <li
                  key={index}
                  className="rounded-lg bg-slate-700 px-3 py-2"
                >
                  ✅ {skill}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* MISSING */}
        <div>
          <h3 className="mb-3 text-xl font-semibold text-red-400">
            Missing Skills
          </h3>

          {result.missing.length === 0 ? (
            <p className="text-slate-400">No missing skills 🎉</p>
          ) : (
            <ul className="space-y-2">
              {result.missing.map((skill, index) => (
                <li
                  key={index}
                  className="rounded-lg bg-slate-700 px-3 py-2"
                >
                  ❌ {skill}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {/* AI ANALYSIS */}
<div className="mt-8 rounded-2xl bg-slate-900 p-5">
  <h3 className="mb-4 text-2xl font-bold text-cyan-400">
    AI Analysis
  </h3>
  {/* SUGGESTIONS */}


  <ul className="space-y-3">
    {result.explanation &&
      result.explanation.map((item, index) => (
        <li
          key={index}
          className="rounded-lg bg-slate-800 p-3 text-slate-300"
        >
          🤖 {item}
        </li>
      ))}
  </ul>
</div>
    </div>
  );
}

export default ResultCard;