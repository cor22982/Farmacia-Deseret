--
-- PostgreSQL database dump
--

-- Dumped from database version 16.2
-- Dumped by pg_dump version 16.2

-- Started on 2024-12-18 23:12:21

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

--
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 4905 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- TOC entry 240 (class 1255 OID 58128)
-- Name: actualizar_aleliminar_productos_carrito(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.actualizar_aleliminar_productos_carrito() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE carrito
    SET 
        total = total - (
            SELECT 
                OLD.cantidad * p.pp AS precio_eliminado
            FROM 
                products p
            WHERE 
                p.id = OLD.producto
        )
    WHERE id = OLD.carrito;

    RETURN OLD;
END;
$$;


ALTER FUNCTION public.actualizar_aleliminar_productos_carrito() OWNER TO postgres;

--
-- TOC entry 239 (class 1255 OID 58126)
-- Name: actualizar_alinsertar_productos_carrito(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.actualizar_alinsertar_productos_carrito() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE carrito
    SET 
        total = total + (
            SELECT 
                carrito_productos.cantidad * p.pp AS precio_nuevo
            FROM 
                carrito_productos
            JOIN 
                products p ON p.id = carrito_productos.producto
            WHERE 
                carrito_productos.id = NEW.id
        )
    WHERE id = NEW.carrito;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.actualizar_alinsertar_productos_carrito() OWNER TO postgres;

--
-- TOC entry 237 (class 1255 OID 58052)
-- Name: actualizar_ganancia_al_actualizar_pp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.actualizar_ganancia_al_actualizar_pp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Recalcula la ganancia cuando pp es actualizado, evitando divisi¢n por cero
    UPDATE products
    SET 
        ganancia = CASE 
                     WHEN NEW.pp <> 0 THEN (NEW.pp - costo) / NEW.pp
                     ELSE 0
                   END
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.actualizar_ganancia_al_actualizar_pp() OWNER TO postgres;

--
-- TOC entry 238 (class 1255 OID 58050)
-- Name: actualizar_products_por_details(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.actualizar_products_por_details() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE products
    SET 
        existencias = existencias + NEW.cantidad,
        costo = NEW.costo,
        ganancia = CASE 
                     WHEN pp <> 0 THEN (pp - NEW.costo) / pp
                     ELSE 0
                   END
    WHERE id = NEW.id_product;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.actualizar_products_por_details() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 230 (class 1259 OID 58005)
-- Name: carrito; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carrito (
    id integer NOT NULL,
    total numeric(10,4),
    hora time without time zone,
    fecha date
);


ALTER TABLE public.carrito OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 58004)
-- Name: carrito_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.carrito_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.carrito_id_seq OWNER TO postgres;

--
-- TOC entry 4907 (class 0 OID 0)
-- Dependencies: 229
-- Name: carrito_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.carrito_id_seq OWNED BY public.carrito.id;


--
-- TOC entry 231 (class 1259 OID 58011)
-- Name: carrito_productos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carrito_productos (
    carrito integer,
    producto integer,
    cantidad integer,
    id integer NOT NULL
);


ALTER TABLE public.carrito_productos OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 58108)
-- Name: carrito_productos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.carrito_productos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.carrito_productos_id_seq OWNER TO postgres;

--
-- TOC entry 4910 (class 0 OID 0)
-- Dependencies: 236
-- Name: carrito_productos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.carrito_productos_id_seq OWNED BY public.carrito_productos.id;


--
-- TOC entry 233 (class 1259 OID 58036)
-- Name: horario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.horario (
    id integer NOT NULL,
    horario_apertura time without time zone,
    horario_cierre time without time zone,
    id_proveedor integer,
    dia integer
);


ALTER TABLE public.horario OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 58035)
-- Name: horario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.horario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.horario_id_seq OWNER TO postgres;

--
-- TOC entry 4913 (class 0 OID 0)
-- Dependencies: 232
-- Name: horario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.horario_id_seq OWNED BY public.horario.id;


