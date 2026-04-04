import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { API_URL } from "../config/api";
import axios from "axios";
import {
  Calendar,
  MapPin,
  Users,
  Search,
  Plus,
  Clock,
  Tag,
  ChevronRight,
  CalendarDays,
} from "lucide-react";

const Events: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Dummy data for demo (replace with API call when backend is ready)
  const DUMMY_EVENTS = [
    {
      _id: "1",
      title: "CodeWars 2026 - Inter College Coding Contest",
      description: "A 3-hour competitive coding contest with problems ranging from easy to hard. Top 3 winners get prizes and certificates!",
      banner: "",
      venue: "Computer Lab 301, Main Building",
      date: "2026-04-15T00:00:00.000Z",
      startTime: "10:00",
      endTime: "13:00",
      capacity: 100,
      eventType: "coding_contest",
      tags: ["coding", "dsa", "competitive"],
      college: { _id: "c1", name: "IIIT Sonepat", city: "Sonepat", logo: "" },
      createdBy: { _id: "u1", username: "organiser1", profile: { avatar: "" } },
      registrations: [
        { studentId: "s1", qrToken: "abc123", attended: false },
        { studentId: "s2", qrToken: "def456", attended: true },
      ],
      isActive: true,
    },
    {
      _id: "2",
      title: "Tech Quiz - DSA & System Design",
      description: "Rapid fire MCQ quiz covering Data Structures, Algorithms, and System Design. Test your knowledge in real-time against opponents!",
      banner: "",
      venue: "Seminar Hall, Block B",
      date: "2026-04-20T00:00:00.000Z",
      startTime: "14:00",
      endTime: "15:30",
      capacity: 60,
      eventType: "quiz",
      tags: ["quiz", "mcq", "system-design"],
      college: { _id: "c1", name: "IIIT Sonepat", city: "Sonepat", logo: "" },
      createdBy: { _id: "u1", username: "organiser1", profile: { avatar: "" } },
      registrations: [
        { studentId: "s3", qrToken: "ghi789", attended: false },
      ],
      isActive: true,
    },
    {
      _id: "3",
      title: "HackFest 2026 - 24hr Hackathon",
      description: "Build a complete project in 24 hours! Teams of 2-4 members. Themes: HealthTech, EdTech, FinTech. Exciting prizes for top 5 teams.",
      banner: "",
      venue: "Innovation Lab, Block C",
      date: "2026-05-01T00:00:00.000Z",
      startTime: "09:00",
      endTime: "09:00",
      capacity: 200,
      eventType: "hackathon",
      tags: ["hackathon", "team", "innovation"],
      college: { _id: "c1", name: "IIIT Sonepat", city: "Sonepat", logo: "" },
      createdBy: { _id: "u2", username: "profKumar", profile: { avatar: "" } },
      registrations: Array.from({ length: 45 }, (_, i) => ({
        studentId: `hs${i}`, qrToken: `hack${i}`, attended: false,
      })),
      isActive: true,
    },
    {
      _id: "4",
      title: "AI/ML Workshop - Intro to Deep Learning",
      description: "Hands-on workshop on Neural Networks, TensorFlow and PyTorch. Bring your laptop! Prerequisites: Basic Python knowledge.",
      banner: "",
      venue: "Lab 201, CS Block",
      date: "2026-04-25T00:00:00.000Z",
      startTime: "11:00",
      endTime: "14:00",
      capacity: 40,
      eventType: "workshop",
      tags: ["ai", "ml", "workshop", "python"],
      college: { _id: "c2", name: "NIT Kurukshetra", city: "Kurukshetra", logo: "" },
      createdBy: { _id: "u3", username: "drSharma", profile: { avatar: "" } },
      registrations: Array.from({ length: 38 }, (_, i) => ({
        studentId: `ws${i}`, qrToken: `wk${i}`, attended: false,
      })),
      isActive: true,
    },
    {
      _id: "5",
      title: "Tech Talk - How to Crack FAANG Interviews",
      description: "Guest speaker from Google sharing tips on cracking product-based company interviews. Open for all years.",
      banner: "",
      venue: "Auditorium, Main Building",
      date: "2026-04-18T00:00:00.000Z",
      startTime: "16:00",
      endTime: "18:00",
      capacity: 300,
      eventType: "seminar",
      tags: ["career", "interview", "faang"],
      college: { _id: "c1", name: "IIIT Sonepat", city: "Sonepat", logo: "" },
      createdBy: { _id: "u1", username: "organiser1", profile: { avatar: "" } },
      registrations: Array.from({ length: 150 }, (_, i) => ({
        studentId: `sem${i}`, qrToken: `sem${i}`, attended: false,
      })),
      isActive: true,
    },
    {
      _id: "6",
      title: "Annual Cultural Fest - Tarang 2026",
      description: "Music, dance, drama, art exhibitions and food stalls. The biggest cultural event of the year! Register for individual events.",
      banner: "",
      venue: "College Ground & Auditorium",
      date: "2026-05-10T00:00:00.000Z",
      startTime: "10:00",
      endTime: "22:00",
      capacity: 500,
      eventType: "cultural",
      tags: ["cultural", "music", "dance", "fest"],
      college: { _id: "c1", name: "IIIT Sonepat", city: "Sonepat", logo: "" },
      createdBy: { _id: "u4", username: "studentCouncil", profile: { avatar: "" } },
      registrations: Array.from({ length: 210 }, (_, i) => ({
        studentId: `cf${i}`, qrToken: `cf${i}`, attended: false,
      })),
      isActive: true,
    },
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/events?upcoming=true&limit=50`);
      setEvents(res.data.events || []);
    } catch (error) {
      console.error("Error fetching events, using dummy data:", error);
      // Fallback to dummy data when backend is not available
      setEvents(DUMMY_EVENTS);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      !search ||
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.venue.toLowerCase().includes(search.toLowerCase());

    const now = new Date();
    const eventDate = new Date(event.date);
    const matchesTime =
      filter === "all" ||
      (filter === "upcoming" && eventDate >= now) ||
      (filter === "past" && eventDate < now);

    const matchesType = typeFilter === "all" || event.eventType === typeFilter;

    return matchesSearch && matchesTime && matchesType;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      coding_contest: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      quiz: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      hackathon: "bg-green-500/20 text-green-400 border-green-500/30",
      seminar: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      workshop: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      cultural: "bg-red-500/20 text-red-400 border-red-500/30",
      general: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };
    return colors[type] || colors.general;
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      coding_contest: "Coding Contest",
      quiz: "Quiz",
      hackathon: "Hackathon",
      seminar: "Seminar",
      workshop: "Workshop",
      cultural: "Cultural",
      general: "General",
    };
    return labels[type] || "General";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1
            className={`text-3xl font-bold flex items-center gap-3 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            <CalendarDays className="text-orange-500" size={32} />
            Events
          </h1>
          <p className={isDark ? "text-gray-400 mt-1" : "text-gray-600 mt-1"}>
            Discover and register for college events
          </p>
        </div>

        {(user?.role === "organiser" || user?.role === "admin") && (
          <button
            onClick={() => navigate("/events/create")}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium"
          >
            <Plus size={18} />
            Create Event
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
              isDark
                ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
            } focus:outline-none focus:ring-2 focus:ring-orange-500`}
          />
        </div>

        <div className="flex gap-2">
          {["all", "upcoming", "past"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-orange-600 text-white"
                  : isDark
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Type Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          "all",
          "coding_contest",
          "quiz",
          "hackathon",
          "seminar",
          "workshop",
          "cultural",
          "general",
        ].map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              typeFilter === t
                ? "bg-orange-600 text-white border-orange-600"
                : isDark
                ? "bg-gray-800/50 text-gray-400 border-gray-700 hover:border-gray-600"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {t === "all" ? "All Types" : getEventTypeLabel(t)}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-20">
          <CalendarDays
            className={`mx-auto mb-4 ${
              isDark ? "text-gray-600" : "text-gray-300"
            }`}
            size={64}
          />
          <h3
            className={`text-xl font-semibold ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            No events found
          </h3>
          <p className={isDark ? "text-gray-500" : "text-gray-400"}>
            Check back later for upcoming events
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const isRegistered = event.registrations?.some(
              (r: any) =>
                r.studentId === user?.id ||
                r.studentId === user?._id ||
                r.studentId?._id === user?.id
            );
            const isFull = event.registrations?.length >= event.capacity;
            const isPast = new Date(event.date) < new Date();

            return (
              <div
                key={event._id}
                onClick={() => navigate(`/events/${event._id}`)}
                className={`rounded-xl border overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg ${
                  isDark
                    ? "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Banner */}
                <div className="h-40 bg-gradient-to-br from-orange-500 to-pink-600 relative">
                  {event.banner && (
                    <img
                      src={event.banner}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getEventTypeColor(
                        event.eventType
                      )}`}
                    >
                      {getEventTypeLabel(event.eventType)}
                    </span>
                  </div>
                  {isPast && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-900/70 text-gray-300">
                      Ended
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3
                    className={`text-lg font-bold mb-2 line-clamp-1 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {event.title}
                  </h3>
                  <p
                    className={`text-sm mb-3 line-clamp-2 ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {event.description}
                  </p>

                  <div className="space-y-1.5">
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      <Calendar size={14} />
                      <span>{formatDate(event.date)}</span>
                      <Clock size={14} className="ml-2" />
                      <span>
                        {event.startTime} - {event.endTime}
                      </span>
                    </div>
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      <MapPin size={14} />
                      <span className="line-clamp-1">{event.venue}</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      <Users size={14} />
                      <span>
                        {event.registrations?.length || 0} / {event.capacity}{" "}
                        registered
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div
                  className={`px-4 py-3 border-t flex items-center justify-between ${
                    isDark ? "border-gray-700" : "border-gray-100"
                  }`}
                >
                  {isRegistered ? (
                    <span className="text-sm font-medium text-green-500">
                      Registered
                    </span>
                  ) : isFull ? (
                    <span className="text-sm font-medium text-red-400">
                      Full
                    </span>
                  ) : isPast ? (
                    <span className="text-sm text-gray-500">Event ended</span>
                  ) : (
                    <span className="text-sm font-medium text-orange-500">
                      Register Now
                    </span>
                  )}
                  <ChevronRight
                    size={16}
                    className={isDark ? "text-gray-500" : "text-gray-400"}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Events;
