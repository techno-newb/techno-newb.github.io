class App {
  constructor() {
    this.getElement = {
      nextPageButton: document.getElementById("next-page-button"),
      previousPageButton: document.getElementById("previous-page-button"),
      serverUrl: document.getElementById("server-url"),
      addParameterButton: document.getElementById("add-parameter-button"),
      resourceSelect: document.getElementById("resource-select"),
      parametersContainer: document.getElementById("parameters-container"),
      queryButton: document.getElementById("query-button"),
      queryStringOutput: document.getElementById("query-string"),
      queryResultOutput: document.getElementById("query-result"),
      jsonModal: document.getElementById("json-modal"),
      closeModal: document.getElementById("close-modal"),
      modal: document.getElementById("json-modal"),
      jsonDisplay: document.getElementById("json-display"),
      parameterNameInput: document.getElementById("parameter-name"),
      parameterValueInput: document.getElementById("parameter-value"),
      form: document.getElementById("query-form"),
      errorMessage: document.getElementById("server-url-error"),
      readOperationToggle: document.getElementById("read-operation-toggle"),
      patientEverythingToggle: document.getElementById(
        "patient-everything-toggle"
      ),
      patientEverythingToggleContainer: document.getElementById(
        "patient-everything-toggle-container"
      ),
      editButton: document.getElementById("edit-button"),
    };
  }

  // Asynchronous function to initialize the application
  async initApp() {
    // Fetch and validate the capability statement from the server.
    // The capability statement is a kind of metadata document that describes what operations the server supports.
    // It's used to populate options in the user interface.
    let capabilityStatement = await this.fetchAndValidateCapabilityStatement();

    if (capabilityStatement) {
      // Populate the resource options dropdown in the user interface based on the capability statement
      this.populateAndSetupResourceOptions(capabilityStatement);

      // Setup event listeners for the UI elements based on the capability statement
      this.setupEventListeners(capabilityStatement);
    }

    // Build the query string when the page loads
    this.buildQueryString();
  }

  // Asynchronous function to fetch and validate the capability statement
  async fetchAndValidateCapabilityStatement() {
    // Fetch the capability statement from the server using the server URL specified in the user interface
    const capabilityStatement = await fetchCapabilityStatement(
      this.getElement.serverUrl.value
    );

    if (capabilityStatement) {
      // Remove the 'invalid-server-url' class from the server URL input field, indicating a successful fetch
      this.getElement.serverUrl.classList.remove("invalid-server-url");

      // Hide the error message related to the server URL
      this.getElement.errorMessage.style.display = "none";
    } else {
      // If the capability statement could not be fetched, add the 'invalid-server-url' class to the server URL input field
      this.getElement.serverUrl.classList.add("invalid-server-url");

      // Display an error message indicating that the server's CapabilityStatement could not be retrieved
      this.getElement.errorMessage.textContent =
        "Unable to retrieve the server's CapabilityStatement. Check the console for additional details.";
      this.getElement.errorMessage.style.display = "block";
    }
    // Return the capability statement, or undefined if it could not be fetched
    return capabilityStatement;
  }

  // Function to populate the resource options dropdown and setup parameters based on the capability statement
  populateAndSetupResourceOptions(capabilityStatement) {
    // Populate the resource options dropdown in the user interface based on the capability statement
    // The capability statement contains a list of resources that the server supports, which are used to fill the dropdown
    this.populateResourceOptions(capabilityStatement);

    // Get the currently selected value in the resource select dropdown
    const selectedResource = this.getElement.resourceSelect.value;

    // Populate the parameters for the selected resource, based on what parameters the capability statement says the resource supports
    this.populateParameters(selectedResource, capabilityStatement);
  }

  // Function to set up event listeners for UI elements based on the capability statement
  setupEventListeners(capabilityStatement) {
    // Add an event listener to the resource select dropdown that handles changing the displayed parameters when the selected resource changes
    this.getElement.resourceSelect.addEventListener("change", () =>
      this.handleResourceSelectChange(capabilityStatement)
    );

    // Add an event listener to the "Add Parameter" button that adds a new parameter to the parameters list when clicked
    this.getElement.addParameterButton.addEventListener("click", () =>
      this.addParameter()
    );

    // Add an event listener to the form that handles sending the query when the form is submitted
    this.getElement.form.addEventListener("submit", (event) =>
      this.handleSubmit(event)
    );

    // Add an event listener to the server URL input field that handles re-fetching and re-validating the capability statement when the server URL changes
    this.getElement.serverUrl.addEventListener("change", () =>
      this.handleServerUrlChange(capabilityStatement)
    );

    // Add an event listener to the resource select dropdown that shows or hides the "Patient Everything" toggle based on the selected resource
    this.getElement.resourceSelect.addEventListener("change", (event) =>
      this.handlePatientToggleChange(event)
    );

    // Set up the event listeners for the pagination buttons
    this.setupPaginationButtons();

    // Add an event listener to the "Edit" button that opens the edit page when clicked
    this.getElement.editButton.addEventListener("click", () =>
      this.openEditPage(this.currentResource)
    );

    // Add an event listener to the read operation toggle
    this.getElement.readOperationToggle.addEventListener("change", () => {
      this.buildQueryString();
    });

    // Add an event listener to the patient everything operation toggle
    this.getElement.patientEverythingToggle.addEventListener("change", () => {
      this.buildQueryString();
    });
  }

  openEditPage(resource) {
    // Get the JSON representation of the FHIR resource
    const resourceJson = JSON.stringify(resource, null, 2);

    // Encode the JSON string so it can be included in a URL
    const encodedJson = encodeURIComponent(resourceJson);

    // Get the server URL
    const serverUrl = this.getElement.serverUrl.value;

    // Encode the server URL so it can be included in a URL
    const encodedServerUrl = encodeURIComponent(serverUrl);

    // Open the edit page in a new tab and pass the JSON and server URL as URL parameters
    window.open(
      `./pages/editor.html?resource=${encodedJson}&serverUrl=${encodedServerUrl}`,
      "_blank"
    );
  }

  // Function to set up event listeners for pagination buttons
  setupPaginationButtons() {
    // Add an event listener to the "Next Page" button
    // When the button is clicked, it retrieves the next page of results
    this.getElement.nextPageButton.addEventListener("click", () =>
      this.getNextPage()
    );

    // Add an event listener to the "Previous Page" button
    // When the button is clicked, it retrieves the previous page of results
    this.getElement.previousPageButton.addEventListener("click", () =>
      this.getPreviousPage()
    );
  }

  // Function to handle the event when the server URL input field changes
  async handleServerUrlChange(capabilityStatement) {
    // Get the value of the server URL input field
    const newServerUrl = this.getElement.serverUrl.value;

    // Fetch and validate the capability statement for the new server URL
    // The returned capabilityStatement object will be null if the server URL is invalid
    capabilityStatement = await this.fetchAndValidateCapabilityStatement(
      newServerUrl
    );

    // If the new server URL is valid, populate the resource options dropdown and setup parameters based on the new capability statement
    // If the new server URL is invalid, this will not execute
    if (capabilityStatement) {
      this.populateAndSetupResourceOptions(capabilityStatement);
    }
  }

  // Function to handle the event when the resource select dropdown changes
  handleResourceSelectChange(capabilityStatement) {
    // Get the value of the resource select dropdown
    const selectedResource = this.getElement.resourceSelect.value;

    // Populate the parameters for the selected resource based on the capability statement
    this.populateParameters(selectedResource, capabilityStatement);

    // Build the query string when the resource type is changed
    this.buildQueryString();
  }

  // Function to handle the event when the form is submitted
  handleSubmit(event) {
    // Prevent the default form submission action
    // This is done because we want to handle form submission using JavaScript, not the default HTML form submission
    event.preventDefault();

    // Send the query based on the form's current state
    // This involves building the query string from the form inputs and sending a request to the server
    this.sendQuery();
  }

  // Function to handle the event when the resource select dropdown changes
  handlePatientToggleChange(event) {
    // If the selected resource is "Patient"
    if (event.target.value === "Patient") {
      // Display the "Patient Everything" toggle because this operation is only applicable to the Patient resource
      this.getElement.patientEverythingToggleContainer.style.display = "block";
    } else {
      // Hide the "Patient Everything" toggle because this operation is not applicable to other resources
      this.getElement.patientEverythingToggleContainer.style.display = "none";

      // Uncheck the "Patient Everything" toggle because it is not applicable when the selected resource is not "Patient"
      this.getElement.patientEverythingToggle.checked = false;
    }
  }

  // Function to handle the event when the 'next page' button is clicked
  async getNextPage() {
    // Get the URL of the next page from the 'next page' button's data attribute
    const nextUrl = this.getElement.nextPageButton.dataset.nextUrl;

    // If a next page URL is available
    if (nextUrl) {
      // Send a query to the server using the next page URL
      await this.sendQuery(nextUrl);
    }
  }

  // Function to handle the event when the 'previous page' button is clicked
  async getPreviousPage() {
    // Get the URL of the previous page from the 'previous page' button's data attribute
    const previousUrl = this.getElement.previousPageButton.dataset.previousUrl;

    // If a previous page URL is available
    if (previousUrl) {
      // Send a query to the server using the previous page URL
      await this.sendQuery(previousUrl);
    }
  }

  // Function to populate the resource dropdown based on the server's CapabilityStatement
  populateResourceOptions(capabilityStatement) {
    // Clear the existing options from the resource dropdown
    while (this.getElement.resourceSelect.firstChild) {
      this.getElement.resourceSelect.removeChild(
        this.getElement.resourceSelect.firstChild
      );
    }

    // Extract the list of resource types from the CapabilityStatement
    const resourceTypes = capabilityStatement.rest[0].resource.map(
      (resource) => resource.type
    );

    // For each resource type
    resourceTypes.forEach((resourceType) => {
      // Create a new option element
      const option = document.createElement("option");

      // Set the option's value and display text to the resource type
      option.value = resourceType;
      option.text = resourceType;

      // Add the option to the resource dropdown
      this.getElement.resourceSelect.appendChild(option);
    });
  }

  // Method to handle addition of a new parameter by the user
  addParameter() {
    const parameterName = this.getElement.parameterNameInput.value;
    const parameterValue = this.getElement.parameterValueInput.value;

    if (parameterName && parameterValue) {
      let parameterContainer;
      if (this.getElement.addParameterButton.dataset.editing) {
        const parameterContainerId =
          this.getElement.addParameterButton.dataset.editing;
        parameterContainer = document.getElementById(parameterContainerId);
        parameterContainer.querySelector(".userParameterName").innerText =
          parameterName;
        parameterContainer.querySelector(".userParameterValue").innerText =
          parameterValue;
        this.getElement.addParameterButton.innerText = "Add Parameter";
        delete this.getElement.addParameterButton.dataset.editing;
      } else {
        parameterContainer = this.createParameterContainer(
          parameterName,
          parameterValue
        );
        this.getElement.parametersContainer.appendChild(parameterContainer);
      }

      this.buildQueryString();
      this.getElement.parameterNameInput.value = "";
      this.getElement.parameterValueInput.value = "";
    }
  }

  // Function to populate the parameter fields based on the selected resource
  populateParameters(resource, capabilityStatement) {
    // Find the specific resource from the CapabilityStatement
    const resourceDefinition = capabilityStatement.rest[0].resource.find(
      (res) => res.type === resource
    );

    // Get the array of search parameters for the found resource, or an empty array if no parameters are found
    const searchParams = resourceDefinition.searchParam || [];

    // Sort the search parameters by their names
    searchParams.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });

    // Clear existing parameters from the parameters container
    this.getElement.parametersContainer.innerHTML = "";

    // For each search parameter
    searchParams.forEach((parameter) => {
      // Create an input container for the parameter
      const inputContainer = createInputContainer(parameter);

      // Append the input container to the parameters container
      this.getElement.parametersContainer.appendChild(inputContainer);
    });

    // Add an event listener to each input and select element in the parameters container
    // When the input value changes, rebuild the query string
    document
      .querySelectorAll(
        "#parameters-container input, #parameters-container select"
      )
      .forEach((input) => {
        input.addEventListener("input", () => {
          this.buildQueryString();
        });
      });
  }

  // Function to build the query string based on the current state of the form
  buildQueryString() {
    // Get the server URL from the form
    const serverUrl = this.getElement.serverUrl.value;

    // Get the selected resource from the form
    const resourceType = this.getElement.resourceSelect.value;

    // Collect all search parameters from the form
    const searchParams = collectSearchParams();

    // Create an instance of URLSearchParams with the collected search parameters
    const queryParams = new URLSearchParams();
    for (const [key, value] of searchParams) {
      queryParams.append(key, value);
    }

    // Check if the read operation toggle is checked
    const isReadOperation = this.getElement.readOperationToggle.checked;

    // Check if the patient everything operation is checked and the selected resource is 'Patient'
    const isPatientEverything =
      this.getElement.patientEverythingToggle.checked &&
      resourceType === "Patient";

    // Start building the URL with the server URL and the selected resource
    let queryString = `${serverUrl}/${resourceType}`;

    // Find the _id parameter in the searchParams array
    const idParam = searchParams.find((param) => param[0] === "_id");

    // If it's a patient everything operation, append '$everything' to the URL
    if (isPatientEverything) {
      // If there's an _id parameter, append it to the URL before '$everything'
      if (idParam) {
        // Patient $everything operation with _id
        queryString += `/${idParam[1]}/$everything`;
        // Remove the _id parameter from the queryParams
        queryParams.delete("_id");
      } else {
        // Patient $everything operation without _id
        queryString += `/$everything`;
      }
    } else if (isReadOperation && idParam) {
      // If it's a read operation and there's an _id parameter, append it to the URL
      // Read operation
      queryString += `/${idParam[1]}`;
      // Remove the _id parameter from the queryParams
      queryParams.delete("_id");
    }

    // If there are any parameters, append them to the URL
    const hasSearchParams = Array.from(queryParams).length > 0;
    queryString += `${hasSearchParams ? "?" : ""}${queryParams}`;

    // Update the query string output text in the form
    if (this.getElement.queryStringOutput) {
      this.getElement.queryStringOutput.innerText = queryString;
    } else {
      console.error("Query string output element not found.");
    }

    // Return the built URL
    return queryString;
  }

  // Function to send the query to the server
  async sendQuery(url) {
    // If no url is provided, generate it using buildQueryString method
    const queryString = url || this.buildQueryString(this.getElement);
    try {
      const response = await fetch(queryString);
      const data = await response.json();
      this.displayQueryResult(this.getElement.queryResultOutput, data);
    } catch (error) {
      console.error(error);
    }
  }

  displayQueryResult(queryResultOutput, data) {
    if (queryResultOutput) {
      queryResultOutput.innerHTML = "";
      if (data.entry) {
        // Create a new container div for the card grid and the bundle card
        const resultContainer = document.createElement("div");
        resultContainer.classList.add("result-container");

        const cardGrid = this.createCardGrid(data.entry);
        resultContainer.appendChild(cardGrid);

        // Add a new div after the card-grid for the bundle card
        const bundleCardDiv = document.createElement("div");
        bundleCardDiv.classList.add("bundle-card-container");

        // Create the bundle card
        const bundleCard = this.createResourceCard(data);
        bundleCardDiv.appendChild(bundleCard);
        resultContainer.appendChild(bundleCardDiv);

        // Append the result container to the queryResultOutput
        queryResultOutput.appendChild(resultContainer);
      } else {
        const card = this.createResourceCard(data);
        queryResultOutput.appendChild(card);
      }
    } else {
      console.error("Query result output element not found.");
    }
    if (data.link) {
      const nextLink = data.link.find((link) => link.relation === "next");
      const previousLink = data.link.find(
        (link) => link.relation === "previous"
      );

      if (nextLink) {
        this.getElement.nextPageButton.dataset.nextUrl = nextLink.url;
        this.getElement.nextPageButton.style.display = "inline-block";
      } else {
        this.getElement.nextPageButton.style.display = "none";
      }

      if (previousLink) {
        this.getElement.previousPageButton.dataset.previousUrl =
          previousLink.url;
        this.getElement.previousPageButton.style.display = "inline-block";
      } else {
        this.getElement.previousPageButton.style.display = "none";
      }
    } else {
      this.getElement.nextPageButton.style.display = "none";
      this.getElement.previousPageButton.style.display = "none";
    }
  }

  createCardGrid(entries) {
    const cardGrid = document.createElement("div");
    cardGrid.classList.add("card-grid");

    entries.forEach((entry) => {
      const resource = entry.resource;
      const card = this.createResourceCard(resource, this.getElement);
      cardGrid.appendChild(card);
    });

    return cardGrid;
  }

  // Create resource card
  createResourceCard(resource) {
    const card = document.createElement("div");
    card.classList.add("card");

    const cardBody = createCardBody(resource);

    card.appendChild(cardBody);

    // Add an event listener to the card
    card.addEventListener("click", () => {
      const jsonString = JSON.stringify(resource, null, 2);

      this.getElement.jsonDisplay.textContent = jsonString;
      hljs.addPlugin(new CopyButtonPlugin());
      hljs.highlightElement(this.getElement.jsonDisplay); // Syntax highlighting

      // Show the modal
      this.getElement.modal.style.display = "block";

      // Close the modal when the close button is clicked
      this.getElement.closeModal.onclick = () => {
        this.getElement.modal.style.display = "none";
      };

      // Close the modal when clicked outside the modal content
      window.onclick = (event) => {
        if (event.target === this.getElement.modal) {
          this.getElement.modal.style.display = "none";
        }
      };

      // Store the current resource
      this.currentResource = resource;

      // Show the "Edit" button
      this.getElement.editButton.style.display = "block";
    });

    return card;
  }

  createParameterContainer(parameterName, parameterValue) {
    const parameterContainer = document.createElement("div");
    parameterContainer.classList.add("form-group");

    // Assign an id to the parameterContainer
    parameterContainer.id = `param-${parameterName}`;

    const parameterNameElement = document.createElement("span");
    parameterNameElement.classList.add("userParameterName");
    parameterNameElement.label = "Parameter";
    parameterNameElement.innerText = parameterName;

    const parameterValueElement = document.createElement("span");
    parameterValueElement.classList.add("userParameterValue");
    parameterValueElement.innerText = parameterValue;

    const editButton = document.createElement("button");
    editButton.classList.add("edit-button");
    editButton.classList.add("btn");
    editButton.innerText = "Edit";
    editButton.addEventListener("click", (e) => {
      e.preventDefault(); // Prevent the form from being submitted
      this.getElement.parameterNameInput.value = parameterName;
      this.getElement.parameterValueInput.value = parameterValue;
      this.getElement.addParameterButton.innerText = "Update Parameter";
      this.getElement.addParameterButton.dataset.editing = parameterContainer;
      this.getElement.addParameterButton.dataset.editing =
        parameterContainer.id;
    });

    const removeButton = document.createElement("button");
    removeButton.classList.add("remove-button");
    removeButton.classList.add("btn");
    removeButton.innerText = "Remove";
    removeButton.addEventListener("click", () => {
      parameterContainer.remove();
      this.buildQueryString();
    });

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");

    buttonContainer.appendChild(editButton);
    buttonContainer.appendChild(removeButton);

    parameterContainer.appendChild(parameterNameElement);
    parameterContainer.appendChild(parameterValueElement);
    parameterContainer.appendChild(buttonContainer);

    return parameterContainer;
  }
}

