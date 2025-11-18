import { z } from "zod";

const userValidationZodSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, { message: "Name is required" }) // Ensure the name is not empty
      .max(50, { message: "Name must be less than 50 characters" }) // Optional max length
      .regex(/^[a-zA-Z\s]+$/, {
        message: "Name must only contain letters and spaces",
      }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
  }),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string({ required_error: "Password is required" }),
  }),
});
const resendVerifyEmailCode = z.object({
  body: z.object({
    email: z.string().email({ message: "Invalid email address" }),
  }),
});

export const  AuthValidation = {
  userValidationZodSchema,
  loginValidationSchema,
  resendVerifyEmailCode,
};
