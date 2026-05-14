require("dotenv").config();
const mongoose = require("mongoose");

const express = require("express");
const cors = require("cors");

//Modelleri ekleyeceğim bu kısma

const Student = require("./models/Student");
const ExamResult = require("./models/ExamResult");
const GuidanceNote = require("./models/GuidanceNote");
const app = express();

app.use(cors());
app.use(express.json());

//API leri buraya ekleyeceğim

//Öğrenci işlemleri

app.post("/students", async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.status(201).json(student);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.put("/students/:id", async (req, res) => {
    try {
        const ogrenciGuncelleme = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(ogrenciGuncelleme);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.delete("/students/:id", async (req, res) => {
    try {
        const ogrenciSilme = await Student.findByIdAndDelete(req.params.id);

        res.json({ message: "Öğrenci silindi" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get("/students", async (req, res) => {
    try {
        const students = await Student.find()
            .populate("examResults")
            .populate("guidanceNotes");
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get("/students/:id", async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate("examResults")
            .populate("guidanceNotes");
        if (!student) return res.status(404).json({ message: "Öğrenci bulunamadı" });
        res.json(student);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Analiz Rotası
app.get("/api/students/:id/analysis", async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate("examResults");
        if (!student) return res.status(404).json({ message: "Öğrenci bulunamadı" });

        const results = student.examResults;
        
        if (results.length === 0) {
            return res.json({ message: "Analiz için henüz sınav verisi yok.", warning: false, weak_point: null });
        }

        // Sınavları tarihe göre sırala (en yeniden en eskiye)
        const sortedResults = results.sort((a, b) => new Date(b.examDate) - new Date(a.examDate));
        const latestExam = sortedResults[0];
        
        // Zayıf yönü bul (son sınavdaki en düşük net)
        const subjects = {
            "Türkçe": latestExam.turkishNet,
            "Matematik": latestExam.mathNet,
            "Fen Bilimleri": latestExam.scienceNet,
            "Sosyal Bilgiler": latestExam.socialNet
        };
        
        const weak_point = Object.keys(subjects).reduce((a, b) => subjects[a] < subjects[b] ? a : b);
        
        let warning = false;
        let dropDetails = []; // Hangi derslerde düşüş var?

        // Eğer en az 2 sınav varsa karşılaştırma yap
        if (sortedResults.length > 1) {
            const previousExam = sortedResults[1];
            
            if (latestExam.turkishNet < previousExam.turkishNet) dropDetails.push("Türkçe");
            if (latestExam.mathNet < previousExam.mathNet) dropDetails.push("Matematik");
            if (latestExam.scienceNet < previousExam.scienceNet) dropDetails.push("Fen Bilimleri");
            if (latestExam.socialNet < previousExam.socialNet) dropDetails.push("Sosyal Bilgiler");
            
            if (dropDetails.length > 0) {
                warning = true;
            }
        }

        res.json({
            warning: warning,
            weak_point: weak_point,
            dropDetails: dropDetails,
            totalExamsAnalyzed: sortedResults.length
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Sınav Sonucu Ekleme
app.post("/exam-results", async (req, res) => {
    try {
        const examResult = new ExamResult(req.body);
        await examResult.save();
        
        // Öğrencinin examResults dizisine sonucun ID'sini ekle
        await Student.findByIdAndUpdate(examResult.student, {
            $push: { examResults: examResult._id }
        });
        
        res.status(201).json(examResult);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Sınav Sonucu Güncelleme
app.put("/exam-results/:id", async (req, res) => {
    try {
        const updatedExam = await ExamResult.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedExam);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Rehberlik Notu Ekleme
app.post("/guidance-notes", async (req, res) => {
    try {
        const guidanceNote = new GuidanceNote(req.body);
        await guidanceNote.save();
        
        // Öğrencinin guidanceNotes dizisine notun ID'sini ekle
        await Student.findByIdAndUpdate(guidanceNote.student, {
            $push: { guidanceNotes: guidanceNote._id }
        });
        
        res.status(201).json(guidanceNote);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Tüm Rehberlik Notlarını Getirme (Feed için)
app.get("/guidance-notes", async (req, res) => {
    try {
        const notes = await GuidanceNote.find()
            .populate({
                path: 'student',
                populate: { path: 'examResults' }
            })
            .sort({ date: -1, createdAt: -1 });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


app.get("/", (req, res) => {
    res.send("Educor Backend Çalışıyor");
});

const PORT = 5000;


mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB bağli"))
.catch((err) => console.log(err));


app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
});