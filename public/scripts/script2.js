const script2 = {
  run: (params, updateOutput) => {
    // Script logic using the provided parameters
    updateOutput("Running script 2 with parameters:", params);
    return "Script2";
  },
};

export default script2;
