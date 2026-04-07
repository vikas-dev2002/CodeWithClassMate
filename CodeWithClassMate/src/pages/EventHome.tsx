import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BellRing,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileBadge2,
  MapPin,
  QrCode,
  ShieldCheck,
  Sparkles,
  Users,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { API_URL } from "../config/api";

interface HomeAnnouncement {
  _id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  createdAt: string;
  createdBy?: { username?: string };
}

interface HomeEventItem {
  _id: string;
  title: string;
  description: string;
  venue: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  eventType: string;
  registrations?: Array<{ studentId: string }>;
  college?: { name?: string; city?: string };
}

const trustedColleges = [
  "IET Lucknow",
  "AKTU",
  "BBD University",
  "Integral University",
  "Lucknow University",
  "NIT Kurukshetra",
  "IIIT Sonepat",
  "Bennett University",
];

const featurePillars = [
  {
    title: "Central Event Calendar",
    description: "One feed for all upcoming events with type, schedule, and seat visibility.",
    icon: CalendarDays,
  },
  {
    title: "Smart Registration",
    description: "Fast registration flow with seat limits and real-time availability sync.",
    icon: Users,
  },
  {
    title: "QR Attendance",
    description: "Contactless check-in for organisers with attendance proof and timestamps.",
    icon: QrCode,
  },
  {
    title: "Certificates",
    description: "Auto-generate attendance certificates from verified participation records.",
    icon: FileBadge2,
  },
  {
    title: "Announcements",
    description: "Priority notices and updates delivered in one consistent communication layer.",
    icon: BellRing,
  },
  {
    title: "Performance Insights",
    description: "Track registrations, attendance rates, and event performance trends.",
    icon: BarChart3,
  },
];

const workflow = [
  "Students discover events",
  "One-click registration confirms participation",
  "Organisers monitor seat fill in real-time",
  "QR check-in marks attendance instantly",
  "Certificates and reports are generated post event",
];

const fallbackEvents: HomeEventItem[] = [
  {
    _id: "1",
    title: "CodeWars 2026 - Inter College Coding Contest",
    description: "A 3-hour coding contest with live leaderboard and participation certificates.",
    venue: "Computer Lab 301",
    date: "2026-04-15T00:00:00.000Z",
    startTime: "10:00",
    endTime: "13:00",
    capacity: 100,
    eventType: "coding_contest",
    registrations: Array.from({ length: 42 }, (_, i) => ({ studentId: `x-${i}` })),
    college: { name: "IET Lucknow", city: "Lucknow" },
  },
  {
    _id: "2",
    title: "AI/ML Workshop - Deep Learning Basics",
    description: "Hands-on beginner workshop focused on practical ML workflows and deployment.",
    venue: "CS Lab 2",
    date: "2026-04-25T00:00:00.000Z",
    startTime: "11:00",
    endTime: "14:00",
    capacity: 60,
    eventType: "workshop",
    registrations: Array.from({ length: 31 }, (_, i) => ({ studentId: `y-${i}` })),
    college: { name: "IET Lucknow", city: "Lucknow" },
  },
  {
    _id: "3",
    title: "HackFest 2026 - 24 Hour Build Sprint",
    description: "Team hackathon for product prototyping with mentor rounds and jury review.",
    venue: "Innovation Hall",
    date: "2026-05-01T00:00:00.000Z",
    startTime: "09:00",
    endTime: "09:00",
    capacity: 180,
    eventType: "hackathon",
    registrations: Array.from({ length: 92 }, (_, i) => ({ studentId: `z-${i}` })),
    college: { name: "AKTU", city: "Lucknow" },
  },
];

const fallbackAnnouncements: HomeAnnouncement[] = [
  {
    _id: "a1",
    title: "Coordinator approvals open",
    content: "Admin users can now review and approve upcoming coordinator event requests.",
    type: "update",
    priority: "high",
    createdAt: "2026-04-05T10:00:00.000Z",
    createdBy: { username: "Admin" },
  },
  {
    _id: "a2",
    title: "Certificate template refreshed",
    content: "Workshop and seminar certificates now use the updated institutional format.",
    type: "feature",
    priority: "medium",
    createdAt: "2026-04-04T11:30:00.000Z",
    createdBy: { username: "System" },
  },
];

