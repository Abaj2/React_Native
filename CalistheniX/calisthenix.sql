--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

-- Started on 2025-03-08 21:01:28

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

SET default_table_access_method = heap;

--
-- TOC entry 217 (class 1259 OID 33425)
-- Name: exercises; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exercises (
    exercise_id integer NOT NULL,
    workout_id integer,
    name character varying(255),
    user_id integer,
    custom boolean DEFAULT false,
    routine boolean DEFAULT true
);


--
-- TOC entry 218 (class 1259 OID 33428)
-- Name: exercises_exercise_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.exercises_exercise_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4862 (class 0 OID 0)
-- Dependencies: 218
-- Name: exercises_exercise_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.exercises_exercise_id_seq OWNED BY public.exercises.exercise_id;


--
-- TOC entry 227 (class 1259 OID 33641)
-- Name: followers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.followers (
    id integer NOT NULL,
    follower_id integer,
    following_id integer,
    created_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 228 (class 1259 OID 33644)
-- Name: followers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.followers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4863 (class 0 OID 0)
-- Dependencies: 228
-- Name: followers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.followers_id_seq OWNED BY public.followers.id;


--
-- TOC entry 219 (class 1259 OID 33429)
-- Name: sets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sets (
    set_id integer NOT NULL,
    exercise_id integer,
    reps integer,
    duration integer,
    notes text,
    workout_id integer,
    user_id integer,
    custom boolean DEFAULT false,
    routine boolean DEFAULT true
);


--
-- TOC entry 220 (class 1259 OID 33434)
-- Name: sets_set_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sets_set_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4864 (class 0 OID 0)
-- Dependencies: 220
-- Name: sets_set_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sets_set_id_seq OWNED BY public.sets.set_id;


--
-- TOC entry 221 (class 1259 OID 33435)
-- Name: skills; Type: TABLE; Schema: public; Owner: -
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


--
-- TOC entry 222 (class 1259 OID 33440)
-- Name: skills_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.skills_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4865 (class 0 OID 0)
-- Dependencies: 222
-- Name: skills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.skills_id_seq OWNED BY public.skills.id;


--
-- TOC entry 223 (class 1259 OID 33441)
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    email character varying(255),
    password_hash character varying(255),
    username character varying(255),
    profile_pic text,
    name character varying(255)
);


--
-- TOC entry 224 (class 1259 OID 33446)
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4866 (class 0 OID 0)
-- Dependencies: 224
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 225 (class 1259 OID 33447)
-- Name: workouts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workouts (
    workout_id integer NOT NULL,
    user_id integer,
    title character varying(255),
    level character varying(255),
    date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    custom boolean DEFAULT false,
    workout_time text,
    routine boolean DEFAULT true
);


--
-- TOC entry 226 (class 1259 OID 33453)
-- Name: workouts_workout_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workouts_workout_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4867 (class 0 OID 0)
-- Dependencies: 226
-- Name: workouts_workout_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workouts_workout_id_seq OWNED BY public.workouts.workout_id;


--
-- TOC entry 4666 (class 2604 OID 33454)
-- Name: exercises exercise_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercises ALTER COLUMN exercise_id SET DEFAULT nextval('public.exercises_exercise_id_seq'::regclass);


--
-- TOC entry 4678 (class 2604 OID 33645)
-- Name: followers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.followers ALTER COLUMN id SET DEFAULT nextval('public.followers_id_seq'::regclass);


--
-- TOC entry 4669 (class 2604 OID 33455)
-- Name: sets set_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sets ALTER COLUMN set_id SET DEFAULT nextval('public.sets_set_id_seq'::regclass);


--
-- TOC entry 4672 (class 2604 OID 33456)
-- Name: skills id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills ALTER COLUMN id SET DEFAULT nextval('public.skills_id_seq'::regclass);


--
-- TOC entry 4673 (class 2604 OID 33457)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- TOC entry 4674 (class 2604 OID 33458)
-- Name: workouts workout_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workouts ALTER COLUMN workout_id SET DEFAULT nextval('public.workouts_workout_id_seq'::regclass);


