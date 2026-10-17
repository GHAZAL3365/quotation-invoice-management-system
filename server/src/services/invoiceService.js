
const Invoice = require("../models/Invoice");
const Client = require("../models/Client");
const generateInvoiceNumber = require("../utils/generateInvoiceNumber");

const createInvoice = async (invoiceData) => {
    const {
        client,
        invoiceDate,
        dueDate,
        items,
        discount = 0,
        taxRate = 0,
        notes,
    } = invoiceData;

    // Check that the client exists and is not soft-deleted.
    const existingClient = await Client.findOne({
        _id: client,
        isDeleted: { $ne: true },
    });

    if (!existingClient) {
        const error = new Error("Client not found");
        error.statusCode = 404;
        throw error;
    }

    // Calculate line-item amounts on the backend.
    const calculatedItems = items.map((item) => {
        const amount = Number(
            (item.quantity * item.rate).toFixed(2)
        );

        return {
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount,
        };
    });

    const subtotal = Number(
        calculatedItems
            .reduce((sum, item) => sum + item.amount, 0)
            .toFixed(2)
    );

    if (discount > subtotal) {
        const error = new Error(
            "Discount cannot exceed the invoice subtotal"
        );
        error.statusCode = 400;
        throw error;
    }

    const taxableAmount = Number((subtotal - discount).toFixed(2));

    const taxAmount = Number(
        (taxableAmount * (taxRate / 100)).toFixed(2)
    );

    const total = Number(
        (taxableAmount + taxAmount).toFixed(2)
    );

    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await Invoice.create({
        invoiceNumber,
        client,
        invoiceDate,
        dueDate,
        items: calculatedItems,
        subtotal,
        discount,
        taxRate,
        taxAmount,
        total,
        paidAmount: 0,
        status: "Unpaid",
        notes,
    });

    return invoice;
};

const getInvoices = async ({ page = 1, limit = 10 }) => {
    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
        Invoice.find({ isDeleted: { $ne: true } })
            .populate("client", "clientName email")
            .sort({ createdAt: -1, _id: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),

        Invoice.countDocuments({ isDeleted: { $ne: true } }),
    ]);

    return {
        invoices,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

const getInvoiceById = async (invoiceId) => {
    const invoice = await Invoice.findById({
        _id: invoiceId,
        isDeleted: { $ne: true },
    })
        .populate("client", "clientName email phone billingAddress")
        .lean();

    if (!invoice) {
        const error = new Error("Invoice not found");
        error.statusCode = 404;
        throw error;
    }

    return invoice;
};


const updateInvoice = async (invoiceId, invoiceData) => {
    const invoice = await Invoice.findOne({
        _id: invoiceId,
        isDeleted: { $ne: true },
    });

    if (!invoice) {
        const error = new Error("Invoice not found");
        error.statusCode = 404;
        throw error;
    }

    // Prevent changes after payments have been recorded.
    if (invoice.paidAmount > 0) {
        const error = new Error(
            "Invoices with recorded payments cannot be edited"
        );
        error.statusCode = 400;
        throw error;
    }

    const {
        client,
        invoiceDate,
        dueDate,
        items,
        discount,
        taxRate,
        notes,
    } = invoiceData;

    const updatedClientId = client ?? invoice.client;

    const existingClient = await Client.findOne({
        _id: updatedClientId,
        isDeleted: { $ne: true },
    });

    if (!existingClient) {
        const error = new Error("Client not found");
        error.statusCode = 404;
        throw error;
    }

    const updatedInvoiceDate = invoiceDate ?? invoice.invoiceDate;
    const updatedDueDate = dueDate ?? invoice.dueDate;

    if (updatedDueDate < updatedInvoiceDate) {
        const error = new Error(
            "Due date cannot be before the invoice date"
        );
        error.statusCode = 400;
        throw error;
    }

    const updatedItems = items ?? invoice.items;
    const updatedDiscount = discount ?? invoice.discount;
    const updatedTaxRate = taxRate ?? invoice.taxRate;

    const calculatedItems = updatedItems.map((item) => {
        const amount = Number(
            (item.quantity * item.rate).toFixed(2)
        );

        return {
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount,
        };
    });

    const subtotal = Number(
        calculatedItems
            .reduce((sum, item) => sum + item.amount, 0)
            .toFixed(2)
    );

    if (updatedDiscount > subtotal) {
        const error = new Error(
            "Discount cannot exceed the invoice subtotal"
        );
        error.statusCode = 400;
        throw error;
    }

    const taxableAmount = Number(
        (subtotal - updatedDiscount).toFixed(2)
    );

    const taxAmount = Number(
        (taxableAmount * (updatedTaxRate / 100)).toFixed(2)
    );

    const total = Number(
        (taxableAmount + taxAmount).toFixed(2)
    );

    invoice.client = updatedClientId;
    invoice.invoiceDate = updatedInvoiceDate;
    invoice.dueDate = updatedDueDate;
    invoice.items = calculatedItems;
    invoice.discount = updatedDiscount;
    invoice.taxRate = updatedTaxRate;
    invoice.subtotal = subtotal;
    invoice.taxAmount = taxAmount;
    invoice.total = total;

    if (notes !== undefined) {
        invoice.notes = notes;
    }

    await invoice.save();

    return invoice;
};


const deleteInvoice = async (invoiceId) => {
    const invoice = await Invoice.findOne({
        _id: invoiceId,
        isDeleted: { $ne: true },
    });

    if (!invoice) {
        const error = new Error("Invoice not found");
        error.statusCode = 404;
        throw error;
    }

    if (invoice.paidAmount > 0) {
        const error = new Error(
            "Invoices with recorded payments cannot be deleted"
        );
        error.statusCode = 400;
        throw error;
    }

    invoice.isDeleted = true;
    await invoice.save();

    return invoice;
};



module.exports = {
    createInvoice,
    getInvoices,
    getInvoiceById,
    updateInvoice,
    deleteInvoice
};
