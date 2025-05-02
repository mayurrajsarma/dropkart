import { z } from "zod";

export const signupSchema = z.object({
    email: z
        .string()
        .min(1,{message: "Email is required"})
        .email({message: "Please enter a valid email"}),
    password: z
        .string()
        .min(1,{message: "Password is required"})
        .min(8,{message: "Password should be minimum of 8 characters"}),
    passwordConfirmation: z
        .string()
        .min(1,{message: "Please confirm your password"}),
})
//1:21:04