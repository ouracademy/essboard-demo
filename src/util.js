const uuidv5 = require("uuid/v5");

export function generateKey(nameProject) {
  const MY_NAMESPACE = "1b671a64-40d5-491e-99b0-da01ff1f3341";
  return Date.now() + "--" + uuidv5(nameProject, MY_NAMESPACE);
}
