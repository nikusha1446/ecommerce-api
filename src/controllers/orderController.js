import prisma from '../config/prisma.js';
import stripe from '../config/stripe.js';

export const createCheckout = async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await prisma.cart.findUnique({
      where: {
        userId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
    }

    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${item.product.name}. Only ${item.product.stock} available.`,
        });
      }
    }

    const total = cart.items.reduce(
      (sum, item) => sum + item.quantity * parseFloat(item.product.price),
      0
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'usd',
      metadata: {
        userId,
        cartId: cart.id,
      },
    });

    const order = await prisma.order.create({
      data: {
        userId,
        total,
        status: 'PENDING',
        paymentIntent: paymentIntent.id,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Checkout session created',
      data: {
        clientSecret: paymentIntent.client_secret,
        order,
      },
    });
  } catch (error) {
    console.error('Create checkout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
