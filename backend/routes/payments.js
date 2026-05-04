import { Router } from 'express';
import Stripe from 'stripe';
import { query } from '../config/db.js';
import { verifyToken, loadUser } from '../middleware/auth.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = Router();

router.post('/create-checkout-session', verifyToken, loadUser, async (req, res) => {
  try {
    if (!req.user.dbUser) {
      return res.status(404).json({ error: 'User not found in database' });
    }
    const { ticket_id } = req.body;
    const ticketResult = await query(
      `SELECT t.*, d.client_id FROM tickets t JOIN dossiers d ON t.dossier_id = d.id WHERE t.id = $1`,
      [ticket_id]
    );
    if (!ticketResult.rows.length) return res.status(404).json({ error: 'Ticket not found' });
    const ticket = ticketResult.rows[0];

    if (ticket.client_id !== req.user.dbUser.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (ticket.status !== 'en_attente_paiement') {
      return res.status(400).json({ error: 'Cette requête ne peut pas être payée' });
    }

    const existingPayment = await query(
      `SELECT * FROM payments WHERE ticket_id = $1 AND status IN ('initie', 'reussi') ORDER BY created_at DESC LIMIT 1`,
      [ticket_id]
    );
    if (existingPayment.rows[0]?.status === 'reussi') {
      return res.status(400).json({ error: 'Cette requête est déjà payée' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'cad',
          product_data: { name: ticket.service_name },
          unit_amount: Math.round(ticket.price * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.origin || 'http://localhost:3000'}/tickets/${ticket_id}?success=true`,
      cancel_url: `${req.headers.origin || 'http://localhost:3000'}/tickets/${ticket_id}?canceled=true`,
      metadata: { ticket_id: String(ticket_id), user_id: String(req.user.dbUser.id) },
    });

    await query(
      `INSERT INTO payments (ticket_id, stripe_session_id, amount, status, created_at)
       VALUES ($1, $2, $3, 'initie', NOW())`,
      [ticket_id, session.id, Number(ticket.price)]
    );

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const ticket_id = session.metadata.ticket_id;
    await query('UPDATE tickets SET status = $1 WHERE id = $2', ['payee', ticket_id]);
    await query(
      `UPDATE payments
       SET status = 'reussi', stripe_payment_intent_id = $1
       WHERE stripe_session_id = $2`,
      [session.payment_intent || null, session.id]
    );
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object;
    await query(
      `UPDATE payments SET status = 'echec' WHERE stripe_session_id = $1 AND status = 'initie'`,
      [session.id]
    );
  }
  res.json({ received: true });
});

router.get('/', verifyToken, loadUser, async (req, res) => {
  try {
    if (!req.user.dbUser) {
      return res.status(404).json({ error: 'User not found in database' });
    }
    let sql = `SELECT p.*, t.service_name, t.dossier_id, d.client_id, t.conseiller_id
               FROM payments p
               JOIN tickets t ON p.ticket_id = t.id
               JOIN dossiers d ON t.dossier_id = d.id`;
    let params = [];
    if (req.user.role === 'client') {
      sql += ` WHERE d.client_id = $1`;
      params = [req.user.dbUser.id];
    } else if (req.user.role === 'conseiller') {
      sql += ` WHERE t.conseiller_id = $1`;
      params = [req.user.dbUser.id];
    }
    sql += ' ORDER BY created_at DESC';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
