USE findmytutor;

-- Development-only shared demo password: DemoPass123!
-- Hash: bcrypt cost 12. Change demo accounts before exposing this app publicly.
INSERT INTO users (name, email, password_hash, role, account_status) VALUES
  ('FindMyTutor Demo Admin', 'admin@demo.test', '$2b$12$L927bWk3FW8igFKcZTAQUeP6kl43Qke6zH3Eg2/ZUVIwOyZBt3C8K', 'admin', 'active'),
  ('Avery Student', 'student@demo.test', '$2b$12$L927bWk3FW8igFKcZTAQUeP6kl43Qke6zH3Eg2/ZUVIwOyZBt3C8K', 'student', 'active'),
  ('Jordan Student', 'jordan.student@demo.test', '$2b$12$L927bWk3FW8igFKcZTAQUeP6kl43Qke6zH3Eg2/ZUVIwOyZBt3C8K', 'student', 'active'),
  ('Maya Chen', 'maya.chen@demo.test', '$2b$12$L927bWk3FW8igFKcZTAQUeP6kl43Qke6zH3Eg2/ZUVIwOyZBt3C8K', 'tutor', 'active'),
  ('Daniel Sok', 'daniel.sok@demo.test', '$2b$12$L927bWk3FW8igFKcZTAQUeP6kl43Qke6zH3Eg2/ZUVIwOyZBt3C8K', 'tutor', 'active'),
  ('Sophea Lim', 'sophea.lim@demo.test', '$2b$12$L927bWk3FW8igFKcZTAQUeP6kl43Qke6zH3Eg2/ZUVIwOyZBt3C8K', 'tutor', 'active'),
  ('Noah Williams', 'noah.williams@demo.test', '$2b$12$L927bWk3FW8igFKcZTAQUeP6kl43Qke6zH3Eg2/ZUVIwOyZBt3C8K', 'tutor', 'active'),
  ('Lina Park', 'lina.park@demo.test', '$2b$12$L927bWk3FW8igFKcZTAQUeP6kl43Qke6zH3Eg2/ZUVIwOyZBt3C8K', 'tutor', 'active'),
  ('Omar Haddad', 'omar.haddad@demo.test', '$2b$12$L927bWk3FW8igFKcZTAQUeP6kl43Qke6zH3Eg2/ZUVIwOyZBt3C8K', 'tutor', 'active'),
  ('Priya Nair', 'priya.nair@demo.test', '$2b$12$L927bWk3FW8igFKcZTAQUeP6kl43Qke6zH3Eg2/ZUVIwOyZBt3C8K', 'tutor', 'active'),
  ('Ethan Brown', 'ethan.brown@demo.test', '$2b$12$L927bWk3FW8igFKcZTAQUeP6kl43Qke6zH3Eg2/ZUVIwOyZBt3C8K', 'tutor', 'active'),
  ('Nita Vann', 'nita.vann@demo.test', '$2b$12$L927bWk3FW8igFKcZTAQUeP6kl43Qke6zH3Eg2/ZUVIwOyZBt3C8K', 'tutor', 'active'),
  ('Lucas Martin', 'lucas.martin@demo.test', '$2b$12$L927bWk3FW8igFKcZTAQUeP6kl43Qke6zH3Eg2/ZUVIwOyZBt3C8K', 'tutor', 'active'),
  ('Chenda Khem', 'chenda.khem@demo.test', '$2b$12$L927bWk3FW8igFKcZTAQUeP6kl43Qke6zH3Eg2/ZUVIwOyZBt3C8K', 'tutor', 'active')
ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role), account_status = VALUES(account_status);

INSERT INTO subjects (subject_name, description) VALUES
  ('Mathematics', 'Build confidence in algebra, calculus, statistics, and problem solving.'),
  ('Physics', 'Connect core physics concepts to clear methods and practical examples.'),
  ('Chemistry', 'Strengthen understanding of chemical principles and laboratory foundations.'),
  ('Biology', 'Explore living systems, cell biology, genetics, and ecology.'),
  ('English', 'Develop academic writing, reading comprehension, and communication.'),
  ('Computer Science', 'Learn programming fundamentals, algorithms, and computer systems.')
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT INTO tutor_listings
  (tutor_id, subject_id, title, description, qualification, experience, location, teaching_fee, status)
