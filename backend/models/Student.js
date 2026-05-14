const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    class: { type: String, required: true },
    absenteeism: { type: Number, default: 0 }, // Devamsızlık
    parentInfo: {
        name: String,
        phone: String,
        email: String
    }, // Veli bilgileri
    examResults: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ExamResult' }],
    guidanceNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GuidanceNote' }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Student', studentSchema);