'use strict';

/**
 * order controller
 */

const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const { createCoreController } = require('@strapi/strapi').factories;
const { sanitizeEntity } = require('@strapi/utils');
const orderTemplate = require('../../../../config/email-templates/order');

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
                metadata: {
                    cart: JSON.stringify(cart.map((game) => ({
                        id: game.id
                    })))
                }
            });
            return paymentIntent;
        } catch (err) {
            return {
                error: err.raw.message
            }
        }
    },
    async create(ctx) {
        const { cart, paymentIntentId, paymentMethod } = ctx.request.body;

        const token = await strapi.plugins["users-permissions"].services.jwt.getToken(ctx);

        const userId = token.id;

        const userInfo = await strapi.db.query('plugin::users-permissions.user').findOne({
            where: { id: userId }
        });

        const cartGamesIds = await cart.map((game) => ({
            id: game.id,
        }));

        let games = [];

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

        const total_in_cents = games.reduce((acc, game) => {
            return (acc + game.price) * 100;
        }, 0);

        let paymentInfo;

        if (total_in_cents !== 0) {
            try {
                paymentInfo = await stripe.paymentMethods.retrieve(paymentMethod);
            } catch (err) {
                ctx.response.status = 402;
                return { error: err.message }
            }
        }

        const entry = {
            total_in_cents,
            payment_intent_id: paymentIntentId,
            card_brand: paymentInfo?.card?.brand,
            card_last4: paymentInfo?.card?.last4,
            user: userInfo,
            games,
        };

        const entity = await strapi.entityService.create('api::order.order', {
            data: {
                total_in_cents,
                payment_intent_id: paymentIntentId,
                card_brand: paymentInfo?.card?.brand,
                card_last4: paymentInfo?.card?.last4,
                games,
                user: userInfo
            },
        });

        await strapi.plugins['email'].services.email.sendTemplatedEmail(
            {
                to: userInfo.email,
                from: 'no-reply@wongames.com'
            },
            orderTemplate,
            {
                user: userInfo,
                payment: {
                    total: `$ ${total_in_cents / 100}`,
                    card_brand: entry.card_brand,
                    card_last4: entry.card_last4
                },
                games
            }
        )

        return sanitizeEntity(entity, { model: strapi.models.order });
    }
}));
