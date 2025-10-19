import * as z from "zod/v4";

export type ZodStringTypes =
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

export type ZodNumberTypes =
  | z.ZodNumber
  | z.ZodNumberFormat
  | z.ZodBigInt
  | z.ZodBigIntFormat;

export type ZodUndefinedTypes = z.ZodUndefined;

export type NakedTypeTuples =
  | [string, ZodStringTypes]
  | [number, ZodNumberTypes]
  | [undefined, ZodUndefinedTypes]
  | [null, z.ZodNull]
  | [symbol, z.ZodSymbol]
  | [Date, z.ZodDate]
  | [boolean, z.ZodBoolean];
