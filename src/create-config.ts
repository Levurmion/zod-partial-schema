import type { IsLiteral, IsTuple, ValueOf } from "type-fest";
import type { NakedTypeTuples } from "./naked-types";
import * as z from "zod/v4";
import * as core from "zod/v4/core";

// utilities
export declare const __type: unique symbol;
export declare const __original: unique symbol;

export const CONFIG_BRANDS = {
  [__type]: true,
  [__original]: true,
};

type ContainerConfigNodeLit = "strict" | "loose" | "array" | "tuple";

type ConfigBrands<T extends ContainerConfigNodeLit, O extends AssertedTypes> = {
  [__type]: T;
  [__original]: O;
};

export const notBrands = <K extends PropertyKey>(
  k: K
): k is Exclude<K, keyof typeof CONFIG_BRANDS> => {
  if (k in CONFIG_BRANDS) return false;
  return true;
};

export type ObjectShape = Record<string, AssertedTypes>;

// strict object
type StrictObjectShape<Original extends ObjectShape> = {
  [K in keyof Original]: CreateConfig<Original[K]>;
};

type CreateStrictObjectConstructor<Original extends ObjectShape = ObjectShape> =
  <Actual extends StrictObjectShape<Original>>(shape: Actual) => Actual;

// loose object
type LooseObjectShape<Original extends ObjectShape> = Partial<{
  [K in keyof Original]: CreateConfig<Original[K]>;
}>;

type CreateLooseObjectConstructor<Original extends ObjectShape> = <
  Actual extends LooseObjectShape<Original>
>(
  shape: Actual
) => Actual;

type ObjectBuilder<Original extends ObjectShape> = (options: {
  strict: CreateStrictObjectConstructor<Original>;
  loose: CreateLooseObjectConstructor<Original>;
}) => ReturnType<
  | CreateStrictObjectConstructor<Original>
  | CreateLooseObjectConstructor<Original>
>;

// array
type CreateArrayConstructor<Original extends AssertedTypes[]> = <
  Actual extends [
    CreateConfig<Original[number]>,
    ...CreateConfig<Original[number]>[]
  ]
>(
  shape: Actual
) => Actual;

// tuple
type CreateTupleConstructor<Original extends AssertedTypes[]> = <
  Actual extends MapShapeToTupleShape<Original>
>(
  shape: Actual
) => Actual;

type ArrayBuilder<Original extends AssertedTypes[]> = (options: {
  array: CreateArrayConstructor<Original>;
}) => ReturnType<CreateArrayConstructor<Original>>;

type MapShapeToTupleShape<Shape extends readonly AssertedTypes[] = []> =
  Shape extends [
    infer First extends AssertedTypes,
    ...infer Rest extends AssertedTypes[]
  ]
    ? [CreateConfig<First>, ...MapShapeToTupleShape<Rest>]
    : [];

type TupleBuilder<Original extends AssertedTypes[]> = (options: {
  tuple: CreateTupleConstructor<Original>;
}) => ReturnType<CreateTupleConstructor<Original>>;

// config node types
type ContainerConfigOptions = {
  strict: CreateStrictObjectConstructor<ObjectShape>;
  loose: CreateLooseObjectConstructor<ObjectShape>;
  array: CreateArrayConstructor<AssertedTypes[]>;
  tuple: CreateTupleConstructor<AssertedTypes[]>;
};

export type ContainerConfigNode = (
  options: ContainerConfigOptions
) => ReturnType<ValueOf<ContainerConfigOptions>>;

export type AssertedTypes =
  | NakedTypeTuples[0]
  | Record<string, any>
  | unknown[];
export type ConfigNodes =
  | NakedTypeTuples[1]
  | z.ZodLiteral
  | ContainerConfigNode;

export type GetNodeTypeFromType<T extends AssertedTypes> = Extract<
  NakedTypeTuples,
  [T, unknown]
>[1];

