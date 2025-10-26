import { ValidatedRequest, ZodSchemaShape } from "./types";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodError } from "zod";

/**
 * Middleware to validate request body, query, and params separately using Zod schemas,
 * attach parsed results to the request object, and then call the controller with full type-safety.
 *
 * @template S - The schemas object containing body, query, and params Zod schemas.
 * @param {Schemas} schemas - Object containing optional `body`, `query`, and `params` schemas.
 * @param {(req: ValidatedRequest<...>, res: Response) => Promise<void>} controller - The controller function to handle the request after validation.
 * @returns {RequestHandler} An Express middleware that validates the request and runs the controller.
 *
 * @example
 * // Validate only body
 * router.post("/register", validate({ body: registerSchema }, registerUser));
 *
 * @example
 * // Validate query parameters
 * router.get("/search", validate({ query: searchQuerySchema }, searchHandler));
 *
 * @example
 * // Validate params
 * router.get("/user/:id", validate({ params: userIdSchema }, userHandler));
 */
export const validate = <Schema extends ZodSchemaShape>(
  schemas: Schema,
  controller: (
    req: ValidatedRequest<Schema>,
    res: Response,
    next: NextFunction
  ) => Promise<unknown> | unknown
): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        const parsedBody = schemas.body.parse(req.body);
        (req as any).validatedData = parsedBody;
      }

      if (schemas.query) {
        const parsedQuery = schemas.query.parse(req.query);
        (req as any).validatedQuery = parsedQuery;
      }

      if (schemas.params) {
        const parsedParams = schemas.params.parse(req.params);
        (req as any).validatedParams = parsedParams;
      }

      await controller(req as any, res, next);
    } catch (error) {
      if (error instanceof ZodError) {
        const formatted = error.errors.map((e) => e.message).join(", ");
        res.status(400).json({
          status: "error",
          message: formatted,
        });
      } else {
        next(error);
      }
    }
  };
};
