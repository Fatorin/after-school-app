CREATE TABLE attendance_records
(
    id         TEXT PRIMARY KEY,
    class_date DATE      NOT NULL,
    note       TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE attendance_students
(
    attendance_record_id TEXT NOT NULL,
    student_id           UUID NOT NULL,
    attendance_status    BOOL NOT NULL,
    note                 TEXT,
    PRIMARY KEY (attendance_record_id, student_id),
    FOREIGN KEY (attendance_record_id) REFERENCES attendance_records (id),
    FOREIGN KEY (student_id) REFERENCES students (id)
);