async function fetchCapabilityStatement(serverUrlValue) {
  const timeOutInMilliseconds = 8000; // Adjust the timeout value as needed
  try {
    const response = await fetchWithTimeout(
      `${serverUrlValue}/metadata`,
      {},
      timeOutInMilliseconds
    );
    if (!response.ok) {
      console.error("Error fetching CapabilityStatement:", response.status);
      return false;
    }
    const capabilityStatement = await response.json();
    return capabilityStatement;
  } catch (error) {
    console.error("Error fetching CapabilityStatement:", error);
    return false;
  }
}

async function fetchWithTimeout(url, options, timeout) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), timeout)
    ),
  ]);
}

function createInputContainer(parameter) {
  const inputContainer = document.createElement("div");
  inputContainer.classList.add("form-group");

  // Create a label element
  const label = document.createElement("label");
  label.htmlFor = parameter.name;
  label.innerText = `${parameter.name}`;

  // Create a custom tooltip element
  const tooltip = document.createElement("span");
  tooltip.classList.add("tooltip-text");
  tooltip.innerText = parameter.documentation || "No description available";
  // Append the tooltip to the label
  label.appendChild(tooltip);

  // Create an input element
  let input;
  if (parameter.type === "token") {
    input = createTokenInput(parameter);
  } else if (parameter.type === "date") {
    input = createDateInput(parameter);
  } else {
    input = document.createElement("input");
    input.type = "text";
  }
  input.classList.add("form-control");
  input.name = parameter.name;
  input.id = parameter.name;
  input.dataset.parameter = parameter.name;
  input.placeholder = parameter.type;

  // Append the label and input this.getElement to the input container
  inputContainer.appendChild(label);
  inputContainer.appendChild(input);

  return inputContainer;
}

