import type { IsLiteral, Merge } from "type-fest";
import type { Call, FunctionType, IsObject } from "./types";
import * as z from "zod/v4";
import * as core from "zod/v4/core";

// ===== NAKED TYPES =====

type StringTypes =
  | z.ZodString
  | z.ZodStringFormat
  | z.ZodGUID
  | z.ZodUUID
  | z.ZodEmail
  | z.ZodURL
  | z.ZodEmoji
  | z.ZodNanoID
  | z.ZodCUID
  | z.ZodCUID2
  | z.ZodULID
  | z.ZodXID
  | z.ZodKSUID
  | z.ZodISODateTime
  | z.ZodISODate
  | z.ZodISOTime
  | z.ZodISODuration
  | z.ZodIPv4
  | z.ZodIPv6
  | z.ZodCIDRv4
  | z.ZodCIDRv6
  | z.ZodBase64
  | z.ZodBase64URL
  | z.ZodE164
  | z.ZodJWT;

type NumberTypes =
  | z.ZodNumber
  | z.ZodNumberFormat
  | z.ZodBigInt
  | z.ZodBigIntFormat;

type UndefinedTypes = z.ZodUndefined;

type NullTypes = z.ZodUndefined;

type SymbolTypes = z.ZodSymbol;

type DateTypes = z.ZodDate;

type BooleanTypes = z.ZodBoolean;

type ConfigNakedTypes =
  | StringTypes
  | NumberTypes
  | UndefinedTypes
  | NullTypes
  | SymbolTypes
  | DateTypes
  | BooleanTypes
  | z.ZodLiteral;

type ConfigNakedTypesMap =
  | [string, StringTypes]
  | [number, NumberTypes]
  | [undefined, UndefinedTypes]
  | [null, NullTypes]
  | [symbol, SymbolTypes]
  | [Date, DateTypes]
  | [boolean, BooleanTypes];

type OriginalNakedTypes = ConfigNakedTypesMap[0];

type GetConfigNakedType<O> = Extract<ConfigNakedTypesMap, [O, unknown]>[1];

// ===== PRODUCT TYPES =====
declare const TYPE: unique symbol;

interface ObjectConfig {
  [TYPE]: string;
  shape: RawObjectTypeConfigShape;
}

type RawObjectTypeConfigShape = { [k: string]: RawConfigNode };
type RawArrayTypeConfigShape = RawConfigNode[];

type ObjectTypeConfigShape = { [k: string]: ConfigNode };

// strict object
type RawStrictObject<
  Shape extends RawObjectTypeConfigShape = RawObjectTypeConfigShape
> = {
  [TYPE]: "strict";
  shape: Shape;
};

type StrictObject<Shape extends ObjectTypeConfigShape = ObjectTypeConfigShape> =
  {
    [TYPE]: "strict";
    shape: Shape;
  };

// loose object
type RawLooseObject<
  Shape extends RawObjectTypeConfigShape = RawObjectTypeConfigShape
> = {
  [TYPE]: "loose";
  shape: Shape;
};

type LooseObject<Shape extends ObjectTypeConfigShape = ObjectTypeConfigShape> =
  {
    [TYPE]: "loose";
    shape: Shape;
  };

// ===== BUILDERS =====
type ObjectTypeConfigBuilder<
  O extends OriginalObjectType = OriginalObjectType
> = (
  compiler: ConfigCompiler
) =>
  | RawStrictObject<{ [K in keyof O]: CreateConfig<O[K]> }>
  | RawLooseObject<Partial<{ [K in keyof O]: CreateConfig<O[K]> }>>;

// ===== ALL TYPES =====

// permitted types that can be mapped to Zod types and builders

export type OriginalTypes =
  | OriginalNakedTypes
  | OriginalObjectType
  | OriginalArrayType;
type OriginalObjectType = { [k: string]: OriginalTypes };
type OriginalArrayType = OriginalTypes[];

export type RawConfigNode =
  | ConfigNakedTypes
  | ObjectTypeConfigBuilder
  | undefined;

export type ConfigNode =
  | ConfigNakedTypes
  | RawStrictObject
  | RawLooseObject
  | undefined;

// Nodes after all builders have been called and resolved
export type Node = ConfigNakedTypes;

// ===== CONFIG CREATOR GENERIC =====

export type CreateConfig<O extends OriginalTypes> = IsLiteral<O> extends true
  ? CreateConfig_Literal<O>
  : IsObject<O> extends true
  ? O extends OriginalObjectType
    ? CreateConfig_Object<O>
    : never
  : GetConfigNakedType<O>;

type CreateConfig_Literal<O> = z.ZodLiteral<Extract<O, z.util.Literal>>;

type CreateConfig_Object<O extends OriginalObjectType> =
  ObjectTypeConfigBuilder<O>;

export function createConfig<O extends OriginalTypes>() {
  return function configCreator<Config extends CreateConfig<O>>(
    config: Config
  ) {
    return config;
  };
}

// ===== CONFIG COMPILER =====
export type CompileConfig<Config extends ConfigNode> = Extract<
  Config extends ObjectConfig ? CompileConfig_Object<Config> : Config,
  z.ZodType
>;

type CompileConfig_Object<Config extends ObjectConfig> =
  Config extends StrictObject<infer S>
    ? z.ZodObject<{ [K in keyof S]: CompileConfig<S[K]> }>
    : Config extends LooseObject<infer S>
    ? z.ZodObject<{ [K in keyof S]: CompileConfig<S[K]> }>
    : never;

type ConfigCompiler = <Config extends ConfigNode>(
  config: Config
) => CompileConfig<Config>;

type Example = {
  a: {
    b: string;
    c: number;
    nested: {
      deep: boolean;
    };
  };
  d: string;
};

const config = createConfig<Example>()((compiler) =>
  compiler({
    [TYPE]: "loose",
    shape: {
      a: (compiler) =>
        compiler({
          [TYPE]: "strict",
          shape: {
            b: z.string(),
            c: z.number(),
            nested: (compiler) => compiler({ [TYPE]: "loose", shape: {} }),
          },
        }),
    },
  })
);
