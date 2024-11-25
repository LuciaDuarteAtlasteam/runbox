export async function getAPI(path, params) {
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
