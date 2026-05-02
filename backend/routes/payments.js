import { Router } from 'express';
import Stripe from 'stripe';
import { query } from '../config/db.js';
import { verifyToken, loadUser } from '../middleware/auth.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = Router();

router.post('/create-checkout-session', verifyToken, loadUser, async (req, res) => {
  try {
    const { ticket_id } = req.body;
    const ticketResult = await query('SELECT * FROM tickets WHERE id = $1', [ticket_id]);
    if (!ticketResult.rows.length) return res.status(404).json({ error: 'Ticket not found' });
    const ticket = ticketResult.rows[0];

    const dossierResult = await query('SELECT client_id FROM dossiers WHERE id = $1', [ticket.dossier_id]);
    if (!dossierResult.rows.length || dossierResult.rows[0].client_id !== req.user.dbUser.id) {
      return res.status(403).json({ error: 'Forbidden' });
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
    await query('UPDATE tickets SET status = $1 WHERE id = $2', ['paid', ticket_id]);
    await query(
      'INSERT INTO payments (ticket_id, stripe_session_id, amount, status, created_at) VALUES ($1, $2, $3, $4, NOW())',
      [ticket_id, session.id, session.amount_total / 100, 'completed']
    );
  }
  res.json({ received: true });
});

router.get('/', verifyToken, loadUser, async (req, res) => {
  try {
    let sql = 'SELECT * FROM payments';
    let params = [];
    if (req.user.role === 'client') {
      sql = `SELECT p.* FROM payments p
             JOIN tickets t ON p.ticket_id = t.id
             JOIN dossiers d ON t.dossier_id = d.id
             WHERE d.client_id = $1`;
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