function createDateInput(parameter) {
  const input = document.createElement("input");
  input.type = "text";
  return input;
}

function createTokenInput(parameter) {
  const input = document.createElement("input");
  input.type = "text";
  return input;
}

function collectSearchParams() {
  const searchParams = [];

  document
    .querySelectorAll(
      "#parameters-container select, #parameters-container input"
    )
    .forEach((input) => {
      if (input.value !== "") {
        searchParams.push([input.name, input.value]);
      }
    });

  const userParameters = document.querySelectorAll(".form-group");
  userParameters.forEach((parameterContainer) => {
    const parameterNameElement =
      parameterContainer.querySelector(".userParameterName");
    const parameterValueElement = parameterContainer.querySelector(
      ".userParameterValue"
    );

    if (parameterNameElement && parameterValueElement) {
      const parameterName = parameterNameElement.innerText;
      const parameterValue = parameterValueElement.innerText;

      if (parameterName && parameterValue) {
        searchParams.push([parameterName, parameterValue]);
      }
    }
  });

  return searchParams;
}

function findReferenceValue(resource, key) {
  let results = []; // variable to store the results

  // loop through the object
  for (const prop in resource) {
    if (typeof resource[prop] === "object") {
      // recursively search nested objects and update the results array
      results = results.concat(findReferenceValue(resource[prop], key));
    } else if (prop === key) {
      // add the key-value pair to the results array
      results.push(`${key}: ${resource[prop]}`);
    }
  }

  return results; // return the results array once the loop is finished
}

