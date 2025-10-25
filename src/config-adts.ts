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

type ObjectTypeConfigShape = { [k: string]: ConfigNode };
type ArrayTypeConfigShape = ConfigNode[];

// strict object
type StrictObject<Shape extends ObjectTypeConfigShape> = {
  [TYPE]: "strict";
} & Shape;

// loose object
type LooseObject<Shape extends ObjectTypeConfigShape> = {
  [TYPE]: "loose";
} & Shape;

// ===== BUILDERS =====
type ObjectTypeConfigBuilder<
  O extends OriginalObjectType = OriginalObjectType
> = () =>
  | StrictObject<{ [K in keyof O]: CreateConfig<O[K]> }>
  | LooseObject<Partial<{ [K in keyof O]: CreateConfig<O[K]> }>>;

// ===== ALL TYPES =====

// permitted types that can be mapped to Zod types and builders

export type OriginalTypes =
  | OriginalNakedTypes
  | OriginalObjectType
  | OriginalArrayType;
type OriginalObjectType = { [k: string]: OriginalTypes };
type OriginalArrayType = OriginalTypes[];

// emitted configuration nodes with respect to the passed OriginalTypes
export type ConfigNode = ConfigNakedTypes | ObjectTypeConfigBuilder | undefined;

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

const config = createConfig<Example>()(() => ({
  [TYPE]: "loose",
  a: () => ({
    [TYPE]: "strict",
    b: z.string(),
    c: z.number(),
    nested: () => ({ [TYPE]: "loose" }),
  }),
}));
