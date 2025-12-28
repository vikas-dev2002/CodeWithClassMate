import CountUp from "react-countup";
import useInView from "../hooks/useInView";
import { Link } from "react-router-dom";
import { TrendingUp, Building2 } from "lucide-react";

const CompanyCard = ({ company, isDark, statsLoading }) => {
  const [ref, isVisible] = useInView();

  return (
    <Link
      to={`/company/${encodeURIComponent(company.name)}`}
      className={`group relative overflow-hidden rounded-3xl transition-all duration-500 flex-shrink-0 w-64 sm:w-80 h-96 sm:h-[480px] hover:scale-105 hover:shadow-2xl ${
        isDark
          ? `bg-gradient-to-br ${company.darkBgGradient} border-2 border-white/30 hover:bg-gray-800/80 hover:border-white/50`
          : `bg-gradient-to-br ${company.bgGradient} border-2 border-black/30 hover:bg-gray-50 hover:border-black/50`
      } backdrop-blur-sm`}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${company.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
      />

      {/* ✅ SINGLE REF PER CARD */}
      <div ref={ref} className="relative h-full flex flex-col">

        {/* Logo Section */}
        <div className="h-32 sm:h-48 overflow-hidden rounded-t-3xl relative">
          <img
            src={company.logo || "/placeholder.svg"}
            alt={company.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Company Badge */}
          <div className="absolute top-4 left-4">
            <div
              className={`flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm ${company.textColor}`}
            >
              <Building2 className="h-3 w-3 mr-1" />
              {company.name}
            </div>
          </div>

          {/* Acceptance Rate */}
          <div className="absolute top-4 right-4">
            <div className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
              <TrendingUp className="h-3 w-3 mr-1" />
              {isVisible && (
                <CountUp
                  end={Number(company.stats.avgAcceptanceRate)}
                  decimals={2}
                  suffix="%"
                  duration={2}
                />
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <h3
              className={`text-2xl font-bold mb-3 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {company.name}
            </h3>

            <p
              className={`text-sm mb-6 leading-relaxed ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Master {company.name} interview questions with curated problems and real interview experiences.
            </p>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Total Problems
              </span>
              <span
                className={`text-2xl font-bold ${company.textColor} ${
                  isDark ? company.darkTextColor : ""
                }`}
              >
                {statsLoading
                  ? "..."
                  : isVisible && (
                      <CountUp end={company.stats.count} separator="," />
                    )}
              </span>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              {[
                ["Easy", "bg-green-500", company.stats.easyCount],
                ["Medium", "bg-yellow-500", company.stats.mediumCount],
                ["Hard", "bg-red-500", company.stats.hardCount],
              ].map(([label, color, value]) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${color} mr-2`} />
                    <span className={isDark ? "text-gray-300" : "text-gray-600"}>
                      {label}
                    </span>
                  </div>
                  <span className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    {isVisible && <CountUp end={value} />}
                  </span>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className={`w-full rounded-full h-2 ${isDark ? "bg-gray-700" : "bg-gray-200"}`}>
                <div
                  className={`bg-gradient-to-r ${company.color} h-2 rounded-full transition-all duration-1000`}
                  style={{ width: `${Math.min(company.stats.avgAcceptanceRate, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs">
                <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                  Success Rate
                </span>
                <span className={`font-medium ${company.textColor}`}>
                  {isVisible && (
                    <CountUp
                      end={company.stats.avgAcceptanceRate}
                      decimals={2}
                      suffix="%"
                    />
                  )}
                </span>
              </div>
            </div>

            {/* Submissions */}
            <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Total Submissions
              </span>
              <span className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                {isVisible && (
                  <CountUp end={company.stats.totalSubmissions} separator="," />
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CompanyCard;
