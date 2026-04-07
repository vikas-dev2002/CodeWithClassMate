import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import User from "../models/User.js";
import College from "../models/College.js";
import Event from "../models/Event.js";
import Problem from "../models/Problem.js";
import Contest from "../models/Contest.js";
import Announcement from "../models/Announcement.js";
import Discussion from "../models/Discussion.js";
import ChatRoom from "../models/ChatRoom.js";
import Message from "../models/Message.js";
import ChatHistory from "../models/ChatHistory.js";
import Subject from "../models/Subject.js";
import Document from "../models/Document.js";
import MCQQuestion from "../models/MCQQuestion.js";
import RapidFireGame from "../models/RapidFireGame.js";
import RapidFireStats from "../models/RapidFireStats.js";
import Game from "../models/Game.js";
import { RedeemItem, RedeemOrder } from "../models/Redeem.js";
import ProblemOfTheDay from "../models/ProblemOfTheDay.js";
import Quiz from "../models/Quiz.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });

const FLOW_PREFIX = "FLOWTEST";

const cleanupFlowData = async () => {
  const flowUsernames = [
    `${FLOW_PREFIX}_admin`,
    `${FLOW_PREFIX}_org_iet`,
    `${FLOW_PREFIX}_org_aktu`,
    `${FLOW_PREFIX}_student_1`,
    `${FLOW_PREFIX}_student_2`,
    `${FLOW_PREFIX}_student_3`,
  ];

  const users = await User.find({ username: { $in: flowUsernames } }).select("_id");
  const userIds = users.map((u) => u._id);
  const flowRooms = await ChatRoom.find({ name: new RegExp(`^${FLOW_PREFIX}`) }).select("_id");
  const flowRoomIds = flowRooms.map((r) => r._id);
  const flowProblems = await Problem.find({ title: new RegExp(`^${FLOW_PREFIX}`) }).select("_id");
  const flowProblemIds = flowProblems.map((p) => p._id);
  const flowRedeemItems = await RedeemItem.find({ name: new RegExp(`^${FLOW_PREFIX}`) }).select("_id");
  const flowRedeemItemIds = flowRedeemItems.map((item) => item._id);

  await Promise.all([
    Message.deleteMany({ room: { $in: flowRoomIds } }),
    ChatRoom.deleteMany({ name: new RegExp(`^${FLOW_PREFIX}`) }),
    ChatHistory.deleteMany({ sessionId: new RegExp(`^${FLOW_PREFIX}`) }),
    Discussion.deleteMany({ title: new RegExp(`^${FLOW_PREFIX}`) }),
    Announcement.deleteMany({ title: new RegExp(`^${FLOW_PREFIX}`) }),
    Event.deleteMany({ title: new RegExp(`^${FLOW_PREFIX}`) }),
    Contest.deleteMany({ name: new RegExp(`^${FLOW_PREFIX}`) }),
    Problem.deleteMany({ title: new RegExp(`^${FLOW_PREFIX}`) }),
    MCQQuestion.deleteMany({ question: new RegExp(`^${FLOW_PREFIX}`) }),
    RapidFireGame.deleteMany({ roomId: new RegExp(`^${FLOW_PREFIX}`) }),
    RapidFireStats.deleteMany({ user: { $in: userIds } }),
    Game.deleteMany({ roomId: new RegExp(`^${FLOW_PREFIX}`) }),
    RedeemOrder.deleteMany({ $or: [{ userId: { $in: userIds } }, { itemId: { $in: flowRedeemItemIds } }] }),
    RedeemItem.deleteMany({ name: new RegExp(`^${FLOW_PREFIX}`) }),
    ProblemOfTheDay.deleteMany({ problem: { $in: flowProblemIds } }),
    Document.deleteMany({ title: new RegExp(`^${FLOW_PREFIX}`) }),
    Subject.deleteMany({ name: new RegExp(`^${FLOW_PREFIX}`) }),
    Quiz.deleteMany({ title: new RegExp(`^${FLOW_PREFIX}`) }),
    User.deleteMany({ username: { $in: flowUsernames } }),
    College.deleteMany({ code: new RegExp(`^${FLOW_PREFIX}`) }),
  ]);
};

