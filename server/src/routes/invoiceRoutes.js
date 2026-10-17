const express = require("express");
const validateRequest = require("../validators/validateRequest");
const createInvoiceSchema = require("../validators/invoiceValidator");
const {
  createInvoice,
  getInvoices,
  getInvoiceById,
} = require("../controllers/invoiceController");

const router = express.Router();

router.post("/", validateRequest(createInvoiceSchema), createInvoice);
router.get("/", getInvoices);
router.get("/:id", getInvoiceById);

module.exports = router;