CREATE TABLE student_grades
(
    id                   UUID PRIMARY KEY   DEFAULT gen_random_uuid_v7(),
    student_id           UUID      NOT NULL,
    academic_year        int2      NOT NULL,
    semester             int2      NOT NULL,
    exam_type            int2      NOT NULL,
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