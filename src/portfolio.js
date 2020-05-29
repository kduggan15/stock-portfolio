import React, {Component} from "react";
import Transaction from "./transaction"
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
      stocks       : {}// {ticker:quantity}
    }
    this.addTransaction  = this.addTransaction.bind(this);
    this.priceRequest    = this.priceRequest.bind(this);
    this.viewSummary     = this.viewSummary.bind(this);
    this.viewTransaction = this.viewTransaction.bind(this);
  }

  viewSummary(){
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
          ticker: this._inputTicker.value,
          amount: this._inputAmount.value,
          price: aPrice,
          key: Date.now()
        }

        this.setState((prevState)=>{
          return {
            transactions: prevState.transactions.concat(newTrans),
            cash:(prevState.cash-cost).toFixed(2)
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
        <div className="transacitonPage">

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
    else if(this.state.page === "portfolio"){
      return(
        <div className = "summaryPage">
          <form>
            <button type="button" onClick={this.viewSummary} disabled>Portfolio</button>
            <button type="button" onClick={this.viewTransaction} >Transactions</button>
          </form>
        </div>
      );
    }
  }
}

export default Portfolio;
