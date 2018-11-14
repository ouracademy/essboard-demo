export const kernel = {
  alphas: [
    {
      name: "Interesado",
      id: 1,
      states: [
        {
          name: "Reconocido",
          id: 11,
          checkpoints: [{ id: "111" }, { id: "112" }]
        },
        {
          name: "Representado",
          id: 12,
          checkpoints: [{ id: "121" }, { id: "122" }]
        },
        {
          name: "Colaborando",
          id: 13,
          checkpoints: [{ id: "131" }, { id: "132" }]
        }
      ]
    }
  ]
};

export const stakeholderStates = kernel.alphas[0].states;
