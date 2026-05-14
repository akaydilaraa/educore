const mongoose = require('mongoose');

const guidanceNoteSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    notes: { type: String, required: true },
    mood: { type: String, enum: ['Mutlu', 'Kaygılı', 'Odaklanmış', 'Motivasyonu Düşük', 'Belirtilmemiş'], default: 'Belirtilmemiş' },
    authorType: { type: String, enum: ['Öğretmen', 'Rehberlik'], default: 'Öğretmen' },
    date: { type: Date, default: Date.now },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('GuidanceNote', guidanceNoteSchema);
