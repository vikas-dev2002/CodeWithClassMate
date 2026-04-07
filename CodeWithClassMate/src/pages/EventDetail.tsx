import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { API_URL } from "../config/api";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowLeft,
  CheckCircle,
  XCircle,
  QrCode,
  Trash2,
  Edit3,
  User,
  Code,
  Trophy,
  Swords,
  Zap,
  BookOpen,
  Brain,
  MessageSquare,
  BarChart3,
} from "lucide-react";

const EventDetail: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [scanInput, setScanInput] = useState("");
  const [showAttendees, setShowAttendees] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  // Dummy events for demo
  const DUMMY_EVENTS: Record<string, any> = {
    "1": {
      _id: "1",
      title: "CodeWars 2026 - Inter College Coding Contest",
      description: "A 3-hour competitive coding contest with problems ranging from easy to hard. Top 3 winners get prizes and certificates! Languages allowed: C++, Java, Python. Each problem has multiple test cases. Scoring is based on correctness and time taken.",
      banner: "",
      venue: "Computer Lab 301, Main Building",
      date: "2026-04-15T00:00:00.000Z",
      startTime: "10:00",
      endTime: "13:00",
      capacity: 100,
      eventType: "coding_contest",
      tags: ["coding", "dsa", "competitive"],
      college: { _id: "c1", name: "IIIT Sonepat", city: "Sonepat" },
      createdBy: { _id: "u1", username: "organiser1" },
      registrations: [
        { studentId: { _id: "s1", username: "rahul_dev", email: "rahul@test.com" }, qrToken: "abc123", attended: false },
        { studentId: { _id: "s2", username: "priya_codes", email: "priya@test.com" }, qrToken: "def456", attended: true, attendedAt: "2026-04-15T10:05:00.000Z" },
        { studentId: { _id: "s3", username: "amit_js", email: "amit@test.com" }, qrToken: "ghi789", attended: false },
      ],
      isActive: true,
    },
    "2": {
      _id: "2",
      title: "Tech Quiz - DSA & System Design",
      description: "Rapid fire MCQ quiz covering Data Structures, Algorithms, and System Design. Test your knowledge in real-time against opponents! 30 questions, 60 seconds each. Negative marking applies.",
      banner: "",
      venue: "Seminar Hall, Block B",
      date: "2026-04-20T00:00:00.000Z",
      startTime: "14:00",
      endTime: "15:30",
      capacity: 60,
      eventType: "quiz",
      tags: ["quiz", "mcq", "system-design"],
      college: { _id: "c1", name: "IIIT Sonepat", city: "Sonepat" },
      createdBy: { _id: "u1", username: "organiser1" },
      registrations: [
        { studentId: { _id: "s3", username: "amit_js" }, qrToken: "quiz001", attended: false },
        { studentId: { _id: "s4", username: "neha_py" }, qrToken: "quiz002", attended: true, attendedAt: "2026-04-20T13:55:00.000Z" },
      ],
      isActive: true,
    },
    "3": {
      _id: "3",
      title: "HackFest 2026 - 24hr Hackathon",
      description: "Build a complete project in 24 hours! Teams of 2-4 members. Themes: HealthTech, EdTech, FinTech. Exciting prizes for top 5 teams. Mentors from industry will be available throughout.",
      banner: "",
      venue: "Innovation Lab, Block C",
      date: "2026-05-01T00:00:00.000Z",
      startTime: "09:00",
      endTime: "09:00",
      capacity: 200,
      eventType: "hackathon",
      tags: ["hackathon", "team", "innovation"],
      college: { _id: "c1", name: "IIIT Sonepat", city: "Sonepat" },
      createdBy: { _id: "u2", username: "profKumar" },
      registrations: Array.from({ length: 45 }, (_, i) => ({
        studentId: { _id: `hs${i}`, username: `hacker${i}` }, qrToken: `hack${i}`, attended: i < 20,
      })),
      isActive: true,
    },
    "4": {
      _id: "4",
      title: "AI/ML Workshop - Intro to Deep Learning",
      description: "Hands-on workshop on Neural Networks, TensorFlow and PyTorch. Bring your laptop! Prerequisites: Basic Python knowledge. Certificates will be provided.",
      banner: "",
      venue: "Lab 201, CS Block",
      date: "2026-04-25T00:00:00.000Z",
      startTime: "11:00",
      endTime: "14:00",
      capacity: 40,
      eventType: "workshop",
      tags: ["ai", "ml", "workshop", "python"],
      college: { _id: "c2", name: "NIT Kurukshetra", city: "Kurukshetra" },
      createdBy: { _id: "u3", username: "drSharma" },
      registrations: Array.from({ length: 38 }, (_, i) => ({
        studentId: { _id: `ws${i}`, username: `student${i}` }, qrToken: `wk${i}`, attended: i < 10,
      })),
      isActive: true,
    },
    "5": {
      _id: "5",
      title: "Tech Talk - How to Crack FAANG Interviews",
      description: "Guest speaker from Google sharing tips on cracking product-based company interviews. Open for all years. Q&A session at the end.",
      banner: "",
      venue: "Auditorium, Main Building",
      date: "2026-04-18T00:00:00.000Z",
      startTime: "16:00",
      endTime: "18:00",
      capacity: 300,
      eventType: "seminar",
      tags: ["career", "interview", "faang"],
      college: { _id: "c1", name: "IIIT Sonepat", city: "Sonepat" },
      createdBy: { _id: "u1", username: "organiser1" },
      registrations: Array.from({ length: 150 }, (_, i) => ({
        studentId: { _id: `sem${i}`, username: `attendee${i}` }, qrToken: `sem${i}`, attended: i < 80,
      })),
      isActive: true,
    },
    "6": {
      _id: "6",
      title: "Annual Cultural Fest - Tarang 2026",
      description: "Music, dance, drama, art exhibitions and food stalls. The biggest cultural event of the year!",
      banner: "",
      venue: "College Ground & Auditorium",
      date: "2026-05-10T00:00:00.000Z",
      startTime: "10:00",
      endTime: "22:00",
      capacity: 500,
      eventType: "cultural",
      tags: ["cultural", "music", "dance", "fest"],
      college: { _id: "c1", name: "IIIT Sonepat", city: "Sonepat" },
      createdBy: { _id: "u4", username: "studentCouncil" },
      registrations: Array.from({ length: 210 }, (_, i) => ({
        studentId: { _id: `cf${i}`, username: `participant${i}` }, qrToken: `cf${i}`, attended: i < 100,
      })),
      isActive: true,
    },
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await axios.get(`${API_URL}/events/${id}`);
      setEvent(res.data);

      if (user) {
        const reg = res.data.registrations?.find(
          (r: any) =>
            r.studentId?._id === user.id ||
            r.studentId?._id === user._id ||
            r.studentId === user.id
        );
        if (reg) setQrToken(reg.qrToken);
      }
    } catch (error) {
      console.error("Error fetching event, using dummy data:", error);
      // Fallback to dummy data
      const dummyEvent = DUMMY_EVENTS[id || ""];
      if (dummyEvent) {
        setEvent(dummyEvent);
        // Auto-register demo user for coding/quiz events to show tabs
        if (dummyEvent.eventType === "coding_contest" || dummyEvent.eventType === "quiz" || dummyEvent.eventType === "hackathon") {
          setQrToken("demo-qr-token-" + id);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      toast.error("Please login to register");
      navigate("/login");
      return;
    }
    try {
      setRegistering(true);
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/events/${id}/register`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQrToken(res.data.qrToken);
      toast.success("Registered successfully!");
      fetchEvent();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/events/${id}/unregister`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQrToken(null);
      toast.success("Unregistered successfully");
      fetchEvent();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to unregister");
    }
  };

  const handleMarkAttendance = async () => {
    if (!scanInput.trim()) {
      toast.error("Please enter QR token");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/events/${id}/attendance`,
        { qrToken: scanInput.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Attendance marked for ${res.data.student?.username}`);
      setScanInput("");
      fetchEvent();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to mark attendance");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Event deleted");
      navigate("/events");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
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

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className={isDark ? "text-gray-400" : "text-gray-600"}>
          Event not found
        </p>
      </div>
    );
  }

  const isRegistered = !!qrToken;
  const isFull = event.registrations?.length >= event.capacity;
  const isPast = new Date(event.date) < new Date();
  const isCreator =
    event.createdBy?._id === user?.id || event.createdBy?._id === user?._id;
  const userCollegeId =
    typeof user?.college === "string" ? user.college : user?.college?._id;
  const eventCollegeId =
    typeof event.college === "string" ? event.college : event.college?._id;
  const isSameCollegeOrganiser =
    user?.role === "organiser" &&
    !!userCollegeId &&
    !!eventCollegeId &&
    userCollegeId === eventCollegeId;
  const canManageThisEvent = isCreator || isSameCollegeOrganiser || user?.role === "admin";
  const isOrganiserOrAdmin =
    user?.role === "organiser" || user?.role === "admin";
  const attendedCount =
    event.registrations?.filter((r: any) => r.attended).length || 0;

  // Determine which feature tabs to show based on event type
  const isCodingEvent = event.eventType === "coding_contest" || event.eventType === "hackathon";
  const isQuizEvent = event.eventType === "quiz";
  const hasFeatureTabs = isRegistered && (isCodingEvent || isQuizEvent);

  // Build tabs
  const tabs: { key: string; label: string; icon: React.ReactNode }[] = [
    { key: "details", label: "Details", icon: <BookOpen size={16} /> },
  ];

  if (hasFeatureTabs && isCodingEvent) {
    tabs.push(
      { key: "problems", label: "Problems", icon: <Code size={16} /> },
      { key: "contest", label: "Contest", icon: <Trophy size={16} /> },
      { key: "game", label: "1v1 Game", icon: <Swords size={16} /> },
      { key: "leaderboard", label: "Leaderboard", icon: <BarChart3 size={16} /> }
    );
  }
  if (hasFeatureTabs && isQuizEvent) {
    tabs.push(
      { key: "rapidfire", label: "Rapid Fire", icon: <Zap size={16} /> },
      { key: "leaderboard", label: "Leaderboard", icon: <BarChart3 size={16} /> }
    );
  }
  if (isRegistered) {
    tabs.push(
      { key: "discuss", label: "Discuss", icon: <MessageSquare size={16} /> }
    );
  }

  // Feature card component for coding/quiz sections
  const FeatureCard = ({
    icon,
    title,
    description,
    path,
    color,
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    path: string;
    color: string;
  }) => (
    <Link
      to={path}
      className={`block rounded-xl border p-6 transition-all hover:scale-[1.02] hover:shadow-lg ${
        isDark
          ? "bg-gray-800/50 border-gray-700 hover:border-gray-600"
          : "bg-white border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className={`inline-flex p-3 rounded-lg mb-4 ${color}`}>{icon}</div>
      <h3
        className={`text-lg font-bold mb-2 ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        {title}
      </h3>
      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
        {description}
      </p>
    </Link>
  );

  return (
    <div className="min-h-screen px-4 py-8 max-w-5xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate("/events")}
        className={`flex items-center gap-2 mb-6 text-sm font-medium ${
          isDark
            ? "text-gray-400 hover:text-white"
            : "text-gray-600 hover:text-gray-900"
        } transition-colors`}
      >
        <ArrowLeft size={16} />
        Back to Events
      </button>

      {/* Banner */}
      <div className="h-48 md:h-64 rounded-xl overflow-hidden bg-gradient-to-br from-orange-500 to-pink-600 mb-6 relative">
        {event.banner && (
          <img
            src={event.banner}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-6 right-6">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 bg-white/20 backdrop-blur text-white border border-white/30"
          >
            {getEventTypeLabel(event.eventType)}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {event.title}
          </h1>
        </div>
      </div>

      {/* Tabs Navigation */}
      {tabs.length > 1 && (
        <div
          className={`flex gap-1 mb-6 p-1 rounded-xl overflow-x-auto ${
            isDark ? "bg-gray-800/50" : "bg-gray-100"
          }`}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? "bg-orange-600 text-white shadow-md"
                  : isDark
                  ? "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Tab Content */}

      {/* ===== DETAILS TAB ===== */}
      {activeTab === "details" && (
        <>
          {/* Event Info Card */}
          <div
            className={`rounded-xl border p-6 mb-6 ${
              isDark
                ? "bg-gray-800/50 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <div>
                <p className={`mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  {event.description}
                </p>
              </div>
              {canManageThisEvent && (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => navigate(`/events/${id}/edit`)}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`flex items-center gap-3 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                <Calendar size={18} className="text-orange-500" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className={`flex items-center gap-3 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                <Clock size={18} className="text-orange-500" />
                <span>{event.startTime} - {event.endTime}</span>
              </div>
              <div className={`flex items-center gap-3 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                <MapPin size={18} className="text-orange-500" />
                <span>{event.venue}</span>
              </div>
              <div className={`flex items-center gap-3 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                <Users size={18} className="text-orange-500" />
                <span>{event.registrations?.length || 0} / {event.capacity} registered</span>
              </div>
              {event.college && (
                <div className={`flex items-center gap-3 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  <span className="text-orange-500 font-medium">College:</span>
                  <span>{event.college.name}{event.college.city ? `, ${event.college.city}` : ""}</span>
                </div>
              )}
              {event.createdBy && (
                <div className={`flex items-center gap-3 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  <User size={18} className="text-orange-500" />
                  <span>By {event.createdBy.username}</span>
                </div>
              )}
            </div>

            {event.tags?.length > 0 && (
              <div className="flex gap-2 mt-4 flex-wrap">
                {event.tags.map((tag: string, i: number) => (
                  <span
                    key={i}
                    className={`px-2.5 py-1 rounded-full text-xs ${
                      isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Registration Section */}
          {!isPast && (
            <div
              className={`rounded-xl border p-6 mb-6 ${
                isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
              }`}
            >
              {isRegistered ? (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="text-green-500" size={24} />
                    <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                      You are registered!
                    </h3>
                  </div>
                  <div className={`p-4 rounded-lg mb-4 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
                    <p className={`text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Your QR Token (show this for attendance):
                    </p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {qrToken && (
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrToken)}`}
                          alt="Event attendance QR code"
                          className="w-36 h-36 rounded-lg border border-orange-300/40 bg-white p-2"
                        />
                      )}
                      <div className="flex items-center gap-3">
                        <QrCode className="text-orange-500" size={20} />
                        <code className={`text-sm font-mono break-all ${isDark ? "text-green-400" : "text-green-700"}`}>
                          {qrToken}
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* Show hint about feature tabs */}
                  {hasFeatureTabs && (
                    <div className={`p-4 rounded-lg mb-4 border ${
                      isDark ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-200"
                    }`}>
                      <p className={`text-sm font-medium ${isDark ? "text-blue-400" : "text-blue-700"}`}>
                        {isCodingEvent
                          ? "🚀 You now have access to Problems, Contest, and 1v1 Game tabs above!"
                          : "🧠 You now have access to the Rapid Fire quiz tab above!"}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleUnregister}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <XCircle size={16} /> Cancel Registration
                  </button>
                </div>
              ) : isFull ? (
                <div className="text-center py-4">
                  <p className="text-red-400 font-medium">This event is full. No more registrations.</p>
                </div>
              ) : (
                <div>
                  {(isCodingEvent || isQuizEvent) && (
                    <p className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      {isCodingEvent
                        ? "Register to unlock Problems, Contest mode, and 1v1 coding battles!"
                        : "Register to unlock the Rapid Fire quiz challenge!"}
                    </p>
                  )}
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {registering ? "Registering..." : "Register for this Event"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Attendance Scanner (Organiser/Admin) */}
          {canManageThisEvent && (
            <div className={`rounded-xl border p-6 mb-6 ${isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"}`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                <QrCode className="text-orange-500" size={20} /> Mark Attendance
              </h3>
              <p className={`text-sm mb-3 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Attended: {attendedCount} / {event.registrations?.length || 0} registered
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="Enter or scan QR token..."
                  className={`flex-1 px-4 py-2.5 rounded-lg border ${
                    isDark
                      ? "bg-gray-900 border-gray-600 text-white placeholder-gray-500"
                      : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
                  } focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  onKeyDown={(e) => e.key === "Enter" && handleMarkAttendance()}
                />
                <button onClick={handleMarkAttendance} className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium">
                  Mark
                </button>
              </div>
            </div>
          )}

          {/* Attendees List */}
          {canManageThisEvent && event.registrations?.length > 0 && (
            <div className={`rounded-xl border p-6 ${isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"}`}>
              <button
                onClick={() => setShowAttendees(!showAttendees)}
                className={`text-lg font-semibold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}
              >
                <Users className="text-orange-500" size={20} />
                Registrations ({event.registrations.length})
              </button>
              {showAttendees && (
                <div className="mt-4 space-y-2">
                  {event.registrations.map((reg: any, i: number) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isDark ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-700"}`}>
                          {reg.studentId?.username?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                          {reg.studentId?.username || "Unknown"}
                        </span>
                      </div>
                      {reg.attended ? (
                        <span className="flex items-center gap-1 text-green-500 text-sm"><CheckCircle size={14} /> Present</span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-500 text-sm"><XCircle size={14} /> Absent</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ===== CODING EVENT TABS ===== */}

      {activeTab === "problems" && isCodingEvent && (
        <div>
          <div className={`rounded-xl border p-6 mb-6 ${isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"}`}>
            <h2 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              Coding Problems
            </h2>
            <p className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Solve problems, practice DSA, and improve your skills in this coding event.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureCard
              icon={<Code size={24} className="text-blue-400" />}
              title="Practice Problems"
              description="Browse and solve coding problems by difficulty and topic"
              path="/problems"
              color="bg-blue-500/20"
            />
            <FeatureCard
              icon={<Brain size={24} className="text-purple-400" />}
              title="Company-wise Problems"
              description="Practice problems asked by top companies"
              path="/company-problems"
              color="bg-purple-500/20"
            />
          </div>
        </div>
      )}

      {activeTab === "contest" && isCodingEvent && (
        <div>
          <div className={`rounded-xl border p-6 mb-6 ${isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"}`}>
            <h2 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              Contests
            </h2>
            <p className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Compete in timed coding contests with other participants.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureCard
              icon={<Trophy size={24} className="text-yellow-400" />}
              title="Join Contest"
              description="Participate in ongoing and upcoming coding contests"
              path="/contest"
              color="bg-yellow-500/20"
            />
            <FeatureCard
              icon={<BarChart3 size={24} className="text-green-400" />}
              title="Contest Leaderboard"
              description="See rankings and your position among all contestants"
              path="/contest/leaderboard"
              color="bg-green-500/20"
            />
          </div>
        </div>
      )}

      {activeTab === "game" && isCodingEvent && (
        <div>
          <div className={`rounded-xl border p-6 mb-6 ${isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"}`}>
            <h2 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              1v1 Coding Battle
            </h2>
            <p className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Challenge another participant to a real-time coding duel!
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureCard
              icon={<Swords size={24} className="text-red-400" />}
              title="Start 1v1 Game"
              description="Find an opponent and compete in a live coding battle"
              path="/game"
              color="bg-red-500/20"
            />
            <FeatureCard
              icon={<BarChart3 size={24} className="text-cyan-400" />}
              title="Game Leaderboard"
              description="See who's the best in 1v1 battles"
              path="/game/leaderboard"
              color="bg-cyan-500/20"
            />
          </div>
        </div>
      )}

      {activeTab === "rapidfire" && isQuizEvent && (
        <div>
          <div className={`rounded-xl border p-6 mb-6 ${isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"}`}>
            <h2 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              Rapid Fire Quiz
            </h2>
            <p className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Test your knowledge with fast-paced MCQ challenges!
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureCard
              icon={<Zap size={24} className="text-yellow-400" />}
              title="Start Rapid Fire"
              description="Answer MCQs against opponents in real-time"
              path="/rapidfire"
              color="bg-yellow-500/20"
            />
            <FeatureCard
              icon={<BarChart3 size={24} className="text-purple-400" />}
              title="Quiz Leaderboard"
              description="See the top scorers in rapid fire challenges"
              path="/rapidfire/leaderboard"
              color="bg-purple-500/20"
            />
          </div>
        </div>
      )}

      {activeTab === "leaderboard" && (
        <div>
          <div className={`rounded-xl border p-6 mb-6 ${isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"}`}>
            <h2 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              Leaderboard
            </h2>
            <p className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Rankings across all activities in this event.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isCodingEvent && (
              <>
                <FeatureCard
                  icon={<Trophy size={24} className="text-yellow-400" />}
                  title="Contest Rankings"
                  description="Contest-based leaderboard"
                  path="/contest/leaderboard"
                  color="bg-yellow-500/20"
                />
                <FeatureCard
                  icon={<Swords size={24} className="text-red-400" />}
                  title="Game Rankings"
                  description="1v1 battle leaderboard"
                  path="/game/leaderboard"
                  color="bg-red-500/20"
                />
              </>
            )}
            {isQuizEvent && (
              <FeatureCard
                icon={<Zap size={24} className="text-purple-400" />}
                title="Quiz Rankings"
                description="Rapid fire leaderboard"
                path="/rapidfire/leaderboard"
                color="bg-purple-500/20"
              />
            )}
          </div>
        </div>
      )}

      {activeTab === "discuss" && (
        <div>
          <div className={`rounded-xl border p-6 mb-6 ${isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"}`}>
            <h2 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              Event Discussion
            </h2>
            <p className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Chat with other participants, ask questions, and share ideas.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureCard
              icon={<MessageSquare size={24} className="text-green-400" />}
              title="Discussion Forum"
              description="Start or join discussions about this event"
              path="/top"
              color="bg-green-500/20"
            />
            <FeatureCard
              icon={<Users size={24} className="text-blue-400" />}
              title="Live Chat"
              description="Real-time chat with event participants"
              path="/chats"
              color="bg-blue-500/20"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;
