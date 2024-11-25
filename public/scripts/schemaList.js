import { getAPI } from "../scripts/helperFunctions";
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
    return schemaNames;
  },
};
async function getSchemaList(params) {
  const jsmApiUrl = "https://api.atlassian.com/jsm/assets/workspace/";

  const path = `${jsmApiUrl}${params.sourceWorkSpaceId}/v1/objectschema/list`;
  const schemaList = await getAPI(path, params);

  return schemaList;
}

export default schemaList;
