
const { z } = require("zod");

const createInvoiceSchema = z
    .object({
        client: z.string().regex(/^[a-f\d]{24}$/i, "Invalid client ID"),
        invoiceDate: z.coerce.date(),
        dueDate: z.coerce.date(),

        items: z
            .array(
                z
                    .object({
                        description: z.string().trim().min(1).max(500),
                        quantity: z.number().positive(),
                        rate: z.number().min(0),
                    })
                    .strict()
            )
            .min(1, "At least one invoice item is required"),

        discount: z.number().min(0).default(0),
        taxRate: z.number().min(0).max(100).default(0),
        notes: z.string().trim().max(2000).optional(),
    })
    .strict()
    .refine(
        (data) => data.dueDate >= data.invoiceDate,
        {
            path: ["dueDate"],
            message: "Due date cannot be before invoice date",
        }
    );

const invoiceIdSchema = z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid invoice ID"),
});

const listInvoicesQuerySchema = z
    .object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(10),
    })
    .strict();

module.exports = {
    createInvoiceSchema,
    invoiceIdSchema,
    listInvoicesQuerySchema,
};
