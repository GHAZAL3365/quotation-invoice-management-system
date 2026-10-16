const express = require("express");
const {createClientSchema} = require("../validators/clientValidator");
const validateRequest = require("../validators/validateRequest");
const {
  createClient,
  getClients,
} = require("../controllers/clientController");


const router = express.Router();

router.post("/", validateRequest(createClientSchema), createClient);
router.get("/", getClients);

module.exports = router;