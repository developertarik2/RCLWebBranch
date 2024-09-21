

export interface IClientConfirmation {
    confirmationDetailsList: IConfirmationDetails[] | null;
    ledger: number | null;
    reciept: number | null;
    payment: number | null;
    netAmountTrading: number | null;
    closingBalance: number | null;
}



export interface IConfirmationDetails {
    exch: string | null;
    code: string | null;
    instrument: string | null;
    buyQty: string | null;
    buyAmt: string | null;
    buyRate: string | null;
    saleQty: string | null;
    saleAmt: string | null;
    saleRate: string | null;
    balQty: string | null;
    com_B_S: string | null;
    balance: string | null;
}