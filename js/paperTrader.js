var stock = {}, portfolio = {}, YAHOO = {};

$(document).ready(function(){

  $("#symbolSearch").keyup(function(){
    stock.symbolSearch($("#symbolSearch").val());
  });

  $("#symbolSearch").keyup(function(){
    stock.query($("#symbolSearch").val());
  });
  
  $("#amount").keyup(function(){
    var quote = $("#amount").val() * $("#price").val();
    $("#quote").val(quote);
  });
  
  $("#buy").click(function(e){
    stock.buy($("#symbolSearch").val(), $("#amount").val(), $("#price").val(), $("#quote").val());
	e.preventDefault(); // prevents default
    return false; 
  });
      
  $("#portfolio").on("click", ".sell", function(){
    stock.sell($(this).data("key"), ($(this).data("currentprice")));
	$(this).parent().hide(); // Hide the Row
  });
  
  $("#symbolSuggest").on("click", "#symbolSuggestTable > tr", function(){
    stock.query($(this).data("symbol"));
    $("#symbolSearch").val($(this).data("symbol"));
	$("#symbolSuggest").hide();
  }); 

  portfolio.database = JSON.parse(localStorage.getItem('paperTrader')) || {};
  console.log("Loaded database", portfolio.database);
  portfolio.list();
  
});

YAHOO.Finance = {}, YAHOO.Finance.SymbolSuggest = {};

YAHOO.Finance.SymbolSuggest.ssCallback = function(data){
  $("#symbolSuggest").show();
  $("#symbolSuggestTable").html("");
  $.each(data.ResultSet.Result, function(key){
    var symbol = data.ResultSet.Result[key].symbol;
	var name = data.ResultSet.Result[key].name;
	$("#symbolSuggestTable").append("<tr data-symbol='"+symbol+"'><td class='symbolSelector'>"+symbol+"</td><td>"+ name + "</td></tr>");
  });
  
}

stock.symbolSearch = function(searchString){
  // Search for a stock symbol from a given search String
  var url = "http://d.yimg.com/autoc.finance.yahoo.com/autoc?query="+searchString+"&callback=YAHOO.Finance.SymbolSuggest.ssCallback";
  $.ajax({ 
    url: url, 
	dataType: 'jsonp'
  });
}

stock.query = function(symbol){
  // Query a stock
  var url = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%3D%22" + symbol + "%22%0A&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=";
  $.getJSON(url, function(data){
    $("#price").val(data.query.results.quote.Ask);
    var quote = $("#amount").val() * $("#price").val();
    $("#quote").val(quote);
	$("#amountContainer").show();
	$("#priceAndTotal").show();
  });
}

stock.buy = function(symbol, amount, price, quote){
  // Buy a stock
  // Add stock data to portfolio
  console.log("Buying ", amount , " of ", symbol, " at " , price, " total quote cost of ", quote);
  var timestamp = new Date().getTime();
  portfolio.database[timestamp] = {
    amount: amount,
	symbol: symbol,
	price: price,
	quote: quote
  }
  localStorage.setItem('paperTrader', JSON.stringify(portfolio.database));
  portfolio.balance();
  portfolio.value();
  portfolio.list();
}

stock.sell = function(key, price){
  // Sell a stock
  // Flag stock data from portfolio as SOLD
  // console.log("Selling ", key, price);
  portfolio.database[key].sold = {};
  portfolio.database[key].sold.date = new Date().getTime();
  portfolio.database[key].sold.price = price;
  portfolio.balance();
  portfolio.value();
  localStorage.setItem('paperTrader', JSON.stringify(portfolio.database)); // Finally save
}

portfolio.list = function(){
  // Nuke it first.
  $("#stocks").html("");
  // Get how much each stock has changed first..
  $.each(portfolio.database, function(key){
    console.log(portfolio.database);
    if(portfolio.database[key].sold){ return true; } // Skip sold shares
    var url = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%3D%22" + portfolio.database[key].symbol + "%22%0A&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=";
    $.getJSON(url, function(data){
	  portfolio.database[key].movement = data.query.results.quote.Ask - portfolio.database[key].price;
	  portfolio.database[key].overallMovement = (data.query.results.quote.Ask *  portfolio.database[key].amount) - (portfolio.database[key].price * portfolio.database[key].amount);
	  portfolio.database[key].value = portfolio.database[key].price * portfolio.database[key].amount;
	  portfolio.database[key].currentPrice = data.query.results.quote.Ask;
      $("#stocks").append("<tr><td>"+ portfolio.database[key].symbol+ "</td>\
	  <td>"+ portfolio.database[key].amount+ "</td>\
  	  <td>"+ portfolio.database[key].price+ "</td>\
	  <td class='currentPrice'>"+ portfolio.database[key].currentPrice+ "</td>\
	  <td>"+ portfolio.database[key].movement.toFixed(2)+ "</td>\
	  <td>"+ portfolio.database[key].overallMovement.toFixed(2)+ "</td>\
	  <td>"+ portfolio.database[key].value.toFixed(2)+ "</td>\
	  <td class='sell' data-key="+key+" data-currentprice="+portfolio.database[key].currentPrice+">Sell</td></tr>");
	  portfolio.balance();
	  portfolio.value();
	});
  });
  
}

portfolio.value = function(){
  // Calculate the value of a portfolio
  var portValue = 0;
  // Get value of portfolio
  $.each(portfolio.database, function(key){
    if(portfolio.database[key].sold){ return true; }
    var valueOfStock = portfolio.database[key].amount * portfolio.database[key].currentPrice;
	portValue = portValue + valueOfStock;

  });  
  // console.log("portValue", portValue);
  $("#value").val(portValue.toFixed(2));
}

portfolio.balance = function(){
  // The balance available to spend on stocks/shares
  var purchases = 0;
  var sales = 0;
  $.each(portfolio.database, function(key){ // for each purchase
	purchases += portfolio.database[key].price * portfolio.database[key].amount;
  }); 
  $.each(portfolio.database, function(key){
    if (portfolio.database[key].sold){
	  sales += portfolio.database[key].sold.price * portfolio.database[key].amount;
	}
  }); 
  var profitLoss = sales - purchases; 
  var balance = 10000 + profitLoss;
  $("#balance").val(balance.toFixed(2));
}