import express from "express"
import Announcement from "../models/Announcement.js"
import { authenticateToken, requireAdmin } from "../middleware/auth.js"

const router = express.Router()

const requireAdminOrOrganiser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  if (req.user.role === "admin") {
    return next()
  }

  if (req.user.role === "organiser") {
    if (!req.user.college) {
      return res.status(403).json({ message: "Organiser must be linked to a college" })
    }
    return next()
  }

  return res.status(403).json({ message: "Not authorized to create announcement" })
}

// Get all active announcements
router.get("/", async (req, res) => {
  console.log("📢 Get announcements request")

  try {
    console.log("🔍 Querying active announcements...")
    const announcements = await Announcement.find({
      isActive: true,
    })
      .populate("createdBy", "username email")
      .sort({ priority: -1, createdAt: -1 })

    console.log("✅ Found announcements:", announcements.length)
    console.log("👤 Sample createdBy data:", announcements[0]?.createdBy)

    res.json(announcements)
  } catch (error) {
    console.error("❌ Get announcements error:", error)
    console.error("📊 Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    })
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Admin or organiser: Create announcement
router.post("/", authenticateToken, requireAdminOrOrganiser, async (req, res) => {
  console.log("📝 Create announcement request")
  console.log("📊 Request body:", req.body)
  console.log("👤 User from middleware:", req.user?.username, "Role:", req.user?.role)
  console.log("🔑 User ID:", req.user?._id)

  try {
    console.log("💾 Creating new announcement...")
    const announcement = new Announcement({
      ...req.body,
      createdBy: req.user._id,
    })

    console.log("📋 Announcement object before save:", {
      title: announcement.title,
      type: announcement.type,
      priority: announcement.priority,
      createdBy: announcement.createdBy,
    })
    await announcement.save()
    console.log("✅ Announcement created:", announcement._id)

    await announcement.populate("createdBy", "username")
    console.log("✅ Announcement populated with creator info")

    res.status(201).json(announcement)
  } catch (error) {
    console.error("❌ Create announcement error:", error)
    console.error("📊 Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    })
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

router.get("/:id", async (req, res) => {
  try {
    console.log("🔍 Fetching announcement by ID:", req.params.id)

    const announcement = await Announcement.findById(req.params.id).populate("createdBy", "username email")

    if (!announcement) {
      console.log("❌ Announcement not found:", req.params.id)
      return res.status(404).json({ message: "Announcement not found" })
    }

    console.log("✅ Announcement found:", announcement.title)
    console.log("👤 Created by:", announcement.createdBy?.username)

    res.json(announcement)
  } catch (error) {
    console.error("❌ Error fetching announcement:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Admin: Update announcement
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  console.log("✏️ Update announcement request for ID:", req.params.id)
  console.log("📊 Request body:", req.body)

  try {
    console.log("🔍 Finding and updating announcement...")
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(
      "createdBy",
      "username",
    )

    if (!announcement) {
      console.log("❌ Announcement not found:", req.params.id)
      return res.status(404).json({ message: "Announcement not found" })
    }

    console.log("✅ Announcement updated:", announcement._id)
    res.json(announcement)
  } catch (error) {
    console.error("❌ Update announcement error:", error)
    console.error("📊 Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    })
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Admin: Delete announcement
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  console.log("🗑️ Delete announcement request for ID:", req.params.id)

  try {
    console.log("🔍 Finding and deleting announcement...")
    const announcement = await Announcement.findByIdAndDelete(req.params.id)

    if (!announcement) {
      console.log("❌ Announcement not found:", req.params.id)
      return res.status(404).json({ message: "Announcement not found" })
    }

    console.log("✅ Announcement deleted:", req.params.id)
    res.json({ message: "Announcement deleted successfully" })
  } catch (error) {
    console.error("❌ Delete announcement error:", error)
    console.error("📊 Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    })
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

export default router
