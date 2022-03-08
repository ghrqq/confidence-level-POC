// import { ErrorCodes } from "../errorMessages";
import { ErrorCodes } from "../errorMessages";
import {
  combinedConnectionInfoAdder,
  dataFlattener,
  fieldRemover,
  findByTransactionId,
  requestValidator,
} from "./transactionRouteHelpers";

describe("Validates requests", () => {
  test("Returns an error message if transaction ID is invalid.", () => {
    expect(requestValidator(false)(1)).toEqual(
      exampleOutputs.invalidTransactionId
    );
  });
  test("Returns an error message if confidence Level is invalid.", () => {
    expect(requestValidator(true)(12)).toEqual(
      exampleOutputs.invalidConfidenceLevel
    );
  });
  test("Returns an error message if confidence Level and transaction Id are invalid.", () => {
    expect(requestValidator(false)(12)).toEqual(
      exampleOutputs.invalidBothParameters
    );
  });
  test("Passes if values are valid", () => {
    expect(requestValidator(true)(1)).toEqual(exampleOutputs.bothValid);
  });
});

describe("FindByTransactionId works.", () => {
  test("Finds elements by id.", () => {
    expect(
      findByTransactionId({ id: 2 })(exampleInputs.dataToBeFlattened)
    ).toEqual(exampleOutputs.id2);
  });
  test("Finds nested elements by id.", () => {
    expect(
      findByTransactionId({ id: 5 })(exampleInputs.dataToBeFlattened)
    ).toEqual(exampleOutputs.id5);
  });
  test("Finds nested elements by multiple parameters.", () => {
    expect(
      findByTransactionId({ age: 5, x: "a" })(
        exampleInputs.multipleParameterData
      )
    ).toEqual(exampleOutputs.age5xa);
  });
});
describe("Data flattener works properly.", () => {
  test("Flattens the array in depth but keeps the children.", () => {
    expect(dataFlattener(exampleInputs.dataToBeFlattened)).toEqual(
      exampleOutputs.flattenedData
    );
  });
});

describe("Field remover works properly", () => {
  test("Removes given fields from given data", () => {
    expect(fieldRemover(exampleOutputs.flattenedData, ["children"])).toEqual(
      exampleOutputs.childrenRemoved
    );
  });
  test("Removes multiple fields from given data", () => {
    expect(
      fieldRemover(exampleOutputs.flattenedData, ["children", "age"])
    ).toEqual(exampleOutputs.childrenAndAgeRemoved);
  });
});

describe("Adds combined info successfuly.", () => {
  test("Works", () => {
    expect(combinedConnectionInfoAdder(exampleInputs.dataToBeCombined)).toEqual(
      exampleOutputs.combinedData
    );
  });
});

const exampleInputs = {
  dataToBeFlattened: [
    {
      id: 1,
      age: 5,
      children: [],
    },
    {
      id: 2,
      age: 10,
      children: [
        {
          id: 3,
          age: 15,
          children: [
            { id: 4, age: 8, children: [] },
            { id: 6, age: 7, children: [] },
          ],
        },
        { id: 5, age: 11, children: [] },
      ],
    },
  ],
  multipleParameterData: [
    {
      id: 1,
      age: 5,
      x: "a",
      children: [],
    },
    {
      id: 2,
      age: 5,
      x: "b",
      children: [
        {
          id: 3,
          age: 5,
          x: "c",
          children: [
            { id: 4, age: 8, x: "a", children: [] },
            { id: 6, age: 7, x: "a", children: [] },
          ],
        },
        { id: 5, age: 5, x: "a", children: [] },
      ],
    },
  ],
  dataToBeCombined: [
    {
      id: "5c868b9b89b9aadcd89bef44",
      age: 37,
      name: "Hendricks Gregory",
      email: "hendricksgregory@equicom.com",
      phone: "(916) 442-2364",
      geoInfo: { latitude: -77.750824, longitude: -179.512601 },
      children: [
        {
          id: "5c868b9b4afab211a31bf4a7",
          age: 35,
          name: "Naomi Horne",
          email: "naomihorne@equicom.com",
          phone: "(951) 599-2186",
          geoInfo: { latitude: -77.750824, longitude: -179.512601 },
          connectionInfo: { type: "sameGeoInfo", confidence: 0.4 },
          children: [],
        },
        {
          id: "5c868b9be2cabfda9cfc0569",
          age: 38,
          name: "Booker Castillo",
          email: "bookercastillo@equicom.com",
          phone: "(916) 442-2364",
          geoInfo: { latitude: -81.845732, longitude: 36.720565 },
          connectionInfo: { type: "samePhoneNumber", confidence: 1 },
          children: [],
        },
      ],
    },
  ],
};

