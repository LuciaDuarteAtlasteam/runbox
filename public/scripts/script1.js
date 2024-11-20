const script1 = {
  run: (params, updateOutput) => {
    updateOutput(`Runing script with params: ${params} `);

    return "OMFG";
  },
};

export default script1;
