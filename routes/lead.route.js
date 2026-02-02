const express = require("express");
const router = express.Router();

const {
  sendOtp,
  verifyOtp,
  getAllLeads,
  updateLead,
  deleteLead,
} = require("../controllers/lead.controller");

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get("/all", getAllLeads);
router.put("/:id", updateLead);
router.delete("/:id", deleteLead);

module.exports = router;
