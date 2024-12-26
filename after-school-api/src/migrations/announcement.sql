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