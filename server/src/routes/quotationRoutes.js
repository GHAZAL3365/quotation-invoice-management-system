
const express = require("express");
const router = express.Router();

const quotationController = require("../controllers/quotationController");
const validateRequest = require("../validators/validateRequest");
const authenticate = require("../middleware/authenticate");
const authorizeRoles = require("../middleware/authorizeRoles");
const requireCsrfToken = require("../middleware/requireCsrfToken");
const {
  createQuotationSchema,
  updateQuotationSchema,
  quotationIdSchema,
  listQuotationsQuerySchema,
} = require("../validators/quotationValidator");


// All quotation endpoints require an authenticated admin.
router.use(authenticate);
router.use(authorizeRoles("admin"));

// Keep the PDF route before the generic ID route.
router.get(
    "/:id/pdf",
    validateRequest(quotationIdSchema, "params"),
    quotationController.downloadQuotationPdf
);

router.get("/", quotationController.getQuotations);

router.post(
    "/",
    requireCsrfToken,
    validateRequest(createQuotationSchema),
    quotationController.createQuotation
);



router.get("/:id", validateRequest(quotationIdSchema, "params"), quotationController.getQuotationById);

router.patch(
    "/:id",
    requireCsrfToken,
    validateRequest(quotationIdSchema, "params"),
    validateRequest(updateQuotationSchema),
    quotationController.updateQuotation
);

router.delete(
    "/:id",
    requireCsrfToken,
    validateRequest(quotationIdSchema, "params"),
    quotationController.deleteQuotation
);

module.exports = router;
