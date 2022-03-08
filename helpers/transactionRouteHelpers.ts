import { ErrorCodes } from "../errorMessages";
import {
  Entry,
  EntryWithCombinedConnectionInfo,
  TransactionId,
} from "../dataTypes/GenericDataTypes";

/**
 * Flattens the given array of objects but does NOT remove flattened child elements.
 * @param nestedDataArray
 * @returns flattened array
 */
export const dataFlattener = (nestedDataArray: any[]) => {
  let result: any[] = [];
  nestedDataArray.forEach((element: any) => {
    result.push(element);
    if (Array.isArray(element.children)) {
      result = result.concat(dataFlattener(element.children));
    }
  });
  return result;
};

/**
 * A generic filter applier. It filters given data against given parameters. Looks for an exact match.
 * @param data Array of objects
 * @param filter Filter object. Key must be the key to be checked and value must be the value to be checked.
 * @returns Filtered data as an Array.
 */
const filterApplier = (data: any[], filter: object) => {
  const result = data.filter(search, filter);

  // Arrow functions doesn't have binding for this keyword.
  function search(element: any) {
    return Object.keys(this).every((key) => element[key] === this[key]);
  }

  return result;
};

/**
 * Currently this function has no real purpose. What it does can be easily achieved without this function. Yet, it stays here in case in the future it's necessary to add some additional functions before returning the data.
 * @param query
 * @returns
 */
export const findByTransactionId = (query: object) => (data: any[]) => {
  return filterApplier(dataFlattener(data), query);
};

/**
 *
 * @param arr Array of objects to be iterated.
 * @param fields Array of strings. Keys to be iterated and removed one by one.
 * @returns
 */
export const fieldRemover = (arr: {}[], fields: string[]) => {
  const newArr = JSON.parse(JSON.stringify(arr));
  newArr.forEach((item: {}) => {
    fields.forEach((field) => {
      delete item[field as keyof typeof item];
    });
  });
  return newArr;
};

/**
 * Iterates through the result and adds combinedConnectionInfo field.
 * As combinedConnectionInfo only added to children of an entry, we start iterating from index 0 but do not engage the index 0. Basically, every index handles the entry after itself.
 * @param arr
 * @returns
 */
export const combinedConnectionInfoAdder = (
  arr: (any | EntryWithCombinedConnectionInfo)[]
) => {
  for (let i = 0; i < arr.length - 1; i++) {
    const combinedConnectionInfo: {
      types: string[];
      confidence: number;
    } = {
      types:
        arr[i].connectionInfo && arr[i].connectionInfo.type
          ? [arr[i].connectionInfo.type]
          : [],
      confidence:
        arr[i].connectionInfo && arr[i].connectionInfo.confidence
          ? arr[i].combinedConnectionInfo.confidence
          : 1,
    };

    combinedConnectionInfo.types.push(arr[i + 1].connectionInfo.type);
    combinedConnectionInfo.confidence =
      combinedConnectionInfo.confidence * arr[i + 1].connectionInfo.confidence;
    Object.assign(arr[i + 1], { combinedConnectionInfo });
  }
  return arr;
};

/**
 *
 * @param transactionId
 * @returns
 */
export const requestValidator =
  (isTransactionIdValid: boolean) => (confidenceLevel: number) => {
    const combinedErrorCodes: {
      errorsFound: number;
      errorMessages: string[];
    } = {
      errorsFound: 0,
      errorMessages: [],
    };

    if (!isTransactionIdValid) {
      combinedErrorCodes.errorMessages.push(ErrorCodes.invalidTransactionId);
      combinedErrorCodes.errorsFound += 1;
    }
    if (
      !confidenceLevel ||
      isNaN(confidenceLevel) ||
      confidenceLevel > 1 ||
      confidenceLevel < 0
    ) {
      combinedErrorCodes.errorMessages.push(ErrorCodes.invalidConfidenceLevel);
      combinedErrorCodes.errorsFound += 1;
    }
    return combinedErrorCodes;
  };
