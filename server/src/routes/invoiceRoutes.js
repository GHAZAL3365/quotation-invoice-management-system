const express = require("express");
const validateRequest = require("../validators/validateRequest");
const authenticate = require("../middleware/authenticate");
const authorizeRoles = require("../middleware/authorizeRoles");
const requireCsrfToken = require("../middleware/requireCsrfToken");
const{getInvoicePayments,createPayment} = require("../controllers/paymentController");
const { createPaymentSchema, paymentIdParamsSchema } = require("../validators/paymentValidator");
const { createInvoiceSchema, updateInvoiceSchema, invoiceIdSchema } = require("../validators/invoiceValidator");
const {downloadInvoicePdf} = require("../controllers/invoicePdfController");

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
router.put("/:id", authenticate, validateRequest(invoiceIdSchema, "params"), validateRequest(updateInvoiceSchema), updateInvoice);
router.delete("/:id", authenticate, validateRequest(invoiceIdSchema, "params"), deleteInvoice);


// Record a payment against an invoice
router.post(
  "/:id/payments",
  authenticate,
  authorizeRoles("admin"),
  // requireCsrfToken,
  validateRequest(paymentIdParamsSchema, "params"),
  validateRequest(createPaymentSchema, "body"),
  createPayment
);

// Get payment history for an invoice
router.get(
  "/:id/payments",
  authenticate,
  authorizeRoles("admin"),
  validateRequest(paymentIdParamsSchema, "params"),
  getInvoicePayments
);
router.get(
  "/:id/pdf",
  authenticate,
  authorizeRoles("admin"),
  validateRequest(invoiceIdSchema, "params"),
  downloadInvoicePdf
);

module.exports = router;