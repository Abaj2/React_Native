--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: exercises; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exercises (
    exercise_id integer NOT NULL,
    workout_id integer,
    name character varying(255),
    user_id integer
);


ALTER TABLE public.exercises OWNER TO postgres;

--
-- Name: exercises_exercise_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.exercises_exercise_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exercises_exercise_id_seq OWNER TO postgres;

--
-- Name: exercises_exercise_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.exercises_exercise_id_seq OWNED BY public.exercises.exercise_id;


--
-- Name: sets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sets (
    set_id integer NOT NULL,
    exercise_id integer,
    reps integer,
    duration integer,
    notes text,
    workout_id integer,
    user_id integer
);


ALTER TABLE public.sets OWNER TO postgres;

--
-- Name: sets_set_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sets_set_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sets_set_id_seq OWNER TO postgres;

--
-- Name: sets_set_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sets_set_id_seq OWNED BY public.sets.set_id;


--
-- Name: skills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.skills (
    id integer NOT NULL,
    skill text,
    progressions text[],
    user_id integer,
    current jsonb,
    goal jsonb,
    date jsonb,
    date_formatted jsonb
);


ALTER TABLE public.skills OWNER TO postgres;

--
-- Name: skills_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.skills_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.skills_id_seq OWNER TO postgres;

--
-- Name: skills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.skills_id_seq OWNED BY public.skills.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    email character varying(255),
    password_hash character varying(255),
    username character varying(255),
    profile_pic bytea
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: workouts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workouts (
    workout_id integer NOT NULL,
    user_id integer,
    title character varying(255),
    level character varying(255),
    date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    custom boolean DEFAULT false,
    duration text
);


ALTER TABLE public.workouts OWNER TO postgres;

--
-- Name: workouts_workout_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.workouts_workout_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.workouts_workout_id_seq OWNER TO postgres;

--
-- Name: workouts_workout_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.workouts_workout_id_seq OWNED BY public.workouts.workout_id;


--
-- Name: exercises exercise_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercises ALTER COLUMN exercise_id SET DEFAULT nextval('public.exercises_exercise_id_seq'::regclass);


--
-- Name: sets set_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sets ALTER COLUMN set_id SET DEFAULT nextval('public.sets_set_id_seq'::regclass);


--
-- Name: skills id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skills ALTER COLUMN id SET DEFAULT nextval('public.skills_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Name: workouts workout_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workouts ALTER COLUMN workout_id SET DEFAULT nextval('public.workouts_workout_id_seq'::regclass);


--
-- Data for Name: exercises; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exercises (exercise_id, workout_id, name, user_id) FROM stdin;
84	69	Hello	16
85	70	Weighted Pull-Ups	16
86	70	Band-Assisted Muscle-Ups	16
87	70	Negative Muscle-Ups	16
88	71	Advanced Tuck Hold	16
89	71	Single Leg Extensions	16
\.


--
-- Data for Name: sets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sets (set_id, exercise_id, reps, duration, notes, workout_id, user_id) FROM stdin;
184	84	4	\N		69	16
185	85	4	\N		70	16
186	85	5	\N		70	16
187	85	\N	\N		70	16
188	86	\N	\N		70	16
189	86	\N	\N		70	16
190	86	\N	\N		70	16
191	87	\N	\N		70	16
192	87	\N	\N		70	16
193	87	\N	\N		70	16
194	88	\N	4		71	16
195	88	\N	\N		71	16
196	88	\N	\N		71	16
197	88	\N	\N		71	16
198	89	\N	\N		71	16
199	89	\N	\N		71	16
200	89	\N	\N		71	16
\.


--
-- Data for Name: skills; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.skills (id, skill, progressions, user_id, current, goal, date, date_formatted) FROM stdin;
47	Front Lever	{"Advanced Tuck",Tuck}	16	[[3, 4, 6, 13, 14, 16, 18, 19, 6], [5, 7]]	[[8, 20], [8]]	[[1737336604471, 1737336616895, 1737348015519, 1737348059825, 1737349728465, 1737349756343, 1737349763407, 1737349775370, 1738206525716], [1737336610879, 1737371470293]]	[["20/01/25 12:30", "20/01/25 12:30", "20/01/25 15:40", "20/01/25 15:40", "20/01/25 16:08", "20/01/25 16:09", "20/01/25 16:09", "20/01/25 16:09", "30/01/25 14:08"], ["20/01/25 12:30", "20/01/25 22:11"]]
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, email, password_hash, username, profile_pic) FROM stdin;
10	aatavbajaj@gmail.com	$2a$10$bz4wGxpt4w/8k7mMoFWSLuxVLnAMF1BidtFeLjRPnucUnBXt2SRaC	hello200	\N
11	aaaavbajaj@gmail.com	$2a$10$zP6Ic/aTdKFsNlqe7NJA9.CiY3k7M8raY8wLvF19tPApeb6CDk0gy	hello20	\N
12	aa@gmail.com	$2a$10$a1zKg4rbSrAYVJY0Tc7R1us3dScmMd0GZ8fnFFkdMEzgq3makmnka	laksk	\N
13	aarav@gmail.com	$2a$10$JIUbeqBPN8qsL35MaBVGU.EnkF.WrNKgvWEz36z4s2cULf8lAaT5e	takak	\N
14	stables@gmail.com	$2a$10$tdXjSIotOFiqUpvVAovYwu9xXWbh8Thm5TDqEb3RaWSqaARiZ7M/e	testaayah	\N
15	alalal@gmail.com	$2a$10$UPuBJARzahnbTSFvpFDoVuxw62UnqTUvKztj7zyKRHEhHN0Pe2QcW	papslsk	\N
16	aaravbajaj08@gmail.com	$2a$10$c2sWDgFpmcKEVofYIMxyyOc.r9JxdkN43bvVFLIm3DrAexaQBl.9q	aarav	\N
\.


--
-- Data for Name: workouts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workouts (workout_id, user_id, title, level, date, custom, duration) FROM stdin;
69	16	Test	Custom	2025-01-30 12:10:51.820617	t	00:00:10
70	16	Muscle Up	Advanced	2025-01-30 12:15:07.755993	f	00:00:11
71	16	Front Lever	Intermediate	2025-01-30 12:54:18.450316	f	00:01:06
\.


--
-- Name: exercises_exercise_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.exercises_exercise_id_seq', 89, true);


--
-- Name: sets_set_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sets_set_id_seq', 200, true);


--
-- Name: skills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.skills_id_seq', 48, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 16, true);


--
-- Name: workouts_workout_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.workouts_workout_id_seq', 71, true);


--
-- Name: exercises exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_pkey PRIMARY KEY (exercise_id);


--
-- Name: sets sets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sets
    ADD CONSTRAINT sets_pkey PRIMARY KEY (set_id);


--
-- Name: skills skills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: workouts workouts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workouts
    ADD CONSTRAINT workouts_pkey PRIMARY KEY (workout_id);


--
-- Name: sets fk_exercise_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sets
    ADD CONSTRAINT fk_exercise_id FOREIGN KEY (exercise_id) REFERENCES public.exercises(exercise_id) ON DELETE CASCADE;


--
-- Name: exercises fk_workout; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT fk_workout FOREIGN KEY (workout_id) REFERENCES public.workouts(workout_id);


--
-- Name: sets fk_workout_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sets
    ADD CONSTRAINT fk_workout_id FOREIGN KEY (workout_id) REFERENCES public.workouts(workout_id) ON DELETE CASCADE;


--
-- Name: skills skills_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- PostgreSQL database dump complete
--

