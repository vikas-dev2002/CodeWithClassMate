import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { API_URL } from "../config/api";
import axios from "axios";
import toast from "react-hot-toast";
import { ArrowLeft, CalendarDays, Plus } from "lucide-react";

interface CodingProblem {
  _id: string;
  title: string;
  difficulty: string;
  tags?: string[];
}

const CreateEvent: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { id: eventId } = useParams<{ id: string }>();
  const isEditMode = Boolean(eventId);

  const [colleges, setColleges] = useState<any[]>([]);
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [problemsLoading, setProblemsLoading] = useState(false);
  const [problemSearch, setProblemSearch] = useState("");
  const [selectedProblemIds, setSelectedProblemIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    banner: "",
    venue: "",
    date: "",
    startTime: "",
    endTime: "",
    capacity: "",
    eventType: "general",
    tags: "",
    college: "",
  });

  const getCollegeId = (college: unknown): string => {
    if (!college) return "";
    if (typeof college === "string") return college;
    if (typeof college === "object" && college !== null && "_id" in college) {
      const value = (college as { _id?: unknown })._id;
      return typeof value === "string" ? value : "";
    }
    return "";
  };

  useEffect(() => {
    if (!user || (user.role !== "organiser" && user.role !== "admin")) {
      toast.error("You must be an organiser to manage events");
      navigate("/events");
      return;
    }
    fetchColleges();
    fetchProblems();
  }, [user, navigate]);

  useEffect(() => {
    if (!isEditMode || !user) return;
    fetchEventForEdit();
  }, [isEditMode, eventId, user]);

  const fetchColleges = async () => {
    try {
      const res = await axios.get(`${API_URL}/colleges`);
      setColleges(res.data);
      // Auto-select user's college if available
      const collegeId = getCollegeId(user?.college);
      if (collegeId) {
        setForm((prev) => ({ ...prev, college: prev.college || collegeId }));
      }
    } catch (error) {
      console.error("Error fetching colleges:", error);
    }
  };

  const fetchEventForEdit = async () => {
    try {
      const res = await axios.get(`${API_URL}/events/${eventId}`);
      const event = res.data;
      const contestId =
        typeof event.contestId === "string" ? event.contestId : event.contestId?._id;

      setForm({
        title: event.title || "",
        description: event.description || "",
        banner: event.banner || "",
        venue: event.venue || "",
        date: event.date ? new Date(event.date).toISOString().slice(0, 10) : "",
        startTime: event.startTime || "",
        endTime: event.endTime || "",
        capacity: event.capacity ? String(event.capacity) : "",
        eventType: event.eventType || "general",
        tags: Array.isArray(event.tags) ? event.tags.join(", ") : "",
        college: getCollegeId(event.college) || getCollegeId(user?.college),
      });

      if (contestId) {
        try {
          const contestRes = await axios.get(`${API_URL}/contests/${contestId}`);
          const contestProblems = Array.isArray(contestRes.data?.problems)
            ? contestRes.data.problems.map((entry: any) =>
                typeof entry.problem === "string" ? entry.problem : entry.problem?._id
              ).filter(Boolean)
            : [];
          setSelectedProblemIds(contestProblems);
        } catch (contestError) {
          console.error("Error loading linked contest:", contestError);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load event details");
      navigate("/events");
    }
  };

  const fetchProblems = async () => {
    try {
      setProblemsLoading(true);
      const res = await axios.get(`${API_URL}/problems?limit=500`);
      const list = Array.isArray(res.data?.problems) ? res.data.problems : [];
      setProblems(list);
    } catch (error) {
      console.error("Error loading problems:", error);
      toast.error("Unable to load coding problems");
    } finally {
      setProblemsLoading(false);
    }
  };

  const toggleProblemSelection = (problemId: string) => {
    setSelectedProblemIds((prev) =>
      prev.includes(problemId)
        ? prev.filter((id) => id !== problemId)
        : [...prev, problemId]
    );
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isCodingEvent = form.eventType === "coding_contest" || form.eventType === "hackathon";

    if (!form.title || !form.description || !form.venue || !form.date || !form.startTime || !form.endTime || !form.capacity) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!form.college) {
      toast.error("Please select a college");
      return;
    }

    if (isCodingEvent && selectedProblemIds.length === 0) {
      toast.error("Coding event ke liye kam se kam 1 problem select karo");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const payload = {
        ...form,
        capacity: parseInt(form.capacity),
        tags: form.tags
          ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
        problemIds: isCodingEvent ? selectedProblemIds : [],
      };

      if (isEditMode) {
        await axios.put(`${API_URL}/events/${eventId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Event updated successfully!");
        navigate(`/events/${eventId}`);
      } else {
        const res = await axios.post(`${API_URL}/events`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Event created successfully!");
        navigate(`/events/${res.data.event._id}`);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          (isEditMode ? "Failed to update event" : "Failed to create event")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = `w-full px-4 py-2.5 rounded-lg border ${
    isDark
      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
  } focus:outline-none focus:ring-2 focus:ring-orange-500`;

  const labelClass = `block text-sm font-medium mb-1.5 ${
    isDark ? "text-gray-300" : "text-gray-700"
  }`;

  const filteredProblems = problems.filter((problem) => {
    if (!problemSearch.trim()) return true;
    const query = problemSearch.toLowerCase();
    return (
      problem.title?.toLowerCase().includes(query) ||
      problem.difficulty?.toLowerCase().includes(query) ||
      (problem.tags || []).some((tag) => tag.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
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

      <div className="flex items-center gap-3 mb-8">
        <CalendarDays className="text-orange-500" size={32} />
        <h1
          className={`text-2xl font-bold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {isEditMode ? "Edit Event" : "Create New Event"}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className={`rounded-xl border p-6 space-y-5 ${
          isDark
            ? "bg-gray-800/50 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        {/* Title */}
        <div>
          <label className={labelClass}>
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Event title"
            className={inputClass}
          />
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe your event..."
            rows={4}
            className={inputClass}
          />
        </div>

        {/* Banner URL */}
        <div>
          <label className={labelClass}>Banner Image URL</label>
          <input
            type="text"
            name="banner"
            value={form.banner}
            onChange={handleChange}
            placeholder="https://example.com/banner.jpg"
            className={inputClass}
          />
        </div>

        {/* Event Type */}
        <div>
          <label className={labelClass}>
            Event Type <span className="text-red-500">*</span>
          </label>
          <select
            name="eventType"
            value={form.eventType}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="general">General</option>
            <option value="coding_contest">Coding Contest</option>
            <option value="quiz">Quiz / MCQ</option>
            <option value="hackathon">Hackathon</option>
            <option value="seminar">Seminar</option>
            <option value="workshop">Workshop</option>
            <option value="cultural">Cultural</option>
          </select>
        </div>

        {/* Venue */}
        <div>
          <label className={labelClass}>
            Venue <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="venue"
            value={form.venue}
            onChange={handleChange}
            placeholder="Event location"
            className={inputClass}
          />
        </div>

        {/* Date & Time Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Start Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              End Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>

        {/* Capacity & College Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              Capacity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="capacity"
              value={form.capacity}
              onChange={handleChange}
              placeholder="Max attendees"
              min="1"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              College <span className="text-red-500">*</span>
            </label>
            <select
              name="college"
              value={form.college}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select college</option>
              {colleges.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} {c.city ? `(${c.city})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className={labelClass}>Tags (comma separated)</label>
          <input
            type="text"
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="coding, hackathon, web-dev"
            className={inputClass}
          />
        </div>

        {(form.eventType === "coding_contest" || form.eventType === "hackathon") && (
          <div>
            <label className={labelClass}>
              Select Coding Problems <span className="text-red-500">*</span>
            </label>
            <p className={`mb-3 text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Selected: {selectedProblemIds.length} problem(s)
            </p>
            <input
              type="text"
              value={problemSearch}
              onChange={(e) => setProblemSearch(e.target.value)}
              placeholder="Search by title, difficulty, or tag"
              className={`${inputClass} mb-3`}
            />
            <div className={`max-h-64 overflow-y-auto rounded-lg border ${
              isDark ? "border-gray-700 bg-gray-900/40" : "border-gray-200 bg-gray-50"
            }`}>
              {problemsLoading ? (
                <div className={`p-4 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  Loading problems...
                </div>
              ) : filteredProblems.length === 0 ? (
                <div className={`p-4 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  No problems found.
                </div>
              ) : (
                filteredProblems.map((problem) => (
                  <label
                    key={problem._id}
                    className={`flex cursor-pointer items-start gap-3 border-b px-4 py-3 last:border-b-0 ${
                      isDark ? "border-gray-700 text-gray-200" : "border-gray-200 text-gray-800"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedProblemIds.includes(problem._id)}
                      onChange={() => toggleProblemSelection(problem._id)}
                      className="mt-1 h-4 w-4"
                    />
                    <div className="min-w-0">
                      <div className="font-medium">{problem.title}</div>
                      <div className={`mt-1 text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {problem.difficulty}
                        {problem.tags?.length ? ` • ${problem.tags.slice(0, 3).join(", ")}` : ""}
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          <Plus size={18} />
          {submitting
            ? isEditMode
              ? "Updating..."
              : "Creating..."
            : isEditMode
            ? "Update Event"
            : "Create Event"}
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
