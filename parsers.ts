import { PublishData } from "./types.js";

export function parsePublishData(
  input: unknown
): [Error, null] | [null, PublishData] {
  if (typeof input !== "object" || input === null) {
    return [Error("input should be and object"), null];
  }

  if (!("id" in input) || typeof input.id !== "string") {
    return [Error("input should have an 'id' property of type string"), null];
  }

  if (!("payload" in input) || typeof input.payload !== "string") {
    return [
      Error("input should have a 'payload' property of type string"),
      null,
    ];
  }

  const { payload, id } = input;
  return [null, { id, payload }];
}
