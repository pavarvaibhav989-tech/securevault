const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const { aesEncrypt, aesDecrypt } = require('../utils/crypto/cryptoUtils');
const { JWT_SECRET } = require('../config/config');

const CHAT_KEY = process.env.CHAT_AES_KEY;
if (!CHAT_KEY) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('CHAT_AES_KEY environment variable is required in production.');
  }
  console.warn('[WARN] CHAT_AES_KEY not set. Chat encryption is disabled in dev mode.');
}

// GET /api/chat/users
exports.getChatUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id }, verified: true })
      .select('name email avatar lastLogin')
      .sort({ name: 1 });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/chat/messages/:userId
exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await ChatMessage.find({
      $or: [
        { senderId: req.user._id, receiverId: userId },
        { senderId: userId, receiverId: req.user._id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name avatar')
      .populate('receiverId', 'name avatar');

    // Decrypt messages for display
    const decrypted = messages.map((msg) => {
      try {
        const plaintext = aesDecrypt(msg.encryptedMessage, CHAT_KEY, msg.iv);
        return { ...msg.toObject(), message: plaintext.toString(), decrypted: true };
      } catch {
        return { ...msg.toObject(), message: '[Encrypted]', decrypted: false };
      }
    });

    res.json({ success: true, data: decrypted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/chat/send
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    if (!receiverId || !message) {
      return res.status(400).json({ success: false, message: 'Receiver and message required.' });
    }

    const { iv, encryptedData } = aesEncrypt(Buffer.from(message), CHAT_KEY);

    const chatMsg = await ChatMessage.create({
      senderId: req.user._id,
      receiverId,
      encryptedMessage: encryptedData,
      iv,
    });

    // Real-time delivery via socket
    if (req.app.get('io')) {
      req.app.get('io').to(receiverId).emit('new-message', {
        senderId: req.user._id,
        senderName: req.user.name,
        message,
        timestamp: chatMsg.createdAt,
      });
    }

    res.status(201).json({
      success: true,
      data: { messageId: chatMsg._id, encrypted: true, iv, algorithm: 'AES-256-CBC' },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