--
-- TOC entry 235 (class 1259 OID 58097)
-- Name: metodo_pago; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.metodo_pago (
    id integer NOT NULL,
    pago numeric(10,4),
    tipo character varying(200),
    id_carrito integer
);


ALTER TABLE public.metodo_pago OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 58096)
-- Name: metodo_pago_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.metodo_pago_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.metodo_pago_id_seq OWNER TO postgres;

--
-- TOC entry 4916 (class 0 OID 0)
-- Dependencies: 234
-- Name: metodo_pago_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.metodo_pago_id_seq OWNED BY public.metodo_pago.id;


--
-- TOC entry 224 (class 1259 OID 57950)
-- Name: pedidos_bodega; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pedidos_bodega (
    id integer NOT NULL,
    cantidad integer,
    fecha date,
    id_product integer
);


ALTER TABLE public.pedidos_bodega OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 57949)
-- Name: pedidos_bodega_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pedidos_bodega_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pedidos_bodega_id_seq OWNER TO postgres;

--
-- TOC entry 4919 (class 0 OID 0)
-- Dependencies: 223
-- Name: pedidos_bodega_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pedidos_bodega_id_seq OWNED BY public.pedidos_bodega.id;


--
-- TOC entry 218 (class 1259 OID 57917)
-- Name: productos_cantidades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.productos_cantidades (
    id integer NOT NULL,
    cantidad integer,
    fecha_compra date,
    fecha_vencimiento date,
    costo numeric(10,4),
    id_product integer NOT NULL,
    ubicacion_id integer
);


ALTER TABLE public.productos_cantidades OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 57916)
-- Name: productos_cantidades_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.productos_cantidades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.productos_cantidades_id_seq OWNER TO postgres;

--
-- TOC entry 4922 (class 0 OID 0)
-- Dependencies: 217
-- Name: productos_cantidades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.productos_cantidades_id_seq OWNED BY public.productos_cantidades.id;


--
-- TOC entry 216 (class 1259 OID 57908)
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    nombre character varying(200),
    forma_farmaceutica character varying(500),
    descripcion_uso text,
    imagen text,
    costo numeric(10,4),
    pp numeric(10,4),
    presentacion character varying(200),
    principio_activo character varying(200),
    existencias integer,
    controlado boolean,
    proveedor integer,
    ganancia numeric(10,4),
    tipo character varying(200)
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 57907)
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- TOC entry 4925 (class 0 OID 0)
-- Dependencies: 215
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- TOC entry 226 (class 1259 OID 57962)
-- Name: proveedores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proveedores (
    id integer NOT NULL,
    direccion text,
    tipo character varying(200),
    telefono character varying(200),
    proveedor_alternativo integer,
    estadisponible boolean,
    contacto_2 text,
    contacto text,
    nombre text
);


ALTER TABLE public.proveedores OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 57961)
-- Name: proveedores_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.proveedores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.proveedores_id_seq OWNER TO postgres;

--
-- TOC entry 4928 (class 0 OID 0)
-- Dependencies: 225
-- Name: proveedores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.proveedores_id_seq OWNED BY public.proveedores.id;


--
-- TOC entry 220 (class 1259 OID 57929)
-- Name: ubicaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ubicaciones (
    id integer NOT NULL,
    ubicacion text,
    lugar_farmacia character varying(500)
);


ALTER TABLE public.ubicaciones OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 57928)
-- Name: ubicaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ubicaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ubicaciones_id_seq OWNER TO postgres;

--
-- TOC entry 4931 (class 0 OID 0)
-- Dependencies: 219
-- Name: ubicaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ubicaciones_id_seq OWNED BY public.ubicaciones.id;


--
-- TOC entry 222 (class 1259 OID 57941)
-- Name: usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario (
    id integer NOT NULL,
    user_name character varying(100),
    rol character varying(100),
    password character varying(600)
);


