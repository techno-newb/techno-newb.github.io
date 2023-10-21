window.addEventListener("load", () => {
  // Get the JSON and server URL from the URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const resourceJson = urlParams.get("resource");
  const serverUrl = urlParams.get("serverUrl");

  // Decode the JSON string and server URL
  const decodedJson = decodeURIComponent(resourceJson);
  const decodedServerUrl = decodeURIComponent(serverUrl);

  // Populate the text area with the JSON
  const jsonEditor = document.getElementById("json-editor");
  jsonEditor.value = decodedJson;

  // Adjust the rows attribute of the textarea based on the number of lines in the JSON
  jsonEditor.rows = decodedJson.split('\n').length;

  // Set the value of the server URL input field
  document.getElementById("server-url").value = decodedServerUrl;

  // Add an event listener for the save button
  document
    .getElementById("save-button")
    .addEventListener("click", () => saveChanges(decodedServerUrl));
});

async function saveChanges() {
  // Get the edited JSON from the text area
  const editedJson = document.getElementById("json-editor").value;

  // Get the server URL from the input field
  const serverUrl = document.getElementById("server-url").value;

  // Get the selected HTTP method
  const httpMethod = document.getElementById("http-method").value;

  // Convert the JSON to a JavaScript object
  const editedResource = JSON.parse(editedJson);

  // Construct the URL
  let url = `${serverUrl}/${editedResource.resourceType}`;
  if (httpMethod === "PUT") {
    url += `/${editedResource.id}`;
  }

  // Send the edited resource to the server
  const response = await fetch(url, {
    method: httpMethod,
    headers: {
      "Content-Type": "application/fhir+json",
    },
    body: editedJson,
  });

  // Get the response text
  const responseText = await response.text();

  // Create a string with the status and headers
  const responseInfo = `Status: ${response.status} ${
    response.statusText
  }\n\nHeaders:\n${Array.from(response.headers.entries())
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n")}\n\nBody:\n${responseText}`;

  // Display the response in the modal
  document.getElementById("json-display").textContent = responseInfo;
  document.getElementById("json-modal").style.display = "block";

  // Close the modal when the close button is clicked
  document.getElementById("close-modal").onclick = () => {
    document.getElementById("json-modal").style.display = "none";
  };

  // Close the modal when clicked outside the modal content
  window.onclick = (event) => {
    if (event.target === document.getElementById("json-modal")) {
      document.getElementById("json-modal").style.display = "none";
    }
  };
}