const exampleOutputs = {
  flattenedData: [
    { age: 5, children: [], id: 1 },
    {
      age: 10,
      children: [
        {
          age: 15,
          children: [
            { age: 8, children: [], id: 4 },
            { age: 7, children: [], id: 6 },
          ],
          id: 3,
        },
        { age: 11, children: [], id: 5 },
      ],
      id: 2,
    },
    {
      age: 15,
      children: [
        { age: 8, children: [], id: 4 },
        { age: 7, children: [], id: 6 },
      ],
      id: 3,
    },
    { age: 8, children: [], id: 4 },
    { age: 7, children: [], id: 6 },
    { age: 11, children: [], id: 5 },
  ],
  childrenRemoved: [
    { age: 5, id: 1 },
    { age: 10, id: 2 },
    { age: 15, id: 3 },
    { age: 8, id: 4 },
    { age: 7, id: 6 },
    { age: 11, id: 5 },
  ],
  childrenAndAgeRemoved: [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 6 },
    { id: 5 },
  ],
  invalidTransactionId: {
    errorMessages: [ErrorCodes.invalidTransactionId],
    errorsFound: 1,
  },
  invalidConfidenceLevel: {
    errorMessages: [ErrorCodes.invalidConfidenceLevel],
    errorsFound: 1,
  },
  invalidBothParameters: {
    errorMessages: [
      ErrorCodes.invalidTransactionId,
      ErrorCodes.invalidConfidenceLevel,
    ],
    errorsFound: 2,
  },
  bothValid: { errorMessages: [], errorsFound: 0 },
  id2: [
    {
      age: 10,
      children: [
        {
          age: 15,
          children: [
            { age: 8, children: [], id: 4 },
            { age: 7, children: [], id: 6 },
          ],
          id: 3,
        },
        { age: 11, children: [], id: 5 },
      ],
      id: 2,
    },
  ],
  id5: [{ age: 11, children: [], id: 5 }],
  age5xa: [
    { age: 5, children: [], id: 1, x: "a" },
    { age: 5, children: [], id: 5, x: "a" },
  ],
  combinedData: [
    {
      age: 37,
      children: [
        {
          age: 35,
          children: [],
          connectionInfo: { confidence: 0.4, type: "sameGeoInfo" },
          email: "naomihorne@equicom.com",
          geoInfo: { latitude: -77.750824, longitude: -179.512601 },
          id: "5c868b9b4afab211a31bf4a7",
          name: "Naomi Horne",
          phone: "(951) 599-2186",
        },
        {
          age: 38,
          children: [],
          connectionInfo: { confidence: 1, type: "samePhoneNumber" },
          email: "bookercastillo@equicom.com",
          geoInfo: { latitude: -81.845732, longitude: 36.720565 },
          id: "5c868b9be2cabfda9cfc0569",
          name: "Booker Castillo",
          phone: "(916) 442-2364",
        },
      ],
      email: "hendricksgregory@equicom.com",
      geoInfo: { latitude: -77.750824, longitude: -179.512601 },
      id: "5c868b9b89b9aadcd89bef44",
      name: "Hendricks Gregory",
      phone: "(916) 442-2364",
    },
  ],
};
