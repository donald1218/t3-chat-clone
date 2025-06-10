import { atomWithStorage } from "jotai/utils";
import { defaultModel } from "../models";

export const modelSelectionAtom = atomWithStorage<string>(
  "model-selection",
  defaultModel.id
);
