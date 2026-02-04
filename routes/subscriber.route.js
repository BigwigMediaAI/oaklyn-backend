const express = require("express");
const {
  subscribeEmail,
  getAllSubscribers,
  unsubscribeEmail,
} = require("../controllers/subscriber.controller");

const router = express.Router();

router.post("/", subscribeEmail);
router.get("/", getAllSubscribers); // admin
router.delete("/:id", unsubscribeEmail);

module.exports = router;
