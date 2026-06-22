DROP DATABASE IF EXISTS syncevent;
CREATE DATABASE syncevent;
USE syncevent;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','organizer') NOT NULL DEFAULT 'organizer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  location VARCHAR(200),
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'draft',
  organizer_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE rundowns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  activity_name VARCHAR(200) NOT NULL,
  start_time TIME,
  end_time TIME,
  person_in_charge VARCHAR(150),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(50),
  attendance_status VARCHAR(50) DEFAULT 'pending',
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE budgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  category VARCHAR(150) NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  transaction_date DATE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE ai_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT,
  prompt TEXT,
  response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
);

INSERT INTO users (nama, email, password, role) VALUES
('Admin SyncEvent', 'admin@syncevent.com', 'admin123', 'admin'),
('Organizer One', 'organizer1@syncevent.com', 'organizer123', 'organizer');

INSERT INTO events (title, description, location, start_date, end_date, status, organizer_id) VALUES
('Pelatihan Pemasaran Digital', 'Pelatihan digital marketing untuk UMKM.', 'Aula Kampus', '2026-07-10', '2026-07-10', 'published', 2),
('Seminar Teknologi', 'Seminar tentang tren teknologi terbaru.', 'Gedung Serbaguna', '2026-08-05', '2026-08-05', 'draft', 2);

INSERT INTO rundowns (event_id, activity_name, start_time, end_time, person_in_charge) VALUES
(1, 'Registrasi Peserta', '08:00:00', '09:00:00', 'Panitia A'),
(1, 'Sesi Materi Utama', '09:00:00', '12:00:00', 'Trainer B');

INSERT INTO participants (event_id, full_name, email, phone, attendance_status) VALUES
(1, 'Budi Santoso', 'budi@gmail.com', '081234567890', 'present'),
(1, 'Siti Aminah', 'siti@gmail.com', '082345678901', 'absent');

INSERT INTO budgets (event_id, category, amount, notes, transaction_date) VALUES
(1, 'Catering', 2500000.00, 'Makanan dan minuman', '2026-07-01'),
(1, 'Decorator', 1500000.00, 'Dekorasi ruang acara', '2026-07-02');
