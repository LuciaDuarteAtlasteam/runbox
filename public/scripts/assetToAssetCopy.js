/// TODO:
/// create status and reference
/// when creating object attributes, name attribute already exist, and we dont update the description (needs PUT)

///////////////////////////
// CONFIG
///////////////////////////

let sourceWorkSpaceId;
let targetWorkSpaceId;

let authName;
// Generate an API token for Jira using your Atlassian Account: https://id.atlassian.com/manage/api-tokens.
let authPass; // Jens K.

let objectSchemaIdSource; // from pick ?  // TODO
let objectSchemaIdCopy; // For Dev (always starts at 2, bc of internal Schema)

///////////////////////////
// General Globals
///////////////////////////
const jsmApiUrl = "https://api.atlassian.com/jsm/assets/workspace/";
const timeOutForCalls = 50;
var createdObjectTypeId = [];

///////////////////////////
// Chain of Events
///////////////////////////

//starting the procedure
const assetToAssetCopy = {
  run: async (params, updateOutput) => {
    updateOutput(
      `Running script with params: ${JSON.stringify(params, null, 2)}`
    );
    sourceWorkSpaceId = params.sourceWorkSpaceId;
    targetWorkSpaceId = params.targetWorkSpaceId;
    authName = params.authName;
    authPass = params.authPass;
    objectSchemaIdSource = params.objectSchemaIdSource;
    // TODO: make the schemas to copy pickable
    //const schemasInTarget = await schemaList();
    //console.log(schemasInTarget);

    // PART 1: create the copy of schema
    var newSchemaData = {
      name: params.newSchemaDataName,
      objectSchemaKey: params.newSchemaDataObjectSchemaKey,
      description: params.newSchemaDataDescription,
    };

    objectSchemaIdCopy = await createSchemaCopy(newSchemaData);
    updateOutput(`New schema created with ID: ${objectSchemaIdCopy}`);

    await sleep(500);

    const objectTypesInSource = await getObjectTypesForSchema(
      objectSchemaIdSource
    );
    const objectTypeIdMap = await createObjectTypesProcedure(
      objectTypesInSource
    );

    await sleep(500);

    const statusListSource = await getStatusList(
      sourceWorkSpaceId,
      objectSchemaIdSource
    );
    const statusListSourceGlobal = await getStatusList(sourceWorkSpaceId);
    const statusListTargetGlobal = await getStatusList(targetWorkSpaceId);
    const statusIdMap = await createStatusProcedure(
      statusListSource.concat(statusListSourceGlobal),
      statusListTargetGlobal
    );

    await sleep(500);

    createAttributesInAllObjects(objectTypeIdMap, statusIdMap);
  },
};

///////////////////////////
// Workhorses
///////////////////////////

// TODO get workspace ID

// return List of Schema
async function schemaList() {
  // Get Object Schema List
  const path = `${jsmApiUrl}${sourceWorkSpaceId}/v1/objectschema/list`;
  const schemaList = await getAPI(path);

  return schemaList;
}

// Create new Schema
async function createSchemaCopy(schemaData) {
  const path = `${jsmApiUrl}${targetWorkSpaceId}/v1/objectschema/create`;
  const newObjectSchema = await postAPI(path, schemaData);

  return newObjectSchema.id;
}

// Get Status list
async function getStatusList(workspaceId, schemaId) {
  const queryParam = schemaId ? `?objectSchemaId=${schemaId}` : "";

  const path = `${jsmApiUrl}${workspaceId}/v1/config/statustype${queryParam}`;
  const statusList = await getAPI(path);

  return statusList;
}

// Get All Object Types
async function getObjectTypesForSchema(objectSchemaId) {
  let path = `${jsmApiUrl}${sourceWorkSpaceId}/v1/objectschema/${objectSchemaId}/objecttypes/flat`;
  const objectTypes = await getAPI(path);

  //console.log(objectTypes);

  return objectTypes;
}