SELECT u.user_id, s.subject_id, v.title, v.description, v.qualification, v.experience, v.location, v.teaching_fee, 'available'
FROM (
  SELECT 'maya.chen@demo.test' email, 'Mathematics made approachable' title, 'Patient, step-by-step support in algebra and calculus, shaped around your goals.' description, 'BSc Mathematics, Royal University of Phnom Penh' qualification, 6 experience, 'Phnom Penh' location, 22.00 teaching_fee, 'Mathematics' subject_name
  UNION ALL SELECT 'daniel.sok@demo.test', 'Physics with real-world clarity', 'Build strong mechanics and electricity foundations through worked examples.', 'MSc Physics, Institute of Technology of Cambodia', 8, 'Phnom Penh', 25.00, 'Physics'
  UNION ALL SELECT 'sophea.lim@demo.test', 'Chemistry, one concept at a time', 'Focused chemistry sessions that make equations and reactions easier to understand.', 'BSc Chemistry, Royal University of Phnom Penh', 5, 'Phnom Penh', 20.00, 'Chemistry'
  UNION ALL SELECT 'noah.williams@demo.test', 'Biology for curious learners', 'Support for cell biology, genetics, and exam preparation with clear diagrams.', 'MSc Biology, University of Melbourne', 7, 'Siem Reap', 24.00, 'Biology'
  UNION ALL SELECT 'lina.park@demo.test', 'Confident academic English', 'Improve essay structure, close reading, and clear academic writing.', 'BA English Literature, Seoul National University', 9, 'Phnom Penh', 23.00, 'English'
  UNION ALL SELECT 'omar.haddad@demo.test', 'Programming foundations', 'Learn Python and computational thinking through small, practical projects.', 'BSc Computer Science, AUB', 6, 'Phnom Penh', 27.00, 'Computer Science'
  UNION ALL SELECT 'priya.nair@demo.test', 'Calculus and statistics coaching', 'Friendly university-level math support with a focus on independent problem solving.', 'MSc Applied Mathematics, NUS', 10, 'Phnom Penh', 30.00, 'Mathematics'
  UNION ALL SELECT 'ethan.brown@demo.test', 'Physics exam preparation', 'Structured preparation for mechanics, waves, and electricity assessments.', 'BEng Engineering Physics, University of Toronto', 4, 'Battambang', 21.00, 'Physics'
  UNION ALL SELECT 'nita.vann@demo.test', 'Chemistry for secondary school', 'Build a reliable understanding of atoms, bonding, and chemical calculations.', 'BSc Chemistry, Royal University of Phnom Penh', 7, 'Phnom Penh', 19.00, 'Chemistry'
  UNION ALL SELECT 'lucas.martin@demo.test', 'Biology and environmental science', 'Explore ecology and human biology with clear notes and guided practice.', 'BSc Environmental Biology, University of Queensland', 5, 'Siem Reap', 22.00, 'Biology'
  UNION ALL SELECT 'chenda.khem@demo.test', 'Writing and reading support', 'Practical coaching in grammar, literature, and confident written communication.', 'MA Education, Royal University of Phnom Penh', 12, 'Phnom Penh', 26.00, 'English'
) AS v
JOIN users u ON u.email = v.email AND u.role = 'tutor'
JOIN subjects s ON s.subject_name = v.subject_name
WHERE NOT EXISTS (
  SELECT 1 FROM tutor_listings existing
  WHERE existing.tutor_id = u.user_id AND existing.subject_id = s.subject_id AND existing.title = v.title
);

INSERT INTO bookings (student_id, tutor_listing_id, requested_date, requested_time, status)
SELECT student.user_id, listing.tutor_listing_id, DATE_ADD(CURRENT_DATE, INTERVAL sample.days_ahead DAY), sample.requested_time, sample.status
FROM (
  SELECT 'student@demo.test' student_email, 'maya.chen@demo.test' tutor_email, 'Mathematics made approachable' listing_title, 7 days_ahead, '10:00:00' requested_time, 'pending' status
  UNION ALL SELECT 'student@demo.test', 'daniel.sok@demo.test', 'Physics with real-world clarity', 9, '14:00:00', 'accepted'
  UNION ALL SELECT 'jordan.student@demo.test', 'sophea.lim@demo.test', 'Chemistry, one concept at a time', 12, '11:30:00', 'rejected'
  UNION ALL SELECT 'jordan.student@demo.test', 'noah.williams@demo.test', 'Biology for curious learners', 15, '09:00:00', 'cancelled'
) AS sample
JOIN users student ON student.email = sample.student_email
JOIN users tutor ON tutor.email = sample.tutor_email
JOIN tutor_listings listing ON listing.tutor_id = tutor.user_id AND listing.title = sample.listing_title
WHERE NOT EXISTS (
  SELECT 1 FROM bookings existing
  WHERE existing.student_id = student.user_id
    AND existing.tutor_listing_id = listing.tutor_listing_id
    AND existing.requested_date >= CURRENT_DATE
    AND existing.requested_time = sample.requested_time
);
