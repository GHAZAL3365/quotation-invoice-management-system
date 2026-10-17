
const invoiceService = require("../services/invoiceService");

const createInvoice = async (req, res) => {
  const invoice = await invoiceService.createInvoice(req.body);

  return res.status(201).json({
    success: true,
    message: "Invoice created successfully",
    data: invoice,
  });
};

const getInvoices = async (req, res) => {
  const result = await invoiceService.getInvoices(req.query);

  return res.status(200).json({
    success: true,
    message: "Invoices retrieved successfully",
    data: result.invoices,
    pagination: result.pagination,
  });
};

const getInvoiceById = async (req, res) => {
  const invoice = await invoiceService.getInvoiceById(
    req.params.id
  );

  return res.status(200).json({
    success: true,
    message: "Invoice retrieved successfully",
    data: invoice,
  });
};

module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
};
