const mongoose = require("mongoose");   
const Invoice = require("../models/Invoice");
const Client = require("../models/Client");


exports.createInvoice = async (req, res) => {
    try {
        const {
            invoiceNumber,
            client,
            invoiceDate,
            dueDate,
            items,
            discount = 0,
            taxRate = 0,
            paidAmount = 0,
        } = req.body;

        if (!invoiceNumber?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Invoice number is required",
            });
        }

        if (!client || !invoiceDate || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Client, invoice date and at least one item are required",
            });
        }

        if (
            !mongoose.isValidObjectId(client) ||
            !(await Client.exists({ _id: client }))
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid client",
            });
        }

        const validItems = items.map((item) => {
            const quantity = Number(item.quantity);
            const rate = Number(item.rate);

            if (
                !item.description?.trim() ||
                !Number.isFinite(quantity) ||
                quantity <= 0 ||
                !Number.isFinite(rate) ||
                rate < 0
            ) {
                throw new Error("Each item needs a description, positive quantity and valid rate");
            }

            return {
                description: item.description.trim(),
                quantity,
                rate,
            };
        });

        const parsedDiscount = Number(discount);
        const parsedTaxRate = Number(taxRate);
        const parsedPaidAmount = Number(paidAmount);

        if (
            !Number.isFinite(parsedDiscount) ||
            parsedDiscount < 0 ||
            !Number.isFinite(parsedTaxRate) ||
            parsedTaxRate < 0 ||
            parsedTaxRate > 100 ||
            !Number.isFinite(parsedPaidAmount) ||
            parsedPaidAmount < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid discount, tax rate or paid amount",
            });
        }

        const subtotal = validItems.reduce(
            (sum, item) => sum + item.quantity * item.rate,
            0
        );

        if (parsedDiscount > subtotal) {
            return res.status(400).json({
                success: false,
                message: "Discount cannot exceed subtotal",
            });
        }

        const taxableAmount = subtotal - parsedDiscount;
        const taxAmount = Number(
            ((taxableAmount * parsedTaxRate) / 100).toFixed(2)
        );
        const total = Number((taxableAmount + taxAmount).toFixed(2));

        if (parsedPaidAmount > total) {
            return res.status(400).json({
                success: false,
                message: "Paid amount cannot exceed invoice total",
            });
        }

        const status =
            parsedPaidAmount === total && total > 0
                ? "Paid"
                : parsedPaidAmount > 0
                    ? "Partially Paid"
                    : "Unpaid";

        const invoice = await Invoice.create({
            invoiceNumber: invoiceNumber.trim(),
            client,
            invoiceDate,
            dueDate: dueDate || null,
            items: validItems,
            subtotal: Number(subtotal.toFixed(2)),
            discount: parsedDiscount,
            taxRate: parsedTaxRate,
            taxAmount,
            total,
            paidAmount: parsedPaidAmount,
            status,
        });

        return res.status(201).json({
            success: true,
            message: "Invoice created successfully",
            data: invoice,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Invoice number already exists",
            });
        }

        if (error.message.startsWith("Each item")) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        console.error("Create invoice error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create invoice",
        });
    }
};

exports.getInvoices = async (req, res) => {
    try {
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const limit = Math.min(
            100,
            Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
        );

        const [invoices, totalRecords] = await Promise.all([
            Invoice.find()
                .populate("client", "clientName companyName email")
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Invoice.countDocuments(),
        ]);

        return res.status(200).json({
            success: true,
            data: invoices,
            pagination: {
                page,
                limit,
                totalRecords,
                totalPages: Math.ceil(totalRecords / limit),
            },
        });
    } catch (error) {
        console.error("Get invoices error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch invoices",
        });
    }
};