
const puppeteer = require("puppeteer");
const invoiceService = require("./invoiceService");
const renderInvoiceTemplate = require("../templates/invoiceTemplate");

const generateInvoicePdf = async (invoiceId) => {
  const invoice = await invoiceService.getInvoiceById(invoiceId);

  if (!invoice) {
    const error = new Error("Invoice not found");
    error.statusCode = 404;
    throw error;
  }

  const html = renderInvoiceTemplate(invoice);

  const browser = await puppeteer.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "load",
      timeout: 15000,
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
      margin: {
        top: "12mm",
        right: "12mm",
        bottom: "12mm",
        left: "12mm",
      },
    });

    return {
      pdfBuffer,
      invoiceNumber: invoice.invoiceNumber || invoice._id.toString(),
    };
  } finally {
    await browser.close();
  }
};

module.exports = { generateInvoicePdf };
