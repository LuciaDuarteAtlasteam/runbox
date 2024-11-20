const script1 = {
  run: (params, updateOutput) => {
    updateOutput(
      `Running script with params: ${JSON.stringify(params, null, 2)}`
    );

    return "OMFG";
  },
};

export default script1;
