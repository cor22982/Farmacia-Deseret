--
-- PostgreSQL database dump
--

-- Dumped from database version 16.2
-- Dumped by pg_dump version 16.2

-- Started on 2025-04-30 07:43:53

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
-- TOC entry 240 (class 1259 OID 58163)
-- Name: presentacion_producto; Type: TABLE; Schema: public; Owner: ownerfarmacia
--

CREATE TABLE public.presentacion_producto (
    id integer NOT NULL,
    porcentaje_ganancia numeric(5,2),
    pp numeric(10,2),
    cantidad_presentacion integer,
    presentacion_id integer,
    product_id integer,
    habilitado boolean DEFAULT true,
    imagen_presentacion text
);


ALTER TABLE public.presentacion_producto OWNER TO ownerfarmacia;

--
-- TOC entry 239 (class 1259 OID 58162)
-- Name: presentacion_producto_id_seq; Type: SEQUENCE; Schema: public; Owner: ownerfarmacia
--

CREATE SEQUENCE public.presentacion_producto_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.presentacion_producto_id_seq OWNER TO ownerfarmacia;

--
-- TOC entry 4846 (class 0 OID 0)
-- Dependencies: 239
-- Name: presentacion_producto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ownerfarmacia
--

ALTER SEQUENCE public.presentacion_producto_id_seq OWNED BY public.presentacion_producto.id;


--
-- TOC entry 4688 (class 2604 OID 58166)
-- Name: presentacion_producto id; Type: DEFAULT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.presentacion_producto ALTER COLUMN id SET DEFAULT nextval('public.presentacion_producto_id_seq'::regclass);


--
-- TOC entry 4840 (class 0 OID 58163)
-- Dependencies: 240
-- Data for Name: presentacion_producto; Type: TABLE DATA; Schema: public; Owner: ownerfarmacia
--

