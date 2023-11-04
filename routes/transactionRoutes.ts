import { ErrorCodes } from "../errorMessages";
import {
  TransactionId,
  Entry,
  EntryWithCombinedConnectionInfo,
} from "../dataTypes/GenericDataTypes";
import {
  combinedConnectionInfoAdder,
  dataFlattener,
  fieldRemover,
  findByTransactionId,
  requestValidator,
} from "../helpers/transactionRouteHelpers";
import { Request, Response } from "express";

import data from "../test-data_072020.json";

/**
 *
 * @param req
 * @param res
 * @returns
 */
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const { transactionId, confidenceLevel } = req.query;
    const newTransactionId = new TransactionId(transactionId.toString());

    // Validate input before sending an actual query.
    const validationResult = requestValidator(newTransactionId.validate())(
      confidenceLevel as unknown as number
    );
    if (validationResult.errorsFound > 0) {
      res.status(400).send(validationResult.errorMessages);
    }

    // Replace it with the real DB query.
    const items: Entry[] = await findByTransactionId({
      id: newTransactionId.transactionId,
    })(data);

    // Check if query returns any items.
    if (!items || !Array.isArray(items) || items.length <= 0) {
      res.status(400).send(ErrorCodes.notFound);
    }

    // Result should be flattened.
    const flattenedData: Entry[] = dataFlattener(items).filter(
      (i) =>
        i.connectionInfo === undefined ||
        i.connectionInfo.confidence >= confidenceLevel
    );

    // We don't want to have children key in the final data.
    // As we are not fetching a new data everytime, we should create a copy of the original variable to be able to safely mutate it.
    const reducedData: Entry[] = fieldRemover(flattenedData, ["children"]);

    // Add combinedConnectionInfo key.
    const finalData: EntryWithCombinedConnectionInfo[] =
      combinedConnectionInfoAdder(reducedData);

    res.status(200).send(finalData);
  } catch (error) {
    res.status(400).send(error.message);
  }
};
