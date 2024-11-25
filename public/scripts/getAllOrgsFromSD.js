const orgaList = {
  run: async (params, updateOutput) => {
    updateOutput(
      `Running script to get all organisations from Service Desk`
    );

    const orgasInSD = await getAllOrganizations(params);

    updateOutput(`List: ${JSON.stringify(orgasInSD, null, 2)}`);

    return orgasInSD;
  },
};


// return all orgas
async function getAllOrganizations() {

  let startAt = 0;
  const maxResults = 50;
  
  // collect the results
  let completeList = [];
  let last = false;


  while(last == false) {
    const path = `https://${params.jiraSubDomain}.atlassian.com/rest/servicedeskapi/organization?start=${startAt}&limit=${maxResults}`;
    const orgaList = await getAPI(path, params);

    completeList = completeList.concat(orgaList.values);

    startAt += orgaList.limit;
    last = orgaList.isLastPage;
  }

  return completeList;

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