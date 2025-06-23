# Tuition Center ERP System

A modern, full-featured ERP system for tuition centers, built with **Next.js** and **Appwrite**. This platform streamlines tuition center management, staff operations, and provides a dedicated parent view for student performance tracking.

---

## 🛠️ Stack

- **Frontend:** [Next.js](https://nextjs.org/) (React 19)
- **Backend/Database/Auth:** [Appwrite](https://appwrite.io/)
- **UI/UX:** Tailwind CSS, MUI, PrimeReact, Framer Motion, Heroicons, Lucide, React Icons
- **PDF Export:** jsPDF
- **Charts:** Chart.js, react-chartjs-2
- **Date Handling:** date-fns

---

## ✨ Features

### For Branch Owners

- **Multi-Branch Management:** Create and manage multiple tuition center branches, each with its own staff and classes.
- **Year & Class Setup:** Organize each branch by academic years and classes.
- **Staff Access Control:** Assign staff to specific branches with secure login.

### For Staff

- **Branch Portal:** Staff log in and are directed to their assigned branch portal.
- **Student Admission:** Add, edit, and delete student records.
- **Attendance Management:**
  - Mark daily attendance for each student.
  - Export attendance records as PDF.
- **Fees Management:**
  - Record and track monthly fee payments for each student.
  - View payment history and export payment data.
- **Exam Management:**
  - Create exams and assign scores to students.
  - Edit and delete exam records.
- **Timetable Management:**
  - Create and manage weekly class timetables.
  - Export timetables as PDF.

### Parent View (Highlight Feature)

- **Student Dashboard:** Parents can view their child's overall performance, including:
  - Attendance history and statistics.
  - Exam results and subject-wise scores.
  - Score progression over time (with charts).
  - Monthly payment records and totals.
  - Attendance check for any selected date.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd tuitionOs
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Appwrite

- Set up an [Appwrite](https://appwrite.io/) instance (self-hosted or cloud).
- Create your project, database, and storage buckets as needed.
- Update the Appwrite configuration in `src/lib/appwrite.js` with your endpoint, project ID, and API keys.

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📁 Project Structure

```
src/
  components/      # Reusable UI components (tables, forms, modals, etc.)
  context/         # Global state management (user, center, etc.)
  hooks/           # Custom React hooks
  lib/             # Appwrite API integration
  pages/           # Next.js pages (routes)
  styles/          # Global styles (Tailwind CSS)
public/            # Static assets (images, icons)
```

---

## 🧑‍💻 Main Pages & Routes

- `/login` – Staff login
- `/register` – Branch owner registration
- `/` – Dashboard (branch management)
- `/add-center` – Add new tuition branch
- `/admission` – Student admission management
- `/attendance` – Attendance marking and export
- `/fees-payment` – Fees payment tracking
- `/exams` – Exam creation and score assignment
- `/timetable` – Weekly timetable management and export
- `/parent/[id]` – Parent view for student performance

---

## 📝 Contributing

We welcome contributions! If you have ideas, bug fixes, or new features, feel free to open an issue or submit a pull request.

**Let's build the best Tuition Center ERP together!**

---

## 🤝 Collaboration

This project thrives on collaboration. Whether you're a developer, designer, or educator, your input is valuable. Join us in making tuition management smarter and more accessible for everyone!
