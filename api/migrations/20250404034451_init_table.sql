-- Add migration script here
CREATE TABLE teachers
(
    id              UUID PRIMARY KEY   DEFAULT gen_random_uuid_v7(),
    username        text      NOT NULL,
    password        text      NOT NULL,
    role_type       int2      NOT NULL,
    employment_type int2      NOT NULL,
    name            text      NOT NULL,
    phone           text,
    responsibility  text,
    background      text,
    id_number       text,
    date_of_birth   TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
    updated_at      TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
    deleted_at      TIMESTAMP,
    last_login_at   TIMESTAMP
);

CREATE TABLE students
(
    id                  UUID PRIMARY KEY   DEFAULT gen_random_uuid_v7(),
    name                text      NOT NULL,
    gender              int2,
    id_number           text      NOT NULL,
    date_of_birth       TIMESTAMP,
    school_name         text,
    grade               int2,
    is_pg               bool,
    description         text,
    family_type         text,
    family_members      int2,
    breadwinner         text,
    occupation          text,
    subsidy             text,
    address             text,
    home_ownership      int2,
    home_phone_number   text,
    mobile_phone_number text,
    line_id             text,
    comment             text,
    joined_at           TIMESTAMP NOT NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
    updated_at          TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
    deleted_at          TIMESTAMP
);

CREATE TABLE student_grades
(
    id                   UUID      PRIMARY KEY   DEFAULT gen_random_uuid_v7(),
    student_id           UUID      NOT NULL,
    academic_year        int2      NOT NULL,
    semester             int2      NOT NULL,
    exam_type            int2      NOT NULL,
    chinese_book         text,
    english_book         text,
    math_book            text,
    science_book         text,
    social_studies_book  text,
    chinese_score        int2,
    english_score        int2,
    math_score           int2,
    science_score        int2,
    social_studies_score int2,
    comment              text,
    created_at           TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
    updated_at           TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
    deleted_at           TIMESTAMP,
    CONSTRAINT fk_student_id FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE
);

CREATE TABLE announcements
(
    id         UUID PRIMARY KEY   DEFAULT gen_random_uuid_v7(),
    teacher_id UUID      NOT NULL,
    title      text      NOT NULL,
    content    text      NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
    deleted_at TIMESTAMP,
    CONSTRAINT fk_teacher_id FOREIGN KEY (teacher_id) REFERENCES teachers (id) ON DELETE CASCADE
);

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