const express = require('express');
const multer = require('multer');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const authCtrl = require('../controllers/authController');
const reviewCtrl = require('../controllers/reviewController');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024 } }); // 1MB

// Auth routes
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.get('/auth/me', authenticate, authCtrl.getMe);
router.put('/auth/profile', authenticate, authCtrl.updateProfile);
router.put('/auth/change-password', authenticate, authCtrl.changePassword);

// Review routes
router.get('/reviews', authenticate, reviewCtrl.getReviews);
router.post('/reviews', authenticate, reviewCtrl.submitReview);
router.post('/reviews/upload', authenticate, upload.single('file'), reviewCtrl.submitFileReview);
router.get('/reviews/stats', authenticate, reviewCtrl.getStats);
router.get('/reviews/:id', authenticate, reviewCtrl.getReview);
router.delete('/reviews/:id', authenticate, reviewCtrl.deleteReview);

module.exports = router;
