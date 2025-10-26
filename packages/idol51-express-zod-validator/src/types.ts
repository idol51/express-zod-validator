import { Request } from "express";
import { z, ZodTypeAny } from "zod";

type ExtractZodType<T extends ZodTypeAny | undefined> = T extends ZodTypeAny
  ? z.infer<T>
  : unknown;

export type ZodSchemaShape = {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
};

export type ValidatedRequest<TSchema extends ZodSchemaShape> = Request & {
  validatedData: ExtractZodType<TSchema["body"]>;
  validatedQuery: ExtractZodType<TSchema["query"]>;
  validatedParams: ExtractZodType<TSchema["params"]>;
};
