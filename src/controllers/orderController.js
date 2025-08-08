const Cart = require('../models/cart');
const Order = require('../models/order');
const Product = require('../models/product');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class OrderController {
  placeOrder = async (req, res) => {
    try {
      const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
      if (!cart || cart.items.length === 0) {
        return errorResponse(res, 400, 'Cart is empty');
      }

      // Recalculate totals and snapshot product name/image to prevent later changes affecting history
      const items = cart.items.map(i => ({
        product: i.product._id,
        name: i.product.name,
        image: i.product.image,
        quantity: i.quantity,
        unit_price: i.unit_price,
        line_total: i.line_total
      }));

      const order = await Order.create({
        user: req.user.id,
        items,
        subtotal: cart.subtotal
      });

      cart.items = [];
      cart.subtotal = 0;
      await cart.save();

      return successResponse(res, 201, 'Order placed', order);
    } catch (err) {
      return errorResponse(res, 500, 'Failed to place order', err.message);
    }
  };

  myOrders = async (req, res) => {
    try {
      const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
      return successResponse(res, 200, 'Orders fetched', orders);
    } catch (err) {
      return errorResponse(res, 500, 'Failed to fetch orders', err.message);
    }
  };
}

module.exports = new OrderController();