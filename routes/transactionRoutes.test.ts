const { getTransactions } = require("./transactionRoutes");
import ErrorCodes = require("../errorMessages");

const mockRequest = (transactionId: any, confidenceLevel: any) => ({
  query: { transactionId, confidenceLevel },
});

const mockResponse = () => {
  const res: { status: any; send: any } = { status: "", send: "" };
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);

  return res;
};

describe("Receives query parameters and validates those.", () => {
  test("Should send an error message if the transactionId is not valid.", async () => {
    const req = mockRequest("abc", 0.1);
    const res = mockResponse();
    await getTransactions(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith([
      ErrorCodes.ErrorCodes.invalidTransactionId,
    ]);
  });
  test("Should send an error message if the confidence level is not valid.", async () => {
    const req = mockRequest("5c868b9b89b9aadcd89bef44", 8);
    const res = mockResponse();
    await getTransactions(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith([
      ErrorCodes.ErrorCodes.invalidConfidenceLevel,
    ]);
  });
  test("Should send an error message if the confidence level and transaction Id are not valid.", async () => {
    const req = mockRequest("5c868b9b89b9aadcd89bef44a", 8);
    const res = mockResponse();
    await getTransactions(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith([
      ErrorCodes.ErrorCodes.invalidTransactionId,
      ErrorCodes.ErrorCodes.invalidConfidenceLevel,
    ]);
  });
});
describe("If request passes the validation makes the query.", () => {
  test("Should send an error message if no date returns from the query.", async () => {
    const req = mockRequest("5c868b9b89b9aadcd89bef43", 0.8);
    const res = mockResponse();
    await getTransactions(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(ErrorCodes.ErrorCodes.notFound);
  });
  test("Successfuly returns flattened data.", async () => {
    const req = mockRequest("5c868b9b89b9aadcd89bef44", 0);
    const res = mockResponse();
    await getTransactions(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(exampleOutputs[0]);
  });
  test("Successfuly filters by the confidence level.", async () => {
    const req = mockRequest("5c868b9b89b9aadcd89bef44", 0.5);
    const res = mockResponse();
    await getTransactions(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(exampleOutputs[1]);
  });
});

const exampleOutputs = {
  0: [
    {
      id: "5c868b9b89b9aadcd89bef44",
      age: 37,
      name: "Hendricks Gregory",
      email: "hendricksgregory@equicom.com",
      phone: "(916) 442-2364",
      geoInfo: {
        latitude: -77.750824,
        longitude: -179.512601,
      },
    },
    {
      id: "5c868b9b4afab211a31bf4a7",
      age: 35,
      name: "Naomi Horne",
      email: "naomihorne@equicom.com",
      phone: "(951) 599-2186",
      geoInfo: {
        latitude: -77.750824,
        longitude: -179.512601,
      },
      connectionInfo: {
        type: "sameGeoInfo",
        confidence: 0.4,
      },
      combinedConnectionInfo: {
        types: ["sameGeoInfo"],
        confidence: 0.4,
      },
    },
    {
      id: "5c868b9be2cabfda9cfc0569",
      age: 38,
      name: "Booker Castillo",
      email: "bookercastillo@equicom.com",
      phone: "(916) 442-2364",
      geoInfo: {
        latitude: -81.845732,
        longitude: 36.720565,
      },
      connectionInfo: {
        type: "samePhoneNumber",
        confidence: 1,
      },
      combinedConnectionInfo: {
        types: ["sameGeoInfo", "samePhoneNumber"],
        confidence: 0.4,
      },
    },
  ],
  1: [
    {
      id: "5c868b9b89b9aadcd89bef44",
      age: 37,
      name: "Hendricks Gregory",
      email: "hendricksgregory@equicom.com",
      phone: "(916) 442-2364",
      geoInfo: {
        latitude: -77.750824,
        longitude: -179.512601,
      },
    },
    {
      id: "5c868b9be2cabfda9cfc0569",
      age: 38,
      name: "Booker Castillo",
      email: "bookercastillo@equicom.com",
      phone: "(916) 442-2364",
      geoInfo: {
        latitude: -81.845732,
        longitude: 36.720565,
      },
      connectionInfo: {
        type: "samePhoneNumber",
        confidence: 1,
      },
      combinedConnectionInfo: {
        types: ["samePhoneNumber"],
        confidence: 1,
      },
    },
  ],
};
