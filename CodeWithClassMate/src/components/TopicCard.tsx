import CountUp from "react-countup";
import useInView from "../hooks/useInView";
import { Link } from "react-router-dom";

const TopicCard = ({ topic, isDark, statsLoading }) => {
  const [ref, isVisible] = useInView();

  return (
    <Link
      to={`/problems?tags=${encodeURIComponent(topic.filter)}`}
      ref={ref}   // ✅ SINGLE REF
      className={`group relative overflow-hidden rounded-3xl transition-all duration-500 flex-shrink-0 w-80 h-72 md:h-80 hover:scale-105 hover:shadow-2xl ${
        isDark
          ? "bg-gray-800/50 border-2 border-white/30 hover:bg-gray-800/80 hover:border-white/50"
          : "bg-white/90 border-2 border-gray-200/60 hover:bg-white hover:border-gray-300/80 shadow-lg hover:shadow-xl"
      } backdrop-blur-sm`}
    >
      {/* Gradient Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${topic.color} opacity-0 ${
          isDark ? "group-hover:opacity-20" : "group-hover:opacity-15"
        } transition-all duration-500`}
      />

      <div className="relative p-8 h-full flex flex-col justify-between">
        {/* Top Section */}
        <div>
          <div
            className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${topic.color} text-white mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}
          >
            {topic.icon}
          </div>

          <h3
            className={`text-xl font-bold mb-3 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {topic.title}
          </h3>

          <p
            className={`text-sm leading-relaxed ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {topic.description}
          </p>
        </div>

        {/* Bottom Section */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {statsLoading
                ? "..."
                : isVisible && (
                    <CountUp
                      end={topic.problems}
                      separator=","
                      duration={1.5}
                    />
                  )}
            </div>

            <div
              className={`text-xs ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              problems
            </div>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${topic.color} text-white shadow-lg`}
          >
            {topic.difficulty}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TopicCard;
