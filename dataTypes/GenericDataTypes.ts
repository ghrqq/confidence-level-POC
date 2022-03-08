export interface Entry {
  id: TransactionId["transactionId"];
  age: number;
  name: string;
  email: string;
  phone: string;
  connectionInfo?: {
    type: string;
    confidence: number;
  };
  geoInfo: {
    latitude: number;
    longitude: number;
  };
  children?: Array<Entry>;
}

export interface EntryWithCombinedConnectionInfo extends Entry {
  combinedConnectionInfo: {
    types: string[];
    confidence: number;
  };
}

/**
 * This class currently does not do much. But it is useful to have for future implementations.
 */
export class TransactionId {
  transactionId: string;
  matcher: RegExp;
  constructor(transactionId: string) {
    this.transactionId = transactionId;
    this.matcher = /^[0-9a-fA-F]{24}$/;
  }
  validate() {
    return this.matcher.test(this.transactionId);
  }
}
