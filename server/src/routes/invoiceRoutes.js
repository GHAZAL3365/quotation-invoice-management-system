const express = require("express");
const validateRequest = require("../validators/validateRequest");
const {createInvoiceSchema, updateInvoiceSchema} = require("../validators/invoiceValidator");
const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice
} = require("../controllers/invoiceController");

const router = express.Router();

router.post("/", validateRequest(createInvoiceSchema), createInvoice);
router.get("/", getInvoices);
router.get("/:id", validateRequest(invoiceIdSchema, "params"), getInvoiceById);
router.put("/:id", validateRequest(invoiceIdSchema, "params"),validateRequest(updateInvoiceSchema), updateInvoice);
router.delete("/:id", validateRequest(invoiceIdSchema, "params"), deleteInvoice);

module.exports = router;