ALTER TABLE public.usuario OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 57940)
-- Name: usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuario_id_seq OWNER TO postgres;

--
-- TOC entry 4934 (class 0 OID 0)
-- Dependencies: 221
-- Name: usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuario_id_seq OWNED BY public.usuario.id;


--
-- TOC entry 228 (class 1259 OID 57993)
-- Name: venta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.venta (
    id integer NOT NULL,
    jornada character varying(200),
    cantidad integer,
    fecha date,
    product integer,
    isoferta boolean
);


ALTER TABLE public.venta OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 57992)
-- Name: venta_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.venta_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.venta_id_seq OWNER TO postgres;

--
-- TOC entry 4937 (class 0 OID 0)
-- Dependencies: 227
-- Name: venta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.venta_id_seq OWNED BY public.venta.id;


--
-- TOC entry 4695 (class 2604 OID 58008)
-- Name: carrito id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrito ALTER COLUMN id SET DEFAULT nextval('public.carrito_id_seq'::regclass);


--
-- TOC entry 4696 (class 2604 OID 58109)
-- Name: carrito_productos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrito_productos ALTER COLUMN id SET DEFAULT nextval('public.carrito_productos_id_seq'::regclass);


--
-- TOC entry 4697 (class 2604 OID 58039)
-- Name: horario id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horario ALTER COLUMN id SET DEFAULT nextval('public.horario_id_seq'::regclass);


--
-- TOC entry 4698 (class 2604 OID 58100)
-- Name: metodo_pago id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metodo_pago ALTER COLUMN id SET DEFAULT nextval('public.metodo_pago_id_seq'::regclass);


--
-- TOC entry 4692 (class 2604 OID 57953)
-- Name: pedidos_bodega id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos_bodega ALTER COLUMN id SET DEFAULT nextval('public.pedidos_bodega_id_seq'::regclass);


--
-- TOC entry 4689 (class 2604 OID 57920)
-- Name: productos_cantidades id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos_cantidades ALTER COLUMN id SET DEFAULT nextval('public.productos_cantidades_id_seq'::regclass);


--
-- TOC entry 4688 (class 2604 OID 57911)
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- TOC entry 4693 (class 2604 OID 57965)
-- Name: proveedores id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proveedores ALTER COLUMN id SET DEFAULT nextval('public.proveedores_id_seq'::regclass);


--
-- TOC entry 4690 (class 2604 OID 57932)
-- Name: ubicaciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ubicaciones ALTER COLUMN id SET DEFAULT nextval('public.ubicaciones_id_seq'::regclass);


--
-- TOC entry 4691 (class 2604 OID 57944)
-- Name: usuario id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario ALTER COLUMN id SET DEFAULT nextval('public.usuario_id_seq'::regclass);


--
-- TOC entry 4694 (class 2604 OID 57996)
-- Name: venta id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.venta ALTER COLUMN id SET DEFAULT nextval('public.venta_id_seq'::regclass);


--
-- TOC entry 4893 (class 0 OID 58005)
-- Dependencies: 230
-- Data for Name: carrito; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4894 (class 0 OID 58011)
-- Dependencies: 231
-- Data for Name: carrito_productos; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4896 (class 0 OID 58036)
-- Dependencies: 233
-- Data for Name: horario; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4898 (class 0 OID 58097)
-- Dependencies: 235
-- Data for Name: metodo_pago; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4887 (class 0 OID 57950)
-- Dependencies: 224
-- Data for Name: pedidos_bodega; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4881 (class 0 OID 57917)
-- Dependencies: 218
-- Data for Name: productos_cantidades; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4879 (class 0 OID 57908)
-- Dependencies: 216
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4889 (class 0 OID 57962)
-- Dependencies: 226
-- Data for Name: proveedores; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4883 (class 0 OID 57929)
-- Dependencies: 220
-- Data for Name: ubicaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4885 (class 0 OID 57941)
-- Dependencies: 222
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.usuario VALUES (1, 'admin', 'admin', 'adc2a36609ae17994a4cd243f6f0795a');
INSERT INTO public.usuario VALUES (2, 'usuario', 'comun', 'c928005d023dc61698f5a07589e29c7b');


