const express = require("express");
const validateRequest = require("../validators/validateRequest");
const authenticate = require("../middleware/authenticate");
const {createInvoiceSchema, updateInvoiceSchema, invoiceIdSchema} = require("../validators/invoiceValidator");
const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice
} = require("../controllers/invoiceController");

const router = express.Router();

router.post("/", authenticate, validateRequest(createInvoiceSchema), createInvoice);
router.get("/", authenticate, getInvoices);
router.get("/:id", authenticate, validateRequest(invoiceIdSchema, "params"), getInvoiceById);
router.put("/:id", authenticate, validateRequest(invoiceIdSchema, "params"),validateRequest(updateInvoiceSchema), updateInvoice);
router.delete("/:id", authenticate, validateRequest(invoiceIdSchema, "params"), deleteInvoice);

module.exports = router;