--
-- TOC entry 4845 (class 0 OID 33425)
-- Dependencies: 217
-- Data for Name: exercises; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.exercises (exercise_id, workout_id, name, user_id, custom, routine) FROM stdin;
85	70	Weighted Pull-Ups	16	f	t
86	70	Band-Assisted Muscle-Ups	16	f	t
87	70	Negative Muscle-Ups	16	f	t
88	71	Advanced Tuck Hold	16	f	t
89	71	Single Leg Extensions	16	f	t
91	73	g	16	t	t
95	77	ccvbbgfcc	16	t	t
96	77	gggggg	16	t	t
97	78	Advanced Tuck Hold	16	f	t
98	78	Single Leg Extensions	16	f	t
93	75	test	16	t	f
94	76	k	16	t	f
99	79	Advanced Tuck Hold	16	f	t
100	79	Single Leg Extensions	16	f	t
92	74	vbnn	16	t	f
101	80	Advanced Tuck Hold	16	f	t
102	80	Single Leg Extensions	16	f	t
104	82	Advanced Tuck Hold	16	f	t
105	82	Single Leg Extensions	16	f	t
106	83	Explosive Pull-Ups	16	f	t
107	83	Russian Dips	16	f	t
108	84	Advanced Tuck Hold	16	f	t
109	84	Single Leg Extensions	16	f	t
103	81	g	16	t	f
110	85	Advanced Tuck Hold	\N	f	t
111	85	Single Leg Extensions	\N	f	t
112	86	Straddle Front Lever Hold	\N	f	t
113	86	One Leg Front Lever Pulls	\N	f	t
114	87	Advanced Tuck Hold	17	f	t
115	87	Single Leg Extensions	17	f	t
116	88	Dips	17	t	t
\.


--
-- TOC entry 4855 (class 0 OID 33641)
-- Dependencies: 227
-- Data for Name: followers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.followers (id, follower_id, following_id, created_at) FROM stdin;
2	16	15	2025-02-22 16:53:28.110614
9	17	16	2025-03-08 20:47:54.468667
\.


--
-- TOC entry 4847 (class 0 OID 33429)
-- Dependencies: 219
-- Data for Name: sets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sets (set_id, exercise_id, reps, duration, notes, workout_id, user_id, custom, routine) FROM stdin;
185	85	4	\N		70	16	f	t
186	85	5	\N		70	16	f	t
187	85	\N	\N		70	16	f	t
188	86	\N	\N		70	16	f	t
189	86	\N	\N		70	16	f	t
190	86	\N	\N		70	16	f	t
191	87	\N	\N		70	16	f	t
192	87	\N	\N		70	16	f	t
193	87	\N	\N		70	16	f	t
194	88	\N	4		71	16	f	t
195	88	\N	\N		71	16	f	t
196	88	\N	\N		71	16	f	t
197	88	\N	\N		71	16	f	t
198	89	\N	\N		71	16	f	t
199	89	\N	\N		71	16	f	t
200	89	\N	\N		71	16	f	t
202	91	\N	\N		73	16	t	t
206	95	2	\N		77	16	t	t
207	95	5	\N		77	16	t	t
208	96	\N	\N		77	16	t	t
209	97	\N	4		78	16	f	t
210	97	\N	\N		78	16	f	t
211	97	\N	\N		78	16	f	t
212	97	\N	\N		78	16	f	t
213	98	\N	\N		78	16	f	t
214	98	\N	\N		78	16	f	t
215	98	\N	\N		78	16	f	t
204	93	5	\N		75	16	t	f
205	94	\N	\N		76	16	t	f
216	99	\N	1		79	16	f	t
217	99	\N	\N		79	16	f	t
218	99	\N	\N		79	16	f	t
219	99	\N	\N		79	16	f	t
220	100	\N	\N		79	16	f	t
221	100	\N	\N		79	16	f	t
222	100	\N	\N		79	16	f	t
203	92	5	\N		74	16	t	f
223	101	\N	\N		80	16	f	t
224	101	\N	\N		80	16	f	t
225	101	\N	\N		80	16	f	t
226	101	\N	\N		80	16	f	t
227	102	\N	\N		80	16	f	t
228	102	\N	\N		80	16	f	t
229	102	\N	\N		80	16	f	t
231	104	\N	5		82	16	f	t
232	104	\N	\N		82	16	f	t
233	104	\N	\N		82	16	f	t
234	104	\N	\N		82	16	f	t
235	105	\N	\N		82	16	f	t
236	105	\N	\N		82	16	f	t
237	105	\N	\N		82	16	f	t
238	106	\N	\N		83	16	f	t
239	106	5	\N		83	16	f	t
240	106	\N	\N		83	16	f	t
241	106	\N	\N		83	16	f	t
242	107	\N	\N		83	16	f	t
243	107	\N	\N		83	16	f	t
244	107	\N	\N		83	16	f	t
245	108	\N	5		84	16	f	t
246	108	\N	\N		84	16	f	t
247	108	\N	\N		84	16	f	t
248	108	\N	\N		84	16	f	t
249	109	\N	\N		84	16	f	t
250	109	\N	\N		84	16	f	t
251	109	\N	\N		84	16	f	t
230	103	5	\N		81	16	t	f
252	110	\N	4		85	\N	f	t
253	110	\N	\N		85	\N	f	t
254	110	\N	\N		85	\N	f	t
255	110	\N	\N		85	\N	f	t
256	111	\N	\N		85	\N	f	t
257	111	\N	\N		85	\N	f	t
258	111	\N	\N		85	\N	f	t
259	112	\N	5		86	\N	f	t
260	112	\N	\N		86	\N	f	t
261	112	\N	\N		86	\N	f	t
262	112	\N	\N		86	\N	f	t
263	112	\N	\N		86	\N	f	t
264	113	\N	\N		86	\N	f	t
265	113	\N	\N		86	\N	f	t
266	113	\N	\N		86	\N	f	t
267	114	\N	5		87	17	f	t
268	114	\N	\N		87	17	f	t
269	114	\N	\N		87	17	f	t
270	114	\N	\N		87	17	f	t
271	115	\N	\N		87	17	f	t
272	115	\N	\N		87	17	f	t
273	115	\N	\N		87	17	f	t
274	116	1	\N		88	17	t	t
275	116	5	\N		88	17	t	t
\.