// A function that will go over an objectlist and creates the elements in the same structure
async function createObjectTypesProcedureSelfWrite(objectList) {
  //console.log(objectList);

  // find the ones that dont have parentObjectTypeId
  const rootElements = objectList.filter(
    (o) => o.parentObjectTypeId === undefined
  );

  const idMapping = await rootElements.map(async (element) => {
    let purgedObjectAttribute = { ...element };

    // delete unescessary references or rewrite
    delete purgedObjectType["id"];
    delete purgedObjectType["globalId"];
    delete purgedObjectType["workspaceId"];
    delete purgedObjectType["created"];
    delete purgedObjectType["updated"];
    delete purgedObjectType["icon"];

    purgedObjectType.iconId = element.icon.id;
    purgedObjectType.objectSchemaId = objectSchemaIdCopy;

    const createdObjectType = await createNewObjectType(purgedObjectType);

    return { oldId: element.id, newId: createdObjectType.id };
  });

  const idMap = await Promise.all(idMapping);

  idMap.map((ids) => {
    objectList
      .filter((o) => o.parentObjectTypeId === ids.oldId)
      .map(async (element) => {
        let purgedObjectType = { ...element };

        // delete unescessary references or rewrite
        delete purgedObjectType["id"];
        delete purgedObjectType["globalId"];
        delete purgedObjectType["workspaceId"];
        delete purgedObjectType["created"];
        delete purgedObjectType["updated"];
        delete purgedObjectType["icon"];

        purgedObjectType.iconId = element.icon.id;
        purgedObjectType.objectSchemaId = objectSchemaIdCopy;
        purgedObjectType.parentObjectTypeId = ids.newId;

        const createdObjectType = await createNewObjectType(purgedObjectType);

        return { oldId: element.id, newId: createdObjectType.id };
      });
  });
}

// A function that will go over an objectlist and creates the elements in the same structure
async function createObjectTypesProcedure(objectList) {
  const idMap = new Map();

  // Helper function to create and purge object types
  const createAndPurgeObjectType = async (element, parentObjectTypeId) => {
    const {
      id,
      globalId,
      workspaceId,
      created,
      updated,
      icon,
      ...purgedObjectType
    } = element;
    purgedObjectType.iconId = element.icon.id;
    purgedObjectType.objectSchemaId = objectSchemaIdCopy;
    purgedObjectType.parentObjectTypeId = parentObjectTypeId;

    const createdObjectType = await createNewObjectType(purgedObjectType);

    return { oldId: element.id, newId: createdObjectType.id };
  };

  // Recursive function to process and create child elements
  const processChildren = async (elements, parentId) => {
    for (const element of elements) {
      const createdObjectType = await createAndPurgeObjectType(
        element,
        parentId
      );
      idMap.set(createdObjectType.oldId, createdObjectType.newId);

      const children = objectList.filter(
        (o) => o.parentObjectTypeId === element.id
      );
      if (children.length > 0) {
        await processChildren(children, createdObjectType.newId);
      }
    }
  };

  // Process root elements
  const rootElements = objectList.filter(
    (o) => o.parentObjectTypeId === undefined
  );
  const rootIdMapping = await Promise.all(
    rootElements.map(async (element) => {
      const createdObjectType = await createAndPurgeObjectType(element, null);
      idMap.set(createdObjectType.oldId, createdObjectType.newId);

      const children = objectList.filter(
        (o) => o.parentObjectTypeId === element.id
      );
      if (children.length > 0) {
        await processChildren(children, createdObjectType.newId);
      }

      return createdObjectType;
    })
  );

  return idMap;
}

// Create New Object Types
async function createNewObjectType(objectType) {
  const path = `${jsmApiUrl}${targetWorkSpaceId}/v1/objecttype/create`;
  const createdObjectType = await postAPI(path, objectType);
  return createdObjectType;
}

// create status (if not existing) and return a map to match old and new ids
async function createStatusProcedure(statusList, existingStatusList) {
  const idMap = new Map();

  // Helper function to create and purge object types
  const createAndPurgeStatusObject = async (element) => {
    const { id, ...purgedStatusObject } = element;

    // decide to create status global or per schema
    purgedStatusObject.objectSchemaId = element.objectSchemaId
      ? objectSchemaIdCopy
      : "";

    const createdStatus = await createNewStatusObject(purgedStatusObject);

    return { oldId: element.id, newId: createdStatus.id };
  };

  await Promise.all(
    statusList.map(async (statusItem) => {
      const existingStatusFromList = existingStatusList.find(
        (item) => item.name === statusItem.name
      );

      if (existingStatusFromList) {
        idMap.set(statusItem.id, existingStatusFromList.id);
        return;
      }

      const createdStatusObject = await createAndPurgeStatusObject(statusItem);
      idMap.set(createdStatusObject.oldId, createdStatusObject.newId);
      return createAndPurgeStatusObject; // todo removable?
    })
  );

  return idMap;
}

// Create new status objects
async function createNewStatusObject(statusObject) {
  const path = `${jsmApiUrl}${targetWorkSpaceId}/v1/config/statustype`;
  const createdStatusObject = await postAPI(path, statusObject);
  return createdStatusObject;
}

