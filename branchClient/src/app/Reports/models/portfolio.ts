

export interface IClientPortfolio {
    companyLists: IPortfolioCompany[] | null;
    totalBuyCost: number | null;
    marketVal: number | null;
    maturedBal: number | null;
    equityBal: number | null;
    saleRec: number | null;
    ledgerBal: number | null;
    rglBal: number | null;
    accruedBal: number | null;
    unrealiseBal: number | null;
    chargeFee: number | null;
    totalCapital: number | null;
}



export interface IPortfolioCompany {
    sl:number;
    firmsnm1: string | null;
    quantity: number | null;
    slbqty: number | null;
    pldqty: number | null;
    rate: number | null;
    amount: number | null;
    mktrt: number | null;
    mktamt: number | null;
    grp: number | null;
}