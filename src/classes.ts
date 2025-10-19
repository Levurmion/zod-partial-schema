import type { CreateConfig, ObjectShape } from "./create-config";
import * as z from "zod/v4";
import * as core from "zod/v4/core";

export class PipeType<NewOut> {}

export class StrictObjectType<Shape extends z.ZodRawShape> {
  _zodObject: z.ZodObject<Shape>;

  constructor(shape: Shape) {
    this._zodObject = new z.ZodObject(shape);
    z.object();
  }

  transform<NewOut>(
    transformer: (
      output: core.output<this["_zodObject"]>,
      ctx: core.$RefinementCtx<core.output<this["_zodObject"]>>
    ) => NewOut | Promise<NewOut>
  ) {
    this._zodObject.transform(transformer);
  }
}