// config creator
export type CreateConfig<T extends AssertedTypes> = IsLiteral<T> extends true
  ? z.ZodLiteral<Extract<T, z.util.Literal>>
  : T extends ObjectShape
  ? ObjectBuilder<T>
  : T extends unknown[]
  ? IsTuple<T> extends true
    ? TupleBuilder<Extract<T, AssertedTypes[]>>
    : ArrayBuilder<Extract<T, AssertedTypes[]>>
  : T extends boolean
  ? z.ZodBoolean
  : GetNodeTypeFromType<T>;

export const createConfig = <T extends AssertedTypes>() => {
  const configbuilder = <Config extends CreateConfig<T>>(config: Config) =>
    config;

  return configbuilder;
};

// config unpacker
export type UnpackContainerConfigNode<Node extends ContainerConfigNode> =
  ReturnType<Node>;
export type UnpackConfigNodes<Node extends ConfigNodes> =
  Node extends ContainerConfigNode ? UnpackContainerConfigNode<Node> : Node;

export type RecursivelyUnpackConfig<Config extends ConfigNodes> =
  Config extends ContainerConfigNode
    ? RecursivelyUnpackConfig_Container<Config>
    : Config;

export type RecursivelyUnpackConfig_Container<
  Config extends ContainerConfigNode
> = UnpackContainerConfigNode<Config> extends infer Shape
  ? Shape extends Record<string, ConfigNodes>
    ? RecursivelyUnpackConfig_Object<Shape>
    : Shape extends ConfigNodes[]
    ? IsTuple<Shape> extends true
      ? z.ZodTuple<
          Extract<RecursivelyUnpackConfig_Tuple<Shape>, z.util.TupleItems>
        >
      : RecursivelyUnpackConfig_Array<Shape>
    : never
  : never;

type RecursivelyUnpackConfig_Array<Config extends ConfigNodes[]> = z.ZodArray<
  RecursivelyUnpackConfig<Config[number]>
>;

type RecursivelyUnpackConfig_Tuple<Config extends ConfigNodes[]> =
  Config extends [
    infer First extends ConfigNodes,
    ...infer Rest extends ConfigNodes[]
  ]
    ? [RecursivelyUnpackConfig<First>, ...RecursivelyUnpackConfig_Tuple<Rest>]
    : [];

type RecursivelyUnpackConfig_Object<
  Config extends Record<string, ConfigNodes>
> = z.ZodObject<
  Extract<
    { [K in keyof Config]: RecursivelyUnpackConfig<Config[K]> },
    core.$ZodShape
  >
>;

// constructor implementations

export const createStrictObjectConstructor =
  <Original extends ObjectShape>() =>
  <Actual extends StrictObjectShape<Original>>(shape: Actual) =>
    ({
      ...shape,
      [__type]: "strict",
    } as Actual & ConfigBrands<"strict", Original>);

export const createLooseObjectConstructor =
  <Original extends ObjectShape>() =>
  <Actual extends LooseObjectShape<Original>>(shape: Actual) =>
    ({
      ...shape,
      [__type]: "loose",
    } as Actual & ConfigBrands<"loose", Original>);

export const createArrayConstructor =
  <Original extends AssertedTypes[] = []>() =>
  <
    // requires at least 1 config node to define the elements of the array
    Actual extends [
      CreateConfig<Original[number]>,
      ...CreateConfig<Original[number]>[]
    ]
  >(
    shape: Actual
  ) => {
    const augmentedShape = [...shape];
    Object.defineProperty(augmentedShape, __type, {
      value: "array",
    });
    return augmentedShape as Actual & ConfigBrands<"array", Original>;
  };

export const createTupleConstructor =
  <Original extends AssertedTypes[]>() =>
  <Actual extends AssertedTypes[]>(shape: Actual) => {
    const augmentedShape = [...shape];
    Object.defineProperty(augmentedShape, __type, {
      value: "tuple",
    });
    return augmentedShape as Actual & ConfigBrands<"tuple", Original>;
  };

export const createConstructors = () => ({
  strict: createStrictObjectConstructor<ObjectShape>(),
  loose: createLooseObjectConstructor<ObjectShape>(),
  array: createArrayConstructor<AssertedTypes[]>(),
  tuple: createTupleConstructor<AssertedTypes[]>(),
});
