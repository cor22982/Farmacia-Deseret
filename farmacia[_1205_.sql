--
-- PostgreSQL database dump
--

-- Dumped from database version 16.2
-- Dumped by pg_dump version 16.2

-- Started on 2025-05-12 14:04:31

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
-- TOC entry 243 (class 1255 OID 58128)
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
                presentacion_producto p
            WHERE 
                p.id = OLD.presentacion
        )
    WHERE id = OLD.carrito;

    RETURN OLD;
END;
$$;


ALTER FUNCTION public.actualizar_aleliminar_productos_carrito() OWNER TO postgres;

--
-- TOC entry 242 (class 1255 OID 58126)
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
                presentacion_producto p ON p.id = carrito_productos.presentacion
            WHERE 
                carrito_productos.id = NEW.id
        )
    WHERE id = NEW.carrito;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.actualizar_alinsertar_productos_carrito() OWNER TO postgres;

--
-- TOC entry 241 (class 1255 OID 58052)
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
-- TOC entry 248 (class 1255 OID 66790)
-- Name: actualizar_presentaciones(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.actualizar_presentaciones() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  DECLARE
    ganancia_min numeric(10, 4);
    costo_producto numeric(10, 4);
  BEGIN

    SELECT costo
    INTO costo_producto
    FROM products
    WHERE id = NEW.product_id;

    UPDATE presentacion_producto
    SET
        porcentaje_ganancia = CASE 
                                WHEN  NEW.pp <> 0 and costo_producto IS NOT NULL THEN (NEW.pp - (NEW.cantidad_presentacion*costo_producto)) / NEW.pp
                                ELSE 0
                              END
     WHERE id = NEW.id;

    SELECT MIN(porcentaje_ganancia)
    INTO ganancia_min
    FROM presentacion_producto
    WHERE product_id = NEW.product_id AND habilitado = true;

    UPDATE products
    SET 
    ganancia = CASE 
                     WHEN ganancia_min <> 0 THEN ganancia_min
                     ELSE 0
                   END
    WHERE id = NEW.product_id; 

    RETURN NEW;
  END;
END;
$$;


ALTER FUNCTION public.actualizar_presentaciones() OWNER TO postgres;

--
-- TOC entry 257 (class 1255 OID 66792)
-- Name: actualizar_presentaciones_ondelete(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.actualizar_presentaciones_ondelete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  DECLARE
    ganancia_min numeric(10, 4);
  BEGIN
    -- Obtener el m¡nimo porcentaje de ganancia para el producto afectado
    SELECT MIN(porcentaje_ganancia)
    INTO ganancia_min
    FROM presentacion_producto
    WHERE product_id = OLD.product_id;

    -- Actualizar la tabla products con el m¡nimo porcentaje de ganancia encontrado
    UPDATE products
    SET 
        ganancia = COALESCE(ganancia_min, 0)
    WHERE id = OLD.product_id;

    RETURN OLD;
  END;
END;
$$;


ALTER FUNCTION public.actualizar_presentaciones_ondelete() OWNER TO postgres;

--
-- TOC entry 256 (class 1255 OID 58050)
-- Name: actualizar_products_por_details(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.actualizar_products_por_details() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  DECLARE
    ganancia_min numeric(10, 4);
  BEGIN

    -- Ahora updeteamos la presentacion del producto
    
    UPDATE presentacion_producto
    SET 
        porcentaje_ganancia =  CASE 
                                    WHEN pp <> 0 THEN (pp - (cantidad_presentacion*NEW.costo)) / pp
                                    ELSE 0
                               END
    
    WHERE product_id = NEW.id_product;
    

    -- Ahora obtenemos la menor ganancia

    SELECT MIN(porcentaje_ganancia)
    INTO ganancia_min
    FROM presentacion_producto
    WHERE product_id = NEW.id_product AND habilitado = true;

    -- Ahora vamos a updetear en el producto

    UPDATE products
    SET 
    existencias = existencias + NEW.cantidad,
    costo = NEW.costo,
    ganancia = CASE 
                     WHEN ganancia_min <> 0 THEN ganancia_min
                     ELSE 0
                   END
    WHERE id = NEW.id_product;    

    -- Retorna la nueva fila en productos_cantidades
    RETURN NEW;
  END;
END;
$$;


ALTER FUNCTION public.actualizar_products_por_details() OWNER TO postgres;

--
-- TOC entry 258 (class 1255 OID 74524)
-- Name: actualizar_products_por_details_ondelete(); Type: FUNCTION; Schema: public; Owner: ownerfarmacia
--

CREATE FUNCTION public.actualizar_products_por_details_ondelete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    ganancia_min NUMERIC(10, 4);
    costo_anterior NUMERIC(10, 4);
BEGIN
    -- Obtengamos el costo anterior
    SELECT costo
    INTO costo_anterior
    FROM productos_cantidades
    ORDER BY id DESC
    LIMIT 1;

    -- Actualizar la presentación del producto
    UPDATE presentacion_producto
    SET 
        porcentaje_ganancia = CASE 
                                WHEN pp <> 0 THEN (pp - (cantidad_presentacion * costo_anterior)) / pp
                                ELSE 0
                              END
    WHERE product_id = OLD.id_product;

    -- Obtener la menor ganancia
    SELECT MIN(porcentaje_ganancia)
    INTO ganancia_min
    FROM presentacion_producto
    WHERE product_id = OLD.id_product AND habilitado = true;

    -- Actualizar el producto
    UPDATE products
    SET 
        existencias = existencias - OLD.cantidad,
        costo = costo_anterior,
        ganancia = CASE 
                     WHEN ganancia_min IS NOT NULL THEN ganancia_min
                     ELSE 0
                   END
    WHERE id = OLD.id_product;    

    -- Retornar la fila eliminada
    RETURN OLD;
END;
$$;


ALTER FUNCTION public.actualizar_products_por_details_ondelete() OWNER TO ownerfarmacia;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 230 (class 1259 OID 58005)
-- Name: carrito; Type: TABLE; Schema: public; Owner: ownerfarmacia
--

CREATE TABLE public.carrito (
    id integer NOT NULL,
    total numeric(10,4),
    hora time without time zone,
    fecha date
);


ALTER TABLE public.carrito OWNER TO ownerfarmacia;

--
-- TOC entry 229 (class 1259 OID 58004)
-- Name: carrito_id_seq; Type: SEQUENCE; Schema: public; Owner: ownerfarmacia
--

CREATE SEQUENCE public.carrito_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.carrito_id_seq OWNER TO ownerfarmacia;

--
-- TOC entry 4939 (class 0 OID 0)
-- Dependencies: 229
-- Name: carrito_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ownerfarmacia
--

ALTER SEQUENCE public.carrito_id_seq OWNED BY public.carrito.id;


--
-- TOC entry 231 (class 1259 OID 58011)
-- Name: carrito_productos; Type: TABLE; Schema: public; Owner: ownerfarmacia
--

CREATE TABLE public.carrito_productos (
    carrito integer,
    producto integer,
    cantidad integer,
    id integer NOT NULL,
    presentacion integer,
    id_producto_cantidad integer
);


ALTER TABLE public.carrito_productos OWNER TO ownerfarmacia;

--
-- TOC entry 236 (class 1259 OID 58108)
-- Name: carrito_productos_id_seq; Type: SEQUENCE; Schema: public; Owner: ownerfarmacia
--

CREATE SEQUENCE public.carrito_productos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.carrito_productos_id_seq OWNER TO ownerfarmacia;

--
-- TOC entry 4940 (class 0 OID 0)
-- Dependencies: 236
-- Name: carrito_productos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ownerfarmacia
--

ALTER SEQUENCE public.carrito_productos_id_seq OWNED BY public.carrito_productos.id;


--
-- TOC entry 233 (class 1259 OID 58036)
-- Name: horario; Type: TABLE; Schema: public; Owner: ownerfarmacia
--

CREATE TABLE public.horario (
    id integer NOT NULL,
    horario_apertura time without time zone,
    horario_cierre time without time zone,
    id_proveedor integer,
    dia integer
);


ALTER TABLE public.horario OWNER TO ownerfarmacia;

--
-- TOC entry 232 (class 1259 OID 58035)
-- Name: horario_id_seq; Type: SEQUENCE; Schema: public; Owner: ownerfarmacia
--

CREATE SEQUENCE public.horario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.horario_id_seq OWNER TO ownerfarmacia;

--
-- TOC entry 4941 (class 0 OID 0)
-- Dependencies: 232
-- Name: horario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ownerfarmacia
--

ALTER SEQUENCE public.horario_id_seq OWNED BY public.horario.id;


--
-- TOC entry 235 (class 1259 OID 58097)
-- Name: metodo_pago; Type: TABLE; Schema: public; Owner: ownerfarmacia
--

CREATE TABLE public.metodo_pago (
    id integer NOT NULL,
    pago numeric(10,4),
    tipo character varying(200),
    id_carrito integer
);


ALTER TABLE public.metodo_pago OWNER TO ownerfarmacia;

--
-- TOC entry 234 (class 1259 OID 58096)
-- Name: metodo_pago_id_seq; Type: SEQUENCE; Schema: public; Owner: ownerfarmacia
--

CREATE SEQUENCE public.metodo_pago_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.metodo_pago_id_seq OWNER TO ownerfarmacia;

--
-- TOC entry 4942 (class 0 OID 0)
-- Dependencies: 234
-- Name: metodo_pago_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ownerfarmacia
--

ALTER SEQUENCE public.metodo_pago_id_seq OWNED BY public.metodo_pago.id;


--
-- TOC entry 224 (class 1259 OID 57950)
-- Name: pedidos_bodega; Type: TABLE; Schema: public; Owner: ownerfarmacia
--

CREATE TABLE public.pedidos_bodega (
    id integer NOT NULL,
    cantidad integer,
    fecha date,
    id_product integer
);


ALTER TABLE public.pedidos_bodega OWNER TO ownerfarmacia;

--
-- TOC entry 223 (class 1259 OID 57949)
-- Name: pedidos_bodega_id_seq; Type: SEQUENCE; Schema: public; Owner: ownerfarmacia
--

CREATE SEQUENCE public.pedidos_bodega_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pedidos_bodega_id_seq OWNER TO ownerfarmacia;

--
-- TOC entry 4943 (class 0 OID 0)
-- Dependencies: 223
-- Name: pedidos_bodega_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ownerfarmacia
--

ALTER SEQUENCE public.pedidos_bodega_id_seq OWNED BY public.pedidos_bodega.id;


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
-- TOC entry 4944 (class 0 OID 0)
-- Dependencies: 239
-- Name: presentacion_producto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ownerfarmacia
--

ALTER SEQUENCE public.presentacion_producto_id_seq OWNED BY public.presentacion_producto.id;


--
-- TOC entry 238 (class 1259 OID 58154)
-- Name: presentaciones; Type: TABLE; Schema: public; Owner: ownerfarmacia
--

CREATE TABLE public.presentaciones (
    id integer NOT NULL,
    nombre character varying(255),
    descripcion text
);


ALTER TABLE public.presentaciones OWNER TO ownerfarmacia;

--
-- TOC entry 237 (class 1259 OID 58153)
-- Name: presentaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: ownerfarmacia
--

CREATE SEQUENCE public.presentaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.presentaciones_id_seq OWNER TO ownerfarmacia;

--
-- TOC entry 4945 (class 0 OID 0)
-- Dependencies: 237
-- Name: presentaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ownerfarmacia
--

ALTER SEQUENCE public.presentaciones_id_seq OWNED BY public.presentaciones.id;


--
-- TOC entry 218 (class 1259 OID 57917)
-- Name: productos_cantidades; Type: TABLE; Schema: public; Owner: ownerfarmacia
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


ALTER TABLE public.productos_cantidades OWNER TO ownerfarmacia;

--
-- TOC entry 217 (class 1259 OID 57916)
-- Name: productos_cantidades_id_seq; Type: SEQUENCE; Schema: public; Owner: ownerfarmacia
--

CREATE SEQUENCE public.productos_cantidades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.productos_cantidades_id_seq OWNER TO ownerfarmacia;

--
-- TOC entry 4946 (class 0 OID 0)
-- Dependencies: 217
-- Name: productos_cantidades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ownerfarmacia
--

ALTER SEQUENCE public.productos_cantidades_id_seq OWNED BY public.productos_cantidades.id;


--
-- TOC entry 216 (class 1259 OID 57908)
-- Name: products; Type: TABLE; Schema: public; Owner: ownerfarmacia
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
    tipo character varying(200),
    dosificacion text,
    accion_farmacologica text
);


ALTER TABLE public.products OWNER TO ownerfarmacia;

--
-- TOC entry 215 (class 1259 OID 57907)
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: ownerfarmacia
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO ownerfarmacia;

--
-- TOC entry 4947 (class 0 OID 0)
-- Dependencies: 215
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ownerfarmacia
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- TOC entry 226 (class 1259 OID 57962)
-- Name: proveedores; Type: TABLE; Schema: public; Owner: ownerfarmacia
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


ALTER TABLE public.proveedores OWNER TO ownerfarmacia;

--
-- TOC entry 225 (class 1259 OID 57961)
-- Name: proveedores_id_seq; Type: SEQUENCE; Schema: public; Owner: ownerfarmacia
--

CREATE SEQUENCE public.proveedores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.proveedores_id_seq OWNER TO ownerfarmacia;

--
-- TOC entry 4948 (class 0 OID 0)
-- Dependencies: 225
-- Name: proveedores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ownerfarmacia
--

ALTER SEQUENCE public.proveedores_id_seq OWNED BY public.proveedores.id;


--
-- TOC entry 220 (class 1259 OID 57929)
-- Name: ubicaciones; Type: TABLE; Schema: public; Owner: ownerfarmacia
--

CREATE TABLE public.ubicaciones (
    id integer NOT NULL,
    ubicacion text,
    lugar_farmacia character varying(500)
);


ALTER TABLE public.ubicaciones OWNER TO ownerfarmacia;

--
-- TOC entry 219 (class 1259 OID 57928)
-- Name: ubicaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: ownerfarmacia
--

CREATE SEQUENCE public.ubicaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ubicaciones_id_seq OWNER TO ownerfarmacia;

--
-- TOC entry 4949 (class 0 OID 0)
-- Dependencies: 219
-- Name: ubicaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ownerfarmacia
--

ALTER SEQUENCE public.ubicaciones_id_seq OWNED BY public.ubicaciones.id;


--
-- TOC entry 222 (class 1259 OID 57941)
-- Name: usuario; Type: TABLE; Schema: public; Owner: ownerfarmacia
--

CREATE TABLE public.usuario (
    id integer NOT NULL,
    user_name character varying(100),
    rol character varying(100),
    password character varying(600)
);


ALTER TABLE public.usuario OWNER TO ownerfarmacia;

--
-- TOC entry 221 (class 1259 OID 57940)
-- Name: usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: ownerfarmacia
--

CREATE SEQUENCE public.usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuario_id_seq OWNER TO ownerfarmacia;

--
-- TOC entry 4950 (class 0 OID 0)
-- Dependencies: 221
-- Name: usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ownerfarmacia
--

ALTER SEQUENCE public.usuario_id_seq OWNED BY public.usuario.id;


--
-- TOC entry 228 (class 1259 OID 57993)
-- Name: venta; Type: TABLE; Schema: public; Owner: ownerfarmacia
--

CREATE TABLE public.venta (
    id integer NOT NULL,
    jornada character varying(200),
    cantidad integer,
    fecha date,
    product integer,
    isoferta boolean,
    id_carrito integer,
    id_producto_cantidad integer,
    id_producto_presentacion integer
);


ALTER TABLE public.venta OWNER TO ownerfarmacia;

--
-- TOC entry 227 (class 1259 OID 57992)
-- Name: venta_id_seq; Type: SEQUENCE; Schema: public; Owner: ownerfarmacia
--

CREATE SEQUENCE public.venta_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.venta_id_seq OWNER TO ownerfarmacia;

--
-- TOC entry 4951 (class 0 OID 0)
-- Dependencies: 227
-- Name: venta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ownerfarmacia
--

ALTER SEQUENCE public.venta_id_seq OWNED BY public.venta.id;


--
-- TOC entry 4708 (class 2604 OID 58008)
-- Name: carrito id; Type: DEFAULT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.carrito ALTER COLUMN id SET DEFAULT nextval('public.carrito_id_seq'::regclass);


--
-- TOC entry 4709 (class 2604 OID 58109)
-- Name: carrito_productos id; Type: DEFAULT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.carrito_productos ALTER COLUMN id SET DEFAULT nextval('public.carrito_productos_id_seq'::regclass);


--
-- TOC entry 4710 (class 2604 OID 58039)
-- Name: horario id; Type: DEFAULT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.horario ALTER COLUMN id SET DEFAULT nextval('public.horario_id_seq'::regclass);


--
-- TOC entry 4711 (class 2604 OID 58100)
-- Name: metodo_pago id; Type: DEFAULT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.metodo_pago ALTER COLUMN id SET DEFAULT nextval('public.metodo_pago_id_seq'::regclass);


--
-- TOC entry 4705 (class 2604 OID 57953)
-- Name: pedidos_bodega id; Type: DEFAULT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.pedidos_bodega ALTER COLUMN id SET DEFAULT nextval('public.pedidos_bodega_id_seq'::regclass);


--
-- TOC entry 4713 (class 2604 OID 58166)
-- Name: presentacion_producto id; Type: DEFAULT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.presentacion_producto ALTER COLUMN id SET DEFAULT nextval('public.presentacion_producto_id_seq'::regclass);


--
-- TOC entry 4712 (class 2604 OID 58157)
-- Name: presentaciones id; Type: DEFAULT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.presentaciones ALTER COLUMN id SET DEFAULT nextval('public.presentaciones_id_seq'::regclass);


--
-- TOC entry 4702 (class 2604 OID 57920)
-- Name: productos_cantidades id; Type: DEFAULT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.productos_cantidades ALTER COLUMN id SET DEFAULT nextval('public.productos_cantidades_id_seq'::regclass);


--
-- TOC entry 4701 (class 2604 OID 57911)
-- Name: products id; Type: DEFAULT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- TOC entry 4706 (class 2604 OID 57965)
-- Name: proveedores id; Type: DEFAULT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.proveedores ALTER COLUMN id SET DEFAULT nextval('public.proveedores_id_seq'::regclass);


--
-- TOC entry 4703 (class 2604 OID 57932)
-- Name: ubicaciones id; Type: DEFAULT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.ubicaciones ALTER COLUMN id SET DEFAULT nextval('public.ubicaciones_id_seq'::regclass);


--
-- TOC entry 4704 (class 2604 OID 57944)
-- Name: usuario id; Type: DEFAULT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.usuario ALTER COLUMN id SET DEFAULT nextval('public.usuario_id_seq'::regclass);


--
-- TOC entry 4707 (class 2604 OID 57996)
-- Name: venta id; Type: DEFAULT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.venta ALTER COLUMN id SET DEFAULT nextval('public.venta_id_seq'::regclass);


--
-- TOC entry 4922 (class 0 OID 58005)
-- Dependencies: 230
-- Data for Name: carrito; Type: TABLE DATA; Schema: public; Owner: ownerfarmacia
--

COPY public.carrito (id, total, hora, fecha) FROM stdin;
1	0.0000	12:05:59	2025-05-12
\.


--
-- TOC entry 4923 (class 0 OID 58011)
-- Dependencies: 231
-- Data for Name: carrito_productos; Type: TABLE DATA; Schema: public; Owner: ownerfarmacia
--

COPY public.carrito_productos (carrito, producto, cantidad, id, presentacion, id_producto_cantidad) FROM stdin;
\.


--
-- TOC entry 4925 (class 0 OID 58036)
-- Dependencies: 233
-- Data for Name: horario; Type: TABLE DATA; Schema: public; Owner: ownerfarmacia
--

COPY public.horario (id, horario_apertura, horario_cierre, id_proveedor, dia) FROM stdin;
\.


--
-- TOC entry 4927 (class 0 OID 58097)
-- Dependencies: 235
-- Data for Name: metodo_pago; Type: TABLE DATA; Schema: public; Owner: ownerfarmacia
--

COPY public.metodo_pago (id, pago, tipo, id_carrito) FROM stdin;
\.


--
-- TOC entry 4916 (class 0 OID 57950)
-- Dependencies: 224
-- Data for Name: pedidos_bodega; Type: TABLE DATA; Schema: public; Owner: ownerfarmacia
--

COPY public.pedidos_bodega (id, cantidad, fecha, id_product) FROM stdin;
\.


--
-- TOC entry 4932 (class 0 OID 58163)
-- Dependencies: 240
-- Data for Name: presentacion_producto; Type: TABLE DATA; Schema: public; Owner: ownerfarmacia
--

COPY public.presentacion_producto (id, porcentaje_ganancia, pp, cantidad_presentacion, presentacion_id, product_id, habilitado, imagen_presentacion) FROM stdin;
2	0.43	2.50	10	3	2	t	blister.png
4	0.48	38.00	1	4	3	t	frasco.png
5	0.68	2.50	10	3	4	t	blister.png
6	0.68	25.00	100	1	4	t	caja.png
7	0.67	40.00	8	1	5	t	caja.png
8	0.67	5.00	1	7	5	t	cualquiera.png
9	0.54	7.00	1	4	6	t	frasco.png
10	0.76	10.00	2	1	7	t	caja.png
11	0.76	5.00	1	31	7	t	tableta.png
12	0.42	17.00	1	8	8	t	frasco.png
13	0.43	8.00	1	8	9	t	frasco.png
14	0.40	5.00	10	3	10	t	blister.png
15	0.40	50.00	100	1	10	t	caja.png
16	0.55	5.00	10	3	11	t	blister.png
17	0.55	50.00	100	1	11	t	caja.png
18	0.60	4.00	10	3	12	t	blister.png
19	0.60	40.00	100	1	12	t	caja.png
20	0.39	85.00	1	26	13	t	cualquiera.png
21	0.52	6.00	10	3	14	t	blister.png
22	0.52	60.00	100	1	14	t	caja.png
23	0.54	10.00	10	3	15	t	blister.png
24	0.54	100.00	100	1	15	t	caja.png
25	0.43	29.00	1	26	16	t	cualquiera.png
28	0.40	50.00	10	3	18	t	blister.png
29	0.40	500.00	100	1	18	t	caja.png
26	1.00	5.00	10	3	17	t	blister.png
27	1.00	50.00	100	1	17	t	caja.png
30	0.48	23.00	1	4	19	t	frasco.png
31	0.41	25.00	1	4	20	t	frasco.png
32	0.41	25.00	1	25	20	t	cualquiera.png
33	0.55	54.00	3	1	21	t	caja.png
34	0.55	18.00	1	31	21	t	tableta.png
35	0.43	19.00	1	4	22	t	frasco.png
36	0.51	9.00	1	7	23	t	cualquiera.png
37	0.41	6.00	10	3	24	t	blister.png
38	0.41	60.00	100	1	24	t	caja.png
39	0.44	9.00	10	3	25	t	blister.png
40	0.44	90.00	100	1	25	t	caja.png
41	0.48	5.00	10	3	26	t	blister.png
42	0.48	50.00	100	1	26	t	caja.png
46	0.54	10.00	10	3	29	t	blister.png
47	0.54	100.00	100	1	29	t	caja.png
43	1.00	37.00	1	4	27	t	frasco.png
44	1.00	70.00	10	1	28	t	caja.png
45	1.00	7.00	1	10	28	t	cualquiera.png
48	0.54	15.00	10	1	30	t	caja.png
49	0.54	1.50	1	31	30	t	tableta.png
50	0.42	30.00	1	4	31	t	frasco.png
51	0.51	17.00	10	3	32	t	blister.png
52	0.51	170.00	100	1	32	t	caja.png
53	0.43	17.00	1	20	33	t	cualquiera.png
54	0.45	16.00	1	20	34	t	cualquiera.png
55	0.40	9.00	1	4	35	t	frasco.png
56	0.40	360.00	40	1	35	t	caja.png
57	0.60	2.00	10	3	36	t	blister.png
58	0.60	20.00	100	1	36	t	caja.png
59	0.43	400.00	10	1	37	t	caja.png
60	0.43	40.00	1	26	37	t	cualquiera.png
61	0.39	39.00	1	4	38	t	frasco.png
62	0.42	23.00	1	20	39	t	cualquiera.png
63	0.63	150.00	10	1	40	t	caja.png
64	0.63	15.00	1	9	40	t	cualquiera.png
65	0.44	5.00	10	3	41	t	blister.png
66	0.44	50.00	100	1	41	t	caja.png
67	0.45	8.00	20	3	42	t	blister.png
68	0.45	40.00	100	1	42	t	caja.png
69	0.41	39.00	1	4	43	t	frasco.png
70	0.43	7.00	10	3	44	t	blister.png
71	0.43	70.00	100	1	44	t	caja.png
72	0.54	0.95	20	3	45	t	blister.png
73	0.42	17.00	1	26	46	t	cualquiera.png
74	0.59	7.00	10	3	47	t	blister.png
75	0.59	70.00	100	1	47	t	caja.png
76	0.51	9.00	10	3	48	t	blister.png
77	0.51	90.00	100	1	48	t	caja.png
78	0.46	0.80	10	3	49	t	blister.png
79	0.46	8.00	100	1	49	t	caja.png
82	0.50	25.00	100	1	51	t	caja.png
83	0.51	17.00	10	3	52	t	blister.png
80	1.00	2.50	10	3	50	t	blister.png
81	1.00	25.00	100	1	50	t	caja.png
84	0.51	170.00	100	1	52	t	caja.png
85	0.42	3.00	1	9	53	t	cualquiera.png
86	0.46	12.00	10	3	54	t	blister.png
87	0.46	120.00	100	1	54	t	caja.png
88	0.48	13.00	10	3	55	t	blister.png
89	0.48	26.00	20	1	55	t	caja.png
90	0.42	7.00	12	1	56	t	caja.png
91	0.44	19.00	1	14	57	t	cualquiera.png
92	0.69	4.00	10	3	58	t	blister.png
93	0.69	20.00	50	1	58	t	caja.png
94	0.44	4.50	10	3	59	t	blister.png
95	0.44	4.50	10	1	59	t	caja.png
96	0.46	8.00	20	3	60	t	blister.png
97	0.46	40.00	100	1	60	t	caja.png
98	0.46	15.00	10	3	61	t	blister.png
99	0.46	45.00	30	1	61	t	caja.png
100	0.39	13.00	10	3	62	t	blister.png
101	0.39	130.00	100	1	62	t	caja.png
102	0.43	20.00	10	3	63	t	blister.png
103	0.43	100.00	50	1	63	t	caja.png
104	0.45	22.00	1	4	64	t	frasco.png
106	0.43	20.00	10	3	66	t	blister.png
105	1.00	85.00	1	9	65	t	cualquiera.png
1	0.43	12.00	1	11	1	t	cualquiera.png
113	0.42	20.00	1	4	70	t	frasco.png
115	0.36	94.00	1	26	71	t	cualquiera.png
122	0.51	12.00	10	3	75	t	blister.png
128	0.44	10.00	50	1	78	t	caja.png
129	0.46	35.00	10	1	79	t	caja.png
146	0.50	20.00	10	3	90	t	blister.png
160	0.64	100.00	100	1	97	t	caja.png
162	0.66	100.00	100	1	98	t	caja.png
154	1.00	150.00	100	1	94	t	caja.png
155	1.00	1.50	1	19	94	t	cualquiera.png
158	1.00	100.00	100	1	96	t	caja.png
159	1.00	1.00	1	19	96	t	cualquiera.png
163	0.66	1.00	1	19	98	t	cualquiera.png
170	0.52	10.00	50	1	102	t	caja.png
171	0.40	1.40	10	3	103	t	blister.png
174	0.41	27.00	1	4	105	t	frasco.png
176	0.43	10.00	10	1	107	t	caja.png
177	0.43	1.00	1	31	107	t	tableta.png
187	0.37	105.00	100	1	116	t	caja.png
198	0.40	85.00	50	1	122	t	caja.png
199	0.40	17.00	10	3	122	t	blister.png
205	0.45	18.00	1	4	126	t	frasco.png
211	0.58	5.00	10	3	131	t	blister.png
212	0.58	50.00	100	1	131	t	caja.png
214	0.41	52.00	1	20	133	t	cualquiera.png
221	0.40	75.00	3	1	138	t	caja.png
222	0.40	25.00	1	13	138	t	cualquiera.png
227	0.40	105.00	3	1	141	t	caja.png
241	0.43	3.00	30	1	150	t	caja.png
242	0.43	1.00	10	3	150	t	blister.png
258	0.45	60.00	1	14	162	t	cualquiera.png
262	0.39	120.00	24	1	166	t	caja.png
264	0.46	8.00	1	9	168	t	cualquiera.png
265	0.38	75.00	30	1	169	t	caja.png
271	0.44	35.00	50	1	172	t	caja.png
290	0.41	63.00	1	14	186	t	cualquiera.png
325	0.47	29.00	1	1	215	t	caja.png
326	0.59	20.00	1	26	216	t	cualquiera.png
330	0.54	20.00	1	14	219	t	cualquiera.png
337	0.49	40.00	1	1	225	t	caja.png
346	0.50	18.00	150	1	231	t	caja.png
351	0.42	12.00	1	1	235	t	caja.png
367	0.47	10.00	1	26	251	t	cualquiera.png
377	0.47	10.00	1	4	261	t	frasco.png
392	0.48	50.00	1	4	271	t	frasco.png
398	0.48	77.00	1	20	275	t	cualquiera.png
405	0.60	10.00	1	9	281	t	cualquiera.png
407	0.50	150.00	30	1	283	t	caja.png
408	0.50	50.00	10	3	283	t	blister.png
409	0.60	100.00	50	1	284	t	caja.png
420	0.50	10.00	1	4	292	t	frasco.png
426	0.71	35.00	1	26	298	t	cualquiera.png
432	0.53	25.00	1	27	304	t	cualquiera.png
444	0.38	5.00	1	1	314	t	caja.png
445	0.54	55.00	10	1	315	t	caja.png
446	0.54	5.50	1	10	315	t	cualquiera.png
451	0.39	57.00	1	1	320	t	caja.png
457	0.53	30.00	20	1	326	t	caja.png
462	0.40	20.00	20	1	331	t	caja.png
465	0.50	30.00	20	1	334	t	caja.png
474	0.49	50.00	1	4	342	t	frasco.png
485	0.41	128.00	16	1	353	t	caja.png
472	1.00	70.00	1	4	340	t	frasco.png
486	0.41	8.00	1	13	353	t	cualquiera.png
492	0.37	19.00	1	8	358	t	frasco.png
499	0.35	37.00	1	8	365	t	frasco.png
501	0.40	8.00	10	3	367	t	blister.png
502	0.40	80.00	100	1	367	t	caja.png
503	0.44	0.50	1	19	368	t	cualquiera.png
506	0.54	0.50	1	19	371	t	cualquiera.png
514	0.40	28.00	1	8	379	t	frasco.png
505	1.00	0.50	1	19	370	t	cualquiera.png
515	0.42	15.00	1	27	380	t	cualquiera.png
510	1.00	0.50	1	19	375	t	cualquiera.png
524	0.39	108.00	36	2	386	t	cualquiera.png
525	0.39	3.00	1	31	386	t	tableta.png
523	1.00	12.00	1	7	385	t	cualquiera.png
529	0.46	10.00	1	7	389	t	cualquiera.png
532	0.44	10.00	1	7	392	t	cualquiera.png
541	0.00	0.00	10	3	399	t	blister.png
545	0.42	10.00	1	20	402	t	cualquiera.png
554	0.39	16.00	1	7	410	t	cualquiera.png
555	0.54	20.00	1	9	411	t	cualquiera.png
557	0.36	25.00	100	7	413	t	cualquiera.png
558	0.39	20.00	1	31	414	t	tableta.png
570	0.41	30.00	10	3	423	t	blister.png
559	1.00	114.00	1	1	415	t	caja.png
576	0.37	41.00	1	26	426	t	cualquiera.png
577	0.43	18.00	100	1	427	t	caja.png
578	0.43	1.80	10	3	427	t	blister.png
581	0.60	0.25	1	13	430	t	cualquiera.png
582	0.39	81.00	30	1	431	t	caja.png
588	0.35	42.00	1	4	435	t	frasco.png
612	0.38	20.00	1	4	451	t	frasco.png
624	0.45	144.00	72	2	462	t	cualquiera.png
591	0.00	0.00	1	2	437	t	cualquiera.png
628	0.45	10.00	1	9	467	t	cualquiera.png
630	0.36	72.00	1	4	469	t	frasco.png
633	0.39	60.00	5	1	472	t	caja.png
636	0.35	11.00	1	32	473	t	cualquiera.png
637	0.34	79.00	1	26	474	t	cualquiera.png
384	0.46	35.00	50	1	266	t	caja.png
385	0.46	7.00	10	3	266	t	blister.png
571	0.41	120.00	40	1	423	t	caja.png
634	0.39	12.00	1	32	472	t	cualquiera.png
114	0.42	20.00	1	26	70	t	cualquiera.png
116	0.46	12.00	2	1	72	t	caja.png
118	0.42	45.00	30	1	73	t	caja.png
119	0.42	15.00	10	3	73	t	blister.png
124	0.42	24.00	1	20	76	t	cualquiera.png
130	0.44	19.00	1	4	80	t	frasco.png
147	0.50	200.00	100	1	90	t	caja.png
150	0.37	39.60	10	3	92	t	blister.png
151	0.37	118.80	30	1	92	t	caja.png
152	0.37	42.00	10	3	93	t	blister.png
153	0.37	126.00	30	1	93	t	caja.png
156	0.60	150.00	100	1	95	t	caja.png
161	0.64	1.00	1	19	97	t	cualquiera.png
172	0.40	14.00	100	1	103	t	caja.png
173	0.45	25.00	1	14	104	t	cualquiera.png
180	0.69	25.00	100	1	109	t	caja.png
189	0.45	6.00	10	3	117	t	blister.png
197	0.45	19.00	1	4	121	t	frasco.png
203	0.41	7.50	50	1	125	t	caja.png
206	0.42	19.00	1	20	127	t	cualquiera.png
207	0.44	16.00	1	25	128	t	cualquiera.png
209	0.44	192.00	6	1	130	t	caja.png
210	0.44	32.00	1	31	130	t	tableta.png
217	0.39	10.00	1	17	135	t	cualquiera.png
223	0.41	72.00	3	1	139	t	caja.png
225	0.41	60.00	3	1	140	t	caja.png
240	0.43	23.00	1	11	149	t	cualquiera.png
243	0.51	240.00	24	1	151	t	caja.png
251	0.39	132.00	30	1	157	t	caja.png
252	0.39	44.00	10	3	157	t	blister.png
263	0.37	120.00	24	1	167	t	caja.png
267	0.52	2.50	10	3	170	t	blister.png
270	0.44	7.00	10	3	172	t	blister.png
278	0.44	45.00	1	7	178	t	cualquiera.png
282	0.42	2.25	4	3	180	t	blister.png
283	0.41	85.00	1	31	181	t	tableta.png
303	0.62	80.00	1	1	197	t	caja.png
305	0.63	80.00	1	1	199	t	caja.png
310	0.49	40.00	1	4	203	t	frasco.png
311	0.41	68.00	1	4	204	t	frasco.png
315	0.70	68.00	1	1	207	t	caja.png
316	0.47	28.25	100	1	208	t	caja.png
321	0.43	700.00	28	1	212	t	caja.png
322	0.43	350.00	14	3	212	t	blister.png
328	0.45	10.00	100	1	218	t	caja.png
329	0.45	1.00	10	3	218	t	blister.png
332	0.49	40.00	1	4	221	t	frasco.png
338	0.45	96.00	120	1	226	t	caja.png
340	0.45	82.00	1	1	227	t	caja.png
348	0.67	10.00	60	1	233	t	caja.png
349	0.67	2.00	12	3	233	t	blister.png
352	0.47	20.00	1	9	236	t	cualquiera.png
364	0.42	26.00	1	4	248	t	frasco.png
366	0.59	3.00	24	1	250	t	caja.png
373	0.40	19.00	1	8	257	t	frasco.png
374	0.39	19.00	1	8	258	t	frasco.png
378	0.63	20.00	100	1	262	t	caja.png
379	0.63	2.00	10	3	262	t	blister.png
393	0.53	3.50	1	2	272	t	cualquiera.png
394	0.83	4.70	10	3	273	t	blister.png
395	0.83	47.00	100	1	273	t	caja.png
399	0.41	77.00	1	27	276	t	cualquiera.png
400	0.69	8.00	1	9	277	t	cualquiera.png
411	0.45	78.00	26	1	286	t	caja.png
418	0.63	0.65	20	3	291	t	blister.png
419	0.63	3.25	100	1	291	t	caja.png
423	0.70	15.00	1	20	295	t	cualquiera.png
428	0.43	18.00	1	26	300	t	cualquiera.png
438	0.50	250.00	1000	1	308	t	caja.png
440	0.50	20.00	1	1	310	t	caja.png
447	0.52	25.00	1	26	316	t	cualquiera.png
450	0.39	57.00	1	1	319	t	caja.png
456	0.50	30.00	20	1	325	t	caja.png
473	0.49	30.00	3	1	341	t	caja.png
476	0.42	16.00	1	19	344	t	cualquiera.png
477	0.42	16.00	1	19	345	t	cualquiera.png
497	0.51	4.50	1	1	363	t	caja.png
500	0.41	8.00	1	8	366	t	frasco.png
517	0.50	2.50	1	31	381	t	tableta.png
531	0.63	10.00	1	7	391	t	cualquiera.png
535	0.39	110.00	1	4	395	t	frasco.png
539	0.33	10.00	100	1	398	t	caja.png
546	0.44	63.00	36	1	403	t	caja.png
537	1.00	30.00	1	14	397	t	cualquiera.png
547	0.44	21.00	12	3	403	t	blister.png
580	0.56	0.25	1	13	429	t	cualquiera.png
584	0.39	2.70	1	31	431	t	tableta.png
585	0.34	69.00	1	4	432	t	frasco.png
593	0.50	19.00	1	14	438	t	cualquiera.png
594	0.36	144.00	36	1	439	t	caja.png
589	1.00	10.00	10	3	436	t	blister.png
590	1.00	1.00	1	31	436	t	tableta.png
592	0.00	0.00	1	31	437	t	tableta.png
595	0.36	4.00	1	16	439	t	cualquiera.png
597	0.69	4.00	4	3	440	t	blister.png
598	0.69	1.00	1	31	440	t	tableta.png
603	0.39	18.00	1	4	443	t	frasco.png
604	0.34	42.00	30	1	444	t	caja.png
600	1.00	2.00	4	3	441	t	blister.png
605	0.34	14.00	10	3	444	t	blister.png
615	0.39	25.00	1	8	454	t	frasco.png
621	0.41	25.00	1	20	459	t	cualquiera.png
623	1.00	160.00	32	7	461	t	cualquiera.png
108	0.46	600.00	30	1	67	t	caja.png
117	0.46	6.00	1	17	72	t	cualquiera.png
127	0.44	2.00	10	3	78	t	blister.png
134	0.50	5.00	10	3	84	t	blister.png
157	0.60	1.50	1	19	95	t	cualquiera.png
165	0.60	1.00	1	19	99	t	cualquiera.png
166	0.65	100.00	100	1	100	t	caja.png
167	0.65	1.00	1	19	100	t	cualquiera.png
168	0.54	10.00	1	20	101	t	cualquiera.png
178	0.51	78.00	30	1	108	t	caja.png
181	0.69	5.00	20	3	109	t	blister.png
188	0.37	10.50	10	3	116	t	blister.png
190	0.45	60.00	100	1	117	t	caja.png
191	0.40	70.00	10	3	118	t	blister.png
192	0.40	7.00	1	31	118	t	tableta.png
202	0.43	32.00	1	4	124	t	frasco.png
204	0.41	1.50	10	3	125	t	blister.png
208	0.42	45.00	1	10	129	t	cualquiera.png
213	0.39	49.00	1	20	132	t	cualquiera.png
215	0.55	4.20	10	3	134	t	blister.png
216	0.55	42.00	100	1	134	t	caja.png
218	0.40	66.00	30	1	136	t	caja.png
224	0.41	24.00	1	13	139	t	cualquiera.png
231	0.41	4.50	30	1	143	t	caja.png
232	0.41	1.50	10	3	143	t	blister.png
237	0.45	32.00	4	1	147	t	caja.png
238	0.45	8.00	1	31	147	t	tableta.png
244	0.51	10.00	1	31	151	t	tableta.png
249	0.46	3.00	10	3	155	t	blister.png
255	0.37	35.00	1	26	159	t	cualquiera.png
256	0.45	450.00	30	1	160	t	caja.png
261	0.44	60.00	24	1	165	t	caja.png
268	0.41	11.40	20	1	171	t	caja.png
269	0.41	5.70	10	3	171	t	blister.png
280	0.72	2.00	1	7	179	t	cualquiera.png
281	0.42	56.25	100	1	180	t	caja.png
286	0.49	40.00	1	4	183	t	frasco.png
287	0.35	5.00	4	3	184	t	blister.png
288	0.35	25.00	20	1	184	t	caja.png
292	0.42	12.00	1	26	188	t	cualquiera.png
294	0.83	2.50	12	3	190	t	blister.png
295	0.83	5.00	24	1	190	t	caja.png
299	0.50	65.00	1	31	194	t	tableta.png
300	0.50	65.00	1	4	194	t	frasco.png
304	0.62	80.00	1	1	198	t	caja.png
306	0.41	110.00	1	1	200	t	caja.png
307	0.49	17.00	1	10	201	t	cualquiera.png
313	0.39	3.20	10	3	206	t	blister.png
314	0.39	32.00	100	1	206	t	caja.png
318	0.49	68.00	1	1	209	t	caja.png
319	0.40	142.00	10	1	210	t	caja.png
323	0.86	110.00	1	4	213	t	frasco.png
327	0.49	20.00	1	26	217	t	cualquiera.png
320	1.00	17.00	100	1	211	t	caja.png
336	0.48	96.00	24	1	224	t	caja.png
345	0.50	1.20	10	3	231	t	blister.png
355	0.81	120.00	48	1	241	t	caja.png
356	0.81	10.00	4	3	241	t	blister.png
359	0.35	39.00	1	1	244	t	caja.png
369	0.39	19.00	1	8	253	t	frasco.png
370	0.39	19.00	1	8	254	t	frasco.png
380	0.40	19.00	10	3	263	t	blister.png
383	0.49	40.00	1	4	265	t	frasco.png
386	0.43	70.00	40	1	267	t	caja.png
387	0.41	110.00	100	1	268	t	caja.png
388	0.41	11.00	10	3	268	t	blister.png
396	0.78	0.90	10	3	274	t	blister.png
397	0.78	45.00	500	1	274	t	caja.png
406	0.45	55.00	1	1	282	t	caja.png
410	0.44	72.00	24	1	285	t	caja.png
412	0.47	130.00	52	1	287	t	caja.png
413	0.66	144.00	60	1	288	t	caja.png
414	0.66	12.00	5	3	288	t	blister.png
416	0.52	2.00	1	1	290	t	caja.png
417	0.52	2.00	1	31	290	t	tableta.png
424	0.46	25.00	1	26	296	t	cualquiera.png
431	0.52	100.00	50	1	303	t	caja.png
436	0.40	10.00	100	1	307	t	caja.png
437	0.40	1.00	10	3	307	t	blister.png
441	0.40	70.00	1	8	311	t	frasco.png
452	0.37	57.00	1	1	321	t	caja.png
453	0.39	57.00	1	1	322	t	caja.png
454	0.50	30.00	20	1	323	t	caja.png
460	0.48	23.00	20	1	329	t	caja.png
461	0.49	30.00	20	1	330	t	caja.png
467	0.55	33.00	1	20	336	t	cualquiera.png
471	0.50	40.00	10	1	339	t	caja.png
481	0.40	10.00	12	1	349	t	caja.png
482	0.45	5.80	1	9	350	t	cualquiera.png
487	0.38	128.00	16	1	354	t	caja.png
488	0.38	8.00	1	13	354	t	cualquiera.png
496	0.52	4.50	1	1	362	t	caja.png
498	0.46	0.50	1	10	364	t	cualquiera.png
508	0.38	0.50	1	19	373	t	cualquiera.png
516	0.50	90.00	36	1	381	t	caja.png
504	1.00	0.50	1	19	369	t	cualquiera.png
526	0.33	90.00	60	2	387	t	cualquiera.png
527	0.33	1.50	1	31	387	t	tableta.png
528	0.38	32.00	5	21	388	t	cualquiera.png
530	0.44	10.00	1	7	390	t	cualquiera.png
533	0.46	10.00	1	7	393	t	cualquiera.png
534	0.42	7.00	1	1	394	t	caja.png
536	0.51	19.00	1	8	396	t	frasco.png
548	0.44	1.75	1	31	403	t	tableta.png
552	0.38	81.00	1	20	405	t	cualquiera.png
110	0.40	83.00	10	1	68	t	caja.png
135	0.50	50.00	100	1	84	t	caja.png
125	0.51	12.00	10	3	77	t	blister.png
126	0.51	36.00	30	1	77	t	caja.png
132	0.40	900.00	12	1	82	t	caja.png
133	0.38	13.00	1	4	83	t	frasco.png
136	0.55	4.00	10	3	85	t	blister.png
137	0.55	40.00	100	1	85	t	caja.png
138	0.55	5.00	10	3	86	t	blister.png
139	0.55	50.00	100	1	86	t	caja.png
144	0.44	1.40	10	3	89	t	blister.png
145	0.44	14.00	100	1	89	t	caja.png
148	0.37	61.00	10	3	91	t	blister.png
149	0.37	183.00	30	1	91	t	caja.png
169	0.52	2.00	10	3	102	t	blister.png
175	0.54	90.00	100	1	106	t	caja.png
179	0.51	13.00	5	3	108	t	blister.png
182	0.48	40.00	100	1	110	t	caja.png
183	0.46	15.00	1	26	111	t	cualquiera.png
185	0.40	10.00	10	3	115	t	blister.png
186	0.40	100.00	100	1	115	t	caja.png
193	0.59	8.00	10	3	119	t	blister.png
194	0.59	80.00	100	1	119	t	caja.png
196	0.44	80.00	100	1	120	t	caja.png
200	0.47	15.00	10	3	123	t	blister.png
201	0.47	150.00	100	1	123	t	caja.png
228	0.40	35.00	1	13	141	t	cualquiera.png
233	0.67	1.00	1	7	144	t	cualquiera.png
234	0.42	23.00	1	4	145	t	frasco.png
235	0.61	36.00	4	1	146	t	caja.png
245	0.41	1.60	20	3	152	t	blister.png
246	0.41	8.00	100	1	152	t	caja.png
250	0.52	3.00	1	32	156	t	cualquiera.png
266	0.38	25.00	10	3	169	t	blister.png
274	0.41	69.00	1	26	174	t	cualquiera.png
275	0.37	33.00	1	26	175	t	cualquiera.png
277	0.43	32.00	1	26	177	t	cualquiera.png
279	0.72	144.00	72	1	179	t	caja.png
291	0.73	0.75	1	7	187	t	cualquiera.png
293	0.59	30.00	1	26	189	t	cualquiera.png
296	0.75	100.00	100	1	191	t	caja.png
297	0.44	68.00	1	4	192	t	frasco.png
298	0.67	45.00	1	7	193	t	cualquiera.png
301	0.44	20.00	1	14	195	t	cualquiera.png
302	0.62	80.00	1	1	196	t	caja.png
317	0.47	1.13	4	3	208	t	blister.png
331	0.64	44.00	100	1	220	t	caja.png
312	1.00	4.00	1	8	205	t	frasco.png
344	0.81	49.00	1	14	230	t	cualquiera.png
350	0.44	29.00	1	26	234	t	cualquiera.png
353	0.54	55.00	1	4	239	t	frasco.png
354	0.57	7.00	1	9	240	t	cualquiera.png
360	0.40	0.50	100	7	245	t	cualquiera.png
361	0.47	95.00	1	1	246	t	caja.png
362	0.38	56.04	60	1	247	t	caja.png
363	0.38	9.34	10	3	247	t	blister.png
371	0.39	19.00	1	8	255	t	frasco.png
372	0.39	19.00	1	8	256	t	frasco.png
381	0.40	95.00	50	1	263	t	caja.png
382	0.47	23.00	1	8	264	t	frasco.png
389	0.47	10.00	1	8	269	t	frasco.png
390	0.71	13.00	1	4	270	t	frasco.png
391	0.71	130.00	10	7	270	t	cualquiera.png
401	0.80	31.25	100	1	278	t	caja.png
402	0.80	1.25	4	3	278	t	blister.png
403	0.41	3.50	1	2	279	t	cualquiera.png
415	0.35	43.00	1	8	289	t	frasco.png
433	0.44	80.00	50	1	305	t	caja.png
434	0.44	8.00	5	3	305	t	blister.png
435	0.63	8.00	1	4	306	t	frasco.png
458	0.63	40.00	20	1	327	t	caja.png
463	0.60	30.00	20	1	332	t	caja.png
449	1.00	20.00	20	1	318	t	caja.png
466	0.49	50.00	1	4	335	t	frasco.png
468	0.60	100.00	100	1	337	t	caja.png
475	0.48	58.00	1	20	343	t	cualquiera.png
478	0.37	3.00	100	2	346	t	cualquiera.png
483	0.75	80.00	1	1	351	t	caja.png
484	0.60	100.00	100	1	352	t	caja.png
480	1.00	96.00	24	1	348	t	caja.png
495	0.51	4.50	1	1	361	t	caja.png
507	0.38	0.50	1	19	372	t	cualquiera.png
518	0.40	90.00	24	1	382	t	caja.png
520	0.34	35.00	10	1	383	t	caja.png
511	1.00	0.50	1	19	376	t	cualquiera.png
521	0.34	3.50	1	31	383	t	tableta.png
538	0.33	1.00	10	3	398	t	blister.png
544	0.34	51.00	1	8	401	t	frasco.png
522	1.00	0.50	1	7	384	t	cualquiera.png
549	0.36	9.00	10	3	404	t	blister.png
550	0.36	90.00	100	1	404	t	caja.png
553	0.39	78.00	1	20	406	t	cualquiera.png
560	0.34	77.00	1	20	416	t	cualquiera.png
561	0.36	144.00	48	1	417	t	caja.png
562	0.36	3.00	1	31	417	t	tableta.png
563	0.40	8.50	1	9	418	t	cualquiera.png
565	0.40	2.70	60	1	419	t	caja.png
583	0.39	27.00	10	3	431	t	blister.png
586	0.35	40.00	1	4	433	t	frasco.png
596	0.69	200.00	200	2	440	t	cualquiera.png
608	0.42	12.00	1	13	447	t	cualquiera.png
260	0.00	0.00	1	26	164	t	cualquiera.png
599	1.00	100.00	200	2	441	t	cualquiera.png
601	1.00	0.50	1	31	441	t	tableta.png
112	0.41	32.00	1	4	69	t	frasco.png
120	0.43	3.00	10	3	74	t	blister.png
142	0.53	1.00	10	3	88	t	blister.png
143	0.53	5.00	50	1	88	t	caja.png
164	0.60	100.00	100	1	99	t	caja.png
184	0.44	270.00	18	1	114	t	caja.png
195	0.44	8.00	10	3	120	t	blister.png
219	0.41	60.00	30	1	137	t	caja.png
220	0.41	20.00	10	3	137	t	blister.png
226	0.41	20.00	1	13	140	t	cualquiera.png
229	0.40	81.00	3	1	142	t	caja.png
230	0.40	27.00	1	13	142	t	cualquiera.png
236	0.61	9.00	1	31	146	t	tableta.png
239	0.45	20.00	1	25	148	t	cualquiera.png
253	0.57	7.00	10	3	158	t	blister.png
254	0.57	70.00	100	1	158	t	caja.png
247	1.00	8.00	16	1	154	t	caja.png
248	1.00	0.50	1	7	154	t	cualquiera.png
257	0.45	36.00	1	9	161	t	cualquiera.png
259	0.44	60.00	24	1	163	t	caja.png
272	0.38	40.00	100	1	173	t	caja.png
273	0.38	4.00	10	3	173	t	blister.png
276	0.42	31.00	1	4	176	t	frasco.png
284	0.41	8500.00	100	1	182	t	caja.png
285	0.41	85.00	1	31	182	t	tableta.png
289	0.50	26.00	1	21	185	t	cualquiera.png
308	0.38	2.80	10	3	202	t	blister.png
309	0.38	5.60	20	1	202	t	caja.png
324	0.47	29.00	1	1	214	t	caja.png
333	0.42	10.00	10	3	222	t	blister.png
334	0.42	100.00	100	1	222	t	caja.png
335	0.48	96.00	24	1	223	t	caja.png
339	0.45	4.00	5	3	226	t	blister.png
341	0.81	50.00	1	14	228	t	cualquiera.png
342	0.69	8.00	5	3	229	t	blister.png
343	0.69	96.00	60	1	229	t	caja.png
347	0.45	100.00	100	1	232	t	caja.png
357	0.42	35.00	1	26	242	t	cualquiera.png
358	0.44	39.00	1	1	243	t	caja.png
368	0.40	19.00	1	8	252	t	frasco.png
375	0.40	19.00	1	8	259	t	frasco.png
365	1.00	3.00	24	1	249	t	caja.png
404	0.47	43.75	100	1	280	t	caja.png
425	0.53	19.00	1	14	297	t	cualquiera.png
376	1.00	28.00	1	4	260	t	frasco.png
427	0.72	45.00	1	1	299	t	caja.png
421	1.00	13.00	1	20	293	t	cualquiera.png
422	1.00	22.00	1	20	294	t	cualquiera.png
429	0.53	20.00	1	26	301	t	cualquiera.png
430	0.60	100.00	50	1	302	t	caja.png
439	0.47	66.00	200	1	309	t	caja.png
442	0.64	15.00	1	1	312	t	caja.png
443	0.50	150.00	30	1	313	t	caja.png
448	0.75	80.00	100	1	317	t	caja.png
455	0.50	30.00	20	1	324	t	caja.png
459	0.67	30.00	20	1	328	t	caja.png
464	0.67	30.00	20	1	333	t	caja.png
469	0.45	100.00	100	1	338	t	caja.png
470	0.45	10.00	10	3	338	t	blister.png
479	0.49	40.00	1	4	347	t	frasco.png
489	0.44	27.00	1	8	355	t	frasco.png
490	0.53	32.00	1	26	356	t	cualquiera.png
491	0.56	90.00	100	2	357	t	cualquiera.png
493	0.49	20.00	1	4	359	t	frasco.png
494	0.48	18.00	1	26	360	t	cualquiera.png
519	0.40	3.75	1	31	382	t	tableta.png
540	0.00	0.00	100	1	399	t	caja.png
509	1.00	0.50	1	19	374	t	cualquiera.png
512	1.00	0.50	1	19	377	t	cualquiera.png
513	1.00	1.00	1	19	378	t	cualquiera.png
542	0.38	1.00	10	3	400	t	blister.png
543	0.38	10.00	100	1	400	t	caja.png
556	0.44	7.00	1	20	412	t	cualquiera.png
564	0.40	0.90	20	3	419	t	blister.png
566	0.36	2.80	10	3	420	t	blister.png
567	0.36	8.40	30	1	420	t	caja.png
568	0.59	40.00	16	7	421	t	cualquiera.png
569	0.34	55.00	1	4	422	t	frasco.png
572	0.41	3.00	1	31	423	t	tableta.png
573	0.35	77.00	1	26	424	t	cualquiera.png
574	0.40	57.00	3	1	425	t	caja.png
575	0.40	19.00	1	9	425	t	cualquiera.png
579	0.34	18.00	1	4	428	t	frasco.png
587	0.38	61.00	1	4	434	t	frasco.png
602	0.43	9.00	1	1	442	t	caja.png
609	0.38	13.00	1	13	448	t	cualquiera.png
610	0.46	9.00	1	13	449	t	cualquiera.png
606	1.00	7.00	1	13	445	t	cualquiera.png
607	1.00	29.00	1	13	446	t	cualquiera.png
611	0.40	22.00	1	13	450	t	cualquiera.png
613	0.37	250.00	25	1	452	t	caja.png
614	0.37	250.00	25	1	453	t	caja.png
616	0.63	1.00	1	19	455	t	cualquiera.png
618	0.41	17.50	5	3	457	t	blister.png
617	1.00	1.00	1	19	456	t	cualquiera.png
620	0.39	18.00	1	4	458	t	frasco.png
622	0.37	16.00	1	4	460	t	frasco.png
625	0.40	10.00	1	20	465	t	cualquiera.png
626	0.39	60.00	10	3	466	t	blister.png
627	0.39	6.00	1	17	466	t	cualquiera.png
629	0.45	8.00	1	32	468	t	cualquiera.png
631	0.41	8.00	1	9	470	t	cualquiera.png
632	0.37	34.00	1	26	471	t	cualquiera.png
635	0.35	55.00	5	1	473	t	caja.png
131	0.41	126.00	14	1	81	t	caja.png
140	0.51	7.00	10	3	87	t	blister.png
619	0.41	3.50	1	31	457	t	tableta.png
648	1.00	80.00	20	1	480	t	caja.png
649	1.00	4.00	1	7	480	t	cualquiera.png
654	1.00	3.00	1	31	483	t	tableta.png
707	1.00	5.80	1	9	527	t	cualquiera.png
638	0.38	132.00	30	1	475	t	caja.png
673	0.37	7.50	10	3	496	t	blister.png
682	0.59	2.50	1	17	504	t	cualquiera.png
687	0.40	5.00	1	16	509	t	cualquiera.png
693	0.40	2.00	1	29	514	t	cualquiera.png
694	0.43	25.00	1	8	515	t	frasco.png
698	0.38	25.00	1	33	518	t	unidad.png
704	0.40	38.00	1	4	524	t	frasco.png
639	0.38	44.00	10	3	475	t	blister.png
640	0.38	4.40	1	17	475	t	cualquiera.png
641	0.36	12.00	10	3	476	t	blister.png
642	0.36	36.00	30	1	476	t	caja.png
643	0.36	1.20	1	31	476	t	tableta.png
651	0.40	12.00	20	1	481	t	caja.png
660	0.37	27.00	10	3	487	t	blister.png
661	0.37	2.70	1	31	487	t	tableta.png
663	0.44	13.00	1	8	489	t	frasco.png
668	0.41	8.00	10	3	494	t	blister.png
671	0.42	300.00	50	1	495	t	caja.png
674	0.44	14.00	3	1	497	t	caja.png
679	0.40	16.00	1	4	502	t	frasco.png
684	0.41	2.50	1	29	507	t	cualquiera.png
690	0.32	5.00	1	16	512	t	cualquiera.png
706	0.40	38.00	1	8	526	t	frasco.png
709	0.53	75.00	30	1	531	t	caja.png
653	1.00	144.00	48	2	483	t	cualquiera.png
662	1.00	20.00	1	4	488	t	frasco.png
680	1.00	26.00	1	4	503	t	frasco.png
644	0.41	1.75	2	3	477	t	blister.png
645	0.41	87.50	100	2	477	t	cualquiera.png
647	0.43	16.00	1	4	479	t	frasco.png
657	0.32	50.00	10	3	485	t	blister.png
659	0.37	81.00	30	1	487	t	caja.png
665	0.36	49.00	1	20	491	t	cualquiera.png
670	0.42	60.00	10	3	495	t	blister.png
676	0.41	24.00	3	1	499	t	caja.png
677	0.40	1.00	10	3	500	t	blister.png
681	0.59	30.00	12	1	504	t	caja.png
688	0.40	2.50	1	29	510	t	cualquiera.png
696	0.49	8.60	40	1	517	t	caja.png
697	0.49	4.30	20	3	517	t	blister.png
666	1.00	45.00	1	14	492	t	cualquiera.png
675	1.00	24.00	3	1	498	t	caja.png
701	1.00	39.00	1	33	521	t	unidad.png
705	1.00	35.00	1	26	525	t	cualquiera.png
646	0.39	2.50	1	31	478	t	tableta.png
650	0.40	6.00	10	3	481	t	blister.png
655	0.39	48.00	48	2	484	t	cualquiera.png
656	0.39	1.00	1	31	484	t	tableta.png
664	0.40	14.00	1	20	490	t	cualquiera.png
667	0.35	35.00	1	20	493	t	cualquiera.png
669	0.41	80.00	100	1	494	t	caja.png
672	0.42	6.00	1	16	495	t	cualquiera.png
678	0.37	22.00	1	8	501	t	frasco.png
683	0.42	19.00	1	4	505	t	frasco.png
685	0.37	150.00	30	1	508	t	caja.png
689	0.35	5.00	1	16	511	t	cualquiera.png
700	0.41	19.00	1	33	520	t	unidad.png
708	0.48	19.00	1	14	528	t	cualquiera.png
711	0.52	0.75	1	33	533	t	unidad.png
658	0.37	33.00	1	7	486	t	cualquiera.png
686	0.37	5.00	1	31	508	t	tableta.png
691	0.40	18.00	12	3	513	t	blister.png
695	0.36	18.00	1	8	516	t	frasco.png
699	0.40	15.00	1	4	519	t	frasco.png
703	0.40	68.00	1	4	523	t	frasco.png
710	0.41	48.00	1	9	532	t	cualquiera.png
702	1.00	87.50	25	1	522	t	caja.png
712	0.55	45.00	1	25	534	t	cualquiera.png
713	0.44	18.00	1	4	535	t	frasco.png
714	0.38	13.00	1	26	536	t	cualquiera.png
715	0.49	20.00	10	3	537	t	blister.png
716	0.49	100.00	50	1	537	t	caja.png
717	0.50	12.00	10	3	538	t	blister.png
718	0.50	120.00	100	1	538	t	caja.png
719	0.43	9.00	1	20	539	t	cualquiera.png
720	0.40	11.00	1	20	540	t	cualquiera.png
721	0.55	5.00	20	3	541	t	blister.png
722	0.55	25.00	100	1	541	t	caja.png
723	0.52	2.50	1	8	542	t	frasco.png
724	0.45	2.00	1	8	543	t	frasco.png
725	0.42	8.00	1	25	544	t	cualquiera.png
726	0.40	2.50	1	8	545	t	frasco.png
727	0.42	10.00	1	1	546	t	caja.png
728	0.41	65.00	1	26	547	t	cualquiera.png
729	0.41	59.00	1	25	548	t	cualquiera.png
730	0.40	72.00	1	1	549	t	caja.png
731	0.55	19.00	1	8	550	t	frasco.png
732	0.49	22.50	1	1	551	t	caja.png
733	0.43	24.00	4	1	552	t	caja.png
734	0.43	6.00	1	31	552	t	tableta.png
736	0.44	4.50	1	31	554	t	tableta.png
737	0.42	47.00	10	3	555	t	blister.png
735	1.00	29.00	1	26	553	t	cualquiera.png
738	0.42	94.00	20	1	555	t	caja.png
739	0.56	15.00	1	1	556	t	caja.png
740	0.41	27.00	1	1	557	t	caja.png
741	0.55	10.00	1	32	558	t	cualquiera.png
742	0.43	23.00	1	21	559	t	cualquiera.png
743	0.41	34.00	1	20	560	t	cualquiera.png
744	0.40	59.00	1	27	561	t	cualquiera.png
745	0.50	26.72	16	1	562	t	caja.png
746	0.38	7.60	30	1	563	t	caja.png
747	0.38	3.80	15	3	563	t	blister.png
748	0.40	58.00	1	8	564	t	frasco.png
749	0.50	25.00	10	3	565	t	blister.png
750	0.50	2.50	1	31	565	t	tableta.png
751	0.44	14.00	1	27	566	t	cualquiera.png
752	0.43	22.00	1	25	567	t	cualquiera.png
753	0.42	75.00	50	1	568	t	caja.png
754	0.38	52.00	1	1	569	t	caja.png
755	0.39	66.00	1	27	570	t	cualquiera.png
756	0.45	35.00	1	20	571	t	cualquiera.png
757	0.43	33.00	10	3	572	t	blister.png
758	0.43	99.00	30	1	572	t	caja.png
759	0.62	7.00	10	3	573	t	blister.png
760	0.62	70.00	100	1	573	t	caja.png
761	0.39	25.00	10	3	574	t	blister.png
762	0.39	2.50	1	31	574	t	tableta.png
763	0.36	8.66	24	1	575	t	caja.png
764	0.36	4.33	12	3	575	t	blister.png
765	0.41	320.00	10	3	576	t	blister.png
766	0.41	32.00	1	31	576	t	tableta.png
767	0.44	28.00	1	4	577	t	frasco.png
768	0.43	24.00	1	4	578	t	frasco.png
769	0.45	16.00	1	4	579	t	frasco.png
770	0.46	3.50	1	9	580	t	cualquiera.png
771	0.53	4.00	20	3	581	t	blister.png
772	0.53	20.00	100	1	581	t	caja.png
773	0.40	10.00	1	26	582	t	cualquiera.png
774	0.59	1.00	102	1	583	t	caja.png
775	0.44	10.00	1	20	584	t	cualquiera.png
776	0.60	9.00	1	21	585	t	cualquiera.png
777	0.42	20.00	1	1	586	t	caja.png
778	0.41	16.00	1	21	587	t	cualquiera.png
781	0.46	170.00	100	1	590	t	caja.png
782	0.46	17.00	10	3	590	t	blister.png
779	0.00	0.00	1	8	588	t	frasco.png
780	0.00	0.00	1	8	589	t	frasco.png
783	0.42	20.00	20	3	591	t	blister.png
784	0.42	100.00	100	1	591	t	caja.png
785	0.39	10.00	1	3	592	t	blister.png
788	0.55	3.00	1	7	595	t	cualquiera.png
789	0.41	58.00	1	25	596	t	cualquiera.png
786	1.00	3.00	1	8	593	t	frasco.png
787	1.00	3.00	1	8	594	t	frasco.png
790	0.40	40.00	1	9	597	t	cualquiera.png
791	0.52	10.00	100	1	598	t	caja.png
792	0.52	1.00	10	3	598	t	blister.png
793	0.45	26.00	1	4	599	t	frasco.png
794	0.52	4.00	1	9	600	t	cualquiera.png
795	0.40	19.00	1	14	601	t	cualquiera.png
798	0.44	12.00	1	21	603	t	cualquiera.png
799	0.47	9.00	1	21	604	t	cualquiera.png
796	1.00	19.00	20	3	602	t	blister.png
797	1.00	0.95	1	31	602	t	tableta.png
800	0.41	20.00	1	4	605	t	frasco.png
801	0.81	4.00	1	9	606	t	cualquiera.png
802	0.50	2.50	10	3	607	t	blister.png
803	0.50	25.00	100	1	607	t	caja.png
804	0.44	20.00	10	3	608	t	blister.png
805	0.44	2.00	1	31	608	t	tableta.png
806	0.41	11.00	10	3	609	t	blister.png
652	0.41	23.00	1	4	482	t	frasco.png
807	0.41	110.00	100	1	609	t	caja.png
817	0.47	20.00	1	14	617	t	cualquiera.png
821	0.39	750.00	10	1	620	t	caja.png
808	0.47	40.00	1	16	610	t	cualquiera.png
810	0.56	8.00	20	3	612	t	blister.png
811	0.56	40.00	100	1	612	t	caja.png
809	0.47	54.00	12	1	611	t	caja.png
812	0.43	25.00	1	4	613	t	frasco.png
819	0.64	500.00	100	1	619	t	caja.png
820	0.64	5.00	1	31	619	t	tableta.png
822	0.39	75.00	1	9	620	t	cualquiera.png
824	0.60	6.00	1	1	622	t	caja.png
813	0.40	41.00	1	26	614	t	cualquiera.png
815	0.44	0.90	10	3	616	t	blister.png
816	0.44	6.30	70	1	616	t	caja.png
823	0.41	6.00	1	1	621	t	caja.png
825	0.42	15.00	1	17	623	t	cualquiera.png
826	0.44	8.00	1	1	624	t	caja.png
827	0.43	6.00	50	1	625	t	caja.png
829	0.49	3.50	1	1	626	t	caja.png
830	0.44	4.00	1	9	627	t	cualquiera.png
831	0.72	30.00	100	1	628	t	caja.png
832	0.72	3.00	10	3	628	t	blister.png
833	0.55	5.00	10	3	629	t	blister.png
834	0.60	3.00	1	9	630	t	cualquiera.png
835	0.52	4.00	20	3	631	t	blister.png
836	0.52	20.00	100	1	631	t	caja.png
837	0.44	6.00	10	3	632	t	blister.png
838	0.44	60.00	100	1	632	t	caja.png
840	0.40	24.00	1	26	634	t	cualquiera.png
841	0.49	16.00	1	26	635	t	cualquiera.png
839	1.00	4.00	1	4	633	t	frasco.png
842	0.40	20.00	1	20	636	t	cualquiera.png
843	0.44	510.00	30	1	637	t	caja.png
844	0.44	17.00	1	31	637	t	tableta.png
845	0.46	14.00	1	25	638	t	cualquiera.png
846	0.45	5.70	30	1	639	t	caja.png
847	0.45	1.90	10	3	639	t	blister.png
848	0.38	84.00	30	1	640	t	caja.png
849	0.38	28.00	10	3	640	t	blister.png
850	0.45	99.00	30	1	641	t	caja.png
851	0.45	33.00	10	3	641	t	blister.png
852	0.37	38.33	1	1	642	t	caja.png
853	0.48	13.00	1	9	643	t	cualquiera.png
854	0.42	30.00	1	8	644	t	frasco.png
855	0.46	7.00	100	1	645	t	caja.png
856	0.46	0.70	10	3	645	t	blister.png
857	0.54	28.00	1	3	646	t	blister.png
858	0.64	3.00	1	4	647	t	frasco.png
859	0.64	3.00	1	4	648	t	frasco.png
860	0.70	50.00	100	1	649	t	caja.png
861	0.70	10.00	20	3	649	t	blister.png
862	0.57	7.00	10	3	650	t	blister.png
863	0.57	70.00	100	1	650	t	caja.png
864	0.71	5.00	10	3	651	t	blister.png
865	0.71	50.00	100	1	651	t	caja.png
867	0.47	6.00	1	8	653	t	frasco.png
868	0.40	10.00	1	25	654	t	cualquiera.png
866	1.00	6.00	1	8	652	t	frasco.png
869	0.40	4.00	1	3	655	t	blister.png
870	0.61	7.00	1	9	656	t	cualquiera.png
871	0.44	18.00	30	1	657	t	caja.png
872	0.44	6.00	10	3	657	t	blister.png
873	0.43	480.00	30	1	658	t	caja.png
874	0.43	160.00	10	3	658	t	blister.png
876	0.42	10.00	10	3	659	t	blister.png
877	0.42	100.00	100	1	659	t	caja.png
878	0.43	8.33	10	3	660	t	blister.png
879	0.43	24.99	30	1	660	t	caja.png
880	0.50	8.00	1	9	661	t	cualquiera.png
881	0.39	380.00	10	1	662	t	caja.png
882	0.39	38.00	1	32	662	t	cualquiera.png
883	0.43	13.00	1	25	663	t	cualquiera.png
884	0.47	5.00	10	3	664	t	blister.png
885	0.47	50.00	100	1	664	t	caja.png
886	0.42	25.00	1	1	665	t	caja.png
887	0.42	26.00	1	1	666	t	caja.png
888	0.46	12.00	1	20	667	t	cualquiera.png
890	0.48	32.00	1	4	669	t	frasco.png
891	0.52	10.00	1	9	670	t	cualquiera.png
892	0.43	12.00	1	9	671	t	cualquiera.png
889	1.00	2.00	1	3	668	t	blister.png
893	0.46	17.00	1	14	672	t	cualquiera.png
894	0.43	10.00	10	3	673	t	blister.png
895	0.43	30.00	30	1	673	t	caja.png
896	0.40	49.00	10	3	674	t	blister.png
897	0.40	147.00	30	1	674	t	caja.png
898	0.44	15.00	10	3	675	t	blister.png
899	0.44	150.00	100	1	675	t	caja.png
900	0.73	4.00	10	3	676	t	blister.png
901	0.73	40.00	100	1	676	t	caja.png
902	0.61	4.00	1	9	677	t	cualquiera.png
903	0.49	10.00	20	3	678	t	blister.png
904	0.49	50.00	100	1	678	t	caja.png
905	0.40	9.50	1	1	679	t	caja.png
908	0.60	30.00	100	1	681	t	caja.png
909	0.60	3.00	10	3	681	t	blister.png
910	0.47	55.00	1	27	682	t	cualquiera.png
906	0.00	0.00	10	3	680	t	blister.png
907	0.00	0.00	100	1	680	t	caja.png
911	0.41	23.00	1	8	683	t	frasco.png
912	0.41	23.00	1	8	684	t	frasco.png
913	0.41	23.00	1	8	685	t	frasco.png
914	0.41	23.00	1	8	686	t	frasco.png
915	0.37	15.00	1	8	687	t	frasco.png
916	0.37	15.00	1	8	688	t	frasco.png
917	0.37	15.00	1	8	689	t	frasco.png
918	0.37	15.00	1	8	690	t	frasco.png
919	0.40	29.00	1	8	691	t	frasco.png
920	0.40	29.00	1	8	692	t	frasco.png
921	0.40	29.00	1	8	693	t	frasco.png
922	0.40	29.00	1	8	694	t	frasco.png
923	0.67	6.00	1	1	695	t	caja.png
924	0.48	11.00	1	8	696	t	frasco.png
925	0.41	9.00	1	1	697	t	caja.png
926	0.50	25.00	1	4	698	t	frasco.png
927	0.43	0.70	10	3	699	t	blister.png
929	0.40	30.00	1	4	700	t	frasco.png
818	0.44	23.00	1	4	618	t	frasco.png
957	1.00	2.30	1	31	722	t	tableta.png
928	0.43	2.10	30	1	699	t	caja.png
931	0.73	36.00	4	3	702	t	blister.png
944	0.38	16.00	1	8	712	t	frasco.png
950	0.44	8.00	1	1	718	t	caja.png
953	0.52	26.00	10	3	720	t	blister.png
930	0.39	20.00	1	4	701	t	frasco.png
934	0.46	8.00	1	3	704	t	blister.png
951	0.46	1000.00	100	1	719	t	caja.png
932	0.73	9.00	1	31	702	t	tableta.png
935	0.48	6.00	10	3	705	t	blister.png
939	0.45	120.00	100	1	708	t	caja.png
941	0.41	25.00	1	1	709	t	caja.png
943	0.40	28.00	1	8	711	t	frasco.png
945	0.45	47.00	1	10	713	t	cualquiera.png
948	0.51	8.00	1	7	716	t	cualquiera.png
949	0.39	16.00	1	1	717	t	caja.png
946	0.00	0.00	1	8	714	t	frasco.png
933	0.76	1.50	1	1	703	t	caja.png
936	0.48	60.00	100	1	705	t	caja.png
938	0.43	37.00	1	26	707	t	cualquiera.png
940	0.45	12.00	10	3	708	t	blister.png
947	0.49	35.00	1	1	715	t	caja.png
952	0.46	10.00	1	3	719	t	blister.png
955	0.49	9.00	60	1	721	t	caja.png
956	1.00	23.00	10	1	722	t	caja.png
3	0.43	25.00	100	1	2	t	caja.png
107	0.43	200.00	100	1	66	t	caja.png
109	0.46	20.00	1	3	67	t	blister.png
111	0.40	8.30	1	31	68	t	tableta.png
121	0.43	30.00	100	1	74	t	caja.png
123	0.51	120.00	100	1	75	t	caja.png
141	0.51	70.00	100	1	87	t	caja.png
551	0.36	0.90	1	31	404	t	tableta.png
692	0.40	1.50	1	29	513	t	cualquiera.png
814	0.47	8.00	1	9	615	t	cualquiera.png
828	0.43	1.20	10	3	625	t	blister.png
875	0.43	16.00	1	17	658	t	cualquiera.png
937	0.69	0.25	1	8	706	t	frasco.png
942	0.42	20.00	1	8	710	t	frasco.png
954	0.52	156.00	60	1	720	t	caja.png
\.


--
-- TOC entry 4930 (class 0 OID 58154)
-- Dependencies: 238
-- Data for Name: presentaciones; Type: TABLE DATA; Schema: public; Owner: ownerfarmacia
--

COPY public.presentaciones (id, nombre, descripcion) FROM stdin;
1	CAJA	
2	DISPENSADOR	
3	BLISTER	
4	FRASCO	
6	CARTERITA	
7	BOLSA	
8	BOTE	
9	AMPOLLA	
10	VIAL	
11	BOTELLA	
12	AMPOLLA BEBIBLE	
13	SACHET	
14	KIT	
15	POLVO PARA SUSPENSION	
16	GELATINA BLANDA	
17	CAPSULA	
18	CAPLET	
19	JERINGA PRELLENADA	
20	CREMA	
21	TUBO	
22	POMADA	
23	LOCION	
24	SOLUCION	
25	SUSPENSION	
26	JARABE	
27	SPRAY	
28	AEROSOL	
29	EFERVECENTE	
30	TABLETA	
31	TABLETA	
32	SUPOSITORIO	
33	UNIDAD	
5	SOBRE	
\.


--
-- TOC entry 4910 (class 0 OID 57917)
-- Dependencies: 218
-- Data for Name: productos_cantidades; Type: TABLE DATA; Schema: public; Owner: ownerfarmacia
--

COPY public.productos_cantidades (id, cantidad, fecha_compra, fecha_vencimiento, costo, id_product, ubicacion_id) FROM stdin;
106	260	2025-04-01	2028-08-01	0.2100	110	210
107	4	2025-04-01	2027-06-01	8.0900	111	210
108	1	2025-03-01	2028-02-01	25.3500	112	210
109	1	2024-05-01	2025-11-01	25.3500	113	210
110	19	2025-02-01	2027-03-01	8.3500	114	210
111	160	2025-04-01	2026-04-01	0.6000	115	210
112	120	2025-04-01	2027-10-01	0.6630	116	210
113	50	2024-12-01	2025-11-01	0.3330	117	210
114	12	2025-04-01	2027-08-01	4.1800	118	210
115	30	2025-01-01	2027-05-01	0.3300	119	210
116	90	2025-03-01	2027-08-01	0.4500	120	210
117	2	2024-08-01	2026-03-01	10.5100	121	210
118	60	2025-01-01	2028-07-01	1.0260	122	210
4	3	2025-04-01	2026-12-01	6.8500	1	210
5	610	2025-04-01	2026-03-01	0.1420	2	210
6	1	2023-11-01	2025-10-01	19.9500	3	210
7	110	2025-04-01	2025-09-01	0.0800	4	210
8	10	2024-12-01	2027-11-01	1.6500	5	210
9	3	2025-04-01	2025-10-01	3.2500	6	210
10	20	2025-04-01	2026-05-01	1.2000	7	210
11	2	2025-03-01	2026-12-01	9.9000	8	210
12	3	2025-01-01	2026-05-01	4.5500	9	210
13	170	2025-04-01	2026-10-01	0.3000	10	210
14	220	2024-01-01	2025-10-01	0.2230	11	210
15	290	2025-02-01	2027-03-01	0.1620	12	210
16	1	2025-01-01	2027-03-01	51.9500	13	210
17	220	2025-04-01	2026-06-01	0.2900	14	210
18	100	2025-01-01	2027-05-01	0.4630	15	210
19	1	2025-03-01	2027-10-01	16.6000	16	210
20	0	2025-02-01	2026-06-01	2.9950	18	210
21	3	2025-04-01	2027-03-01	12.0000	19	210
22	4	2025-04-01	2027-04-01	14.6500	20	210
23	12	2025-04-01	2027-03-01	8.0400	21	210
24	3	2025-04-01	2026-10-01	10.8000	22	210
25	8	2025-04-01	2026-06-01	4.4000	23	210
26	140	2025-02-01	2028-06-01	0.3560	24	210
27	150	2025-04-01	2028-07-01	0.5000	25	210
28	110	2025-02-01	2027-05-01	0.2600	26	210
29	110	2025-04-01	2026-12-01	0.4590	29	210
30	20	2024-12-01	2026-08-01	0.6950	30	210
31	4	2025-02-01	2027-05-01	17.5500	31	210
32	70	2025-03-01	2025-12-01	0.8310	32	210
33	0	2025-04-01	2027-05-01	9.7500	33	210
34	2	2025-03-01	2027-01-01	8.7500	34	210
35	65	2025-04-01	2027-10-01	5.4400	35	210
36	150	2025-03-01	2027-04-01	0.0800	36	210
37	1	2025-01-01	2026-06-01	22.9500	37	210
38	1	2023-03-01	2026-02-01	23.8500	38	210
39	3	2025-01-01	2027-08-01	13.4500	39	210
40	44	2025-03-01	2026-03-01	5.6200	40	210
41	130	2024-11-01	2027-03-01	0.2780	41	210
42	260	2025-04-01	2027-07-01	0.2200	42	210
43	4	2024-10-01	2027-06-01	22.9500	43	210
44	70	2025-04-01	2027-06-01	0.4000	44	210
45	1540	2025-03-01	2028-01-01	0.0220	45	210
46	4	2025-04-01	2027-05-01	9.8500	46	210
47	80	2024-09-01	2026-06-01	0.2880	47	210
48	130	2025-04-01	2026-09-01	0.4400	48	210
49	1050	2025-03-01	2027-03-01	0.0430	49	210
50	100	2024-03-01	2028-04-01	0.1260	51	210
51	50	2025-02-01	2027-05-01	0.8350	52	210
52	12	2025-03-01	2027-06-01	1.7500	53	210
53	70	2025-03-01	2026-12-01	0.6500	54	210
54	20	2024-09-01	2026-09-01	0.6750	55	210
55	36	2024-11-01	2026-09-01	0.3370	56	210
56	8	2025-04-01	2027-05-01	10.6800	57	210
57	520	2024-09-01	2025-08-01	0.1250	58	210
58	300	2024-12-01	2026-04-01	0.2500	59	210
59	300	2025-04-01	2026-10-01	0.2180	60	210
60	40	2025-04-01	2027-11-01	0.8030	61	210
61	90	2025-04-01	2027-08-01	0.7920	62	210
62	20	2024-01-01	2026-01-01	1.1460	63	210
63	1	2024-02-01	2027-09-01	12.1500	64	210
64	110	2025-02-01	2027-09-01	1.1500	66	210
65	9	2024-12-01	2027-02-01	10.8570	67	210
66	20	2024-12-01	2026-09-01	5.0000	68	210
67	2	2025-02-01	2026-09-01	18.9500	69	210
68	4	2025-03-01	2027-08-01	11.6500	70	210
69	1	2024-10-01	2025-11-01	59.9500	71	210
70	5	2025-01-01	2027-05-01	3.2500	72	210
71	120	2025-04-01	2027-06-01	0.8650	73	210
72	1060	2025-03-01	2027-05-01	0.1700	74	210
73	100	2025-02-01	2027-11-01	0.5890	75	210
74	2	2025-04-01	2027-06-01	13.9500	76	210
75	90	2024-10-01	2027-02-01	0.5860	77	210
76	270	2025-03-01	2027-02-01	0.1120	78	210
77	10	2025-01-01	2025-10-01	1.8800	79	210
78	4	2025-04-01	2027-09-01	10.6500	80	210
79	20	2025-02-01	2026-04-01	5.3400	81	210
80	1	2025-03-01	2026-02-01	44.9500	82	210
81	8	2025-04-01	2028-05-01	8.1000	83	210
82	110	2025-01-01	2027-04-01	0.2500	84	210
83	130	2025-02-01	2027-07-01	0.1790	85	210
84	200	2025-04-01	2026-12-01	0.2230	86	210
85	180	2025-04-01	2026-10-01	0.3400	87	210
86	10	2025-02-01	2027-05-01	0.0470	88	210
87	1440	2027-04-01	2026-04-01	0.0780	89	210
88	200	2025-04-01	2027-04-01	0.9920	90	210
89	40	2025-02-01	2026-05-01	3.8330	91	210
90	30	2025-03-01	2027-01-01	2.4980	92	210
91	20	2025-03-01	2027-01-01	2.6650	93	210
92	47	2025-01-01	2029-06-01	0.6000	95	210
93	21	2025-04-01	2028-09-01	0.3600	97	210
94	114	2024-11-01	2029-08-01	0.3400	98	210
95	80	2024-11-01	2028-08-01	0.4000	99	210
96	93	2025-03-01	2026-09-01	0.3550	100	210
97	1	2025-04-01	2026-10-01	4.6500	101	210
98	550	2024-08-01	2025-10-01	0.0970	102	210
99	600	2024-08-01	2026-11-01	0.0840	103	210
100	1	2025-04-01	2027-07-01	13.7500	104	210
101	1	2023-11-01	2026-07-01	15.9500	105	210
102	190	2025-03-01	2027-06-01	0.4160	106	210
103	36	2025-04-01	2025-10-01	0.5700	107	210
104	30	2025-03-01	2026-03-01	1.2800	108	210
105	180	2025-02-01	2027-03-01	0.0780	109	210
119	70	2025-03-01	2027-04-01	0.8000	123	210
120	2	2024-07-01	2027-09-01	18.2500	124	210
121	650	2025-03-01	2027-03-01	0.0890	125	210
122	2	2025-03-01	2027-10-01	9.9500	126	210
123	1	2024-12-01	2027-09-01	10.9500	127	210
124	2	2025-03-01	2027-05-01	8.9500	128	210
125	3	2025-03-01	2027-03-01	25.9500	129	210
126	12	2025-04-01	2026-08-01	17.8500	130	210
127	140	2025-04-01	2027-04-01	0.2100	131	210
128	2	2024-01-01	2025-09-01	29.9500	132	210
129	1	2025-04-01	2027-01-01	30.6500	133	210
130	320	2025-04-01	2027-05-01	0.1880	134	210
131	1	2024-02-01	2026-04-01	6.0950	135	210
132	80	2025-04-01	2027-08-01	1.3140	136	210
133	20	2024-12-01	2026-08-01	1.1830	137	210
134	2	2025-04-01	2027-10-01	14.9000	138	210
135	4	2024-08-01	2027-11-01	14.1500	139	210
136	1	2024-09-01	2028-05-01	11.7500	140	210
137	1	2024-09-01	2027-02-01	20.9500	141	210
138	1	2024-09-01	2026-10-01	16.1000	142	210
139	720	2025-04-01	2027-10-01	0.0880	143	210
140	18	2025-03-01	2027-11-01	0.3300	144	210
141	2	2023-09-01	2025-04-01	13.4000	145	210
142	4	2025-02-01	2026-06-01	3.5400	146	210
143	3	2024-07-01	2026-08-01	4.4300	147	210
144	3	2024-06-01	2026-07-01	11.0000	148	210
145	4	2025-02-01	2029-02-01	13.2000	149	210
146	1430	2025-03-01	2026-10-01	0.0570	150	210
147	12	2025-04-01	2027-11-01	4.9200	151	210
156	2	2025-02-01	2027-08-01	19.9400	161	210
148	2140	2024-07-01	2026-01-01	0.0470	152	210
149	1	2024-08-01	2027-01-01	11.2500	153	210
164	200	2024-12-01	2026-07-01	0.1200	170	210
150	100	2025-03-01	2027-07-01	0.1620	155	210
151	2	2023-04-01	2025-09-01	1.4400	156	210
152	60	2025-03-01	2026-06-01	2.6720	157	210
153	70	2025-04-01	2027-03-01	0.3040	158	210
154	6	2025-02-01	2027-07-01	21.9500	159	210
155	7	2024-09-01	2026-09-01	8.2980	160	210
157	2	2024-07-01	2025-11-01	33.3000	162	210
158	102	2025-04-01	2026-06-01	1.4050	163	210
159	114	2025-03-01	2026-06-01	1.4050	165	210
160	24	2024-11-01	2026-02-01	3.0470	166	210
161	12	2025-03-01	2026-04-01	3.1300	167	210
165	90	2024-08-01	2026-06-01	0.3340	171	210
166	60	2025-01-01	2027-08-01	0.3950	172	210
167	50	2024-03-01	2025-06-01	0.2500	173	210
168	1	2025-01-01	2027-07-01	41.0500	174	210
169	2	2025-04-01	2027-02-01	20.9500	175	210
162	7	2025-04-01	2027-07-01	4.3000	168	210
163	40	2023-04-01	2026-06-01	1.5380	169	210
170	4	2024-01-01	2027-12-01	18.0000	176	210
171	2	2025-04-01	2028-12-01	18.3000	177	210
172	1	2024-05-01	2027-07-01	25.3000	178	210
173	41	2025-02-01	2027-12-01	0.5600	179	210
174	396	2024-10-01	2028-01-01	0.3250	180	210
175	1	2025-01-01	2028-11-01	50.3000	181	210
176	1	2025-04-01	2028-12-01	50.3000	182	210
177	1	2025-04-01	2027-12-01	20.3000	183	210
178	88	2025-04-01	2027-06-01	0.8120	184	210
179	6	2025-04-01	2025-11-01	13.0000	185	210
180	5	2025-01-01	2029-06-01	37.3000	186	210
181	96	2025-04-01	2027-11-01	0.2000	187	210
182	6	2025-03-01	2026-09-01	7.0000	188	210
183	3	2025-03-01	2027-01-01	12.3000	189	210
184	396	2025-04-01	2028-12-01	0.0360	190	210
185	90	2025-01-01	2027-12-01	0.2500	191	210
186	1	2024-12-01	2027-03-01	38.3000	192	210
187	2	2025-03-01	2029-05-01	15.0000	193	210
188	4	2025-03-01	2026-12-01	32.3000	194	210
189	4	2025-01-01	2026-02-01	11.3000	195	210
190	1	2025-03-01	2027-12-01	30.3000	196	210
191	1	2025-02-01	2027-12-01	30.3000	197	210
192	1	2025-04-01	2027-12-01	30.3000	198	210
193	1	2024-11-01	2027-12-01	30.0000	199	210
194	1	2025-04-01	2027-12-01	65.0000	200	210
195	8	2024-05-01	2026-12-01	8.6600	201	210
196	470	2025-03-01	2028-01-01	0.1750	202	210
197	0	2024-03-01	2027-12-01	20.3000	203	210
198	1	2024-09-01	2027-03-01	40.3000	204	210
199	1650	2024-12-01	2028-10-01	0.1950	206	210
200	1	2025-04-01	2028-10-01	20.3000	207	210
201	356	2024-09-01	2028-12-01	0.1500	208	210
202	1	2025-03-01	2027-09-01	35.0000	209	210
203	10	2025-03-01	2028-12-01	8.5300	210	210
204	28	2024-10-01	2026-03-01	14.3070	212	210
205	1	2024-11-01	2028-10-01	15.3000	213	210
206	5	2025-04-01	2028-10-01	15.3000	214	210
207	3	2025-04-01	2028-10-01	15.3000	215	210
208	1	2024-12-01	2025-12-01	8.3000	216	210
209	1	2025-04-01	2026-12-01	10.3000	217	210
210	1310	2024-07-01	2026-06-01	0.0550	218	210
211	8	2025-03-01	2026-12-01	9.3000	219	210
212	550	2024-08-01	2026-04-01	0.1600	220	210
213	1	2024-05-01	2025-12-01	20.3000	221	210
214	190	2025-04-01	2026-11-01	0.5800	222	210
215	9	2024-12-01	2026-11-01	2.0800	223	210
216	15	2024-12-01	2026-11-01	2.0800	224	210
217	1	2023-02-01	2026-02-01	20.3000	225	210
218	865	2025-04-01	2026-03-01	0.4420	226	210
219	3	2025-04-01	2027-10-01	45.3000	227	210
220	2	2024-07-01	2026-10-01	9.3000	228	210
221	325	2025-04-01	2028-01-01	0.5000	229	210
222	2	2025-02-01	2026-12-01	9.3000	230	210
223	1220	2025-03-01	2025-11-01	0.0600	231	210
224	76	2024-07-01	2026-08-01	0.5500	232	210
225	900	2025-04-01	2028-11-01	0.0550	233	210
226	2	2025-04-01	2026-05-01	16.3000	234	210
227	15	2025-02-01	2027-12-01	7.0000	235	210
228	20	2025-02-01	2026-02-01	10.5500	236	210
229	28	2024-01-01	2027-04-01	1.1800	237	210
230	3	2025-04-01	2026-12-01	24.3000	238	210
231	1	2024-08-01	2027-12-01	25.3000	239	210
232	7	2024-09-01	2026-12-01	3.0000	240	210
233	224	2025-02-01	2027-08-01	0.4680	241	210
234	3	2025-03-01	2026-04-01	20.3000	242	210
235	3	2025-03-01	2027-01-01	22.0000	243	210
236	4	2025-03-01	2026-08-01	25.4500	244	210
237	6000	2024-09-01	2027-04-01	0.0030	245	210
238	1	2024-09-01	2027-12-01	50.0000	246	210
239	0	2024-12-01	2025-12-01	0.5830	247	210
240	1	2024-03-01	2028-06-01	15.0000	248	210
241	624	2025-03-01	2026-02-01	0.0510	250	210
242	11	2025-03-01	1930-10-01	5.3000	251	210
243	3	2025-02-01	2026-07-01	11.3200	252	210
244	3	2025-02-01	2026-07-01	11.5400	253	210
245	4	2024-09-01	2026-01-01	11.5800	254	210
246	4	2024-10-01	2026-01-01	11.5800	255	210
247	3	2024-10-01	2026-01-01	11.5800	256	210
248	4	2025-02-01	2026-06-01	11.4400	257	210
249	3	2024-10-01	2026-04-01	11.5800	258	210
250	5	2025-02-01	2026-07-01	11.3600	259	210
251	11	2024-12-01	2026-10-01	5.3000	261	210
252	540	2024-06-01	2026-11-01	0.0740	262	210
253	50	2025-03-01	2027-09-01	1.1400	263	210
254	3	2025-01-01	2027-12-01	12.3000	264	210
255	1	2024-08-01	2028-12-01	20.3000	265	210
256	110	2023-02-01	2025-07-01	0.3800	266	210
257	14	2024-02-01	2026-06-01	1.0000	267	210
258	0	2024-11-01	2026-06-01	0.6500	268	210
259	1	2025-04-01	1935-12-01	5.3000	269	210
260	12	2024-12-01	2027-09-01	3.8000	270	210
261	1	2024-07-01	2026-01-01	26.0000	271	210
262	6	2025-04-01	2026-07-01	1.6600	272	210
263	1220	2024-12-01	2025-12-01	0.0800	273	210
264	1430	2024-12-01	2027-07-01	0.0200	274	210
265	1	2025-04-01	2027-04-01	40.0000	275	210
266	2	2025-03-01	2026-07-01	45.3000	276	210
267	19	2024-07-01	2026-10-01	2.5000	277	210
268	536	2025-04-01	2027-10-01	0.0620	278	210
269	31	2025-04-01	2027-06-01	2.0600	279	210
270	664	2025-04-01	2025-12-01	0.2320	280	210
271	13	2025-04-01	2027-10-01	4.0000	281	210
272	1	2023-11-01	2025-12-01	30.0000	282	210
273	10	2025-01-01	2025-06-01	2.5000	283	210
274	44	2025-01-01	2026-12-01	0.8000	284	210
275	36	2025-04-01	2026-04-01	1.6700	285	210
276	13	2025-04-01	2028-12-01	1.6600	286	210
277	59	2025-03-01	2027-12-01	1.3300	287	210
278	30	2024-10-01	2027-09-01	0.8180	288	210
279	4	2025-03-01	2028-12-01	28.0000	289	210
280	22	2025-04-01	2027-11-01	0.9600	290	210
281	340	2023-03-01	2025-06-01	0.0120	291	210
282	2	2024-03-01	2025-12-01	5.0000	292	210
283	6	2025-01-01	2025-12-01	4.5000	295	210
284	2	2024-01-01	2026-12-01	13.5000	296	210
285	2	2025-03-01	2026-11-01	9.0000	297	210
286	2	2024-10-01	2027-12-01	10.0000	298	210
287	2	2025-03-01	2027-12-01	12.5000	299	210
288	2	2025-03-01	2026-08-01	10.3000	300	210
289	4	2025-02-01	2026-10-01	9.5000	301	210
290	31	2025-03-01	2027-06-01	0.8000	302	210
291	45	2025-03-01	2025-06-01	0.9600	303	210
292	5	2025-01-01	2025-09-01	11.8600	304	210
293	50	2024-08-01	2026-07-01	0.9000	305	210
294	6	2025-03-01	2028-12-01	3.0000	306	210
295	940	2025-04-01	2026-11-01	0.0600	307	210
296	580	2025-01-01	2026-07-01	0.1250	308	210
297	1930	2025-04-01	2026-11-01	0.1750	309	210
298	4	2025-04-01	2026-12-01	10.0000	310	210
299	1	2024-06-01	2026-03-01	42.0000	311	210
300	20	2024-10-01	2025-10-01	5.3330	312	210
301	39	2025-04-01	2029-06-01	2.5000	313	210
302	29	2025-02-01	2028-04-01	3.1200	314	210
303	9	2025-04-01	2026-08-01	2.5300	315	210
304	1	2025-04-01	2027-07-01	12.0000	316	210
305	100	2024-02-01	2025-11-01	0.2000	317	210
306	1	2024-02-01	2030-06-01	35.0000	319	210
307	1	2025-02-01	1931-12-01	35.0000	320	210
308	1	2025-01-01	1931-12-01	35.7200	321	210
309	1	2025-04-01	2030-08-01	35.0000	322	210
310	14	2024-07-01	2025-11-01	0.7500	323	210
311	11	2024-07-01	2026-06-01	0.7500	324	210
312	14	2025-03-01	2026-06-01	0.7500	325	210
313	14	2024-05-01	2026-02-01	0.7000	326	210
314	9	2024-10-01	2026-09-01	0.7500	327	210
315	13	2024-10-01	2026-04-01	0.5000	328	210
316	23	2025-04-01	2026-08-01	0.6000	329	210
317	7	2024-09-01	2026-02-01	0.7600	330	210
318	20	2025-01-01	2026-04-01	0.6000	331	210
319	17	2024-07-01	2026-03-01	0.6000	332	210
320	26	2025-01-01	2026-09-01	0.5000	333	210
321	9	2024-12-01	2026-01-01	0.7500	334	210
322	1	2023-04-01	2025-07-01	25.3000	335	210
323	2	2025-03-01	2027-03-01	15.0000	336	210
324	31	2024-08-01	2026-05-01	0.4000	337	210
325	160	2025-03-01	2026-10-01	0.5500	338	210
326	10	2024-09-01	2027-12-01	2.0000	339	210
327	3	2024-03-01	2025-12-01	5.1000	341	210
328	2	2025-01-01	2027-12-01	25.3000	342	210
329	2	2023-11-01	2026-04-01	30.0000	343	210
330	4	2024-10-01	2028-10-01	9.3000	344	210
331	3	2025-04-01	2025-10-01	9.3000	345	210
332	7600	2024-10-01	2025-09-01	0.0190	346	210
333	1	2025-04-01	2027-12-01	20.3000	347	210
334	204	2025-04-01	2026-03-01	0.4960	349	210
335	12	2025-04-01	2026-07-01	3.1800	350	210
336	1	2024-05-01	2025-11-01	20.3000	351	210
337	178	2025-01-01	2027-09-01	0.4000	352	210
338	4	2024-12-01	2028-09-01	4.7000	353	210
339	4	2025-04-01	2028-03-01	5.0000	354	210
340	1	2023-12-01	2028-12-01	15.0000	355	210
341	1	2025-03-01	2028-12-01	15.0000	356	210
342	80	2025-03-01	2026-11-01	0.4000	357	210
343	1	2023-11-01	2028-12-01	12.0000	358	210
344	2	2025-03-01	2026-04-01	10.3000	359	210
345	3	2025-04-01	2026-10-01	9.3000	360	210
346	17	2025-01-01	2027-01-01	2.1900	361	210
347	31	2025-03-01	2027-02-01	2.1800	362	210
348	19	2025-03-01	2026-01-01	2.1900	363	210
349	362	2025-03-01	2026-06-01	0.2700	364	210
350	2	2024-10-01	2028-09-01	24.0000	365	210
351	5	2025-04-01	2027-02-01	4.6900	366	210
352	210	2024-10-01	2027-12-01	0.4830	367	210
353	105	2025-01-01	2029-04-01	0.2800	368	210
354	74	2024-08-01	2027-12-01	0.2300	371	210
355	32	2024-11-01	2028-03-01	0.3100	372	210
356	108	2024-12-01	2029-05-01	0.3100	373	210
357	2	2025-01-01	2029-09-01	16.7900	379	210
358	2	2025-02-01	2027-01-01	8.6500	380	210
359	19	2024-07-01	2025-05-01	1.2400	381	210
360	30	2025-03-01	2026-01-01	2.2500	382	210
361	22	2024-11-01	2026-11-01	2.3200	383	210
362	20	2025-04-01	2029-12-01	1.8400	386	210
363	61	2025-02-01	2026-05-01	1.0100	387	210
364	10	2025-04-01	2029-04-01	3.9700	388	210
365	1	2025-04-01	2029-09-01	5.4000	389	210
366	5	2022-07-01	2026-07-01	5.6500	390	210
367	3	2025-04-01	2029-06-01	3.7500	391	210
368	4	2025-04-01	2029-06-01	5.6500	392	210
369	3	2025-04-01	2029-07-01	5.4000	393	210
370	7	2024-12-01	2026-10-01	4.0800	394	210
371	1	2025-01-01	2027-04-01	66.6000	395	210
372	1	2024-05-01	2028-02-01	9.3200	396	210
373	1370	2025-04-01	2026-09-01	0.0670	398	210
374	1470	2025-04-01	1900-01-10	0.0000	399	210
375	1250	2025-04-01	2026-09-01	0.0620	400	210
376	2	2024-08-01	2027-05-01	33.9000	401	210
377	4	2025-04-01	2027-07-01	5.7800	402	210
378	30	2025-04-01	2026-07-01	0.9800	403	210
379	92	2024-11-01	2026-04-01	0.5800	404	210
380	1	2025-04-01	2027-01-01	50.4800	405	210
381	2	2024-09-01	2025-10-01	47.5700	406	210
382	64	2025-04-01	2028-02-01	0.2300	407	210
383	5	2025-04-01	2026-09-01	8.4000	408	210
384	8	2025-04-01	2026-09-01	0.5900	409	210
385	1	2023-12-01	2028-06-01	9.7500	410	210
386	2	2024-08-01	2026-04-01	9.1700	411	210
387	1	2024-07-01	2026-04-01	3.9200	412	210
388	20	2025-04-01	2027-10-01	0.1600	413	210
389	7	2024-09-01	2026-10-01	12.2500	414	210
390	1	2025-02-01	2027-05-01	51.1700	416	210
391	66	2025-03-01	2026-05-01	1.9200	417	210
392	16	2025-03-01	2027-02-01	5.0700	418	210
393	2880	2024-12-01	2027-03-01	0.0270	419	210
394	400	2025-04-01	2027-09-01	0.1790	420	210
395	7	2025-04-01	2027-02-01	1.0300	421	210
396	2	2025-02-01	2028-01-01	36.0700	422	210
397	20	2025-04-01	2026-01-01	1.7800	423	210
398	1	2024-09-01	2025-10-01	50.1000	424	210
399	3	2025-01-01	2027-04-01	11.3700	425	210
400	1	2025-01-01	2027-06-01	26.0300	426	210
401	620	2024-10-01	2026-03-01	0.1030	427	210
402	4	2025-03-01	2028-04-01	11.9600	428	210
403	22	2024-01-01	2026-09-01	0.1100	429	210
404	200	2024-01-01	2027-07-01	0.1000	430	210
405	28	2025-02-01	2027-11-01	1.6600	431	210
406	1	2022-12-01	2025-10-01	45.5000	432	210
407	0	2023-10-01	2025-08-01	26.0900	433	210
408	1	2025-04-01	2026-11-01	37.8600	434	210
409	0	2025-01-01	2026-12-01	27.2800	435	210
410	3	2025-02-01	2026-10-01	9.5500	438	210
411	41	2025-04-01	2026-07-01	2.5500	439	210
412	172	2025-02-01	2028-01-01	0.3100	440	210
413	2	2024-11-01	2026-02-01	5.1500	442	210
414	3	2025-02-01	2026-11-01	11.0000	443	210
415	60	2024-12-01	2026-06-01	0.9300	444	210
416	2	2025-01-01	2029-04-01	7.0000	447	210
417	2	2025-04-01	2029-05-01	8.0000	448	210
418	3	2025-04-01	2029-04-01	4.9000	449	210
419	2	2025-04-01	2029-04-01	13.2500	450	210
420	3	2025-03-01	2026-07-01	12.3500	451	210
421	5	2024-11-01	2025-10-01	6.3200	452	210
422	0	2024-11-01	2025-10-01	6.3200	453	210
423	1	2025-04-01	2029-01-01	15.1700	454	210
424	75	2024-10-01	2029-08-01	0.3700	455	210
425	18	2025-03-01	2027-03-01	2.0500	457	210
426	2	2025-03-01	2027-10-01	10.9400	458	210
427	2	2025-04-01	2029-09-01	14.7500	459	210
428	1	2025-04-01	2027-02-01	10.1100	460	210
429	72	2025-04-01	2028-05-01	1.1100	462	210
430	9	2024-01-01	2025-08-01	5.4800	463	210
431	83	2024-01-01	2025-12-01	1.5400	464	210
432	2	2025-04-01	2027-03-01	6.0000	465	210
433	14	2024-04-01	2026-10-01	3.6600	466	210
434	2	2025-04-01	2029-01-01	5.4600	467	210
435	6	2024-11-01	2027-05-01	4.3800	468	210
436	2	2025-02-01	2026-05-01	45.9400	469	210
437	0	2022-04-01	2026-02-01	4.7500	470	210
438	1	2025-03-01	2027-02-01	21.4200	471	210
439	5	2023-09-01	2025-08-01	7.2800	472	210
440	3	2025-04-01	2026-04-01	7.2000	473	210
444	186	2025-04-01	2026-07-01	0.5200	477	210
449	45	2025-01-01	2026-01-01	0.6100	484	210
455	1	2023-11-01	2026-07-01	31.2500	491	210
456	1	2025-02-01	2026-10-01	22.7500	493	210
458	12	2022-09-01	2026-06-01	3.4730	495	210
461	6	2024-06-01	2029-01-01	4.7230	499	210
464	2	2025-04-01	2029-02-01	9.6100	502	210
465	0	2023-08-01	2027-04-01	1.0300	504	210
467	41	2024-11-01	2025-11-01	1.2600	506	210
469	35	2024-09-01	2025-09-01	3.1300	508	210
471	74	2025-04-01	2026-04-01	1.5100	510	210
485	1	2024-11-01	2026-07-01	22.8000	526	210
487	17	2024-08-01	2026-01-01	2.0860	529	210
441	1	2024-05-01	2026-07-01	52.5000	474	210
443	26	2025-01-01	2026-08-01	0.7700	476	210
445	32	2024-12-01	2026-01-01	1.5200	478	210
457	90	2025-04-01	2028-02-01	0.4750	494	210
460	3	2025-02-01	2029-01-01	2.6000	497	210
462	1230	2025-04-01	2029-05-01	0.0600	500	210
463	1	2025-04-01	2028-12-01	13.9100	501	210
466	1	2024-09-01	2026-06-01	11.0400	505	210
468	63	2025-01-01	2026-05-01	1.4700	507	210
477	1	2025-04-01	2026-04-01	11.5000	516	210
480	2	2025-04-01	2026-09-01	9.0000	519	210
481	3	2025-03-01	2026-11-01	11.2500	520	210
482	1	2025-01-01	2026-09-01	41.1100	523	210
488	28	2024-07-01	2025-12-01	3.7300	530	210
489	20	2025-01-01	2026-09-01	1.1800	531	210
490	1	2025-04-01	2028-08-01	28.2500	532	210
442	33	2025-02-01	2026-07-01	2.7300	475	210
446	8	2025-04-01	2027-11-01	9.1000	479	210
451	2	2024-11-01	2026-06-01	20.7500	486	210
452	36	2024-11-01	2026-07-01	1.6900	487	210
470	32	2025-02-01	2025-10-01	3.0200	509	210
474	21	2024-02-01	2025-07-01	0.9000	513	210
478	1940	2024-12-01	2027-01-01	0.1100	517	210
447	130	2025-04-01	2026-12-01	0.3590	481	210
453	2	2024-01-01	2025-11-01	7.2500	489	210
459	480	2025-01-01	2026-06-01	0.4760	496	210
475	50	2025-02-01	2025-11-01	1.2100	514	210
476	2	2025-01-01	2027-11-01	14.2500	515	210
483	2	2025-04-01	2026-10-01	22.9800	524	210
484	5	2025-03-01	2027-12-01	19.8600	164	210
486	3	2024-11-01	2026-07-01	9.8500	528	210
448	6	2025-03-01	2027-02-01	13.5000	482	210
450	20	2025-01-01	2028-12-01	3.3990	485	210
454	4	2025-04-01	2027-10-01	8.4000	490	210
472	42	2024-12-01	2025-11-01	3.2700	511	210
473	30	2025-02-01	2025-10-01	3.3900	512	210
479	2	2024-10-01	2028-07-01	15.5500	518	210
491	14	2024-02-01	2026-07-01	0.3600	533	210
492	3	2025-04-01	2027-03-01	20.4000	534	210
493	2	2025-03-01	2027-10-01	10.0000	535	210
494	5	2025-03-01	2027-10-01	8.0000	536	210
495	60	2025-04-01	2028-04-01	1.0180	537	210
496	120	2025-04-01	2027-11-01	0.6020	538	210
497	3	2025-04-01	2028-07-01	5.1500	539	210
498	3	2025-03-01	2027-05-01	6.6000	540	210
499	200	2025-01-01	2027-04-01	0.1120	541	210
500	13	2024-06-01	2025-06-01	1.2000	542	210
501	15	2025-04-01	2027-01-01	1.1000	543	210
502	5	2025-03-01	2027-05-01	4.6500	544	210
503	11	2025-04-01	2027-02-01	1.5000	545	210
504	16	2025-04-01	2029-08-01	5.8000	546	210
505	1	2025-04-01	2028-04-01	38.6000	547	210
506	2	2024-12-01	2026-04-01	35.1000	548	210
507	2	2024-11-01	2026-07-01	43.1500	549	210
508	6	2025-04-01	2028-07-01	8.6000	550	210
509	5	2025-01-01	2027-11-01	11.5000	551	210
510	12	2025-04-01	2027-10-01	3.4400	552	210
511	5	2025-01-01	2026-03-01	2.5100	554	210
512	40	2025-04-01	2026-08-01	2.7280	555	210
513	8	2025-04-01	2026-04-01	6.6500	556	210
514	5	2025-04-01	2028-07-01	15.8000	557	210
515	7	2025-04-01	2026-11-01	4.5000	558	210
516	3	2025-02-01	2027-06-01	13.0500	559	210
517	2	2024-05-01	2028-09-01	19.9000	560	210
518	1	2024-05-01	2025-08-01	35.3000	561	210
519	3	2024-11-01	2026-01-01	0.8400	562	210
520	570	2025-03-01	2027-05-01	0.1560	563	210
521	3	2025-03-01	2026-05-01	35.0000	564	210
522	84	2025-02-01	2026-04-01	1.2600	565	210
523	3	2025-04-01	2027-06-01	7.8000	566	210
524	5	2023-08-01	2028-04-01	12.5500	567	210
525	40	2024-11-01	2026-10-01	0.8670	568	210
526	2	2025-04-01	2027-09-01	32.4000	569	210
527	2	2024-08-01	2026-08-01	40.0500	570	210
528	2	2025-04-01	2027-06-01	19.1000	571	210
529	60	2025-03-01	2028-04-01	1.8900	572	210
530	130	2025-04-01	2027-04-01	0.2640	573	210
531	37	2025-02-01	2026-05-01	1.5300	574	210
532	384	2025-01-01	2025-07-01	0.2300	575	210
533	5	2025-04-01	2027-05-01	18.7500	576	210
534	4	2025-02-01	2026-07-01	15.7000	577	210
535	4	2025-02-01	2026-08-01	13.7000	578	210
536	4	2025-04-01	2026-05-01	8.8000	579	210
537	3	2024-04-01	2027-11-01	1.8900	580	210
538	180	2025-04-01	2028-08-01	0.0950	581	210
539	5	2025-04-01	2028-08-01	6.0500	582	210
540	6018	2025-04-01	2027-04-01	0.0040	583	210
541	4	2025-04-01	2028-09-01	5.6500	584	210
542	3	2025-04-01	2025-11-01	3.6000	585	210
543	2	2025-04-01	2026-12-01	11.7000	586	210
544	2	2025-04-01	2027-05-01	9.5000	587	210
545	100	2025-03-01	2026-11-01	0.9200	590	210
546	120	2025-03-01	2028-02-01	0.5850	591	210
547	8	2024-02-01	2026-07-01	6.0900	592	210
548	2	2024-11-01	2027-03-01	1.3500	595	210
549	1	2025-04-01	2027-07-01	34.0500	596	210
550	2	2025-02-01	2027-10-01	24.0000	597	210
551	530	2024-09-01	2026-11-01	0.0480	598	210
552	2	2025-04-01	2027-09-01	14.3000	599	210
553	10	2025-04-01	2027-08-01	1.9200	600	210
554	4	2025-04-01	2027-06-01	11.4000	601	210
555	3	2024-09-01	2027-05-01	6.7000	603	210
556	3	2025-01-01	2027-01-01	4.8000	604	210
557	3	2025-04-01	2027-06-01	11.9000	605	210
558	19	2025-04-01	2026-05-01	0.7500	606	210
559	250	2025-03-01	2025-10-01	0.1260	607	210
560	20	2025-03-01	2027-03-01	1.1200	608	210
561	120	2025-04-01	2027-06-01	0.6520	609	210
562	1	2025-02-01	2027-06-01	21.1500	610	210
563	16	2025-04-01	2026-01-01	2.4000	611	210
564	220	2025-02-01	2026-07-01	0.1760	612	210
565	2	2025-03-01	2028-01-01	14.1500	613	210
566	4	2025-02-01	2027-08-01	24.5500	614	210
567	6	2025-04-01	2027-11-01	4.2100	615	210
568	640	2025-03-01	2028-06-01	0.0500	616	210
569	3	2025-01-01	2027-09-01	10.6000	617	210
570	1	2025-04-01	2026-11-01	12.9000	618	210
571	11	2025-04-01	2026-05-01	1.8000	619	210
572	1	2024-08-01	2026-06-01	45.6000	620	210
573	3	2025-03-01	2027-07-01	3.5500	621	210
574	3	2025-03-01	2026-08-01	2.4000	622	210
575	7	2025-04-01	2026-11-01	8.7000	623	210
576	3	2025-02-01	2028-03-01	4.4500	624	210
577	520	2025-04-01	2026-11-01	0.0690	625	210
578	10	2024-03-01	2025-11-01	1.8000	626	210
579	4	2023-11-01	2026-01-01	2.2400	627	210
580	80	2025-03-01	2027-03-01	0.0840	628	210
581	190	2025-04-01	2029-10-01	0.2240	629	210
582	8	2025-01-01	2026-03-01	1.2000	630	210
583	140	2025-03-01	2027-10-01	0.0960	631	210
584	60	2025-02-01	2026-07-01	0.3360	632	210
585	3	2025-04-01	2026-12-01	14.4000	634	210
586	2	2025-04-01	2027-10-01	8.1500	635	210
587	2	2025-01-01	2027-09-01	12.0000	636	210
588	4	2024-11-01	2027-06-01	9.5300	637	210
589	4	2025-03-01	2028-07-01	7.5000	638	210
590	600	2025-03-01	2027-06-01	0.1040	639	210
591	40	2025-02-01	2028-06-01	1.7240	640	210
592	30	2024-10-01	2026-07-01	1.8000	641	210
593	2	2024-06-01	2025-09-01	24.0000	642	210
594	10	2025-03-01	2025-10-01	6.7500	643	210
595	3	2025-03-01	2027-06-01	17.5500	644	210
596	3150	2025-04-01	2026-08-01	0.0380	645	210
597	4	2024-12-01	2026-10-01	12.9600	646	210
598	6	2025-01-01	2026-06-01	1.0800	647	210
599	13	2025-02-01	2026-08-01	1.0800	648	210
600	480	2025-04-01	2028-02-01	0.1500	649	210
601	20	2024-12-01	2026-03-01	0.3000	650	210
602	140	2024-12-01	2025-07-01	0.1440	651	210
603	3	2025-04-01	2027-03-01	3.2000	653	210
604	3	2025-04-01	2027-06-01	6.0000	654	210
605	6	2025-04-01	2027-01-01	2.4000	655	210
606	8	2024-12-01	2026-06-01	2.7600	656	210
607	90	2025-04-01	2029-10-01	0.3370	657	210
608	1	2024-04-01	2026-01-01	9.2000	658	210
609	130	2025-04-01	2027-06-01	0.5840	659	210
610	60	2025-04-01	2028-09-01	0.4770	660	210
611	8	2025-03-01	2027-01-01	3.9700	661	210
612	2	2024-12-01	2026-05-01	23.3000	662	210
613	6	2025-03-01	2027-06-01	7.4000	663	210
614	100	2025-03-01	2027-08-01	0.2660	664	210
615	2	2025-03-01	2026-12-01	14.4000	665	210
616	2	2025-01-01	2026-09-01	15.0000	666	210
617	2	2025-01-01	2027-06-01	6.5000	667	210
618	5	2025-04-01	2026-08-01	16.8000	669	210
619	5	2024-11-01	2026-07-01	4.8000	670	210
620	5	2025-04-01	2027-02-01	6.8400	671	210
621	4	2025-04-01	2027-06-01	9.1000	672	210
622	40	2025-04-01	2026-11-01	0.5700	673	210
623	40	2025-04-01	2027-06-01	2.9570	674	210
624	100	2025-04-01	2027-07-01	0.8420	675	210
625	240	2025-04-01	2027-07-01	0.1080	676	210
626	12	2025-04-01	2027-07-01	1.5600	677	210
627	140	2025-03-01	2028-04-01	0.2560	678	210
628	20	2025-03-01	2027-06-01	5.7400	679	210
629	130	2025-03-01	2026-09-01	0.1200	681	210
630	3	2025-04-01	2026-09-01	29.0000	682	210
631	1	2025-04-01	2026-11-01	13.6000	683	210
632	1	2025-02-01	2027-09-01	13.6000	684	210
633	1	2025-03-01	2026-11-01	13.6000	685	210
634	1	2025-02-01	2027-04-01	13.6000	686	210
635	2	2025-04-01	2026-11-01	9.4500	687	210
636	1	2025-03-01	2026-09-01	9.4500	688	210
637	1	2025-03-01	2027-01-01	9.4500	689	210
638	2	2025-03-01	2027-04-01	9.4500	690	210
639	1	2025-03-01	2026-09-01	17.4500	691	210
640	1	2025-03-01	2026-09-01	17.4500	692	210
641	1	2025-04-01	2026-09-01	17.4500	693	210
642	1	2025-04-01	2026-09-01	17.4500	694	210
643	15	2025-03-01	2025-12-01	2.0000	695	210
644	2	2025-04-01	2027-05-01	5.7500	696	210
645	4	2025-03-01	2027-05-01	5.3000	697	210
646	2	2025-01-01	2027-06-01	12.4000	698	210
647	940	2025-04-01	2027-01-01	0.0400	699	210
648	2	2024-12-01	2027-02-01	18.0000	700	210
649	1	2024-08-01	2026-01-01	12.3000	701	210
650	6	2025-03-01	2027-06-01	2.4600	702	210
651	2	2024-12-01	2025-10-01	0.3600	703	210
652	22	2025-01-01	2026-03-01	4.2850	704	210
653	170	2024-03-01	2026-05-01	0.3120	705	210
654	208	2025-03-01	2028-01-01	0.0780	706	210
655	4	2025-04-01	2026-12-01	21.0000	707	210
656	150	2025-04-01	2027-08-01	0.6600	708	210
657	1	2025-03-01	2026-11-01	14.8000	709	210
658	4	2025-02-01	2026-10-01	11.6000	710	210
659	4	2025-04-01	2027-11-01	16.8000	711	210
660	8	2025-04-01	2028-08-01	9.8500	712	210
661	2	2025-01-01	2026-11-01	25.9500	713	210
662	2	2025-02-01	2025-08-01	18.0000	715	210
663	2	2025-04-01	2029-02-01	3.9000	716	210
664	5	2025-04-01	2027-01-01	9.7000	717	210
665	6	2025-04-01	2027-03-01	4.4500	718	210
666	11	2025-03-01	2027-03-01	5.4000	719	210
667	50	2024-10-01	2026-03-01	1.2600	720	210
668	380	2025-02-01	2026-02-01	0.0760	721	210
\.


--
-- TOC entry 4908 (class 0 OID 57908)
-- Dependencies: 216
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: ownerfarmacia
--

COPY public.products (id, nombre, forma_farmaceutica, descripcion_uso, imagen, costo, pp, presentacion, principio_activo, existencias, controlado, proveedor, ganancia, tipo, dosificacion, accion_farmacologica) FROM stdin;
2	ACETAMINOFEN  500 MG BLISTR X 10 CAJA X 100	Tableta	Analgésico y antipirético	Image-not-found.png	0.1420	0.0000	{"BLISTER": [10, 2.5], "CAJA": [100, 25.0]}	Acetaminofen	610	f	2	0.4300	normal	500 mg	Alivio del dolor y reducción de la fiebre
11	AMLODIPINA 10 MG BLISTER X 10 CAJA X 100	Tableta	Tratamiento de la hipertensión arterial y la angina de pecho	Image-not-found.png	0.2230	0.0000	{"BLISTER": [10, 5.0], "CAJA": [100, 50.0]}	Amlodipina	220	f	2	0.5500	normal	10 mg	Inhibidor de los canales de calcio
3	ACICLOVIR 400 MG/5ML  FCO 100 ML CAPLIN	Suspensión oral	Tratamiento de infecciones causadas por el virus del herpes simple y herpes zóster	Image-not-found.png	19.9500	0.0000	{"FRASCO": [1, 38.0]}	Aciclovir	1	f	2	0.4800	normal	400 mg/5ml	Antiviral
4	ACIDO ACETILSALICILICO 100 MG BLISTER X 10 CAJA X 100	Tableta	Analgésico, antiinflamatorio y antipirético	Image-not-found.png	0.0800	0.0000	{"BLISTER": [10, 2.5], "CAJA": [100, 25.0]}	Ácido Acetilsalicílico	110	f	2	0.6800	normal	100 mg	Inhibidor de la síntesis de prostaglandinas
5	ACIDO BORICO POLVO 1 ONZ BOLSA X 8	Polvo	Antiséptico y desinfectante	Image-not-found.png	1.6500	0.0000	{"CAJA": [8, 40.0], "BOLSA": [1, 5.0]}	Ácido bórico	10	f	2	0.6700	normal	Según indicación médica	Antiséptico y desinfectante
7	ALBENDAZOL CAJA X 2 TAB CAPLIN Y ARGUS	Tabletas	Antiparasitario para el tratamiento de infecciones causadas por parásitos intestinales	Image-not-found.png	1.2000	0.0000	{"CAJA": [2, 10.0], "TABLETA": [1, 5.0]}	Albendazol	20	f	2	0.7600	normal	400 mg por tableta	Antihelmíntico de amplio espectro
8	ALCOHOL  ELITICO70% 1/2 LITRO VESA	Solución	Desinfectante de uso tópico	Image-not-found.png	9.9000	0.0000	{"BOTE": [1, 17.0]}	Alcohol etílico al 70%	2	f	2	0.4200	normal	Aplicar sobre la piel limpia y seca, sin diluir	Antiséptico y desinfectante
12	AMLODIPINA 5 MG BLISTER X 10 CAJA X 100	Tableta	Tratamiento de la hipertensión arterial y la angina de pecho	Image-not-found.png	0.1620	0.0000	{"BLISTER": [10, 4.0], "CAJA": [100, 40.0]}	Amlodipina	290	f	2	0.6000	normal	5 mg	Antihipertensivo y antianginoso
9	ALCOHOL ALCANFORADO 120 ML SANTE	Solución tópica	Antiséptico y desinfectante de uso externo	Image-not-found.png	4.5500	0.0000	{"BOTE": [1, 8.0]}	Alcohol etílico y alcanfor	3	f	2	0.4300	normal	Aplicar sobre la piel limpia la cantidad necesaria y frotar suavemente	Antiséptico, desinfectante y refrescante
10	ALOPURINOL 300 MG BLISTER X 10 CAJA X 100	Tableta	Tratamiento de la gota y la hiperuricemia	Image-not-found.png	0.3000	0.0000	{"BLISTER": [10, 5.0], "CAJA": [100, 50.0]}	Allopurinol	170	f	2	0.4000	normal	300 mg	Inhibidor de la enzima xantina oxidasa
13	AMOXI+CLAV 400+57MG BID 70 ML (LEVECILIN)	Suspensión oral	Antibiótico utilizado en el tratamiento de infecciones bacterianas	Image-not-found.png	51.9500	0.0000	{"JARABE": [1, 85.0]}	Amoxicilina y Ácido Clavulánico	1	f	2	0.3900	normal	400 mg de amoxicilina y 57 mg de ácido clavulánico cada 12 horas	Inhibe la síntesis de la pared celular bacteriana y protege a la amoxicilina de la degradación por las enzimas bacterianas
16	ANTIGRIPITO INFANIL JBE 60 ML	Jarabe	Tratamiento de los síntomas de la gripe en niños	Image-not-found.png	16.6000	0.0000	{"JARABE": [1, 29.0]}	Paracetamol	1	f	2	0.4300	normal	Según indicación médica	Analgésico y antipirético
14	AMOXICILINA 500 MG BLIST X 10 CAJA X 100 (ARGUS O CAPLIN)	Tableta	Antibiótico utilizado para tratar infecciones bacterianas	Image-not-found.png	0.2900	0.0000	{"BLISTER": [10, 6.0], "CAJA": [100, 60.0]}	Amoxicilina	220	f	2	0.5200	normal	500 mg	Inhibe la síntesis de la pared celular bacteriana
15	AMPICILINA 500 MG BLISTER X 10 CAJA X  100	Tableta	Tratamiento de infecciones causadas por bacterias sensibles a la ampicilina	Image-not-found.png	0.4630	0.0000	{"BLISTER": [10, 10.0], "CAJA": [100, 100.0]}	Ampicilina	100	f	2	0.5400	normal	500 mg	Antibiótico de amplio espectro
18	ATENOLOL 100 MG CAPLIN BLIST X 10 CAJA X 100	Cápsula	Tratamiento de la hipertensión arterial, angina de pecho, arritmias cardiacas y prevención de infartos	Image-not-found.png	2.9950	0.0000	{"BLISTER": [10, 50.0], "CAJA": [100, 500.0]}	Atenolol	0	f	2	0.4000	normal	100 mg	Betabloqueante selectivo
19	AZITROMICINA 200 MGS FCO X 30 ML CAPLIN	Suspensión oral	Antibiótico utilizado para tratar infecciones causadas por bacterias, como infecciones respiratorias, de la piel, de los ojos, entre otras.	Image-not-found.png	12.0000	0.0000	{"FRASCO": [1, 23.0]}	Azitromicina	3	f	2	0.4800	normal	200 mg/5 ml	Inhibe la síntesis de proteínas en las bacterias, lo que impide su crecimiento y reproducción.
20	AZITROMICINA 200 MGS SUSP FCO X 15 ML SELEC	Suspensión	Tratamiento de infecciones bacterianas	Image-not-found.png	14.6500	0.0000	{"FRASCO": [1, 25.0], "SUSPENSION": [1, 25.0]}	Azitromicina	4	f	2	0.4100	normal	200 mg/5 ml	Antibiótico macrólido
17	ATENOLOL 100 MG BLIST X 10 CAJA X 100ARGUS	Tableta	Tratamiento de la hipertensión, angina de pecho y arritmias cardiacas	Image-not-found.png	0.0000	0.0000	{"BLISTER": [10, 5.0], "CAJA": [100, 50.0]}	Atenolol	0	f	2	1.0000	normal	100 mg	Antihipertensivo, antianginoso, antiarrítmico
21	AZITROMICINA 500 MG CAJA X 3 TAB	Tableta	Tratamiento de infecciones bacterianas	Image-not-found.png	8.0400	0.0000	{"CAJA": [3, 54.0], "TABLETA": [1, 18.0]}	Azitromicina	12	f	2	0.5500	normal	500 mg	Antibiótico macrólido
22	BENZOATO DE BENCILO FCO X 120 ML SELEC	Frasco	Antimicótico tópico	Image-not-found.png	10.8000	0.0000	{"FRASCO": [1, 19.0]}	Benzoato de bencilo	3	f	2	0.4300	normal	Aplicar en la zona afectada según indicación médica	Tratamiento de infecciones por hongos en la piel
23	BICARBONATO DE SODIO MEDIA LIBRA DISFAVIL	Tableta efervescente	Alivio de la acidez estomacal y la indigestión	Image-not-found.png	4.4000	0.0000	{"BOLSA": [1, 9.0]}	Bicarbonato de sodio	8	f	2	0.5100	normal	1 tableta disuelta en agua, cada 4 horas según sea necesario	Neutraliza el ácido del estómago y alivia la acidez
30	CETIRIZINA 10 MG CAJA X 10 TAB CAPLIN	Tableta	Alivio de los síntomas de la rinitis alérgica y urticaria	Image-not-found.png	0.6950	0.0000	{"CAJA": [10, 15.0], "TABLETA": [1, 1.5]}	Cetirizina	20	f	2	0.5400	normal	10 mg	Antihistamínico
1	ACEITE DE RECINO 1 ONZ LASANA	Aceite	Laxante	Image-not-found.png	6.8500	0.0000	{"BOTELLA": [1, 12.0]}	Aceite de ricino	3	f	2	0.4300	normal	Según indicación médica	Estimula el peristaltismo intestinal
24	CALCIO + VITAMINA D  BLISTER X 10 CAJA X 100 SELEC	Tableta	Suplemento de calcio y vitamina D para prevenir y tratar la deficiencia de estos nutrientes	Image-not-found.png	0.3560	0.0000	{"BLISTER": [10, 6.0], "CAJA": [100, 60.0]}	Calcio, Vitamina D	140	f	2	0.4100	normal	1 tableta al día	Aumenta la absorción de calcio en el intestino y promueve la mineralización ósea
25	CARBAMAZEPINA 200 MG BLIST X 10 CAJA X 100 SELEC	Tableta	Antiepiléptico y estabilizador del estado de ánimo	Image-not-found.png	0.5000	0.0000	{"BLISTER": [10, 9.0], "CAJA": [100, 90.0]}	Carbamazepina	150	f	2	0.4400	normal	200 mg	Anticonvulsivante
29	CELECOXIB 200 MGS BLIST X 10 CAJA X 100 CAPLIN	Cápsula	Antiinflamatorio no esteroideo indicado para el alivio del dolor y la inflamación en condiciones como la artritis reumatoide, la osteoartritis y la espondilitis anquilosante.	Image-not-found.png	0.4590	0.0000	{"BLISTER": [10, 10.0], "CAJA": [100, 100.0]}	Celecoxib	110	f	2	0.5400	normal	200 mg	Inhibidor selectivo de la ciclooxigenasa-2 (COX-2)
32	CLOPIDROGEL 75 MGS BLIST X 10 CAJA X 100 ABIL CHEMPHARMA	Tableta recubierta	Prevención de eventos trombóticos en pacientes con enfermedad arterial coronaria, cerebrovascular o periférica	Image-not-found.png	0.8310	0.0000	{"BLISTER": [10, 17.0], "CAJA": [100, 170.0]}	Clopidogrel	70	f	2	0.5100	normal	75 mg	Antiagregante plaquetario
35	CLOTRIPLEX LATITA X  12.5 GRS CAJA X 40	Crema	Tratamiento de infecciones vaginales causadas por hongos	Image-not-found.png	5.4400	0.0000	{"FRASCO": [1, 9.0], "CAJA": [40, 360.0]}	Clotrimazol	65	f	2	0.4000	normal	Aplicar una cantidad suficiente de crema en la zona afectada dos veces al día durante 7 días	Antifúngico de amplio espectro
27	CEFIXIMA 100MG/5ML X FCO 60 ML ARGUS O CAPLIN	Suspensión oral	Antibiótico indicado para el tratamiento de infecciones causadas por bacterias sensibles a la cefixima	Image-not-found.png	0.0000	0.0000	{"FRASCO": [1, 37.0]}	Cefixima	0	f	2	1.0000	normal	100mg/5ml	Inhibe la síntesis de la pared celular bacteriana
28	CEFTRIAXONA 1G VIAL PANAL CAJA X 10 ARGUS	Vial	Antibiótico para el tratamiento de infecciones bacterianas	Image-not-found.png	0.0000	0.0000	{"CAJA": [10, 70.0], "VIAL": [1, 7.0]}	Ceftriaxona	0	f	2	1.0000	normal	1g	Inhibe la síntesis de la pared celular bacteriana
26	CARBAMAZEPINA 200 MGS BLIST X 10 CAJA X 100 CAPLIN	Tableta	Antiepiléptico y estabilizador del estado de ánimo	Image-not-found.png	0.2600	0.0000	{"BLISTER": [10, 5.0], "CAJA": [100, 50.0]}	CARBAMAZEPINA	110	f	2	0.4800	normal	200 mg	Anticonvulsivante y estabilizador del estado de ánimo
33	CLOTRIMAZOL 2 % CREMA VAG 20 GRS SELEC	Crema vaginal	Tratamiento de infecciones vaginales por hongos como la candidiasis	Image-not-found.png	9.7500	0.0000	{"CREMA": [1, 17.0]}	Clotrimazol	0	f	2	0.4300	normal	Aplicar una pequeña cantidad de crema en la vagina una vez al día durante 7 días	Antifúngico de amplio espectro que actúa inhibiendo la síntesis del ergosterol en la membrana celular de los hongos, provocando su muerte
31	CIPROFLOXACINA 0.3 % SOL OFTALMICAS  FACO X 5 ML SELEC	Solución Oftálmica	Tratamiento de infecciones oculares causadas por bacterias susceptibles	Image-not-found.png	17.5500	0.0000	{"FRASCO": [1, 30.0]}	Ciprofloxacina	4	f	2	0.4200	normal	0.3%	Antibiótico de amplio espectro
36	COMPLEJO B BLISTER X 10 CAJA X 100 CAPLIN	Cápsulas	Suplemento vitamínico	Image-not-found.png	0.0800	0.0000	{"BLISTER": [10, 2.0], "CAJA": [100, 20.0]}	Complejo B	150	f	2	0.6000	normal	1 cápsula al día	Mejora el metabolismo y la función nerviosa
44	DEXAMETASONA BLIST X 10 CAJA X 100 CAPLIN	Cápsula	Antiinflamatorio y antialérgico	Image-not-found.png	0.4000	0.0000	{"BLISTER": [10, 7.0], "CAJA": [100, 70.0]}	Dexametasona	70	f	2	0.4300	normal	1 cápsula cada 24 horas	Reduce la inflamación y la respuesta inmune del cuerpo
37	COMPLEJO B JARABE CAJA X 10 SOBRES CAPLIN	Jarabe	Suplemento vitamínico	Image-not-found.png	22.9500	0.0000	{"CAJA": [10, 400.0], "JARABE": [1, 40.0], "SOBRE": [1, 40.0]}	Complejo B	1	f	2	0.4300	normal	1 sobre al día	Suplemento vitamínico para el sistema nervioso
38	COQUELUCHE FCO 120 ML	Jarabe	Tratamiento de la tos ferina o coqueluche	Image-not-found.png	23.8500	0.0000	{"FRASCO": [1, 39.0]}	Pertussis Vaccine	1	f	2	0.3900	normal	Según indicación médica	Estimula la producción de anticuerpos contra la bacteria Bordetella pertussis
39	CREMA LASSAR BB COOL 120 GRS	Crema	Crema para el tratamiento de irritaciones de la piel	Image-not-found.png	13.4500	0.0000	{"CREMA": [1, 23.0]}	Óxido de zinc y óxido de magnesio	3	f	2	0.4200	normal	Aplicar una capa delgada sobre la zona afectada 2-3 veces al día	Acción antiinflamatoria y protectora de la piel
40	CUESIIGERMINA CAJA X 10 AMP PHARMAV	Ampollas	Tratamiento de infecciones bacterianas	Image-not-found.png	5.6200	0.0000	{"CAJA": [10, 150.0], "AMPOLLA": [1, 15.0]}	Cuesiigerminal	44	f	2	0.6300	normal	1 ampolla cada 12 horas	Antibiótico de amplio espectro
41	DESLORATADINA 5 MG BLISTER X 10 CAJA X 100 CAPLIN	Tableta	Antihistamínico utilizado para el tratamiento de la rinitis alérgica y la urticaria crónica	Image-not-found.png	0.2780	0.0000	{"BLISTER": [10, 5.0], "CAJA": [100, 50.0]}	Desloratadina	130	f	2	0.4400	normal	5 mg	Antihistamínico no sedante de segunda generación
45	DEXASEL 0.5 MG BLISTR X 20 SELEC (DEXAMETASONA)	Tableta	Antiinflamatorio esteroideo	Image-not-found.png	0.0220	0.0000	{"BLISTER": [20, 0.95]}	Dexametasona	1540	f	2	0.5400	normal	0.5 mg	Antiinflamatorio, inmunosupresor
42	DESLORATADINA 5 MG BLISTER X 20 CAJA X 100 SELEC	Tableta	Antihistamínico utilizado para el tratamiento de la rinitis alérgica y urticaria crónica	Image-not-found.png	0.2200	0.0000	{"BLISTER": [20, 8.0], "CAJA": [100, 40.0]}	Desloratadina	260	f	2	0.4500	normal	5 mg	Antihistamínico no sedante
43	DESLORTADINA JARABE FCO X 60 ML SELEC	Jarabe	Antihistamínico para el alivio de los síntomas de la alergia	Image-not-found.png	22.9500	0.0000	{"FRASCO": [1, 39.0]}	Desloratadina	4	f	2	0.4100	normal	5 ml cada 24 horas	Antihistamínico no sedante
46	DEXTROMETORFANO  JBE 120 ML SELEC	Jarabe	Antitusivo	Image-not-found.png	9.8500	0.0000	{"JARABE": [1, 17.0]}	Dextrometorfano	4	f	2	0.4200	normal	120 ml	Supresor del reflejo de la tos
47	DICLOCIEN 100 MGS CAPS GRANU BLIST X 10 CAJA X 100	Cápsulas	Analgésico y antiinflamatorio no esteroideo	Image-not-found.png	0.2880	0.0000	{"BLISTER": [10, 7.0], "CAJA": [100, 70.0]}	Diclofenaco	80	f	2	0.5900	normal	100 mg	Inhibidor de la síntesis de prostaglandinas
51	DICLOFENACO SOD 50 MG BLIS X 10 CAJA X 100 SELEC	Tableta	Analgésico y antiinflamatorio no esteroideo	Image-not-found.png	0.1260	0.0000	{"BLIS": [10, 2.5], "CAJA": [100, 25.0]}	Diclofenaco Sódico	100	f	2	0.5000	normal	50 mg	Inhibidor de la síntesis de prostaglandinas
48	DICLOCIEN 100 MGS GEL CAPS BLIST X 10 CAJA X 100	Cápsulas de gel	Analgésico y antiinflamatorio	Image-not-found.png	0.4400	0.0000	{"BLISTER": [10, 9.0], "CAJA": [100, 90.0]}	Diclofenaco	130	f	2	0.5100	normal	100 mg	Inhibidor de la síntesis de prostaglandinas
49	DICLOFENACO 100 MGS SOD GEL CAPS BLIST X 10 CAJA X 100 AR	Cápsulas de gel	Alivio del dolor y la inflamación en condiciones como artritis, gota, dolor de espalda, entre otros	Image-not-found.png	0.0430	0.0000	{"BLISTER": [10, 0.8], "CAJA": [100, 8.0]}	Diclofenaco	1050	f	2	0.4600	normal	100 mg	Antiinflamatorio no esteroideo (AINE)
56	DOLODENT SANTE 18 ML CAJA X 12 UNIDADES	Solución bucal	Analgésico y antiinflamatorio para el alivio del dolor de dientes y encías	Image-not-found.png	0.3370	0.0000	{"CAJA": [12, 7.0]}	Clorhidrato de benzidamina	36	f	2	0.4200	normal	Aplicar 3 a 4 veces al día sobre la zona afectada	Analgésico y antiinflamatorio
50	DICLOFENACO POT 50 MG BLIST X 10 CAJA X 100 ARGUS	Tableta	Alivio del dolor y la inflamación en condiciones como artritis, dolor muscular, dolor de espalda, dolor de cabeza, entre otros	Image-not-found.png	0.0000	0.0000	{"BLISTER": [10, 2.5], "CAJA": [100, 25.0]}	Diclofenaco potásico	0	f	2	1.0000	normal	50 mg	Antiinflamatorio no esteroideo (AINE)
52	DICLOXACILINA 500 MG BLISTER X 10 CAPLIN CAJA X 100	Cápsula	Antibiótico utilizado para tratar infecciones causadas por bacterias sensibles a la dicloxacilina	Image-not-found.png	0.8350	0.0000	{"BLISTER": [10, 17.0], "CAJA": [100, 170.0]}	Dicloxacilina	50	f	2	0.5100	normal	500 mg	Inhibe la síntesis de la pared celular bacteriana
53	DIPIRONA AMPOLLA 2 ML CAPLIN	Ampolla	Analgésico y antipirético	Image-not-found.png	1.7500	0.0000	{"AMPOLLA": [1, 3.0]}	Dipirona	12	f	2	0.4200	normal	2 ml	Analgésico y antipirético
54	DOLFIX 100 MGS CAPS GRANU BLIST X 10 CAJA X 100	Cápsulas	Analgésico y antipirético	Image-not-found.png	0.6500	0.0000	{"BLISTER": [10, 12.0], "CAJA": [100, 120.0]}	Paracetamol	70	f	2	0.4600	normal	100 mg	Analgésica y antipirética
55	DOLFIX 100 MGS GEL CAPS BLIST X 10 CAJA X 20	Cápsulas de gel	Analgésico y antipirético	Image-not-found.png	0.6750	0.0000	{"BLISTER": [10, 13.0], "CAJA": [20, 26.0]}	Ibuprofeno	20	f	2	0.4800	normal	100 mg	Antiinflamatorio no esteroideo
57	DOLO-NERVISEL  KIT	Tabletas y cápsulas	Alivio del dolor y la inflamación	Image-not-found.png	10.6800	0.0000	{"KIT": [1, 19.0]}	Ibuprofeno, Paracetamol, Vitamina B1, Vitamina B6, Vitamina B12	8	f	2	0.4400	normal	Según indicación médica	Analgésico, antiinflamatorio, neuroprotector
58	DROPADEX 25 MGS GEL CAPS BLIST X 10 CAJA X 50	Gel Caps	Tratamiento de la ansiedad y el insomnio	Image-not-found.png	0.1250	0.0000	{"BLISTER": [10, 4.0], "CAJA": [50, 20.0]}	Diazepam	520	f	2	0.6900	normal	25 mgs	Ansiolítico y sedante
67	ESOMEPRAZOL 40 MGS BLIST X CAJA X 30 CAPLIN	Cápsulas	Tratamiento de úlceras gástricas, duodenales, esofagitis por reflujo gastroesofágico, síndrome de Zollinger-Ellison, entre otras condiciones relacionadas con la acidez estomacal.	Image-not-found.png	10.8570	0.0000	{"CAJA": [30, 600.0], "BLISTER": [1, 20.0]}	Esomeprazol	9	f	2	0.4600	normal	40 mg	Inhibidor de la bomba de protones, reduce la producción de ácido en el estómago y ayuda a aliviar los síntomas relacionados con el exceso de acidez.
65	ERMAVIGOR PLUS X 10 AMP BEBIBLE PHENIEL	Ampolleta bebible	Suplemento vitamínico y mineral para el tratamiento de la fatiga y debilidad	Image-not-found.png	0.0000	0.0000	{"AMPOLLA": [1, 85.0]}	Pheniel	0	f	2	1.0000	normal	1 ampolla al día	Estimulante y revitalizante
105	KOLICON 15 ML	Gotas	Alivio de la congestión nasal y los síntomas del resfriado común	Image-not-found.png	15.9500	0.0000	{"FRASCO": [1, 27.0]}	Clorhidrato de fenilefrina	1	f	2	0.4100	normal	1 a 2 gotas en cada fosa nasal cada 4 horas	Descongestionante nasal
76	GENCLOBEN CREMA TUBO 30 GMS	Crema	Tratamiento de dermatitis, eczemas, picaduras de insectos, quemaduras leves y otras afecciones de la piel	Image-not-found.png	13.9500	0.0000	{"CREMA": [1, 24.0]}	Gentamicina y Betametasona	2	f	2	0.4200	normal	Aplicar una capa delgada sobre la zona afectada 2 a 3 veces al día	Antiinflamatorio, antibacteriano y antiprurítico
93	IRBERSARTAN 300MG BLIST X 10 CAJA X 30 CAPLIN	Tableta recubierta	Tratamiento de la hipertensión arterial y la insuficiencia cardíaca	Image-not-found.png	2.6650	0.0000	{"BLISTER": [10, 42.0], "CAJA": [30, 126.0]}	Irbesartan	20	f	2	0.3700	normal	300mg	Antihipertensivo, antagonista de los receptores de angiotensina II
127	NISTATINA CREMA SELEC	Crema	Tratamiento de infecciones por hongos en la piel	Image-not-found.png	10.9500	0.0000	{"CREMA": [1, 19.0]}	Nistatina	1	f	2	0.4200	normal	Aplicar una capa delgada sobre la zona afectada 2 a 3 veces al día	Antifúngico
104	KLORPROSIN KIT INY X UNIDAD	Kit inyectable	Tratamiento de infecciones bacterianas	Image-not-found.png	13.7500	0.0000	{"KIT": [1, 25.0]}	Klorprosin	1	f	2	0.4500	normal	1 unidad por inyección	Antibiótico de amplio espectro
106	LANSOPRAZOL 30MG BLIS X 10 CAJA X 100 ARGUS	Tableta	Tratamiento de úlceras gástricas y duodenales, reflujo gastroesofágico, síndrome de Zollinger-Ellison, erradicación de Helicobacter pylori, entre otros	Image-not-found.png	0.4160	0.0000	{"BLIS": [10, 9.0], "CAJA": [100, 90.0]}	Lansoprazol	190	f	2	0.5400	normal	30mg	Inhibidor de la bomba de protones
114	MAGNESIO LIVE VIT C CAJA X 18 SOBRES	Sobres	Suplemento dietético para aportar magnesio y vitamina C al organismo	Image-not-found.png	8.3500	0.0000	{"CAJA": [18, 270.0], "SOBRE": [1, 15.0]}	Magnesio y Vitamina C	19	f	2	0.4400	normal	1 sobre al día disuelto en agua	Aporte de magnesio y vitamina C para mantener la salud y el bienestar
128	NISTATINA SUSPENSION  30 ML CAPLIN	Suspensión	Tratamiento de infecciones por hongos en la piel y mucosas	Image-not-found.png	8.9500	0.0000	{"SUSPENSION": [1, 16.0]}	Nistatina	2	f	2	0.4400	normal	30 ml	Antifúngico
129	NITASEL NITAXOZANIDA 100MG/5ML SUS SELEC	Suspensión oral	Tratamiento de infecciones causadas por parásitos intestinales y protozoarios	Image-not-found.png	25.9500	0.0000	{"VIAL": [1, 45.0]}	Nitazoxanida	3	f	2	0.4200	normal	100mg/5ml	Antiparasitario
135	PRENATALES (MULTIVI+MINERA) GEL CAPS KURANTIS	Cápsulas de gel	Suplemento vitamínico y mineral para mujeres embarazadas	Image-not-found.png	6.0950	0.0000	{"CAPSULA": [1, 10.0]}	Vitaminas y minerales	1	f	2	0.3900	normal	Tomar una cápsula al día	Ayuda a cubrir los requerimientos nutricionales durante el embarazo
146	SECNIDAZOL 500 MG X 4 TAB ARGUS	Tableta	Tratamiento de infecciones causadas por parásitos y bacterias	Image-not-found.png	3.5400	0.0000	{"CAJA": [4, 36.0], "TABLETA": [1, 9.0]}	Secnidazol	4	f	2	0.6100	normal	500 mg por tableta	Antiparasitario y antibacteriano
149	SEGURA PLUS	Tableta	Tratamiento de la hipertensión arterial	Image-not-found.png	13.2000	0.0000	{"BOTELLA": [1, 23.0]}	Losartan	4	f	2	0.4300	normal	50 mg una vez al día	Antihipertensivo
72	FLUCONAZOL 150 MG CAJA X 2 CAPS CAPLIN	Cápsulas	Tratamiento de infecciones causadas por hongos	Image-not-found.png	3.2500	0.0000	{"CAJA": [2, 12.0], "CAPSULA": [1, 6.0]}	Fluconazol	5	f	2	0.4600	normal	150 mg	Antifúngico
59	DROPADEX DUO BLIST X 10 CAJA X 10	Tableta	Analgésico y antipirético	Image-not-found.png	0.2500	0.0000	{"BLISTER": [10, 4.5], "CAJA": [10, 4.5]}	Paracetamol, Clorfenamina	300	f	2	0.4400	normal	1 tableta cada 6 horas	Analgésico, antipirético y antihistamínico
60	ENALAPRIL 20MG BLIST X 20 SELECT CAJA X 100	Tableta	Tratamiento de la hipertensión arterial y la insuficiencia cardíaca	Image-not-found.png	0.2180	0.0000	{"BLISTER": [20, 8.0], "CAJA": [100, 40.0]}	Enalapril	300	f	2	0.4600	normal	20mg	Inhibidor de la enzima convertidora de angiotensina (IECA)
73	FOSFOLIP ESENC DR KENDAL CAJA X 30 BLIST X 10	Tableta	Suplemento dietético que ayuda a mantener la salud del hígado y mejorar la función cerebral	Image-not-found.png	0.8650	0.0000	{"CAJA": [30, 45.0], "BLISTER": [10, 15.0]}	Fosfolípidos esenciales	120	f	2	0.4200	normal	Tomar 1 tableta al día	Ayuda a mejorar la función hepática y cerebral
130	NITASEL NITAZOXANIDA 500MG X6TAB SELECT	Tableta	Tratamiento de infecciones causadas por parásitos y bacterias en el tracto gastrointestinal	Image-not-found.png	17.8500	0.0000	{"CAJA": [6, 192.0], "TABLETA": [1, 32.0]}	Nitazoxanida	12	f	2	0.4400	normal	500mg por tableta	Antiparasitario y antibacteriano
62	ENZITROL BLIST X 10 CAJA X 100	Tableta	Tratamiento de enfermedades cardiovasculares	Image-not-found.png	0.7920	0.0000	{"BLISTER": [10, 13.0], "CAJA": [100, 130.0]}	Enalapril	90	f	2	0.3900	normal	10 mg	Inhibidor de la enzima convertidora de angiotensina
91	IRBERSA+HIDRO 300/25 BLIST X 10 CAJ X 30 CAPLIN	Tableta	Tratamiento de la hipertensión arterial	Image-not-found.png	3.8330	0.0000	{"BLISTER": [10, 61.0], "CAJA": [30, 183.0]}	Irbesartan + Hidroclorotiazida	40	f	2	0.3700	normal	300 mg de Irbesartan + 25 mg de Hidroclorotiazida	Antihipertensivo
63	ERITROMICINA 500 MGS BLIST X 10 CAJA X 50	Tableta	Antibiótico macrólido utilizado para tratar infecciones bacterianas	Image-not-found.png	1.1460	0.0000	{"BLISTER": [10, 20.0], "CAJA": [50, 100.0]}	Eritromicina	20	f	2	0.4300	normal	500 mg	Inhibe la síntesis de proteínas en las bacterias, deteniendo su crecimiento y reproducción
64	ERITROMICINA SUSP 250 MGS/5ML FCO X  60 ML THERFAM	Suspensión	Antibiótico utilizado para tratar infecciones causadas por bacterias	Image-not-found.png	12.1500	0.0000	{"FRASCO": [1, 22.0]}	Eritromicina	1	f	2	0.4500	normal	250 mg/5 ml	Inhibe la síntesis de proteínas en las bacterias, deteniendo su crecimiento y reproducción
77	GERIATRI H3 C/GINS ROJO GEL CAPS BLIST X 10 CAJA X 30 CONA	Cápsula gelatinosa	Suplemento alimenticio para adultos mayores	Image-not-found.png	0.5860	0.0000	{"BLISTER": [10, 12.0], "CAJA": [30, 36.0]}	Ginseng rojo	90	f	2	0.5100	normal	Tomar una cápsula al día	Estimulante y revitalizante
80	GLICITOS JBE FCO X 120 ML	Jarabe	Tratamiento de la diabetes tipo 2	Image-not-found.png	10.6500	0.0000	{"FRASCO": [1, 19.0]}	Metformina	4	f	2	0.4400	normal	La dosis usual es de 500 mg a 2000 mg al día, dividida en 2 o 3 dosis	Reduce la producción de glucosa en el hígado y mejora la sensibilidad a la insulina en los tejidos
82	GRIIN VITAMIN LIQUIPACK SOBRE CAJA X 12	Sobre	Suplemento vitamínico	Image-not-found.png	44.9500	0.0000	{"CAJA": [12, 900.0], "SOBRE": [1, 75.0]}	Vitaminas	1	f	2	0.4000	normal	1 sobre al día	Aporte de vitaminas y minerales
83	GUAYATOS FCO X 120 ML	Solución oral	Antitusivo y expectorante	Image-not-found.png	8.1000	0.0000	{"FRASCO": [1, 13.0]}	Guaifenesina	8	f	2	0.3800	normal	Adultos y niños mayores de 12 años: 10 ml cada 4 horas. Niños de 6 a 12 años: 5 ml cada 4 horas. Niños de 2 a 6 años: 2.5 ml cada 4 horas.	Ayuda a disminuir la viscosidad de las secreciones bronquiales y facilita su eliminación, aliviando la tos y mejorando la expectoración.
85	IBUPROFEN 400 MGS BLISTER X 10  CAJA X 100 ARGUS	Tableta	Alivio del dolor, fiebre y reducción de la inflamación	Image-not-found.png	0.1790	0.0000	{"BLISTER": [10, 4.0], "CAJA": [100, 40.0]}	Ibuprofeno	130	f	2	0.5500	normal	400 mg	Antiinflamatorio no esteroideo (AINE)
111	LORATADINA 5 MG JBE SELEC	Jarabe	Antihistamínico indicado para el alivio de los síntomas de la rinitis alérgica y urticaria	Image-not-found.png	8.0900	0.0000	{"JARABE": [1, 15.0]}	Loratadina	4	f	2	0.4600	normal	5 mg por cada 5 ml de jarabe	Inhibe la acción de la histamina en el organismo, reduciendo los síntomas de alergia
92	IRBERSARTAN 150 MG BLIST X 10 CAJA X 30CAPLIN	Tableta recubierta	Tratamiento de la hipertensión arterial y la insuficiencia cardiaca	Image-not-found.png	2.4980	0.0000	{"BLISTER": [10, 39.6], "CAJA": [30, 118.8]}	Irbesartan	30	f	2	0.3700	normal	150 mg	Antagonista de los receptores de angiotensina II
99	JERINGA 3ML 23X1 1/12 DIFASA CAJA X 100	Jeringa	Administración de medicamentos por vía intramuscular o subcutánea	Image-not-found.png	0.4000	0.0000	{"CAJA": [100, 100.0], "JERINGA PRELLENADA": [1, 1.0]}	No especificado	80	f	2	0.6000	normal	3ml	No especificada
115	METFORMINA 1 GM BLIST X 10 CAJA X 100 CAPLIN	Tableta	Tratamiento de la diabetes tipo 2	Image-not-found.png	0.6000	0.0000	{"BLISTER": [10, 10.0], "CAJA": [100, 100.0]}	Metformina	160	f	2	0.4000	normal	1 gramo	Hipoglucemiante
102	KETOROLACO 20 MG BLIST X 10 CAJA X 50	Tableta	Analgésico y antiinflamatorio no esteroideo	Image-not-found.png	0.0970	0.0000	{"BLISTER": [10, 2.0], "CAJA": [50, 10.0]}	Ketorolaco	550	f	2	0.5200	normal	20 mg	Inhibidor de la síntesis de prostaglandinas
109	LORATADINA 10MG  BLISTX 10 TABS CAPLIN CAJA X 100	Tableta	Antihistamínico utilizado para aliviar los síntomas de la alergia como la picazón, estornudos y ojos llorosos	Image-not-found.png	0.0780	0.0000	{"CAJA": [100, 25.0], "BLISTER": [20, 5.0]}	Loratadina	180	f	2	0.6900	normal	10mg	Antihistamínico no sedante
119	METOCARBAMOL BLIST X 10 CAJA X 100 CAPLIN	Cápsulas	Relajante muscular	Image-not-found.png	0.3300	0.0000	{"BLISTER": [10, 8.0], "CAJA": [100, 80.0]}	Metocarbamol	30	f	2	0.5900	normal	Tomar 1 cápsula cada 6 horas	Actúa como agente relajante del músculo esquelético
123	NAPROXENO 550 MG BLIST X 10 CAJA X 100 CAPLIN/ARGUS	Tableta	Analgésico y antiinflamatorio no esteroideo	Image-not-found.png	0.8000	0.0000	{"BLISTER": [10, 15.0], "CAJA": [100, 150.0]}	Naproxeno	70	f	2	0.4700	normal	550 mg	Inhibe la síntesis de prostaglandinas
139	PRUDENCE CAJA X 3   MENTA, FRESA,CHOCOLATE,UVA	Pastillas	Suplemento dietario para el cuidado de la salud íntima femenina	Image-not-found.png	14.1500	0.0000	{"CAJA": [3, 72.0], "SACHET": [1, 24.0]}	No especificado	4	f	2	0.4100	normal	1 pastilla cada 24 horas	Ayuda a mantener el equilibrio de la flora vaginal y prevenir infecciones
141	PRUDENCE RETARDANTE SOBRE X 3 PERSERVATIVOS	Preservativos	Retardante para prolongar la eyaculación y mejorar la experiencia sexual	Image-not-found.png	20.9500	0.0000	{"CAJA": [3, 105.0], "SACHET": [1, 35.0]}	Benzocaína	1	f	2	0.4000	normal	Utilizar según las indicaciones del fabricante	Anestésico local para reducir la sensibilidad en el pene y retrasar la eyaculación
144	SAL INGLESA SOBRE X 25 VESA	Sobres	Laxante	Image-not-found.png	0.3300	0.0000	{"SOBRE": [25, 25.0], "BOLSA": [1, 1.0]}	Sulfato de magnesio	18	f	2	0.6700	normal	1 sobre disuelto en agua cada 8 horas	Laxante osmótico
61	ENZIMAS DIGES BLIST X 10 CAJA X 30 CONAMEP	Tabletas	Suplemento digestivo utilizado para mejorar la digestión de los alimentos	Image-not-found.png	0.8030	0.0000	{"BLISTER": [10, 15.0], "CAJA": [30, 45.0]}	Enzimas digestivas	40	f	2	0.4600	normal	Tomar 1 tableta después de cada comida	Facilita la descomposición de los alimentos en el sistema digestivo
68	ETORICOXIB 90 MG CAJA X 10 TAB CAPLIN	Tableta recubierta	Tratamiento del dolor agudo y crónico, la osteoartritis, la artritis reumatoide y la espondilitis anquilosante	Image-not-found.png	5.0000	0.0000	{"CAJA": [10, 83.0], "TABLETA": [1, 8.3]}	Etoricoxib	20	f	2	0.4000	normal	90 mg	Antiinflamatorio no esteroideo (AINE) con propiedades analgésicas, antiinflamatorias y antipiréticas
101	KETOCONAZOL CREMA 15 GM ARGUS CAPLIN	Crema	Tratamiento de infecciones fúngicas de la piel como tiña, candidiasis cutánea, pitiriasis versicolor, entre otras	Image-not-found.png	4.6500	0.0000	{"CREMA": [1, 10.0]}	Ketoconazol	1	f	2	0.5400	normal	Aplicar una capa delgada sobre la zona afectada dos veces al día	Antifúngico de amplio espectro que actúa inhibiendo la síntesis del ergosterol en la membrana celular de los hongos
69	EXFLU ADULTO SINUS FCO 120 ML	Jarabe	Alivio de los síntomas de la gripe y resfriado común	Image-not-found.png	18.9500	0.0000	{"FRASCO": [1, 32.0]}	Paracetamol, Clorfenamina, Fenilefrina	2	f	2	0.4100	normal	Tomar 10 ml cada 6 horas	Analgésico, antihistamínico, descongestionante nasal
79	GINSENG JALEA REAL CAJA X 10 ML CAPLIN	Jalea	Suplemento dietético	Image-not-found.png	1.8800	0.0000	{"CAJA": [10, 35.0]}	Ginseng	10	f	2	0.4600	normal	10 ml	Estimulante y revitalizante
84	HIDROCLOROTIAZIDA 50 MG BLIST X 10 CAJA X 100 CAPLIN	Tableta	Tratamiento de la hipertensión arterial y la retención de líquidos	Image-not-found.png	0.2500	0.0000	{"BLISTER": [10, 5.0], "CAJA": [100, 50.0]}	Hidroclorotiazida	110	f	2	0.5000	normal	50 mg	Diurético y antihipertensivo
86	IBUPROFEN 600 MGS BLISTER X 10 CAJA X 100  ARGUS	Tableta	Alivio del dolor y la inflamación	Image-not-found.png	0.2230	0.0000	{"BLISTER": [10, 5.0], "CAJA": [100, 50.0]}	Ibuprofeno	200	f	2	0.5500	normal	600 mg	Antiinflamatorio no esteroideo
108	LEVOGASTRIC CAJA X 30 BLISTER X 5	Tabletas	Tratamiento de la gastritis y úlceras gástricas	Image-not-found.png	1.2800	0.0000	{"CAJA": [30, 78.0], "BLISTER": [5, 13.0]}	Levomepromazina	30	f	2	0.5100	normal	1 tableta cada 8 horas	Antagonista de los receptores de dopamina y serotonina
89	IBUWIN 600 GEL CAPS BLIST X 10 CAJA X 100	Cápsula de gel	Alivio del dolor y la inflamación	Image-not-found.png	0.0780	0.0000	{"BLISTER": [10, 1.4], "CAJA": [100, 14.0]}	Ibuprofeno	1440	f	2	0.4400	normal	600 mg	Antiinflamatorio, analgésico y antipirético
90	IBUWIN FORTE  GEL CAPS BLIST X 10  CAJA X 100	Cápsulas de gel	Alivio del dolor y la inflamación	Image-not-found.png	0.9920	0.0000	{"BLISTER": [10, 20.0], "CAJA": [100, 200.0]}	Ibuprofeno	200	f	2	0.5000	normal	400 mg por cápsula	Antiinflamatorio, analgésico y antipirético
124	NASOLIN GOTAS 15 ML  MEDIPROD	Gotas	Descongestionante nasal	Image-not-found.png	18.2500	0.0000	{"FRASCO": [1, 32.0]}	Oximetazolina	2	f	2	0.4300	normal	Adultos y niños mayores de 6 años: 1 a 2 gotas en cada fosa nasal cada 6-8 horas. No usar por más de 3 días seguidos.	Vasoconstrictor nasal
100	JERINGA 5 ML 22 X 1 1/2 CAJA X 100	Jeringa	Administración de medicamentos por vía intramuscular o subcutánea	Image-not-found.png	0.3550	0.0000	{"CAJA": [100, 100.0], "JERINGA PRELLENADA": [1, 1.0]}	No especificado	93	f	2	0.6500	normal	5 ml	Facilita la administración precisa de medicamentos en dosis específicas
117	METFORMINA 850 MG BLIST X 10 CAJA X 100 CAPLIN	Tableta	Tratamiento de la diabetes tipo 2	Image-not-found.png	0.3330	0.0000	{"BLISTER": [10, 6.0], "CAJA": [100, 60.0]}	Metformina	50	f	2	0.4500	normal	850 mg	Hipoglucemiante
132	PENETRACINA 3 CREMA 15 GR MEDIPROD	Crema	Tratamiento tópico de infecciones de la piel causadas por bacterias sensibles a la penicilina.	Image-not-found.png	29.9500	0.0000	{"CREMA": [1, 49.0]}	Penicilina	2	f	2	0.3900	normal	Aplicar una capa delgada sobre la zona afectada 2 a 3 veces al día	Antibiótico de amplio espectro que actúa inhibiendo la síntesis de la pared celular bacteriana
118	METFORMINA 850 MG BLIST X 10 TAB INFASA	Tableta	Tratamiento de la diabetes tipo 2	Image-not-found.png	4.1800	0.0000	{"BLISTER": [10, 70.0], "TABLETA": [1, 7.0]}	Metformina	12	f	2	0.4000	normal	850 mg	Hipoglucemiante
120	METOCARBAMOL BLIST X 10 CAJA X 100 SELECT	Tableta	Relajante muscular	Image-not-found.png	0.4500	0.0000	{"BLISTER": [10, 8.0], "CAJA": [100, 80.0]}	Metocarbamol	90	f	2	0.4400	normal	Se recomienda tomar 1 tableta cada 8 horas	Actúa como agente central para el alivio del dolor y la rigidez muscular
133	PODOFILINA 25% X 5 ML F QUIMICA	Solución tópica	Tratamiento de verrugas genitales y condilomas acuminados	Image-not-found.png	30.6500	0.0000	{"CREMA": [1, 52.0]}	Podofilotoxina	1	f	2	0.4100	normal	Aplicar una capa fina sobre las lesiones 1 vez al día durante 3 días, luego descansar 4 días y repetir el ciclo si es necesario	Agente queratolítico y antimitótico
134	PREDNISONA 50MG BLISTER X 10 SELEC CAJA X 100	Tableta	Antiinflamatorio, inmunosupresor	Image-not-found.png	0.1880	0.0000	{"BLISTER": [10, 4.2], "CAJA": [100, 42.0]}	Prednisona	320	f	2	0.5500	normal	50mg	Antiinflamatorio, inmunosupresor
136	PRENATALES PLUS 6 BLIS X 5 CAJA X 30 CAP CONAMEP	Cápsulas	Suplemento vitamínico para mujeres embarazadas	Image-not-found.png	1.3140	0.0000	{"BLIS": [5, 11.0], "CAJA": [30, 66.0]}	Ácido fólico, Hierro, Calcio, Vitamina D, Vitamina B12, entre otros	80	f	2	0.4000	normal	Tomar una cápsula diaria con alimentos	Ayuda a cubrir los requerimientos nutricionales durante el embarazo
143	RELAX PLUS CAJA X 30 CAPS BLIST X 10 CONAMEP	Cápsulas	Medicamento utilizado para el tratamiento de la ansiedad y el estrés.	Image-not-found.png	0.0880	0.0000	{"CAJA": [30, 4.5], "BLISTER": [10, 1.5]}	No especificado	720	f	2	0.4100	normal	Tomar 1 cápsula cada 8 horas, según indicación médica.	Ansiolítico y relajante muscular
147	SECNIDAZOL 500 MG X 4 TAB CAPLIN	Tableta	Tratamiento de infecciones causadas por parásitos y bacterias	Image-not-found.png	4.4300	0.0000	{"CAJA": [4, 32.0], "TABLETA": [1, 8.0]}	Secnidazol	3	f	2	0.4500	normal	500 mg por tableta	Antiparasitario y antibacteriano
66	ESOMEPRAZOL 40 MG BLIST X 10 CAJA X 100 WASHINGTON	Tableta	Tratamiento de enfermedades ácido-pépticas como la úlcera gástrica, úlcera duodenal, reflujo gastroesofágico y síndrome de Zollinger-Ellison.	Image-not-found.png	1.1500	0.0000	{"BLISTER": [10, 20.0], "CAJA": [100, 200.0]}	Esomeprazol	110	f	2	0.4300	normal	40 mg	Inhibidor de la bomba de protones
121	NAFASOLINA .025% DE 15 ML	Solución para inhalación	Tratamiento de enfermedades respiratorias como el asma y la bronquitis	Image-not-found.png	10.5100	0.0000	{"FRASCO": [1, 19.0]}	Nafazolina	2	f	2	0.4500	normal	0.025%	Descongestionante nasal
140	PRUDENCE CLASICO SOBRE X 3 PERSERVATIVO	Sobre	Preservativo masculino para la prevención de enfermedades de transmisión sexual y embarazos no deseados	Image-not-found.png	11.7500	0.0000	{"CAJA": [3, 60.0], "SACHET": [1, 20.0]}	Látex	1	f	2	0.4100	normal	1 preservativo por cada relación sexual	Barrea mecánica para evitar el contacto directo entre los fluidos corporales durante la relación sexual
122	NAPROLIV  (NAPROXENO  550 MG) CAJA X 50 BLIST X 10	Tableta	Analgésico y antiinflamatorio no esteroideo	Image-not-found.png	1.0260	0.0000	{"CAJA": [50, 85.0], "BLISTER": [10, 17.0]}	NAPROXENO	60	f	2	0.4000	normal	550 MG	Inhibidor de la síntesis de prostaglandinas
126	NISTATINA 30ML GOTAS SELEC	Gotas	Antimicótico tópico para el tratamiento de infecciones por hongos en la piel y mucosas	Image-not-found.png	9.9500	0.0000	{"FRASCO": [1, 18.0]}	Nistatina	2	f	2	0.4500	normal	30ml	Antifúngico
131	OMEPRAZOL 20 MG BLISTER X 10 ARGUS CAJA X 100	Tableta	Tratamiento de úlceras gástricas, duodenales, esofagitis por reflujo gastroesofágico, síndrome de Zollinger-Ellison, erradicación de Helicobacter pylori, entre otros.	Image-not-found.png	0.2100	0.0000	{"BLISTER": [10, 5.0], "CAJA": [100, 50.0]}	Omeprazol	140	f	2	0.5800	normal	20 mg	Inhibidor de la bomba de protones, reduce la producción de ácido en el estómago.
94	JERINGA 10 ML 21 X 1 1/2 CAJA X 100	Jeringa	Administración de medicamentos por vía intramuscular o subcutánea	Image-not-found.png	0.0000	0.0000	{"CAJA": [100, 150.0], "JERINGA PRELLENADA": [1, 1.5]}	No especificado	0	f	2	1.0000	normal	10 ml	Facilita la administración precisa de medicamentos en dosis específicas
96	JERINGA 3 ML 21 X1 1/2 DIFASA CAJA X 100	Jeringa	Administración de medicamentos por vía parenteral	Image-not-found.png	0.0000	0.0000	{"CAJA": [100, 100.0], "JERINGA PRELLENADA": [1, 1.0]}	No especificado	0	f	2	1.0000	normal	3 ml	No especificado
137	PROSTALINE CAJA X 30 BLISTER X 10 CAP	Cápsulas	Tratamiento de la hiperplasia prostática benigna	Image-not-found.png	1.1830	0.0000	{"CAJA": [30, 60.0], "BLISTER": [10, 20.0]}	Serenoa repens	20	f	2	0.4100	normal	Tomar 1 cápsula al día	Inhibición de la enzima 5-alfa reductasa y disminución de la inflamación prostática
138	PRUDENCE ANILLOS Y PUNTOS CAJA X 3 PERSERVATIVOS	Preservativo	Método anticonceptivo de barrera para prevenir embarazos no deseados y proteger contra enfermedades de transmisión sexual	Image-not-found.png	14.9000	0.0000	{"CAJA": [3, 75.0], "SACHET": [1, 25.0]}	Látex	2	f	2	0.4000	normal	Uso único	Prevención de embarazos y protección contra enfermedades de transmisión sexual
70	EXFLU JARABE FCO X 120 ML MULTISINTOMAS	Jarabe	Alivio de los síntomas de gripa y resfriado común	Image-not-found.png	11.6500	0.0000	{"FRASCO": [1, 20.0], "JARABE": [1, 20.0]}	Paracetamol, Clorfenamina, Fenilefrina	4	f	2	0.4200	normal	Tomar 10 ml cada 6 horas	Analgésico, Antihistamínico, Descongestionante nasal
75	GASTROPRAL BLIST X 10 CAJA X 100	Tableta	Tratamiento de la acidez estomacal y la indigestión	Image-not-found.png	0.5890	0.0000	{"BLISTER": [10, 12.0], "CAJA": [100, 120.0]}	Ranitidina	100	f	2	0.5100	normal	Tomar 1 tableta cada 12 horas	Inhibidor de la secreción ácida gástrica
78	GINKO BILOBA+G BLIST X 10 CAJA X 50 GEL CAPS  CONAMEP	Cápsulas	Suplemento dietético utilizado para mejorar la circulación sanguínea y la función cerebral.	Image-not-found.png	0.1120	0.0000	{"BLISTER": [10, 2.0], "CAJA": [50, 10.0]}	Extracto de Ginkgo Biloba	270	f	2	0.4400	normal	Tomar 1 cápsula al día, preferiblemente con alimentos.	Mejora la circulación sanguínea periférica y cerebral, aumentando el flujo de oxígeno y nutrientes a nivel celular.
98	JERINGA 3 ML 23 X 1 1/4 THERFAM CAJA X 100	Jeringa	Administración de medicamentos por vía intramuscular	Image-not-found.png	0.3400	0.0000	{"CAJA": [100, 100.0], "JERINGA PRELLENADA": [1, 1.0]}	No especificado	114	f	2	0.6600	normal	3 ml	Facilita la administración de medicamentos de forma segura y precisa
107	LEVOCETIRIZINA 5 MG  CAJA X 10 TAB	Tableta	Antihistamínico para el alivio de los síntomas de la rinitis alérgica y urticaria	Image-not-found.png	0.5700	0.0000	{"CAJA": [10, 10.0], "TABLETA": [1, 1.0]}	Levocetirizina	36	f	2	0.4300	normal	5 mg	Antihistamínico, bloquea la acción de la histamina en el cuerpo
116	METFORMINA 1G BLIST X10 TAB CAJA X 100 INFASA	Tableta	Tratamiento de la diabetes tipo 2	Image-not-found.png	0.6630	0.0000	{"CAJA": [100, 105.0], "BLISTER": [10, 10.5]}	Metformina	120	f	2	0.3700	normal	1 gramo por tableta	Hipoglucemiante
74	GABAPENTINA 400 MG BLIST X 10  CAJA X 100 ARGUS	Tableta	Tratamiento de la epilepsia y neuralgia postherpética	Image-not-found.png	0.1700	0.0000	{"BLISTER": [10, 3.0], "CAJA": [100, 30.0]}	Gabapentina	1060	f	2	0.4300	normal	400 mg	Antiepiléptico y analgésico
81	GLUXICAM SOBRE CAJA X 14 (MELOXICAM + GLUCOS)	Sobre	Analgésico y antiinflamatorio no esteroideo	Image-not-found.png	5.3400	0.0000	{"CAJA": [14, 126.0], "SOBRE": [1, 9.0]}	Meloxicam + Glucosamina	20	f	2	0.4100	normal	1 sobre cada 24 horas	Alivio del dolor y la inflamación
87	IBUPROFEN 800 MGS BLISTER X 10 CAJA X 100 ARGUS	Tableta	Alivio del dolor y la inflamación	Image-not-found.png	0.3400	0.0000	{"BLISTER": [10, 7.0], "CAJA": [100, 70.0]}	Ibuprofeno	180	f	2	0.5100	normal	800 mg	Antiinflamatorio, analgésico y antipirético
88	IBUWIN 400 GEL CAPS BLIST X 10  CAJA X 50	Cápsula	Alivio del dolor y la inflamación	Image-not-found.png	0.0470	0.0000	{"BLISTER": [10, 1.0], "CAJA": [50, 5.0]}	Ibuprofeno	10	f	2	0.5300	normal	400 mg	Antiinflamatorio, analgésico y antipirético
95	JERINGA 10 ML 22 X 1 1/2 CAJA X 100	Jeringa	Administración de medicamentos por vía parenteral	Image-not-found.png	0.6000	0.0000	{"CAJA": [100, 150.0], "JERINGA PRELLENADA": [1, 1.5]}	No especificado	47	f	2	0.6000	normal	10 ml	No especificado
151	SOSTENGO SILDENAFIL 100MG CAJA X 24 SOB Y CAJITA X 2 TAB	Tableta	Tratamiento de la disfunción eréctil	Image-not-found.png	4.9200	0.0000	{"CAJA": [24, 240.0], "TABLETA": [1, 10.0]}	Sildenafil	12	f	2	0.5100	normal	100mg	Inhibidor de la fosfodiesterasa tipo 5
97	JERINGA 3 ML 22 X1 1/2 SUM SHIN CAJA X 100	Jeringa	Administración de medicamentos por vía intramuscular o subcutánea	Image-not-found.png	0.3600	0.0000	{"CAJA": [100, 100.0], "JERINGA PRELLENADA": [1, 1.0]}	No especificado	21	f	2	0.6400	normal	3 ml	Facilita la administración controlada de medicamentos en el paciente
142	PRUDENCE SENSITIVE SOBRE X 3 PERSERVATIVOS	Preservativos	Preservativos de látex lubricados y con forma anatómica para una mayor comodidad y sensibilidad	Image-not-found.png	16.1000	0.0000	{"CAJA": [3, 81.0], "SACHET": [1, 27.0]}	No aplica	1	f	2	0.4000	normal	Uso único	Prevención de enfermedades de transmisión sexual y embarazos no deseados
103	KLORPROSIN  (CLONIS+PRO)  BLIST X 10 CAJA X 100	Tableta	Tratamiento de la hipertensión arterial y la insuficiencia cardiaca	Image-not-found.png	0.0840	0.0000	{"BLISTER": [10, 1.4], "CAJA": [100, 14.0]}	Clonidina y Propranolol	600	f	2	0.4000	normal	La dosis usual es de 1 tableta cada 8 horas	Antihipertensivo y antiarrítmico
112	LUBRICANTE VIVE 120 ML NATURAL	Gel	Lubricante íntimo para facilitar la penetración durante las relaciones sexuales	Image-not-found.png	25.3500	0.0000	{"PERSERVATIVO": [1, 40.0]}	No especificado	1	f	2	0.0000	normal	Aplicar la cantidad necesaria en la zona genital antes de la relación sexual	Facilita la penetración y reduce la fricción durante las relaciones sexuales
145	SECNIDAZOL 125 MG SUSP FCO X 30 ML	Suspensión	Tratamiento de infecciones causadas por parásitos y bacterias	Image-not-found.png	13.4000	0.0000	{"FRASCO": [1, 23.0]}	Secnidazol	2	f	2	0.4200	normal	125 mg	Antiparasitario y antibacteriano
148	SECNIDAZOL SUSP 125 MG 5ML CAPLIN	Suspensión	Tratamiento de infecciones causadas por parásitos y bacterias	Image-not-found.png	11.0000	0.0000	{"SUSPENSION": [1, 20.0]}	Secnidazol	3	f	2	0.4500	normal	125 mg/5 ml	Antiparasitario y antibacteriano
150	SENOSIDOS  CAJA X 30 BLIST X 10 CONAMEP	Tabletas	Laxante	Image-not-found.png	0.0570	0.0000	{"CAJA": [30, 3.0], "BLISTER": [10, 1.0]}	Senósidos A y B	1430	f	2	0.4300	normal	Tomar 1 tableta antes de acostarse	Estimula el peristaltismo intestinal
153	SPORT GEL FORTE 30 GRS	Gel	Alivio del dolor muscular y articular	Image-not-found.png	11.2500	0.0000	{"CAPSULAS": [1, 20.0]}	Mentol	1	f	2	0.0000	normal	Aplicar una capa delgada sobre la zona afectada hasta 3 veces al día	Analgésico y antiinflamatorio
152	SPASMOCLOR (CLORDIA+BROM DE CLID) BLISX 20 CJA X 100	Tabletas	Tratamiento de espasmos musculares y cólicos	Image-not-found.png	0.0470	0.0000	{"BLISTER": [20, 1.6], "CAJA": [100, 8.0]}	Clordiazepóxido + Bromuro de clidinio	2140	f	2	0.4100	normal	La dosis usual es de 1 tableta cada 6 horas, según indicación médica	El clordiazepóxido actúa como relajante muscular y ansiolítico, mientras que el bromuro de clidinio actúa como antiespasmódico
154	SULFATO DE SODA X 16 SOBRES DISFAVIL	Sobres	Laxante	Image-not-found.png	0.0000	0.0000	{"CAJA": [16, 8.0], "BOLSA": [1, 0.5]}	Sulfato de sodio	0	f	2	1.0000	normal	1 sobre disuelto en agua antes de acostarse	Laxante osmótico
156	SUPOSITORIOS ACETAMINF 300MG CAPLIN	Supositorios	Alivio del dolor y la fiebre	Image-not-found.png	1.4400	0.0000	{"SUPOSITORIO": [1, 3.0]}	Acetaminofén	2	f	2	0.5200	normal	300mg	Analgésico y antipirético
157	TELMISARTAN 80 MG CAJA X 30 BLIST X 10	Tableta	Tratamiento de la hipertensión arterial y la insuficiencia cardiaca	Image-not-found.png	2.6720	0.0000	{"CAJA": [30, 132.0], "BLISTER": [10, 44.0]}	Telmisartan	60	f	2	0.3900	normal	80 mg	Antihipertensivo, antagonista de los receptores de angiotensina II
159	TRIMETOSE VIJOSA 120ML JARABE	Jarabe	Antitusivo y mucolítico	Image-not-found.png	21.9500	0.0000	{"JARABE": [1, 35.0]}	Trimetazidina	6	f	2	0.3700	normal	Adultos: 10 ml cada 8 horas. Niños: Consultar al médico	Ayuda a aliviar la tos y facilita la eliminación de mucosidad
113	LUBRICANTE VIVE 120 ML S. FRESA	Gel	Lubricante íntimo para facilitar la penetración durante las relaciones sexuales	Image-not-found.png	25.3500	0.0000	{"PERSERVATIVO": [1, 40.0]}	No especificado	1	f	2	0.0000	normal	Aplicar la cantidad deseada en la zona genital antes de la actividad sexual	Facilita la lubricación y reduce la fricción durante las relaciones sexuales
125	NEUROTROPAS GEL CAPS CAJA X 50 BLIST X 10 CONAMEP	Cápsulas	Suplemento vitamínico para el sistema nervioso	Image-not-found.png	0.0890	0.0000	{"CAJA": [50, 7.5], "BLISTER": [10, 1.5]}	Vitaminas del complejo B	650	f	2	0.4100	normal	Tomar 1 cápsula al día	Ayuda a mejorar la función del sistema nervioso
155	SULFATO FERROSO 350 MG BLIST X 10 SELEC	Tableta	Suplemento de hierro para tratar la deficiencia de hierro en el organismo	Image-not-found.png	0.1620	0.0000	{"BLISTER": [10, 3.0]}	Sulfato ferroso	100	f	2	0.4600	normal	350 mg	Suplemento de hierro para corregir la anemia ferropénica
222	DICLO+NEURO SHEKINAH BLIS X 10 GEL CAPS CAJA X 100	Cápsulas	Analgésico y antiinflamatorio	Image-not-found.png	0.5800	0.0000	{"BLISTER": [10, 10.0], "CAJA": [100, 100.0]}	Diclofenaco + Neurotrofina	190	f	6	0.4200	normal	Según indicación médica	Analgésico y antiinflamatorio
174	ZINKVANZ (ZINC)10MG/5ML JBE 120ML SEVEN	Jarabe	Suplemento de zinc para el tratamiento de deficiencias de este mineral en el organismo	Image-not-found.png	41.0500	0.0000	{"JARABE": [1, 69.0]}	Zinc	1	f	2	0.4100	normal	10mg/5ml	Suplemento mineral
175	ZORRITONE JARABE 120 ML	Jarabe	Alivio de la tos y la congestión nasal	Image-not-found.png	20.9500	0.0000	{"JARABE": [1, 33.0]}	Clorfenamina, Fenilefrina	2	f	2	0.3700	normal	Adultos y niños mayores de 12 años: 10 ml cada 6 horas. Niños de 6 a 12 años: 5 ml cada 6 horas.	Antihistamínico y descongestionante nasal
176	ACETAMINOFEN MK GOTAS FCO 30 ML	Gotas	Analgésico y antipirético	Image-not-found.png	18.0000	0.0000	{"FRASCO": [1, 31.0]}	Acetaminofen	4	f	6	0.4200	normal	Según indicación médica	Reduce la fiebre y alivia el dolor
182	ARTRI KING CAJA X 100 TABS	Tabletas	Suplemento alimenticio	Image-not-found.png	50.3000	0.0000	{"CAJA": [100, 8500.0], "TABLETA": [1, 85.0]}	Glucosamina y condroitina	1	f	6	0.4100	normal	Según indicación médica	Ayuda a mantener la salud de las articulaciones
193	CANESTEN EXTRA	Crema	Antifúngico	Image-not-found.png	15.0000	0.0000	{"BOLSA": [1, 45.0]}	Clotrimazol	2	f	6	0.6700	normal	1%	Tratamiento de infecciones por hongos en la piel
259	HIDRAVIDA UVA	Jarabe	Suplemento vitamínico	Image-not-found.png	11.3600	0.0000	{"BOTE": [1, 19.0]}	Vitaminas y minerales	5	f	6	0.4000	normal	Tomar 10 ml al día	Ayuda a mantener un adecuado balance de vitaminas y minerales en el organismo
195	CEFTRIAXONA 1GR+LIDOC KIT PROMEGAL	Kit	Antibiótico y anestésico local	Image-not-found.png	11.3000	0.0000	{"KIT": [1, 20.0]}	Ceftriaxona y lidocaína	4	f	6	0.4400	normal	1 g y 20 mg	Tratamiento de infecciones bacterianas
202	CODERPINA 10 MG BLIST X 10 TAB FRYSIA CAJA X 20	Tabletas	Analgésico y antipirético	Image-not-found.png	0.1750	0.0000	{"BLISTER": [10, 2.8], "CAJA": [20, 5.6]}	Codeína fosfato	470	f	6	0.3800	normal	Tomar 1 tableta cada 4-6 horas según necesidad	Analgésico, antipirético
214	DEKA C ADULTO CAJA X 3 AMPOLLAS	Ampollas inyectables	Suplemento de vitamina C	Image-not-found.png	15.3000	0.0000	{"CAJA": [1, 29.0]}	Vitamina C	5	f	6	0.4700	normal	Según indicación médica	Suplemento nutricional
223	DICO GRIP A.M CAJA X 24 SOBRES	Sobres	Alivio de síntomas gripales en la mañana	Image-not-found.png	2.0800	0.0000	{"CAJA": [24, 96.0], "SOBRE": [1, 4.0]}	Paracetamol + Pseudoefedrina	9	f	6	0.4800	normal	Según indicación médica	Alivio de síntomas gripales
228	DOLO NEUROBION KIT INYECTADO 2 AMP	Solución inyectable	Suplemento vitamínico	Image-not-found.png	9.3000	0.0000	{"KIT": [1, 50.0]}	Vitaminas B1, B6, B12	2	f	6	0.8100	normal	Según indicación médica	Mejora del funcionamiento del sistema nervioso
229	DOLO NEUROBION XR BLIS X 5 TAB CAJA X 60	Tabletas de liberación prolongada	Suplemento vitamínico	Image-not-found.png	0.5000	0.0000	{"BLISTER": [5, 8.0], "CAJA": [60, 96.0]}	Vitaminas B1, B6, B12	325	f	6	0.6900	normal	Según indicación médica	Mejora del funcionamiento del sistema nervioso
232	DOMINAL CAJA X 100 SOBRES	Sobres granulados	Antiespasmódico y analgésico	Image-not-found.png	0.5500	0.0000	{"CAJA": [100, 100.0], "SOBRE": [1, 1.0]}	Metamizol sódico	76	f	6	0.4500	normal	Según indicación médica	Alivio del dolor y reducción de espasmos
238	EXPECTORANTE COMPUESTO LANCASCO 120 ML	Jarabe	Ayuda a expulsar las flemas	Image-not-found.png	24.3000	0.0000	{"SOBRE": [1, 45.0]}	Varios principios activos	3	f	6	0.0000	normal	Varía según la presentación	Expectorante
242	FLUDISIN (AMBROXOL) JBE 100 ML LEGSA	Jarabe	Mucolítico y expectorante	Image-not-found.png	20.3000	0.0000	{"JARABE": [1, 35.0]}	Ambroxol	3	f	6	0.4200	normal	Varía según la presentación	Mucolítico y expectorante
243	FLUDISIN COM (AMBR+CLEB) 100 ML LEGSA	Jarabe	Mucolítico y antitusivo	Image-not-found.png	22.0000	0.0000	{"CAJA": [1, 39.0]}	Ambroxol y clembuterol	3	f	6	0.4400	normal	Varía según la presentación	Mucolítico y antitusivo
249	GRANEODIN FRAMBUESA CAJA X 24 PASTILLAS	Pastillas	Para el alivio de la garganta irritada	Image-not-found.png	0.0000	0.0000	{"CAJA": [24, 3.0]}	No especificado	0	f	6	1.0000	normal	Chupar una pastilla cada 4 horas	Alivio del dolor de garganta
260	HIERRO KIDS 240 ML	Jarabe	Suplemento de hierro para niños	Image-not-found.png	0.0000	0.0000	{"FRASCO": [1, 28.0]}	Hierro	0	f	6	1.0000	normal	Según indicación médica	Ayuda a prevenir o tratar la deficiencia de hierro en niños
158	TETRACICLINA 500 MG BLISTER X 10 CAJA X 100	Tableta	Antibiótico de amplio espectro utilizado en el tratamiento de infecciones bacterianas	Image-not-found.png	0.3040	0.0000	{"BLISTER": [10, 7.0], "CAJA": [100, 70.0]}	Tetraciclina	70	f	2	0.5700	normal	500 mg	Inhibe la síntesis de proteínas en las bacterias, impidiendo su crecimiento y reproducción
169	VITAMINAS PARA DIABETICOS CAJA X 30  BLIST X 10 GELCAPS	GELCAPS	Suplemento de vitaminas para diabéticos	Image-not-found.png	1.5380	0.0000	{"CAJA": [30, 75.0], "BLISTER": [10, 25.0]}	Vitaminas	40	f	2	0.3800	normal	30 cápsulas por caja, 10 cápsulas por blíster	Suplemento vitamínico para personas con diabetes
173	ZINC 20 MG CAJA X 100  BLIST X 10 TAB CAPLIN	Tableta	Suplemento dietético para prevenir deficiencia de zinc	Image-not-found.png	0.2500	0.0000	{"CAJA": [100, 40.0], "BLISTER": [10, 4.0]}	Zinc	50	f	2	0.3800	normal	20 mg	Suplemento mineral
199	CENTRUM SILVER CAJA X 60 CAPS	Cápsulas	Suplemento vitamínico y mineral para adultos mayores	Image-not-found.png	30.0000	0.0000	{"CAJA": [1, 80.0]}	Vitaminas y minerales	1	f	6	0.6300	normal	Tomar 1 cápsula al día	Suplemento nutricional
167	VIROGRIP NF LIMON POLVO PM X 24 SOBRES	Polvo para preparar solución oral	Tratamiento sintomático del resfriado común y la gripe	Image-not-found.png	3.1300	0.0000	{"CAJA": [24, 120.0], "SOBRE": [1, 5.0]}	Paracetamol, Fenilefrina, Clorfenamina	12	f	2	0.3700	normal	1 sobre cada 6 horas	Analgésico, descongestionante nasal, antihistamínico
168	VITAMINA K AMPOLLA SELEC	Ampolla	Suplemento de vitamina K para tratar deficiencias o trastornos de coagulación	Image-not-found.png	4.3000	0.0000	{"AMPOLLA": [1, 8.0]}	Vitamina K	7	f	2	0.4600	normal	La dosis recomendada varía según la condición a tratar, consultar con un profesional de la salud	Ayuda en la coagulación de la sangre
180	ANADENT CAJA  X 100 BLIST X 4	Tabletas	Analgésico y antiinflamatorio	Image-not-found.png	0.3250	0.0000	{"CAJA": [100, 56.25], "BLISTER": [4, 2.25]}	Diclofenaco	396	f	6	0.4200	normal	Según indicación médica	Alivia el dolor y reduce la inflamación
200	CITRATO DE POTASIO Y MAGNESIO CAJA X 60 CAPS	Cápsulas	Suplemento de citrato de potasio y magnesio	Image-not-found.png	65.0000	0.0000	{"CAJA": [1, 110.0]}	Citrato de potasio, citrato de magnesio	1	f	6	0.4100	normal	Tomar 1 cápsula al día	Suplemento mineral
183	ARTRIBION FORTE FCO X 100 TABS	Tabletas	Analgésico y antiinflamatorio	Image-not-found.png	20.3000	0.0000	{"FRASCO": [1, 40.0]}	Diclofenaco, paracetamol y vitaminas	1	f	6	0.4900	normal	Según indicación médica	Alivia el dolor y reduce la inflamación
184	ARTRIBION VITAMINADO BLIST X 4 CAJA X 20 SOBRES	Sobres	Suplemento alimenticio	Image-not-found.png	0.8120	0.0000	{"BLISTER": [4, 5.0], "CAJA": [20, 25.0]}	Glucosamina, condroitina, vitaminas y minerales	88	f	6	0.3500	normal	Según indicación médica	Ayuda a mantener la salud de las articulaciones y aporta nutrientes esenciales
188	BROMHEXINA 120 ML JBE SELEC (EXIFLEM)	Jarabe	Mucolítico y expectorante	Image-not-found.png	7.0000	0.0000	{"JARABE": [1, 12.0]}	Bromhexina	6	f	6	0.4200	normal	4 mg/ml	Facilita la eliminación de secreciones bronquiales
190	BUSCAPINA COMPUESTA BLISTER X 12 CAJA X 24	Tableta	Analgésico y antiespasmódico	Image-not-found.png	0.0360	0.0000	{"BLISTER": [12, 2.5], "CAJA": [24, 5.0]}	Butilhioscina y paracetamol	396	f	6	0.8300	normal	10 mg y 500 mg	Alivia el dolor abdominal y los espasmos intestinales
201	COBALEX 10 ML  VIAL VIJOSA (CIANOCOBALAMINA)	Solución inyectable	Suplemento de cianocobalamina (vitamina B12)	Image-not-found.png	8.6600	0.0000	{"VIAL": [1, 17.0]}	Cianocobalamina	8	f	6	0.4900	normal	Según indicación médica	Suplemento vitamínico
194	CARDIOASPIRINA 81 MG X 30 TAB FCO	Tableta	Antiagregante plaquetario	Image-not-found.png	32.3000	0.0000	{"TABLETA": [1, 65.0], "FRASCO": [1, 65.0]}	Ácido acetilsalicílico	4	f	6	0.5000	normal	81 mg	Prevención de eventos cardiovasculares
198	CENTRUM MUJER  CAJA X 60	Tabletas recubiertas	Suplemento vitamínico y mineral para mujeres	Image-not-found.png	30.3000	0.0000	{"CAJA": [1, 80.0]}	Vitaminas y minerales	1	f	6	0.6200	normal	Tomar 1 tableta al día	Suplemento nutricional
206	COLITRAN BLIST X 10 CAJA X 100	Tabletas	Tratamiento de la colitis	Image-not-found.png	0.1950	0.0000	{"BLISTER": [10, 3.2], "CAJA": [100, 32.0]}	No especificado	1650	f	6	0.3900	normal	Según indicación médica	Antiinflamatorio
219	DEXKETOPROFENO+NEUROTROPA KIT	Kit	Analgésico y antiinflamatorio	Image-not-found.png	9.3000	0.0000	{"KIT": [1, 20.0]}	Dexketoprofeno + Neurotrofina	8	f	6	0.5400	normal	Según indicación médica	Analgésico y antiinflamatorio
209	CRANBERRY X 100 VESA	Cápsulas	Suplemento dietético	Image-not-found.png	35.0000	0.0000	{"CAJA": [1, 68.0]}	Extracto de arándano rojo	1	f	6	0.4900	normal	Según indicación médica	Antioxidante y protector urinario
210	CROMATONBIC FERRO CAJA X 10 AMP BEBIBLES	Ampollas bebibles	Suplemento de hierro y vitaminas	Image-not-found.png	8.5300	0.0000	{"CAJA": [10, 142.0]}	Hierro y vitaminas	10	f	6	0.4000	normal	Según indicación médica	Suplemento nutricional
213	DAYAMINERAL FCO 240 ML	Solución oral	Suplemento mineral	Image-not-found.png	15.3000	0.0000	{"FRASCO": [1, 110.0]}	Minerales	1	f	6	0.8600	normal	Según indicación médica	Suplemento nutricional
211	CURITAS CAJA X 100 CUREFAST	Curitas adhesivas	Cubrir heridas y cortaduras	Image-not-found.png	0.0000	0.0000	{"CAJA": [100, 17.0]}	No aplica	0	f	6	1.0000	normal	Según necesidad	Protección de heridas
217	DEKA C JBE NIÑO  240 ML	Jarabe	Suplemento vitamínico para niños	Image-not-found.png	10.3000	0.0000	{"JARABE": [1, 20.0]}	Vitamina C	1	f	6	0.4900	normal	Según indicación médica	Suplemento vitamínico
224	DICO GRIP P.M CAJA X 24 SOBRES	Sobres	Alivio de síntomas gripales en la noche	Image-not-found.png	2.0800	0.0000	{"CAJA": [24, 96.0], "SOBRE": [1, 4.0]}	Paracetamol + Clorfenamina	15	f	6	0.4800	normal	Según indicación médica	Alivio de síntomas gripales
231	DOLOVITANERVO PIERSAN  BLIST X 10  CAJA X  150	Tabletas	Analgésico y neuroprotector	Image-not-found.png	0.0600	0.0000	{"BLISTER": [10, 1.2], "CAJA": [150, 18.0]}	Vitaminas B1, B6, B12, Ácido fólico	1220	f	6	0.5000	normal	Según indicación médica	Alivio del dolor y protección del sistema nervioso
254	HIDRAVIDA JAMAICA	Jarabe	Suplemento vitamínico	Image-not-found.png	11.5800	0.0000	{"BOTE": [1, 19.0]}	Vitaminas y minerales	4	f	6	0.3900	normal	Tomar 10 ml al día	Ayuda a mantener un adecuado balance de vitaminas y minerales en el organismo
241	FLAMYDOL RETARD CAJA X 48 BLIST X 4	Comprimidos de liberación prolongada	Analgésico y antiinflamatorio de liberación prolongada	Image-not-found.png	0.4680	0.0000	{"CAJA": [48, 120.0], "BLISTER": [4, 10.0]}	Meloxicam	224	f	6	0.8100	normal	Varía según la presentación	Analgésico y antiinflamatorio no esteroideo
253	HIDRAVIDA FRESA	Bebida	Bebida hidratante sabor a fresa	Image-not-found.png	11.5400	0.0000	{"BOTE": [1, 19.0]}	No aplica	3	f	6	0.3900	normal	Según necesidad	Hidratación y aporte de electrolitos
160	TRIPLE C FLUID CAJA X 30 SOBRES (ACETIL,PIRIDOXINA, VIT C)	Sobres	Suplemento vitamínico	Image-not-found.png	8.2980	0.0000	{"CAJA": [30, 450.0], "SOBRE": [1, 15.0]}	['Acetilcisteína', 'Piridoxina', 'Vitamina C']	7	f	2	0.4500	normal	1 sobre al día	Ayuda a fortalecer el sistema inmunológico y prevenir resfriados
165	VIRO GRIP PM SOBRE X 2 GEL CAP CAJA X 24	Cápsula	Alivio de los síntomas de gripa y resfriado, como fiebre, dolor de cabeza, congestión nasal y dolor de cuerpo	Image-not-found.png	1.4050	0.0000	{"SOBRE": [2, 5.0], "CAJA": [24, 60.0]}	Paracetamol, Clorfenamina, Fenilefrina	114	f	2	0.4400	normal	Tomar 1 cápsula cada 6 horas, no exceder de 4 cápsulas en 24 horas	Analgésico, antipirético, antihistamínico y descongestionante nasal
170	WARFARINA 5 MG BLIST X 10	Tableta	Anticoagulante utilizado para prevenir la formación de coágulos sanguíneos y reducir el riesgo de accidentes cerebrovasculares y ataques cardíacos	Image-not-found.png	0.1200	0.0000	{"BLISTER": [10, 2.5]}	Warfarina	200	f	2	0.5200	normal	5 mg	Anticoagulante
181	ARTRI AJO KING  X 100 TAB	Tabletas	Suplemento alimenticio	Image-not-found.png	50.3000	0.0000	{"TABLETA": [1, 85.0]}	Ajo	1	f	6	0.4100	normal	1 tableta al día	Ayuda a mantener la salud cardiovascular
185	BARMICIL  TUBO 40 GRS	Crema	Antibiótico y antiinflamatorio tópico	Image-not-found.png	13.0000	0.0000	{"TUBO": [1, 26.0]}	Betametasona y gentamicina	6	f	6	0.5000	normal	Aplicar en la zona afectada según indicación médica	Combate infecciones y reduce la inflamación en la piel
197	CENTRUM KIDS	Tabletas masticables	Suplemento vitamínico y mineral para niños	Image-not-found.png	30.3000	0.0000	{"CAJA": [1, 80.0]}	Vitaminas y minerales	1	f	6	0.6200	normal	Según indicación del pediatra	Suplemento nutricional
204	COLAGENO+ACIDO HIALURONICO VESA FCO X 100 GELCAPS	Cápsulas	Suplemento de colágeno y ácido hialurónico	Image-not-found.png	40.3000	0.0000	{"FRASCO": [1, 68.0]}	Colágeno, ácido hialurónico	1	f	6	0.4100	normal	Tomar 1 cápsula al día	Suplemento nutricional
207	COMPLEBEN INYECTADO CAJA X 7	Inyectable	Complemento vitamínico	Image-not-found.png	20.3000	0.0000	{"CAJA": [1, 68.0]}	Vitaminas del complejo B	1	f	6	0.7000	normal	Según indicación médica	Suplemento nutricional
212	CYTOTTEC CAJA X 28 TAB BLIST X 14 TAB SUBLINGUAL	Tabletas sublinguales	Inducción del parto y tratamiento de úlceras gástricas	Image-not-found.png	14.3070	0.0000	{"CAJA": [28, 700.0], "BLISTER": [14, 350.0]}	Misoprostol	28	f	6	0.4300	normal	Según indicación médica	Prostaglandina sintética
215	DEKA C INFANTIL  CAJA X3 AMPOLLAS	Ampollas	Suplemento vitamínico	Image-not-found.png	15.3000	0.0000	{"CAJA": [1, 29.0]}	Vitamina C	3	f	6	0.4700	normal	Según indicación médica	Suplemento vitamínico
221	DIBETES FCO X 100 TABS	Tabletas	Suplemento dietético	Image-not-found.png	20.3000	0.0000	{"FRASCO": [1, 40.0]}	Vitaminas y minerales	1	f	6	0.4900	normal	Según indicación médica	Suplemento dietético
218	DENGUINITA NIÑOS CAJA X 100 BLIST X 10	Tabletas	Antipirético y analgésico para niños	Image-not-found.png	0.0550	0.0000	{"CAJA": [100, 10.0], "BLISTER": [10, 1.0]}	Paracetamol	1310	f	6	0.4500	normal	Según peso y edad del niño	Antipirético y analgésico
236	ENTEROGERMINA AMP 2 BILLONES BEB 5 ML CJ X 20	Ampollas para bebida	Restaurador de la flora intestinal	Image-not-found.png	10.5500	0.0000	{"AMPOLLA": [1, 20.0]}	Bacillus clausii	20	f	6	0.4700	normal	2 billones de esporas	Restaurador de la flora intestinal
226	DOLO NEUROBION  CAJA X 120 BLIST X 5	Tabletas	Suplemento vitamínico	Image-not-found.png	0.4420	0.0000	{"CAJA": [120, 96.0], "BLISTER": [5, 4.0]}	Vitaminas B1, B6, B12	865	f	6	0.4500	normal	Según indicación médica	Mejora del funcionamiento del sistema nervioso
227	DOLO NEUROBION FORTE DC	Tabletas	Analgésico y antiinflamatorio	Image-not-found.png	45.3000	0.0000	{"CAJA": [1, 82.0]}	Diclofenaco, Vitaminas B1, B6, B12	3	f	6	0.4500	normal	Según indicación médica	Alivio del dolor y reducción de la inflamación
233	DORIVAL CAJA X 60 GRAGEAS BLIST X 12 TAB	Grageas	Analgésico y antiinflamatorio	Image-not-found.png	0.0550	0.0000	{"CAJA": [60, 10.0], "BLISTER": [12, 2.0]}	Ibuprofeno	900	f	6	0.6700	normal	Según indicación médica	Alivio del dolor y reducción de la inflamación
248	GINSENG ESENCIAL FCO 75 ML	Frasco	Tónico energizante	Image-not-found.png	15.0000	0.0000	{"FRASCO": [1, 26.0]}	Ginseng	1	f	6	0.4200	normal	Según indicación médica	Aumento de la vitalidad y resistencia
257	HIDRAVIDA MORA -AZUL	Jarabe	Suplemento vitamínico	Image-not-found.png	11.4400	0.0000	{"BOTE": [1, 19.0]}	Vitaminas y minerales	4	f	6	0.4000	normal	Tomar 10 ml al día	Ayuda a mantener un adecuado balance de vitaminas y minerales en el organismo
250	GRANEODIN MIEL LIMON CAJA X 24 PASTILLAS	Pastillas	Para el alivio de la garganta irritada con sabor a miel y limón	Image-not-found.png	0.0510	0.0000	{"CAJA": [24, 3.0]}	No especificado	624	f	6	0.5900	normal	Chupar una pastilla cada 4 horas	Alivio del dolor de garganta
252	HIDRAVIDA COCO	Bebida	Bebida hidratante sabor a coco	Image-not-found.png	11.3200	0.0000	{"BOTE": [1, 19.0]}	No aplica	3	f	6	0.4000	normal	Según necesidad	Hidratación y aporte de electrolitos
258	HIDRAVIDA NARANJA-MANDARINA	Jarabe	Suplemento vitamínico	Image-not-found.png	11.5800	0.0000	{"BOTE": [1, 19.0]}	Vitaminas y minerales	3	f	6	0.3900	normal	Tomar 10 ml al día	Ayuda a mantener un adecuado balance de vitaminas y minerales en el organismo
164	VIRO GRIP GRIPE Y TOS JBE 120 ML	Jarabe	Tratamiento de la gripe y la tos	Image-not-found.png	19.8600	0.0000	{"JARABE": [1, 0.0]}	Paracetamol, Clorfenamina, Fenilefrina	5	f	2	0.0000	normal	Tomar 10 ml cada 6 horas	Alivio de los síntomas de la gripe y la tos
161	UNAL (ANTICOCEP MENS) INYEC PIERSAN	Inyectable	Anticoagulante utilizado en la prevención y tratamiento de trombosis venosa profunda, embolias pulmonares y tromboembolismos arteriales	Image-not-found.png	19.9400	0.0000	{"AMPOLLA": [1, 36.0]}	Heparina sódica	2	f	2	0.4500	normal	La dosis y duración del tratamiento deben ser indicadas por un profesional de la salud	Anticoagulante
178	ALGODÓN ROLLO LIBRA	Rollo	Para uso en curaciones y limpieza de heridas	Image-not-found.png	25.3000	0.0000	{"BOLSA": [1, 45.0]}	No aplica	1	f	6	0.4400	normal	Según necesidad	Absorbe líquidos y protege la piel
177	ACETAMINOFEN MK JBE NIÑOS 120 MG X 60 ML	Jarabe	Analgésico y antipirético para niños	Image-not-found.png	18.3000	0.0000	{"JARABE": [1, 32.0]}	Acetaminofen	2	f	6	0.4300	normal	Según indicación médica	Reduce la fiebre y alivia el dolor en niños
247	GINCKO + NEURO CAJA X 60 BLIST X 10	Tabletas	Para mejorar la función cerebral y nerviosa	Image-not-found.png	0.5830	0.0000	{"CAJA": [60, 56.04], "BLISTER": [10, 9.34]}	Ginkgo Biloba y vitaminas del complejo B	0	f	6	0.3800	normal	1 tableta al día	Estimulación cognitiva y nerviosa
179	ALKA  AD CAJA X 72	Tabletas efervescentes	Antiácido y analgésico	Image-not-found.png	0.5600	0.0000	{"CAJA": [72, 144.0], "BOLSA": [1, 2.0]}	Aluminio hidróxido y magnesio hidróxido	41	f	6	0.7200	normal	Según indicación médica	Neutraliza el ácido estomacal y alivia el dolor
239	FIBRA GUMMY 3MG VESA FCO X 40 GOMITAS	Gomitas	Suplemento de fibra dietética	Image-not-found.png	25.3000	0.0000	{"FRASCO": [1, 55.0]}	Fibra	1	f	6	0.5400	normal	3 mg por gomita	Suplemento dietético
187	BISMUTO X 100 U	Tableta	Antiácido y gastroprotector	Image-not-found.png	0.2000	0.0000	{"BOLSA": [1, 0.75]}	Bismuto	96	f	6	0.7300	normal	100 mg	Protección de la mucosa gástrica
191	BUTAZOLIDINA BLIS X 10 CAJA X 100 SANDOZ	Tableta	Antiinflamatorio no esteroideo	Image-not-found.png	0.2500	0.0000	{"BLIS": [10, 10.0], "CAJA": [100, 100.0]}	Fenilbutazona	90	f	6	0.7500	normal	100 mg	Reduce la inflamación y el dolor
192	CALCIO + MAGNESIO VESA FCO X 100 GELCAPS	Cápsula	Suplemento dietético	Image-not-found.png	38.3000	0.0000	{"FRASCO": [1, 68.0]}	Calcio y magnesio	1	f	6	0.4400	normal	500 mg y 250 mg	Fortalece los huesos y músculos
196	CENTRUM HOMBRE CAJA X 60	Tabletas recubiertas	Suplemento vitamínico y mineral para hombres	Image-not-found.png	30.3000	0.0000	{"CAJA": [1, 80.0]}	Vitaminas y minerales	1	f	6	0.6200	normal	Tomar 1 tableta al día	Suplemento nutricional
203	COLAGENO FCO X 100 TABS	Tabletas	Suplemento de colágeno	Image-not-found.png	20.3000	0.0000	{"FRASCO": [1, 40.0]}	Colágeno	0	f	6	0.4900	normal	Tomar 1 tableta al día	Suplemento nutricional
208	CONMEL (DIPIRONA) CAJA X 100 BLISTER X 4	Tabletas	Analgésico y antipirético	Image-not-found.png	0.1500	0.0000	{"CAJA": [100, 28.25], "BLISTER": [4, 1.13]}	Dipirona	356	f	6	0.4700	normal	Según indicación médica	Analgésico y antipirético
220	DIAZEPAN 10 MGS MK BLIS X 10 CAJA X 100	Tabletas	Ansiolítico y sedante	Image-not-found.png	0.1600	0.0000	{"BLIS": [10, 4.4], "CAJA": [100, 44.0]}	Diazepam	550	f	6	0.6400	normal	Según indicación médica	Ansiolítico y sedante
230	DOLO TETRAVIT KIT	Tabletas	Suplemento vitamínico	Image-not-found.png	9.3000	0.0000	{"KIT": [1, 49.0]}	Vitaminas A, D, E, K	2	f	6	0.8100	normal	Según indicación médica	Mejora del estado nutricional
234	DULSITOS JBE 120 ML	Jarabe	Antitusivo y expectorante	Image-not-found.png	16.3000	0.0000	{"JARABE": [1, 29.0]}	Dextrometorfano, Guaifenesina	2	f	6	0.4400	normal	Según indicación médica	Alivio de la tos y facilita la eliminación de mucosidad
205	COLECTOR DE HECES GRANDE	Dispositivo	Para la recolección de muestras de heces	Image-not-found.png	0.0000	0.0000	{"BOTE": [1, 4.0]}	No especificado	0	f	6	1.0000	normal	Según indicación médica	Dispositivo médico
240	FLAMYDOL AMPOLLA	Ampolla	Analgésico y antiinflamatorio	Image-not-found.png	3.0000	0.0000	{"AMPOLLA": [1, 7.0]}	Meloxicam	7	f	6	0.5700	normal	Varía según la presentación	Analgésico y antiinflamatorio no esteroideo
245	GASA POR UNIDAD BOLSA X 100	Bolsa	Para curaciones y limpieza de heridas	Image-not-found.png	0.0030	0.0000	{"BOLSA": [100, 0.5]}	No aplica	6000	f	6	0.4000	normal	Según necesidad	Absorción de líquidos y protección de heridas
246	GENOGASTRIL  CAJA X 2 FCOS  60 CAPS	Cápsulas	Para problemas gastrointestinales	Image-not-found.png	50.0000	0.0000	{"CAJA": [1, 95.0]}	No especificado	1	f	6	0.4700	normal	Según indicación médica	Regulación del sistema digestivo
255	HIDRAVIDA LIMA LIMON	Jarabe	Suplemento vitamínico	Image-not-found.png	11.5800	0.0000	{"BOTE": [1, 19.0]}	Vitaminas y minerales	4	f	6	0.3900	normal	Tomar 10 ml al día	Ayuda a mantener un adecuado balance de vitaminas y minerales en el organismo
256	HIDRAVIDA MARACUYA	Jarabe	Suplemento vitamínico	Image-not-found.png	11.5800	0.0000	{"BOTE": [1, 19.0]}	Vitaminas y minerales	3	f	6	0.3900	normal	Tomar 10 ml al día	Ayuda a mantener un adecuado balance de vitaminas y minerales en el organismo
162	UNIACT KIT (MEDROXIPROGESTERONA 150M) CA	Inyección	Anticonceptivo hormonal inyectable de uso mensual	Image-not-found.png	33.3000	0.0000	{"KIT": [1, 60.0]}	Medroxiprogesterona	2	f	2	0.4500	normal	150 mg	Inhibe la ovulación y modifica el moco cervical para dificultar el paso de los espermatozoides
171	ZETAWIN FORTE 1G CAJA X 20 TAB BLIST X 10	Tableta	Analgésico y antipirético	Image-not-found.png	0.3340	0.0000	{"CAJA": [20, 11.4], "BLISTER": [10, 5.7]}	Paracetamol	90	f	2	0.4100	normal	1 tableta cada 6 horas	Alivio del dolor y reducción de la fiebre
172	ZINC 15 MG GEL BLISTER X 10  CAJA X 50	Gel Blister	Suplemento de zinc	Image-not-found.png	0.3950	0.0000	{"BLISTER": [10, 7.0], "CAJA": [50, 35.0]}	Zinc	60	f	2	0.4400	normal	15 mg	Suplemento mineral
189	BRONCUROL JBE 120 ML	Jarabe	Antitusivo y broncodilatador	Image-not-found.png	12.3000	0.0000	{"JARABE": [1, 30.0]}	Ambroxol	3	f	6	0.5900	normal	15 mg/5 ml	Alivia la tos y facilita la respiración
166	VIROGRIP NF LIMON POLVO AM X 24 SOBRES	Polvo para preparar solución oral	Tratamiento de los síntomas del resfriado común y la gripe	Image-not-found.png	3.0470	0.0000	{"CAJA": [24, 120.0], "SOBRE": [1, 5.0]}	Paracetamol, Fenilefrina, Clorfenamina	24	f	2	0.3900	normal	1 sobre cada 6 horas	Analgésico, Descongestionante nasal, Antihistamínico
186	BETA 2 PAN KIT AMPOLLA	Ampolla	Broncodilatador	Image-not-found.png	37.3000	0.0000	{"KIT": [1, 63.0]}	Salbutamol	5	f	6	0.4100	normal	2.5 mg/2.5 ml	Relajante de la musculatura lisa de las vías respiratorias
216	DEKA C JBE  ADULTO 240 ML	Jarabe	Suplemento vitamínico	Image-not-found.png	8.3000	0.0000	{"JARABE": [1, 20.0]}	Vitamina C	1	f	6	0.5900	normal	Según indicación médica	Suplemento vitamínico
225	DIPIRONA+DEXAMETASONA X 3 DOSIS	Solución inyectable	Analgésico y antiinflamatorio	Image-not-found.png	20.3000	0.0000	{"CAJA": [1, 40.0]}	Dipirona, Dexametasona	1	f	6	0.4900	normal	Según indicación médica	Alivio del dolor y reducción de la inflamación
235	ENANTYUM 25 MG CAJA X 10 TABLETAS	Tabletas	Analgésico y antiinflamatorio	Image-not-found.png	7.0000	0.0000	{"CAJA": [1, 12.0]}	Dexketoprofeno	15	f	6	0.4200	normal	25 mg	Analgésico y antiinflamatorio no esteroideo
237	ESPASMOFIN NF (COLICOS) CAJA X 110 SOBRES	Sobres	Alivio de cólicos y espasmos intestinales	Image-not-found.png	1.1800	0.0000	{"CAA": [110, 220.0], "SOBRE": [1, 2.0]}	Hioscina-N-butilbromuro	28	f	6	0.0000	normal	Varía según la presentación	Antiespasmódico
251	HEMOBEX 10 ML HIGADO CRUDO + COMPLEJO B	Gotas	Suplemento vitamínico para el hígado y complejo B	Image-not-found.png	5.3000	0.0000	{"JARABE": [1, 10.0]}	Hígado crudo y vitaminas del complejo B	11	f	6	0.4700	normal	Según indicación médica	Mejora la función hepática y aporta energía
261	HIGAVYT 5 10 ML EXTRTACTO DE HIGADO	Gotas	Suplemento de extracto de hígado	Image-not-found.png	5.3000	0.0000	{"FRASCO": [1, 10.0]}	Extracto de hígado	11	f	6	0.4700	normal	Tomar 10 gotas al día	Ayuda a mantener la salud del hígado
262	IBUPROFENO FORTE 800 MGS CAJA X 100 BLIST X 10	Tabletas	Analgésico y antiinflamatorio	Image-not-found.png	0.0740	0.0000	{"CAJA": [100, 20.0], "BLISTER": [10, 2.0]}	Ibuprofeno	540	f	6	0.6300	normal	Según indicación médica	Alivia el dolor y reduce la inflamación
265	LIMPIA COLON FCO X 100 TABS	Tabletas	Suplemento dietético para limpieza del colon	Image-not-found.png	20.3000	0.0000	{"FRASCO": [1, 40.0]}	No especificado	1	f	6	0.4900	normal	100 tabletas	Suplemento dietético
263	LANSOPRAZOL 30 MG BLIST X 10 CAJA X 50   INFASA	Cápsulas	Inhibidor de la bomba de protones	Image-not-found.png	1.1400	0.0000	{"BLISTER": [10, 19.0], "CAJA": [50, 95.0]}	Lansoprazol	50	f	6	0.4000	normal	Tomar 1 cápsula al día	Reduce la producción de ácido en el estómago
264	LECHE DE MAGNESIA PHILIPS 60 ML	Líquido	Laxante y antiácido	Image-not-found.png	12.3000	0.0000	{"BOTE": [1, 23.0]}	Hidróxido de magnesio	3	f	6	0.4700	normal	60 ml	Laxante y neutralizante de ácido estomacal
266	LOFENAK (DICLO SOD 100 MGS) CAJA X 50 B BLIST X 10	Tabletas	Antiinflamatorio y analgésico	Image-not-found.png	0.3800	0.0000	{"CAJA": [50, 35.0], "BLISTER": [10, 7.0]}	Diclofenaco sódico	110	f	6	0.4600	normal	100 mg	Antiinflamatorio y analgésico
274	NAUSEOL BLISTER X 10 TAB BONIN CAJA X 500	Tableta	Tratamiento de las náuseas	Image-not-found.png	0.0200	0.0000	{"BLISTER": [10, 0.9], "CAJA": [500, 45.0]}	Dimenhidrinato	1430	f	6	0.7800	normal	1 tableta cada 4-6 horas según sea necesario	Antihistamínico y antiemético
267	LOMBRINIÑOS CAJA X 40 SOBRES	Sobres	Antiparasitario para lombrices intestinales	Image-not-found.png	1.0000	0.0000	{"CAJA": [40, 70.0], "SOBRE": [1, 1.75]}	No especificado	14	f	6	0.4300	normal	40 sobres	Antiparasitario
268	LORATADINA 10MG GEL CAPS CAJA X 100 BLIST X 10	Cápsulas	Antihistamínico para alergias	Image-not-found.png	0.6500	0.0000	{"CAJA": [100, 110.0], "BLISTER": [10, 11.0]}	Loratadina	0	f	6	0.4100	normal	10 mg	Antihistamínico
271	MENOESTROGEN FRASCO X 30 TAB	Tabletas	Terapia hormonal para menopausia	Image-not-found.png	26.0000	0.0000	{"FRASCO": [1, 50.0]}	Estrógenos	1	f	6	0.4800	normal	30 tabletas	Terapia hormonal
269	MARIGUANOL BOTE	Crema	Analgésico tópico	Image-not-found.png	5.3000	0.0000	{"BOTE": [1, 10.0]}	Cannabis	1	f	6	0.4700	normal	No especificado	Analgésico tópico
270	MELATONINA 5MGS FCO X 100 BOLSA X 10 VESA	Tabletas	Suplemento para regular el sueño	Image-not-found.png	3.8000	0.0000	{"FRASCO": [1, 13.0], "BOLSA": [10, 130.0]}	Melatonina	12	f	6	0.7100	normal	5 mg	Regulador del sueño
272	MENTOL DAVIS MUESTRA	Crema	Analgésico tópico	Image-not-found.png	1.6600	0.0000	{"DISPENSADOR": [1, 3.5]}	Mentol	6	f	6	0.5300	normal	Muestra	Analgésico tópico
273	MIGRADORIXINA BLIST X 10 CAJA X 100	Tableta	Tratamiento de la migraña	Image-not-found.png	0.0800	0.0000	{"BLISTER": [10, 4.7], "CAJA": [100, 47.0]}	Sumatriptán	1220	f	6	0.8300	normal	1 tableta cada vez que se presente la migraña	Agonista selectivo de los receptores de serotonina
276	NEOBOL SPRAY 30 ML	Spray	Tratamiento de quemaduras y heridas leves	Image-not-found.png	45.3000	0.0000	{"SPRAY": [1, 77.0]}	Dexpantenol	2	f	6	0.4100	normal	Aplicar sobre la zona afectada 2-3 veces al día	Cicatrizante y regenerador de la piel
275	NEOBOL CREMA 30 GRS	Crema	Tratamiento de quemaduras y heridas leves	Image-not-found.png	40.0000	0.0000	{"CREMA": [1, 77.0]}	Dexpantenol	1	f	6	0.4800	normal	Aplicar una capa delgada sobre la zona afectada 2-3 veces al día	Cicatrizante y regenerador de la piel
277	NEOMELUBRINA AMPOLLA 2 ML	Ampolla	Analgésico y antipirético	Image-not-found.png	2.5000	0.0000	{"AMPOLLA": [1, 8.0]}	Dipirona	19	f	6	0.6900	normal	Según prescripción médica	Inhibidor de la síntesis de prostaglandinas
278	NEOMELUBRINA CAJA X 100 BLIST X 4	Tableta	Analgésico y antipirético	Image-not-found.png	0.0620	0.0000	{"CAJA": [100, 31.25], "BLISTER": [4, 1.25]}	Dipirona	536	f	6	0.8000	normal	Según prescripción médica	Inhibidor de la síntesis de prostaglandinas
163	VIRO GRIP AM SOBRE X 2 GEL CAP CAJA X 24	Cápsulas	Alivio de los síntomas de gripa y resfriado común	Image-not-found.png	1.4050	0.0000	{"SOBRE": [2, 5.0], "CAJA": [24, 60.0]}	Paracetamol, Fenilefrina, Clorfenamina	102	f	2	0.4400	normal	Tomar 1 cápsula cada 6 horas	Analgésico, Descongestionante, Antihistamínico
244	FLUDISIN L (AMB + LORATAD) 100 ML LEGSA	Jarabe	Mucolítico y antihistamínico	Image-not-found.png	25.4500	0.0000	{"CAJA": [1, 39.0]}	Ambroxol y loratadina	4	f	6	0.3500	normal	Varía según la presentación	Mucolítico y antihistamínico
287	PANADOL ULTRA X 52 SOBRES	Sobres de polvo	Alivio del dolor y la fiebre intensos	Image-not-found.png	1.3300	0.0000	{"CAJA": [52, 130.0], "SOBRE": [1, 2.5]}	Paracetamol, cafeína	59	f	6	0.4700	normal	1 sobre cada 4-6 horas según sea necesario	Analgésico, antipirético y estimulante
291	PILDORA DE WITT BLIST X 20 CAJA X 100	Tabletas	Suplemento vitamínico y mineral	Image-not-found.png	0.0120	0.0000	{"BLISTER": [20, 0.65], "CAJA": [100, 3.25]}	Vitaminas y minerales varios	340	f	6	0.6300	normal	1 tableta diaria	Suplemento nutricional
313	SUCRADEL CAJA X 30 SOBRES	Sobres	Suplemento dietético	Image-not-found.png	2.5000	0.0000	{"CAJA": [30, 150.0], "SOBRE": [1, 5.0]}	Sucralosa	39	f	6	0.5000	normal	1 sobre al día	Edulcorante sin calorías
297	PULMO GRIP KIT	Kit	Para aliviar la tos y los síntomas del resfriado común.	Image-not-found.png	9.0000	0.0000	{"KIT": [1, 19.0]}	Paracetamol, Fenilefrina, Dextrometorfano	2	f	6	0.5300	normal	Seguir las instrucciones del fabricante incluidas en el empaque.	Analgésico, descongestionante y antitusivo.
293	POMADA DE LA CAMPANA 19 GRS	Pomada	Para el alivio de irritaciones de la piel, quemaduras leves y picaduras de insectos.	Image-not-found.png	0.0000	0.0000	{"CREMA": [1, 13.0]}	Óxido de Zinc	0	f	6	1.0000	normal	Aplicar una capa delgada sobre la zona afectada 2-3 veces al día.	Protector y cicatrizante de la piel.
299	QG5 DUO CAJA X 2 FCOS	Cápsulas	Suplemento dietético para el alivio de la acidez estomacal y la indigestión.	Image-not-found.png	12.5000	0.0000	{"CAJA": [1, 45.0]}	Simeticona, Aluminio y Magnesio	2	f	6	0.7200	normal	Tomar 1 cápsula después de las comidas principales.	Antiflatulento y antiácido.
305	SALUPRIM TAB CAJA X 50 BLIST X 5 (TRIMETROPRIM)	Tabletas	Tratamiento de infecciones bacterianas	Image-not-found.png	0.9000	0.0000	{"CAJA": [50, 80.0], "BLISTER": [5, 8.0]}	Trimetoprim	50	f	6	0.4400	normal	Según indicación médica	Antibiótico
306	SANA SANA POMADA LATITA DE PLASTICO	Pomada	Cicatrizante y antiséptico tópico	Image-not-found.png	3.0000	0.0000	{"FRASCO": [1, 8.0]}	Vaselina, óxido de zinc	6	f	6	0.6300	normal	Aplicar en la zona afectada según necesidad	Promueve la cicatrización y previene infecciones
309	SERTAL COMPUESTO BLIS X 10 CAJA X 200	Tabletas	Alivio del dolor y la inflamación	Image-not-found.png	0.1750	0.0000	{"BLIS": [10, 3.3], "CAJA": [200, 66.0]}	Dipirona, cafeína, meclofenamato	1930	f	6	0.4700	normal	Según indicación médica	Analgésico y antiinflamatorio
312	SIXTYNINE (SILDEN X 100 MGS) CAJA X 30 SOB Y CART X 4	Tabletas	Tratamiento de la disfunción eréctil	Image-not-found.png	5.3330	0.0000	{"CAJA": [1, 15.0]}	Sildenafil	20	f	6	0.6400	normal	Según indicación médica	Vasodilatador
317	SUKROL TAB  CAJA X 100	Tabletas	Suplemento vitamínico	Image-not-found.png	0.2000	0.0000	{"CAJA": [100, 80.0]}	Vitaminas y minerales	100	f	6	0.7500	normal	1 tableta al día	Aporte de nutrientes esenciales
319	TE CHUPA GRASA CAJA X 30	Cápsulas	Suplemento dietético	Image-not-found.png	35.0000	0.0000	{"CAJA": [1, 57.0]}	Extracto de té verde, L-carnitina	1	f	6	0.3900	normal	2 cápsulas al día	Quemador de grasa
324	TE LIMON + JENGIBRE CAJA X 20 SOBRES	Sobres	Infusión para mejorar la digestión y aliviar malestares estomacales	Image-not-found.png	0.7500	0.0000	{"CAJA": [20, 30.0], "SOBRE": [1, 1.5]}	Limón, Jengibre	11	f	6	0.5000	normal	1 sobre después de las comidas	Digestivo y antiinflamatorio
318	TE ANTIGRIPAL CAJA X 20 SOBRES	Sobres	Tratamiento para la gripe	Image-not-found.png	0.0000	0.0000	{"CAJA": [20, 20.0], "SOBRE": [1, 1.0]}	Paracetamol, fenilefrina, clorfenamina	0	f	6	1.0000	normal	1 sobre cada 6 horas	Analgésico, descongestionante, antihistamínico
327	TE PARA LA DIABETES CAJA X 20 SOB VIDA	Sobres	Infusión para ayudar a controlar los niveles de azúcar en sangre en personas con diabetes	Image-not-found.png	0.7500	0.0000	{"CAJA": [20, 40.0], "SOBRE": [1, 2.0]}	Hierbas especiales para la diabetes	9	f	6	0.6300	normal	1 sobre antes de cada comida	Regulador de la glucosa
328	TE PARA LA NOCHE CAJA X 20 SOBRES	Sobres	Infusión para promover el sueño y mejorar la calidad del descanso nocturno	Image-not-found.png	0.5000	0.0000	{"CAJA": [20, 30.0], "SOBRE": [1, 1.5]}	Hierbas relajantes	13	f	6	0.6700	normal	1 sobre antes de dormir	Sedante y relajante
332	TE RENAL CAJA X 20 SOBRES	Sobres	Infusión para mejorar la función renal y prevenir la formación de cálculos renales	Image-not-found.png	0.6000	0.0000	{"CAJA": [20, 30.0], "SOBRE": [1, 1.5]}	Hierbas diuréticas y depurativas	17	f	6	0.6000	normal	1 sobre al día	Diurético y protector renal
333	TE TILO CAJA X 20 SOBRES	Sobres	Infusión para calmar los nervios y conciliar el sueño	Image-not-found.png	0.5000	0.0000	{"CAJA": [20, 30.0], "SOBRE": [1, 1.5]}	Tilo	26	f	6	0.6700	normal	1 sobre en agua caliente antes de dormir	Sedante y relajante
335	TERABIOL LANCASCO AMPIC+SULBACTAN) FCO X 70 ML	Solución inyectable	Antibiótico de amplio espectro	Image-not-found.png	25.3000	0.0000	{"FRASCO": [1, 50.0]}	Ampicilina + Sulbactam	1	f	6	0.4900	normal	Según indicación médica	Antibacteriano
337	TIAMINA 300 ANCALMO CAJA X 100	Tabletas	Suplemento de vitamina B1 para el sistema nervioso	Image-not-found.png	0.4000	0.0000	{"CAJA": [100, 100.0], "SOBRE": [1, 1.0]}	Tiamina	31	f	6	0.6000	normal	1 tableta al día	Suplemento vitamínico
338	TRAMADOL CAPSULA  CAJA X 100 BLIST X 10 MILAN	Cápsulas	Analgésico opioide para el alivio del dolor moderado a severo	Image-not-found.png	0.5500	0.0000	{"CAJA": [100, 100.0], "BLISTER": [10, 10.0]}	Tramadol	160	f	6	0.4500	normal	Según indicación médica	Analgésico
343	UNESIA 20 GRS	Crema	Tratamiento tópico para hongos en la piel	Image-not-found.png	30.0000	0.0000	{"CREMA": [1, 58.0]}	Clotrimazol	2	f	6	0.4800	normal	Aplicar una capa delgada sobre la zona afectada 2 veces al día	Antifúngico
279	NERVESSA PASTILLAS DISP  50	Tableta	Suplemento vitamínico para el sistema nervioso	Image-not-found.png	2.0600	0.0000	{"DISPENSADOR": [1, 3.5]}	Complejo B	31	f	6	0.4100	normal	1 tableta al día	Suplemento vitamínico
280	NERVOTIAMIN D SOBRE X 4 TAB CAJA X 100  ANCALMO	Tableta efervescente	Suplemento vitamínico para el sistema nervioso	Image-not-found.png	0.2320	0.0000	{"SOBRE": [4, 1.75], "CAJA": [100, 43.75]}	Tiamina (vitamina B1)	664	f	6	0.4700	normal	1 tableta al día disuelta en agua	Suplemento vitamínico
301	REUMETAMEX FORTE (NAPROXENO 86 MG)	Tabletas	Antiinflamatorio no esteroideo para el alivio del dolor y la inflamación.	Image-not-found.png	9.5000	0.0000	{"JARABE": [1, 20.0]}	Naproxeno	4	f	6	0.5300	normal	Tomar 1 tableta cada 8 horas.	Antiinflamatorio y analgésico.
308	SERAFON GUAYACOL+EUCALI) X 1000	Jarabe	Expectorante y descongestionante	Image-not-found.png	0.1250	0.0000	{"CAJA": [1000, 250.0], "SOBRE": [1, 0.25]}	Guayacol, eucalipto	580	f	6	0.5000	normal	Según indicación médica	Facilita la expulsión de mucosidad
310	SERTAL COMPUESTO X 3 DOSIS	Ampollas	Analgésico y antiespasmódico	Image-not-found.png	10.0000	0.0000	{"CAJA": [1, 20.0]}	Dipirona, cafeína, meclofenamato	4	f	6	0.5000	normal	Según indicación médica	Alivio del dolor y espasmos musculares
294	POMADA DE LA CAMPANA 35 GRS	Pomada	Para el alivio de irritaciones de la piel, quemaduras leves y picaduras de insectos.	Image-not-found.png	0.0000	0.0000	{"CREMA": [1, 22.0]}	Óxido de Zinc	0	f	6	1.0000	normal	Aplicar una capa delgada sobre la zona afectada 2-3 veces al día.	Protector y cicatrizante de la piel.
316	SUKROL NIÑO JARABE 240 ML	Jarabe	Suplemento vitamínico para niños	Image-not-found.png	12.0000	0.0000	{"JARABE": [1, 25.0]}	Vitaminas y minerales	1	f	6	0.5200	normal	Según indicación pediátrica	Aporte de nutrientes esenciales
325	TE MANZANILLA + TILO  CAJA X 20 SOBRES	Sobres	Infusión para calmar los nervios y conciliar el sueño	Image-not-found.png	0.7500	0.0000	{"CAJA": [20, 30.0], "SOBRE": [1, 1.5]}	Manzanilla, Tilo	14	f	6	0.5000	normal	1 sobre antes de dormir	Sedante y relajante
281	NEUMONIL AMPOLLA 1 ML	Ampolla	Broncodilatador para el tratamiento del asma	Image-not-found.png	4.0000	0.0000	{"AMPOLLA": [1, 10.0]}	Salbutamol	13	f	6	0.6000	normal	Según prescripción médica	Agonista de los receptores beta-2 adrenérgicos
286	PANADOL SINUS X 26 SOBRES	Sobres de polvo	Alivio de la congestión nasal y el dolor de cabeza asociados con sinusitis	Image-not-found.png	1.6600	0.0000	{"CAJA": [26, 78.0], "SOBRE": [1, 3.0]}	Paracetamol, clorfenamina, fenilefrina	13	f	6	0.4500	normal	1 sobre cada 6 horas según sea necesario	Descongestionante y analgésico
289	PEPTO BISMOL 118 ML (4 ONZ)	Suspensión oral	Alivio de la acidez estomacal, indigestión y malestar gastrointestinal	Image-not-found.png	28.0000	0.0000	{"BOTE": [1, 43.0]}	Bismuto subsalicilato	4	f	6	0.3500	normal	Según indicación médica	Protector gástrico y antidiarreico
295	PROMETEST PRUEBA DE EMBARAZO	Prueba de embarazo	Para determinar si existe un embarazo mediante la detección de la hormona hCG en la orina.	Image-not-found.png	4.5000	0.0000	{"CREMA": [1, 15.0]}	No aplica	6	f	6	0.7000	normal	Seguir las instrucciones del fabricante incluidas en el empaque.	Detecta la presencia de la hormona hCG en la orina.
300	RABANO YODADO 240 ML DRAGON	Jarabe	Suplemento dietético para el tratamiento de problemas de la tiroides.	Image-not-found.png	10.3000	0.0000	{"JARABE": [1, 18.0]}	Yodo	2	f	6	0.4300	normal	Seguir las indicaciones del médico.	Suplemento de yodo para la tiroides.
341	TRIPLE FORTE DX CAJA X 3 INYEC	Inyección	Combinación de vitaminas y minerales para fortalecer el sistema inmunológico	Image-not-found.png	5.1000	0.0000	{"CAJA": [3, 30.0]}	Vitaminas y minerales	3	f	6	0.4900	normal	Según indicación médica	Suplemento nutricional
344	UNIPULMIN ANTGRIPAL INYECTABLE	Inyectable	Tratamiento para gripa y tos	Image-not-found.png	9.3000	0.0000	{"JERINGA PRELLENADA": [1, 16.0]}	Paracetamol, Fenilefrina, Clorfenamina	4	f	6	0.4200	normal	Según indicación médica	Analgésico, Descongestionante, Antihistamínico
345	UNIPULMIN GRIPE Y TOS INYECTABLE	Inyectable	Tratamiento para gripa y tos	Image-not-found.png	9.3000	0.0000	{"JERINGA PRELLENADA": [1, 16.0]}	Paracetamol, Fenilefrina, Dextrometorfano	3	f	6	0.4200	normal	Según indicación médica	Analgésico, Descongestionante, Antitusivo
363	ZORRITONE CARAMELO BARRA CAJA X 16 TRADICIONAL	Caramelo en barra	Alivio de la tos y la irritación de garganta	Image-not-found.png	2.1900	0.0000	{"CAJA": [1, 4.5]}	Miel de abeja, extracto de eucalipto, extracto de menta	19	f	6	0.5100	normal	Chupar un caramelo cada 2-3 horas según sea necesario	Expectorante y calmante de la garganta
303	SAL DE UVAS PICOT CAJA X 50	Tabletas efervescentes	Alivio de la acidez estomacal y malestar digestivo	Image-not-found.png	0.9600	0.0000	{"CAJA": [50, 100.0], "SOBRE": [1, 2.0]}	Bicarbonato de sodio	45	f	6	0.5200	normal	1 tableta disuelta en agua después de las comidas	Neutraliza el ácido estomacal
307	SANIRENAL CAJA X 100 BLIST X 10	Tabletas	Suplemento para la salud renal	Image-not-found.png	0.0600	0.0000	{"CAJA": [100, 10.0], "BLISTER": [10, 1.0]}	Extracto de arándano, vitamina C	940	f	6	0.4000	normal	1 tableta al día	Apoyo a la función renal
329	TE PARA LA PRESION CAJA X 20 SOB VIDA	Sobres	Infusión para ayudar a controlar la presión arterial alta	Image-not-found.png	0.6000	0.0000	{"CAJA": [20, 23.0], "SOBRE": [1, 1.15]}	Hierbas especiales para la presión arterial	23	f	6	0.4800	normal	1 sobre al día	Regulador de la presión arterial
311	SHAMPOO MEDICASP 130.ML	Shampoo	Tratamiento para la caspa	Image-not-found.png	42.0000	0.0000	{"BOTE": [1, 70.0]}	Piritiona de zinc	1	f	6	0.4000	normal	Aplicar en el cuero cabelludo y masajear	Antifúngico y queratolítico
321	TE DE ALCACHOFA GN+V X 30 SOBRES	Sobres	Infusión para la digestión	Image-not-found.png	35.7200	0.0000	{"CAJA": [1, 57.0]}	Alcachofa, boldo, diente de león	1	f	6	0.3700	normal	1 sobre después de las comidas	Digestivo y depurativo
322	TE DE PIÑALIN CAJA X 30 SOBRES	Sobres	Infusión para la digestión	Image-not-found.png	35.0000	0.0000	{"CAJA": [1, 57.0]}	Piña, linaza, tamarindo	1	f	6	0.3900	normal	1 sobre después de las comidas	Digestivo y laxante suave
330	TE PARA LOS NERVIOS CAJA X 20 SOB VIDA	Sobres	Infusión para calmar los nervios y reducir la ansiedad	Image-not-found.png	0.7600	0.0000	{"CAJA": [20, 30.0], "SOBRE": [1, 1.5]}	Hierbas relajantes	7	f	6	0.4900	normal	1 sobre cada 8 horas	Ansiolítico y relajante
336	TERRAMICINA UNGÜENTO 5 GRS	Ungüento	Antibiótico tópico para infecciones oculares	Image-not-found.png	15.0000	0.0000	{"CREMA": [1, 33.0]}	Clorhidrato de oxitetraciclina	2	f	6	0.5500	normal	Aplicar en el ojo afectado según indicación médica	Antibacteriano
339	TRES TOROS  CAJA X 10 AMPOLLAS VIAL BEBIBLE	Ampollas bebibles	Suplemento energizante y revitalizante	Image-not-found.png	2.0000	0.0000	{"CAJA": [10, 40.0]}	Vitaminas y minerales	10	f	6	0.5000	normal	1 ampolla al día	Suplemento nutricional
350	VITAL FUERTE 10 AMP BEB 10 ML	Ampollas bebibles	Suplemento vitamínico	Image-not-found.png	3.1800	0.0000	{"AMPOLLA": [1, 5.8]}	Complejo B	12	f	6	0.4500	normal	Tomar 1 ampolla al día	Suplemento vitamínico
362	ZORRITONE CARAMELO BARRA CAJA X 16 MIEL LIMON	Caramelos	Suplemento energético	Image-not-found.png	2.1800	0.0000	{"CAJA": [1, 4.5]}	Vitaminas y minerales	31	f	6	0.5200	normal	Según indicación médica	Suplemento energético
282	NEURO NERVIOL CAJA X 10 AMPOLLAS	Ampolla	Suplemento vitamínico para el sistema nervioso	Image-not-found.png	30.0000	0.0000	{"CAJA": [1, 55.0]}	Complejo B	1	f	6	0.4500	normal	Según prescripción médica	Suplemento vitamínico
285	PANADOL MULTISINTOMAS X 24 SOBRES	Sobres de polvo	Alivio de múltiples síntomas como dolor de cabeza, fiebre, congestión nasal y dolor de garganta	Image-not-found.png	1.6700	0.0000	{"CAJA": [24, 72.0], "SOBRE": [1, 3.0]}	Paracetamol, clorfenamina, fenilefrina	36	f	6	0.4400	normal	1 sobre cada 6 horas según sea necesario	Alivio de síntomas múltiples
288	PARACETAMOL 750 MG  ECOMED CAJA X 60 TAB  BLIST X5	Tabletas	Alivio del dolor y la fiebre	Image-not-found.png	0.8180	0.0000	{"CAJA": [60, 144.0], "BLISTER": [5, 12.0]}	Paracetamol	30	f	6	0.6600	normal	1 tableta cada 4-6 horas según sea necesario	Analgésico y antipirético
290	PEPTOBISMOL TIRA  X 24 TAB	Tabletas masticables	Alivio de la acidez estomacal, indigestión y malestar gastrointestinal	Image-not-found.png	0.9600	0.0000	{"CAJA": [1, 2.0], "TABLETA": [1, 2.0]}	Bismuto subsalicilato	22	f	6	0.5200	normal	Según indicación médica	Protector gástrico y antidiarreico
296	PULMO GRIP JBE 120 ML	Jarabe	Para aliviar la tos y los síntomas del resfriado común.	Image-not-found.png	13.5000	0.0000	{"JARABE": [1, 25.0]}	Paracetamol, Fenilefrina, Dextrometorfano	2	f	6	0.4600	normal	Tomar 10 ml cada 6 horas.	Analgésico, descongestionante y antitusivo.
323	TE GINKO BILOBA CAJA X 20 SOBRES	Sobres	Suplemento dietético para mejorar la memoria y la circulación sanguínea	Image-not-found.png	0.7500	0.0000	{"CAJA": [20, 30.0], "SOBRE": [1, 1.5]}	Ginkgo Biloba	14	f	6	0.5000	normal	1 sobre al día	Mejora la circulación sanguínea y la función cognitiva
364	ZORRITONE CARAMELO X 500	Caramelo	Alivio de la tos y la irritación de garganta	Image-not-found.png	0.2700	0.0000	{"VIAL": [1, 0.5]}	Miel de abeja, extracto de eucalipto, extracto de menta	362	f	6	0.4600	normal	Chupar un caramelo cada 2-3 horas según sea necesario	Expectorante y calmante de la garganta
340	TRIAXOBIL S 1.5 FCO I.M /I.V.	Solución inyectable	Antibiótico para infecciones graves	Image-not-found.png	0.0000	0.0000	{"FRASCO": [1, 70.0]}	Ceftriaxona	0	f	6	1.0000	normal	Según indicación médica	Antibacteriano
315	SUKROL BEBIBLE CAJA X 10 VIAL	Solución	Suplemento vitamínico	Image-not-found.png	2.5300	0.0000	{"CAJA": [10, 55.0], "VIAL": [1, 5.5]}	Vitaminas y minerales	9	f	6	0.5400	normal	1 vial al día	Aporte de nutrientes esenciales
320	TE CHUPA PANZA CAJA X 30	Cápsulas	Suplemento dietético	Image-not-found.png	35.0000	0.0000	{"CAJA": [1, 57.0]}	Fibra, L-carnitina	1	f	6	0.3900	normal	2 cápsulas al día	Reductor de abdomen
326	TE MANZANILLA CAJA X 20 SOBRES	Sobres	Infusión para calmar el malestar estomacal y aliviar la ansiedad	Image-not-found.png	0.7000	0.0000	{"CAJA": [20, 30.0], "SOBRE": [1, 1.5]}	Manzanilla	14	f	6	0.5300	normal	1 sobre después de las comidas	Digestivo y ansiolítico
331	TE PERICON CAJA X 20 SOBRES	Sobres	Infusión para aliviar los cólicos menstruales y regular el ciclo menstrual	Image-not-found.png	0.6000	0.0000	{"CAJA": [20, 20.0], "SOBRE": [1, 1.0]}	Pericón	20	f	6	0.4000	normal	1 sobre cada 6 horas durante el periodo menstrual	Antiespasmódico y regulador hormonal
334	TE VERDE PIÑA CAJA X 20 SOBRES	Sobres	Infusión antioxidante con sabor a piña	Image-not-found.png	0.7500	0.0000	{"CAJA": [20, 30.0], "SOBRE": [1, 1.5]}	Té verde	9	f	6	0.5000	normal	1 sobre en agua caliente al día	Antioxidante y estimulante
342	TUSILEXIL FCO X 120 ML	Jarabe	Expectorante para aliviar la tos y la congestión	Image-not-found.png	25.3000	0.0000	{"FRASCO": [1, 50.0]}	Guaifenesina	2	f	6	0.4900	normal	Según indicación médica	Expectorante
356	WINASORB JBE 60 ML	Jarabe	Antidiarreico	Image-not-found.png	15.0000	0.0000	{"JARABE": [1, 32.0]}	Racecadotrilo	1	f	6	0.5300	normal	Según indicación médica	Inhibidor de la encefalinasa
358	ZANAHORIA CON VIT A 40 ML	Jarabe	Suplemento vitamínico	Image-not-found.png	12.0000	0.0000	{"BOTE": [1, 19.0]}	Zanahoria y vitamina A	1	f	6	0.3700	normal	Según indicación médica	Suplemento vitamínico
359	ZARZAPARRILLA FCO 240 ML (HIGSA)	Frascos	Depurativo y diurético	Image-not-found.png	10.3000	0.0000	{"FRASCO": [1, 20.0]}	Extracto de zarzaparrilla	2	f	6	0.4900	normal	Según indicación médica	Depurativo y diurético
348	VICK PASTI MENTOL 5 X 24 SOBRES	Sobres	Alivio de la congestión nasal	Image-not-found.png	0.0000	0.0000	{"CAJA": [24, 96.0], "SOBRE": [1, 4.0]}	Mentol	0	f	6	1.0000	normal	Disolver un sobre en agua caliente y inhalar los vapores	Descongestionante
283	OVARICON CAJA X 30 TAB BLISTER X 10	Tabletas	Tratamiento para regular el ciclo menstrual y aliviar los síntomas del síndrome de ovario poliquístico	Image-not-found.png	2.5000	0.0000	{"CAJA": [30, 150.0], "BLISTER": [10, 50.0]}	Clomifeno	10	f	6	0.5000	normal	1 tableta diaria durante 5 días, comenzando en el quinto día del ciclo menstrual	Estimula la ovulación
284	PANADOL EXTRAFUERTE X 50 SOBRE	Sobres de polvo	Alivio del dolor y la fiebre intensos	Image-not-found.png	0.8000	0.0000	{"CAJA": [50, 100.0], "SOBRE": [1, 2.0]}	Paracetamol	44	f	6	0.6000	normal	1 sobre cada 4-6 horas según sea necesario	Analgésico y antipirético
292	PIOFIN FCO 60 ML	Frascos de solución	Antitusivo para el alivio de la tos	Image-not-found.png	5.0000	0.0000	{"FRASCO": [1, 10.0]}	Dextrometorfano	2	f	6	0.5000	normal	Según indicación médica	Antitusivo
298	PULMOGRIP JBE 240 ML	Jarabe	Para aliviar la tos y los síntomas del resfriado común.	Image-not-found.png	10.0000	0.0000	{"JARABE": [1, 35.0]}	Paracetamol, Fenilefrina, Dextrometorfano	2	f	6	0.7100	normal	Tomar 10 ml cada 6 horas.	Analgésico, descongestionante y antitusivo.
304	SALBUTAMOL 100MCG X DOSIS SPRAY PROMEGAL	Spray inhalador	Alivio de los síntomas de asma y enfermedad pulmonar obstructiva crónica (EPOC)	Image-not-found.png	11.8600	0.0000	{"SPRAY": [1, 25.0]}	Salbutamol	5	f	6	0.5300	normal	1-2 inhalaciones según necesidad	Broncodilatador
314	SUCRASSYL CAJA X 30 PAHIL	Pastillas	Suplemento dietético	Image-not-found.png	3.1200	0.0000	{"CAJA": [1, 5.0], "SOBRE": [1, 5.0]}	Sucralosa	29	f	6	0.3800	normal	1 pastilla al día	Edulcorante sin calorías
346	UROFIN DISPENS X 100	Tabletas	Suplemento vitamínico	Image-not-found.png	0.0190	0.0000	{"DISPENSADOR": [100, 3.0]}	Complejo B	7600	f	6	0.3700	normal	Tomar 1 tableta al día	Suplemento vitamínico
353	VIVE AMOR 16 CAJAS X 3 UND	Tabletas	Suplemento vitamínico y mineral	Image-not-found.png	4.7000	0.0000	{"CAJA": [16, 128.0], "SACHET": [1, 8.0]}	Vitaminas y minerales	4	f	6	0.4100	normal	1 tableta al día	Suplemento vitamínico y mineral
347	VARIFIN  FCO 100 TABS	Tabletas	Antiinflamatorio y analgésico	Image-not-found.png	20.3000	0.0000	{"FRASCO": [1, 40.0]}	Ibuprofeno	1	f	6	0.4900	normal	Según indicación médica	Antiinflamatorio, Analgésico
349	VICK VAPORUB 12G  CAJA X 12 LATITAS	Pomada	Alivio de la congestión nasal y muscular	Image-not-found.png	0.4960	0.0000	{"CAJA": [12, 10.0]}	Mentol, Alcanfor, Eucalipto	204	f	6	0.4000	normal	Aplicar en pecho y espalda frotando suavemente	Descongestionante, Analgésico
354	VIVE ORIGINAL 16 CAJAS X 3 UND	Tabletas	Suplemento vitamínico y mineral	Image-not-found.png	5.0000	0.0000	{"CAJA": [16, 128.0], "SACHET": [1, 8.0]}	Vitaminas y minerales	4	f	6	0.3800	normal	1 tableta al día	Suplemento vitamínico y mineral
355	WINASORB GOTAS 15 ML	Gotas	Antidiarreico	Image-not-found.png	15.0000	0.0000	{"BOTE": [1, 27.0]}	Racecadotrilo	1	f	6	0.4400	normal	Según indicación médica	Inhibidor de la encefalinasa
357	YODOCLORINA DISP X 100 CAPS	Cápsulas	Antiséptico y desinfectante	Image-not-found.png	0.4000	0.0000	{"DISPENSADOR": [100, 90.0], "SOBRE": [1, 0.9]}	Yodo	80	f	6	0.5600	normal	Según indicación médica	Antiséptico
360	ZORRIFLEM JB 180 ML	Jarabe	Mucolítico y expectorante	Image-not-found.png	9.3000	0.0000	{"JARABE": [1, 18.0]}	Ambroxol	3	f	6	0.4800	normal	Según indicación médica	Mucolítico y expectorante
361	ZORRITONE CARAMELO BARRA CAJA X 16 CEREZA	Caramelos	Suplemento energético	Image-not-found.png	2.1900	0.0000	{"CAJA": [1, 4.5]}	Vitaminas y minerales	17	f	6	0.5100	normal	Según indicación médica	Suplemento energético
352	VITAMINA E 1000 X 100 VESA	Cápsulas	Suplemento vitamínico	Image-not-found.png	0.4000	0.0000	{"CAJA": [100, 100.0], "SOBRE": [1, 1.0]}	Vitamina E	178	f	6	0.6000	normal	Tomar 1 cápsula al día	Antioxidante
365	ACEITE DE HIGADO X 100 SIETE MARES	Cápsulas	Suplemento alimenticio	Image-not-found.png	24.0000	0.0000	{"BOTE": [1, 37.0]}	Aceite de hígado de pescado	2	f	4	0.3500	normal	1 cápsula al día	Aporte de ácidos grasos omega-3 y vitaminas A y D
366	ACEITE DE OLIVA PREDILECTO 120 ML	Solución oral	Suplemento alimenticio	Image-not-found.png	4.6900	0.0000	{"BOTE": [1, 8.0]}	Aceite de oliva	5	f	4	0.4100	normal	Según indicación médica	Fuente de ácidos grasos monoinsaturados y vitamina E
367	ACETAMINOFEN MK 500 MGS BLIST X 10 CAJA X 100	Tabletas	Analgésico y antipirético	Image-not-found.png	0.4830	0.0000	{"BLISTER": [10, 8.0], "CAJA": [100, 80.0]}	Acetaminofén	210	f	4	0.4000	normal	1 tableta cada 4-6 horas según necesidad	Inhibición de la síntesis de prostaglandinas
375	AGUJA 25G X 1 NARANJA X 100 NIPRO	Aguja	Para administración de medicamentos por vía subcutánea	Image-not-found.png	0.0000	0.0000	{"JERINGA PRELLENADA": [1, 0.5]}	No aplica	0	f	4	1.0000	normal	25G x 1	Facilita la administración de medicamentos de forma segura
368	AGUJA 18G X 1-1/2 ROSADA	Aguja estéril	Para administración de medicamentos por vía intramuscular	Image-not-found.png	0.2800	0.0000	{"JERINGA PRELLENADA": [1, 0.5]}	No aplica	105	f	4	0.4400	normal	Según indicación médica	Facilita la inyección intramuscular
371	AGUJA 21G X 1 X 1/2 VERDE	Aguja estéril	Para administración de medicamentos por vía subcutánea	Image-not-found.png	0.2300	0.0000	{"JERINGA PRELLENADA": [1, 0.5]}	No aplica	74	f	4	0.5400	normal	Según indicación médica	Facilita la inyección subcutánea
369	AGUJA 18G X 1-1/4 ROSADA	Aguja estéril	Para administración de medicamentos por vía intramuscular	Image-not-found.png	0.0000	0.0000	{"JERINGA PRELLENADA": [1, 0.5]}	No aplica	0	f	4	1.0000	normal	Según indicación médica	Facilita la inyección intramuscular
370	AGUJA 20G X 1 -1/2  AMARILLA	Aguja estéril	Para administración de medicamentos por vía intravenosa	Image-not-found.png	0.0000	0.0000	{"JERINGA PRELLENADA": [1, 0.5]}	No aplica	0	f	4	1.0000	normal	Según indicación médica	Facilita la inyección intravenosa
372	AGUJA 22 G X 1 1/2 CAPLIN (NEGRA)	Aguja estéril	Para administración de medicamentos por vía intramuscular	Image-not-found.png	0.3100	0.0000	{"JERINGA PRELLENADA": [1, 0.5]}	No aplica	32	f	4	0.3800	normal	Según indicación médica	Facilita la inyección intramuscular
373	AGUJA 23G X 1-1/2" AZUL (NIPRO)	Aguja estéril	Para administración de medicamentos	Image-not-found.png	0.3100	0.0000	{"JERINGA PRELLENADA": [1, 0.5]}	No aplica	108	f	4	0.3800	normal	Según indicación médica	Facilita la inyección
379	ALCOHOL  ELITICO LORALVA 70% 960 ML	Solución	Desinfectante de uso tópico	Image-not-found.png	16.7900	0.0000	{"BOTE": [1, 28.0]}	Alcohol etílico al 70%	2	f	4	0.4000	normal	960 ml	Elimina microorganismos en la piel
374	AGUJA 24G X 1 MORADA	Aguja	Para administración de medicamentos por vía subcutánea	Image-not-found.png	0.0000	0.0000	{"JERINGA PRELLENADA": [1, 0.5]}	No aplica	0	f	4	1.0000	normal	24G x 1	Facilita la administración de medicamentos de forma segura
376	AGUJA 25G X 1-1/2 NARANJA X 100 NIPRO	Aguja	Para administración de medicamentos por vía subcutánea	Image-not-found.png	0.0000	0.0000	{"JERINGA PRELLENADA": [1, 0.5]}	No aplica	0	f	4	1.0000	normal	25G x 1-1/2	Facilita la administración de medicamentos de forma segura
377	AGUJA 27G X 1/2	Aguja	Para administración de medicamentos por vía subcutánea	Image-not-found.png	0.0000	0.0000	{"JERINGA PRELLENADA": [1, 0.5]}	No aplica	0	f	4	1.0000	normal	27G x 1/2	Facilita la administración de medicamentos de forma segura
378	AGUJA 30G X 1/2  AMARILLA (NIPRO)	Aguja	Para administración de medicamentos por vía subcutánea	Image-not-found.png	0.0000	0.0000	{"JERINGA PRELLENADA": [1, 1.0]}	No aplica	0	f	4	1.0000	normal	30G x 1/2	Facilita la administración de medicamentos de forma segura
380	ALCOHOL ETILICO VESA 70% SPRAY 120 ML	Spray	Desinfectante de uso tópico	Image-not-found.png	8.6500	0.0000	{"SPRAY": [1, 15.0]}	Alcohol etílico al 70%	2	f	4	0.4200	normal	120 ml	Elimina microorganismos en la piel
381	ALEVE EXTRA FUERTE X 36 TAB	Tableta	Analgésico y antiinflamatorio	Image-not-found.png	1.2400	0.0000	{"CAJA": [36, 90.0], "TABLETA": [1, 2.5]}	Naproxeno	19	f	4	0.5000	normal	36 tabletas	Alivia el dolor y reduce la inflamación
384	ALGODÓN BOLSA X 25	Bolsa	Para limpieza y curación de heridas	Image-not-found.png	0.0000	0.0000	{"BOLSA": [1, 0.5]}	Algodón	0	f	4	1.0000	normal	Uso externo	Absorción de líquidos y secreciones
382	ALEVE LQUID GELS X 24	Cápsula	Analgésico y antiinflamatorio	Image-not-found.png	2.2500	0.0000	{"CAJA": [24, 90.0], "TABLETA": [1, 3.75]}	Naproxeno	30	f	4	0.4000	normal	24 cápsulas	Alivia el dolor y reduce la inflamación
383	ALEVE MAX CAJA X 10 TAB	Tableta	Analgésico y antiinflamatorio	Image-not-found.png	2.3200	0.0000	{"CAJA": [10, 35.0], "TABLETA": [1, 3.5]}	Naproxeno	22	f	4	0.3400	normal	10 tabletas	Alivia el dolor y reduce la inflamación
385	ALGODÓN ZUUM 50 GRS	Algodón	Para limpieza y curación de heridas	Image-not-found.png	0.0000	0.0000	{"BOLSA": [1, 12.0]}	Algodón	0	f	4	1.0000	normal	Uso externo	Absorción de líquidos y secreciones
386	ALKA GASTRIC DISP. X 36 TAB	Tableta dispersable	Para aliviar la acidez estomacal	Image-not-found.png	1.8400	0.0000	{"DISPENSADOR": [36, 108.0], "TABLETA": [1, 3.0]}	Hidróxido de aluminio y magnesio	20	f	4	0.3900	normal	Según indicación médica	Neutralización del ácido gástrico
389	ANGIOCAT # 16	Catéter	Para procedimientos de angiografía	Image-not-found.png	5.4000	0.0000	{"BOLSA": [1, 10.0]}	No aplica	1	f	4	0.4600	normal	Según indicación médica	Visualización de vasos sanguíneos
387	ALKA SELTZER DISP X 60	Tableta efervescente	Para aliviar la acidez estomacal y el dolor de cabeza	Image-not-found.png	1.0100	0.0000	{"DISPENSADOR": [60, 90.0], "TABLETA": [1, 1.5]}	Ácido acetilsalicílico, bicarbonato de sodio y ácido cítrico	61	f	4	0.3300	normal	Según indicación médica	Analgésico y antiinflamatorio
388	ANESTENCA TUBO X 5 ML	Crema	Anestésico tópico para aliviar el dolor en la piel	Image-not-found.png	3.9700	0.0000	{"TUBO": [5, 32.0]}	Lidocaína	10	f	4	0.3800	normal	Uso externo	Anestésico local
351	VITALFUERTE X 100 TAB	Tabletas	Suplemento vitamínico	Image-not-found.png	20.3000	0.0000	{"CAJA": [1, 80.0]}	Complejo B	1	f	6	0.7500	normal	Tomar 1 tableta al día	Suplemento vitamínico
403	BAYKID DOLOR Y FIEBRE CAJA X 36 BLIST X 12 TAB	Tabletas	Analgésico y antipirético para niños.	Image-not-found.png	0.9800	0.0000	{"CAJA": [36, 63.0], "BLISTER": [12, 21.0], "TABLETA": [1, 1.75]}	Paracetamol	30	f	4	0.4400	normal	Seguir las indicaciones del médico	Alivia el dolor y reduce la fiebre en niños de forma segura.
407	BICARBONATO  X 25 SOBRES DE 10 GRS VESA	Sobres	Antiácido	Image-not-found.png	0.2300	0.0000	{"SOBRE": [1, 0.5]}	Bicarbonato de sodio	64	f	4	0.0000	normal	Disolver un sobre en agua y tomar después de las comidas	Neutraliza el ácido estomacal
409	BICARBONATO X 16 SOBRES DE 28 GRS DISFAVIL	Sobres	Antiácido	Image-not-found.png	0.5900	0.0000	{"SOBRE": [1, 1.0]}	Bicarbonato de sodio	8	f	4	0.0000	normal	Disolver un sobre en agua y tomar después de las comidas	Neutraliza el ácido estomacal
421	CITRATO DE MAGNESIA BOLSA X 16 SOBRES	Polvo para solución oral	Laxante osmótico	Image-not-found.png	1.0300	0.0000	{"BOLSA": [16, 40.0], "SOBRE": [1, 2.5]}	Citrato de magnesio	7	f	4	0.5900	normal	Varía según la presentación	Laxante
430	CURITAS CUREBAND CAJA X 100 + 10	Curitas adhesivas	Protección de heridas leves	Image-not-found.png	0.1000	0.0000	{"SACHET": [1, 0.25]}	Varía según la presentación	200	f	4	0.6000	normal	Uso externo	Protege la herida y facilita la cicatrización
390	ANGIOCAT # 18	Catéter	Para procedimientos de angiografía	Image-not-found.png	5.6500	0.0000	{"BOLSA": [1, 10.0]}	No aplica	5	f	4	0.4400	normal	Según indicación médica	Visualización de vasos sanguíneos
392	ANGIOCAT # 22	Catéter	Para procedimientos de angiografía	Image-not-found.png	5.6500	0.0000	{"BOLSA": [1, 10.0]}	No aplica	4	f	4	0.4400	normal	Según indicación médica	Visualización de vasos sanguíneos
393	ANGIOCAT # 24	Catéter	Para procedimientos de angiografía	Image-not-found.png	5.4000	0.0000	{"BOLSA": [1, 10.0]}	No aplica	3	f	4	0.4600	normal	Según indicación médica	Visualización de vasos sanguíneos
394	APOSITOS PARA CAYOS HANSAPLAST  X 6	Apósitos	Para el tratamiento de callos y durezas en los pies.	Image-not-found.png	4.0800	0.0000	{"CAJA": [1, 7.0]}	No especificado	7	f	4	0.4200	normal	Seguir las instrucciones del empaque	Protege y alivia la presión sobre los callos y durezas.
396	ARCO PULMIN INY ADULTO PIERSAN	Inyección	Tratamiento de enfermedades respiratorias como la bronquitis.	Image-not-found.png	9.3200	0.0000	{"BOTE": [1, 19.0]}	No especificado	1	f	4	0.5100	normal	Seguir las indicaciones del médico	Ayuda a mejorar la función pulmonar y aliviar la tos y la dificultad para respirar.
404	BEBETINA  BLIST X 10 CAJA X 100 TAB	Tabletas	Analgésico y antipirético	Image-not-found.png	0.5800	0.0000	{"BLISTER": [10, 9.0], "CAJA": [100, 90.0], "TABLETA": [1, 0.9]}	Paracetamol	92	f	4	0.3600	normal	1 tableta cada 6 horas	Alivio del dolor y reducción de la fiebre
410	BOLSA DE ALGODÓN 160 BOLITAS SUPERIOR	Bolitas de algodón	Para limpieza y curación de heridas	Image-not-found.png	9.7500	0.0000	{"BOLSA": [1, 16.0]}	Algodón	1	f	4	0.3900	normal	Seguir indicaciones del médico	Absorbe líquidos y protege la herida
414	CANESTEN 100 MG X 18 OVULOS VAG	Óvulos vaginales	Tratamiento de infecciones vaginales por hongos	Image-not-found.png	12.2500	0.0000	{"TABLETA": [1, 20.0]}	Clotrimazol	7	f	4	0.3900	normal	100 mg	Antifúngico
416	CANESTEN TRIPLE ACCION 15 GRS	Crema	Tratamiento de infecciones cutáneas por hongos	Image-not-found.png	51.1700	0.0000	{"CREMA": [1, 77.0]}	Clotrimazol	1	f	4	0.3400	normal	15 g	Antifúngico
417	CARDIOASPIRINA CAJA X 48 TAB	Tabletas	Prevención de enfermedades cardiovasculares	Image-not-found.png	1.9200	0.0000	{"CAJA": [48, 144.0], "TABLETA": [1, 3.0]}	Ácido acetilsalicílico	66	f	4	0.3600	normal	Varía según la presentación	Antiinflamatorio, analgésico, antiplaquetario
418	CEREBREX GINKO AMP BEBIBLES X 10	Ampollas bebibles	Mejora la circulación cerebral y la memoria	Image-not-found.png	5.0700	0.0000	{"AMPOLLA": [1, 8.5]}	Ginkgo Biloba	16	f	4	0.4000	normal	Varía según la presentación	Vasodilatador cerebral, antioxidante
391	ANGIOCAT # 20	Catéter	Para procedimientos de angiografía	Image-not-found.png	3.7500	0.0000	{"BOLSA": [1, 10.0]}	No aplica	3	f	4	0.6300	normal	Según indicación médica	Visualización de vasos sanguíneos
398	ASPIRINA ADULTO BLIST X 10 CAJA X 100	Tabletas	Analgésico y antipirético para adultos.	Image-not-found.png	0.0670	0.0000	{"BLISTER": [10, 1.0], "CAJA": [100, 10.0]}	Ácido acetilsalicílico	1370	f	4	0.3300	normal	Seguir las indicaciones del médico	Alivia el dolor y reduce la fiebre.
426	CODERPINA JBE 60 ML	Jarabe	Antitusivo y analgésico	Image-not-found.png	26.0300	0.0000	{"JARABE": [1, 41.0]}	Codeína	1	f	4	0.3700	normal	Varía según la presentación	Suprime la tos y alivia el dolor
429	CURITA REDONDA  CUREBAND CAJA X 100	Curita adhesiva	Protección de heridas leves	Image-not-found.png	0.1100	0.0000	{"SACHET": [1, 0.25]}	Varía según la presentación	22	f	4	0.5600	normal	Uso externo	Protege la herida y facilita la cicatrización
397	ASPIRADOR NASAL GERBER	Aspirador nasal	Para limpiar la mucosidad nasal de los bebés.	Image-not-found.png	0.0000	0.0000	{"KIT": [1, 30.0]}	No aplica	0	f	4	1.0000	normal	Seguir las instrucciones del fabricante	Ayuda a despejar las vías respiratorias de los bebés.
395	AQUAMAR FCO 50 ML SPRAY NASAL	Spray nasal	Descongestionante nasal para aliviar la congestión y secreción nasal.	Image-not-found.png	66.6000	0.0000	{"FRASCO": [1, 110.0]}	Agua de mar	1	f	4	0.3900	normal	Seguir las instrucciones del empaque	Ayuda a limpiar y descongestionar las fosas nasales.
400	ASPIRINA NIÑOS BLIST X 10 CAJA X 100	Tabletas	Analgésico y antipirético para niños.	Image-not-found.png	0.0620	0.0000	{"BLISTER": [10, 1.0], "CAJA": [100, 10.0]}	Ácido acetilsalicílico	1250	f	4	0.3800	normal	Seguir las indicaciones del médico	Alivia el dolor y reduce la fiebre en niños.
401	BALLENA AZUL 200 ML	Jarabe	Suplemento vitamínico para niños.	Image-not-found.png	33.9000	0.0000	{"BOTE": [1, 51.0]}	Vitaminas y minerales	2	f	4	0.3400	normal	Seguir las indicaciones del fabricante	Ayuda a complementar la dieta de los niños con vitaminas y minerales esenciales.
408	BICARBONATO X 1 LIBRA DISFAVIL	Polvo	Antiácido	Image-not-found.png	8.4000	0.0000	{"SOBRE": [1, 16.0]}	Bicarbonato de sodio	5	f	4	0.0000	normal	Seguir indicaciones del médico	Neutraliza el ácido estomacal
431	DAPAZ (AMITRIP + CLORDIA)  CAJA X 30 BLIST X 10	Tabletas	Antidepresivo y ansiolítico	Image-not-found.png	1.6600	0.0000	{"CAJA": [30, 81.0], "BLISTER": [10, 27.0], "TABLETA": [1, 2.7]}	Amitriptilina + Clordiazepóxido	28	f	4	0.3900	normal	Varía según la presentación	Tratamiento de la depresión y la ansiedad
413	CALMANTE SOBRE BOLSA X 100	Sobres	Analgésico y antipirético	Image-not-found.png	0.1600	0.0000	{"BOLSA": [100, 25.0], "SOBRE": [1, 0.25]}	Paracetamol	20	f	4	0.3600	normal	Seguir indicaciones del médico	Alivio del dolor y reducción de la fiebre
420	CIRBRAL FORTE 75 MG BLIST X 10 CAJA X 30	Tabletas	Tratamiento de trastornos cognitivos	Image-not-found.png	0.1790	0.0000	{"BLISTER": [10, 2.8], "CAJA": [30, 8.4]}	Citicolina	400	f	4	0.3600	normal	75 mg	Neuroprotector, potenciador cognitivo
422	CLO-PRIM 0.1MG/GOTAS 15 ML	Gotas orales	Tratamiento de trastornos de ansiedad	Image-not-found.png	36.0700	0.0000	{"FRASCO": [1, 55.0]}	Clonazepam	2	f	4	0.3400	normal	0.1 mg por gota	Ansiolítico, anticonvulsivante
425	CLOPRIM CAJA X 3 AMPOLLAS	Ampollas	Analgésico y antipirético	Image-not-found.png	11.3700	0.0000	{"CAJA": [3, 57.0], "AMPOLLA": [1, 19.0]}	Paracetamol	3	f	4	0.4000	normal	Varía según la presentación	Alivia el dolor y reduce la fiebre
428	CURADERMA LATITA	Pomada	Cicatrizante y antiséptico	Image-not-found.png	11.9600	0.0000	{"FRASCO": [1, 18.0]}	Varía según la presentación	4	f	4	0.3400	normal	Uso tópico	Ayuda en la cicatrización y previene infecciones
399	ASPIRINA FORTE CAJA X 100 BLIST X 10	Tabletas	Analgésico y antipirético de mayor concentración.	Image-not-found.png	0.0000	0.0000	{"CAJA": [100, 0.0], "BLISTER": [10, 0.0]}	Ácido acetilsalicílico	1470	f	4	0.0000	normal	Seguir las indicaciones del médico	Alivia el dolor y reduce la fiebre de forma más potente.
405	BEPHANTHENE CREMA 5% 30G QUEMADURAS	Crema	Tratamiento de quemaduras leves	Image-not-found.png	50.4800	0.0000	{"CREMA": [1, 81.0]}	Dexpantenol	1	f	4	0.3800	normal	Aplicar una capa fina sobre la zona afectada 2-3 veces al día	Promueve la regeneración de la piel
406	BEPHANTHENE POMADA 5% 30G PROTECTORA	Pomada	Protección de la piel irritada	Image-not-found.png	47.5700	0.0000	{"CREMA": [1, 78.0]}	Dexpantenol	2	f	4	0.3900	normal	Aplicar una capa fina sobre la piel irritada 2-3 veces al día	Hidrata y protege la piel
412	CALLOFIN POMADA 12 GRS	Pomada	Tratamiento de callos y durezas	Image-not-found.png	3.9200	0.0000	{"CREMA": [1, 7.0]}	Ácido salicílico	1	f	4	0.4400	normal	Aplicar sobre el callo o dureza 1-2 veces al día	Suaviza la piel y ayuda a eliminar callosidades
411	CALCIO VITAMINADO AMPOLLA	Ampolla	Suplemento de calcio y vitaminas	Image-not-found.png	9.1700	0.0000	{"AMPOLLA": [1, 20.0]}	Calcio	2	f	4	0.5400	normal	Seguir indicaciones del médico	Fortalece los huesos y dientes
419	CIRBRAL 25 MG BLIST X 20 CAJA X 60	Tabletas	Tratamiento de trastornos cognitivos	Image-not-found.png	0.0270	0.0000	{"BLISTER": [20, 0.9], "CAJA": [60, 2.7]}	Citicolina	2880	f	4	0.4000	normal	25 mg	Neuroprotector, potenciador cognitivo
415	CANESTEN ORAL 150 MG X 1 CAP	Cápsula oral	Tratamiento de infecciones por hongos en la boca y garganta	Image-not-found.png	0.0000	0.0000	{"CAJA": [1, 114.0]}	Clotrimazol	0	f	4	1.0000	normal	150 mg	Antifúngico
436	DIYODO 650  BLIST X 10TAB	Tableta	Suplemento de yodo	Image-not-found.png	0.0000	0.0000	{"BLISTER": [10, 10.0], "TABLETA": [1, 1.0]}	Yoduro de potasio	0	f	4	1.0000	normal	650 mcg	Regulación de la función tiroidea
423	CLO-PRIM 10MG BLIST X 10 CAJA X 40 TABS	Tabletas	Tratamiento de trastornos de ansiedad y convulsiones	Image-not-found.png	1.7800	0.0000	{"BLISTER": [10, 30.0], "CAJA": [40, 120.0], "TABLETA": [1, 3.0]}	Clonazepam	20	f	4	0.4100	normal	10 mg	Ansiolítico, anticonvulsivante
446	GASA ENFERMERITA 3 X 1	Gasa	Cubrir heridas	Image-not-found.png	0.0000	0.0000	{"SACHET": [1, 29.0]}	No aplica	0	f	4	1.0000	normal	Según sea necesario	Cubrir heridas
424	CLOPRIM 5MG/5ML JARABE 120 ML	Jarabe	Antipirético y analgésico	Image-not-found.png	50.1000	0.0000	{"JARABE": [1, 77.0]}	Paracetamol	1	f	4	0.3500	normal	5mg/5ml	Reduce la fiebre y alivia el dolor
427	CUAJO CAJA X 100 BLISTER X 10	Tabletas	Suplemento alimenticio	Image-not-found.png	0.1030	0.0000	{"CAJA": [100, 18.0], "BLISTER": [10, 1.8]}	Varía según la presentación	620	f	4	0.4300	normal	Varía según la presentación	Ayuda en la coagulación de la leche
437	DOLOFIN DISP X 60	Tableta dispersable	Analgésico y antipirético	Image-not-found.png	0.0000	0.0000	{"DISPENSADOR": [1, 0.0], "TABLETA": [1, 0.0]}	Paracetamol	0	f	4	0.0000	normal	500 mg	Alivio del dolor y la fiebre
432	DEXAMICINA GOTASX 5 ML QUALIPHARM	Gotas	Antiinflamatorio y antialérgico	Image-not-found.png	45.5000	0.0000	{"FRASCO": [1, 69.0]}	Dexametasona	1	f	4	0.3400	normal	Varía según la presentación	Reduce la inflamación y alivia las alergias
433	DEXTROVITA AL 10% 1/2 LITRO	Solución oral	Suplemento vitamínico	Image-not-found.png	26.0900	0.0000	{"FRASCO": [1, 40.0]}	Dextrosa	0	f	4	0.3500	normal	10%	Aporta energía y nutrientes
434	DEXTROVITA AL 5% 1 LITRO	Solución inyectable	Suplemento nutricional	Image-not-found.png	37.8600	0.0000	{"FRASCO": [1, 61.0]}	Dextrosa	1	f	4	0.3800	normal	5%	Aporte de energía
435	DEXTROVITA AL 5% 1/2 LITRO	Solución inyectable	Suplemento nutricional	Image-not-found.png	27.2800	0.0000	{"FRASCO": [1, 42.0]}	Dextrosa	0	f	4	0.3500	normal	5%	Aporte de energía
438	DOLOVITANERVO KIT AMPOLLA	Solución inyectable	Suplemento vitamínico	Image-not-found.png	9.5500	0.0000	{"KIT": [1, 19.0]}	Vitaminas del complejo B	3	f	4	0.5000	normal	Varias vitaminas	Mejora del estado nutricional y del sistema nervioso
441	ENTEROGUANIL NIÑO DIS X 200 BLIST X 4 TABS	Tableta	Antiparasitario pediátrico	Image-not-found.png	0.0000	0.0000	{"DISPENSADOR": [200, 100.0], "BLISTER": [4, 2.0], "TABLETA": [1, 0.5]}	Proguanil	0	f	4	1.0000	normal	50 mg	Prevención y tratamiento de la malaria en niños
439	DORIVAL GEL 200MG CAJA X 36 GELCAPS	Cápsula gelatinosa	Antiinflamatorio	Image-not-found.png	2.5500	0.0000	{"CAJA": [36, 144.0], "GELATINA BLANDA": [1, 4.0]}	Ibuprofeno	41	f	4	0.3600	normal	200 mg	Alivio del dolor y la inflamación
440	ENTEROGUANIL ADULTO DIS X 200 BLIST X 4 TABS	Tableta	Antiparasitario	Image-not-found.png	0.3100	0.0000	{"DISPENSADOR": [200, 200.0], "BLISTER": [4, 4.0], "TABLETA": [1, 1.0]}	Proguanil	172	f	4	0.6900	normal	200 mg	Prevención y tratamiento de la malaria
443	ESENCIA MARAVILLOSA SIERRA FCO	Frasco	Producto cosmético	Image-not-found.png	11.0000	0.0000	{"FRASCO": [1, 18.0]}	No aplica	3	f	4	0.3900	normal	No aplica	Aromaterapia y cuidado de la piel
442	ESCABIN JABON DE AZUFRE 80 GRS SANTE	Jabón	Tratamiento para la sarna	Image-not-found.png	5.1500	0.0000	{"CAJA": [1, 9.0]}	Azufre	2	f	4	0.4300	normal	80 g	Eliminación de ácaros y alivio de la picazón
444	FERRIDOCE CAJA X 30TAB BLIST X 10	Tabletas	Suplemento de hierro	Image-not-found.png	0.9300	0.0000	{"CAJA": [30, 42.0], "BLISTER": [10, 14.0]}	Hierro	60	f	4	0.3400	normal	1 tableta al día	Suplemento de hierro
448	GASA SUPERIOR  4 X 10	Gasa	Cubrir heridas	Image-not-found.png	8.0000	0.0000	{"SACHET": [1, 13.0]}	No aplica	2	f	4	0.3800	normal	Según sea necesario	Cubrir heridas
447	GASA SUPERIOR  3 X 10 YD	Gasa	Cubrir heridas	Image-not-found.png	7.0000	0.0000	{"SACHET": [1, 12.0]}	No aplica	2	f	4	0.4200	normal	Según sea necesario	Cubrir heridas
445	GASA ENFERMERITA  1/2 X 1 YD.	Gasa	Cubrir heridas	Image-not-found.png	0.0000	0.0000	{"SACHET": [1, 7.0]}	No aplica	0	f	4	1.0000	normal	Según sea necesario	Cubrir heridas
449	GASA SUPERIOR 2 X 10 YD	Gasa	Cubrir heridas	Image-not-found.png	4.9000	0.0000	{"SACHET": [1, 9.0]}	No aplica	3	f	4	0.4600	normal	Según sea necesario	Cubrir heridas
450	GASA SUPERIOR 6 X 10 YDS	Gasa	Cubrir heridas	Image-not-found.png	13.2500	0.0000	{"SACHET": [1, 22.0]}	No aplica	2	f	4	0.4000	normal	Según sea necesario	Cubrir heridas
452	GLORANTA TE FRUTOS ROJOS CAJA X 25 SOBRES	Infusión en sobres	Infusión de frutos rojos	Image-not-found.png	6.3200	0.0000	{"CAJA": [25, 250.0], "SOBRE": [1, 10.0]}	No aplica	5	f	4	0.3700	normal	1 sobre en agua caliente, según preferencia	Infusión de frutos rojos
453	GLORANTA TE LIMON/JENGIBRE CAJA X 25 SOBRES	Infusión en sobres	Infusión de limón y jengibre	Image-not-found.png	6.3200	0.0000	{"CAJA": [25, 250.0], "SOBRE": [1, 10.0]}	No aplica	0	f	4	0.3700	normal	1 sobre en agua caliente, según preferencia	Infusión de limón y jengibre
454	HARTMANN (1000) 1 LITRO	Solución	Solución para irrigación y lavado de heridas	Image-not-found.png	15.1700	0.0000	{"BOTE": [1, 25.0]}	No aplica	1	f	4	0.3900	normal	Según indicación médica	Irrigante y lavado de heridas
402	BALSAMICO GMS 12 GRS	Crema	Para aliviar la congestión nasal y el malestar en el pecho.	Image-not-found.png	5.7800	0.0000	{"CREMA": [1, 10.0]}	Mentol y eucalipto	4	f	4	0.4200	normal	Aplicar en la zona afectada según sea necesario	Proporciona alivio temporal de la congestión y el malestar respiratorio.
514	TABCIN NIÑOS X 60 EFERV	Tabletas efervescentes	Analgésico y antipirético	Image-not-found.png	1.2100	0.0000	{"EFERVECENTE": [1, 2.0]}	Paracetamol	50	f	4	0.4000	normal	Según indicación médica	Alivio del dolor y reducción de la fiebre
515	TALCO DERMO-G11 300 GRS	Polvo	Antisudorífico y desodorante	Image-not-found.png	14.2500	0.0000	{"BOTE": [1, 25.0]}	Talco	2	f	4	0.4300	normal	Según necesidad	Absorción de la humedad y prevención de irritaciones
530	VITAPYRENA FORTE DISP X50	Tabletas dispersables	Analgésico y antipirético	Image-not-found.png	3.7300	0.0000	{"SOBRE": [1, 6.0]}	Paracetamol	28	f	4	0.0000	normal	Tomar según necesidad	Analgésico y antipirético
483	PANADOL MUJER DISP. X 48 TAB (24 SOBRES)	Tabletas	Alivio del dolor y fiebre en mujeres	Image-not-found.png	0.0000	0.0000	{"DISPENSADOR": [48, 144.0], "TABLETA": [1, 3.0]}	Paracetamol	0	f	4	1.0000	normal	1 tableta cada 6 horas	Analgésico y antipirético
455	JERINGA 5 CC 23 X 1 1/2	Jeringa	Para administración de medicamentos por vía intramuscular	Image-not-found.png	0.3700	0.0000	{"JERINGA PRELLENADA": [1, 1.0]}	No aplica	75	f	4	0.6300	normal	Según indicación médica	Administración de medicamentos
464	MANTECA DE CACAO	Crema	Hidratante para la piel	Image-not-found.png	1.5400	0.0000	{"SOBRE": [1, 2.5]}	Manteca de cacao	83	f	4	0.0000	normal	No especificado	Emoliente y protector de la piel
469	NAUSEOL SUSP JBE FCO 60 ML	Jarabe	Antiemético	Image-not-found.png	45.9400	0.0000	{"FRASCO": [1, 72.0]}	Metoclopramida	2	f	4	0.3600	normal	Según indicación médica	Controla las náuseas y vómitos
471	NEOFEBRINA JARABE 100 ML	Jarabe	Antipirético	Image-not-found.png	21.4200	0.0000	{"JARABE": [1, 34.0]}	Paracetamol	1	f	4	0.3700	normal	Según indicación médica	Reduce la fiebre y alivia el dolor
485	PANCLASA PAGUE 30 LLEVE 40 BLISTER X 10	Tabletas	Suplemento vitamínico	Image-not-found.png	3.3990	0.0000	{"BLISTER": [10, 50.0]}	Vitaminas y minerales	20	f	4	0.3200	normal	Según indicaciones del médico	Suplemento dietético
496	ROWATINEX PERLAS AMARILLAS BLI X 10	Perlas	Suplemento dietético para la función hepática y biliar	Image-not-found.png	0.4760	0.0000	{"BLISTER": [10, 7.5]}	Aceites esenciales	480	f	4	0.3700	normal	1 perla 3 veces al día	Hepatoprotector
501	SOLUCION SALINA ISOTONICA LITRO	Solución	Solución salina para irrigación y lavado	Image-not-found.png	13.9100	0.0000	{"BOTE": [1, 22.0]}	Cloruro de sodio	1	f	4	0.3700	normal	Según necesidad médica	Hidratación, irrigación
502	SOLUCION SALINA PARA NEBULIZAR 250 ML	Solución	Solución salina para nebulización	Image-not-found.png	9.6100	0.0000	{"FRASCO": [1, 16.0]}	Cloruro de sodio	2	f	4	0.4000	normal	Según indicación médica	Hidratación, mucolítico
509	TABCIN GRIPE Y TOS LIQUID GEL X 30	Cápsulas líquidas	Alivio de los síntomas de gripe, tos y congestión nasal	Image-not-found.png	3.0200	0.0000	{"GELATINA BLANDA": [1, 5.0]}	Paracetamol, dextrometorfano, fenilefrina	32	f	4	0.4000	normal	Tomar 1 cápsula cada 6 horas	Analgésico, antitusivo, descongestionante nasal
510	TABCIN GRIPE Y TOS X 60 TABS EFERV (MORADO)	Tabletas efervescentes	Alivio de los síntomas de gripe, tos y congestión nasal	Image-not-found.png	1.5100	0.0000	{"EFERVECENTE": [1, 2.5]}	Paracetamol, dextrometorfano, fenilefrina	74	f	4	0.4000	normal	Tomar 1 tableta cada 6 horas	Analgésico, antitusivo, descongestionante nasal
511	TABCIN LIQUID GEL DIA X 30	Cápsulas líquidas	Alivio de los síntomas de gripe y resfriado durante el día	Image-not-found.png	3.2700	0.0000	{"GELATINA BLANDA": [1, 5.0]}	Paracetamol, fenilefrina	42	f	4	0.3500	normal	Tomar 1 cápsula cada 6 horas	Analgésico, descongestionante nasal
456	JERINGA 5 CC 23 X 1 1/4	Jeringa	Para administración de medicamentos por vía intramuscular	Image-not-found.png	0.0000	0.0000	{"JERINGA PRELLENADA": [1, 1.0]}	No aplica	0	f	4	1.0000	normal	Según indicación médica	Administración de medicamentos
477	NEUMONIL FORTE DISP X 100 BLIST X 2 TAB	Tabletas	Antibiótico	Image-not-found.png	0.5200	0.0000	{"BLISTER": [2, 1.75], "DISPENSADOR": [100, 87.5]}	Amoxicilina	186	f	4	0.4100	normal	1 tableta cada 8 horas	Antibiótico
481	ORFENGESIC (ORFE/PARAC) BLIST X 10 CAJA X 20	Tabletas	Analgésico y antipirético	Image-not-found.png	0.3590	0.0000	{"BLISTER": [10, 6.0], "CAJA": [20, 12.0]}	Orfenadrina y Paracetamol	130	f	4	0.4000	normal	Según indicación médica	Analgésico y antipirético
500	SINSUEÑO BLIST X 10	Tabletas	Inductor del sueño	Image-not-found.png	0.0600	0.0000	{"BLISTER": [10, 1.0]}	Doxilamina	1230	f	4	0.4000	normal	1 tableta antes de dormir	Sedante, hipnótico
508	TABCIN FLEMA Y CONGESTION CAJA X 30	Tabletas	Alivio de la tos y congestión nasal	Image-not-found.png	3.1300	0.0000	{"CAJA": [30, 150.0], "TABLETA": [1, 5.0]}	Guaifenesina, fenilefrina	35	f	4	0.3700	normal	Tomar 1 tableta cada 8 horas	Expectorante, descongestionante nasal
480	OPTICLUDE REG CAJA X 20 UNID NEXCARE	Parche ocular	Oclusor ocular para tratamiento de ambliopía	Image-not-found.png	0.0000	0.0000	{"CAJA": [20, 80.0], "BOLSA": [1, 4.0]}	No aplica	0	f	4	1.0000	normal	Según indicación médica	Oclusor ocular
503	SOLUTINA GOTAS OFTALMICAS	Gotas	Solución oftálmica para el tratamiento de infecciones oculares	Image-not-found.png	0.0000	0.0000	{"FRASCO": [1, 26.0]}	Sulfato de neomicina	0	f	4	1.0000	normal	Aplicar 1 o 2 gotas en el ojo afectado cada 4 horas	Antibiótico de amplio espectro
527	VITAL FUERTE 10 AMP BEB 10 ML	Ampollas bebibles	Suplemento vitamínico	Image-not-found.png	0.0000	0.0000	{"AMPOLLA": [1, 5.8]}	Complejo B	0	f	4	1.0000	normal	Tomar una ampolla al día	Suplemento vitamínico
460	LEVADURA SANTE FRASCO X100TAB	Tableta	Suplemento nutricional de levadura de cerveza	Image-not-found.png	10.1100	0.0000	{"FRASCO": [1, 16.0]}	Levadura de cerveza	1	f	4	0.3700	normal	Tomar según indicación médica	Suplemento nutricional
463	MANA SOBRE (LAXANTE) 1 ONZ	Sobre	Laxante	Image-not-found.png	5.4800	0.0000	{"SOBRE": [1, 10.0]}	No especificado	9	f	4	0.0000	normal	1 onza	Estimula el movimiento intestinal
470	NEO GRIPINA 500 MG INYECTADO	Inyectable	Analgésico y antipirético	Image-not-found.png	4.7500	0.0000	{"AMPOLLA": [1, 8.0]}	Dipirona	0	f	4	0.4100	normal	500 mg por vía intramuscular	Alivio del dolor y la fiebre
472	NEOFEBRINA SUPOSITORIO NIÑOS 300 MGS CAJA X 5	Supositorio	Antipirético pediátrico	Image-not-found.png	7.2800	0.0000	{"CAJA": [5, 60.0], "SUPOSITORIO": [1, 12.0]}	Paracetamol	5	f	4	0.3900	normal	1 supositorio cada 6 horas	Alivia la fiebre en niños
516	TALCO SUDORIN 110 GRS	Polvo	Antisudorífico y desodorante	Image-not-found.png	11.5000	0.0000	{"BOTE": [1, 18.0]}	Talco	1	f	4	0.3600	normal	Según necesidad	Absorción de la humedad y prevención de irritaciones
517	TENSIL 25 MG CAJA X 40 BLIST X 20	Tabletas	Antihipertensivo	Image-not-found.png	0.1100	0.0000	{"CAJA": [40, 8.6], "BLISTER": [20, 4.3]}	Enalapril	1940	f	4	0.4900	normal	Según indicación médica	Reducción de la presión arterial
518	TERMOMETRO DE CINTA MEDITEM FRONT	Dispositivo de medición	Termómetro para medir la temperatura corporal	Image-not-found.png	15.5500	0.0000	{"UNIDAD": [1, 25.0]}	No especificado	2	f	4	0.3800	normal	Según necesidad	Medición de la temperatura
526	VITAFLENACO GEL TOPICA 20 G	Gel tópico	Alivio de dolores musculares y articulares	Image-not-found.png	22.8000	0.0000	{"BOTE": [1, 38.0]}	Diclofenaco	1	f	4	0.4000	normal	Aplicar una pequeña cantidad en la zona afectada y masajear suavemente	Antiinflamatorio y analgésico
528	VITANERVO 25,000 KIT AMP PIERSAN	Ampollas	Suplemento vitamínico	Image-not-found.png	9.8500	0.0000	{"KIT": [1, 19.0]}	Vitaminas del complejo B	3	f	4	0.4800	normal	Seguir las indicaciones del médico	Suplemento vitamínico
492	RELAFLEX KIT AMPOLLA VIJOSA	Ampollas	Kit de relajación muscular	Image-not-found.png	0.0000	0.0000	{"KIT": [1, 45.0]}	No especificado	0	f	4	1.0000	normal	Según indicaciones del médico	Relajante muscular
468	NAUSEOL INFANTIL SUPOSITORIOS X 6 BONIN	Supositorio	Antiemético pediátrico	Image-not-found.png	4.3800	0.0000	{"SUPOSITORIO": [1, 8.0]}	Metoclopramida	6	f	4	0.4500	normal	1 supositorio cada 6 horas	Alivia las náuseas en niños
473	NEOMELUBRINA CAJA X 5 SUPOSITORIOS	Supositorios	Analgésico y antipirético	Image-not-found.png	7.2000	0.0000	{"CAJA": [5, 55.0], "SUPOSITORIO": [1, 11.0]}	Dipirona	3	f	4	0.3500	normal	1 supositorio cada 6 horas	Analgésico y antipirético
478	NEUMONIL G X 60 TABS	Tabletas	Mucolítico y expectorante	Image-not-found.png	1.5200	0.0000	{"TABLETA": [1, 2.5]}	Ambroxol	32	f	4	0.3900	normal	1 tableta cada 12 horas	Mucolítico y expectorante
482	OTIK GOTAS	Gotas óticas	Antibiótico para infecciones del oído	Image-not-found.png	13.5000	0.0000	{"FRASCO": [1, 23.0]}	Ofloxacino	6	f	4	0.4100	normal	Según indicación médica	Antibiótico
484	PANADOL NIÑOS DISP X 100 TAB MASTIC	Tabletas masticables	Alivio del dolor y fiebre en niños	Image-not-found.png	0.6100	0.0000	{"DISPENSADOR": [48, 48.0], "TABLETA": [1, 1.0]}	Paracetamol	45	f	4	0.3900	normal	Según peso y edad del niño	Analgésico y antipirético
487	PASIFLORA COMP CAJA X 30 BLISTER X 10	Cápsulas	Suplemento natural para la ansiedad	Image-not-found.png	1.6900	0.0000	{"CAJA": [30, 81.0], "BLISTER": [10, 27.0], "TABLETA": [1, 2.7]}	Pasiflora	36	f	4	0.3700	normal	Según indicaciones del médico	Ansiolítico natural
505	SUERO MIXTO 5% FCO 500 ML	Solución inyectable	Rehidratación y reposición de electrolitos en casos de deshidratación	Image-not-found.png	11.0400	0.0000	{"FRASCO": [1, 19.0]}	Cloruro de sodio, cloruro de potasio, cloruro de calcio	1	f	4	0.4200	normal	Según indicación médica	Solución electrolítica
493	REUMETAN CREMA 30 GRS. TUBO	Crema	Antiinflamatorio tópico	Image-not-found.png	22.7500	0.0000	{"CREMA": [1, 35.0]}	Diclofenaco	1	f	4	0.3500	normal	Aplicar una capa delgada sobre la zona afectada 2-3 veces al día	Antiinflamatorio, analgésico
494	REUMETAN S 25 MG BLIST X 10 CAJA X 100	Tabletas	Antiinflamatorio no esteroideo	Image-not-found.png	0.4750	0.0000	{"BLISTER": [10, 8.0], "CAJA": [100, 80.0]}	Diclofenaco sódico	90	f	4	0.4100	normal	1 tableta cada 8 horas	Antiinflamatorio, analgésico
495	ROWACHOL BLISTER X 10 CAJA X 50 GEL CPAS	Cápsulas	Suplemento dietético para la función hepática	Image-not-found.png	3.4730	0.0000	{"BLISTER": [10, 60.0], "CAJA": [50, 300.0], "GELATINA BLANDA": [1, 6.0]}	Aceites esenciales	12	f	4	0.4200	normal	1 cápsula 3 veces al día	Hepatoprotector
504	SUDAGRIP CAJA X 12 CAPSULAS	Cápsulas	Alivio de los síntomas de la gripe y resfriado común	Image-not-found.png	1.0300	0.0000	{"CAJA": [12, 30.0], "CAPSULA": [1, 2.5]}	Paracetamol, fenilefrina, clorfenamina	0	f	4	0.5900	normal	Tomar 1 cápsula cada 6 horas	Analgésico, descongestionante nasal, antihistamínico
512	TABCIN LIQUID GEL NOCHE X 30	Cápsulas líquidas	Alivio de los síntomas de gripe y resfriado durante la noche	Image-not-found.png	3.3900	0.0000	{"GELATINA BLANDA": [1, 5.0]}	Paracetamol, fenilefrina	30	f	4	0.3200	normal	Tomar 1 cápsula cada 6 horas antes de dormir	Analgésico, descongestionante nasal
513	TABCIN NIÑOS DISP X 48 BLIST X 12 MASTIC	Tabletas masticables	Analgésico y antipirético	Image-not-found.png	0.9000	0.0000	{"BLISTER": [12, 18.0], "EFERVECENTE": [1, 1.5]}	Paracetamol	21	f	4	0.4000	normal	Según indicación médica	Alivio del dolor y reducción de la fiebre
532	XIRMEN 4 MG /2 ML X 1 AMP INYECT	Ampolla inyectable	Antiinflamatorio	Image-not-found.png	28.2500	0.0000	{"AMPOLLA": [1, 48.0]}	Dexametasona	1	f	4	0.4100	normal	Seguir las indicaciones del médico	Antiinflamatorio
525	VIRO GRIP GRIPE Y TOS JBE 120 ML	Jarabe	Alivio de los síntomas de gripe y tos	Image-not-found.png	0.0000	0.0000	{"JARABE": [1, 35.0]}	Paracetamol, fenilefrina y dextrometorfano	0	f	4	1.0000	normal	Tomar la dosis indicada por el médico	Antipirético, descongestionante y antitusígeno
457	KOLIT BLISTER X 5 TAB	Tableta	Para aliviar los síntomas de la colitis	Image-not-found.png	2.0500	0.0000	{"BLISTER": [5, 17.5], "TABLETA": [1, 3.5]}	No aplica	18	f	4	0.4100	normal	Según indicación médica	Alivio de síntomas de colitis
458	KURA KURA LATA 13 GRS	Crema	Crema para el cuidado de la piel	Image-not-found.png	10.9400	0.0000	{"FRASCO": [1, 18.0]}	No aplica	2	f	4	0.3900	normal	Aplicar según necesidad	Cuidado de la piel
465	MENTOL DAVIS GRANDE 12 GRS	Crema	Alivio de dolores musculares y de cabeza	Image-not-found.png	6.0000	0.0000	{"CREMA": [1, 10.0]}	Mentol	2	f	4	0.4000	normal	12 gramos	Analgésico y refrescante
466	MEPROGESICO II  BLISTER X 10	Tableta	Analgésico y antipirético	Image-not-found.png	3.6600	0.0000	{"BLISTER": [10, 60.0], "CAPSULA": [1, 6.0]}	Meprobamato	14	f	4	0.3900	normal	1 tableta cada 6 horas	Relajante muscular y calmante del dolor
467	NAUSEOL 1 ML X 1 AMPOLLA	Ampolla	Antiemético	Image-not-found.png	5.4600	0.0000	{"AMPOLLA": [1, 10.0]}	Metoclopramida	2	f	4	0.4500	normal	1 ml por vía intramuscular	Controla las náuseas y vómitos
461	LICOPODIO BOLSA X 32 SOBRES DISFAVIL	Sobre	Suplemento dietético de licopodio	Image-not-found.png	0.0000	0.0000	{"BOLSA": [32, 160.0], "SOBRE": [1, 5.0]}	Licopodio	0	f	4	1.0000	normal	Tomar según indicación médica	Suplemento dietético
459	LASSAR CREMA LAFCO 120 GRS	Crema	Crema para el tratamiento de dermatitis del pañal	Image-not-found.png	14.7500	0.0000	{"CREMA": [1, 25.0]}	Óxido de zinc	2	f	4	0.4100	normal	Aplicar en la zona afectada según indicación médica	Tratamiento de dermatitis del pañal
488	PEZONERA DE VIDRIO EDIGAR	Dispositivo para lactancia	Protección de los pezones durante la lactancia	Image-not-found.png	0.0000	0.0000	{"FRASCO": [1, 20.0]}	No aplica	0	f	4	1.0000	normal	Según necesidad	Dispositivo de protección
498	SCUDO ORO ESTRIADO CAJA X 3	Condón	Preservativo	Image-not-found.png	0.0000	0.0000	{"CAJA": [3, 24.0]}	No especificado	0	f	4	1.0000	normal	Uso único	Prevención de enfermedades de transmisión sexual
522	UNI-PULMIN ANTIGRIPAL CAJA X 25 SOBRES	Sobres granulados	Antigripal	Image-not-found.png	0.0000	0.0000	{"CAJA": [25, 87.5], "SOBRE": [1, 3.5]}	Paracetamol, clorfenamina, fenilefrina	0	f	4	1.0000	normal	Según indicación médica	Alivio de los síntomas gripales
474	NEOMELUBRINA JBE 100 ML	Jarabe	Analgésico y antipirético	Image-not-found.png	52.5000	0.0000	{"JARABE": [1, 79.0]}	Dipirona	1	f	4	0.3400	normal	Según indicación médica	Analgésico y antipirético
475	NERVADEN CAJA X 30 BLIST X 10 CAPS	Cápsulas	Suplemento vitamínico	Image-not-found.png	2.7300	0.0000	{"CAJA": [30, 132.0], "BLISTER": [10, 44.0], "CAPSULA": [1, 4.4]}	Vitaminas del complejo B	33	f	4	0.3800	normal	1 cápsula al día	Suplemento vitamínico
490	POMADA GMS 12 GRS	Pomada	Cicatrizante y protector de la piel	Image-not-found.png	8.4000	0.0000	{"CREMA": [1, 14.0]}	No especificado	4	f	4	0.4000	normal	Según necesidad	Cicatrizante y protector
491	POMADA GMS TARRO 50 GRS	Pomada	Cicatrizante y protector de la piel	Image-not-found.png	31.2500	0.0000	{"CREMA": [1, 49.0]}	No especificado	1	f	4	0.3600	normal	Según necesidad	Cicatrizante y protector
499	SCUDO ORO RETARDANTE CAJA X 3	Condón	Preservativo con retardante	Image-not-found.png	4.7230	0.0000	{"CAJA": [3, 24.0]}	No especificado	6	f	4	0.4100	normal	Uso único	Prevención de enfermedades de transmisión sexual, retardante de eyaculación
506	TABCIN AD FM EF DISPEN X 72 SOBRES(CELESTE)	Sobres efervescentes	Alivio de los síntomas de gripe y resfriado común	Image-not-found.png	1.2600	0.0000	{"SOBRE": [1, 2.5]}	Paracetamol, fenilefrina, clorfenamina	41	f	4	0.0000	normal	Tomar 1 sobre cada 6 horas	Analgésico, descongestionante nasal, antihistamínico
523	VICK TARRO 100 GRS	Pomada	Alivio de dolores musculares y articulares	Image-not-found.png	41.1100	0.0000	{"FRASCO": [1, 68.0]}	Mentol y alcanfor	1	f	4	0.4000	normal	Aplicar una pequeña cantidad en la zona afectada y masajear suavemente	Analgésico y antiinflamatorio
529	VITAPYRENA DISP X50	Tabletas dispersables	Analgésico y antipirético	Image-not-found.png	2.0860	0.0000	{"SOBRE": [1, 3.5]}	Paracetamol	17	f	4	0.0000	normal	Tomar según necesidad	Analgésico y antipirético
533	ZORRITONE CARAMELO JENGIBRE POWER X 100	Caramelo	Alivio de la tos y la irritación de garganta	Image-not-found.png	0.3600	0.0000	{"UNIDAD": [1, 0.75]}	Jengibre	14	f	4	0.5200	normal	Chupar un caramelo cada 4 horas	Propiedades antiinflamatorias y antioxidantes del jengibre ayudan a calmar la tos y la irritación de garganta
476	NERVIFEN BLIST X 10 CAJA X 30 PHENIEL	Tabletas	Analgésico y antiinflamatorio	Image-not-found.png	0.7700	0.0000	{"BLISTER": [10, 12.0], "CAJA": [30, 36.0], "TABLETA": [1, 1.2]}	Ibuprofeno	26	f	4	0.3600	normal	Según indicación médica	Analgésico y antiinflamatorio
535	ACETAMINOFEN GOTAS 100 MG FCO 30 ML SELEC	Gotas	Alivio del dolor y la fiebre	Image-not-found.png	10.0000	0.0000	{"FRASCO": [1, 18.0]}	Acetaminofén	2	f	3	0.4400	normal	Según indicación médica	Analgésico, Antipirético
479	OJO DE AGUILA GOTAS	Gotas oftálmicas	Lubricante ocular	Image-not-found.png	9.1000	0.0000	{"FRASCO": [1, 16.0]}	Hialuronato de sodio	8	f	4	0.4300	normal	Según indicación médica	Lubricante ocular
486	PARCHE LEON	Parche transdérmico	Alivio del dolor localizado	Image-not-found.png	20.7500	0.0000	{"BOLSA": [1, 33.0]}	No especificado	2	f	4	0.3700	normal	Según indicaciones del médico	Analgésico tópico
489	PIOJINA SHAMPOO 60 ML SNTE	Shampoo	Tratamiento para la pediculosis	Image-not-found.png	7.2500	0.0000	{"BOTE": [1, 13.0]}	Piretrinas	2	f	4	0.4400	normal	Según indicaciones del médico	Pediculicida
497	SCUDO NATURAL CAJA X 3	Condón	Preservativo	Image-not-found.png	2.6000	0.0000	{"CAJA": [3, 14.0]}	No especificado	3	f	4	0.4400	normal	Uso único	Prevención de enfermedades de transmisión sexual
507	TABCIN EXTRA FUERTE X 60 EFERV (ROJO)	Tabletas efervescentes	Alivio de los síntomas de gripe y resfriado común	Image-not-found.png	1.4700	0.0000	{"EFERVECENTE": [1, 2.5]}	Paracetamol, fenilefrina, clorfenamina	63	f	4	0.4100	normal	Tomar 1 tableta cada 6 horas	Analgésico, descongestionante nasal, antihistamínico
519	TIAMINA 100 MG FCO X 10  ML PIERSAN	Solución oral	Suplemento vitamínico	Image-not-found.png	9.0000	0.0000	{"FRASCO": [1, 15.0]}	Tiamina	2	f	4	0.4000	normal	Según indicación médica	Aporte de vitamina B1
520	TINTURA DE YODO NEGRO 1 ONZ	Solución tópica	Antiséptico	Image-not-found.png	11.2500	0.0000	{"UNIDAD": [1, 19.0]}	Yodo	3	f	4	0.4100	normal	Según indicación médica	Desinfección de la piel
524	VICK TARRO 50 GRS	Pomada	Alivio de dolores musculares y articulares	Image-not-found.png	22.9800	0.0000	{"FRASCO": [1, 38.0]}	Mentol y alcanfor	2	f	4	0.4000	normal	Aplicar una pequeña cantidad en la zona afectada y masajear suavemente	Analgésico y antiinflamatorio
521	TIRA LECHE DE VIDRIO	Dispositivo de extracción de leche materna	Facilita la extracción de leche materna	Image-not-found.png	0.0000	0.0000	{"UNIDAD": [1, 39.0]}	No especificado	0	f	4	1.0000	normal	Según necesidad	Extracción de leche materna
531	XICONEURAL CAJA X 30 INDUCTOR DEL SUEÑO	Comprimidos	Inductor del sueño	Image-not-found.png	1.1800	0.0000	{"CAJA": [30, 75.0], "SOBRE": [1, 2.5]}	Zolpidem	20	f	4	0.5300	normal	Tomar un comprimido antes de dormir	Inductor del sueño
534	ABREXIL SUSP 120ML	Suspensión	Alivio de la congestión nasal y de los síntomas asociados al resfriado común	Image-not-found.png	20.4000	0.0000	{"SUSPENSION": [1, 45.0]}	Clorfenamina, Fenilefrina	3	f	3	0.5500	normal	Tomar 5 ml cada 6 horas	Antihistamínico, Descongestionante nasal
536	ACETAMINOFEN JBE 120 ML SELEC	Jarabe	Alivio del dolor y la fiebre	Image-not-found.png	8.0000	0.0000	{"JARABE": [1, 13.0]}	Acetaminofén	5	f	3	0.3800	normal	Según indicación médica	Analgésico, Antipirético
537	ACICLOVIR 400 MG BLIST X 10 CAJA X 50 SELEC	Comprimidos	Tratamiento de infecciones por herpes simple y herpes zóster	Image-not-found.png	1.0180	0.0000	{"BLISTER": [10, 20.0], "CAJA": [50, 100.0]}	Aciclovir	60	f	3	0.4900	normal	Tomar 1 comprimido cada 8 horas	Antiviral
541	ACIDO FOLICO 5 MG BLISTER X 20 CAJA X 100 SELEC	Comprimidos	Suplemento de ácido fólico en casos de deficiencia	Image-not-found.png	0.1120	0.0000	{"BLISTER": [20, 5.0], "CAJA": [100, 25.0]}	Ácido fólico	200	f	3	0.5500	normal	Según indicación médica	Suplemento vitamínico
538	ACICLOVIR 400 MG BLISTER X 10 CAJA X 100 CAPLIN	Comprimidos	Tratamiento de infecciones por herpes simple y herpes zóster	Image-not-found.png	0.6020	0.0000	{"BLISTER": [10, 12.0], "CAJA": [100, 120.0]}	Aciclovir	120	f	3	0.5000	normal	Tomar 1 comprimido cada 8 horas	Antiviral
539	ACICLOVIR 5% CREMA 10 GMS SELEC	Crema	Tratamiento tópico de infecciones por herpes labial	Image-not-found.png	5.1500	0.0000	{"CREMA": [1, 9.0]}	Aciclovir	3	f	3	0.4300	normal	Aplicar en la zona afectada cada 4 horas	Antiviral
540	ACICLOVIR 5% CREMA 15 GMS CAPLIN	Crema	Tratamiento tópico de infecciones por herpes labial	Image-not-found.png	6.6000	0.0000	{"CREMA": [1, 11.0]}	Aciclovir	3	f	3	0.4000	normal	Aplicar en la zona afectada cada 4 horas	Antiviral
544	ALBENDAZOL 200MG/5ML SUSP SELECPHARMA	Suspensión	Antiparasitario	Image-not-found.png	4.6500	0.0000	{"SUSPENSION": [1, 8.0]}	Albendazol	5	f	3	0.4200	normal	200mg/5ml	Antihelmíntico
542	AGUA DESTILADA PARA INYE 10 ML PROMEGAL	Solución inyectable	Solución estéril para uso en procedimientos médicos	Image-not-found.png	1.2000	0.0000	{"BOTE": [1, 2.5]}	Agua destilada	13	f	3	0.5200	normal	Según procedimiento médico	Solución estéril
543	AGUA OXIGENADA 3% SOL LORALVA 120 ML	Solución	Desinfectante y antiséptico tópico	Image-not-found.png	1.1000	0.0000	{"BOTE": [1, 2.0]}	Peróxido de hidrógeno	15	f	3	0.4500	normal	Según indicación médica	Antiséptico
545	ALCOHOL 120 ML ENFERMERITA 50 %	Solución	Desinfectante	Image-not-found.png	1.5000	0.0000	{"BOTE": [1, 2.5]}	Alcohol	11	f	3	0.4000	normal	50%	Antiséptico
546	ALERMINE CORT CAJA X 10 TABS	Tabletas	Antialérgico	Image-not-found.png	5.8000	0.0000	{"CAJA": [1, 10.0]}	Desloratadina	16	f	3	0.4200	normal	Desloratadina 5mg + Prednisona 5mg	Antihistamínico + Corticoide
547	ALERMINE CORT JBE 60 ML	Jarabe	Antialérgico	Image-not-found.png	38.6000	0.0000	{"JARABE": [1, 65.0]}	Desloratadina	1	f	3	0.4100	normal	Desloratadina 2.5mg/5ml + Prednisona 2.5mg/5ml	Antihistamínico + Corticoide
548	AMOXI+ACIDO CLAV 250MG SUSP 60 ML SELEC LEVECILIN	Suspensión	Antibiótico	Image-not-found.png	35.1000	0.0000	{"SUSPENSION": [1, 59.0]}	Amoxicilina + Ácido Clavulánico	2	f	3	0.4100	normal	Amoxicilina 250mg/5ml + Ácido Clavulánico 62.5mg/5ml	Antibacteriano
549	AMOXI+CLAV 875/125 CAJA X 14 TABS LEVECILIN AC BID	Tabletas	Antibiótico	Image-not-found.png	43.1500	0.0000	{"CAJA": [1, 72.0]}	Amoxicilina + Ácido Clavulánico	2	f	3	0.4000	normal	Amoxicilina 875mg + Ácido Clavulánico 125mg	Antibacteriano
550	AMOXICILINA 250 MG/ 120 ML SELECT	Suspensión	Antibiótico	Image-not-found.png	8.6000	0.0000	{"BOTE": [1, 19.0]}	Amoxicilina	6	f	3	0.5500	normal	250mg/5ml	Antibacteriano
558	BABY OR NOT PRUEBA DE EMBARAZO DISMEV	Prueba de embarazo	Determinar la presencia de embarazo	Image-not-found.png	4.5000	0.0000	{"SUPOSITORIO": [1, 10.0]}	Desconocido	7	f	3	0.5500	normal	No especificada	Detectar la hormona hCG en la orina para confirmar el embarazo
606	DICLOFENACO AMPOLLA 75 MGS	Ampolla	Antiinflamatorio no esteroideo	Image-not-found.png	0.7500	0.0000	{"AMPOLLA": [1, 4.0]}	Diclofenaco	19	f	3	0.8100	normal	75mg	Analgésico y antiinflamatorio
560	BIFONEX  CREMA 1% 15G SELEC TUBO	Crema	Tratamiento de infecciones fúngicas de la piel	Image-not-found.png	19.9000	0.0000	{"CREMA": [1, 34.0]}	Bifonazol	2	f	3	0.4100	normal	1%	Inhibición del crecimiento de hongos en la piel
562	BOSMAN  CAJA X 16 SOBRE X 3 CONDONES	Condón	Método anticonceptivo de barrera	Image-not-found.png	0.8400	0.0000	{"CAJA": [16, 26.72], "SOBRE": [1, 1.67]}	Látex	3	f	3	0.5000	normal	1 condón por uso	Prevención de embarazos no deseados y enfermedades de transmisión sexual
575	CIRUELAX FORTE CAJA X 24 BLIST X 12	Tabletas	Laxante fuerte	Image-not-found.png	0.2300	0.0000	{"CAJA": [24, 8.66], "BLISTER": [12, 4.33]}	No especificado	384	f	3	0.3600	normal	No especificado	Estimula el tránsito intestinal
578	CLORANF+DEXAMETASONA COLIRIO 15 ML SELEC	Colirio	Antiinflamatorio para ojos	Image-not-found.png	13.7000	0.0000	{"FRASCO": [1, 24.0]}	Cloranfenicol + Dexametasona	4	f	3	0.4300	normal	No especificado	Reduce la inflamación ocular
586	CLOTRIMAZOL OV VAG 100 MG CAJA X 6 CAPLIN	Óvulos vaginales	Antimicótico	Image-not-found.png	11.7000	0.0000	{"CAJA": [1, 20.0]}	Clotrimazol	2	f	3	0.4200	normal	100 mg por óvulo	Tratamiento de infecciones vaginales por hongos
598	DENGUINA CAJA X 100 BLIST X 10	Tableta	Medicamento utilizado para el tratamiento de la fiebre del dengue.	Image-not-found.png	0.0480	0.0000	{"CAJA": [100, 10.0], "BLISTER": [10, 1.0]}	No aplica	530	f	3	0.5200	normal	Según indicación médica	Tratamiento de la fiebre del dengue
599	DEXA+NEOMICINA 1 % OFTALMICA SELEC	Colirio	Colirio utilizado en el tratamiento de infecciones oculares.	Image-not-found.png	14.3000	0.0000	{"FRASCO": [1, 26.0]}	Dexametasona, Neomicina	2	f	3	0.4500	normal	Según indicación médica	Antiinflamatorio y antibiótico oftálmico
610	DROPA GEL (KETOPROFENO 2.5%) 50G	Gel	Antiinflamatorio tópico	Image-not-found.png	21.1500	0.0000	{"GELATINA BLANDA": [1, 40.0]}	Ketoprofeno	1	f	3	0.4700	normal	2.5%	Analgésico y antiinflamatorio
600	DEXAMETASONA AMPOLLA 8 MG CAPLIN	Ampolla	Medicamento corticoide utilizado en diversas condiciones inflamatorias.	Image-not-found.png	1.9200	0.0000	{"AMPOLLA": [1, 4.0]}	Dexametasona	10	f	3	0.5200	normal	Según indicación médica	Corticoide antiinflamatorio
616	EXFLU ANTIGRIPAL BLISTER X 10 CAJA X 70	Tabletas	Antigripal	Image-not-found.png	0.0500	0.0000	{"BLISTER": [10, 0.9], "CAJA": [70, 6.3]}	Descongestionante nasal, antitusígeno, antipirético	640	f	3	0.4400	normal	Varía según la presentación	Descongestionante nasal, antitusígeno, antipirético
589	COFAL TARRO 60 GRS AZUL	Pomada	Analgésico y antiinflamatorio	Image-not-found.png	0.0000	0.0000	{"BOTE": [1, 0.0]}	Salicilato de metilo, mentol y alcanfor	0	f	3	0.0000	normal	60 g por tarro	Alivio del dolor y la inflamación muscular
565	BRONCUROL NF BLIST X 10 TABS	Tabletas	Tratamiento de la tos y la congestión bronquial	Image-not-found.png	1.2600	0.0000	{"BLISTER": [10, 25.0], "TABLETA": [1, 2.5]}	Descongestionante bronquial	84	f	3	0.5000	normal	Tomar 1 tableta cada 4-6 horas según sea necesario	Mucolítico
551	AMOXIPLUS 625 MGS (AMOX+CLAV) BALAXI CAJA X 14	Tabletas	Antibiótico	Image-not-found.png	11.5000	0.0000	{"CAJA": [1, 22.5]}	Amoxicilina + Ácido Clavulánico	5	f	3	0.4900	normal	Amoxicilina 500mg + Ácido Clavulánico 125mg	Antibacteriano
555	ATORVASTATINA 40 MG SELEC (CARTOR) CJ X 20 BLIST X 10	Tableta	Reducción del colesterol y prevención de enfermedades cardiovasculares	Image-not-found.png	2.7280	0.0000	{"BLISTER": [10, 47.0], "CAJA": [20, 94.0]}	Atorvastatina	40	f	3	0.4200	normal	40 mg	Inhibición de la enzima HMG-CoA reductasa para reducir la síntesis de colesterol
556	AZITROMICINA 500 MGS CAJA X 3 UMEDICA	Tableta	Tratamiento de infecciones bacterianas	Image-not-found.png	6.6500	0.0000	{"CAJA": [1, 15.0]}	Azitromicina	8	f	3	0.5600	normal	500 mg	Inhibición de la síntesis de proteínas bacterianas
569	CEFIXIMA 400 MG CAJA X 5 CAPS SELEC	Cápsulas	Tratamiento de infecciones bacterianas como la gonorrea	Image-not-found.png	32.4000	0.0000	{"CAJA": [1, 52.0]}	Cefixima	2	f	3	0.3800	normal	Tomar 1 cápsula como dosis única	Antibiótico
572	CIPROFIBRATO 100MG BLISTER X 10 CAJA X 30 SELEC	Tabletas	Tratamiento de la hiperlipidemia	Image-not-found.png	1.8900	0.0000	{"BLISTER": [10, 33.0], "CAJA": [30, 99.0]}	Ciprofibrato	60	f	3	0.4300	normal	Tomar 1 tableta al día	Hipolipemiante
593	COLECTOR DE HECES C/PALETA 60ML	Solución	Dispositivo médico utilizado para la recolección de muestras de heces con una paleta incorporada.	Image-not-found.png	0.0000	0.0000	{"BOTE": [1, 3.0]}	No aplica	0	f	3	1.0000	normal	Seguir instrucciones del fabricante	No aplica
594	COLECTOR DE ORINA 120ML	Solución	Dispositivo médico utilizado para la recolección de muestras de orina.	Image-not-found.png	0.0000	0.0000	{"BOTE": [1, 3.0]}	No aplica	0	f	3	1.0000	normal	Seguir instrucciones del fabricante	No aplica
552	ANTIGRIP SOBRE X 4 TAB DISP X 100	Tabletas	Antigripal	Image-not-found.png	3.4400	0.0000	{"CAJA": [4, 24.0], "TABLETA": [1, 6.0]}	Paracetamol + Clorfenamina + Fenilefrina	12	f	3	0.4300	normal	Según indicaciones	Analgésico + Antihistamínico + Descongestionante
557	AZITROMICINA 500 MGS CAJA X 5 SELECT	Tableta	Tratamiento de infecciones bacterianas	Image-not-found.png	15.8000	0.0000	{"CAJA": [1, 27.0]}	Azitromicina	5	f	3	0.4100	normal	500 mg	Inhibición de la síntesis de proteínas bacterianas
566	CALAMINA LOCION 100ML CAPLIN	Loción	Alivio de la picazón y la irritación de la piel	Image-not-found.png	7.8000	0.0000	{"SPRAY": [1, 14.0]}	Calamina	3	f	3	0.4400	normal	Aplicar sobre la piel afectada según sea necesario	Antiprurítico
568	CEFADROXILO 500MG BLIS X 10 CAJA 50 TAB SELECT	Tabletas	Tratamiento de infecciones bacterianas como infecciones del tracto urinario	Image-not-found.png	0.8670	0.0000	{"BLIS": [10, 15.0], "CAJA": [50, 75.0]}	Cefadroxilo	40	f	3	0.4200	normal	Tomar 1 tableta cada 12 horas	Antibiótico
576	CLINDAMICINA 300 MG BLISTER X 10 MED PHARMA	Cápsulas	Antibiótico para infecciones bacterianas	Image-not-found.png	18.7500	0.0000	{"BLISTER": [10, 320.0], "TABLETA": [1, 32.0]}	Clindamicina	5	f	3	0.4100	normal	300 mg	Inhibe la síntesis de proteínas bacterianas
581	CLORFENIRAMINA 4 MG BLIS X 20 SELEC CAJA X 100	Tabletas	Antihistamínico para alergias	Image-not-found.png	0.0950	0.0000	{"BLISTER": [20, 4.0], "CAJA": [100, 20.0]}	Clorfeniramina	180	f	3	0.5300	normal	4 mg	Bloquea los receptores de histamina
582	CLORFENIRAMINA MALEATO 2MG JBE. SELECT	Jarabe	Antihistamínico para alergias	Image-not-found.png	6.0500	0.0000	{"JARABE": [1, 10.0]}	Clorfeniramina maleato	5	f	3	0.4000	normal	2 mg	Bloquea los receptores de histamina
584	CLOTRIMAZOL 1 % CREMA 20 GRS SELEC	Crema	Antimicótico	Image-not-found.png	5.6500	0.0000	{"CREMA": [1, 10.0]}	Clotrimazol	4	f	3	0.4400	normal	1 %	Inhibe el crecimiento de hongos y levaduras
612	ENALAPRIL 10 MGS BLISTER X 20  CAJA X 100 SELEC	Tableta	Antihipertensivo	Image-not-found.png	0.1760	0.0000	{"BLISTER": [20, 8.0], "CAJA": [100, 40.0]}	Enalapril	220	f	3	0.5600	normal	10mg	Inhibidor de la enzima convertidora de angiotensina
614	EX -FLU TOS 120 ML SELEC	Jarabe	Antitusígeno	Image-not-found.png	24.5500	0.0000	{"JARABE": [1, 41.0]}	Antitusígeno	4	f	3	0.4000	normal	Varía según la presentación	Antitusígeno
615	EXFLU AMPOLLA PANAL SELEC	Ampollas	Descongestionante nasal	Image-not-found.png	4.2100	0.0000	{"AMPOLLA": [1, 8.0]}	Descongestionante nasal	6	f	3	0.4700	normal	Varía según la presentación	Descongestionante nasal
553	ANTIGRIPITO INFANIL JBE 60 ML	Jarabe	Antigripal Infantil	Image-not-found.png	0.0000	0.0000	{"JARABE": [1, 29.0]}	Paracetamol + Fenilefrina + Dextrometorfano	0	f	3	1.0000	normal	Según indicaciones	Analgésico + Descongestionante + Antitusivo
588	COFAL FORTE TARRO 60 GRS ROJO	Pomada	Analgésico y antiinflamatorio	Image-not-found.png	0.0000	0.0000	{"BOTE": [1, 0.0]}	Salicilato de metilo, mentol y alcanfor	0	f	3	0.0000	normal	60 g por tarro	Alivio del dolor y la inflamación muscular
602	DEXASEL 0.5 MG BLISTR X 20 SELEC (DEXAMETASONA)	Tableta	Medicamento corticoide utilizado en diversas condiciones inflamatorias.	Image-not-found.png	0.0000	0.0000	{"BLISTER": [20, 19.0], "TABLETA": [1, 0.95]}	Dexametasona	0	f	3	1.0000	normal	Según indicación médica	Corticoide antiinflamatorio
573	CIPROFLOXACINA 500 MGS BLIST X 10 CAJA X 100	Tabletas	Antibiótico para infecciones bacterianas	Image-not-found.png	0.2640	0.0000	{"BLISTER": [10, 7.0], "CAJA": [100, 70.0]}	Ciprofloxacina	130	f	3	0.6200	normal	500 mg	Inhibe la replicación del ADN bacteriano
601	DEXANERVISEL KIT	Kit	Kit que contiene medicamentos para el tratamiento de la ansiedad y el estrés.	Image-not-found.png	11.4000	0.0000	{"KIT": [1, 19.0]}	No aplica	4	f	3	0.4000	normal	Según indicación médica	Tratamiento de la ansiedad y el estrés
605	DICLOFENACO ACIDO LIBRE 9MG FCO 120 ML SELE	Solución oral	Antiinflamatorio no esteroideo	Image-not-found.png	11.9000	0.0000	{"FRASCO": [1, 20.0]}	Diclofenaco	3	f	3	0.4100	normal	9mg/ml	Analgésico y antiinflamatorio
618	EX-FLU NIÑOS SINUS 120 ML	Jarabe	Descongestionante nasal	Image-not-found.png	12.9000	0.0000	{"FRASCO": [1, 23.0]}	Descongestionante nasal	1	f	3	0.4400	normal	Varía según la presentación	Descongestionante nasal
620	FERROCITON B CAJA X 10 AMP BEBIBLES	Ampollas bebibles	Suplemento de hierro	Image-not-found.png	45.6000	0.0000	{"CAJA": [10, 750.0], "AMPOLLA": [1, 75.0]}	Hierro	1	f	3	0.3900	normal	Varía según la presentación	Suplemento de hierro
567	CEFADROXILO 250MG/60ML SUS SELEC	Suspensión oral	Tratamiento de infecciones bacterianas como faringitis y amigdalitis	Image-not-found.png	12.5500	0.0000	{"SUSPENSION": [1, 22.0]}	Cefadroxilo	5	f	3	0.4300	normal	Según indicación médica	Antibiótico
570	CIKRASEL 40G SPRAY	Spray	Alivio de la irritación de la garganta	Image-not-found.png	40.0500	0.0000	{"SPRAY": [1, 66.0]}	Descongestionante oral	2	f	3	0.3900	normal	Rociar en la garganta según sea necesario	Descongestionante
571	CIKRASEL CREMA TUBO 30GMS	Crema	Alivio de la picazón y la irritación de la piel	Image-not-found.png	19.1000	0.0000	{"CREMA": [1, 35.0]}	Descongestionante tópico	2	f	3	0.4500	normal	Aplicar sobre la piel afectada según sea necesario	Antiprurítico
607	DICLOFENACO POT 50 MGS BLIST X 10 CAJA X 100 SELEC	Tableta	Antiinflamatorio no esteroideo	Image-not-found.png	0.1260	0.0000	{"BLISTER": [10, 2.5], "CAJA": [100, 25.0]}	Diclofenaco potásico	250	f	3	0.5000	normal	50mg	Analgésico y antiinflamatorio
609	DOLONERVISEL BLIST X 10 CAJA X 100	Tableta	Suplemento vitamínico para el sistema nervioso	Image-not-found.png	0.6520	0.0000	{"BLISTER": [10, 11.0], "CAJA": [100, 110.0]}	Vitaminas del complejo B	120	f	3	0.4100	normal	Varía según la vitamina	Suplemento vitamínico
617	EX-FLU KIT AMPOLLA SELEC	Kit	Descongestionante nasal	Image-not-found.png	10.6000	0.0000	{"KIT": [1, 20.0]}	Descongestionante nasal	3	f	3	0.4700	normal	Varía según la presentación	Descongestionante nasal
574	CIRUELAX 75 MG BLISTER X 10  GARDEN	Tabletas	Laxante suave	Image-not-found.png	1.5300	0.0000	{"BLISTER": [10, 25.0], "TABLETA": [1, 2.5]}	No especificado	37	f	3	0.3900	normal	75 mg	Estimula el tránsito intestinal
579	CLORANFENICOL 0.5% GOTAS 15 ML SELEC	Gotas oftálmicas	Antibiótico para infecciones oculares	Image-not-found.png	8.8000	0.0000	{"FRASCO": [1, 16.0]}	Cloranfenicol	4	f	3	0.4500	normal	0.5%	Inhibe la síntesis de proteínas bacterianas
554	ANTIGRIPITO SOBRE X 4 TAB DISP X 100	Tableta	Tratamiento de los síntomas de la gripe y resfriado común	Image-not-found.png	2.5100	0.0000	{"SOBRE": [4, 18.0], "TABLETA": [1, 4.5]}	Desconocido	5	f	3	0.4400	normal	4 tabletas por sobre	Alivio de los síntomas de la gripe y resfriado
559	BETAMETASONA .05%+ACIDO SALICI 3% SELEC TUBO	Crema	Tratamiento de inflamaciones de la piel	Image-not-found.png	13.0500	0.0000	{"TUBO": [1, 23.0]}	Betametasona, Ácido Salicílico	3	f	3	0.4300	normal	0.05% Betametasona, 3% Ácido Salicílico	Acción antiinflamatoria y queratolítica en la piel
564	BRONCOMAT 15 ML SOL/PARA RAESPIRAR	Solución para inhalación	Alivio de la congestión nasal y bronquial	Image-not-found.png	35.0000	0.0000	{"BOTE": [1, 58.0]}	Descongestionante nasal	3	f	3	0.4000	normal	Inhalar 1-2 veces en cada fosa nasal según sea necesario	Descongestionante
583	CLOROMILAN CAJA X 102	Tabletas	Antibiótico	Image-not-found.png	0.0040	0.0000	{"CAJA": [102, 1.0]}	Cloranfenicol	6018	f	3	0.5900	normal	102 tabletas por caja	Inhibe la síntesis de proteínas en bacterias
585	CLOTRIMAZOL 1 % GEL TOPICO TUBO 20 GRS BALAXI	Gel tópico	Antimicótico	Image-not-found.png	3.6000	0.0000	{"TUBO": [1, 9.0]}	Clotrimazol	3	f	3	0.6000	normal	1 %	Tratamiento de infecciones por hongos en la piel
591	COLCHICINA 0.5 MG BLISTER X 20 CAJA X 100  SELEC	Tabletas	Antiinflamatorio	Image-not-found.png	0.5850	0.0000	{"BLISTER": [20, 20.0], "CAJA": [100, 100.0]}	Colchicina	120	f	3	0.4200	normal	0.5 mg por tableta, 20 tabletas por blister, 100 tabletas por caja	Tratamiento de la gota y otras condiciones inflamatorias
592	COLCHICINA 0.5MG BLISTER X 10 CAPLIN	Cápsulas	Antiinflamatorio	Image-not-found.png	6.0900	0.0000	{"BLISTER": [1, 10.0]}	Colchicina	8	f	3	0.3900	normal	0.5 mg por cápsula, 10 cápsulas por blister	Tratamiento de la gota y otras condiciones inflamatorias
595	COLECTOR ORINA PEDIATRICO BOLSA OPERSON	Bolsa	Dispositivo médico pediátrico utilizado para la recolección de muestras de orina en niños.	Image-not-found.png	1.3500	0.0000	{"BOLSA": [1, 3.0]}	No aplica	2	f	3	0.5500	normal	Seguir instrucciones del fabricante	No aplica
563	BROMURO DE OTILONIO CAJA X 30 BLIST X 15	Tabletas	Tratamiento de trastornos gastrointestinales como el síndrome de intestino irritable	Image-not-found.png	0.1560	0.0000	{"CAJA": [30, 7.6], "BLISTER": [15, 3.8]}	Bromuro de Otilonio	570	f	3	0.3800	normal	Tomar 1 tableta 3 veces al día	Antiespasmódico
613	EX -FLU ANTIGRIPAL GOTAS 30ML SELEC	Gotas	Antigripal	Image-not-found.png	14.1500	0.0000	{"FRASCO": [1, 25.0]}	Descongestionante nasal, antitusígeno, antipirético	2	f	3	0.4300	normal	Varía según la presentación	Descongestionante nasal, antitusígeno, antipirético
577	CLORA+DEXA+NAFA GOTAS SELEC	Gotas óticas	Antiinflamatorio y antimicrobiano para infecciones del oído	Image-not-found.png	15.7000	0.0000	{"FRASCO": [1, 28.0]}	Cloranfenicol + Dexametasona + Neomicina	4	f	3	0.4400	normal	No especificado	Combina efectos antiinflamatorios y antimicrobianos
580	CLORFENIRAMINA 10 MG AMP SELEC	Ampollas	Antihistamínico para alergias	Image-not-found.png	1.8900	0.0000	{"AMPOLLA": [1, 3.5]}	Clorfeniramina	3	f	3	0.4600	normal	10 mg	Bloquea los receptores de histamina
587	CLOTRIPLEX TUBO 15 GMS	Crema	Antimicótico	Image-not-found.png	9.5000	0.0000	{"TUBO": [1, 16.0]}	Clotrimazol	2	f	3	0.4100	normal	15 g por tubo	Tratamiento de infecciones por hongos en la piel
590	COLAGENO CAJA X 100 CAP GEL BLISTER X 10	Cápsulas de gel	Suplemento dietético	Image-not-found.png	0.9200	0.0000	{"CAJA": [100, 170.0], "BLISTER": [10, 17.0]}	Colágeno	100	f	3	0.4600	normal	100 cápsulas por caja, 10 cápsulas por blister	Contribuye a la salud de la piel, articulaciones y huesos
596	CROSPOVIDONA 20%  SUSP 60 ML SELEC	Suspensión	Medicamento utilizado como agente aglutinante y estabilizante en formulaciones farmacéuticas.	Image-not-found.png	34.0500	0.0000	{"SUSPENSION": [1, 58.0]}	Crospovidona	1	f	3	0.4100	normal	Según indicación médica	Agente aglutinante y estabilizante
597	CYCLOFEM AMPOLLA PANAL 1 ML	Ampolla	Anticonceptivo inyectable de larga duración.	Image-not-found.png	24.0000	0.0000	{"AMPOLLA": [1, 40.0]}	No aplica	2	f	3	0.4000	normal	Según indicación médica	Anticonceptivo
603	DICLOFENACO 1% GEL TUBO 20 GR SELECT	Gel	Antiinflamatorio tópico	Image-not-found.png	6.7000	0.0000	{"TUBO": [1, 12.0]}	Diclofenaco	3	f	3	0.4400	normal	1%	Analgésico y antiinflamatorio
604	DICLOFENACO 1% GEL TUBO 25 GR BALAXI	Gel	Antiinflamatorio tópico	Image-not-found.png	4.8000	0.0000	{"TUBO": [1, 9.0]}	Diclofenaco	3	f	3	0.4700	normal	1%	Analgésico y antiinflamatorio
608	DOLOFOR 500 MGS (DIPIRONA MAGNESICA) BLIST X 10	Tableta	Analgésico y antipirético	Image-not-found.png	1.1200	0.0000	{"BLISTER": [10, 20.0], "TABLETA": [1, 2.0]}	Dipirona magnésica	20	f	3	0.4400	normal	500mg	Analgésico y antipirético
619	FAMOTIDINA 40 MG CAJA X 100 TAB CAPLIN	Tabletas	Antiulceroso	Image-not-found.png	1.8000	0.0000	{"CAJA": [100, 500.0], "TABLETA": [1, 5.0]}	Famotidina	11	f	3	0.6400	normal	40 mg	Antagonista de los receptores H2
611	EFFCEE + ZINC  CAJA X 12 TAB. SOBRE X 4	Tableta efervescente	Suplemento vitamínico con zinc	Image-not-found.png	2.4000	0.0000	{"CAJA": [12, 54.0], "SOBRE": [4, 18.0]}	Vitaminas C y E, Zinc	16	f	3	0.4700	normal	Varía según la vitamina	Suplemento vitamínico
626	FLUFIN AM SOBRE 2 GEL CAPS CAPLIN	Cápsulas	Alivio de síntomas de alergias	Image-not-found.png	1.8000	0.0000	{"CAJA": [1, 3.5]}	Desconocido	10	f	3	0.4900	normal	2 cápsulas	Antihistamínico
621	FLUCONAZOL 150 MGS CAJA X 2 CAPS SELEC	Cápsulas	Tratamiento de infecciones fúngicas	Image-not-found.png	3.5500	0.0000	{"CAJA": [1, 6.0]}	Fluconazol	3	f	3	0.4100	normal	150 mg	Antifúngico
622	FLUCONAZOL 200 MG  X 2 CAP. CAPLIN	Cápsulas	Tratamiento de infecciones fúngicas	Image-not-found.png	2.4000	0.0000	{"CAJA": [1, 6.0]}	Fluconazol	3	f	3	0.6000	normal	200 mg	Antifúngico
623	FLUCONAZOL 200 MG X 4 CAPS HIPERFARMA	Cápsulas	Tratamiento de infecciones fúngicas	Image-not-found.png	8.7000	0.0000	{"CAPSULA": [1, 15.0]}	Fluconazol	7	f	3	0.4200	normal	200 mg	Antifúngico
624	FLUCONAZOL 200MG SELECT X2 TAB CAJA	Tabletas	Tratamiento de infecciones fúngicas	Image-not-found.png	4.4500	0.0000	{"CAJA": [1, 8.0]}	Fluconazol	3	f	3	0.4400	normal	200 mg	Antifúngico
625	FLUFIN ALERGIAS CAJA X 50 BLIS X 10 GEL BLANDA	Gel blanda	Alivio de síntomas de alergias	Image-not-found.png	0.0690	0.0000	{"CAJA": [50, 6.0], "BLISTER": [10, 1.2]}	Desconocido	520	f	3	0.4300	normal	50 blísters x 10 g	Antihistamínico
627	FUROSEMIDA 20 MG AMPOLLA 2 ML CAPLIN	Ampolla	Diurético	Image-not-found.png	2.2400	0.0000	{"AMPOLLA": [1, 4.0]}	Furosemida	4	f	3	0.4400	normal	20 mg	Diurético de asa
628	FUROSEMIDA 40 MG CAJA X 100 BLIST X 10 CAPLIN	Comprimidos	Diurético	Image-not-found.png	0.0840	0.0000	{"CAJA": [100, 30.0], "BLISTER": [10, 3.0]}	Furosemida	80	f	3	0.7200	normal	40 mg	Diurético de asa
631	GLIBENCLAMIDA 5 MG   BLISTER X 20 CAJA X 100 SELEC	Tableta	Tratamiento de la diabetes mellitus tipo 2	Image-not-found.png	0.0960	0.0000	{"BLISTER": [20, 4.0], "CAJA": [100, 20.0]}	Glibenclamida	140	f	3	0.5200	normal	5 mg	Estimulante de la secreción de insulina
629	FUROSEMIDA 40MG BLISTER X 10 SELEC	Comprimidos	Diurético	Image-not-found.png	0.2240	0.0000	{"BLISTER": [10, 5.0]}	Furosemida	190	f	3	0.5500	normal	40 mg	Diurético de asa
630	GENTAMICINA 80 MG/2ML AMPOLLA CAPLIN	Ampolla	Antibiótico	Image-not-found.png	1.2000	0.0000	{"AMPOLLA": [1, 3.0]}	Gentamicina	8	f	3	0.6000	normal	80 mg/2 ml	Antibiótico aminoglucósido
632	GLIMEPIRIDA 4 MG BLISTER X 10 CAJA X 100 CAPLIN	Tableta	Tratamiento de la diabetes mellitus tipo 2	Image-not-found.png	0.3360	0.0000	{"BLISTER": [10, 6.0], "CAJA": [100, 60.0]}	Glimepirida	60	f	3	0.4400	normal	4 mg	Estimulante de la secreción de insulina
634	GUAYACOLATO CON JBE.TOLU 120ML MENTOL HIPERFARM	Jarabe	Expectorante para el alivio de la tos	Image-not-found.png	14.4000	0.0000	{"JARABE": [1, 24.0]}	Guayacolato	3	f	3	0.4000	normal	Variable	Expectorante
633	GOTERO PLASTICO	Gotas	Administración de medicamentos en forma líquida por vía oral	Image-not-found.png	0.0000	0.0000	{"FRASCO": [1, 4.0]}	No aplica	0	f	3	1.0000	normal	Variable	No aplica
635	HIDROCORTISONA 0.25 SELEC	Crema	Antiinflamatorio tópico para afecciones de la piel	Image-not-found.png	8.1500	0.0000	{"JARABE": [1, 16.0]}	Hidrocortisona	2	f	3	0.4900	normal	0.25%	Antiinflamatorio
636	HIDROCORTIZONA 1% CREMA 30 GRS SELEC	Crema	Antiinflamatorio tópico para afecciones de la piel	Image-not-found.png	12.0000	0.0000	{"CREMA": [1, 20.0]}	Hidrocortisona	2	f	3	0.4000	normal	1%	Antiinflamatorio
646	LEVOFLOXACINA 500 MG BLIST X 10 SELEC UMEDICA	Tableta	Antibiótico	Image-not-found.png	12.9600	0.0000	{"BLISTER": [1, 28.0]}	Levofloxacina	4	f	3	0.5400	normal	500 mg	Inhibición de la síntesis de ADN bacteriano
702	TADALALFIL 20 MG X 4 TAB BALAXI DISP X 10 CAJITAS BLIST X 4	Tabletas	Tratamiento de la disfunción eréctil	Image-not-found.png	2.4600	0.0000	{"BLISTER": [4, 36.0], "TABLETA": [1, 9.0]}	Tadalafilo	6	f	3	0.7300	normal	20 mg	Vasodilatador
647	LIDOCAINA 1% 3,5 ML PROMEGAL	Solución inyectable	Anestésico local	Image-not-found.png	1.0800	0.0000	{"FRASCO": [1, 3.0]}	Lidocaína	6	f	3	0.6400	normal	1%	Bloqueo de los canales de sodio en las membranas celulares
661	METOCARBAMOL AMP SELECT	Ampolla	Relajante muscular	Image-not-found.png	3.9700	0.0000	{"AMPOLLA": [1, 8.0]}	Metocarbamol	8	f	3	0.5000	normal	Inyectable	Relajante muscular de acción central
663	METRONIDAZOL 125 MG SUSP 120 ML SELEC	Suspensión	Tratamiento de infecciones bacterianas	Image-not-found.png	7.4000	0.0000	{"SUSPENSION": [1, 13.0]}	Metronidazol	6	f	3	0.4300	normal	Oral	Antibiótico
666	METRONIDAZOL+ NIST CAJA 5 OV CAPLIN	Óvulos	Tratamiento de infecciones vaginales	Image-not-found.png	15.0000	0.0000	{"CAJA": [1, 26.0]}	Metronidazol + Nistatina	2	f	3	0.4200	normal	Vaginal	Antibiótico + Antifúngico
667	MICONAZOL 2% CREMA 15 GRS CAPLIN	Crema	Tratamiento de infecciones por hongos en la piel	Image-not-found.png	6.5000	0.0000	{"CREMA": [1, 12.0]}	Miconazol	2	f	3	0.4600	normal	Tópica	Antifúngico
707	TOSIFLEM JARABE 240 ML	Jarabe	Expectorante y antitusivo	Image-not-found.png	21.0000	0.0000	{"JARABE": [1, 37.0]}	Guaifenesina y dextrometorfano	4	f	3	0.4300	normal	240 ml	Fluidificante de secreciones y antitusivo
669	MUCOBROXOL 120 ML	Jarabe	Mucolítico para el tratamiento de la tos productiva	Image-not-found.png	16.8000	0.0000	{"FRASCO": [1, 32.0]}	Mucobroxol	5	f	3	0.4800	normal	Oral	Mucolítico
652	LUBRICANTE VIVE SASHET	Gel	Lubricante íntimo	Image-not-found.png	0.0000	0.0000	{"BOTE": [1, 6.0]}	No aplica	0	f	3	1.0000	normal	No aplica	Lubricante
720	VITAMINA E 1000 UI BLIST X 10 CAJA X 60 GELC KURANTIS	Cápsulas blandas	Suplemento vitamínico para la piel y el sistema inmunológico	Image-not-found.png	1.2600	0.0000	{"BLISTER": [10, 26.0], "CAJA": [60, 156.0]}	Vitamina E	50	f	3	0.5200	normal	1000 UI	Antioxidante
686	RECOVER 1 LT MELOCOTON	Jarabe	Bebida isotónica para la recuperación después de la actividad física	Image-not-found.png	13.6000	0.0000	{"BOTE": [1, 23.0]}	No especificado	1	f	3	0.4100	normal	1 litro	Rehidratante
699	SIMETICONA 40MG MAST BLIST X 10 SELEC CAJA X 30	Tableta masticable	Antiflatulento para gases intestinales	Image-not-found.png	0.0400	0.0000	{"BLISTER": [10, 0.7], "CAJA": [30, 2.1]}	Simeticona	940	f	3	0.4300	normal	Según indicación médica	Antiflatulento
721	VITAMINA E 400 IU BLIS X 10 GEL CAPS CAJA X 60  KURANTIS	Cápsulas blandas	Suplemento vitamínico para la piel y el sistema inmunológico	Image-not-found.png	0.0760	0.0000	{"BLIS": [10, 1.5], "CAJA": [60, 9.0]}	Vitamina E	380	f	3	0.4900	normal	400 UI	Antioxidante
648	LIDOCAINA 2% CAPLIN 3ML	Solución inyectable	Anestésico local	Image-not-found.png	1.0800	0.0000	{"FRASCO": [1, 3.0]}	Lidocaína	13	f	3	0.6400	normal	2%	Bloqueo de los canales de sodio en las membranas celulares
637	HIERRO +ACIDO FOLICO X 30 TAB. SELEC	Tableta	Suplemento de hierro y ácido fólico para prevenir o tratar la anemia	Image-not-found.png	9.5300	0.0000	{"CAJA": [30, 510.0], "TABLETA": [1, 17.0]}	Hierro, Ácido fólico	4	f	3	0.4400	normal	Variable	Suplemento nutricional
640	IRBERSARTAN 150 MGS CAJA X 30 BLIST X 10 SELEC	Tableta	Antihipertensivo para el control de la presión arterial	Image-not-found.png	1.7240	0.0000	{"CAJA": [30, 84.0], "BLISTER": [10, 28.0]}	Irbesartán	40	f	3	0.3800	normal	150 mg	Antihipertensivo
649	LOPERAMIDA 2MG CAJA X 100 BLIST X 20 SELECT	Tableta	Antidiarreico	Image-not-found.png	0.1500	0.0000	{"CAJA": [100, 50.0], "BLISTER": [20, 10.0]}	Loperamida	480	f	3	0.7000	normal	2 mg	Inhibición de la motilidad intestinal
651	LOSARTAN 50 MG BLIS X 10  CAJA X 100 BALAXI	Tableta	Tratamiento de la hipertensión arterial	Image-not-found.png	0.1440	0.0000	{"BLISTER": [10, 5.0], "CAJA": [100, 50.0]}	Losartan	140	f	3	0.7100	normal	50 mg	Antihipertensivo
658	MENOESTROGEN CAJA X 30 CAPS  BLIST X 10 FARMALINE	Cápsula	Terapia hormonal para el tratamiento de los síntomas de la menopausia	Image-not-found.png	9.2000	0.0000	{"CAJA": [30, 480.0], "BLISTER": [10, 160.0], "CAPSULA": [1, 16.0]}	No aplica	1	f	3	0.4300	normal	No aplica	Terapia hormonal
659	METFO+GLIB 850/5MG BLIST X 10 CAJA X 100 INFASA	Tableta	Antidiabético para el tratamiento de la diabetes tipo 2	Image-not-found.png	0.5840	0.0000	{"BLISTER": [10, 10.0], "CAJA": [100, 100.0]}	Metformina + Glibenclamida	130	f	3	0.4200	normal	850 mg + 5 mg	Antidiabético
638	IBUPROFEN 100MG/5ML SUSP SELEC	Suspensión oral	Analgésico y antiinflamatorio	Image-not-found.png	7.5000	0.0000	{"SUSPENSION": [1, 14.0]}	Ibuprofeno	4	f	3	0.4600	normal	100 mg/5 ml	Analgésico, Antiinflamatorio
714	UNIPEC 120 ML	Suspensión oral	Antipirético	Image-not-found.png	0.0000	0.0000	{"BOTE": [1, 0.0]}	Paracetamol	0	f	3	0.0000	normal	120ml	Analgésico y antipirético
654	MEBENDAZOL 100MG SUSP 30 ML SELEC	Suspensión oral	Antiparasitario para el tratamiento de infecciones por parásitos intestinales	Image-not-found.png	6.0000	0.0000	{"SUSPENSION": [1, 10.0]}	Mebendazol	3	f	3	0.4000	normal	100 mg/5 ml	Antiparasitario
722	ZIGNET PLUS CAJA X 10 TABS	Tabletas	Tratamiento de la hipertensión arterial	Image-not-found.png	0.0000	0.0000	{"CAJA": [10, 23.0], "TABLETA": [1, 2.3]}	Losartán potásico, Hidroclorotiazida	0	f	3	1.0000	normal	Una tableta al día	Antihipertensivo
656	MELOXICAM 15 MG/1.5 ML AMP SELEC	Ampolla	Antiinflamatorio no esteroideo para el tratamiento del dolor y la inflamación	Image-not-found.png	2.7600	0.0000	{"AMPOLLA": [1, 7.0]}	Meloxicam	8	f	3	0.6100	normal	15 mg/1.5 ml	Antiinflamatorio
682	PROPOLDERMA SPRAY BUCAL 30 ML	Spray	Alivio de la irritación bucal y de la garganta	Image-not-found.png	29.0000	0.0000	{"SPRAY": [1, 55.0]}	No especificado	3	f	3	0.4700	normal	30 ml	Antiinflamatorio
692	RECOVER DIABETICO LITRO COCO	Jarabe	Suplemento alimenticio para personas con diabetes	Image-not-found.png	17.4500	0.0000	{"BOTE": [1, 29.0]}	No especificado	1	f	3	0.4000	normal	Según indicación médica	Suplemento dietético
693	RECOVER DIABETICO LITRO MANZANA	Jarabe	Suplemento alimenticio para personas con diabetes	Image-not-found.png	17.4500	0.0000	{"BOTE": [1, 29.0]}	No especificado	1	f	3	0.4000	normal	Según indicación médica	Suplemento dietético
700	SOLUTO VITAL 15 ML	Solución	Suplemento vitamínico	Image-not-found.png	18.0000	0.0000	{"FRASCO": [1, 30.0]}	Vitaminas y minerales	2	f	3	0.4000	normal	15 ml	Suplemento nutricional
705	TINIDAZOL 500 MG BLIST X 10 CAJA X 100 CAPLIN	Tabletas	Antibiótico y antiparasitario	Image-not-found.png	0.3120	0.0000	{"BLISTER": [10, 6.0], "CAJA": [100, 60.0]}	Tinidazol	170	f	3	0.4800	normal	500 mg	Antibacteriano y antiparasitario
711	TRILOX 360 ML	Suspensión oral	Antibiótico	Image-not-found.png	16.8000	0.0000	{"BOTE": [1, 28.0]}	Amoxicilina y ácido clavulánico	4	f	3	0.4000	normal	360ml	Antibacteriano
712	TRIMETOPRIM 120 ML SELEC (SULFABAC)	Suspensión oral	Antibiótico	Image-not-found.png	9.8500	0.0000	{"BOTE": [1, 16.0]}	Trimetoprim y sulfametoxazol	8	f	3	0.3800	normal	120ml	Antibacteriano
716	VENDA ELASTICA 3 X 5	Venda elástica	Compresión y soporte en lesiones moderadas	Image-not-found.png	3.9000	0.0000	{"BOLSA": [1, 8.0]}	No aplica	2	f	3	0.5100	normal	3 pulgadas x 5 yardas	Soporte y compresión
717	VENOTROPA X 30CAPS FARMALIN	Cápsulas	Mejora la circulación venosa	Image-not-found.png	9.7000	0.0000	{"CAJA": [1, 16.0]}	No aplica	5	f	3	0.3900	normal	30 cápsulas	Flebotónico
675	PANTOPRAZOL 40 MG BLIST X 10 CAJA X 100 CAPLIN	Cápsulas	Antiulceroso	Image-not-found.png	0.8420	0.0000	{"BLISTER": [10, 15.0], "CAJA": [100, 150.0]}	Pantoprazol	100	f	3	0.4400	normal	40 mg	Inhibidor de la bomba de protones
639	IBUPROFENO+METOCARBA CAJA X 30 BLIST X 10	Tableta	Analgésico y antiespasmódico	Image-not-found.png	0.1040	0.0000	{"CAJA": [30, 5.7], "BLISTER": [10, 1.9]}	Ibuprofeno, Metocarbamol	600	f	3	0.4500	normal	Variable	Analgésico, Antiespasmódico
677	PIROXICAM AMPOLLA 40 MGS	Ampolla	Antiinflamatorio no esteroideo	Image-not-found.png	1.5600	0.0000	{"AMPOLLA": [1, 4.0]}	Piroxicam	12	f	3	0.6100	normal	40 mg	Inhibidor de la síntesis de prostaglandinas
678	PREDNISONA 5MG BLIST X 20 CAJA X 100  SELEC	Tabletas	Corticosteroide	Image-not-found.png	0.2560	0.0000	{"BLISTER": [20, 10.0], "CAJA": [100, 50.0]}	Prednisona	140	f	3	0.4900	normal	5 mg	Antiinflamatorio, inmunosupresor
710	TRILOX 180 ML	Suspensión oral	Antibiótico	Image-not-found.png	11.6000	0.0000	{"BOTE": [1, 20.0]}	Amoxicilina y ácido clavulánico	4	f	3	0.4200	normal	180ml	Antibacteriano
687	RECOVER 500ML CEREZA	Jarabe	Bebida isotónica para la recuperación después de la actividad física	Image-not-found.png	9.4500	0.0000	{"BOTE": [1, 15.0]}	No especificado	2	f	3	0.3700	normal	500 ml	Rehidratante
694	RECOVER DIABETICO LITRO PIÑA	Jarabe	Suplemento alimenticio para personas con diabetes	Image-not-found.png	17.4500	0.0000	{"BOTE": [1, 29.0]}	No especificado	1	f	3	0.4000	normal	Según indicación médica	Suplemento dietético
695	RESTALER (LORATAD + BETA) CAJA X 10 TAB	Tableta	Antihistamínico para alergias	Image-not-found.png	2.0000	0.0000	{"CAJA": [1, 6.0]}	Loratadina + Betametasona	15	f	3	0.6700	normal	Según indicación médica	Antialérgico
697	SEXTRON (SILDENAFIL) 100 MG X 1TAB	Tableta	Tratamiento de la disfunción eréctil	Image-not-found.png	5.3000	0.0000	{"CAJA": [1, 9.0]}	Sildenafil	4	f	3	0.4100	normal	100 mg por dosis	Vasodilatador
706	TOALLITAS DE ALCOHOL X 200	Toallitas impregnadas	Desinfectante	Image-not-found.png	0.0780	0.0000	{"BOTE": [1, 0.25]}	Alcohol	208	f	3	0.6900	normal	200 unidades	Desinfección de la piel
713	UNICIL L-A 2.4 MEGA (PENI BENA) VIAL UNIPHARM	Solución inyectable	Antibiótico	Image-not-found.png	25.9500	0.0000	{"VIAL": [1, 47.0]}	Bencilpenicilina	2	f	3	0.4500	normal	2.4 millones de unidades	Antibacteriano
709	TRESBIOT 20 GRS CAPLIN	Cápsulas	Suplemento nutricional	Image-not-found.png	14.8000	0.0000	{"CAJA": [1, 25.0]}	No especificado	1	f	3	0.4100	normal	20g	Suplemento dietético
645	LANSOPRAZOL 30 MGS CAJA X 100 BLIST X 10 LOTUS	Cápsula	Inhibidor de la bomba de protones	Image-not-found.png	0.0380	0.0000	{"CAJA": [100, 7.0], "BLISTER": [10, 0.7]}	Lansoprazol	3150	f	3	0.4600	normal	30 mg	Reducción de la producción de ácido gástrico
653	LUBRICANTE VIVE SASHET 5 ML FRESA	Gel	Lubricante íntimo con sabor a fresa	Image-not-found.png	3.2000	0.0000	{"BOTE": [1, 6.0]}	No aplica	3	f	3	0.4700	normal	No aplica	Lubricante
657	MELOXICAN 15MG CAJA X 30 TABS BLIST X 10 SELEC	Tableta	Antiinflamatorio no esteroideo para el tratamiento del dolor y la inflamación	Image-not-found.png	0.3370	0.0000	{"CAJA": [30, 18.0], "BLISTER": [10, 6.0]}	Meloxicam	90	f	3	0.4400	normal	15 mg	Antiinflamatorio
662	METRIZOL V OVULOS CAJA X 10 (METRO+NISTA)	Óvulos	Tratamiento de infecciones vaginales	Image-not-found.png	23.3000	0.0000	{"CAJA": [10, 380.0], "SUPOSITORIO": [1, 38.0]}	Metronidazol + Nistatina	2	f	3	0.3900	normal	Vaginal	Antibiótico + Antifúngico
665	METRONIDAZOL 500 MGS X 10 OVULOS VAG CAPLIN	Óvulos	Tratamiento de infecciones vaginales	Image-not-found.png	14.4000	0.0000	{"CAJA": [1, 25.0]}	Metronidazol	2	f	3	0.4200	normal	Vaginal	Antibiótico
670	NERVISEL 10,000 AMPOLLA SELEC PANAL	Ampolla	Suplemento vitamínico para el sistema nervioso	Image-not-found.png	4.8000	0.0000	{"AMPOLLA": [1, 10.0]}	Complejo B	5	f	3	0.5200	normal	Inyectable	Suplemento vitamínico
671	NERVISEL 25,000  AMPOLLA PANAL SELECT	Ampolla	Tratamiento de trastornos neurológicos	Image-not-found.png	6.8400	0.0000	{"AMPOLLA": [1, 12.0]}	Nervisel	5	f	3	0.4300	normal	25,000 unidades	Neuroprotector
673	NERVISEL TABS BLIST X 10 CAJA X 30	Tabletas	Tratamiento de trastornos neurológicos	Image-not-found.png	0.5700	0.0000	{"BLISTER": [10, 10.0], "CAJA": [30, 30.0]}	Nervisel	40	f	3	0.4300	normal	25,000 unidades	Neuroprotector
683	RECOVER 1 LT CEREZA	Jarabe	Bebida isotónica para la recuperación después de la actividad física	Image-not-found.png	13.6000	0.0000	{"BOTE": [1, 23.0]}	No especificado	1	f	3	0.4100	normal	1 litro	Rehidratante
684	RECOVER 1 LT COCO	Jarabe	Bebida isotónica para la recuperación después de la actividad física	Image-not-found.png	13.6000	0.0000	{"BOTE": [1, 23.0]}	No especificado	1	f	3	0.4100	normal	1 litro	Rehidratante
641	IRBERSARTAN 300 MG CAJA X 30 BLIST X 10  SELEC	Tableta	Antihipertensivo	Image-not-found.png	1.8000	0.0000	{"CAJA": [30, 99.0], "BLISTER": [10, 33.0]}	Irbesartan	30	f	3	0.4500	normal	300 mg	Bloqueador de los receptores de angiotensina II
696	SALBUTAMOL 2MG 120 ML SELEC	Jarabe	Broncodilatador para problemas respiratorios	Image-not-found.png	5.7500	0.0000	{"BOTE": [1, 11.0]}	Salbutamol	2	f	3	0.4800	normal	Según indicación médica	Broncodilatador
703	TAPE-C B X 2 CAPLIN	Cápsulas	Analgésico y antipirético	Image-not-found.png	0.3600	0.0000	{"CAJA": [1, 1.5]}	Paracetamol y cafeína	2	f	3	0.7600	normal	2 cápsulas	Analgésico y estimulante
704	THIORELAX (TIOCOLCHICÓSICO) 8 MG X 10 TABS	Tabletas	Relajante muscular	Image-not-found.png	4.2850	0.0000	{"BLISTER": [1, 8.0]}	Tiocolchicosido	22	f	3	0.4600	normal	8 mg	Relajante muscular
708	TRAMADOL 50MG CAJA X 100 BLIST X 10 CAPLIN	Tabletas	Analgésico	Image-not-found.png	0.6600	0.0000	{"CAJA": [100, 120.0], "BLISTER": [10, 12.0]}	Tramadol	150	f	3	0.4500	normal	50mg	Analgésico opioide
715	VALSARTAN 80 MG CAJA X 30 TAB CAPLIN	Tabletas	Tratamiento de la hipertensión arterial	Image-not-found.png	18.0000	0.0000	{"CAJA": [1, 35.0]}	Valsartan	2	f	3	0.4900	normal	80 mg	Antihipertensivo
668	MIGRAPTAN (CLONIXATO + ERGOTAMINA) BLISTER  X 10	Tabletas	Tratamiento del dolor de cabeza por migraña	Image-not-found.png	0.0000	0.0000	{"BLISTER": [1, 2.0]}	Clonixato + Ergotamina	0	f	3	1.0000	normal	Oral	Analgésico + Vasoconstrictor
680	PRENATALES BLISTRER X 10 CAJA X 100  TABS CAPLIN	Tabletas	Suplemento vitamínico para embarazadas	Image-not-found.png	0.0000	0.0000	{"BLISTER": [10, 0.0], "CAJA": [100, 0.0]}	Vitaminas y minerales	0	f	3	0.0000	normal	Varios componentes	Suplemento nutricional
643	KETOROLACO 60MG/2ML AMPOLLA VIJOSA	Ampolla	Analgésico y antiinflamatorio no esteroideo	Image-not-found.png	6.7500	0.0000	{"AMPOLLA": [1, 13.0]}	Ketorolaco	10	f	3	0.4800	normal	60 mg/2 ml	Inhibidor de la síntesis de prostaglandinas
650	LOSARTAN 100 MG BLIS X 10 CAJA X 100 BALAXI	Tableta	Antihipertensivo	Image-not-found.png	0.3000	0.0000	{"BLISTER": [10, 7.0], "CAJA": [100, 70.0]}	Losartan	20	f	3	0.5700	normal	100 mg	Bloqueador de los receptores de angiotensina II
655	MEBENDAZOL 100MGX BLIST X 6 TAB	Tableta	Antiparasitario para el tratamiento de infecciones por parásitos intestinales	Image-not-found.png	2.4000	0.0000	{"BLISTER": [1, 4.0]}	Mebendazol	6	f	3	0.4000	normal	100 mg	Antiparasitario
660	METFORMINA 500 MG  BLIST X 10 CAJA X 30 SELEC	Tableta	Antidiabético para el tratamiento de la diabetes tipo 2	Image-not-found.png	0.4770	0.0000	{"BLISTER": [10, 8.33], "CAJA": [30, 24.99]}	Metformina	60	f	3	0.4300	normal	500 mg	Antidiabético
664	METRONIDAZOL 500 MG BLIST X 10 CAJA X 100  CAPLIN	Tabletas	Tratamiento de infecciones bacterianas	Image-not-found.png	0.2660	0.0000	{"BLISTER": [10, 5.0], "CAJA": [100, 50.0]}	Metronidazol	100	f	3	0.4700	normal	Oral	Antibiótico
674	OLMERSARTAN MEDOXOMIL 40 MGS BLIST X 10 AJA X 30 CAP	Cápsulas	Antihipertensivo	Image-not-found.png	2.9570	0.0000	{"BLISTER": [10, 49.0], "CAJA": [30, 147.0]}	Olmesartan medoxomil	40	f	3	0.4000	normal	40 mg	Bloqueador de receptores de angiotensina II
676	PIROXICAM 20 MG BLIST X 10 CAJA X 100	Cápsulas	Antiinflamatorio no esteroideo	Image-not-found.png	0.1080	0.0000	{"BLISTER": [10, 4.0], "CAJA": [100, 40.0]}	Piroxicam	240	f	3	0.7300	normal	20 mg	Inhibidor de la síntesis de prostaglandinas
681	PROPANOLOL 40 MG CAJA X 100 BLIST X 10 CAPLIN	Tabletas	Tratamiento de la hipertensión, angina de pecho, arritmias cardíacas y otros trastornos cardiovasculares	Image-not-found.png	0.1200	0.0000	{"CAJA": [100, 30.0], "BLISTER": [10, 3.0]}	Propranolol	130	f	3	0.6000	normal	40 mg	Antihipertensivo
679	PREGABALINA 150MGS CAJA X 10 TABS  CAPLIN	Cápsulas	Antiepiléptico, analgésico	Image-not-found.png	5.7400	0.0000	{"CAJA": [1, 9.5]}	Pregabalina	20	f	3	0.4000	normal	150 mg	Modulador de los canales de calcio
685	RECOVER 1 LT MANZANA	Jarabe	Bebida isotónica para la recuperación después de la actividad física	Image-not-found.png	13.6000	0.0000	{"BOTE": [1, 23.0]}	No especificado	1	f	3	0.4100	normal	1 litro	Rehidratante
688	RECOVER 500ML COCO	Jarabe	Bebida isotónica para la recuperación después de la actividad física	Image-not-found.png	9.4500	0.0000	{"BOTE": [1, 15.0]}	No especificado	1	f	3	0.3700	normal	500 ml	Rehidratante
689	RECOVER 500ML MANZANA	Jarabe	Bebida isotónica para la recuperación después de la actividad física	Image-not-found.png	9.4500	0.0000	{"BOTE": [1, 15.0]}	No especificado	1	f	3	0.3700	normal	500 ml	Rehidratante
690	RECOVER 500ML MELOCOTON	Jarabe	Bebida isotónica para la recuperación después de la actividad física	Image-not-found.png	9.4500	0.0000	{"BOTE": [1, 15.0]}	No especificado	2	f	3	0.3700	normal	500 ml	Rehidratante
691	RECOVER DIABETICO LITRO CEREZA	Jarabe	Suplemento alimenticio para personas con diabetes	Image-not-found.png	17.4500	0.0000	{"BOTE": [1, 29.0]}	No especificado	1	f	3	0.4000	normal	Según indicación médica	Suplemento dietético
698	SIMETICONA 100MG/ML GTS. FCO 30ML SELECT	Gotas	Antiflatulento para gases intestinales	Image-not-found.png	12.4000	0.0000	{"FRASCO": [1, 25.0]}	Simeticona	2	f	3	0.5000	normal	Según indicación médica	Antiflatulento
701	SULFACETAMIDA 10% 15 ML GOT SLECT	Gotas	Antibiótico tópico	Image-not-found.png	12.3000	0.0000	{"FRASCO": [1, 20.0]}	Sulfacetamida	1	f	3	0.3900	normal	10% 15 ml	Antibacteriano
718	VIRIMAN PLUS (TADALAFIL 20 MG SELEC) CAJA X 1 TAB	Tableta	Tratamiento de la disfunción eréctil	Image-not-found.png	4.4500	0.0000	{"CAJA": [1, 8.0]}	Tadalafilo	6	f	3	0.4400	normal	20 mg	Inhibidor de la fosfodiesterasa tipo 5
719	VITAMINA C 500 MG MASTICABLE BLIST, X 10 CAJA X 100	Tabletas masticables	Suplemento vitamínico para fortalecer el sistema inmunológico	Image-not-found.png	5.4000	0.0000	{"CAJA": [100, 1000.0], "BLISTER": [1, 10.0]}	Vitamina C	11	f	3	0.4600	normal	500 mg	Antioxidante
34	CLOTRIMAZOL 2 % CREMA VAG 30 GRS CAPLIN	Crema vaginal	Tratamiento de infecciones vaginales por hongos	Image-not-found.png	8.7500	0.0000	{"CREMA": [1, 16.0]}	CLOTRIMAZOL	2	f	2	0.4500	normal	Aplicar una cantidad suficiente de crema en la vagina una vez al día, preferiblemente antes de acostarse, durante 3 a 7 días	Antifúngico de amplio espectro que actúa impidiendo la síntesis del ergosterol en la membrana celular de los hongos, causando su muerte
6	ALBENDAZOL 400 MG SUSP FCO X 10 ML CAPLIN	Suspensión	Antiparasitario utilizado en el tratamiento de infecciones causadas por parásitos intestinales como lombrices y tenias.	Image-not-found.png	3.2500	0.0000	{"FRASCO": [1, 7.0]}	Albendazol	3	f	2	0.5400	normal	400 mg	Antihelmíntico de amplio espectro que actúa impidiendo la absorción de glucosa en los parásitos, lo que lleva a su muerte.
71	FEXADRIL(DEXCLO+BETAM) JBE 120 ML WINZER	Jarabe	Medicamento utilizado para aliviar la congestión nasal y la tos asociada con resfriados y alergias.	Image-not-found.png	59.9500	0.0000	{"JARABE": [1, 94.0]}	Dexclorfeniramina + Betametasona	1	f	2	0.3600	normal	Se recomienda tomar 5 ml cada 6 horas, no exceder de 4 dosis en 24 horas.	La dexclorfeniramina es un antihistamínico que ayuda a aliviar la congestión nasal y la picazón en la nariz y la garganta. La betametasona es un corticosteroide que reduce la inflamación y alivia la tos.
110	LORATADINA 10MG X BLIS X 20 CAJA X 100 SELEC	Tableta	Antihistamínico utilizado para aliviar los síntomas de la alergia, como estornudos, picazón en los ojos, nariz que moquea y urticaria.	Image-not-found.png	0.2100	0.0000	{"BLIS": [20, 8.0], "CAJA": [100, 40.0]}	Loratadina	260	f	2	0.4800	normal	10mg	Antihistamínico no sedante que actúa bloqueando la acción de la histamina en el cuerpo, reduciendo así los síntomas alérgicos.
302	SAL ANDREWS DISP X 50 SOBRES	Sobres	Sales de rehidratación oral para el tratamiento de la deshidratación causada por diarrea o vómito.	Image-not-found.png	0.8000	0.0000	{"CAJA": [50, 100.0], "SOBRE": [1, 2.0]}	Cloruro de Sodio, Citrato de Sodio, Glucosa	31	f	6	0.6000	normal	Seguir las instrucciones del médico o del fabricante.	Rehidratante y repositor de electrolitos.
451	GINGIVEX PINCELADAS FCO. 27 ML	Solución tópica	Enjuague bucal para encías inflamadas	Image-not-found.png	12.3500	0.0000	{"FRASCO": [1, 20.0]}	No aplica	3	f	4	0.3800	normal	Según indicaciones del médico	Antiinflamatorio para encías
462	MAGNESIA DE SALUD THERFAM DISPEN X 72 SOB	Sobre	Suplemento dietético de magnesio	Image-not-found.png	1.1100	0.0000	{"DISPENSADOR": [72, 144.0], "SOBRE": [1, 2.0]}	Magnesio	72	f	4	0.4500	normal	Tomar según indicación médica	Suplemento dietético
561	BIFONEX  SPRAY 1% 40 G SELEC	Spray	Tratamiento de infecciones fúngicas de la piel	Image-not-found.png	35.3000	0.0000	{"SPRAY": [1, 59.0]}	Bifonazol	1	f	3	0.4000	normal	1%	Inhibición del crecimiento de hongos en la piel
642	IRBESARTAN 150/12.5MG HIDROCLO X 30 TABS CAPLIN	Tableta	Antihipertensivo	Image-not-found.png	24.0000	0.0000	{"CAJA": [1, 38.33]}	Irbesartan + Hidroclorotiazida	2	f	3	0.3700	normal	150 mg + 12.5 mg	Bloqueador de los receptores de angiotensina II + Diurético
644	LAGRIMAS OCULARES GRS 15 ML GOTAS SELEC	Gotas	Hidratante ocular	Image-not-found.png	17.5500	0.0000	{"BOTE": [1, 30.0]}	No especificado	3	f	3	0.4200	normal	No especificado	Hidratación y lubricación del ojo
672	NERVISEL 25,000 KIT SELEC	Kit	Tratamiento de trastornos neurológicos	Image-not-found.png	9.1000	0.0000	{"KIT": [1, 17.0]}	Nervisel	4	f	3	0.4600	normal	25,000 unidades	Neuroprotector
\.


--
-- TOC entry 4918 (class 0 OID 57962)
-- Dependencies: 226
-- Data for Name: proveedores; Type: TABLE DATA; Schema: public; Owner: ownerfarmacia
--

COPY public.proveedores (id, direccion, tipo, telefono, proveedor_alternativo, estadisponible, contacto_2, contacto, nombre) FROM stdin;
2	5ta avenida A, 6-43 zona 4 terminal		24956767  23017474	\N	t	Ninguno	Jackeline 	BENDICION Y FE
3	ZONA 6		NINGUNO	\N	t	Ninguno	FERNANDO	ROSADEL
4	14 AV. 1-44 ZONA 6		23820300  Y 41493429	\N	t	LUCIA	JEIMY	COIDE
5	KM 15.5 CALZADA ROOSEVELT		24115454 Y 58745259	\N	t	\N	ALDO	INFASA
6	TERMINAL ZONA 4		48616661	\N	t	CALIN	JOSE 	BENDICION
7	ZONA 6		36506274	\N	t	\N	BENJAMIN	TORRE FUERTE
8	COLONIA GALILEA ZONA 18		39018114   36561884	\N	t	ISAAC	TELE VENTAS	GENESIS
9	7A AV. A 17-67 COL AURORA 1 ZONA 13		23084353 Y 30248155	\N	t	\N	DANY	OLAM
10	PINARES ZONA 18		55501596	\N	t	MOLINA	ESTUARDO	ESTUARDO
11	5A AV. 4-12 ZONA 1		24293300 Y 42197089	\N	t	\N	PAOLA	AMICELCO
12	PINARES ZONA 18		55501596	\N	t	\N	ESTUARDO	PRECIO BAJO
13	4ta CALLE 9-45 ZONA 1		24909090	\N	t	\N	SECRETARIA	LAFIMARQ
14	PINARES ZONA 18		55501596	\N	t	\N	ESTUARDO	TIENDA
15	5TA AV 8-38 ZONA 12 5TO NIVEL		24714638 Y 56312089	\N	t	\N	DANIEL	ROXVEL
16	TERMINAL ZONA 4		51557768	\N	t	\N	LUIS	RABI
17	35 CALLE 19-02 ZONA 12		23284050 Y 45264689	\N	t	\N	CELULA 6 	BOFASA
18	11 CALLE 3A Y 4TA AV ZONA 1		22518198	\N	t	\N		HOSPIGEN
19	PINARES ZONA 18		55501596	\N	t	\N	ESTUARDO	NO SISTEMA
20	ZONA 1		23367194	\N	t	\N		EL CISNE
21	TERMINAL ZONA 4		53627851 Y 23317184	\N	t	\N		ESQUINITA
22	TERMINAL ZONA 4		000	\N	t	\N		H & D
23	COL LANDIVAR ZONA 7		42153251	\N	t	HEIDY	ANDREA	NOE
24	CALZADA LA PAZ		000	\N	t	\N		PRICESMART
25	TERMINAL ZONA 4		0000	\N	t	\N		SILOE
26	TERMINAL ZONA 4		0000	\N	t	\N		TERMINAL
27	MERCADO ZONA 6		36421130 Y 59455669	\N	t	\N	WILLY Y NATY	WILLY 
28	UTATLAN		23134122 Y 30903118	\N	t	\N	LEONEL	ACANTO
29	NARANJO		53575871	\N	t	\N	ANDREA	ANDREA
30	TERMINAL ZONA 4		0000	\N	t	\N		BUEN PRECIO
31	ZACUALPILLA		55177792	\N	t	\N	CELIA	CELIA
32	ZONA 1		0000	\N	t	\N		CHINOS 
33	TIKAL FUTURA		00000	\N	t	\N		DONOVAN
34	TERMINAL ZONA 4		40869705	\N	t	\N	NOE	FE Y ALEGRIA
35	ZONA 14		57817776	\N	t	\N	HENRY	LA MERCED
36	ZONA 11		38898257	\N	t	\N	FABIOLA	LADI
37	ZONA 1		47170435	\N	t	\N		NISSI
38	ZONA 1		0000	\N	t	\N		QUIMICA UNIVERSAL 
39	TERMINAL ZONA 4		31036597	\N	t	\N	SAIDA	SAN FRANCISCO
40	ZONA 1		41530410	\N	t	\N	OSWALDO	SOLER
41	METRO NORTE ZONA 17		000	\N	t	\N		WALMART
42	ZONA 1		0000	\N	t	\N		BAYER
\.


--
-- TOC entry 4912 (class 0 OID 57929)
-- Dependencies: 220
-- Data for Name: ubicaciones; Type: TABLE DATA; Schema: public; Owner: ownerfarmacia
--

COPY public.ubicaciones (id, ubicacion, lugar_farmacia) FROM stdin;
11	COLGANTE 2	farmacia
2	GABETERO 1 GAVETA 1	farmacia
15	GABETERO 1 GAVETA 2	farmacia
16	GABETERO 1  GAVETA 3	farmacia
17	GABETERO 1  GAVETA 4	farmacia
18	GABETERO 1 GAVETA 5	farmacia
19	GABETERO 1 GAVETA 6	farmacia
20	GABETERO 1 GAVETA 7	farmacia
21	GABETERO 1 GAVETA 8	farmacia
22	GABETERO 1 GAVETA 9	farmacia
23	GABETERO 1 GAVETA 10	farmacia
24	GABETERO 1 GAVETA 11	farmacia
25	GABETERO 1 GAVETA 12	farmacia
26	GABETERO 1 GAVETA 13	farmacia
27	GABETERO 1 GAVETA 14	farmacia
28	GABETERO 1 GAVETA 15	farmacia
29	GABETERO 1 GAVETA 16	farmacia
31	GABETERO 1 GAVETA 17	farmacia
32	GABETERO 1 GAVETA 18	farmacia
33	GABETERO 1 GAVETA 19	farmacia
34	GABETERO 1 GAVETA 20	farmacia
104	GABETERO 3 GAVETA 25	farmacia
30	GABETERO 1 GAVETA 21	farmacia
35	GABETERO 1 GAVETA 22	farmacia
36	GABETERO 1 GAVETA 23	farmacia
37	GABETERO 1 GAVETA 24	farmacia
38	GABETERO 1 GAVETA 25	farmacia
39	GABETERO 1 GAVETA 26	farmacia
40	GABETERO 1 GAVETA 27	farmacia
41	GABETERO 1 GAVETA 28	farmacia
42	GABETERO 1 GAVETA 29	farmacia
43	GABETERO 1 GAVETA 30	farmacia
44	GABETERO 1 GAVETA 31	farmacia
45	GABETERO 1 GAVETA 32	farmacia
46	GABETERO 1 GAVETA 33	farmacia
47	GABETERO 2 GAVETA 1	farmacia
48	GABETERO 2 GAVETA 2	farmacia
49	GABETERO 2 GAVETA 3	farmacia
50	GABETERO 2 GAVETA 4	farmacia
51	GABETERO 2 GAVETA 5	farmacia
52	GABETERO 2 GAVETA 6	farmacia
53	GABETERO 2 GAVETA 7	farmacia
54	GABETERO 2 GAVETA 8	farmacia
55	GABETERO 2 GAVETA 9	farmacia
56	GABETERO 2 GAVETA 11	farmacia
57	GABETERO 2 GAVETA 12	farmacia
58	GABETERO 2 GAVETA 10	farmacia
59	GABETERO 2 GAVETA 13	farmacia
60	GABAETERO 2 GAVETA 14	farmacia
61	GABETERO 2 GAVETA 15	farmacia
62	GABETERO 2 GAVETA 16	farmacia
63	GABETERO 2 GAVETA 17	farmacia
65	GABETERO 2 GAVETA 18	farmacia
64	GABETERO 2 GAVETA 19	farmacia
66	GEBETERO 2 GAVETA 20	farmacia
67	GABETERO 2 GAVETA 21	farmacia
68	GABETERO 2 GAVETA 22	farmacia
69	GABETERO 2 GAVETA 23	farmacia
70	GABETERO 2 GAVETA 24	farmacia
71	GABETERO 2 GAVETA 25	farmacia
72	GABETERO 2 GAVETA 26	farmacia
73	GABETERO 2 GAVETA 27	farmacia
74	GABETERO 2 GAVETA 28	farmacia
75	GABETERO 2 GAVETA 29	farmacia
76	GABETERO 2 GAVETA 30	farmacia
77	GABETERO 2 GAVETA 31	farmacia
78	GABETERO 2 GAVETA 32	farmacia
79	GABETERO 2 GAVETA 33	farmacia
80	GABETERO 3 GAVETA 1	farmacia
81	GABETERO 3 GAVETA 2	farmacia
82	GABETERO 3 GAVETA 3	farmacia
83	GABETERO 3 GAVETA 4	farmacia
84	GABETERO 3 GAVETA 5	farmacia
85	GABETERO 3 GAVETA 6	farmacia
86	GABETERO 3 GAVETA 7	farmacia
87	GABETERO 2 GAVETA 8	farmacia
88	GABETERO 3 GAVETA 9	farmacia
89	GABETERO 3 GAVETA 10	farmacia
90	GABETERO 3 GAVETA 11	farmacia
91	GABETERO 3 GAVETA 12	farmacia
92	GABETERO 3 GAVETA 13	farmacia
93	GABETERO 2 GAVETA 14	farmacia
94	GABETERO 3 GAVETA 15	farmacia
95	GABETERO 3 GAVETA 16	farmacia
96	GABETERO 3 GAVETA 17	farmacia
97	GABETERO 3 GAVETA 18	farmacia
98	GABETERO 3 GAVETA 19	farmacia
99	GABETERO 3 GAVETA 20	farmacia
100	GABETERO 3 GAVETA 21	farmacia
101	GABETERO 3 GAVETA 22	farmacia
102	GABETERO 3 GAVETA 23	farmacia
103	GABETERO 3 GAVETA 24	farmacia
105	GABETERO 3 GAVETA 25	farmacia
106	GABETERO 3 GAVETA 26	farmacia
107	GABETERO 3 GAVETA 27	farmacia
108	GABETERO 3 GAVETA 28	farmacia
109	GABETERO 3 GAVETA 29	farmacia
111	GABETERO 3 GAVETA 30	farmacia
112	GABETERO 3 GAVETA 31	farmacia
113	GABETERO 3 GAVETA 32	farmacia
114	GABETERO 3 GAVETA 33	farmacia
115	MOSTRADOR ENTREPAÑO 1	farmacia
116	MOSTRADOR ENTREPAÑO 2	farmacia
117	MOSTRADOR ENTREPAÑO 3	farmacia
118	MOSTRADOR ENTREPAÑO 4	farmacia
6	VITRINA ENTREPAÑO 1	farmacia
119	VITRINA ENTREPAÑO 2	farmacia
120	VITRINA ENTREPAÑO 3	farmacia
121	VITRINA ENTREPAÑO 4	farmacia
122	VITRINA ENTREPAÑO 5	farmacia
123	VITRINA ENTREPAÑO 6	farmacia
125	ESTANTERIA 1 ENTREPAÑO 1	farmacia
126	ESTANTERIA 1 ENTREPAÑO 2	farmacia
127	ESTANTERIA 1 ENTREPAÑO 3	farmacia
128	ESTANTERIA 1 ENTREPAÑO 4	farmacia
129	ESTANTERIA 1 ENTREPAÑO 5	farmacia
130	ESTANTERIA 1 ENTREPAÑO 6	farmacia
131	ESTANTERIA 1 ENTREPAÑO 7	farmacia
10	COLGANTE 1	farmacia
132	ESTANTERIA 2 ENTREPAÑO 1	farmacia
133	ESTANTERIA 2 ENTREPAÑO 2	farmacia
134	ESTANTERIA 2 ENTREPAÑO 3	farmacia
135	ESTANTERIA 2 ENTREPAÑO 3	farmacia
136	ESTANTERIA 2 ENTREPAÑO 4	farmacia
137	ESTANTERIA 2 ENTREPAÑO 5	farmacia
138	ESTANTERIA 2 ENTREPAÑO 6	farmacia
139	ESTANTERIA 2 ENTREPAÑO 7	farmacia
140	ESTANTERIA 3 ENTREPAÑO 1	farmacia
141	ESTANTERIA 3 ENTREPAÑO 2	farmacia
142	ESTANTERIA 3 ENTREPAÑO 3	farmacia
143	ESTANTERIA 3 ENTREPAÑO 4	farmacia
144	ESTANTERIA 3 ENTREPAÑO 5	farmacia
145	ESTANTERIA 3 ENTREPAÑO 6	farmacia
146	ESTANTERIA 4 ENTREPAÑO 1	farmacia
147	ESTANTERIA 4 ENTREPAÑO 2	farmacia
148	ESTANTERIA 4 ENTREPAÑO 2	farmacia
149	ESTANTERIA 4 ENTREPAÑO 3	farmacia
150	ESTANTERIA 4 ENTREPAÑO 4	farmacia
151	ESTANTERIA 4 ENTREPAÑO 5	farmacia
152	ESTANTERIA 4 ENTREPAÑO 6	farmacia
153	ESTANTETRIA 5	farmacia
154	COLGANTE 3	farmacia
155	CAJITA 1 GAVETA 1	farmacia
156	CAJITA 1 GAVETA 2	farmacia
157	CAJITA 1 GAVETA 3	farmacia
158	CAJITA 1 GAVETA 4	farmacia
159	CAJITA 1 GAVETA 5	farmacia
160	CAJITA 1 GAVETA 6	farmacia
161	CAJITA 2 GAVETA 1	farmacia
162	CAJITA 2 GAVETA 2	farmacia
163	CAJITA 2 GAVETA 3	farmacia
164	CAJITA 2 GAVETA 4	farmacia
165	CAJITA 2 GAVETA 5	farmacia
166	CAJITA 2 GAVETA 6	farmacia
167	CAJITA 3 GAVETA 1	farmacia
168	CAJITA 3 GAVETA 2	farmacia
169	CAJITA 3 GAVETA 3	farmacia
170	CAJITA 3 GAVETA 4	farmacia
171	CAJITA 3 GAVETA 5	farmacia
172	CAJITA 3 GAVETA 6	farmacia
173	CAJITA 4 GAVETA 1	farmacia
174	CAJITA 4 GAVETA 2	farmacia
175	CAJITA 4 GAVETA 3	farmacia
176	CAJITA 4 GAVETA 4	farmacia
177	CAJITA 4 GAVETA 5	farmacia
178	CAJITA 4 GAVETA 6	farmacia
179	CAJITA 5 GAVETA 1	farmacia
180	CAJITA 5 GAVETA 2	farmacia
181	CAJITA 5 GAVETA 3	farmacia
182	CAJITA 5 GAVETA 4	farmacia
183	CAJITA 5 GAVETA 5	farmacia
184	CAJITA 5 GAVETA 6	farmacia
185	CAJITA 6 GAVETA 1	farmacia
186	CAJITA 6 GAVETA 2	farmacia
187	CAJITA 6 GAVETA 3	farmacia
188	CAJITA 6 GAVETA 4	farmacia
189	CAJITA 6 GAVETA 5	farmacia
190	CAJITA 6 GAVETA 6	farmacia
191	CAJITA 7 GAVETA 1	farmacia
192	CAJITA 7 GAVETA 2	farmacia
193	CAJITA 7 GAVETA 3	farmacia
194	CAJITA 7 GAVETA 4	farmacia
195	CAJITA 7 GAVETA 5	farmacia
196	CAJITA 7 GAVETA 6	farmacia
197	CAJITA 8 GAVETA 1	farmacia
198	CAJITA 8 GAVETA 2	farmacia
199	CAJITA 8 GAVETA 3	farmacia
200	CAJITA 8 GAVETA 4	farmacia
201	CAJITA 8 GAVETA 5	farmacia
202	CAJITA 8 GAVETA 6	farmacia
203	CAJITA 9 GAVETA 1	farmacia
204	CAJITA 9 GAVETA 2	farmacia
205	CAJITA 9 GAVETA 3	farmacia
206	CAJITA 9 GAVETA 4	farmacia
207	CAJITA 9 GAVETA 5	farmacia
208	CAJITA 9 GAVETA 6	farmacia
209	BODEGA	bodega
4	NO EXISTE	farmacia
210	PENDIENTE	farmacia
\.


--
-- TOC entry 4914 (class 0 OID 57941)
-- Dependencies: 222
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: ownerfarmacia
--

COPY public.usuario (id, user_name, rol, password) FROM stdin;
2	usuario	comun	c928005d023dc61698f5a07589e29c7b
1	admin	admin	45f5f206c771d7b768cfc37dec634a85
\.


--
-- TOC entry 4920 (class 0 OID 57993)
-- Dependencies: 228
-- Data for Name: venta; Type: TABLE DATA; Schema: public; Owner: ownerfarmacia
--

COPY public.venta (id, jornada, cantidad, fecha, product, isoferta, id_carrito, id_producto_cantidad, id_producto_presentacion) FROM stdin;
\.


--
-- TOC entry 4952 (class 0 OID 0)
-- Dependencies: 229
-- Name: carrito_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ownerfarmacia
--

SELECT pg_catalog.setval('public.carrito_id_seq', 1, false);


--
-- TOC entry 4953 (class 0 OID 0)
-- Dependencies: 236
-- Name: carrito_productos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ownerfarmacia
--

SELECT pg_catalog.setval('public.carrito_productos_id_seq', 1, false);


--
-- TOC entry 4954 (class 0 OID 0)
-- Dependencies: 232
-- Name: horario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ownerfarmacia
--

SELECT pg_catalog.setval('public.horario_id_seq', 1, false);


--
-- TOC entry 4955 (class 0 OID 0)
-- Dependencies: 234
-- Name: metodo_pago_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ownerfarmacia
--

SELECT pg_catalog.setval('public.metodo_pago_id_seq', 1, false);


--
-- TOC entry 4956 (class 0 OID 0)
-- Dependencies: 223
-- Name: pedidos_bodega_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ownerfarmacia
--

SELECT pg_catalog.setval('public.pedidos_bodega_id_seq', 1, false);


--
-- TOC entry 4957 (class 0 OID 0)
-- Dependencies: 239
-- Name: presentacion_producto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ownerfarmacia
--

SELECT pg_catalog.setval('public.presentacion_producto_id_seq', 957, true);


--
-- TOC entry 4958 (class 0 OID 0)
-- Dependencies: 237
-- Name: presentaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ownerfarmacia
--

SELECT pg_catalog.setval('public.presentaciones_id_seq', 5, true);


--
-- TOC entry 4959 (class 0 OID 0)
-- Dependencies: 217
-- Name: productos_cantidades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ownerfarmacia
--

SELECT pg_catalog.setval('public.productos_cantidades_id_seq', 668, true);


--
-- TOC entry 4960 (class 0 OID 0)
-- Dependencies: 215
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ownerfarmacia
--

SELECT pg_catalog.setval('public.products_id_seq', 722, true);


--
-- TOC entry 4961 (class 0 OID 0)
-- Dependencies: 225
-- Name: proveedores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ownerfarmacia
--

SELECT pg_catalog.setval('public.proveedores_id_seq', 43, true);


--
-- TOC entry 4962 (class 0 OID 0)
-- Dependencies: 219
-- Name: ubicaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ownerfarmacia
--

SELECT pg_catalog.setval('public.ubicaciones_id_seq', 210, true);


--
-- TOC entry 4963 (class 0 OID 0)
-- Dependencies: 221
-- Name: usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ownerfarmacia
--

SELECT pg_catalog.setval('public.usuario_id_seq', 2, true);


--
-- TOC entry 4964 (class 0 OID 0)
-- Dependencies: 227
-- Name: venta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ownerfarmacia
--

SELECT pg_catalog.setval('public.venta_id_seq', 1, false);


--
-- TOC entry 4730 (class 2606 OID 58010)
-- Name: carrito carrito_pkey; Type: CONSTRAINT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.carrito
    ADD CONSTRAINT carrito_pkey PRIMARY KEY (id);


--
-- TOC entry 4732 (class 2606 OID 58111)
-- Name: carrito_productos carrito_productos_pkey; Type: CONSTRAINT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.carrito_productos
    ADD CONSTRAINT carrito_productos_pkey PRIMARY KEY (id);


--
-- TOC entry 4734 (class 2606 OID 58041)
-- Name: horario horario_pkey; Type: CONSTRAINT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.horario
    ADD CONSTRAINT horario_pkey PRIMARY KEY (id);


--
-- TOC entry 4736 (class 2606 OID 58102)
-- Name: metodo_pago metodo_pago_pkey; Type: CONSTRAINT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.metodo_pago
    ADD CONSTRAINT metodo_pago_pkey PRIMARY KEY (id);


--
-- TOC entry 4724 (class 2606 OID 57955)
-- Name: pedidos_bodega pedidos_bodega_pkey; Type: CONSTRAINT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.pedidos_bodega
    ADD CONSTRAINT pedidos_bodega_pkey PRIMARY KEY (id);


--
-- TOC entry 4740 (class 2606 OID 58168)
-- Name: presentacion_producto presentacion_producto_pkey; Type: CONSTRAINT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.presentacion_producto
    ADD CONSTRAINT presentacion_producto_pkey PRIMARY KEY (id);


--
-- TOC entry 4738 (class 2606 OID 58161)
-- Name: presentaciones presentaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.presentaciones
    ADD CONSTRAINT presentaciones_pkey PRIMARY KEY (id);


--
-- TOC entry 4718 (class 2606 OID 57922)
-- Name: productos_cantidades productos_cantidades_pkey; Type: CONSTRAINT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.productos_cantidades
    ADD CONSTRAINT productos_cantidades_pkey PRIMARY KEY (id);


--
-- TOC entry 4716 (class 2606 OID 57915)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 4726 (class 2606 OID 57969)
-- Name: proveedores proveedores_pkey; Type: CONSTRAINT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.proveedores
    ADD CONSTRAINT proveedores_pkey PRIMARY KEY (id);


--
-- TOC entry 4720 (class 2606 OID 57934)
-- Name: ubicaciones ubicaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.ubicaciones
    ADD CONSTRAINT ubicaciones_pkey PRIMARY KEY (id);


--
-- TOC entry 4722 (class 2606 OID 57948)
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id);


--
-- TOC entry 4728 (class 2606 OID 57998)
-- Name: venta venta_pkey; Type: CONSTRAINT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.venta
    ADD CONSTRAINT venta_pkey PRIMARY KEY (id);


--
-- TOC entry 4760 (class 2620 OID 58127)
-- Name: carrito_productos trigger_actualizar_alinsertar_productos_carrito; Type: TRIGGER; Schema: public; Owner: ownerfarmacia
--

CREATE TRIGGER trigger_actualizar_alinsertar_productos_carrito AFTER INSERT ON public.carrito_productos FOR EACH ROW EXECUTE FUNCTION public.actualizar_alinsertar_productos_carrito();


--
-- TOC entry 4762 (class 2620 OID 74523)
-- Name: presentacion_producto trigger_actualizar_presentaciones; Type: TRIGGER; Schema: public; Owner: ownerfarmacia
--

CREATE TRIGGER trigger_actualizar_presentaciones AFTER INSERT ON public.presentacion_producto FOR EACH ROW EXECUTE FUNCTION public.actualizar_presentaciones();


--
-- TOC entry 4763 (class 2620 OID 66793)
-- Name: presentacion_producto trigger_actualizar_presentaciones_ondelete; Type: TRIGGER; Schema: public; Owner: ownerfarmacia
--

CREATE TRIGGER trigger_actualizar_presentaciones_ondelete AFTER DELETE ON public.presentacion_producto FOR EACH ROW EXECUTE FUNCTION public.actualizar_presentaciones_ondelete();


--
-- TOC entry 4758 (class 2620 OID 66789)
-- Name: productos_cantidades trigger_actualizar_products_por_details; Type: TRIGGER; Schema: public; Owner: ownerfarmacia
--

CREATE TRIGGER trigger_actualizar_products_por_details AFTER INSERT ON public.productos_cantidades FOR EACH ROW EXECUTE FUNCTION public.actualizar_products_por_details();


--
-- TOC entry 4759 (class 2620 OID 74526)
-- Name: productos_cantidades trigger_actualizar_products_por_details_ondelete; Type: TRIGGER; Schema: public; Owner: ownerfarmacia
--

CREATE TRIGGER trigger_actualizar_products_por_details_ondelete AFTER DELETE ON public.productos_cantidades FOR EACH ROW EXECUTE FUNCTION public.actualizar_products_por_details_ondelete();


--
-- TOC entry 4761 (class 2620 OID 58129)
-- Name: carrito_productos trigger_aldetallar_productos_carrito; Type: TRIGGER; Schema: public; Owner: ownerfarmacia
--

CREATE TRIGGER trigger_aldetallar_productos_carrito AFTER DELETE ON public.carrito_productos FOR EACH ROW EXECUTE FUNCTION public.actualizar_aleliminar_productos_carrito();


--
-- TOC entry 4750 (class 2606 OID 58130)
-- Name: carrito_productos fk_carrito; Type: FK CONSTRAINT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.carrito_productos
    ADD CONSTRAINT fk_carrito FOREIGN KEY (carrito) REFERENCES public.carrito(id) ON DELETE CASCADE;


--
-- TOC entry 4755 (class 2606 OID 58135)
-- Name: metodo_pago fk_id_carrito; Type: FK CONSTRAINT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.metodo_pago
    ADD CONSTRAINT fk_id_carrito FOREIGN KEY (id_carrito) REFERENCES public.carrito(id) ON DELETE CASCADE;


--
-- TOC entry 4754 (class 2606 OID 58056)
-- Name: horario fk_id_proveedor; Type: FK CONSTRAINT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.horario
    ADD CONSTRAINT fk_id_proveedor FOREIGN KEY (id_proveedor) REFERENCES public.proveedores(id) ON DELETE CASCADE;


--
-- TOC entry 4744 (class 2606 OID 57956)
-- Name: pedidos_bodega fk_pedidos_b; Type: FK CONSTRAINT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.pedidos_bodega
    ADD CONSTRAINT fk_pedidos_b FOREIGN KEY (id_product) REFERENCES public.productos_cantidades(id);


--
-- TOC entry 4756 (class 2606 OID 58169)
-- Name: presentacion_producto fk_presentacion; Type: FK CONSTRAINT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.presentacion_producto
    ADD CONSTRAINT fk_presentacion FOREIGN KEY (presentacion_id) REFERENCES public.presentaciones(id) ON DELETE CASCADE;


--
-- TOC entry 4751 (class 2606 OID 58180)
-- Name: carrito_productos fk_presentacion; Type: FK CONSTRAINT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.carrito_productos
    ADD CONSTRAINT fk_presentacion FOREIGN KEY (presentacion) REFERENCES public.presentacion_producto(id) ON DELETE CASCADE;


--
-- TOC entry 4742 (class 2606 OID 58076)
-- Name: productos_cantidades fk_product; Type: FK CONSTRAINT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.productos_cantidades
    ADD CONSTRAINT fk_product FOREIGN KEY (id_product) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4757 (class 2606 OID 58174)
-- Name: presentacion_producto fk_product; Type: FK CONSTRAINT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.presentacion_producto
    ADD CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4752 (class 2606 OID 58081)
-- Name: carrito_productos fk_producto; Type: FK CONSTRAINT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.carrito_productos
    ADD CONSTRAINT fk_producto FOREIGN KEY (producto) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4746 (class 2606 OID 136036)
-- Name: venta fk_producto_cantidad; Type: FK CONSTRAINT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.venta
    ADD CONSTRAINT fk_producto_cantidad FOREIGN KEY (id_producto_cantidad) REFERENCES public.productos_cantidades(id);


--
-- TOC entry 4753 (class 2606 OID 136051)
-- Name: carrito_productos fk_producto_cantidad; Type: FK CONSTRAINT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.carrito_productos
    ADD CONSTRAINT fk_producto_cantidad FOREIGN KEY (id_producto_cantidad) REFERENCES public.productos_cantidades(id);


--
-- TOC entry 4747 (class 2606 OID 136041)
-- Name: venta fk_producto_presentacion; Type: FK CONSTRAINT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.venta
    ADD CONSTRAINT fk_producto_presentacion FOREIGN KEY (id_producto_presentacion) REFERENCES public.presentacion_producto(id);


--
-- TOC entry 4745 (class 2606 OID 58061)
-- Name: proveedores fk_proveedor; Type: FK CONSTRAINT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.proveedores
    ADD CONSTRAINT fk_proveedor FOREIGN KEY (proveedor_alternativo) REFERENCES public.proveedores(id) ON DELETE CASCADE;


--
-- TOC entry 4741 (class 2606 OID 58066)
-- Name: products fk_proveedor; Type: FK CONSTRAINT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT fk_proveedor FOREIGN KEY (proveedor) REFERENCES public.proveedores(id) ON DELETE CASCADE;


--
-- TOC entry 4743 (class 2606 OID 58071)
-- Name: productos_cantidades fk_ubicaciones; Type: FK CONSTRAINT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.productos_cantidades
    ADD CONSTRAINT fk_ubicaciones FOREIGN KEY (ubicacion_id) REFERENCES public.ubicaciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4748 (class 2606 OID 58086)
-- Name: venta fk_venta; Type: FK CONSTRAINT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.venta
    ADD CONSTRAINT fk_venta FOREIGN KEY (product) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4749 (class 2606 OID 136031)
-- Name: venta fk_venta_carrito; Type: FK CONSTRAINT; Schema: public; Owner: ownerfarmacia
--

ALTER TABLE ONLY public.venta
    ADD CONSTRAINT fk_venta_carrito FOREIGN KEY (id_carrito) REFERENCES public.carrito(id);


--
-- TOC entry 4938 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO ownerfarmacia;


-- Completed on 2025-05-12 14:04:32

--
-- PostgreSQL database dump complete
--