function createCardBody(resource) {
  const cardBody = document.createElement("div");
  cardBody.classList.add("card-body");

  if (resource.resourceType === "Patient") {
    const nameElement = document.createElement("h3");

    if (resource.name && resource.name[0]) {
      const givenNames = resource.name[0].given;
      const familyName = resource.name[0].family || "";

      let fullName = "";

      if (givenNames && givenNames.length > 0) {
        fullName = givenNames[0]; // First name

        if (givenNames.length > 1) {
          // Middle initial
          fullName += ` ${givenNames[1].charAt(0)}.`;
        }
      }

      fullName += ` ${familyName}`; // Family name
      nameElement.innerText = fullName;
    } else {
      nameElement.innerText = "Unnamed Patient";
    }

    cardBody.appendChild(nameElement);
  }

  Object.keys(resource).forEach((key) => {
    const value = resource[key];
    if (typeof value !== "object") {
      const element = document.createElement("p");
      element.innerText = `${key}: ${value}`;
      cardBody.appendChild(element);
    }
  });

  if (resource.resourceType != "Bundle") {
    const referenceValues = findReferenceValue(resource, "reference");

    if (referenceValues.length > 0) {
      referenceValues.forEach((value) => {
        const element = document.createElement("p");
        element.innerText = value;
        cardBody.appendChild(element);
      });
    }
  }
  return cardBody;
}

window.addEventListener("DOMContentLoaded", () => new App().initApp());
