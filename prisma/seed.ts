import { PrismaClient, type ClassLevel } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Pariksha@123";

async function hash(pw: string) {
  return bcrypt.hash(pw, 10);
}

async function main() {
  console.log("Seeding Pariksha Saathi — Surajpur sample data...");

  // ── Wipe (dev-only, order matters for FKs) ──────────────────────────────
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.announcement.deleteMany(),
    prisma.leaderboardStat.deleteMany(),
    prisma.answerCopy.deleteMany(),
    prisma.quizAttempt.deleteMany(),
    prisma.question.deleteMany(),
    prisma.quiz.deleteMany(),
    prisma.olympiadInterest.deleteMany(),
    prisma.olympiad.deleteMany(),
    prisma.doubtBooking.deleteMany(),
    prisma.availabilityException.deleteMany(),
    prisma.teacherAvailability.deleteMany(),
    prisma.classRequest.deleteMany(),
    prisma.careerRoadmap.deleteMany(),
    prisma.examSubscription.deleteMany(),
    prisma.exam.deleteMany(),
    prisma.story.deleteMany(),
    prisma.book.deleteMany(),
    prisma.noteVersion.deleteMany(),
    prisma.note.deleteMany(),
    prisma.brokenLinkReport.deleteMany(),
    prisma.lectureWatchProgress.deleteMany(),
    prisma.lecture.deleteMany(),
    prisma.playlist.deleteMany(),
    prisma.chapter.deleteMany(),
    prisma.subject.deleteMany(),
    prisma.studentStreak.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // ── Users ────────────────────────────────────────────────────────────
  await prisma.user.create({
    data: {
      name: "श्री दीपक वर्मा (नोडल अधिकारी)",
      email: "nodal.officer@surajpur.gov.in",
      mobile: "9876500001",
      passwordHash: await hash(DEMO_PASSWORD),
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  const teacherData = [
    { name: "श्रीमती अंजलि शर्मा", email: "anjali.sharma@surajpur.gov.in", mobile: "9876500002" },
    { name: "श्री रमेश साहू", email: "ramesh.sahu@surajpur.gov.in", mobile: "9876500003" },
    { name: "सुश्री प्रिया पटेल", email: "priya.patel@surajpur.gov.in", mobile: "9876500004" },
  ];
  const teachers = [];
  for (const t of teacherData) {
    teachers.push(
      await prisma.user.create({
        data: { ...t, passwordHash: await hash(DEMO_PASSWORD), role: "TEACHER", isActive: true },
      })
    );
  }
  const [teacherAnjali, teacherRamesh, teacherPriya] = teachers;

  const studentData: { name: string; classLevel: ClassLevel; school: string; block: string }[] = [
    { name: "रवि कुमार", classLevel: "CLASS_10", school: "शासकीय उच्च माध्यमिक विद्यालय, सूरजपुर", block: "सूरजपुर" },
    { name: "अंजलि यादव", classLevel: "CLASS_10", school: "शासकीय कन्या उमा विद्यालय, प्रतापपुर", block: "प्रतापपुर" },
    { name: "सूरज साहू", classLevel: "CLASS_12", school: "शासकीय उच्च माध्यमिक विद्यालय, भैयाथान", block: "भैयाथान" },
    { name: "प्रियंका सिंह", classLevel: "CLASS_12", school: "शासकीय कन्या उमा विद्यालय, ओड़गी", block: "ओड़गी" },
    { name: "आकाश गुप्ता", classLevel: "CLASS_10", school: "शासकीय उमा विद्यालय, रामानुजनगर", block: "रामानुजनगर" },
    { name: "पूजा राजवाड़े", classLevel: "CLASS_10", school: "शासकीय उमा विद्यालय, सूरजपुर", block: "सूरजपुर" },
    { name: "विकास मरावी", classLevel: "CLASS_12", school: "शासकीय उमा विद्यालय, प्रेमनगर", block: "प्रेमनगर" },
    { name: "काजल केरकेट्टा", classLevel: "CLASS_12", school: "शासकीय कन्या उमा विद्यालय, भैयाथान", block: "भैयाथान" },
    { name: "मोहित ध्रुव", classLevel: "CLASS_10", school: "शासकीय उमा विद्यालय, प्रतापपुर", block: "प्रतापपुर" },
    { name: "स्नेहा पैकरा", classLevel: "CLASS_10", school: "शासकीय कन्या उमा विद्यालय, रामानुजनगर", block: "रामानुजनगर" },
  ];
  const students = [];
  for (let i = 0; i < studentData.length; i++) {
    const s = studentData[i];
    students.push(
      await prisma.user.create({
        data: {
          name: s.name,
          email: `student${i + 1}@example.com`,
          mobile: `98765100${String(i + 1).padStart(2, "0")}`,
          passwordHash: await hash(DEMO_PASSWORD),
          role: "STUDENT",
          classLevel: s.classLevel,
          school: s.school,
          block: s.block,
          displayName: s.name.split(" ")[0],
          streak: {
            create: {
              currentStreak: Math.floor(Math.random() * 12),
              longestStreak: Math.floor(Math.random() * 20) + 5,
              xp: Math.floor(Math.random() * 500),
              level: Math.floor(Math.random() * 5) + 1,
            },
          },
        },
      })
    );
  }

  // ── Subjects & Chapters ──────────────────────────────────────────────
  const subjectDefs: { nameHi: string; nameEn: string; classLevel: ClassLevel; colorVar: string; chapters: string[] }[] = [
    { nameHi: "भौतिक विज्ञान", nameEn: "Physics", classLevel: "CLASS_10", colorVar: "lectures", chapters: ["प्रकाश – परावर्तन एवं अपवर्तन", "विद्युत", "ऊर्जा के स्रोत"] },
    { nameHi: "रसायन विज्ञान", nameEn: "Chemistry", classLevel: "CLASS_10", colorVar: "notes", chapters: ["रासायनिक अभिक्रियाएँ", "अम्ल, क्षार एवं लवण", "कार्बन एवं उसके यौगिक"] },
    { nameHi: "गणित", nameEn: "Mathematics", classLevel: "CLASS_10", colorVar: "quiz", chapters: ["द्विघात समीकरण", "त्रिकोणमिति", "सांख्यिकी"] },
    { nameHi: "सामाजिक विज्ञान", nameEn: "Social Science", classLevel: "CLASS_10", colorVar: "career", chapters: ["भारत में राष्ट्रवाद", "संसाधन एवं विकास", "लोकतंत्र"] },
    { nameHi: "अंग्रेजी", nameEn: "English", classLevel: "CLASS_12", colorVar: "books", chapters: ["Flamingo — Prose", "Vistas — Fiction"] },
  ];

  const subjects: Record<string, Awaited<ReturnType<typeof prisma.subject.create>>> = {};
  const chaptersBySubject: Record<string, Awaited<ReturnType<typeof prisma.chapter.create>>[]> = {};

  for (let i = 0; i < subjectDefs.length; i++) {
    const def = subjectDefs[i];
    const subject = await prisma.subject.create({
      data: {
        nameHi: def.nameHi,
        nameEn: def.nameEn,
        classLevel: def.classLevel,
        displayOrder: i,
        teachers: { connect: [teachers[i % teachers.length]].map((t) => ({ id: t.id })) },
      },
    });
    subjects[def.nameEn] = subject;
    chaptersBySubject[def.nameEn] = [];
    for (let c = 0; c < def.chapters.length; c++) {
      chaptersBySubject[def.nameEn].push(
        await prisma.chapter.create({
          data: { subjectId: subject.id, nameHi: def.chapters[c], nameEn: def.chapters[c], displayOrder: c },
        })
      );
    }
  }

  // ── Lectures (15) ────────────────────────────────────────────────────
  const lectureTags = [
    ["Board Exam Revision"],
    ["Learning by Doing"],
    ["Previous Year Solutions"],
    ["Practical/Experiment"],
    ["Anatomy Videos"],
  ];
  const sampleYoutubeIds = [
    "dQw4w9WgXcQ", "eY52Zsg-KVI", "3JZ_D3ELwOQ", "M7lc1UVf-VE", "aqz-KE-bpKQ",
    "kXYiU_JCYtU", "hY7m5jjJ9mM", "9bZkp7q19f0", "V-_O7nl0Ii0", "60ItHLz5WEA",
    "ktvTqknDobU", "OPf0YbXqDm0", "1G4isv_Fylg", "y6120QOlsfU", "fLexgOxsZu0",
  ];
  const lectureTitles = [
    "प्रकाश का परावर्तन — पूर्ण अध्याय", "उत्तल एवं अवतल लेंस प्रयोग", "विद्युत धारा एवं ओम का नियम",
    "रासायनिक समीकरण संतुलन कैसे करें", "अम्ल-क्षार सूचक प्रयोगशाला", "कार्बन यौगिकों का परिचय",
    "द्विघात समीकरण हल करने की विधियाँ", "त्रिकोणमिति के सूत्र याद रखने की ट्रिक", "सांख्यिकी — माध्य, माध्यिका, बहुलक",
    "भारत में राष्ट्रवाद — बोर्ड रिवीजन", "संसाधन एवं विकास — मानचित्र कार्य", "लोकतंत्र की चुनौतियाँ",
    "Flamingo Prose — Summary & Questions", "पिछले वर्ष के प्रश्न — गणित 2023", "मानव नेत्र की संरचना — एनाटॉमी",
  ];

  const allSubjectsList = Object.values(subjects);
  const lectures = [];
  for (let i = 0; i < 15; i++) {
    const subject = allSubjectsList[i % allSubjectsList.length];
    const chapters = chaptersBySubject[subject.nameEn];
    const teacher = teachers[i % teachers.length];
    lectures.push(
      await prisma.lecture.create({
        data: {
          title: lectureTitles[i],
          description: `${lectureTitles[i]} — कक्षा ${subject.classLevel === "CLASS_10" ? "10" : "12"} के लिए विस्तृत व्याख्यान।`,
          youtubeUrl: `https://www.youtube.com/watch?v=${sampleYoutubeIds[i]}`,
          thumbnailUrl: `https://i.ytimg.com/vi/${sampleYoutubeIds[i]}/hqdefault.jpg`,
          durationSec: 600 + i * 45,
          subjectId: subject.id,
          chapterId: chapters[i % chapters.length]?.id,
          classLevel: subject.classLevel,
          tags: lectureTags[i % lectureTags.length],
          language: i % 4 === 0 ? "ENGLISH" : "HINDI",
          displayOrder: i,
          views: Math.floor(Math.random() * 1200),
          isPublished: true,
          createdById: teacher.id,
        },
      })
    );
  }

  // watch progress for a couple of students
  for (let i = 0; i < 6; i++) {
    await prisma.lectureWatchProgress.create({
      data: { lectureId: lectures[i].id, userId: students[i % students.length].id, watched: i % 2 === 0 },
    });
  }

  // ── Notes (10) ───────────────────────────────────────────────────────
  const noteTags = [["Short Notes"], ["Formula Sheet"], ["Important Questions"], ["Map Work"]];
  for (let i = 0; i < 10; i++) {
    const subject = allSubjectsList[i % allSubjectsList.length];
    const chapters = chaptersBySubject[subject.nameEn];
    await prisma.note.create({
      data: {
        title: `${chapters[i % chapters.length]?.nameHi ?? subject.nameHi} — नोट्स`,
        subjectId: subject.id,
        chapterId: chapters[i % chapters.length]?.id,
        classLevel: subject.classLevel,
        fileUrl: `/uploads/notes/sample-note-${i + 1}.pdf`,
        fileSizeBytes: 200_000 + i * 45_000,
        language: "HINDI",
        tags: noteTags[i % noteTags.length],
        downloads: Math.floor(Math.random() * 400),
        isPublished: true,
        createdById: teachers[i % teachers.length].id,
      },
    });
  }

  // ── Books (8) ────────────────────────────────────────────────────────
  const bookDefs = [
    { title: "NCERT विज्ञान — कक्षा 10", category: "NCERT" as const, classLevel: "CLASS_10" as ClassLevel },
    { title: "NCERT गणित — कक्षा 10", category: "NCERT" as const, classLevel: "CLASS_10" as ClassLevel },
    { title: "NCERT सामाजिक विज्ञान — कक्षा 10", category: "NCERT" as const, classLevel: "CLASS_10" as ClassLevel },
    { title: "SCERT छत्तीसगढ़ हिंदी — कक्षा 10", category: "SCERT_CGBSE" as const, classLevel: "CLASS_10" as ClassLevel },
    { title: "NCERT Physics Part 1 — Class 12", category: "NCERT" as const, classLevel: "CLASS_12" as ClassLevel },
    { title: "CGBSE मॉडल उत्तर पुस्तिका — गणित", category: "MODEL_ANSWER" as const, classLevel: "CLASS_10" as ClassLevel },
    { title: "पिछले वर्ष के प्रश्नपत्र — विज्ञान 2020-2024", category: "PREVIOUS_YEAR_PAPER" as const, classLevel: "CLASS_10" as ClassLevel },
    { title: "प्रतियोगी परीक्षा सामान्य ज्ञान संग्रह", category: "COMPETITIVE" as const, classLevel: "CLASS_12" as ClassLevel },
  ];
  for (const b of bookDefs) {
    await prisma.book.create({
      data: {
        title: b.title,
        category: b.category,
        classLevel: b.classLevel,
        board: b.category === "NCERT" ? "CBSE/NCERT" : "CGBSE",
        medium: "HINDI",
        sourceUrl: "https://ncert.nic.in/textbook.php",
        copyrightCleared: true,
        edition: "2024-25",
        isPublished: true,
      },
    });
  }

  // ── Stories (4) ──────────────────────────────────────────────────────
  const storyDefs = [
    { title: "सूरजपुर की बेटी बनी IAS अधिकारी", personName: "श्रीमती कविता वर्मा", designation: "IAS, 2021 बैच", tags: ["IAS", "Girl Student"], featured: true },
    { title: "जिला टॉपर की सफलता की कहानी", personName: "अभिषेक तिवारी", designation: "CGBSE कक्षा 12 जिला टॉपर 2024", tags: ["Board Topper"], featured: false },
    { title: "प्रथम पीढ़ी के शिक्षार्थी की प्रेरक यात्रा", personName: "मीना बाई", designation: "प्रथम स्नातक, परिवार में", tags: ["Local Achiever"], featured: false },
    { title: "खेल से करियर तक — राज्य स्तरीय एथलीट", personName: "रोहित ठाकुर", designation: "राज्य स्तरीय एथलेटिक्स विजेता", tags: ["Sports", "Local Achiever"], featured: false },
  ];
  for (const s of storyDefs) {
    await prisma.story.create({
      data: {
        title: s.title,
        personName: s.personName,
        designation: s.designation,
        body: `${s.personName} की प्रेरक कहानी सूरजपुर जिले के विद्यार्थियों के लिए एक मिसाल है। कड़ी मेहनत और सही मार्गदर्शन से सफलता संभव है।`,
        district: "सूरजपुर",
        tags: s.tags,
        isFeatured: s.featured,
        isPublished: true,
      },
    });
  }

  // ── Exam Dates (6) ───────────────────────────────────────────────────
  const now = new Date();
  const days = (n: number) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);
  const examDefs = [
    { name: "CGBSE कक्षा 10 बोर्ड परीक्षा 2027", body: "छत्तीसगढ़ माध्यमिक शिक्षा मंडल", category: "Board Exam", classes: ["CLASS_10"] as ClassLevel[], applyEnd: days(45), examDate: days(120) },
    { name: "CGBSE कक्षा 12 बोर्ड परीक्षा 2027", body: "छत्तीसगढ़ माध्यमिक शिक्षा मंडल", category: "Board Exam", classes: ["CLASS_12"] as ClassLevel[], applyEnd: days(45), examDate: days(125) },
    { name: "JEE Main 2027 — सत्र 1", body: "NTA", category: "Entrance Exam", classes: ["CLASS_12"] as ClassLevel[], applyEnd: days(20), examDate: days(90) },
    { name: "NEET UG 2027", body: "NTA", category: "Entrance Exam", classes: ["CLASS_12"] as ClassLevel[], applyEnd: days(30), examDate: days(100) },
    { name: "NTSE छत्तीसगढ़ चरण 1", body: "SCERT छत्तीसगढ़", category: "Scholarship Exam", classes: ["CLASS_10"] as ClassLevel[], applyEnd: days(10), examDate: days(55) },
    { name: "नवोदय विद्यालय चयन परीक्षा", body: "नवोदय विद्यालय समिति", category: "Scholarship Exam", classes: ["CLASS_9" as ClassLevel], applyEnd: days(60), examDate: days(150) },
  ];
  for (const e of examDefs) {
    await prisma.exam.create({
      data: {
        name: e.name,
        body: e.body,
        category: e.category,
        applyStart: now,
        applyEnd: e.applyEnd,
        examDate: e.examDate,
        officialUrl: "https://cgbse.nic.in",
        classes: e.classes,
        status: "UPCOMING",
        isPublished: true,
      },
    });
  }

  // ── Career Roadmaps (4) ─────────────────────────────────────────────
  const roadmapDefs = [
    { title: "इंजीनियरिंग (Engineering)", stream: "Science (PCM)" },
    { title: "मेडिकल (Medical / MBBS)", stream: "Science (PCB)" },
    { title: "सिविल सेवा (Civil Services)", stream: "Any Stream" },
    { title: "शिक्षण (Teaching / B.Ed)", stream: "Any Stream" },
  ];
  for (const r of roadmapDefs) {
    await prisma.careerRoadmap.create({
      data: {
        title: r.title,
        stream: r.stream,
        overview: `${r.title} में करियर बनाने के लिए कक्षा 10 के बाद सही विषय चुनना महत्वपूर्ण है।`,
        eligibility: "कक्षा 12 उत्तीर्ण, न्यूनतम 50% अंक",
        stepsJson: [
          { step: "कक्षा 10", detail: "संबंधित स्ट्रीम की तैयारी शुरू करें" },
          { step: "कक्षा 11-12", detail: "मुख्य विषयों में मजबूत आधार बनाएँ" },
          { step: "प्रवेश परीक्षा", detail: "संबंधित प्रवेश परीक्षा की तैयारी करें" },
          { step: "स्नातक", detail: "संबंधित पाठ्यक्रम में प्रवेश लें" },
          { step: "नौकरी", detail: "क्षेत्र में करियर शुरू करें" },
        ],
        exams: ["JEE", "NEET"],
        isPublished: true,
      },
    });
  }

  // ── Olympiads (2) ────────────────────────────────────────────────────
  const olympiad1 = await prisma.olympiad.create({
    data: {
      name: "राष्ट्रीय विज्ञान ओलंपियाड (NSO)",
      body: "SOF",
      eligibleClasses: ["CLASS_10" as ClassLevel, "CLASS_12" as ClassLevel],
      regStart: now,
      regEnd: days(40),
      fee: "₹150",
      pattern: "50 MCQ, 60 मिनट",
      officialUrl: "https://sofworld.org",
      isPublished: true,
    },
  });
  await prisma.olympiad.create({
    data: {
      name: "अंतर्राष्ट्रीय गणित ओलंपियाड (IMO)",
      body: "SOF",
      eligibleClasses: ["CLASS_10" as ClassLevel, "CLASS_12" as ClassLevel],
      regStart: now,
      regEnd: days(40),
      fee: "₹150",
      pattern: "50 MCQ, 60 मिनट",
      officialUrl: "https://sofworld.org",
      isPublished: true,
    },
  });
  await prisma.olympiadInterest.createMany({
    data: students.slice(0, 4).map((s) => ({ studentId: s.id, olympiadId: olympiad1.id })),
  });

  // ── Quizzes (2, 10 questions each) ──────────────────────────────────
  const quiz1 = await prisma.quiz.create({
    data: {
      title: "गणित — द्विघात समीकरण अभ्यास",
      subjectId: subjects.Mathematics.id,
      chapterId: chaptersBySubject.Mathematics[0].id,
      classLevel: "CLASS_10",
      difficulty: "MEDIUM",
      timeLimitMin: 15,
      marksPerQ: 1,
      negativeMarks: 0.25,
      maxAttempts: 3,
      isPublished: true,
      createdById: teacherRamesh.id,
    },
  });
  const quiz2 = await prisma.quiz.create({
    data: {
      title: "विज्ञान — रासायनिक अभिक्रियाएँ अभ्यास",
      subjectId: subjects.Chemistry.id,
      chapterId: chaptersBySubject.Chemistry[0].id,
      classLevel: "CLASS_10",
      difficulty: "EASY",
      timeLimitMin: 10,
      marksPerQ: 1,
      negativeMarks: 0,
      maxAttempts: 3,
      isPublished: true,
      createdById: teacherAnjali.id,
    },
  });

  for (const [quiz, prefix] of [
    [quiz1, "द्विघात समीकरण"],
    [quiz2, "रासायनिक अभिक्रिया"],
  ] as const) {
    for (let i = 1; i <= 10; i++) {
      await prisma.question.create({
        data: {
          quizId: quiz.id,
          type: "MCQ_SINGLE",
          textHi: `${prefix} प्रश्न ${i}: सही विकल्प चुनें।`,
          textEn: `${prefix} Question ${i}: choose the correct option.`,
          optionsJson: ["विकल्प A", "विकल्प B", "विकल्प C", "विकल्प D"],
          correctAnswer: 0,
          explanation: "यह सही उत्तर है क्योंकि यह पाठ्यपुस्तक के अनुसार मानक विधि पर आधारित है।",
          marks: 1,
          difficulty: "MEDIUM",
          displayOrder: i,
        },
      });
    }
  }

  // sample quiz attempts (for leaderboard + counters)
  for (let i = 0; i < 8; i++) {
    const student = students[i % students.length];
    const quiz = i % 2 === 0 ? quiz1 : quiz2;
    const score = Math.floor(Math.random() * 8) + 2;
    await prisma.quizAttempt.create({
      data: {
        quizId: quiz.id,
        studentId: student.id,
        startedAt: days(-i - 1),
        submittedAt: days(-i - 1),
        score,
        accuracy: score * 10,
        timeTakenSec: 400 + i * 20,
        answersJson: {},
        tabSwitches: 0,
      },
    });
  }

  // ── Teacher availability + sample doubt bookings ────────────────────
  for (const teacher of teachers) {
    await prisma.teacherAvailability.create({
      data: {
        teacherId: teacher.id,
        weekday: 1,
        startTime: "16:00",
        endTime: "18:00",
        slotMinutes: 30,
        capacity: 1,
        mode: "MEET",
        meetingLink: "https://meet.google.com/sample-link",
      },
    });
  }

  await prisma.doubtBooking.create({
    data: {
      studentId: students[0].id,
      teacherId: teacherAnjali.id,
      slotStart: days(2),
      slotEnd: new Date(days(2).getTime() + 30 * 60 * 1000),
      topic: "प्रकाश अपवर्तन में समस्या",
      description: "लेंस सूत्र लगाने में कठिनाई हो रही है।",
      mode: "MEET",
      meetingLink: "https://meet.google.com/sample-link",
      status: "BOOKED",
    },
  });
  await prisma.doubtBooking.create({
    data: {
      studentId: students[1].id,
      teacherId: teacherRamesh.id,
      slotStart: days(-3),
      slotEnd: new Date(days(-3).getTime() + 30 * 60 * 1000),
      topic: "द्विघात समीकरण",
      description: "मूल ज्ञात करने में समस्या।",
      mode: "MEET",
      meetingLink: "https://meet.google.com/sample-link",
      status: "ATTENDED",
      rating: 5,
    },
  });

  // ── Sample answer copies ────────────────────────────────────────────
  await prisma.answerCopy.create({
    data: {
      studentId: students[2].id,
      teacherId: teacherPriya.id,
      subjectId: subjects["Social Science"].id,
      classLevel: "CLASS_10",
      paperName: "अर्धवार्षिक परीक्षा — सामाजिक विज्ञान",
      fileUrl: "/uploads/answer-copies/sample-1.pdf",
      status: "CHECKED",
      marksAwarded: 68,
      totalMarks: 80,
      remarks: "अच्छा प्रयास, मानचित्र कार्य में सुधार करें।",
      checkedFileUrl: "/uploads/answer-copies/sample-1-checked.pdf",
      checkedAt: days(-1),
    },
  });
  await prisma.answerCopy.create({
    data: {
      studentId: students[3].id,
      teacherId: teacherAnjali.id,
      subjectId: subjects.Physics.id,
      classLevel: "CLASS_10",
      paperName: "मासिक परीक्षण — भौतिक विज्ञान",
      fileUrl: "/uploads/answer-copies/sample-2.pdf",
      status: "UNDER_EVALUATION",
    },
  });

  // ── Announcements ────────────────────────────────────────────────────
  await prisma.announcement.create({
    data: {
      textHi: "CGBSE बोर्ड परीक्षा फॉर्म भरने की अंतिम तिथि निकट है — अभी आवेदन करें!",
      textEn: "CGBSE board exam form deadline is approaching — apply now!",
      link: "/exam-dates",
      isActive: true,
    },
  });
  await prisma.announcement.create({
    data: {
      textHi: "नई शंका समाधान कक्षा हर सोमवार शाम 4 बजे से उपलब्ध है।",
      textEn: "New doubt class available every Monday from 4 PM.",
      link: "/doubt-class",
      isActive: true,
    },
  });

  console.log("Seed complete.");
  console.log("Super Admin login: nodal.officer@surajpur.gov.in /", DEMO_PASSWORD);
  console.log("Teacher login: anjali.sharma@surajpur.gov.in /", DEMO_PASSWORD);
  console.log("Student login: student1@example.com /", DEMO_PASSWORD);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