--
-- TOC entry 4891 (class 0 OID 57993)
-- Dependencies: 228
-- Data for Name: venta; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4939 (class 0 OID 0)
-- Dependencies: 229
-- Name: carrito_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.carrito_id_seq', 1, false);


--
-- TOC entry 4940 (class 0 OID 0)
-- Dependencies: 236
-- Name: carrito_productos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.carrito_productos_id_seq', 1, false);


--
-- TOC entry 4941 (class 0 OID 0)
-- Dependencies: 232
-- Name: horario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.horario_id_seq', 1, false);


--
-- TOC entry 4942 (class 0 OID 0)
-- Dependencies: 234
-- Name: metodo_pago_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.metodo_pago_id_seq', 1, false);


--
-- TOC entry 4943 (class 0 OID 0)
-- Dependencies: 223
-- Name: pedidos_bodega_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pedidos_bodega_id_seq', 1, false);


--
-- TOC entry 4944 (class 0 OID 0)
-- Dependencies: 217
-- Name: productos_cantidades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.productos_cantidades_id_seq', 1, false);


--
-- TOC entry 4945 (class 0 OID 0)
-- Dependencies: 215
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 1, false);


--
-- TOC entry 4946 (class 0 OID 0)
-- Dependencies: 225
-- Name: proveedores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.proveedores_id_seq', 1, false);


--
-- TOC entry 4947 (class 0 OID 0)
-- Dependencies: 219
-- Name: ubicaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ubicaciones_id_seq', 1, false);


--
-- TOC entry 4948 (class 0 OID 0)
-- Dependencies: 221
-- Name: usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuario_id_seq', 2, true);


--
-- TOC entry 4949 (class 0 OID 0)
-- Dependencies: 227
-- Name: venta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.venta_id_seq', 1, false);


--
-- TOC entry 4714 (class 2606 OID 58010)
-- Name: carrito carrito_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrito
    ADD CONSTRAINT carrito_pkey PRIMARY KEY (id);


--
-- TOC entry 4716 (class 2606 OID 58111)
-- Name: carrito_productos carrito_productos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrito_productos
    ADD CONSTRAINT carrito_productos_pkey PRIMARY KEY (id);


--
-- TOC entry 4718 (class 2606 OID 58041)
-- Name: horario horario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horario
    ADD CONSTRAINT horario_pkey PRIMARY KEY (id);


--
-- TOC entry 4720 (class 2606 OID 58102)
-- Name: metodo_pago metodo_pago_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metodo_pago
    ADD CONSTRAINT metodo_pago_pkey PRIMARY KEY (id);


--
-- TOC entry 4708 (class 2606 OID 57955)
-- Name: pedidos_bodega pedidos_bodega_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos_bodega
    ADD CONSTRAINT pedidos_bodega_pkey PRIMARY KEY (id);


--
-- TOC entry 4702 (class 2606 OID 57922)
-- Name: productos_cantidades productos_cantidades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos_cantidades
    ADD CONSTRAINT productos_cantidades_pkey PRIMARY KEY (id);


--
-- TOC entry 4700 (class 2606 OID 57915)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 4710 (class 2606 OID 57969)
-- Name: proveedores proveedores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proveedores
    ADD CONSTRAINT proveedores_pkey PRIMARY KEY (id);


--
-- TOC entry 4704 (class 2606 OID 57934)
-- Name: ubicaciones ubicaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ubicaciones
    ADD CONSTRAINT ubicaciones_pkey PRIMARY KEY (id);


--
-- TOC entry 4706 (class 2606 OID 57948)
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id);


--
-- TOC entry 4712 (class 2606 OID 57998)
-- Name: venta venta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.venta
    ADD CONSTRAINT venta_pkey PRIMARY KEY (id);


