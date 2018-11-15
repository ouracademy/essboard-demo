import groupBy from "lodash/fp/groupBy";

export const containsSameItems = (array, anotherArray) =>
  array.every(item => anotherArray.includes(item));

export const arrayGroupBy = (key, array) => (valueName = "data") => {
  const objectGrouped = groupBy(key)(array);

  return Object.keys(objectGrouped).reduce((ac, prev) => {
    ac.push({ [key]: prev, [valueName]: objectGrouped[prev] });
    return ac;
  }, []);
};
