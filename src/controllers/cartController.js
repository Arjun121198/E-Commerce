const Cart = require('../models/cart');
const Product = require('../models/product');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class CartController {
  getMyCart = async (req, res) => {
    try {
      const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
      return successResponse(res, 200, 'Cart fetched', cart || { items: [], subtotal: 0 });
    } catch (err) {
      return errorResponse(res, 500, 'Failed to fetch cart', err.message);
    }
  };

  addItem = async (req, res) => {
    try {
      const { product_id, quantity } = req.body;
      const product = await Product.findById(product_id);
      if (!product) {
        return errorResponse(res, 404, 'Product not found');
      }
      const qty = Math.max(1, parseInt(quantity || 1, 10));

      let cart = await Cart.findOne({ user: req.user.id });
      if (!cart) {
        cart = new Cart({ user: req.user.id, items: [], subtotal: 0 });
      }

      const existingIndex = cart.items.findIndex(i => i.product.toString() === product._id.toString());
      if (existingIndex >= 0) {
        cart.items[existingIndex].quantity += qty;
        cart.items[existingIndex].line_total = cart.items[existingIndex].quantity * cart.items[existingIndex].unit_price;
      } else {
        cart.items.push({
          product: product._id,
          quantity: qty,
          unit_price: product.price,
          line_total: qty * product.price
        });
      }

      cart.subtotal = cart.items.reduce((sum, i) => sum + i.line_total, 0);
      await cart.save();
      return successResponse(res, 200, 'Item added to cart', cart);
    } catch (err) {
      return errorResponse(res, 500, 'Failed to add item', err.message);
    }
  };

  updateItem = async (req, res) => {
    try {
      const { product_id, quantity } = req.body;
      const qty = Math.max(0, parseInt(quantity, 10));
      let cart = await Cart.findOne({ user: req.user.id });
      if (!cart) return errorResponse(res, 404, 'Cart not found');

      const index = cart.items.findIndex(i => i.product.toString() === product_id);
      if (index < 0) return errorResponse(res, 404, 'Item not found in cart');

      if (qty === 0) {
        cart.items.splice(index, 1);
      } else {
        cart.items[index].quantity = qty;
        cart.items[index].line_total = qty * cart.items[index].unit_price;
      }

      cart.subtotal = cart.items.reduce((sum, i) => sum + i.line_total, 0);
      await cart.save();
      return successResponse(res, 200, 'Cart updated', cart);
    } catch (err) {
      return errorResponse(res, 500, 'Failed to update cart', err.message);
    }
  };

  clearCart = async (req, res) => {
    try {
      const cart = await Cart.findOne({ user: req.user.id });
      if (!cart) return successResponse(res, 200, 'Cart cleared', { items: [], subtotal: 0 });
      cart.items = [];
      cart.subtotal = 0;
      await cart.save();
      return successResponse(res, 200, 'Cart cleared', cart);
    } catch (err) {
      return errorResponse(res, 500, 'Failed to clear cart', err.message);
    }
  };
}

module.exports = new CartController();