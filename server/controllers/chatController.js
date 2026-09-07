const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const { aesEncrypt, aesDecrypt } = require('../utils/crypto/cryptoUtils');
const { JWT_SECRET } = require('../config/config');

const CHAT_KEY = process.env.CHAT_AES_KEY || JWT_SECRET || 'SecureVault_Default_Chat_Key_2024!';

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
        return {
          ...msg.toObject(),
          message: plaintext.toString(),
          decrypted: true,
          algorithm: 'AES-256-CBC',
        };
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
    const receiverId = req.body.receiverId || req.body.recipientId;
    const { message } = req.body;
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

    const payload = {
      _id: chatMsg._id,
      senderId: req.user._id,
      receiverId,
      message,
      iv,
      encryptedMessage: encryptedData,
      decrypted: true,
      algorithm: 'AES-256-CBC',
      createdAt: chatMsg.createdAt,
    };

    // Real-time delivery via socket
    if (req.app.get('io')) {
      req.app.get('io').to(receiverId.toString()).emit('new-message', {
        ...payload,
        senderName: req.user.name,
      });
    }

    res.status(201).json({
      success: true,
      data: payload,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
