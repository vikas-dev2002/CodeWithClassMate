import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import { BarChart3, Building2, CalendarDays, Megaphone, Plus, ShieldCheck, Trash2, Users } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { API_URL } from "../../config/api";

interface UserItem {
  _id: string;
  username?: string;
  email?: string;
  role?: string;
  createdAt?: string;
  rollNo?: string;
  branch?: string;
  year?: number;
  college?: string | { _id?: string; name?: string };
  profile?: {
    firstName?: string;
    lastName?: string;
  };
}
interface EventItem {
  _id: string; title: string; venue: string; date: string; startTime: string; endTime: string;
  capacity: number; eventType: string; isActive: boolean; registrations?: Array<{ studentId: string }>;
  college?: { name?: string };
}
interface AnnouncementItem { _id: string; title: string; content: string; priority: string; createdAt: string; createdBy?: { username?: string } }
interface CollegeItem { _id: string; name: string; city?: string; state?: string; code?: string; }
type TabId = "overview" | "events" | "users" | "announcements" | "colleges";

const EventAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [tab, setTab] = useState<TabId>("overview");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [colleges, setColleges] = useState<CollegeItem[]>([]);
  const [notice, setNotice] = useState<string>("");
  const [showUserForm, setShowUserForm] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [showCollegeForm, setShowCollegeForm] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
    firstName: "",
    lastName: "",
    college: "",
    rollNo: "",
    branch: "",
    year: "",
  });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "", type: "general", priority: "medium" });
  const [newCollege, setNewCollege] = useState({ name: "", city: "", state: "", code: "", logo: "" });

  if (!user || user.role !== "admin") return <Navigate to="/" replace />;

  const authHeaders = {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  };

  const pageBg = isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900";
  const card = isDark ? "border border-white/10 bg-white/5" : "border border-slate-200 bg-white";
  const muted = isDark ? "text-slate-300" : "text-slate-600";

  const ping = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(""), 3200);
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [usersRes, eventsRes, announcementsRes, collegesRes] = await Promise.all([
        axios.get(`${API_URL}/users`, { headers: authHeaders }),
        axios.get(`${API_URL}/events?limit=100`),
        axios.get(`${API_URL}/announcements`),
        axios.get(`${API_URL}/colleges`),
      ]);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setEvents(Array.isArray(eventsRes.data?.events) ? eventsRes.data.events : []);
      setAnnouncements(Array.isArray(announcementsRes.data) ? announcementsRes.data : []);
      setColleges(Array.isArray(collegesRes.data) ? collegesRes.data : []);
    } catch (error) {
      console.error("Error loading event admin dashboard:", error);
      ping("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  const stats = useMemo(() => ({
    totalUsers: users.length,
    totalEvents: events.length,
    totalAnnouncements: announcements.length,
    totalColleges: colleges.length,
    registrations: events.reduce((sum, item) => sum + (item.registrations?.length || 0), 0),
    activeEvents: events.filter((item) => item.isActive).length,
  }), [announcements.length, colleges.length, events, users.length]);

  const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A";
  const seatsLeft = (event: EventItem) => Math.max((event.capacity || 0) - (event.registrations?.length || 0), 0);
  const statusOf = (event: EventItem) => !event.isActive ? "Inactive" : new Date(event.date) >= new Date() ? "Upcoming" : "Completed";
  const roleManagedUsers = users.filter((item) => item.role === "user" || item.role === "organiser");

  const getCollegeName = (college: UserItem["college"]) => {
    if (!college) return "N/A";
    if (typeof college === "object" && college.name) return college.name;
    if (typeof college === "string") {
      const found = colleges.find((entry) => entry._id === college);
      return found?.name || "N/A";
    }
    return "N/A";
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newUser.firstName.trim() || !newUser.lastName.trim()) {
        ping("First name and last name are required.");
        return;
      }
      if (!newUser.college) {
        ping("Please select a college.");
        return;
      }
      if (newUser.role === "user" && (!newUser.rollNo.trim() || !newUser.branch || !newUser.year)) {
        ping("Student requires roll number, branch, and year.");
        return;
      }

      const payload = {
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        college: newUser.college,
        rollNo: newUser.role === "user" ? newUser.rollNo : undefined,
        branch: newUser.role === "user" ? newUser.branch : undefined,
        year: newUser.role === "user" ? Number(newUser.year) : undefined,
        profile: {
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          college: colleges.find((item) => item._id === newUser.college)?.name || "",
        },
      };

      const res = await axios.post(`${API_URL}/users`, payload, { headers: authHeaders });
      setUsers((cur) => [res.data, ...cur]);
      setNewUser({
        username: "",
        email: "",
        password: "",
        role: "user",
        firstName: "",
        lastName: "",
        college: "",
        rollNo: "",
        branch: "",
        year: "",
      });
      setShowUserForm(false);
      ping("User created successfully.");
    } catch (error) {
      console.error(error);
      ping("Unable to create user.");
    }
  };

  const updateUserRole = async (item: UserItem, role: string) => {
    try {
      const res = await axios.put(`${API_URL}/users/${item._id}`, { role }, { headers: authHeaders });
      setUsers((cur) => cur.map((userRow) => userRow._id === item._id ? res.data : userRow));
      ping("User role updated.");
    } catch (error) {
      console.error(error);
      ping("Unable to update user role.");
    }
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await axios.delete(`${API_URL}/users/${id}`, { headers: authHeaders });
      setUsers((cur) => cur.filter((item) => item._id !== id));
      ping("User deleted.");
    } catch (error) {
      console.error(error);
      ping("Unable to delete user.");
    }
  };

  const makeOrganiser = async (id: string) => {
    try {
      await axios.post(`${API_URL}/users/${id}/make-organiser`, {}, { headers: authHeaders });
      ping("User promoted to organiser.");
      await loadDashboard();
    } catch (error) {
      console.error(error);
      ping("Unable to promote user.");
    }
  };

  const removeOrganiser = async (id: string) => {
    try {
      await axios.post(`${API_URL}/users/${id}/remove-organiser`, {}, { headers: authHeaders });
      ping("Organiser role removed.");
      await loadDashboard();
    } catch (error) {
      console.error(error);
      ping("Unable to remove organiser role.");
    }
  };

  const toggleEvent = async (event: EventItem) => {
    try {
      const res = await axios.patch(`${API_URL}/events/${event._id}`, { isActive: !event.isActive }, { headers: authHeaders });
      const updated = res.data?.event || res.data;
      setEvents((cur) => cur.map((item) => item._id === event._id ? updated : item));
      ping("Event updated.");
    } catch (error) {
      console.error(error);
      ping("Unable to update event.");
    }
  };

  const deleteEvent = async (id: string) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await axios.delete(`${API_URL}/events/${id}`, { headers: authHeaders });
      setEvents((cur) => cur.filter((item) => item._id !== id));
      ping("Event deleted.");
    } catch (error) {
      console.error(error);
      ping("Unable to delete event.");
    }
  };

  const createAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/announcements`, newAnnouncement, { headers: authHeaders });
      setAnnouncements((cur) => [res.data, ...cur]);
      setNewAnnouncement({ title: "", content: "", type: "general", priority: "medium" });
      setShowAnnouncementForm(false);
      ping("Announcement published.");
    } catch (error) {
      console.error(error);
      ping("Unable to publish announcement.");
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await axios.delete(`${API_URL}/announcements/${id}`, { headers: authHeaders });
      setAnnouncements((cur) => cur.filter((item) => item._id !== id));
      ping("Announcement deleted.");
    } catch (error) {
      console.error(error);
      ping("Unable to delete announcement.");
    }
  };

  const createCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/colleges`, newCollege, { headers: authHeaders });
      setColleges((cur) => [res.data.college, ...cur]);
      setNewCollege({ name: "", city: "", state: "", code: "", logo: "" });
      setShowCollegeForm(false);
      ping("College added successfully.");
    } catch (error) {
      console.error(error);
      ping("Unable to add college.");
    }
  };

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "events" as const, label: "Events", icon: <CalendarDays className="h-4 w-4" /> },
    { id: "users" as const, label: "Users", icon: <Users className="h-4 w-4" /> },
    { id: "announcements" as const, label: "Announcements", icon: <Megaphone className="h-4 w-4" /> },
    { id: "colleges" as const, label: "Colleges", icon: <Building2 className="h-4 w-4" /> },
  ];

  return (
    <div className={`min-h-screen ${pageBg}`}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
              <ShieldCheck className="h-4 w-4" />
              Admin Control Center
            </div>
            <h1 className="mt-4 text-4xl font-black">Event-Ease Admin Dashboard</h1>
            <p className={`mt-3 max-w-3xl ${muted}`}>Manage events, users, announcements, registrations, and colleges from one event-focused admin panel.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/events/create" className="inline-flex items-center rounded-2xl bg-amber-500 px-5 py-3 font-semibold text-white hover:bg-amber-600">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Link>
            <Link to="/events" className={`inline-flex items-center rounded-2xl px-5 py-3 font-semibold ${card}`}>Open Events</Link>
          </div>
        </div>

        {notice && <div className="mb-6 rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">{notice}</div>}

        <div className="mb-8 flex flex-wrap gap-3">
          {tabs.map((item) => (
            <button key={item.id} onClick={() => setTab(item.id)} className={`inline-flex items-center rounded-2xl px-4 py-2.5 text-sm font-semibold ${tab === item.id ? "bg-amber-500 text-white" : isDark ? "bg-white/5 text-slate-200 hover:bg-white/10" : "bg-white text-slate-700 hover:bg-slate-100"}`}>
              {item.icon}<span className="ml-2">{item.label}</span>
            </button>
          ))}
        </div>

        {loading ? <div className={`rounded-3xl p-10 text-center ${card}`}>Loading admin dashboard...</div> : (
          <>
            {tab === "overview" && (
              <div className="space-y-8">
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: "Total Users", value: stats.totalUsers },
                    { label: "Total Events", value: stats.totalEvents },
                    { label: "Registrations", value: stats.registrations },
                    { label: "Announcements", value: stats.totalAnnouncements },
                  ].map((item) => <div key={item.label} className={`rounded-3xl p-6 ${card}`}><div className={`text-sm ${muted}`}>{item.label}</div><div className="mt-3 text-3xl font-bold">{item.value}</div></div>)}
                </div>
                <div className="grid gap-8 lg:grid-cols-2">
                  <div className={`rounded-[2rem] p-6 ${card}`}>
                    <h2 className="text-2xl font-bold">Operational snapshot</h2>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl bg-amber-500/10 p-5"><div className={`text-sm ${muted}`}>Active Events</div><div className="mt-2 text-2xl font-bold">{stats.activeEvents}</div></div>
                      <div className="rounded-2xl bg-sky-500/10 p-5"><div className={`text-sm ${muted}`}>Registered Colleges</div><div className="mt-2 text-2xl font-bold">{stats.totalColleges}</div></div>
                      <div className="rounded-2xl bg-violet-500/10 p-5"><div className={`text-sm ${muted}`}>Admins</div><div className="mt-2 text-2xl font-bold">{users.filter((item) => item.role === "admin").length}</div></div>
                      <div className="rounded-2xl bg-emerald-500/10 p-5"><div className={`text-sm ${muted}`}>Organisers</div><div className="mt-2 text-2xl font-bold">{users.filter((item) => item.role === "organiser").length}</div></div>
                    </div>
                  </div>
                  <div className={`rounded-[2rem] p-6 ${card}`}>
                    <h2 className="text-2xl font-bold">Top events by registrations</h2>
                    <div className="mt-5 space-y-4">
                      {[...events].sort((a, b) => (b.registrations?.length || 0) - (a.registrations?.length || 0)).slice(0, 5).map((event) => (
                        <div key={event._id} className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                          <div className="flex items-start justify-between gap-3">
                            <div><h3 className="font-semibold">{event.title}</h3><p className={`mt-1 text-sm ${muted}`}>{event.venue}</p></div>
                            <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">{event.registrations?.length || 0} regs</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === "events" && (
              <div className={`rounded-[2rem] p-6 ${card}`}>
                <div className="mb-6 flex items-end justify-between gap-4"><div><h2 className="text-2xl font-bold">Event operations</h2><p className={`mt-2 text-sm ${muted}`}>Moderate event lifecycle, registrations, and activation state.</p></div></div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead><tr className={`border-b ${isDark ? "border-white/10" : "border-slate-200"}`}><th className="px-3 py-3 text-left">Event</th><th className="px-3 py-3 text-left">Date</th><th className="px-3 py-3 text-left">Status</th><th className="px-3 py-3 text-left">Registrations</th><th className="px-3 py-3 text-left">Actions</th></tr></thead>
                    <tbody>
                      {events.map((event) => (
                        <tr key={event._id} className={`border-b ${isDark ? "border-white/5" : "border-slate-100"}`}>
                          <td className="px-3 py-4"><div className="font-semibold">{event.title}</div><div className={`mt-1 text-xs ${muted}`}>{event.college?.name || "College"} • {event.venue}</div></td>
                          <td className="px-3 py-4"><div>{formatDate(event.date)}</div><div className={`mt-1 text-xs ${muted}`}>{event.startTime} - {event.endTime}</div></td>
                          <td className="px-3 py-4"><span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">{statusOf(event)}</span></td>
                          <td className="px-3 py-4">{event.registrations?.length || 0} / {event.capacity} • {seatsLeft(event)} left</td>
                          <td className="px-3 py-4"><div className="flex flex-wrap gap-2">
                            <button onClick={() => toggleEvent(event)} className="rounded-xl bg-sky-500/10 px-3 py-2 text-xs font-semibold text-sky-700 dark:text-sky-300">{event.isActive ? "Deactivate" : "Activate"}</button>
                            <button onClick={() => deleteEvent(event._id)} className="rounded-xl bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300">Delete</button>
                            <Link to={`/events/${event._id}`} className="rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">View</Link>
                          </div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === "users" && (
              <div className={`rounded-[2rem] p-6 ${card}`}>
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div><h2 className="text-2xl font-bold">User management</h2><p className={`mt-2 text-sm ${muted}`}>Manage students, coordinators, and admin roles.</p></div>
                  <button onClick={() => setShowUserForm((v) => !v)} className="inline-flex items-center rounded-2xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600"><Plus className="mr-2 h-4 w-4" />Add User</button>
                </div>

                <div className="mb-8 rounded-3xl border border-slate-200 p-5 dark:border-white/10">
                  <h3 className="text-lg font-bold">Organiser Access Control</h3>
                  <p className={`mt-1 text-sm ${muted}`}>Promote or demote users for college-scoped organiser access.</p>
                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className={`border-b ${isDark ? "border-white/10" : "border-slate-200"}`}>
                          <th className="px-3 py-3 text-left">Name</th>
                          <th className="px-3 py-3 text-left">College</th>
                          <th className="px-3 py-3 text-left">Role</th>
                          <th className="px-3 py-3 text-left">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roleManagedUsers.map((item) => (
                          <tr key={`role-${item._id}`} className={`border-b ${isDark ? "border-white/5" : "border-slate-100"}`}>
                            <td className="px-3 py-3 font-semibold">{item.username || "Unnamed user"}</td>
                            <td className="px-3 py-3">{getCollegeName(item.college)}</td>
                            <td className="px-3 py-3 capitalize">{item.role || "user"}</td>
                            <td className="px-3 py-3">
                              {item.role === "user" ? (
                                <button
                                  onClick={() => makeOrganiser(item._id)}
                                  className="rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
                                >
                                  Make Organiser
                                </button>
                              ) : (
                                <button
                                  onClick={() => removeOrganiser(item._id)}
                                  className="rounded-xl bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300"
                                >
                                  Remove Organiser
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {showUserForm && (
                  <form onSubmit={createUser} className="mb-6 grid gap-4 rounded-3xl border border-slate-200 p-5 dark:border-white/10 md:grid-cols-2">
                    <input className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-white/10 dark:bg-white/5" placeholder="First name" value={newUser.firstName} onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })} required />
                    <input className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-white/10 dark:bg-white/5" placeholder="Last name" value={newUser.lastName} onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })} required />
                    <input className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-white/10 dark:bg-white/5" placeholder="Username" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} required />
                    <input className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-white/10 dark:bg-white/5" placeholder="Email" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required />
                    <input className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-white/10 dark:bg-white/5" placeholder="Password" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required />
                    <select className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-white/10 dark:bg-white/5" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value, rollNo: "", branch: "", year: "" })}>
                      <option value="user">Student</option>
                      <option value="organiser">Event Coordinator</option>
                      <option value="admin">Admin</option>
                    </select>
                    <select className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-white/10 dark:bg-white/5 md:col-span-2" value={newUser.college} onChange={(e) => setNewUser({ ...newUser, college: e.target.value })} required>
                      <option value="">Select college</option>
                      {colleges.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name}{item.city ? ` - ${item.city}` : ""}
                        </option>
                      ))}
                    </select>
                    {newUser.role === "user" && (
                      <>
                        <input className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-white/10 dark:bg-white/5" placeholder="Roll number" value={newUser.rollNo} onChange={(e) => setNewUser({ ...newUser, rollNo: e.target.value })} required />
                        <select className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-white/10 dark:bg-white/5" value={newUser.branch} onChange={(e) => setNewUser({ ...newUser, branch: e.target.value })} required>
                          <option value="">Select branch</option>
                          <option value="CSE">CSE</option>
                          <option value="ECE">ECE</option>
                          <option value="EEE">EEE</option>
                          <option value="ME">ME</option>
                          <option value="CE">CE</option>
                          <option value="IT">IT</option>
                          <option value="AIML">AIML</option>
                          <option value="Other">Other</option>
                        </select>
                        <select className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-white/10 dark:bg-white/5 md:col-span-2" value={newUser.year} onChange={(e) => setNewUser({ ...newUser, year: e.target.value })} required>
                          <option value="">Select year</option>
                          <option value="1">1st Year</option>
                          <option value="2">2nd Year</option>
                          <option value="3">3rd Year</option>
                          <option value="4">4th Year</option>
                        </select>
                      </>
                    )}
                    {newUser.role === "organiser" && (
                      <div className="rounded-2xl bg-sky-500/10 px-4 py-3 text-sm text-sky-700 dark:text-sky-300 md:col-span-2">
                        Organiser user will be created with minimal required fields and linked college data.
                      </div>
                    )}
                    <button className="rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-white hover:bg-emerald-600 md:col-span-2">Create User</button>
                  </form>
                )}
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead><tr className={`border-b ${isDark ? "border-white/10" : "border-slate-200"}`}><th className="px-3 py-3 text-left">User</th><th className="px-3 py-3 text-left">Email</th><th className="px-3 py-3 text-left">Role</th><th className="px-3 py-3 text-left">Joined</th><th className="px-3 py-3 text-left">Actions</th></tr></thead>
                    <tbody>
                      {users.map((item) => (
                        <tr key={item._id} className={`border-b ${isDark ? "border-white/5" : "border-slate-100"}`}>
                          <td className="px-3 py-4 font-semibold">{item.username || "Unnamed user"}</td>
                          <td className="px-3 py-4">{item.email || "N/A"}</td>
                          <td className="px-3 py-4"><select className="rounded-xl border border-slate-200 px-3 py-2 dark:border-white/10 dark:bg-white/5" value={item.role || "user"} onChange={(e) => updateUserRole(item, e.target.value)}><option value="user">Student</option><option value="organiser">Event Coordinator</option><option value="admin">Admin</option></select></td>
                          <td className="px-3 py-4">{formatDate(item.createdAt)}</td>
                          <td className="px-3 py-4"><button onClick={() => deleteUser(item._id)} className="inline-flex items-center rounded-xl bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300"><Trash2 className="mr-2 h-4 w-4" />Delete</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === "announcements" && (
              <div className={`rounded-[2rem] p-6 ${card}`}>
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div><h2 className="text-2xl font-bold">Announcements</h2><p className={`mt-2 text-sm ${muted}`}>Publish updates, reminders, and alerts for the platform.</p></div>
                  <button onClick={() => setShowAnnouncementForm((v) => !v)} className="inline-flex items-center rounded-2xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600"><Plus className="mr-2 h-4 w-4" />New Announcement</button>
                </div>
                {showAnnouncementForm && (
                  <form onSubmit={createAnnouncement} className="mb-6 grid gap-4 rounded-3xl border border-slate-200 p-5 dark:border-white/10">
                    <input className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-white/10 dark:bg-white/5" placeholder="Announcement title" value={newAnnouncement.title} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} required />
                    <textarea className="min-h-28 rounded-2xl border border-slate-200 px-4 py-3 dark:border-white/10 dark:bg-white/5" placeholder="Announcement content" value={newAnnouncement.content} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })} required />
                    <div className="grid gap-4 md:grid-cols-2">
                      <select className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-white/10 dark:bg-white/5" value={newAnnouncement.type} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value })}><option value="general">General</option><option value="feature">Feature</option><option value="update">Update</option><option value="alert">Alert</option><option value="maintenance">Maintenance</option></select>
                      <select className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-white/10 dark:bg-white/5" value={newAnnouncement.priority} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select>
                    </div>
                    <button className="rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-white hover:bg-emerald-600">Publish Announcement</button>
                  </form>
                )}
                <div className="space-y-4">
                  {announcements.map((item) => (
                    <div key={item._id} className="rounded-3xl border border-slate-200 p-5 dark:border-white/10">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-semibold">{item.title}</h3><span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">{item.priority}</span></div><p className={`mt-2 text-sm leading-6 ${muted}`}>{item.content}</p><div className={`mt-3 text-xs ${muted}`}>{formatDate(item.createdAt)} • {item.createdBy?.username || "Admin"}</div></div>
                        <button onClick={() => deleteAnnouncement(item._id)} className="inline-flex items-center rounded-xl bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300"><Trash2 className="mr-2 h-4 w-4" />Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "colleges" && (
              <div className={`rounded-[2rem] p-6 ${card}`}>
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div><h2 className="text-2xl font-bold">College directory</h2><p className={`mt-2 text-sm ${muted}`}>Maintain the list of colleges participating in the platform.</p></div>
                  <button onClick={() => setShowCollegeForm((v) => !v)} className="inline-flex items-center rounded-2xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600"><Plus className="mr-2 h-4 w-4" />Add College</button>
                </div>
                {showCollegeForm && (
                  <form onSubmit={createCollege} className="mb-6 grid gap-4 rounded-3xl border border-slate-200 p-5 dark:border-white/10 md:grid-cols-2">
                    <input className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-white/10 dark:bg-white/5" placeholder="College name" value={newCollege.name} onChange={(e) => setNewCollege({ ...newCollege, name: e.target.value })} required />
                    <input className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-white/10 dark:bg-white/5" placeholder="City" value={newCollege.city} onChange={(e) => setNewCollege({ ...newCollege, city: e.target.value })} />
                    <input className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-white/10 dark:bg-white/5" placeholder="State" value={newCollege.state} onChange={(e) => setNewCollege({ ...newCollege, state: e.target.value })} />
                    <input className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-white/10 dark:bg-white/5" placeholder="Code" value={newCollege.code} onChange={(e) => setNewCollege({ ...newCollege, code: e.target.value })} />
                    <button className="rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-white hover:bg-emerald-600 md:col-span-2">Save College</button>
                  </form>
                )}
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {colleges.map((college) => (
                    <div key={college._id} className="rounded-3xl border border-slate-200 p-5 dark:border-white/10">
                      <h3 className="text-lg font-semibold">{college.name}</h3>
                      <p className={`mt-2 text-sm ${muted}`}>{[college.city, college.state].filter(Boolean).join(", ") || "Location not set"}</p>
                      <div className={`mt-4 text-sm ${muted}`}>Code: {college.code || "N/A"}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EventAdminDashboard;
