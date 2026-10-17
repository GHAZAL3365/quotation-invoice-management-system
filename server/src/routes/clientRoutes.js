const express = require("express");
const { createClientSchema, listClientsQuerySchema, clientIdSchema, updateClientSchema } = require("../validators/clientValidator");
const validateRequest = require("../validators/validateRequest");
const {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
} = require("../controllers/clientController");


const router = express.Router();

router.post("/", validateRequest(createClientSchema), createClient);
router.get("/", validateRequest(listClientsQuerySchema, "query"), getClients);
router.get("/:id", validateRequest(clientIdSchema, "params"), getClientById);
router.put("/:id", validateRequest(clientIdSchema, "params"), validateRequest(updateClientSchema), updateClient);
router.delete("/:id", validateRequest(clientIdSchema, "params"), deleteClient);

module.exports = router;