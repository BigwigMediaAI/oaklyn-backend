const Lead = require("../modals/lead.modal");
const sendEmail = require("../utils/sendEmail");

/* ============================
   OTP TEMP STORAGE (IN-MEMORY)
=============================== */
const otpMap = new Map();

/* ============================
   OTP GENERATOR
=============================== */
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* ============================
   1️⃣ SEND OTP (NO DB SAVE)
=============================== */
exports.sendOtp = async (req, res) => {
  const { name, email, phone, purpose, requirements, budget, message } =
    req.body;

  if (!phone || !purpose || !requirements) {
    return res.status(400).json({
      message: "Phone, purpose and requirements are required",
    });
  }

  try {
    const otp = generateOTP();

    otpMap.set(phone, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      data: {
        name,
        email,
        phone,
        purpose,
        requirements,
        budget,
        message,
      },
    });

    if (email) {
      await sendEmail({
        to: email,
        subject: "OTP Verification - Oaklyn Real Estates",
        html: `
          <h2>Hello ${name || "Customer"},</h2>
          <p>Your OTP for verification is:</p>
          <h1 style="letter-spacing:4px">${otp}</h1>
          <p>This OTP is valid for 5 minutes.</p>
          <p>– Team Oaklyn Real Estates</p>
        `,
      });
    }

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

/* ============================
   2️⃣ VERIFY OTP → SAVE LEAD
=============================== */
exports.verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;

  try {
    const record = otpMap.get(phone);

    if (!record) {
      return res.status(400).json({ message: "OTP expired or invalid" });
    }

    if (record.expiresAt < Date.now()) {
      otpMap.delete(phone);
      return res.status(400).json({ message: "OTP expired" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const leadData = record.data;

    await Lead.create({
      ...leadData,
      isVerified: true,
    });

    otpMap.delete(phone);

    /* ============================
       ADMIN EMAIL
    =============================== */
    await sendEmail({
      to: "chandanpms@gmail.com",
      subject: "New Verified Lead",
      html: `
        <h3>New Verified Lead</h3>
        <p><strong>Name:</strong> ${leadData.name}</p>
        <p><strong>Phone:</strong> ${leadData.phone}</p>
        <p><strong>Email:</strong> ${leadData.email || "N/A"}</p>
        <p><strong>Purpose:</strong> ${leadData.purpose}</p>
        <p><strong>Requirements:</strong> ${leadData.requirements}</p>
        <p><strong>Budget:</strong> ${leadData.budget || "N/A"}</p>
        <p><strong>Message:</strong> ${leadData.message || "-"}</p>
      `,
    });

    res.status(200).json({
      message: "OTP verified & lead saved successfully",
    });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

/* ============================
   📄 GET ALL LEADS
=============================== */
exports.getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.status(200).json(leads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch leads" });
  }
};

/* ============================
   ✏️ UPDATE LEAD
=============================== */
exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.status(200).json(lead);
  } catch (err) {
    res.status(500).json({ message: "Failed to update lead" });
  }
};

/* ============================
   ❌ DELETE LEAD
=============================== */
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.status(200).json({ message: "Lead deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete lead" });
  }
};

/* ============================
   🧹 AUTO CLEAN EXPIRED OTPs
=============================== */
setInterval(
  () => {
    const now = Date.now();
    for (const [phone, record] of otpMap.entries()) {
      if (record.expiresAt < now) {
        otpMap.delete(phone);
      }
    }
  },
  10 * 60 * 1000,
);
