-- Add migration script here
CREATE TABLE members
(
    id                  UUID PRIMARY KEY   DEFAULT gen_random_uuid_v7(),
    name                text      NOT NULL,
    gender              int2,
    id_number           text,
    birth_date          TIMESTAMP,
    home_phone_number   text,
    mobile_phone_number text,
    address             text,
    title               text,
    line_id             text,
    comment             text,
    joined_at           TIMESTAMP NOT NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
    updated_at          TIMESTAMP NOT NULL DEFAULT timezone('utc', now())
);
CREATE UNIQUE INDEX unique_id_number_not_null
    ON members (id_number) WHERE id_number IS NOT NULL;

CREATE TABLE teachers
(
    member_id       UUID PRIMARY KEY,
    username        text      NOT NULL,
    password        text      NOT NULL,
    role_type       int2      NOT NULL,
    employment_type int2      NOT NULL,
    responsibility  text,
    background      text,
    created_at      TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
    updated_at      TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
    deleted_at      TIMESTAMP,
    last_login_at   TIMESTAMP,
    CONSTRAINT fk_member_id FOREIGN KEY (member_id) REFERENCES members (id) ON DELETE CASCADE
);

CREATE TABLE students
(
    member_id       UUID PRIMARY KEY,
    school_name     text,
    grade           int2,
    night_class     bool,
    is_pg           bool,
    pagamo_account  text,
    description     text,
    family_type     text,
    family_members  int2,
    breadwinner     text,
    occupation      text,
    subsidy         text,
    home_ownership  int2,
    class_joined_at TIMESTAMP NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
    updated_at      TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
    deleted_at      TIMESTAMP,
    CONSTRAINT fk_member_id FOREIGN KEY (member_id) REFERENCES members (id) ON DELETE CASCADE
);

CREATE TABLE teacher_assignments
(
    teacher_id  UUID      NOT NULL,
    student_id  UUID      NOT NULL,
    assigned_at TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),

    PRIMARY KEY (teacher_id, student_id),

    CONSTRAINT fk_teacher_id FOREIGN KEY (teacher_id) REFERENCES teachers (member_id) ON DELETE CASCADE,
    CONSTRAINT fk_student_id FOREIGN KEY (student_id) REFERENCES students (member_id) ON DELETE CASCADE
);

CREATE TABLE member_family_relations
(
    person_id     UUID      NOT NULL,
    relative_id   UUID      NOT NULL,
    relation_type TEXT      NOT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),

    PRIMARY KEY (person_id, relative_id),

    CONSTRAINT fk_person_id FOREIGN KEY (person_id) REFERENCES members (id) ON DELETE CASCADE,
    CONSTRAINT fk_relative_id FOREIGN KEY (relative_id) REFERENCES members (id) ON DELETE CASCADE
);

CREATE TABLE student_infos
(
    id                  UUID PRIMARY KEY   DEFAULT gen_random_uuid_v7(),
    student_id          UUID      NOT NULL,
    academic_year       int2      NOT NULL,
    chinese_book        text,
    english_book        text,
    math_book           text,
    science_book        text,
    social_studies_book text,
    comment             text,
    created_at          TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
    updated_at          TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_student_infos_unique UNIQUE (student_id, academic_year),
    CONSTRAINT fk_student_id FOREIGN KEY (student_id) REFERENCES students (member_id) ON DELETE CASCADE
);

CREATE TABLE student_exams
(
    id                   UUID PRIMARY KEY   DEFAULT gen_random_uuid_v7(),
    student_infos_id     UUID      NOT NULL,
    semester             int2      NOT NULL,
    exam_type            int2      NOT NULL,
    chinese_score        int2,
    english_score        int2,
    math_score           int2,
    science_score        int2,
    social_studies_score int2,
    created_at           TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
    updated_at           TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_student_exams_unique UNIQUE (student_infos_id, semester, exam_type),
    CONSTRAINT fk_student_infos_id FOREIGN KEY (student_infos_id) REFERENCES student_infos (id) ON DELETE CASCADE
);

CREATE TABLE announcements
(
    id           UUID PRIMARY KEY   DEFAULT gen_random_uuid_v7(),
    publisher_id UUID      NOT NULL,
    title        text      NOT NULL,
    content      text      NOT NULL,
    created_at   TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
    updated_at   TIMESTAMP NOT NULL DEFAULT timezone('utc', now()),
    deleted_at   TIMESTAMP,
    CONSTRAINT fk_publisher_id FOREIGN KEY (publisher_id) REFERENCES teachers (member_id) ON DELETE CASCADE
);

CREATE TABLE attendance_records
(
    id         TEXT PRIMARY KEY,
    date       DATE      NOT NULL,
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
    CONSTRAINT fk_attendance_record_id FOREIGN KEY (attendance_record_id) REFERENCES attendance_records (id) ON DELETE CASCADE,
    CONSTRAINT fk_student_id FOREIGN KEY (student_id) REFERENCES students (member_id) ON DELETE CASCADE
);