--
-- TOC entry 4849 (class 0 OID 33435)
-- Dependencies: 221
-- Data for Name: skills; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.skills (id, skill, progressions, user_id, current, goal, date, date_formatted) FROM stdin;
50	Muscle Up	{Full}	16	[[3, 4]]	[[4]]	[[1738664503738, 1738996195544]]	[["04/02/25 21:21", "08/02/25 17:29"]]
47	Front Lever	{"Advanced Tuck",Tuck,"Full FL"}	16	[[3, 4, 6, 13, 14, 16, 18, 19, 6, 2], [5, 7], [4]]	[[8, 20], [8], [5]]	[[1737336604471, 1737336616895, 1737348015519, 1737348059825, 1737349728465, 1737349756343, 1737349763407, 1737349775370, 1738206525716, 1738402074082], [1737336610879, 1737371470293], [1738391075397]]	[["20/01/25 12:30", "20/01/25 12:30", "20/01/25 15:40", "20/01/25 15:40", "20/01/25 16:08", "20/01/25 16:09", "20/01/25 16:09", "20/01/25 16:09", "30/01/25 14:08", "01/02/25 20:27"], ["20/01/25 12:30", "20/01/25 22:11"], ["01/02/25 17:24"]]
53	Planche	{Full,Tuck,testingajajsjsjsjsjsk}	17	[[2, 3], [3, 6], [3]]	[[5], [7], [7]]	[[1740816134567, 1740880623999], [1741411789858, 1741414681570], [1741411843662]]	[["01/03/25 19:02", "02/03/25 12:57"], ["08/03/25 16:29", "08/03/25 17:18"], ["08/03/25 16:30"]]
54	Front Lever	{"Advanced Tuck"}	17	[[7, 8]]	[[20]]	[[1741412597488, 1741415283171]]	[["08/03/25 16:43", "08/03/25 17:28"]]
\.


--
-- TOC entry 4851 (class 0 OID 33441)
-- Dependencies: 223
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (user_id, email, password_hash, username, profile_pic, name) FROM stdin;
14	stables@gmail.com	$2a$10$tdXjSIotOFiqUpvVAovYwu9xXWbh8Thm5TDqEb3RaWSqaARiZ7M/e	testaayah	\N	stables
15	alalal@gmail.com	$2a$10$UPuBJARzahnbTSFvpFDoVuxw62UnqTUvKztj7zyKRHEhHN0Pe2QcW	papslsk	\N	alal
16	aaravbajaj08@gmail.com	$2a$10$c2sWDgFpmcKEVofYIMxyyOc.r9JxdkN43bvVFLIm3DrAexaQBl.9q	aarav	\N	Aarav Bajaj
17	aaravbajaj101@gmail.com	$2a$10$oVPUTHQoV6/.0c5YwyQUC.KRKsZwag1WU/xBfWwTbydGP.yjK7kbu	Aarav2	\N	Aarav2
\.


