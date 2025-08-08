const userRoutes = require('../routes/userRoute');
const categoryRoutes = require('../routes/categoryRoute');
const productRoutes = require('../routes/productRoute');
const authRoutes = require('../routes/authRoute');
const cartRoutes = require('../routes/cartRoute');
const orderRoutes = require('../routes/orderRoute');

class RouteProvider {
    static registerRoutes(app) {
        app.use('/auth', authRoutes);
        app.use('/users', userRoutes);
        app.use('/category', categoryRoutes);
        app.use('/product', productRoutes);
        app.use('/cart', cartRoutes);
        app.use('/order', orderRoutes);
        console.log("Routes registered");
    }
}

module.exports = RouteProvider;
