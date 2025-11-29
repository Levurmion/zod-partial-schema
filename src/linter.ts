export type LinterOptions = {
  /**
   * Defaults to `false`. When set to `true`, asserts that the `Actual` shape
   * of `object` types do not declare extra properties not part of the `Original`
   * type.
   */
  noExtraProperties?: boolean;
  /**
   * Defaults to `false`. When set to `true`, asserts that `union` types declare
   * no extra members not part of the `Original` type.
   */
  noExtraUnionMembers?: boolean;
  /**
   * Defaults to `true`. Asserts that the declared inputs of the `Actual` shape
   * matches the expected `Original` type. When set to `false`, `Actual` can
   * alternatively be of any `ZodType`.
   */
  assertSchemaInput?: boolean;
  /**
   * Defaults to `false`. When set to `true`, the schema's output will be enforced
   * to extend the `Original` type.
   */
  assertSchemaOutput?: boolean;
};

export type DefaultLinterOptions = {
  noExtraProperties: false;
  noExtraUnionMembers: false;
  assertSchemaInput: true;
  assertSchemaOutput: false;
};
