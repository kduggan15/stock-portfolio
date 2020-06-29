import React, {Component} from "react";
import Transaction from "./transaction"
import Stocks from "./stocks"
import "./portfolio.css"

var API_TOKEN = "pk_af0e2d7491e54b8d942ba946002b1588"
var xhr;

class Portfolio extends Component{

  constructor(props){
    super(props);
    this.state={
      page         : "transactions",
      transactions : [],
      cash         : 5000,
      assets       : 0,
      stocks       : {},// {ticker:quantity}
      prices       : {},// {ticker:price}
      stocksEntries: []
    }
    this.addTransaction  = this.addTransaction.bind(this);
    this.priceRequest    = this.priceRequest.bind(this);
    this.viewSummary     = this.viewSummary.bind(this);
    this.viewTransaction = this.viewTransaction.bind(this);
    this.updatePrice     = this.updatePrice.bind(this);
    this.updateStocks    = this.updateStocks.bind(this);
  }

  updatePrice(){
    //[{symbol:ticker,lastSalePrice:$$$},{symbol:ticker,lastSalePrice:$$$}]
    if (xhr.readyState === 4 && xhr.status === 200){
      var response = JSON.parse(xhr.responseText);
      var newPrices={}

      for(var i in response){
        newPrices[response[i].symbol] = response[i].lastSalePrice
      }
      this.setState((prevState)=>{
        return({
          prices:newPrices
        });
      });
    }
    this.updateStocks()
  }

  updateStocks(){
    var tickers = Object.keys(this.state.stocks);
    var assets = 0;
    var entries = tickers.map(key=>{
      assets+=this.state.prices[key]*this.state.stocks[key];
      return {
        'ticker': key,
        'price' : this.state.prices[key],
        'quantity':this.state.stocks[key],
        'key': Date.now()+this.state.prices[key]
      }
    });
    this.setState((prevState)=>{
      return({
        assets:assets,
        stocksEntries:entries
      });
    });
  }

  viewSummary(){
    var tickers="";
    for(var key in this.state.stocks){
      tickers+=key+",";
    }

    xhr=new XMLHttpRequest();
    xhr.open("GET","https://cloud.iexapis.com/stable/tops?token="+API_TOKEN+"&symbols="+tickers,true)
    xhr.send();
    xhr.addEventListener("readystatechange",this.updatePrice, false);

    //This might need to be moved
    this.setState((prevState)=>{
      return {
        page:"summary"
      };
    });
  }

  viewTransaction(){
    this.setState((prevState)=>{
      return {
        page:"transactions"
      };
    });
  }

  priceRequest(){
    var amount = this._inputAmount.value;
    //var ticker = this._inputTicker.value;
    var isWhole=true;
    var validTicker=true;
    var canBuy = true;
    amount = Number(amount)
    if (!Number.isInteger(amount) && amount>0){
      alert('Amount must be a whole number!');
      isWhole=false
    }
    if (xhr.readyState === 4 && xhr.status === 200){
      //alert(xhr.responseText);
      var response = JSON.parse(xhr.responseText);
      //alert(response[0].lastSalePrice);
      validTicker = response[0].lastSalePrice
      var aPrice = response[0].lastSalePrice
      if(!validTicker){
        alert("Error! Is your ticker valid?")
      }
      var cost = amount*aPrice
      if(cost>this.state.cash){
        alert("Not enough cash!")
        canBuy = false;
      }

      if(validTicker && isWhole && canBuy){
        alert('Purchase succesful!');
        var newTrans={
          ticker: response[0].symbol,
          amount: this._inputAmount.value,
          price: aPrice,
          key: Date.now()
        }

        this.setState((prevState)=>{
          var newStocks=prevState.stocks;
          if(newStocks.hasOwnProperty(newTrans.ticker)){
            newStocks[newTrans.ticker] = parseInt(newStocks[newTrans.ticker],10)+ parseInt(newTrans.amount,10);
          }
          else{
            newStocks[newTrans.ticker]=newTrans.amount;
          }
          return {
            transactions: prevState.transactions.concat(newTrans),
            cash:(prevState.cash-cost).toFixed(2),
            stocks:newStocks
          };
        });
      }
    }

    console.log(this.state.transactions);
  }

  addTransaction(e){

    xhr=new XMLHttpRequest();
    xhr.open("GET","https://cloud.iexapis.com/stable/tops?token="+API_TOKEN+"&symbols="+this._inputTicker.value,true)
    xhr.send();
    xhr.addEventListener("readystatechange",this.priceRequest, false);

    e.preventDefault();
  }

  render(){
    if(this.state.page === "transactions"){
      return(
        <div className="transactionPage">

          <form>
            <button type="button" onClick={this.viewSummary}>Portfolio</button>
            <button type="button" onClick={this.viewTransaction} disabled>Transactions</button>
          </form>

          <div className="header">
            <h1>Cash - ${this.state.cash}</h1>
            <form onSubmit={this.addTransaction}>
              <input ref={(a)=>this._inputTicker=a}
                    placeholder="Ticker">
              </input>
              <input ref={(a)=>this._inputAmount=a}
                    placeholder="Amount">
              </input>
              <button type="submit">Buy</button>
            </form>
            <Transaction entries={this.state.transactions}/>
          </div>
        </div>
      );
    }
    else if(this.state.page === "summary"){
      return(
        <div className="summaryPage">
          <form>
            <button type="button" onClick={this.viewSummary} disabled>Portfolio</button>
            <button type="button" onClick={this.viewTransaction} >Transactions</button>
          </form>

          <div className="header">
            <h1>Account Summary</h1>
            <h2>Cash: ${this.state.cash}</h2>
            <h2>Assets: ${this.state.assets}</h2>
            <h2>Account Total: ${Number(this.state.cash) + Number(this.state.assets)}</h2>
            <h1>All assets:</h1>
            <Stocks entries={this.state.stocksEntries}/>
          </div>
        </div>
      );
    }
  }
}

export default Portfolio;
