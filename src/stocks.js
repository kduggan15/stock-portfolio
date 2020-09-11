import React, { Component } from "react";

class Stocks extends Component{

  constructor(props){
    super(props);
    this.createStock=this.createStock.bind(this)
  }

  createStock(stock){
    return <li key={stock.key}>{stock.quantity} units of {stock.ticker} at {stock.price}</li>
  }

  render(){
    var stocks=this.props.entries.map(this.createStock)
    return(
      <ul className="stockList">
        {stocks}
      </ul>
    );
  }

}

export default Stocks;
