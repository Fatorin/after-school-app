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