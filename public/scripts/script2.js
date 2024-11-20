const script2 = {
  run: (params, updateOutput) => {
    // Script logic using the provided parameters
    updateOutput(
      `Running script with params: ${JSON.stringify(params, null, 2)}`
    );
    return "Script2";
  },
};

export default script2;
