'use strict';

/**
 * order controller
 */

const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::order.order', ({ strapi }) => ({
    async createPaymentIntent(ctx) {
        const { cart } = ctx.request.body;
        let games = []

        await Promise.all(
            cart?.map(async (game) => {
                const validatedGame = await strapi.entityService.findOne('api::game.game', game.id, {
                    filters: {
                        id: game.id
                    }
                })

                if (validatedGame) {
                    games.push(validatedGame);
                }
            })
        );

        if (!games.length) {
            ctx.response.status = 404;
            return {
                error: "No valid games found!"
            }
        }

        const total = games.reduce((acc, game) => {
            return acc + game.price;
        }, 0);

        if (total === 0) {
            return {
                freeGames: true
            }
        }

        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: total * 100,
                currency: 'usd',
                metadata: { integration_check: 'accept_a_payment' }
            });
            return paymentIntent;
        } catch (err) {
            return {
                error: err.raw.message
            }
        }
    }
}));