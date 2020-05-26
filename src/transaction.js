import React, { Component } from "react";

class Transaction extends Component{

  constructor(props){
    super(props);
    this.createTransaction=this.createTransaction.bind(this)
  }

  createTransaction(trans){
    return <li key={trans.key}> Purchased {trans.amount} stocks of {trans.ticker} at {trans.price}</li>
  }

  render(){
    var trans = this.props.entries.map(this.createTransaction)
    return(
      <ul className="transList">
        {trans}
      </ul>
    )
  }
}

export default Transaction;
