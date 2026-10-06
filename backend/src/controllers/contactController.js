import Store from '../services/store.js';

// @desc    Submit customer contact / inquiry message
// @route   POST /api/contact
const submitMessage = (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required.'
      });
    }

    const saved = Store.saveContactMessage({
      name,
      email,
      phone: phone || '',
      subject: subject || 'General Inquiry',
      message
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out to Mithila Makhana! Our family team will get in touch with you shortly.',
      data: saved
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all contact messages (Admin)
// @route   GET /api/contact
const getMessages = (req, res, next) => {
  try {
    const messages = Store.getContactMessages();
    res.json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update contact message status (Admin)
// @route   PUT /api/contact/:id
const updateMessageStatus = (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = Store.updateContactStatus(id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.json({
      success: true,
      message: 'Status updated',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

export {
  submitMessage,
  getMessages,
  updateMessageStatus
};
