const express = require('express');
const path = require('path');
const db = require('./config/connection');
const routes = require('./routes');
const { ApolloServer } = require('apollo-server-express');
const { resolvers, typeDefs } = require("./schemas/index")
const { authMiddleware } = require("./utils/auth")
const app = express();
const PORT = process.env.PORT || 3001;



const server = new ApolloServer({
  resolvers,
  typeDefs,
 context: authMiddleware,

});
app.use(express.urlencoded({extended: false}));
app.use(express.json());
// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === "production") {
}
app.use(express.static(path.join(__dirname, "../client/build")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});


const startApolloServer = async () => {
  await server.start();
  server.applyMiddleware({ app });
};


startApolloServer().then(() => {
  db.once("open", () => {
    app.listen(PORT, () => {
      console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    });
  });
});

