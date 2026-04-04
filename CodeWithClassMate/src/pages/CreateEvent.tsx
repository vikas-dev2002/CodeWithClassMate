import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { API_URL } from "../config/api";
import axios from "axios";
import toast from "react-hot-toast";
import { ArrowLeft, CalendarDays, Plus } from "lucide-react";

const CreateEvent: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [colleges, setColleges] = useState<any[]>([]);
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

  useEffect(() => {
    if (!user || (user.role !== "organiser" && user.role !== "admin")) {
      toast.error("You must be an organiser to create events");
      navigate("/events");
      return;
    }
    fetchColleges();
  }, [user]);

  const fetchColleges = async () => {
    try {
      const res = await axios.get(`${API_URL}/colleges`);
      setColleges(res.data);
      // Auto-select user's college if available
      if (user?.college) {
        setForm((prev) => ({ ...prev, college: user.college }));
      }
    } catch (error) {
      console.error("Error fetching colleges:", error);
    }
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

    if (!form.title || !form.description || !form.venue || !form.date || !form.startTime || !form.endTime || !form.capacity) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!form.college) {
      toast.error("Please select a college");
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
      };

      const res = await axios.post(`${API_URL}/events`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Event created successfully!");
      navigate(`/events/${res.data.event._id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create event");
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
          Create New Event
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

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          <Plus size={18} />
          {submitting ? "Creating..." : "Create Event"}
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
