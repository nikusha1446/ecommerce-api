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
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
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

export const testConfirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide paymentIntentId',
      });
    }

    const confirmedPayment = await stripe.paymentIntents.confirm(
      paymentIntentId,
      {
        payment_method: 'pm_card_visa',
      }
    );

    res.status(200).json({
      success: true,
      message: 'Payment confirmed for testing',
      data: {
        paymentIntent: confirmedPayment,
      },
    });
  } catch (error) {
    console.error('Test confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide paymentIntentId',
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed',
      });
    }

    const order = await prisma.order.findUnique({
      where: {
        paymentIntent: paymentIntentId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Order already processed',
      });
    }

    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: {
            id: item.productId,
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      await tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: 'PROCESSING',
        },
      });

      await tx.cartItem.deleteMany({
        where: {
          cart: {
            userId,
          },
        },
      });
    });

    const updatedOrder = await prisma.order.findUnique({
      where: {
        id: order.id,
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

    res.status(200).json({
      success: true,
      message: 'Payment confirmed and order completed',
      data: {
        order: updatedOrder,
      },
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
