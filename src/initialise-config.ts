import type { ValueOf } from "type-fest";
import {
  __original,
  __type,
  CONFIG_BRANDS,
  createConfig,
  createConstructors,
  notBrands,
  type ConfigNodes,
  type RecursivelyUnpackConfig,
  type UnpackConfigNodes,
} from "./create-config";

import * as z from "zod/v4";

type Example = {
  a: { b: boolean; c: number };
  d: undefined;
  tuple: boolean[];
};

const config = createConfig<Example>()(({ loose }) =>
  loose({
    a: ({ strict }) => strict({ b: z.boolean(), c: z.number() }),
    tuple: ({ array }) => array(z.boolean()),
  })
);

type UnpackedConfig = RecursivelyUnpackConfig<typeof config>;

const initialiseConfig = <Config extends ConfigNodes>(config: Config) => {
  if (typeof config === "function") {
    const containerShapeConstructors = createConstructors();
    const containerShape = config(containerShapeConstructors);

    const zodObject = (() => {
      switch (containerShape[__type]) {
        case "loose": {
          const looseShape = stripBrandsFromObject(containerShape);
          const shapeKeys = Object.keys(looseShape);
          return z.looseObject(looseShape);
        }
        case "strict": {
          const strictShape = stripBrandsFromObject(containerShape);
          return z.strictObject(strictShape);
        }
        case "array": {
          if (Array.isArray(containerShape)) {
            const arrayShape = containerShape.map((v) => v);
            return z.looseObject(strictShape);
          }
        }
        case "tuple":
          return {};
        default:
          return {} as undefined;
      }
    })();
  } else {
    return config;
  }
};

const initialiseConfigObject = <Config extends Record<string, ConfigNodes>>(
  config: Config
) => {
  const configEntries = Object.entries(config);
  const initialisedConfig: Record<
    string,
    UnpackConfigNodes<ValueOf<Config>>
  > = {};
  for (const [key, config] of configEntries) {
    initialisedConfig[key] = initialiseConfig(config);
  }
};

// utilities

const stripBrandsFromObject = <T extends Record<string, unknown>>(obj: T) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([k, _]) => notBrands(k))
  ) as Omit<T, keyof typeof CONFIG_BRANDS>;
};
