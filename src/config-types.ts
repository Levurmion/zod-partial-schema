import type { IsLiteral } from "type-fest";
import * as z from "zod/v4";
import type { FunctionType, IsObject } from "./types";

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

type BooleanTypes = z.ZodBoolean | z.ZodLiteral<true> | z.ZodLiteral<false>;

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

type GetConfigNakedType<Original> = Extract<
  ConfigNakedTypesMap,
  [Original, unknown]
>[1];

// ===== PRODUCT TYPES =====

// brand for nominal typing
declare const __config: unique symbol;
export type ConfigBrand = { [__config]: true };

export type ObjectOriginal = { [k: string]: OriginalTypes };

// strict objects
type StrictObjectShape<Original extends ObjectOriginal> = {
  [K in keyof Original]: CreateConfig<Original[K]>;
};

export function createStrictObjectConstructor<
  Original extends ObjectOriginal
>() {
  function strictObjectConstructor<Shape extends StrictObjectShape<Original>>(
    shape: Shape
  ) {
    class StrictObject {
      _zodParser = z.strictObject;
      _original = {} as Original;
      _type: "strict" = "strict";
      _shape: Shape;

      constructor(shape: Shape) {
        this._shape = shape;
      }
    }

    return new StrictObject(shape);
  }

  return strictObjectConstructor;
}

type StrictObjectConstructorCreator = typeof createStrictObjectConstructor;
type StrictObjectConstructor = ReturnType<StrictObjectConstructorCreator>;
type CreateStrictObjectConstructor<Original extends ObjectOriginal> =
  ReturnType<typeof createStrictObjectConstructor<Original>>;

// loose objects
type LooseObjectShape<Original extends ObjectOriginal> = Partial<{
  [K in keyof Original]: CreateConfig<Original[K]>;
}>;

export function createLooseObjectConstructor<
  Original extends ObjectOriginal
>() {
  function looseObjectConstructor<Shape extends LooseObjectShape<Original>>(
    shape: Shape
  ) {
    class LooseObject {
      _zodParser = z.looseObject;
      _original = {} as Original;
      _type: "loose" = "loose";
      _shape: Shape;

      constructor(shape: Shape) {
        this._shape = shape;
      }
    }

    return new LooseObject(shape);
  }

  return looseObjectConstructor;
}

type LooseObjectConstructorCreator = typeof createLooseObjectConstructor;
type LooseObjectConstructor = ReturnType<LooseObjectConstructorCreator>;
type CreateLooseObjectConstructor<Original extends ObjectOriginal> = ReturnType<
  typeof createLooseObjectConstructor<Original>
>;

export type ConfigProductTypeOptions = {
  strict: StrictObjectConstructor;
  loose: LooseObjectConstructor;
};

export type ConfigProductTypes = (
  options: ConfigProductTypeOptions
) => ReturnType<ConfigProductTypeOptions[keyof ConfigProductTypeOptions]>;

// ===== PRODUCT TYPE UTILITIES =====

export type InferProductTypeOriginal<ProductType> = Extract<
  ProductType,
  FunctionType
> extends infer T extends ConfigProductTypes
  ? ReturnType<T>["_original"]
  : never;

// ===== ALL TYPES =====

export type ConfigNode = ConfigNakedTypes | ConfigProductTypes;
export type OriginalTypes = OriginalNakedTypes | { [k: string]: OriginalTypes };
export type UnpackedConfigNode = ConfigNakedTypes | z.ZodObject;

// ===== CONFIG CREATOR GENERIC =====

export type CreateConfig<Original> = IsLiteral<Original> extends true
  ? CreateConfig_Literal<Original>
  : IsObject<Original> extends true
  ? Original extends ObjectOriginal
    ? CreateConfig_Object<Original>
    : never
  : GetConfigNakedType<Original>;

type CreateConfig_Literal<Original> = z.ZodLiteral<
  Extract<Original, z.util.Literal>
>;

type CreateConfig_Object<Original extends ObjectOriginal> = (options: {
  strict: CreateStrictObjectConstructor<Original>;
  loose: CreateLooseObjectConstructor<Original>;
}) => ReturnType<
  | CreateStrictObjectConstructor<Original>
  | CreateLooseObjectConstructor<Original>
>;

export function createConfig<Original extends OriginalTypes>() {
  return function configCreator<Config extends CreateConfig<Original>>(
    config: Config
  ) {
    return config;
  };
}

// ===== CONFIG UNPACKER GENERIC =====

export type UnpackConfig<Config> = Config extends FunctionType
  ? UnpackConfig_ProductType<Config>
  : Extract<Config, ConfigNakedTypes>;

type UnpackConfig_ProductType<Config extends ConfigProductTypes> = z.ZodObject<{
  [K in keyof ReturnType<Config>["_shape"]]: UnpackConfig<
    Exclude<ReturnType<Config>["_shape"][K], undefined>
  >;
}>;
