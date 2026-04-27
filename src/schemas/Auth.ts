import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character")
  .regex(/^\S*$/, "Password must not contain spaces");

// Signup Schema - matches POST /auth/signup { email, method, password }
export const signupSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: passwordSchema,
});

// Login Schema - matches POST /auth/signin { email, method, password }
export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: passwordSchema, // Login only requires the password to be present, strict rules are for creation
});

// Forgot Password Schema - matches POST /auth/forgot { email }
export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

// OTP Verification Schema - matches POST /auth/verify-otp and /auth/verify-email { email, otp }
export const otpSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z
    .string()
    .length(5, "OTP must be exactly 5 digits")
    .regex(/^\d+$/, "OTP must contain only digits"),
});


// Create Password Schema - matches POST /auth/update-password { resetToken, password }
export const createPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Profile Schema (Step 1)
export const profileSchema = z.object({
  fullName: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters")
    .regex(/^[a-zA-Z\s]*$/, "Name can only contain letters and spaces")
    .regex(/^[^\s].*$/, "Name cannot start with a whitespace")
    .transform((val) => val.trim()),
  bio: z.string().max(250, "Bio must be at most 250 characters").optional(),
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(100, "Company name must be at most 100 characters")
    .regex(/^[^\s].*$/, "Company name cannot start with a whitespace")
    .transform((val) => val.trim()),
  address: z
    .object({
      street: z.string().max(150).optional(),
      city: z.string().max(50).optional(),
      state: z.string().max(50).optional(),
      country: z.string().min(1, "Location is required").max(100),
      postalCode: z.string().max(20).optional(),
    }),
  fullAddress: z.string().optional(),
  avatarFile: z
    .any()
    .refine((file) => file instanceof File, "Profile picture is required")
    .refine((file) => file?.size <= 50 * 1024 * 1024, "Max file size is 50MB")
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(
          file?.type,
        ),
      "Only .jpg, .jpeg, .png and .webp formats are supported",
    ),
});



// Verify Credentials Schema - matches POST /users/verify-identity { iata }
export const verifyCredentialsSchema = z.object({
  iata: z.string().max(8, "IATA number must be at most 8 digits").regex(/^\d*$/, "IATA number must contain only digits").optional(),
  clia: z.string().max(8, "CLIA number must be at most 8 digits").regex(/^\d*$/, "CLIA number must contain only digits").optional(),
}).refine((data) => data.iata || data.clia, {
  message: "Please enter either an IATA or CLIA number",
  path: ["iata"],
});

// Account Information Schema - for editing account details
export const accountInformationSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters")
    .regex(/^[a-zA-Z\s]*$/, "Name can only contain letters and spaces")
    .regex(/^[^\s].*$/, "Name cannot start with a whitespace")
    .transform((val) => val.trim()),
  bio: z.string().max(250, "Bio must be at most 250 characters").optional().or(z.literal("")),
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(100, "Company name must be at most 100 characters")
    .regex(/^[^\s].*$/, "Company name cannot start with a whitespace")
    .transform((val) => val.trim()),
  street: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  country: z.string().min(1, "Location is required"),
  iataNumber: z.string().max(8, "IATA number must be at most 8 digits").regex(/^\d*$/, "IATA number must contain only digits").optional().or(z.literal("")),
  cliaNumber: z.string().max(8, "CLIA number must be at most 8 digits").regex(/^\d*$/, "CLIA number must contain only digits").optional().or(z.literal("")),
});

// Types inferred from schemas
export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type OtpFormData = z.infer<typeof otpSchema>;
export type CreatePasswordFormData = z.infer<typeof createPasswordSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type VerifyCredentialsFormData = z.infer<typeof verifyCredentialsSchema>;
export type AccountInformationFormData = z.infer<typeof accountInformationSchema>;