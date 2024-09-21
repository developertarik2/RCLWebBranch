export interface IChargeReceiveDet {
    chargeReceives: IChargeReceiveDetList[] | null;
    yname1: string | null;
    yname2: string | null;
    yname3: string | null;
    year1: number | null;
    year2: number | null;
    year3: number | null;
    totalAmount: number | null;
}

export interface IChargeReceiveDetList {
    name: string | null;
    mR_NO: string | null;
    rcode: string | null;
    fISCAL: string | null;
    amount: number;
    y2: number;
    y3: number;
    y4: number;
    date: string | null;
}