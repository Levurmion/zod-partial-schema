import * as z from "zod/v4";
import * as core from "zod/v4/core";
import type { MapTypeToZodType } from "./zod-types";
import type { Merge } from "type-fest";

export const createTypedStrictObject =
  <T extends core.$ZodLooseShape>() =>
  <
    Shape extends {
      [K in keyof T]: MapTypeToZodType<T[K]>;
    }
  >(
    shape: Shape
  ) => {
    return z.strictObject(shape);
  };

export const createTypedLooseObject =
  <T extends core.$ZodLooseShape>() =>
  <
    Shape extends Partial<{
      [K in keyof T]: MapTypeToZodType<T[K]>;
    }>
  >(
    shape: Shape
  ) => {
    type ShapeType = z.ZodObject<Extract<Shape, core.$ZodShape>>;
    return z.looseObject(shape) as z.ZodObject<
      Extract<Shape, core.$ZodShape>,
      { in: T; out: Merge<T, z.output<ShapeType>> }
    >;
  };

type T = {
  a: string;
  b: string;
  c: boolean;
  x: [1, 2];
  obj: {
    d: string[];
  };
};

createTypedStrictObject<T>()({
  a: z.string(),
  b: z.string(),
  c: z.boolean(),
  x: z.tuple([z.literal(1), z.literal(2)]),
  obj: z.object({
    d: z.array(z.string()).transform((arr) => arr.map((i) => parseInt(i))),
  }),
}).transform(({ a, b, c, x, obj }) => ({ a, b, c, x }));

createTypedLooseObject<T>()({
  a: z.string().transform((v) => parseInt(v)),
  c: z.boolean(),
  obj: z
    .object({
      d: z.array(z.string()),
    })
    .transform(({ d }) => ({ d_trans: d.map((i) => parseInt(i)) })),
}).transform(({ a, b, c, obj, ...rest }) => {});
