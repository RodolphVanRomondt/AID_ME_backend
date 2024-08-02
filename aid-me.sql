\echo 'Delete and recreate aid_me db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE aid_me;
CREATE DATABASE aid_me;
\connect aid_me

\i aid-me-schema.sql

\echo 'Delete and recreate aid_me_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE aid_me_test;
CREATE DATABASE aid_me_test;
\connect aid_me_test

\i aid-me-schema.sql
