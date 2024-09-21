export interface ICdblChargeYear{
    thisYears:IThisYear[],
    nextYears:INextYear[]
}


export interface IThisYear{
    text:string,
    value:string
}

export interface INextYear{
    text:string,
    value:string
}