const seedFlowData = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is missing in .env");
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  await cleanupFlowData();
  console.log("Old FLOWTEST data cleared");

  const [ietCollege, aktuCollege] = await College.create([
    {
      name: `${FLOW_PREFIX} Institute of Engineering`,
      city: "Lucknow",
      state: "Uttar Pradesh",
      code: `${FLOW_PREFIX}_IET`,
    },
    {
      name: `${FLOW_PREFIX} Technical University`,
      city: "Lucknow",
      state: "Uttar Pradesh",
      code: `${FLOW_PREFIX}_AKTU`,
    },
  ]);

  const [admin, organiserIet, organiserAktu, student1, student2, student3] = await User.create([
    {
      username: `${FLOW_PREFIX}_admin`,
      email: `${FLOW_PREFIX.toLowerCase()}_admin@mail.com`,
      password: "Pass@123",
      role: "admin",
      college: ietCollege._id,
      profile: { firstName: "Flow", lastName: "Admin" },
    },
    {
      username: `${FLOW_PREFIX}_org_iet`,
      email: `${FLOW_PREFIX.toLowerCase()}_organiser_iet@mail.com`,
      password: "Pass@123",
      role: "organiser",
      college: ietCollege._id,
      profile: { firstName: "IET", lastName: "Organiser" },
    },
    {
      username: `${FLOW_PREFIX}_org_aktu`,
      email: `${FLOW_PREFIX.toLowerCase()}_organiser_aktu@mail.com`,
      password: "Pass@123",
      role: "organiser",
      college: aktuCollege._id,
      profile: { firstName: "AKTU", lastName: "Organiser" },
    },
    {
      username: `${FLOW_PREFIX}_student_1`,
      email: `${FLOW_PREFIX.toLowerCase()}_student1@mail.com`,
      password: "Pass@123",
      role: "user",
      college: ietCollege._id,
      rollNo: "IET001",
      branch: "CSE",
      year: 3,
      profile: { firstName: "Aman", lastName: "Singh" },
      coins: 120,
    },
    {
      username: `${FLOW_PREFIX}_student_2`,
      email: `${FLOW_PREFIX.toLowerCase()}_student2@mail.com`,
      password: "Pass@123",
      role: "user",
      college: ietCollege._id,
      rollNo: "IET002",
      branch: "IT",
      year: 2,
      profile: { firstName: "Neha", lastName: "Verma" },
      coins: 160,
    },
    {
      username: `${FLOW_PREFIX}_student_3`,
      email: `${FLOW_PREFIX.toLowerCase()}_student3@mail.com`,
      password: "Pass@123",
      role: "user",
      college: aktuCollege._id,
      rollNo: "AKTU001",
      branch: "AIML",
      year: 4,
      profile: { firstName: "Ravi", lastName: "Kumar" },
      coins: 90,
    },
  ]);

  const [problem1, problem2, problem3] = await Problem.create([
    {
      title: `${FLOW_PREFIX} Two Sum Variant`,
      description: "Find indices of two numbers that add up to target.",
      difficulty: "Easy",
      tags: ["Array", "Hash Table"],
      companies: ["Google", "Amazon"],
      constraints: "1 <= n <= 1e5",
      examples: [{ input: "2 7 11 15, 9", output: "[0,1]", explanation: "2+7=9" }],
      testCases: [
        { input: "2 7 11 15\n9", output: "0 1", isPublic: true },
        { input: "3 2 4\n6", output: "1 2", isPublic: false },
      ],
      referenceSolution: [{ language: "cpp", completeCode: "int main(){return 0;}" }],
      createdBy: admin._id,
      isPublished: true,
    },
    {
      title: `${FLOW_PREFIX} Sliding Window Max`,
      description: "Return max sum subarray of size k.",
      difficulty: "Medium",
      tags: ["Array", "Sliding Window"],
      companies: ["Microsoft"],
      constraints: "1 <= n <= 1e5",
      examples: [{ input: "1 2 3 4, k=2", output: "7", explanation: "3+4" }],
      testCases: [{ input: "1 2 3 4\n2", output: "7", isPublic: true }],
      referenceSolution: [{ language: "python", completeCode: "print('ok')" }],
      createdBy: admin._id,
      isPublished: true,
    },
    {
      title: `${FLOW_PREFIX} Graph Shortest Path`,
      description: "Compute shortest path in weighted graph.",
      difficulty: "Hard",
      tags: ["Graph", "Dijkstra"],
      companies: ["Meta"],
      constraints: "1 <= V <= 1e4",
      examples: [{ input: "5 nodes", output: "dist[]", explanation: "Dijkstra" }],
      testCases: [{ input: "graph-data", output: "dist", isPublic: true }],
      referenceSolution: [{ language: "java", completeCode: "class Main{}" }],
      createdBy: admin._id,
      isPublished: true,
    },
  ]);

  const contest = await Contest.create({
    name: `${FLOW_PREFIX} Weekly Contest`,
    description: "Flow validation contest",
    startTime: new Date(Date.now() - 60 * 60 * 1000),
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    duration: 180,
    status: "ongoing",
    problems: [
      { problem: problem1._id, score: 100, order: 1 },
      { problem: problem2._id, score: 200, order: 2 },
    ],
    participants: [
      { user: student1._id, username: student1.username, score: 100, rank: 1 },
      { user: student2._id, username: student2.username, score: 50, rank: 2 },
    ],
    createdBy: admin._id,
    isPublic: true,
  });

  const eventContest = await Event.create({
    title: `${FLOW_PREFIX} Coding Contest Event`,
    description: "Contest event connected with contest module",
    venue: "Lab 1",
    date: new Date(Date.now() + 24 * 60 * 60 * 1000),
    startTime: "10:00",
    endTime: "13:00",
    capacity: 150,
    eventType: "coding_contest",
    contestId: contest._id,
    college: ietCollege._id,
    createdBy: organiserIet._id,
    registrations: [
      { studentId: student1._id, qrToken: `${FLOW_PREFIX}_qr_1`, attended: true, attendedAt: new Date() },
      { studentId: student2._id, qrToken: `${FLOW_PREFIX}_qr_2`, attended: false },
    ],
    tags: ["coding", "contest"],
  });

  const eventWorkshop = await Event.create({
    title: `${FLOW_PREFIX} AI Workshop Event`,
    description: "Workshop for testing normal event registration flow",
    venue: "Seminar Hall",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    startTime: "11:00",
    endTime: "14:00",
    capacity: 80,
    eventType: "workshop",
    college: aktuCollege._id,
    createdBy: organiserAktu._id,
    registrations: [{ studentId: student3._id, qrToken: `${FLOW_PREFIX}_qr_3`, attended: false }],
    tags: ["workshop", "ai"],
  });

  await User.updateMany(
    { _id: { $in: [student1._id, student2._id, student3._id] } },
    { $set: { registeredEvents: [] } },
  );
  await User.findByIdAndUpdate(student1._id, {
    $push: { registeredEvents: { eventId: eventContest._id, qrCode: `${FLOW_PREFIX}_qr_1`, attended: true, attendedAt: new Date() } },
  });
  await User.findByIdAndUpdate(student2._id, {
    $push: { registeredEvents: { eventId: eventContest._id, qrCode: `${FLOW_PREFIX}_qr_2`, attended: false } },
  });
  await User.findByIdAndUpdate(student3._id, {
    $push: { registeredEvents: { eventId: eventWorkshop._id, qrCode: `${FLOW_PREFIX}_qr_3`, attended: false } },
  });

  await Announcement.create([
    {
      title: `${FLOW_PREFIX} Platform Update`,
      content: "This announcement is for testing the announcement feed.",
      type: "update",
      priority: "high",
      createdBy: admin._id,
      contestId: contest._id,
      pinned: true,
    },
    {
      title: `${FLOW_PREFIX} Event Reminder`,
      content: "Please report 15 minutes before event start.",
      type: "general",
      priority: "medium",
      createdBy: organiserIet._id,
    },
  ]);

  await Discussion.create({
    title: `${FLOW_PREFIX} How to prepare for upcoming contest?`,
    content: "Share your strategy for medium and hard questions.",
    author: student1._id,
    tags: ["contest", "prep"],
    comments: [{ content: "Practice arrays + graphs.", author: student2._id }],
  });

  const chatRoom = await ChatRoom.create({
    name: `${FLOW_PREFIX} General Chat`,
    description: "Chat room for flow testing",
    type: "general",
    participants: [student1._id, student2._id, organiserIet._id],
    admins: [organiserIet._id],
    createdBy: organiserIet._id,
  });

  await Message.create([
    { content: "Hello everyone", sender: student1._id, room: chatRoom._id, type: "text" },
    { content: "Welcome to the event chat", sender: organiserIet._id, room: chatRoom._id, type: "system" },
  ]);

  await ChatHistory.create({
    user: student1._id,
    problemId: String(problem1._id),
    problemTitle: problem1.title,
    sessionId: `${FLOW_PREFIX}_chat_session_1`,
    messages: [
      { prompt: "How to solve this?", response: "Use hash map in O(n)." },
      { prompt: "Any edge case?", response: "Duplicate values and negative numbers." },
    ],
  });

  const subject = await Subject.create({
    name: `${FLOW_PREFIX} Data Structures`,
    description: "Subject for docs module test",
    createdBy: admin._id,
  });

  await Document.create({
    title: `${FLOW_PREFIX} Linked List Notes`,
    subject: subject._id,
    description: "Intro + operations of linked list",
    blocks: [
      { id: "b1", type: "heading", content: "Linked List", attrs: { level: 1 } },
      { id: "b2", type: "paragraph", content: "A linked list is a linear data structure..." },
    ],
    tags: ["linked-list", "dsa"],
    isPublished: true,
    createdBy: admin._id,
  });

  const mcqDocs = await MCQQuestion.create([
    {
      question: `${FLOW_PREFIX} What is time complexity of binary search?`,
      options: [
        { text: "O(n)", isCorrect: false },
        { text: "O(log n)", isCorrect: true },
        { text: "O(n log n)", isCorrect: false },
        { text: "O(1)", isCorrect: false },
      ],
      domain: "dsa",
      difficulty: "Easy",
      explanation: "Binary search halves the search space each step.",
      createdBy: admin._id,
    },
    {
      question: `${FLOW_PREFIX} CAP theorem has how many guarantees?`,
      options: [
        { text: "2", isCorrect: false },
        { text: "3", isCorrect: true },
        { text: "4", isCorrect: false },
        { text: "5", isCorrect: false },
      ],
      domain: "system-design",
      difficulty: "Medium",
      explanation: "Consistency, Availability, Partition tolerance.",
      createdBy: admin._id,
    },
    {
      question: `${FLOW_PREFIX} Which model is commonly used for classification?`,
      options: [
        { text: "Linear Regression", isCorrect: false },
        { text: "Logistic Regression", isCorrect: true },
        { text: "K-Means", isCorrect: false },
        { text: "PCA", isCorrect: false },
      ],
      domain: "aiml",
      difficulty: "Easy",
      explanation: "Logistic regression is used for classification tasks.",
      createdBy: admin._id,
    },
    {
      question: `${FLOW_PREFIX} 15% of 200 equals?`,
      options: [
        { text: "25", isCorrect: false },
        { text: "30", isCorrect: true },
        { text: "35", isCorrect: false },
        { text: "40", isCorrect: false },
      ],
      domain: "aptitude",
      difficulty: "Easy",
      explanation: "200 * 0.15 = 30.",
      createdBy: admin._id,
    },
  ]);

  const rapidGame = await RapidFireGame.create({
    roomId: `${FLOW_PREFIX}_rapid_room_1`,
    gameMode: "room",
    questionSet: mcqDocs.map((q) => q._id),
    totalQuestions: 4,
    status: "finished",
    players: [
      {
        user: student1._id,
        usernameSnapshot: student1.username,
        status: "finished",
        score: 3,
        correctAnswers: 3,
        wrongAnswers: 1,
        questionsAnswered: 4,
      },
      {
        user: student2._id,
        usernameSnapshot: student2.username,
        status: "finished",
        score: 2,
        correctAnswers: 2,
        wrongAnswers: 2,
        questionsAnswered: 4,
      },
    ],
    winner: student1._id,
    result: "win",
  });

  await RapidFireStats.create([
    {
      user: student1._id,
      gamesPlayed: 1,
      gamesWon: 1,
      totalScore: 3,
      averageScore: 3,
      totalQuestionsAnswered: 4,
      totalCorrectAnswers: 3,
      totalWrongAnswers: 1,
      accuracy: 75,
      currentRating: 1212,
      ratingHistory: [{ rating: 1212, change: 12, gameId: rapidGame._id, opponent: student2._id, result: "win" }],
    },
    {
      user: student2._id,
      gamesPlayed: 1,
      gamesLost: 1,
      totalScore: 2,
      averageScore: 2,
      totalQuestionsAnswered: 4,
      totalCorrectAnswers: 2,
      totalWrongAnswers: 2,
      accuracy: 50,
      currentRating: 1188,
      ratingHistory: [{ rating: 1188, change: -12, gameId: rapidGame._id, opponent: student1._id, result: "loss" }],
    },
  ]);

  await Game.create({
    roomId: `${FLOW_PREFIX}_code_room_1`,
    gameMode: "room",
    problem: problem2._id,
    timeLimit: 30,
    status: "finished",
    players: [
      {
        user: student1._id,
        usernameSnapshot: student1.username,
        status: "finished",
        language: "cpp",
        verdict: "accepted",
        score: 100,
      },
      {
        user: student2._id,
        usernameSnapshot: student2.username,
        status: "finished",
        language: "python",
        verdict: "wrong",
        score: 60,
      },
    ],
    winner: student1._id,
    result: "win",
  });

  const redeemItem = await RedeemItem.create({
    name: `${FLOW_PREFIX} Hoodie`,
    description: "Premium hoodie for testing redeem flow",
    coinsCost: 80,
    category: "clothing",
    imageUrl: "https://via.placeholder.com/400x300.png?text=Flowtest+Hoodie",
    inStock: true,
  });

  await RedeemOrder.create({
    userId: student1._id,
    itemId: redeemItem._id,
    quantity: 1,
    totalCost: 80,
    deliveryAddress: {
      fullName: "Aman Singh",
      phone: "9999999999",
      address: "Flow Street 1",
      city: "Lucknow",
      state: "UP",
      pincode: "226001",
    },
    status: "processing",
  });

  await ProblemOfTheDay.create({
    problem: problem1._id,
    date: new Date(),
    solvedCount: 2,
    isActive: true,
  });

  await Quiz.create({
    title: `${FLOW_PREFIX} DSA Quiz`,
    chapter: new mongoose.Types.ObjectId(),
    questions: [
      {
        questionText: "Which DS uses FIFO?",
        options: [
          { text: "Stack", isCorrect: false },
          { text: "Queue", isCorrect: true },
          { text: "Tree", isCorrect: false },
          { text: "Graph", isCorrect: false },
        ],
        explanation: "Queue works on FIFO.",
      },
    ],
    passingScore: 60,
    timeLimit: 15,
    published: true,
  });

  console.log("\nFLOWTEST seed inserted successfully.");
  console.log("Login credentials:");
  console.log(`- Admin: ${FLOW_PREFIX}_admin / Pass@123`);
  console.log(`- Organiser (IET): ${FLOW_PREFIX}_org_iet / Pass@123`);
  console.log(`- Organiser (AKTU): ${FLOW_PREFIX}_org_aktu / Pass@123`);
  console.log(`- Student 1: ${FLOW_PREFIX}_student_1 / Pass@123`);
  console.log(`- Student 2: ${FLOW_PREFIX}_student_2 / Pass@123`);
  console.log(`- Student 3: ${FLOW_PREFIX}_student_3 / Pass@123`);
};

seedFlowData()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("FLOWTEST seeding failed:", error);
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error("Disconnect error:", disconnectError.message);
    }
    process.exit(1);
  });