--
-- TOC entry 4733 (class 2620 OID 58127)
-- Name: carrito_productos trigger_actualizar_alinsertar_productos_carrito; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_actualizar_alinsertar_productos_carrito AFTER INSERT ON public.carrito_productos FOR EACH ROW EXECUTE FUNCTION public.actualizar_alinsertar_productos_carrito();


--
-- TOC entry 4731 (class 2620 OID 58055)
-- Name: products trigger_actualizar_ganancia_al_actualizar_pp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_actualizar_ganancia_al_actualizar_pp AFTER UPDATE OF pp ON public.products FOR EACH ROW EXECUTE FUNCTION public.actualizar_ganancia_al_actualizar_pp();


--
-- TOC entry 4732 (class 2620 OID 58054)
-- Name: productos_cantidades trigger_actualizar_products_por_details; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_actualizar_products_por_details AFTER INSERT ON public.productos_cantidades FOR EACH ROW EXECUTE FUNCTION public.actualizar_products_por_details();


--
-- TOC entry 4734 (class 2620 OID 58129)
-- Name: carrito_productos trigger_aldetallar_productos_carrito; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_aldetallar_productos_carrito AFTER DELETE ON public.carrito_productos FOR EACH ROW EXECUTE FUNCTION public.actualizar_aleliminar_productos_carrito();


--
-- TOC entry 4727 (class 2606 OID 58130)
-- Name: carrito_productos fk_carrito; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrito_productos
    ADD CONSTRAINT fk_carrito FOREIGN KEY (carrito) REFERENCES public.carrito(id) ON DELETE CASCADE;


--
-- TOC entry 4730 (class 2606 OID 58135)
-- Name: metodo_pago fk_id_carrito; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metodo_pago
    ADD CONSTRAINT fk_id_carrito FOREIGN KEY (id_carrito) REFERENCES public.carrito(id) ON DELETE CASCADE;


--
-- TOC entry 4729 (class 2606 OID 58056)
-- Name: horario fk_id_proveedor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horario
    ADD CONSTRAINT fk_id_proveedor FOREIGN KEY (id_proveedor) REFERENCES public.proveedores(id) ON DELETE CASCADE;


--
-- TOC entry 4724 (class 2606 OID 57956)
-- Name: pedidos_bodega fk_pedidos_b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos_bodega
    ADD CONSTRAINT fk_pedidos_b FOREIGN KEY (id_product) REFERENCES public.productos_cantidades(id);


--
-- TOC entry 4722 (class 2606 OID 58076)
-- Name: productos_cantidades fk_product; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos_cantidades
    ADD CONSTRAINT fk_product FOREIGN KEY (id_product) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4728 (class 2606 OID 58081)
-- Name: carrito_productos fk_producto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrito_productos
    ADD CONSTRAINT fk_producto FOREIGN KEY (producto) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4725 (class 2606 OID 58061)
-- Name: proveedores fk_proveedor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proveedores
    ADD CONSTRAINT fk_proveedor FOREIGN KEY (proveedor_alternativo) REFERENCES public.proveedores(id) ON DELETE CASCADE;


--
-- TOC entry 4721 (class 2606 OID 58066)
-- Name: products fk_proveedor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT fk_proveedor FOREIGN KEY (proveedor) REFERENCES public.proveedores(id) ON DELETE CASCADE;


--
-- TOC entry 4723 (class 2606 OID 58071)
-- Name: productos_cantidades fk_ubicaciones; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos_cantidades
    ADD CONSTRAINT fk_ubicaciones FOREIGN KEY (ubicacion_id) REFERENCES public.ubicaciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4726 (class 2606 OID 58086)
-- Name: venta fk_venta; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.venta
    ADD CONSTRAINT fk_venta FOREIGN KEY (product) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4906 (class 0 OID 0)
-- Dependencies: 230
-- Name: TABLE carrito; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.carrito TO ownerfarmacia;


