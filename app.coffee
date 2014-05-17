
###
Module dependencies.
###

require("coffee-script/register")
coffeescript = require('connect-coffee-script')
express = require("express")
routes = require("./routes")
user = require("./routes/user")
http = require("http")
path = require("path")
app = express()

# all environments
app.set "port", process.env.PORT or 3000
app.set "views", __dirname + "/views"
app.set "view engine", "jade"
app.use coffeescript
    src    : "#{__dirname}/public"
    bare: true
app.use express.favicon()
app.use express.logger("dev")
app.use express.bodyParser()
app.use express.methodOverride()
app.use app.router
app.use require("stylus").middleware(__dirname + "/public")
app.use express.static(path.join(__dirname, "public"))


#
# Keep heroku alive
#
startKeepAlive = ->
  setInterval (->
    options =
      host: "macroscalculator.herokuapp.com"
      port: 80
      path: "/"

    # optional logging... disable after it's working
    http.get(options, (res) ->
      res.on "data", (chunk) ->
        try
          console.log "HEROKU RESPONSE: " + chunk
        catch err
          console.log err.message
        return

      return
    ).on "error", (err) ->
      console.log "Error: " + err.message
      return

    return
  ), 20 * 60 * 1000 # load every 20 minutes

# development only
app.use express.errorHandler()  if "development" is app.get("env")
app.get "/", routes.index
http.createServer(app).listen app.get("port"), ->
  console.log "Express server listening on port " + app.get("port")
  startKeepAlive()
  return
