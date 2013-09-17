# Why this over others?
* Simple learning platform
* Host your own and roll your own environment
* No nasty installs required, just put it on any web server.
* Easy to maintain and open source
* No data is stored on the server, all data is stored in your browser localStorage (In your browser)

# Why not use this over others?
* Lack of realism & details
* uses stale data (1 day old)
* No commission charge included in transactions
* No taxes taken into account
* No dividends calculated

# Getting started (Node)
* Install NodeJS & git -- http://nodejs.org & http://git-scm.com/
* Clone this repo ``git clone https://github.com/JohnMcLear/paperTrader.git``
* Install connect ``cd paperTrader`` ``npm install connect``
* Run server.js ``node server.js``
* In your web browser visit ``http://localhost:8080/``
* Begin trading.  Trading data is stored in local Storage so it will persist over time.

# Getting started (Apache)
* put all of the files from this repository in a folder on apache
* Visit the folder in your web browser IE http://myApache/trader

# Screen shot

![alt text](https://raw.github.com/JohnMcLear/paperTrader/master/img/screenshot.png "Screenshot")

# Where does the data come from?
* We do JSON API requests to Yahoo's finance API, you can't do this from file:// so don't even try it.