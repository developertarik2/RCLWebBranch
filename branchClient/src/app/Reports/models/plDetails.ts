import { IPOShareList } from "./ipoShare";
import { IPlDetailList } from "./plTrading";

export interface IPortfolioDetails {
    plDetailList: IPlDetailList[];
    fromDate: string;
    toDate: string;
    boughtCost: number;
    soldCost: number;
    realisedGain_Loss: number;
    balanceAmnt: number;
    marketAmnt: number;
    unrealisedGain: number;
    iPOShareLists: IPOShareList[] | null;
    bonusShareLists: IPOShareList[]| null;
    rightShareLists: IPOShareList[] | null;
    openingShareBal: number | null;
    ledgerBal: number | null;
    portfolioValueMarket: number | null;
    portfolioValueCost: number | null;
    deposit: number | null;
    withdrawnAmount: number | null;
    charges: number | null;
    netDeposit: number | null;
    realisedCapitalGainLoss: number | null;
}