
const { z } = require("zod");

const envSchema = z.object({
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),

  JWT_EXPIRES_IN: z
    .string()
    .regex(
      /^[1-9]\d*[smhd]$/,
      "JWT_EXPIRES_IN must use a duration such as 15m, 1h, or 7d"
    )
    .default("15m"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid environment configuration:");

  for (const issue of result.error.issues) {
    console.error(`- ${issue.path.join(".")}: ${issue.message}`);
  }

  throw new Error("Application startup aborted due to invalid configuration");
}

module.exports = result.data;
