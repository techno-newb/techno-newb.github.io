# FHIR Query Builder

The FHIR Query Builder is a web application that provides an interface to interact with FHIR (Fast Healthcare Interoperability Resources) servers, facilitating the construction and execution of FHIR standard queries.

## Table of Contents
- [FHIR Query Builder](#fhir-query-builder)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [User Interface Elements](#user-interface-elements)
  - [Detailed Functionality](#detailed-functionality)
    - [Server URL Input](#server-url-input)
    - [Resource Selection](#resource-selection)
    - [Parameter Entry](#parameter-entry)
    - [Query Operations Toggle](#query-operations-toggle)
    - [Query Submission and Result Display](#query-submission-and-result-display)
  - [Technical Notes](#technical-notes)

## Features
This application provides several interactive features:

1. Dynamic resource selection
2. Query parameter manipulation
3. Support for 'Read' and 'Patient Everything' operations
4. Query execution
5. Result display with pagination

## User Interface Elements

The application is composed of several UI elements, each serving a specific purpose:

- **Server URL Input**: This is where you input the URL of your FHIR server.
- **Resource Select**: A dropdown menu where you can choose the resource type you want to query.
- **Parameter Input Fields**: These fields allow you to enter the parameter name and its corresponding value.
- **Add Parameter Button**: Click this to add the parameter to the query.
- **Read Operation Toggle**: A checkbox to enable or disable 'Read' operation.
- **Patient Everything Toggle**: A checkbox to enable or disable 'Patient Everything' operation.
- **Submit Button**: Click this to submit the query to the server.
- **Query Result Output**: The area where the query results will be displayed.
- **Next/Previous Page Button**: Buttons for navigating through pages of query results.
- **JSON Display**: This is where the JSON representation of a specific resource will be displayed.

## Detailed Functionality

### Server URL Input

- The server URL input field requires the user to enter the URL of the FHIR server they wish to query.
- Upon entering a URL, the application fetches and validates the server's capability statement to confirm its availability and capabilities.
- In case the server's capability statement cannot be fetched, the input field will be highlighted as invalid and an error message will be displayed.

### Resource Selection

- The dropdown menu is dynamically populated based on the types of resources available in the server's capability statement.
- Upon selecting a resource type, the application fetches the search parameters related to the chosen resource.

### Parameter Entry

- The parameter input fields allow the user to define additional parameters for the query.
- When the user fills in a parameter name and its value, then clicks the 'Add Parameter' button, a new parameter is added to the list of parameters used in constructing the query.

### Query Operations Toggle

- The 'Read Operation' checkbox modifies the query such that it reads the resource with a specific ID provided in the parameters.
- The 'Patient Everything Operation' checkbox modifies the query such that it fetches all information related to a specific patient when the resource type is 'Patient'.

### Query Submission and Result Display

- The 'Submit Query' button triggers the constructed query to be sent to the server.
- The results are then fetched and displayed in the 'Query Result Output' area.
- Each result entry can be clicked to view the full JSON representation of the resource.
- If the query results contain links to 'next' and 'previous' pages, the 'Next Page' and 'Previous Page' buttons are enabled to allow navigation through result pages.

## Technical Notes

This application uses modern JavaScript and web technologies to provide its functionality. Here are some important technical details:

- **Fetch API**: The application uses the Fetch API to send HTTP requests to the FHIR server.
- **Event Listeners**: Event listeners are used to react to user interactions like button clicks, dropdown selection
