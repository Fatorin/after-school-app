-- Add migration script here
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE OR REPLACE FUNCTION gen_random_uuid_v7()
RETURNS uuid
AS $$
DECLARE
v_time timestamp with time zone := clock_timestamp();
    v_secs bigint;
    v_msec bigint;
    uuid_bytes bytea;
BEGIN
    -- Get milliseconds since Unix epoch
    v_secs := EXTRACT(EPOCH FROM v_time);
    v_msec := v_secs * 1000 + EXTRACT(MILLISECONDS FROM v_time);

    -- Generate 16 bytes
    uuid_bytes := decode(lpad(to_hex(v_msec), 12, '0') || encode(gen_random_bytes(10), 'hex'), 'hex');

    -- Set version to 7
    uuid_bytes := set_byte(uuid_bytes, 6, (get_byte(uuid_bytes, 6) & 15) | 112);
    -- Set variant to RFC4122
    uuid_bytes := set_byte(uuid_bytes, 8, (get_byte(uuid_bytes, 8) & 63) | 128);

RETURN encode(uuid_bytes, 'hex')::uuid;
END
$$
LANGUAGE plpgsql
VOLATILE;