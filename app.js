const path = require('path');
require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const SequelizeStore = require("connect-session-sequelize")(session.Store); //session handler for MariaDB
const sequelize = require('./util/database');
const flash = require('connect-flash');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

const errorController = require('./controllers/error');
const isAuth = require('./public/js/is-auth');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');
//at first it was routes before session followed by flash
//second it's session then flash then routes

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: "keyboard cat",
    store: new SequelizeStore({db: sequelize,}),
    resave: false,
    saveUninitialized:false //Don't resave on every request if it doesn't need to be saved.
  })
);
app.use(flash())

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const restAPI = require('./routes/rest');
const auth = require('./routes/authentication');


app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findByPk(req.session.user.id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

//middlewares to check authentication and supertypes and setting response local variables accordingly.
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});

app.use((req, res, next) => {
  res.locals.isSuper = req.session.isSuper;
  next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(restAPI);
app.use(auth);
app.use(errorController.get404);

//How models connect to each other
Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
Cart.belongsToMany(Product, {through: CartItem});
Product.belongsToMany(Cart, {through: CartItem});
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, {through: OrderItem});


sequelize
  .sync()
  .then(result => {
    app.listen(8000);
  })
  .catch(err => {
    console.log(err);
  });