// a function that takes a map as parameter with Ids from Source and their corresponding id on the target
async function createAttributesInAllObjects(objectTypeIdMapping, statusIdMap) {
  // Helper function to create and purge the attributes
  const createAndPurgeAttributes = async (element) => {
    const {
      id,
      globalId,
      workspaceId,
      created,
      updated,
      objectType,
      system,
      referenceObjectType,
      ...purgedObjectTypeAttribute
    } = element;

    // typeValue is mandatory for Type = Object reference and should point to the referenced object type id
    purgedObjectTypeAttribute.typeValue = objectTypeIdMapping.get(
      String(element.referenceObjectTypeId)
    );

    if (element.type === 0) {
      purgedObjectTypeAttribute.defaultTypeId = element.defaultType.id;

      // set additional value for: Url
      if (element.defaultType.id == 7) {
        // TODO
      }
    } else if (element.type === 1) {
      // set additional value for: Object reference
      purgedObjectTypeAttribute.additionalValue = element.referenceType.id;
    } else if (element.type === 2) {
      // set additional value for: User
      // TODO
    } else if (element.type === 7) {
      // status
      purgedObjectTypeAttribute.typeValueMulti = [];

      console.log(element.typeValueMulti);

      element.typeValueMulti.map((item) => {
        purgedObjectTypeAttribute.typeValueMulti.push(
          statusIdMap.get(String(item))
        );
      });
    }

    return purgedObjectTypeAttribute;
  };

  objectTypeIdMapping.forEach(async function (newObjectId, oldObjectId) {
    const objectTypeAttributes = await getObjectTypeAttributes(oldObjectId);

    objectTypeAttributes.map(async (attribute) => {
      if (attribute.name === "Name") {
        return;
      }

      const createdObjectTypeAttribute = await createAndPurgeAttributes(
        attribute
      );
      await createAttributeInObjectType(
        newObjectId,
        createdObjectTypeAttribute
      );
    });
  });
}

// Get the attributes for an objectType (inherited excluded)
async function getObjectTypeAttributes(objectTypeId) {
  const path = `${jsmApiUrl}${sourceWorkSpaceId}/v1/objecttype/${objectTypeId}/attributes?excludeParentAttributes=true&onlyValueEditable=true`;
  const objectTypeAttributes = await getAPI(path);
  return objectTypeAttributes;
}

// create attribute in object
async function createAttributeInObjectType(objectTypeId, objectTypeAttribute) {
  const path = `${jsmApiUrl}${targetWorkSpaceId}/v1/objecttypeattribute/${objectTypeId}`;
  const createdObjectTypeAttribute = await postAPI(path, objectTypeAttribute);
  return createdObjectTypeAttribute;
}

///////////////////////////
// REST-Functions
///////////////////////////

// Functions
async function getAPI(path) {
  var myHeaders = new Headers();
  myHeaders.append(
    "Authorization",
    `Basic ${Buffer.from(authName + ":" + authPass).toString("base64")}`
  );

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  const response = await fetch(path, requestOptions);
  const data = await response;

  if (!response.ok)
    return console.error(
      `Unexpected Response in GET: ${response.status} - ${response.statusText} for ${path} : \n ${response.text}`
    );

  return data.json();
}

async function postAPI(path, json) {
  var raw = JSON.stringify(json);

  var myHeaders = new Headers();
  myHeaders.append(
    "Authorization",
    `Basic ${Buffer.from(authName + ":" + authPass).toString("base64")}`
  );
  myHeaders.append("Content-Type", "application/json");

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    redirect: "follow",
    body: raw,
  };

  return await postputAPI(path, requestOptions);
}

async function putAPI(path, json) {
  var raw = JSON.stringify(json);

  var myHeaders = new Headers();
  myHeaders.append(
    "Authorization",
    `Basic ${Buffer.from(authName + ":" + authPass).toString("base64")}`
  );
  myHeaders.append("Content-Type", "application/json");

  var requestOptions = {
    method: "PUT",
    headers: myHeaders,
    redirect: "follow",
    body: raw,
  };

  return await postputAPI(path, requestOptions);
}

async function postputAPI(path, requestOptions) {
  const response = await fetch(path, requestOptions);

  if (!response.ok) {
    let errorMsg = `Unexpected Response:
        ${response.status} - ${
      response.statusText
    } for ${path} : \n ${await response.text().then((text) => {
      return text;
    })}`;

    console.log(errorMsg);

    return console.error(errorMsg);
  }

  return response.json();
}

///////////////////////////
// Helper Functions
///////////////////////////

// only prints depth of one
function simplePrint(json) {
  console.log(
    JSON.stringify(json, function (k, v) {
      return k && v && typeof v !== "number"
        ? Array.isArray(v)
          ? "[object Array]"
          : "" + v
        : v;
    })
  );
}

const sleep = (time) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

export default assetToAssetCopy;
