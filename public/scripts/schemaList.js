const schemaList = {
  run: async (params, updateOutput) => {
    updateOutput(
      `Running script with SourceWorkSapceId : ${JSON.stringify(
        params.sourceWorkSpaceId,
        null,
        2
      )}`
    );

    const schemasInTarget = await getSchemaList(params);
    const schemaNames = schemasInTarget.values.map(
      (schema) => schema.objectSchemaKey + "  " + schema.name
    );
    updateOutput(`List: ${JSON.stringify(schemaNames, null, 2)}`);
  },
};
async function getSchemaList(params) {
  const jsmApiUrl = "https://api.atlassian.com/jsm/assets/workspace/";

  const path = `${jsmApiUrl}${params.sourceWorkSpaceId}/v1/objectschema/list`;
  const schemaList = await getAPI(path, params);

  return schemaList;
}
async function getAPI(path, params) {
  var myHeaders = new Headers();
  myHeaders.append(
    "Authorization",
    `Basic ${Buffer.from(params.authName + ":" + params.authPass).toString(
      "base64"
    )}`
  );

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  const response = await fetch(path, requestOptions);
  const data = response;

  if (!response.ok)
    return console.error(
      `Unexpected Response in GET: ${response.status} - ${response.statusText} for ${path} : \n ${response.text}`
    );

  return data.json();
}

export default schemaList;
