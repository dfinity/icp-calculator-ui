import { FEATURES, type Feature } from "./feature";

// Bump this number of there are breaking changes
// in serialization / deserialization that make
// loading of old files impossible.
const VERSION = 1;

interface Configuration {
  features: Feature[];
  days: number;
  subnetIndex: number;
  subnetValues: number[];
}

export function toJSON(config: Configuration): string {
  const json = {
    version: VERSION,
    days: config.days,
    subnetIndex: config.subnetIndex,
    subnetValues: config.subnetValues,
    features: config.features.map(serialize),
  };
  return JSON.stringify(json);
}

export function fromJSON(json: string): Configuration {
  const { version, days, subnetIndex, subnetValues, features } =
    JSON.parse(json);
  if (version != VERSION) {
    throw "the file is not compatible with the current version";
  }
  const fs = [];
  for (const x of features) {
    fs.push(deserialize(x));
  }
  const config = {
    days,
    subnetIndex,
    subnetValues,
    features: fs,
  };
  return config;
}

function serialize(feature: Feature): object {
  return {
    label: feature.label(),
    fields: { ...feature },
  };
}

function deserialize(object: { label: string; fields: object }): Feature {
  interface Keyed {
    [key: string]: object;
  }
  const { label, fields } = object;
  const meta = FEATURES.find((x) => x.label == label);
  const feature = meta?.build();
  if (feature == undefined) {
    throw `failed to load ${label}`;
  }
  for (const f in fields) {
    if (Object.hasOwn(fields, f)) {
      (feature as unknown as Keyed)[f] = (fields as Keyed)[f];
    }
  }
  return feature;
}
