export const containsSameItems = (array, anotherArray) =>
  array.every(item => anotherArray.includes(item));

export const toArray = (key, objectGrouped) => (valueName = "data") => {
  return Object.keys(objectGrouped).reduce((ac, prev) => {
    ac.push({ [key]: prev, [valueName]: objectGrouped[prev] });
    return ac;
  }, []);
};