const section = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const EventHome: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [events, setEvents] = useState<HomeEventItem[]>([]);
  const [announcements, setAnnouncements] = useState<HomeAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const load = async () => {
      try {
        const [eventsRes, announcementsRes] = await Promise.all([
          axios.get(`${API_URL}/events?upcoming=true&limit=6`),
          axios.get(`${API_URL}/announcements`),
        ]);

        const eventList = Array.isArray(eventsRes.data?.events) ? eventsRes.data.events : [];
        const announcementList = Array.isArray(announcementsRes.data)
          ? announcementsRes.data
          : announcementsRes.data?.announcements || [];

        setEvents(eventList.length ? eventList : fallbackEvents);
        setAnnouncements(announcementList.length ? announcementList.slice(0, 3) : fallbackAnnouncements);
      } catch (error) {
        console.error("EventHome data load failed:", error);
        setEvents(fallbackEvents);
        setAnnouncements(fallbackAnnouncements);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const stats = useMemo(() => {
    const eventRows = events.length ? events : fallbackEvents;
    const totalEvents = eventRows.length;
    const totalRegistrations = eventRows.reduce((sum, event) => sum + (event.registrations?.length || 0), 0);
    const totalSeats = eventRows.reduce((sum, event) => sum + (event.capacity || 0), 0);

    return [
      { label: "Upcoming Events", value: totalEvents },
      { label: "Total Registrations", value: totalRegistrations },
      { label: "Available Seats", value: Math.max(totalSeats - totalRegistrations, 0) },
      { label: "Live Announcements", value: announcements.length || fallbackAnnouncements.length },
    ];
  }, [announcements.length, events]);

  const pageBg = isDark
    ? "bg-[#060b16] text-white"
    : "bg-[radial-gradient(circle_at_top,_rgba(253,224,71,0.28),_transparent_36%),linear-gradient(180deg,#fffaf2_0%,#ffffff_38%,#fffdf7_100%)] text-slate-900";

  const card = isDark ? "border border-white/10 bg-white/5" : "border border-amber-100 bg-white/90";
  const muted = isDark ? "text-slate-300" : "text-slate-600";

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const getSeatsLeft = (event: HomeEventItem) =>
    Math.max((event.capacity || 0) - (event.registrations?.length || 0), 0);

  const heroCTA = user?.role === "admin" || user?.role === "organiser" ? "/events/create" : "/events";

  return (
    <div className={`min-h-screen ${pageBg}`}>
      <style>{`
        @keyframes campus-marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .campus-marquee-track {
          animation: campus-marquee 20s linear infinite;
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <motion.section
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative overflow-hidden rounded-[2rem] border border-amber-200/40 bg-gradient-to-br from-[#fff1d8] via-white to-[#fff8ec] px-6 py-12 shadow-[0_28px_120px_rgba(245,158,11,0.16)] sm:px-8 lg:px-10 dark:border-white/10 dark:bg-gradient-to-br dark:from-slate-900 dark:via-[#081022] dark:to-slate-900 dark:shadow-none"
        >
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-orange-300/35 blur-3xl dark:bg-amber-400/10" />
          <div className="absolute -left-12 bottom-0 h-56 w-56 rounded-full bg-sky-300/25 blur-3xl dark:bg-cyan-500/10" />

          <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <motion.div variants={stagger}>
              <motion.div variants={section} className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-white/85 px-4 py-2 text-sm font-semibold text-amber-700 dark:border-white/15 dark:bg-white/5 dark:text-amber-200">
                <Sparkles className="h-4 w-4" />
                Event-Ease Professional Event Platform
              </motion.div>

              <motion.h1 variants={section} className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                Build, manage, and grow your college event ecosystem.
              </motion.h1>

              <motion.p variants={section} className={`mt-5 max-w-2xl text-lg leading-8 ${muted}`}>
                CodeWithClassMate brings event discovery, registration, attendance, announcements,
                certificates, and organiser analytics into one polished workflow for campuses.
              </motion.p>

              <motion.div variants={section} className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link to="/events" className="inline-flex items-center justify-center rounded-2xl bg-amber-500 px-6 py-3.5 font-semibold text-white transition hover:bg-amber-600">
                  Explore Events
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link to={heroCTA} className={`inline-flex items-center justify-center rounded-2xl px-6 py-3.5 font-semibold transition ${card}`}>
                  {heroCTA === "/events/create" ? "Create Event" : "Student Dashboard"}
                </Link>
              </motion.div>
            </motion.div>

            <motion.div variants={section} className={`rounded-[1.6rem] p-5 ${card}`}>
              <div className="space-y-4">
                <div className="rounded-2xl bg-emerald-500/10 p-4 dark:bg-emerald-400/10">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-1 h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                    <div>
                      <h3 className="font-semibold">Role-safe operations</h3>
                      <p className={`mt-1 text-sm ${muted}`}>Admin, organiser, and student access are separated with scoped controls.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-blue-500/10 p-4 dark:bg-cyan-500/10">
                  <div className="flex items-start gap-3">
                    <QrCode className="mt-1 h-5 w-5 text-blue-600 dark:text-cyan-300" />
                    <div>
                      <h3 className="font-semibold">Fast QR attendance</h3>
                      <p className={`mt-1 text-sm ${muted}`}>Check-in flow is built for real event queues with instant confirmation.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-violet-500/10 p-4 dark:bg-violet-400/10">
                  <div className="flex items-start gap-3">
                    <Clock3 className="mt-1 h-5 w-5 text-violet-600 dark:text-violet-300" />
                    <div>
                      <h3 className="font-semibold">Real-time operations</h3>
                      <p className={`mt-1 text-sm ${muted}`}>Track registrations and seat fill before, during, and after each event.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mt-8 overflow-hidden rounded-2xl border border-amber-200/40 bg-white/75 py-3 dark:border-white/10 dark:bg-white/5"
        >
          <div className="campus-marquee-track flex w-[200%] gap-3">
            {[...trustedColleges, ...trustedColleges].map((name, idx) => (
              <span key={`${name}-${idx}`} className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold tracking-wide text-amber-700 dark:border-white/15 dark:bg-white/5 dark:text-amber-200">
                {name}
              </span>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.18 }}
          variants={stagger}
          className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {stats.map((item) => (
            <motion.div key={item.label} variants={section} whileHover={reduceMotion ? undefined : { y: -4 }} className={`rounded-2xl p-5 ${card}`}>
              <div className={`text-sm ${muted}`}>{item.label}</div>
              <div className="mt-2 text-3xl font-extrabold">{item.value}</div>
            </motion.div>
          ))}
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={section}
          className="mt-14"
        >
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold">Upcoming events</h2>
              <p className={`mt-2 max-w-2xl ${muted}`}>Designed for instant discovery with date, venue, seat availability, and direct action.</p>
            </div>
            <Link to="/events" className="inline-flex items-center font-semibold text-amber-600 hover:text-amber-700">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <motion.div variants={stagger} className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {(events.length ? events : fallbackEvents).slice(0, 6).map((event) => (
              <motion.div key={event._id} variants={section} whileHover={reduceMotion ? undefined : { y: -7 }}>
                <Link to={`/events/${event._id}`} className={`block rounded-[1.5rem] p-6 ${card}`}>
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                      {event.eventType.replace("_", " ")}
                    </span>
                    <span className={`text-xs ${muted}`}>{event.college?.name || "Campus event"}</span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold leading-7">{event.title}</h3>
                  <p className={`mt-3 line-clamp-3 text-sm leading-6 ${muted}`}>{event.description}</p>
                  <div className={`mt-5 space-y-3 text-sm ${muted}`}>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-amber-500" />
                      <span>{formatDate(event.date)} | {event.startTime} - {event.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-amber-500" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-amber-500" />
                      <span>{getSeatsLeft(event)} seats left</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <section className="mt-14 grid gap-8 lg:grid-cols-2">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.18 }}
            variants={stagger}
            className={`rounded-[1.7rem] p-7 ${card}`}
          >
            <h2 className="text-3xl font-bold">Platform pillars</h2>
            <p className={`mt-3 ${muted}`}>The design is focused on operational clarity and trust-first communication.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {featurePillars.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div key={item.title} variants={section} whileHover={reduceMotion ? undefined : { y: -4 }} className="rounded-2xl border border-amber-100 bg-amber-50/65 p-4 dark:border-white/10 dark:bg-white/5">
                    <Icon className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                    <h3 className="mt-3 font-semibold">{item.title}</h3>
                    <p className={`mt-2 text-sm ${muted}`}>{item.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.18 }}
            variants={section}
            className={`rounded-[1.7rem] p-7 ${card}`}
          >
            <h2 className="text-3xl font-bold">From idea to certificate</h2>
            <p className={`mt-3 ${muted}`}>A clean flow that students and organisers understand in seconds.</p>
            <div className="mt-6 space-y-4">
              {workflow.map((step, index) => (
                <div key={step} className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white">{index + 1}</div>
                  <p className={`pt-1 text-sm font-medium ${muted}`}>{step}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mt-14"
        >
          <div className={`rounded-[1.8rem] p-7 ${card}`}>
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-3xl font-bold">Latest announcements</h2>
              <Link to="/announcements" className="text-sm font-semibold text-amber-600 hover:text-amber-700">View all</Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {(announcements.length ? announcements : fallbackAnnouncements).slice(0, 3).map((item) => (
                <div key={item._id} className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold">{item.title}</h3>
                    <span className="text-xs font-bold uppercase text-amber-700 dark:text-amber-300">{item.priority}</span>
                  </div>
                  <p className={`mt-2 text-sm leading-6 ${muted}`}>{item.content}</p>
                  <div className={`mt-3 text-xs ${muted}`}>{new Date(item.createdAt).toLocaleDateString("en-IN")} | {item.createdBy?.username || "Admin"}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mt-14"
        >
          <div className="rounded-[1.8rem] border border-amber-200/50 bg-gradient-to-r from-amber-500 to-orange-500 p-8 text-white shadow-[0_22px_80px_rgba(245,158,11,0.26)]">
            <h2 className="text-3xl font-black">Ready to launch your next campus event?</h2>
            <p className="mt-3 max-w-2xl text-amber-50/95">Create, publish, track, and certify events with an experience that feels enterprise-grade.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to={heroCTA} className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 font-semibold text-amber-700 transition hover:bg-amber-50">
                {heroCTA === "/events/create" ? "Create New Event" : "Explore Events"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link to="/announcements" className="inline-flex items-center justify-center rounded-xl border border-white/60 px-5 py-3 font-semibold text-white transition hover:bg-white/10">
                View Announcements
              </Link>
            </div>
          </div>
        </motion.section>

        {loading && (
          <div className={`mt-8 rounded-2xl p-4 text-sm ${card}`}>
            Live data is loading. Fallback event data is displayed when API is unavailable.
          </div>
        )}
      </div>
    </div>
  );
};

export default EventHome;
