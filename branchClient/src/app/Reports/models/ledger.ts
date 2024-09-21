export interface Iledger {
    vno:  string | null;
    tdate: string | null;
    type: string | null;
    narr: string | null;
    quantity: number;
    rate: number | null;
    debit: number | null;
    credit: number | null;
    commission: number | null;
    balance: number | null;
    totalBalance: number | null;
}