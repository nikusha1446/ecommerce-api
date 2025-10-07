import prisma from '../config/prisma.js';

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide productId and quantity',
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0',
      });
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`,
      });
    }

    let cart = await prisma.cart.findUnique({
      where: {
        userId,
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
        },
      });
    }

    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    let cartItem;

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;

      if (product.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available in stock`,
        });
      }

      cartItem = await prisma.cartItem.update({
        where: {
          id: existingCartItem.id,
        },
        data: {
          quantity: newQuantity,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              imageUrl: true,
            },
          },
        },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              imageUrl: true,
            },
          },
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product added to cart',
      data: {
        cartItem,
      },
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