INSERT INTO public.presentacion_producto VALUES (1, 1.00, 12.00, 1, 11, 1, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (2, 1.00, 2.50, 10, 3, 2, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (3, 1.00, 25.00, 100, 1, 2, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (4, 1.00, 38.00, 1, 4, 3, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (5, 1.00, 2.50, 10, 3, 4, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (6, 1.00, 25.00, 100, 1, 4, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (7, 1.00, 40.00, 8, 1, 5, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (8, 1.00, 5.00, 1, 7, 5, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (9, 1.00, 7.00, 1, 4, 6, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (10, 1.00, 10.00, 2, 1, 7, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (11, 1.00, 5.00, 1, 31, 7, true, 'tableta.png');
INSERT INTO public.presentacion_producto VALUES (12, 1.00, 17.00, 1, 8, 8, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (13, 1.00, 8.00, 1, 8, 9, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (14, 1.00, 5.00, 10, 3, 10, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (15, 1.00, 50.00, 100, 1, 10, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (16, 1.00, 5.00, 10, 3, 11, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (17, 1.00, 50.00, 100, 1, 11, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (18, 1.00, 4.00, 10, 3, 12, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (19, 1.00, 40.00, 100, 1, 12, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (20, 1.00, 85.00, 1, 26, 13, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (21, 1.00, 6.00, 10, 3, 14, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (22, 1.00, 60.00, 100, 1, 14, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (23, 1.00, 10.00, 10, 3, 15, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (24, 1.00, 100.00, 100, 1, 15, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (25, 1.00, 29.00, 1, 26, 16, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (26, 1.00, 5.00, 10, 3, 17, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (27, 1.00, 50.00, 100, 1, 17, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (28, 1.00, 50.00, 10, 3, 18, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (29, 1.00, 500.00, 100, 1, 18, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (30, 1.00, 23.00, 1, 4, 19, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (31, 1.00, 25.00, 1, 4, 20, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (32, 1.00, 25.00, 1, 25, 20, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (33, 1.00, 54.00, 3, 1, 21, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (34, 1.00, 18.00, 1, 31, 21, true, 'tableta.png');
INSERT INTO public.presentacion_producto VALUES (35, 1.00, 19.00, 1, 4, 22, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (36, 1.00, 9.00, 1, 7, 23, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (37, 1.00, 6.00, 10, 3, 24, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (38, 1.00, 60.00, 100, 1, 24, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (39, 1.00, 9.00, 10, 3, 25, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (40, 1.00, 90.00, 100, 1, 25, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (41, 1.00, 5.00, 10, 3, 26, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (42, 1.00, 50.00, 100, 1, 26, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (43, 1.00, 37.00, 1, 4, 27, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (44, 1.00, 70.00, 10, 1, 28, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (45, 1.00, 7.00, 1, 10, 28, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (46, 1.00, 10.00, 10, 3, 29, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (47, 1.00, 100.00, 100, 1, 29, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (48, 1.00, 15.00, 10, 1, 30, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (49, 1.00, 1.50, 1, 31, 30, true, 'tableta.png');
INSERT INTO public.presentacion_producto VALUES (50, 1.00, 30.00, 1, 4, 31, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (51, 1.00, 17.00, 10, 3, 32, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (52, 1.00, 170.00, 100, 1, 32, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (53, 1.00, 17.00, 1, 20, 33, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (54, 1.00, 16.00, 1, 20, 34, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (55, 1.00, 9.00, 1, 4, 35, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (56, 1.00, 360.00, 40, 1, 35, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (57, 1.00, 2.00, 10, 3, 36, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (58, 1.00, 20.00, 100, 1, 36, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (59, 1.00, 400.00, 10, 1, 37, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (60, 1.00, 40.00, 1, 26, 37, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (61, 1.00, 39.00, 1, 4, 38, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (62, 1.00, 23.00, 1, 20, 39, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (63, 1.00, 150.00, 10, 1, 40, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (64, 1.00, 15.00, 1, 9, 40, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (65, 1.00, 5.00, 10, 3, 41, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (66, 1.00, 50.00, 100, 1, 41, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (67, 1.00, 8.00, 20, 3, 42, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (68, 1.00, 40.00, 100, 1, 42, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (69, 1.00, 39.00, 1, 4, 43, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (70, 1.00, 7.00, 10, 3, 44, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (71, 1.00, 70.00, 100, 1, 44, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (72, 1.00, 0.95, 20, 3, 45, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (73, 1.00, 17.00, 1, 26, 46, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (74, 1.00, 7.00, 10, 3, 47, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (75, 1.00, 70.00, 100, 1, 47, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (76, 1.00, 9.00, 10, 3, 48, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (77, 1.00, 90.00, 100, 1, 48, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (78, 1.00, 0.80, 10, 3, 49, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (79, 1.00, 8.00, 100, 1, 49, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (80, 1.00, 2.50, 10, 3, 50, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (81, 1.00, 25.00, 100, 1, 50, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (82, 1.00, 25.00, 100, 1, 51, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (83, 1.00, 17.00, 10, 3, 52, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (84, 1.00, 170.00, 100, 1, 52, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (85, 1.00, 3.00, 1, 9, 53, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (86, 1.00, 12.00, 10, 3, 54, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (87, 1.00, 120.00, 100, 1, 54, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (88, 1.00, 13.00, 10, 3, 55, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (89, 1.00, 26.00, 20, 1, 55, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (90, 1.00, 7.00, 12, 1, 56, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (91, 1.00, 19.00, 1, 14, 57, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (92, 1.00, 4.00, 10, 3, 58, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (93, 1.00, 20.00, 50, 1, 58, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (94, 1.00, 4.50, 10, 3, 59, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (95, 1.00, 4.50, 10, 1, 59, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (96, 1.00, 8.00, 20, 3, 60, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (97, 1.00, 40.00, 100, 1, 60, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (98, 1.00, 15.00, 10, 3, 61, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (99, 1.00, 45.00, 30, 1, 61, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (100, 1.00, 13.00, 10, 3, 62, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (101, 1.00, 130.00, 100, 1, 62, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (102, 1.00, 20.00, 10, 3, 63, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (103, 1.00, 100.00, 50, 1, 63, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (104, 1.00, 22.00, 1, 4, 64, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (105, 1.00, 85.00, 1, 9, 65, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (106, 1.00, 20.00, 10, 3, 66, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (107, 1.00, 200.00, 100, 1, 66, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (108, 1.00, 600.00, 30, 1, 67, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (109, 1.00, 20.00, 1, 3, 67, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (110, 1.00, 83.00, 10, 1, 68, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (111, 1.00, 8.30, 1, 31, 68, true, 'tableta.png');
INSERT INTO public.presentacion_producto VALUES (112, 1.00, 32.00, 1, 4, 69, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (113, 1.00, 20.00, 1, 4, 70, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (114, 1.00, 20.00, 1, 26, 70, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (115, 1.00, 94.00, 1, 26, 71, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (116, 1.00, 12.00, 2, 1, 72, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (117, 1.00, 6.00, 1, 17, 72, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (118, 1.00, 45.00, 30, 1, 73, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (119, 1.00, 15.00, 10, 3, 73, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (120, 1.00, 3.00, 10, 3, 74, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (121, 1.00, 30.00, 100, 1, 74, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (122, 1.00, 12.00, 10, 3, 75, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (123, 1.00, 120.00, 100, 1, 75, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (124, 1.00, 24.00, 1, 20, 76, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (125, 1.00, 12.00, 10, 3, 77, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (126, 1.00, 36.00, 30, 1, 77, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (127, 1.00, 2.00, 10, 3, 78, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (128, 1.00, 10.00, 50, 1, 78, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (129, 1.00, 35.00, 10, 1, 79, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (130, 1.00, 19.00, 1, 4, 80, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (131, 1.00, 126.00, 14, 1, 81, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (132, 1.00, 900.00, 12, 1, 82, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (133, 1.00, 13.00, 1, 4, 83, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (134, 1.00, 5.00, 10, 3, 84, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (135, 1.00, 50.00, 100, 1, 84, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (136, 1.00, 4.00, 10, 3, 85, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (137, 1.00, 40.00, 100, 1, 85, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (138, 1.00, 5.00, 10, 3, 86, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (139, 1.00, 50.00, 100, 1, 86, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (140, 1.00, 7.00, 10, 3, 87, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (141, 1.00, 70.00, 100, 1, 87, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (142, 1.00, 1.00, 10, 3, 88, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (143, 1.00, 5.00, 50, 1, 88, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (144, 1.00, 1.40, 10, 3, 89, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (145, 1.00, 14.00, 100, 1, 89, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (146, 1.00, 20.00, 10, 3, 90, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (147, 1.00, 200.00, 100, 1, 90, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (148, 1.00, 61.00, 10, 3, 91, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (149, 1.00, 183.00, 30, 1, 91, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (150, 1.00, 39.60, 10, 3, 92, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (151, 1.00, 118.80, 30, 1, 92, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (152, 1.00, 42.00, 10, 3, 93, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (153, 1.00, 126.00, 30, 1, 93, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (154, 1.00, 150.00, 100, 1, 94, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (155, 1.00, 1.50, 1, 19, 94, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (156, 1.00, 150.00, 100, 1, 95, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (157, 1.00, 1.50, 1, 19, 95, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (158, 1.00, 100.00, 100, 1, 96, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (159, 1.00, 1.00, 1, 19, 96, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (160, 1.00, 100.00, 100, 1, 97, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (161, 1.00, 1.00, 1, 19, 97, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (162, 1.00, 100.00, 100, 1, 98, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (163, 1.00, 1.00, 1, 19, 98, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (164, 1.00, 100.00, 100, 1, 99, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (165, 1.00, 1.00, 1, 19, 99, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (166, 1.00, 100.00, 100, 1, 100, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (167, 1.00, 1.00, 1, 19, 100, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (168, 1.00, 10.00, 1, 20, 101, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (169, 1.00, 2.00, 10, 3, 102, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (170, 1.00, 10.00, 50, 1, 102, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (171, 1.00, 1.40, 10, 3, 103, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (172, 1.00, 14.00, 100, 1, 103, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (173, 1.00, 25.00, 1, 14, 104, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (174, 1.00, 27.00, 1, 4, 105, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (175, 1.00, 90.00, 100, 1, 106, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (176, 1.00, 10.00, 10, 1, 107, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (177, 1.00, 1.00, 1, 31, 107, true, 'tableta.png');
INSERT INTO public.presentacion_producto VALUES (178, 1.00, 78.00, 30, 1, 108, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (179, 1.00, 13.00, 5, 3, 108, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (180, 1.00, 25.00, 100, 1, 109, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (181, 1.00, 5.00, 20, 3, 109, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (182, 1.00, 40.00, 100, 1, 110, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (183, 1.00, 15.00, 1, 26, 111, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (184, 1.00, 270.00, 18, 1, 114, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (185, 1.00, 10.00, 10, 3, 115, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (186, 1.00, 100.00, 100, 1, 115, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (187, 1.00, 105.00, 100, 1, 116, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (188, 1.00, 10.50, 10, 3, 116, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (189, 1.00, 6.00, 10, 3, 117, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (190, 1.00, 60.00, 100, 1, 117, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (191, 1.00, 70.00, 10, 3, 118, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (192, 1.00, 7.00, 1, 31, 118, true, 'tableta.png');
INSERT INTO public.presentacion_producto VALUES (193, 1.00, 8.00, 10, 3, 119, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (194, 1.00, 80.00, 100, 1, 119, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (195, 1.00, 8.00, 10, 3, 120, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (196, 1.00, 80.00, 100, 1, 120, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (197, 1.00, 19.00, 1, 4, 121, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (198, 1.00, 85.00, 50, 1, 122, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (199, 1.00, 17.00, 10, 3, 122, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (200, 1.00, 15.00, 10, 3, 123, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (201, 1.00, 150.00, 100, 1, 123, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (202, 1.00, 32.00, 1, 4, 124, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (203, 1.00, 7.50, 50, 1, 125, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (204, 1.00, 1.50, 10, 3, 125, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (205, 1.00, 18.00, 1, 4, 126, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (206, 1.00, 19.00, 1, 20, 127, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (207, 1.00, 16.00, 1, 25, 128, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (208, 1.00, 45.00, 1, 10, 129, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (209, 1.00, 192.00, 6, 1, 130, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (210, 1.00, 32.00, 1, 31, 130, true, 'tableta.png');
INSERT INTO public.presentacion_producto VALUES (211, 1.00, 5.00, 10, 3, 131, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (212, 1.00, 50.00, 100, 1, 131, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (213, 1.00, 49.00, 1, 20, 132, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (214, 1.00, 52.00, 1, 20, 133, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (215, 1.00, 4.20, 10, 3, 134, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (216, 1.00, 42.00, 100, 1, 134, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (217, 1.00, 10.00, 1, 17, 135, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (218, 1.00, 66.00, 30, 1, 136, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (219, 1.00, 60.00, 30, 1, 137, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (220, 1.00, 20.00, 10, 3, 137, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (221, 1.00, 75.00, 3, 1, 138, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (222, 1.00, 25.00, 1, 13, 138, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (223, 1.00, 72.00, 3, 1, 139, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (224, 1.00, 24.00, 1, 13, 139, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (225, 1.00, 60.00, 3, 1, 140, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (226, 1.00, 20.00, 1, 13, 140, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (227, 1.00, 105.00, 3, 1, 141, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (228, 1.00, 35.00, 1, 13, 141, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (229, 1.00, 81.00, 3, 1, 142, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (230, 1.00, 27.00, 1, 13, 142, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (231, 1.00, 4.50, 30, 1, 143, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (232, 1.00, 1.50, 10, 3, 143, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (233, 1.00, 1.00, 1, 7, 144, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (234, 1.00, 23.00, 1, 4, 145, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (235, 1.00, 36.00, 4, 1, 146, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (236, 1.00, 9.00, 1, 31, 146, true, 'tableta.png');
INSERT INTO public.presentacion_producto VALUES (237, 1.00, 32.00, 4, 1, 147, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (238, 1.00, 8.00, 1, 31, 147, true, 'tableta.png');
INSERT INTO public.presentacion_producto VALUES (239, 1.00, 20.00, 1, 25, 148, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (240, 1.00, 23.00, 1, 11, 149, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (241, 1.00, 3.00, 30, 1, 150, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (242, 1.00, 1.00, 10, 3, 150, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (243, 1.00, 240.00, 24, 1, 151, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (244, 1.00, 10.00, 1, 31, 151, true, 'tableta.png');
INSERT INTO public.presentacion_producto VALUES (245, 1.00, 1.60, 20, 3, 152, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (246, 1.00, 8.00, 100, 1, 152, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (247, 1.00, 8.00, 16, 1, 154, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (248, 1.00, 0.50, 1, 7, 154, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (249, 1.00, 3.00, 10, 3, 155, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (250, 1.00, 3.00, 1, 32, 156, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (251, 1.00, 132.00, 30, 1, 157, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (252, 1.00, 44.00, 10, 3, 157, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (253, 1.00, 7.00, 10, 3, 158, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (254, 1.00, 70.00, 100, 1, 158, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (255, 1.00, 35.00, 1, 26, 159, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (256, 1.00, 450.00, 30, 1, 160, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (257, 1.00, 36.00, 1, 9, 161, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (258, 1.00, 60.00, 1, 14, 162, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (259, 1.00, 60.00, 24, 1, 163, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (260, 0.00, 0.00, 1, 26, 164, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (261, 1.00, 60.00, 24, 1, 165, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (262, 1.00, 120.00, 24, 1, 166, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (263, 1.00, 120.00, 24, 1, 167, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (264, 1.00, 8.00, 1, 9, 168, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (265, 1.00, 75.00, 30, 1, 169, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (266, 1.00, 25.00, 10, 3, 169, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (267, 1.00, 2.50, 10, 3, 170, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (268, 1.00, 11.40, 20, 1, 171, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (269, 1.00, 5.70, 10, 3, 171, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (270, 1.00, 7.00, 10, 3, 172, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (271, 1.00, 35.00, 50, 1, 172, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (272, 1.00, 40.00, 100, 1, 173, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (273, 1.00, 4.00, 10, 3, 173, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (274, 1.00, 69.00, 1, 26, 174, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (275, 1.00, 33.00, 1, 26, 175, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (276, 1.00, 31.00, 1, 4, 176, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (277, 1.00, 32.00, 1, 26, 177, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (278, 1.00, 45.00, 1, 7, 178, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (279, 1.00, 144.00, 72, 1, 179, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (280, 1.00, 56.25, 100, 1, 180, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (281, 1.00, 2.25, 4, 3, 180, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (282, 1.00, 85.00, 1, 31, 181, true, 'tableta.png');
INSERT INTO public.presentacion_producto VALUES (283, 1.00, 8500.00, 100, 1, 182, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (284, 1.00, 85.00, 1, 31, 182, true, 'tableta.png');
INSERT INTO public.presentacion_producto VALUES (285, 1.00, 40.00, 1, 4, 183, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (286, 1.00, 5.00, 4, 3, 184, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (287, 1.00, 25.00, 20, 1, 184, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (288, 1.00, 26.00, 1, 21, 185, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (289, 1.00, 63.00, 1, 14, 186, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (290, 1.00, 0.75, 1, 7, 187, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (291, 1.00, 12.00, 1, 26, 188, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (292, 1.00, 30.00, 1, 26, 189, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (293, 1.00, 2.50, 12, 3, 190, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (294, 1.00, 5.00, 24, 1, 190, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (295, 1.00, 100.00, 100, 1, 191, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (296, 1.00, 68.00, 1, 4, 192, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (297, 1.00, 45.00, 1, 7, 193, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (298, 1.00, 65.00, 1, 31, 194, true, 'tableta.png');
INSERT INTO public.presentacion_producto VALUES (299, 1.00, 65.00, 1, 4, 194, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (300, 1.00, 20.00, 1, 14, 195, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (301, 1.00, 80.00, 1, 1, 196, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (302, 1.00, 80.00, 1, 1, 197, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (303, 1.00, 80.00, 1, 1, 198, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (304, 1.00, 80.00, 1, 1, 199, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (305, 1.00, 110.00, 1, 1, 200, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (306, 1.00, 17.00, 1, 10, 201, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (307, 1.00, 2.80, 10, 3, 202, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (308, 1.00, 5.60, 20, 1, 202, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (309, 1.00, 40.00, 1, 4, 203, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (310, 1.00, 68.00, 1, 4, 204, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (311, 1.00, 4.00, 1, 8, 205, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (312, 1.00, 3.20, 10, 3, 206, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (313, 1.00, 32.00, 100, 1, 206, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (314, 1.00, 68.00, 1, 1, 207, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (315, 1.00, 28.25, 100, 1, 208, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (316, 1.00, 1.13, 4, 3, 208, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (317, 1.00, 68.00, 1, 1, 209, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (318, 1.00, 142.00, 10, 1, 210, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (319, 1.00, 17.00, 100, 1, 211, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (320, 1.00, 700.00, 28, 1, 212, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (321, 1.00, 350.00, 14, 3, 212, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (322, 1.00, 110.00, 1, 4, 213, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (323, 1.00, 29.00, 1, 1, 214, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (324, 1.00, 29.00, 1, 1, 215, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (325, 1.00, 20.00, 1, 26, 216, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (326, 1.00, 20.00, 1, 26, 217, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (327, 1.00, 10.00, 100, 1, 218, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (328, 1.00, 1.00, 10, 3, 218, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (329, 1.00, 20.00, 1, 14, 219, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (330, 1.00, 44.00, 100, 1, 220, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (331, 1.00, 40.00, 1, 4, 221, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (332, 1.00, 10.00, 10, 3, 222, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (333, 1.00, 100.00, 100, 1, 222, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (334, 1.00, 96.00, 24, 1, 223, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (335, 1.00, 96.00, 24, 1, 224, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (336, 1.00, 40.00, 1, 1, 225, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (337, 1.00, 96.00, 120, 1, 226, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (338, 1.00, 4.00, 5, 3, 226, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (339, 1.00, 82.00, 1, 1, 227, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (340, 1.00, 50.00, 1, 14, 228, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (341, 1.00, 8.00, 5, 3, 229, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (342, 1.00, 96.00, 60, 1, 229, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (343, 1.00, 49.00, 1, 14, 230, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (344, 1.00, 1.20, 10, 3, 231, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (345, 1.00, 18.00, 150, 1, 231, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (346, 1.00, 100.00, 100, 1, 232, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (347, 1.00, 10.00, 60, 1, 233, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (348, 1.00, 2.00, 12, 3, 233, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (349, 1.00, 29.00, 1, 26, 234, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (350, 1.00, 12.00, 1, 1, 235, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (351, 1.00, 20.00, 1, 9, 236, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (352, 1.00, 55.00, 1, 4, 239, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (353, 1.00, 7.00, 1, 9, 240, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (354, 1.00, 120.00, 48, 1, 241, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (355, 1.00, 10.00, 4, 3, 241, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (356, 1.00, 35.00, 1, 26, 242, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (357, 1.00, 39.00, 1, 1, 243, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (358, 1.00, 39.00, 1, 1, 244, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (359, 1.00, 0.50, 100, 7, 245, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (360, 1.00, 95.00, 1, 1, 246, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (361, 1.00, 56.04, 60, 1, 247, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (362, 1.00, 9.34, 10, 3, 247, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (363, 1.00, 26.00, 1, 4, 248, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (364, 1.00, 3.00, 24, 1, 249, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (365, 1.00, 3.00, 24, 1, 250, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (366, 1.00, 10.00, 1, 26, 251, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (367, 1.00, 19.00, 1, 8, 252, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (368, 1.00, 19.00, 1, 8, 253, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (369, 1.00, 19.00, 1, 8, 254, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (370, 1.00, 19.00, 1, 8, 255, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (371, 1.00, 19.00, 1, 8, 256, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (372, 1.00, 19.00, 1, 8, 257, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (373, 1.00, 19.00, 1, 8, 258, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (374, 1.00, 19.00, 1, 8, 259, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (375, 1.00, 28.00, 1, 4, 260, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (376, 1.00, 10.00, 1, 4, 261, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (377, 1.00, 20.00, 100, 1, 262, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (378, 1.00, 2.00, 10, 3, 262, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (379, 1.00, 19.00, 10, 3, 263, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (380, 1.00, 95.00, 50, 1, 263, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (381, 1.00, 23.00, 1, 8, 264, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (382, 1.00, 40.00, 1, 4, 265, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (383, 1.00, 35.00, 50, 1, 266, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (384, 1.00, 7.00, 10, 3, 266, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (385, 1.00, 70.00, 40, 1, 267, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (386, 1.00, 110.00, 100, 1, 268, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (387, 1.00, 11.00, 10, 3, 268, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (388, 1.00, 10.00, 1, 8, 269, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (389, 1.00, 13.00, 1, 4, 270, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (390, 1.00, 130.00, 10, 7, 270, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (391, 1.00, 50.00, 1, 4, 271, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (392, 1.00, 3.50, 1, 2, 272, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (393, 1.00, 4.70, 10, 3, 273, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (394, 1.00, 47.00, 100, 1, 273, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (395, 1.00, 0.90, 10, 3, 274, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (396, 1.00, 45.00, 500, 1, 274, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (397, 1.00, 77.00, 1, 20, 275, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (398, 1.00, 77.00, 1, 27, 276, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (399, 1.00, 8.00, 1, 9, 277, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (400, 1.00, 31.25, 100, 1, 278, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (401, 1.00, 1.25, 4, 3, 278, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (402, 1.00, 3.50, 1, 2, 279, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (403, 1.00, 43.75, 100, 1, 280, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (404, 1.00, 10.00, 1, 9, 281, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (405, 1.00, 55.00, 1, 1, 282, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (406, 1.00, 150.00, 30, 1, 283, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (407, 1.00, 50.00, 10, 3, 283, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (408, 1.00, 100.00, 50, 1, 284, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (409, 1.00, 72.00, 24, 1, 285, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (410, 1.00, 78.00, 26, 1, 286, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (411, 1.00, 130.00, 52, 1, 287, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (412, 1.00, 144.00, 60, 1, 288, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (413, 1.00, 12.00, 5, 3, 288, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (414, 1.00, 43.00, 1, 8, 289, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (415, 1.00, 2.00, 1, 1, 290, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (416, 1.00, 2.00, 1, 31, 290, true, 'tableta.png');
INSERT INTO public.presentacion_producto VALUES (417, 1.00, 0.65, 20, 3, 291, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (418, 1.00, 3.25, 100, 1, 291, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (419, 1.00, 10.00, 1, 4, 292, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (420, 1.00, 13.00, 1, 20, 293, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (421, 1.00, 22.00, 1, 20, 294, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (422, 1.00, 15.00, 1, 20, 295, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (423, 1.00, 25.00, 1, 26, 296, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (424, 1.00, 19.00, 1, 14, 297, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (425, 1.00, 35.00, 1, 26, 298, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (426, 1.00, 45.00, 1, 1, 299, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (427, 1.00, 18.00, 1, 26, 300, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (428, 1.00, 20.00, 1, 26, 301, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (429, 1.00, 100.00, 50, 1, 302, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (430, 1.00, 100.00, 50, 1, 303, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (431, 1.00, 25.00, 1, 27, 304, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (432, 1.00, 80.00, 50, 1, 305, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (433, 1.00, 8.00, 5, 3, 305, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (434, 1.00, 8.00, 1, 4, 306, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (435, 1.00, 10.00, 100, 1, 307, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (436, 1.00, 1.00, 10, 3, 307, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (437, 1.00, 250.00, 1000, 1, 308, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (438, 1.00, 66.00, 200, 1, 309, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (439, 1.00, 20.00, 1, 1, 310, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (440, 1.00, 70.00, 1, 8, 311, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (441, 1.00, 15.00, 1, 1, 312, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (442, 1.00, 150.00, 30, 1, 313, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (443, 1.00, 5.00, 1, 1, 314, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (444, 1.00, 55.00, 10, 1, 315, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (445, 1.00, 5.50, 1, 10, 315, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (446, 1.00, 25.00, 1, 26, 316, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (447, 1.00, 80.00, 100, 1, 317, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (448, 1.00, 20.00, 20, 1, 318, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (449, 1.00, 57.00, 1, 1, 319, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (450, 1.00, 57.00, 1, 1, 320, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (451, 1.00, 57.00, 1, 1, 321, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (452, 1.00, 57.00, 1, 1, 322, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (453, 1.00, 30.00, 20, 1, 323, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (454, 1.00, 30.00, 20, 1, 324, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (455, 1.00, 30.00, 20, 1, 325, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (456, 1.00, 30.00, 20, 1, 326, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (457, 1.00, 40.00, 20, 1, 327, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (458, 1.00, 30.00, 20, 1, 328, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (459, 1.00, 23.00, 20, 1, 329, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (460, 1.00, 30.00, 20, 1, 330, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (461, 1.00, 20.00, 20, 1, 331, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (462, 1.00, 30.00, 20, 1, 332, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (463, 1.00, 30.00, 20, 1, 333, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (464, 1.00, 30.00, 20, 1, 334, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (465, 1.00, 50.00, 1, 4, 335, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (466, 1.00, 33.00, 1, 20, 336, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (467, 1.00, 100.00, 100, 1, 337, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (468, 1.00, 100.00, 100, 1, 338, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (469, 1.00, 10.00, 10, 3, 338, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (470, 1.00, 40.00, 10, 1, 339, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (471, 1.00, 70.00, 1, 4, 340, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (472, 1.00, 30.00, 3, 1, 341, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (473, 1.00, 50.00, 1, 4, 342, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (474, 1.00, 58.00, 1, 20, 343, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (475, 1.00, 16.00, 1, 19, 344, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (476, 1.00, 16.00, 1, 19, 345, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (477, 1.00, 3.00, 100, 2, 346, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (478, 1.00, 40.00, 1, 4, 347, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (479, 1.00, 96.00, 24, 1, 348, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (480, 1.00, 10.00, 12, 1, 349, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (481, 1.00, 5.80, 1, 9, 350, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (482, 1.00, 80.00, 1, 1, 351, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (483, 1.00, 100.00, 100, 1, 352, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (484, 1.00, 128.00, 16, 1, 353, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (485, 1.00, 8.00, 1, 13, 353, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (486, 1.00, 128.00, 16, 1, 354, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (487, 1.00, 8.00, 1, 13, 354, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (488, 1.00, 27.00, 1, 8, 355, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (489, 1.00, 32.00, 1, 26, 356, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (490, 1.00, 90.00, 100, 2, 357, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (491, 1.00, 19.00, 1, 8, 358, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (492, 1.00, 20.00, 1, 4, 359, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (493, 1.00, 18.00, 1, 26, 360, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (494, 1.00, 4.50, 1, 1, 361, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (495, 1.00, 4.50, 1, 1, 362, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (496, 1.00, 4.50, 1, 1, 363, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (497, 1.00, 0.50, 1, 10, 364, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (498, 1.00, 45.00, 1, 25, 365, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (499, 1.00, 18.00, 1, 4, 366, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (500, 1.00, 13.00, 1, 26, 367, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (501, 1.00, 20.00, 10, 3, 368, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (502, 1.00, 100.00, 50, 1, 368, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (503, 1.00, 12.00, 10, 3, 369, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (504, 1.00, 120.00, 100, 1, 369, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (505, 1.00, 9.00, 1, 20, 370, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (506, 1.00, 11.00, 1, 20, 371, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (507, 1.00, 5.00, 20, 3, 372, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (508, 1.00, 25.00, 100, 1, 372, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (509, 1.00, 2.50, 1, 8, 373, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (510, 1.00, 2.00, 1, 8, 374, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (511, 1.00, 8.00, 1, 25, 375, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (512, 1.00, 2.50, 1, 8, 376, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (513, 1.00, 10.00, 1, 1, 377, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (514, 1.00, 65.00, 1, 26, 378, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (515, 1.00, 59.00, 1, 25, 379, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (516, 1.00, 72.00, 1, 1, 380, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (517, 1.00, 19.00, 1, 8, 381, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (518, 1.00, 22.50, 1, 1, 382, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (519, 1.00, 24.00, 4, 1, 383, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (520, 1.00, 6.00, 1, 31, 383, true, 'tableta.png');
INSERT INTO public.presentacion_producto VALUES (521, 1.00, 29.00, 1, 26, 384, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (522, 1.00, 4.50, 1, 31, 385, true, 'tableta.png');
INSERT INTO public.presentacion_producto VALUES (523, 1.00, 47.00, 10, 3, 386, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (524, 1.00, 94.00, 20, 1, 386, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (525, 1.00, 15.00, 1, 1, 387, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (526, 1.00, 27.00, 1, 1, 388, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (527, 1.00, 10.00, 1, 32, 389, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (528, 1.00, 23.00, 1, 21, 390, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (529, 1.00, 34.00, 1, 20, 391, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (530, 1.00, 59.00, 1, 27, 392, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (531, 1.00, 26.72, 16, 1, 393, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (532, 1.00, 7.60, 30, 1, 394, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (533, 1.00, 3.80, 15, 3, 394, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (534, 1.00, 58.00, 1, 8, 395, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (535, 1.00, 25.00, 10, 3, 396, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (536, 1.00, 2.50, 1, 31, 396, true, 'tableta.png');
INSERT INTO public.presentacion_producto VALUES (537, 1.00, 14.00, 1, 27, 397, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (538, 1.00, 22.00, 1, 25, 398, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (539, 1.00, 75.00, 50, 1, 399, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (540, 1.00, 52.00, 1, 1, 400, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (541, 1.00, 66.00, 1, 27, 401, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (542, 1.00, 35.00, 1, 20, 402, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (543, 1.00, 33.00, 10, 3, 403, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (544, 1.00, 99.00, 30, 1, 403, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (545, 1.00, 7.00, 10, 3, 404, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (546, 1.00, 70.00, 100, 1, 404, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (547, 1.00, 25.00, 10, 3, 405, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (548, 1.00, 2.50, 1, 31, 405, true, 'tableta.png');
INSERT INTO public.presentacion_producto VALUES (549, 1.00, 8.66, 24, 1, 406, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (550, 1.00, 4.33, 12, 3, 406, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (551, 1.00, 320.00, 10, 3, 407, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (552, 1.00, 32.00, 1, 31, 407, true, 'tableta.png');
INSERT INTO public.presentacion_producto VALUES (553, 1.00, 28.00, 1, 4, 408, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (554, 1.00, 24.00, 1, 4, 409, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (555, 1.00, 16.00, 1, 4, 410, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (556, 1.00, 3.50, 1, 9, 411, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (557, 1.00, 4.00, 20, 3, 412, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (558, 1.00, 20.00, 100, 1, 412, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (559, 1.00, 10.00, 1, 26, 413, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (560, 1.00, 1.00, 102, 1, 414, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (561, 1.00, 10.00, 1, 20, 415, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (562, 1.00, 9.00, 1, 21, 416, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (563, 1.00, 20.00, 1, 1, 417, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (564, 1.00, 16.00, 1, 21, 418, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (565, 0.00, 0.00, 1, 8, 419, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (566, 0.00, 0.00, 1, 8, 420, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (567, 1.00, 170.00, 100, 1, 421, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (568, 1.00, 17.00, 10, 3, 421, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (569, 1.00, 20.00, 20, 3, 422, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (570, 1.00, 100.00, 100, 1, 422, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (571, 1.00, 10.00, 1, 3, 423, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (572, 1.00, 3.00, 1, 8, 424, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (573, 1.00, 3.00, 1, 8, 425, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (574, 1.00, 3.00, 1, 7, 426, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (575, 1.00, 58.00, 1, 25, 427, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (576, 1.00, 40.00, 1, 9, 428, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (577, 1.00, 10.00, 100, 1, 429, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (578, 1.00, 1.00, 10, 3, 429, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (579, 1.00, 26.00, 1, 4, 430, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (580, 1.00, 4.00, 1, 9, 431, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (581, 1.00, 19.00, 1, 14, 432, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (582, 1.00, 19.00, 20, 3, 433, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (583, 1.00, 0.95, 1, 31, 433, true, 'tableta.png');
INSERT INTO public.presentacion_producto VALUES (584, 1.00, 12.00, 1, 21, 434, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (585, 1.00, 9.00, 1, 21, 435, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (586, 1.00, 20.00, 1, 4, 436, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (587, 1.00, 4.00, 1, 9, 437, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (588, 1.00, 2.50, 10, 3, 438, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (589, 1.00, 25.00, 100, 1, 438, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (590, 1.00, 20.00, 10, 3, 439, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (591, 1.00, 2.00, 1, 31, 439, true, 'tableta.png');
INSERT INTO public.presentacion_producto VALUES (592, 1.00, 11.00, 10, 3, 440, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (593, 1.00, 110.00, 100, 1, 440, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (594, 1.00, 40.00, 1, 16, 441, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (595, 1.00, 54.00, 12, 1, 442, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (596, 1.00, 8.00, 20, 3, 443, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (597, 1.00, 40.00, 100, 1, 443, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (598, 1.00, 25.00, 1, 4, 444, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (599, 1.00, 41.00, 1, 26, 445, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (600, 1.00, 8.00, 1, 9, 446, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (601, 1.00, 0.90, 10, 3, 447, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (602, 1.00, 6.30, 70, 1, 447, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (603, 1.00, 20.00, 1, 14, 448, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (604, 1.00, 23.00, 1, 4, 449, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (605, 1.00, 500.00, 100, 1, 450, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (606, 1.00, 5.00, 1, 31, 450, true, 'tableta.png');
INSERT INTO public.presentacion_producto VALUES (607, 1.00, 750.00, 10, 1, 451, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (608, 1.00, 75.00, 1, 9, 451, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (609, 1.00, 6.00, 1, 1, 452, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (610, 1.00, 6.00, 1, 1, 453, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (611, 1.00, 15.00, 1, 17, 454, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (612, 1.00, 8.00, 1, 1, 455, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (613, 1.00, 6.00, 50, 1, 456, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (614, 1.00, 1.20, 10, 3, 456, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (615, 1.00, 3.50, 1, 1, 457, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (616, 1.00, 4.00, 1, 9, 458, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (617, 1.00, 30.00, 100, 1, 459, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (618, 1.00, 3.00, 10, 3, 459, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (619, 1.00, 5.00, 10, 3, 460, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (620, 1.00, 3.00, 1, 9, 461, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (621, 1.00, 4.00, 20, 3, 462, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (622, 1.00, 20.00, 100, 1, 462, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (623, 1.00, 6.00, 10, 3, 463, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (624, 1.00, 60.00, 100, 1, 463, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (625, 1.00, 4.00, 1, 4, 464, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (626, 1.00, 24.00, 1, 26, 465, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (627, 1.00, 16.00, 1, 26, 466, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (628, 1.00, 20.00, 1, 20, 467, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (629, 1.00, 510.00, 30, 1, 468, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (630, 1.00, 17.00, 1, 31, 468, true, 'tableta.png');
INSERT INTO public.presentacion_producto VALUES (631, 1.00, 14.00, 1, 25, 469, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (632, 1.00, 5.70, 30, 1, 470, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (633, 1.00, 1.90, 10, 3, 470, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (634, 1.00, 84.00, 30, 1, 471, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (635, 1.00, 28.00, 10, 3, 471, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (636, 1.00, 99.00, 30, 1, 472, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (637, 1.00, 33.00, 10, 3, 472, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (638, 1.00, 38.33, 1, 1, 473, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (639, 1.00, 13.00, 1, 9, 474, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (640, 1.00, 30.00, 1, 8, 475, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (641, 1.00, 7.00, 100, 1, 476, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (642, 1.00, 0.70, 10, 3, 476, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (643, 1.00, 28.00, 1, 3, 477, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (644, 1.00, 3.00, 1, 4, 478, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (645, 1.00, 3.00, 1, 4, 479, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (646, 1.00, 50.00, 100, 1, 480, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (647, 1.00, 10.00, 20, 3, 480, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (648, 1.00, 7.00, 10, 3, 481, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (649, 1.00, 70.00, 100, 1, 481, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (650, 1.00, 5.00, 10, 3, 482, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (651, 1.00, 50.00, 100, 1, 482, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (652, 1.00, 6.00, 1, 8, 483, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (653, 1.00, 6.00, 1, 8, 484, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (654, 1.00, 10.00, 1, 25, 485, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (655, 1.00, 4.00, 1, 3, 486, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (656, 1.00, 7.00, 1, 9, 487, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (657, 1.00, 18.00, 30, 1, 488, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (658, 1.00, 6.00, 10, 3, 488, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (659, 1.00, 480.00, 30, 1, 489, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (660, 1.00, 160.00, 10, 3, 489, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (661, 1.00, 16.00, 1, 17, 489, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (662, 1.00, 10.00, 10, 3, 490, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (663, 1.00, 100.00, 100, 1, 490, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (664, 1.00, 8.33, 10, 3, 491, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (665, 1.00, 24.99, 30, 1, 491, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (666, 1.00, 8.00, 1, 9, 492, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (667, 1.00, 380.00, 10, 1, 493, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (668, 1.00, 38.00, 1, 32, 493, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (669, 1.00, 13.00, 1, 25, 494, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (670, 1.00, 5.00, 10, 3, 495, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (671, 1.00, 50.00, 100, 1, 495, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (672, 1.00, 25.00, 1, 1, 496, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (673, 1.00, 26.00, 1, 1, 497, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (674, 1.00, 12.00, 1, 20, 498, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (675, 1.00, 2.00, 1, 3, 499, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (676, 1.00, 32.00, 1, 4, 500, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (677, 1.00, 10.00, 1, 9, 501, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (678, 1.00, 12.00, 1, 9, 502, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (679, 1.00, 17.00, 1, 14, 503, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (680, 1.00, 10.00, 10, 3, 504, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (681, 1.00, 30.00, 30, 1, 504, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (682, 1.00, 49.00, 10, 3, 505, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (683, 1.00, 147.00, 30, 1, 505, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (684, 1.00, 15.00, 10, 3, 506, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (685, 1.00, 150.00, 100, 1, 506, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (686, 1.00, 4.00, 10, 3, 507, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (687, 1.00, 40.00, 100, 1, 507, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (688, 1.00, 4.00, 1, 9, 508, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (689, 1.00, 10.00, 20, 3, 509, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (690, 1.00, 50.00, 100, 1, 509, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (691, 1.00, 9.50, 1, 1, 510, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (692, 0.00, 0.00, 10, 3, 511, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (693, 0.00, 0.00, 100, 1, 511, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (694, 1.00, 30.00, 100, 1, 512, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (695, 1.00, 3.00, 10, 3, 512, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (696, 1.00, 55.00, 1, 27, 513, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (697, 1.00, 23.00, 1, 8, 514, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (698, 1.00, 23.00, 1, 8, 515, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (699, 1.00, 23.00, 1, 8, 516, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (700, 1.00, 23.00, 1, 8, 517, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (701, 1.00, 15.00, 1, 8, 518, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (702, 1.00, 15.00, 1, 8, 519, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (703, 1.00, 15.00, 1, 8, 520, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (704, 1.00, 15.00, 1, 8, 521, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (705, 1.00, 29.00, 1, 8, 522, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (706, 1.00, 29.00, 1, 8, 523, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (707, 1.00, 29.00, 1, 8, 524, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (708, 1.00, 29.00, 1, 8, 525, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (709, 1.00, 6.00, 1, 1, 526, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (710, 1.00, 11.00, 1, 8, 527, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (711, 1.00, 9.00, 1, 1, 528, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (712, 1.00, 25.00, 1, 4, 529, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (713, 1.00, 0.70, 10, 3, 530, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (714, 1.00, 2.10, 30, 1, 530, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (715, 1.00, 30.00, 1, 4, 531, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (716, 1.00, 20.00, 1, 4, 532, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (717, 1.00, 36.00, 4, 3, 533, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (718, 1.00, 9.00, 1, 31, 533, true, 'tableta.png');
INSERT INTO public.presentacion_producto VALUES (719, 1.00, 1.50, 1, 1, 534, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (720, 1.00, 8.00, 1, 3, 535, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (721, 1.00, 6.00, 10, 3, 536, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (722, 1.00, 60.00, 100, 1, 536, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (723, 1.00, 0.25, 1, 8, 537, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (724, 1.00, 37.00, 1, 26, 538, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (725, 1.00, 120.00, 100, 1, 539, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (726, 1.00, 12.00, 10, 3, 539, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (727, 1.00, 25.00, 1, 1, 540, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (728, 1.00, 20.00, 1, 8, 541, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (729, 1.00, 28.00, 1, 8, 542, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (730, 1.00, 16.00, 1, 8, 543, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (731, 1.00, 47.00, 1, 10, 544, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (732, 0.00, 0.00, 1, 8, 545, true, 'frasco.png');
INSERT INTO public.presentacion_producto VALUES (733, 1.00, 35.00, 1, 1, 546, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (734, 1.00, 8.00, 1, 7, 547, true, 'cualquiera.png');
INSERT INTO public.presentacion_producto VALUES (735, 1.00, 16.00, 1, 1, 548, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (736, 1.00, 8.00, 1, 1, 549, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (737, 1.00, 1000.00, 100, 1, 550, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (738, 1.00, 10.00, 1, 3, 550, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (739, 1.00, 26.00, 10, 3, 551, true, 'blister.png');
INSERT INTO public.presentacion_producto VALUES (740, 1.00, 156.00, 60, 1, 551, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (741, 1.00, 9.00, 60, 1, 552, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (742, 1.00, 23.00, 10, 1, 553, true, 'caja.png');
INSERT INTO public.presentacion_producto VALUES (743, 1.00, 2.30, 1, 31, 553, true, 'tableta.png');


--
-- TOC entry 4847 (class 0 OID 0)
-- Dependencies: 239
-- Name: presentacion_producto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ownerfarmacia
--

SELECT pg_catalog.setval('public.presentacion_producto_id_seq', 743, true);


--
-- TOC entry 4691 (class 2606 OID 58168)
-- Name: presentacion_producto presentacion_producto_pkey; Type: CONSTRAINT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.presentacion_producto
    ADD CONSTRAINT presentacion_producto_pkey PRIMARY KEY (id);


--
-- TOC entry 4694 (class 2620 OID 74523)
-- Name: presentacion_producto trigger_actualizar_presentaciones; Type: TRIGGER; Schema: public; Owner: ownerfarmacia
--

CREATE TRIGGER trigger_actualizar_presentaciones AFTER INSERT ON public.presentacion_producto FOR EACH ROW EXECUTE FUNCTION public.actualizar_presentaciones();


--
-- TOC entry 4695 (class 2620 OID 66793)
-- Name: presentacion_producto trigger_actualizar_presentaciones_ondelete; Type: TRIGGER; Schema: public; Owner: ownerfarmacia
--

CREATE TRIGGER trigger_actualizar_presentaciones_ondelete AFTER DELETE ON public.presentacion_producto FOR EACH ROW EXECUTE FUNCTION public.actualizar_presentaciones_ondelete();


--
-- TOC entry 4692 (class 2606 OID 58169)
-- Name: presentacion_producto fk_presentacion; Type: FK CONSTRAINT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.presentacion_producto
    ADD CONSTRAINT fk_presentacion FOREIGN KEY (presentacion_id) REFERENCES public.presentaciones(id) ON DELETE CASCADE;


--
-- TOC entry 4693 (class 2606 OID 58174)
-- Name: presentacion_producto fk_product; Type: FK CONSTRAINT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.presentacion_producto
    ADD CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


-- Completed on 2025-04-30 07:43:54

--
-- PostgreSQL database dump complete
--

