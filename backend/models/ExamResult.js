const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    turkishNet: { type: Number, default: 0 },
    mathNet: { type: Number, default: 0 },
    scienceNet: { type: Number, default: 0 },
    socialNet: { type: Number, default: 0 },
    examDate: { type: Date, required: true },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ExamResult', examResultSchema);