--
-- TOC entry 4908 (class 0 OID 0)
-- Dependencies: 229
-- Name: SEQUENCE carrito_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.carrito_id_seq TO ownerfarmacia;


--
-- TOC entry 4909 (class 0 OID 0)
-- Dependencies: 231
-- Name: TABLE carrito_productos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.carrito_productos TO ownerfarmacia;


--
-- TOC entry 4911 (class 0 OID 0)
-- Dependencies: 236
-- Name: SEQUENCE carrito_productos_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.carrito_productos_id_seq TO ownerfarmacia;


--
-- TOC entry 4912 (class 0 OID 0)
-- Dependencies: 233
-- Name: TABLE horario; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.horario TO ownerfarmacia;


--
-- TOC entry 4914 (class 0 OID 0)
-- Dependencies: 232
-- Name: SEQUENCE horario_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.horario_id_seq TO ownerfarmacia;


--
-- TOC entry 4915 (class 0 OID 0)
-- Dependencies: 235
-- Name: TABLE metodo_pago; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.metodo_pago TO ownerfarmacia;


--
-- TOC entry 4917 (class 0 OID 0)
-- Dependencies: 234
-- Name: SEQUENCE metodo_pago_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.metodo_pago_id_seq TO ownerfarmacia;


--
-- TOC entry 4918 (class 0 OID 0)
-- Dependencies: 224
-- Name: TABLE pedidos_bodega; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.pedidos_bodega TO ownerfarmacia;


--
-- TOC entry 4920 (class 0 OID 0)
-- Dependencies: 223
-- Name: SEQUENCE pedidos_bodega_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.pedidos_bodega_id_seq TO ownerfarmacia;


--
-- TOC entry 4921 (class 0 OID 0)
-- Dependencies: 218
-- Name: TABLE productos_cantidades; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.productos_cantidades TO ownerfarmacia;


--
-- TOC entry 4923 (class 0 OID 0)
-- Dependencies: 217
-- Name: SEQUENCE productos_cantidades_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.productos_cantidades_id_seq TO ownerfarmacia;


--
-- TOC entry 4924 (class 0 OID 0)
-- Dependencies: 216
-- Name: TABLE products; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.products TO ownerfarmacia;


--
-- TOC entry 4926 (class 0 OID 0)
-- Dependencies: 215
-- Name: SEQUENCE products_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.products_id_seq TO ownerfarmacia;


--
-- TOC entry 4927 (class 0 OID 0)
-- Dependencies: 226
-- Name: TABLE proveedores; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.proveedores TO ownerfarmacia;


--
-- TOC entry 4929 (class 0 OID 0)
-- Dependencies: 225
-- Name: SEQUENCE proveedores_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.proveedores_id_seq TO ownerfarmacia;


--
-- TOC entry 4930 (class 0 OID 0)
-- Dependencies: 220
-- Name: TABLE ubicaciones; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.ubicaciones TO ownerfarmacia;


--
-- TOC entry 4932 (class 0 OID 0)
-- Dependencies: 219
-- Name: SEQUENCE ubicaciones_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.ubicaciones_id_seq TO ownerfarmacia;


--
-- TOC entry 4933 (class 0 OID 0)
-- Dependencies: 222
-- Name: TABLE usuario; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.usuario TO ownerfarmacia;


--
-- TOC entry 4935 (class 0 OID 0)
-- Dependencies: 221
-- Name: SEQUENCE usuario_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.usuario_id_seq TO ownerfarmacia;


--
-- TOC entry 4936 (class 0 OID 0)
-- Dependencies: 228
-- Name: TABLE venta; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.venta TO ownerfarmacia;


--
-- TOC entry 4938 (class 0 OID 0)
-- Dependencies: 227
-- Name: SEQUENCE venta_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.venta_id_seq TO ownerfarmacia;


-- Completed on 2024-12-18 23:12:22

--
-- PostgreSQL database dump complete
--

