import z from "zod";
import { GenderEnum, ProviderEnum } from "../../common/";
import { isValidObjectId } from "mongoose";

export const SignUpValidator = {
  body: z
    .strictObject({
      firstName: z.string().min(3).max(20),
      lastName: z.string().min(3).max(20),
      email: z.string().email(),
      password: z.string().min(6).max(20),
      confirmPassword: z.string().min(6).max(20),
      gender: z.enum(GenderEnum),
      DOB: z.coerce.date(),
      phoneNumber: z.string().min(11).max(11),
      provider: z.enum(ProviderEnum).optional(),
    })
    .safeExtend({
      userId: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          message: "Passwords do not match",
          path: ["confirmPassword"],
        });
      }

      if (data.userId && !isValidObjectId(data.userId)) {
        ctx.addIssue({
          code: "custom",
          message: "Invalid User ID",
          path: ["userId"],
        });
      }

      if (data.DOB > new Date()) {
        ctx.addIssue({
          code: "custom",
          message: "Date of birth cannot be in the future",
          path: ["DOB"],
        });
      }
    }),
};