--
-- TOC entry 4853 (class 0 OID 33447)
-- Dependencies: 225
-- Data for Name: workouts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.workouts (workout_id, user_id, title, level, date, custom, workout_time, routine) FROM stdin;
82	16	Front Lever	Intermediate	2025-02-10 06:13:01.730372	f	00:00:06	t
83	16	Muscle Up	Intermediate	2025-02-10 06:25:37.90515	f	00:00:08	t
84	16	Front Lever	Intermediate	2025-03-01 17:39:31.403938	f	00:00:06	t
81	16	he	Custom	2025-02-09 19:10:10.44342	t	00:00:08	f
85	\N	Front Lever	Intermediate	2025-03-01 18:21:07.360258	f	00:00:03	t
86	\N	Front Lever	Advanced	2025-03-01 18:22:15.260459	f	00:00:05	t
87	17	Front Lever	Intermediate	2025-03-01 18:32:04.177874	f	00:00:04	t
88	17	Push	Custom	2025-03-08 20:41:11.866628	t	00:00:17	t
70	16	Muscle Up	Advanced	2025-01-30 12:15:07.755993	f	00:00:11	t
71	16	Front Lever	Intermediate	2025-01-30 12:54:18.450316	f	00:01:06	t
77	16	k	Custom	2025-02-04 15:14:31.167652	t	00:00:24	t
78	16	Front Lever	Intermediate	2025-02-04 17:40:51.68788	f	00:54:43	t
75	16	Hello	Custom	2025-02-04 11:30:36.923563	t	00:00:10	f
79	15	Front Lever	Intermediate	2025-02-09 11:19:08.054228	f	00:22:12	t
74	14	f	Custom	2025-02-03 12:54:23.120315	t	00:23:12	f
76	15	s	Custom	2025-02-04 11:35:08.848708	t	00:23:12	f
73	13	ggffg	Custom	2025-02-02 12:30:01.079929	t	00:55:12	t
80	16	Front Lever	Intermediate	2025-02-09 19:02:52.930339	f	00:55:12	t
\.


--
-- TOC entry 4868 (class 0 OID 0)
-- Dependencies: 218
-- Name: exercises_exercise_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.exercises_exercise_id_seq', 116, true);


--
-- TOC entry 4869 (class 0 OID 0)
-- Dependencies: 228
-- Name: followers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.followers_id_seq', 9, true);


--
-- TOC entry 4870 (class 0 OID 0)
-- Dependencies: 220
-- Name: sets_set_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sets_set_id_seq', 275, true);


--
-- TOC entry 4871 (class 0 OID 0)
-- Dependencies: 222
-- Name: skills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.skills_id_seq', 54, true);


--
-- TOC entry 4872 (class 0 OID 0)
-- Dependencies: 224
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_user_id_seq', 17, true);


--
-- TOC entry 4873 (class 0 OID 0)
-- Dependencies: 226
-- Name: workouts_workout_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.workouts_workout_id_seq', 88, true);


--
-- TOC entry 4681 (class 2606 OID 33460)
-- Name: exercises exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_pkey PRIMARY KEY (exercise_id);


--
-- TOC entry 4691 (class 2606 OID 33647)
-- Name: followers followers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.followers
    ADD CONSTRAINT followers_pkey PRIMARY KEY (id);


--
-- TOC entry 4683 (class 2606 OID 33462)
-- Name: sets sets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sets
    ADD CONSTRAINT sets_pkey PRIMARY KEY (set_id);


--
-- TOC entry 4685 (class 2606 OID 33464)
-- Name: skills skills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_pkey PRIMARY KEY (id);


--
-- TOC entry 4693 (class 2606 OID 33664)
-- Name: followers unique_follow; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.followers
    ADD CONSTRAINT unique_follow UNIQUE (follower_id, following_id);


--
-- TOC entry 4687 (class 2606 OID 33466)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4689 (class 2606 OID 33468)
-- Name: workouts workouts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workouts
    ADD CONSTRAINT workouts_pkey PRIMARY KEY (workout_id);


--
-- TOC entry 4695 (class 2606 OID 33469)
-- Name: sets fk_exercise_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sets
    ADD CONSTRAINT fk_exercise_id FOREIGN KEY (exercise_id) REFERENCES public.exercises(exercise_id) ON DELETE CASCADE;


--
-- TOC entry 4694 (class 2606 OID 33474)
-- Name: exercises fk_workout; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT fk_workout FOREIGN KEY (workout_id) REFERENCES public.workouts(workout_id);


--
-- TOC entry 4696 (class 2606 OID 33479)
-- Name: sets fk_workout_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sets
    ADD CONSTRAINT fk_workout_id FOREIGN KEY (workout_id) REFERENCES public.workouts(workout_id) ON DELETE CASCADE;


--
-- TOC entry 4698 (class 2606 OID 33652)
-- Name: followers followers_follower_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.followers
    ADD CONSTRAINT followers_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 4699 (class 2606 OID 33657)
-- Name: followers followers_following_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.followers
    ADD CONSTRAINT followers_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 4697 (class 2606 OID 33484)
-- Name: skills skills_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


-- Completed on 2025-03-08 21:01:28

--
-- PostgreSQL database dump complete
--

