declare module 'coinselect' {
  interface SelectResult<I = any, O = any> {
    inputs?: I[]
    outputs?: O[]
    fee: number
  }

  function coinSelect<I = any, O = any>(inputs: I[], outputs: O[], feeRate: number): SelectResult<I, O>;
  export = coinSelect;
}
