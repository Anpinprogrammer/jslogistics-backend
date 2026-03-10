--
-- PostgreSQL database dump
--

\restrict vFleVFPoq4sYqzZd8xg3UMX0lJhUcbNgcv56jouLx4HusWNUNli9g37Z2N0Hm8D

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.3 (Homebrew)

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

--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.clients (id, name, phone, address, notes, balance, company, identification_number, email, created_at, updated_at, service_lost_trips) VALUES ('65b11062-48d8-4a83-a5df-c6a130d98278', 'dafiti', '333456578', 'calle 13 oeste #45-2345', 'Ropa gimnasio', 0, 'solutions', '14745033', 'dafiti@yahoo.com', '2026-02-23 19:48:06.934996-05', '2026-03-09 21:00:32.465695-05', 0);
INSERT INTO public.clients (id, name, phone, address, notes, balance, company, identification_number, email, created_at, updated_at, service_lost_trips) VALUES ('044b0112-1c83-4a6c-a1ff-a4d7ff40267d', 'Oriana Villada', '+54 971 646856', 'Chile', NULL, 0, NULL, NULL, NULL, '2026-02-20 12:54:18.311227-05', '2026-03-09 21:00:32.465695-05', 0);
INSERT INTO public.clients (id, name, phone, address, notes, balance, company, identification_number, email, created_at, updated_at, service_lost_trips) VALUES ('c4df7c72-ab01-4775-9a60-0a436694f3b4', 'Tarcilo Mosquera', '3206680206', 'Qibdo', NULL, 0, NULL, NULL, NULL, '2026-02-20 12:54:50.978288-05', '2026-03-09 21:00:32.465695-05', 0);
INSERT INTO public.clients (id, name, phone, address, notes, balance, company, identification_number, email, created_at, updated_at, service_lost_trips) VALUES ('3f1c4473-d7a4-430b-a6bc-ee6fb3666d32', 'Flora Anchico ', '3152361682', 'Tumaco', NULL, 0, NULL, NULL, NULL, '2026-02-20 12:55:57.114724-05', '2026-03-09 21:00:32.465695-05', 0);
INSERT INTO public.clients (id, name, phone, address, notes, balance, company, identification_number, email, created_at, updated_at, service_lost_trips) VALUES ('1cf70c4c-3885-47db-baaf-226f8832177a', 'Karen Ortiz', '3136703704', NULL, NULL, 0, 'n/a', '000000000', NULL, '2026-02-20 12:19:31.78845-05', '2026-03-09 21:00:32.465695-05', 0);
INSERT INTO public.clients (id, name, phone, address, notes, balance, company, identification_number, email, created_at, updated_at, service_lost_trips) VALUES ('0e1f89d6-e993-4592-8c78-f37fcd5c7b0d', 'Sammy', '3154826683', 'Mesanin 101 F', NULL, 0, 'Sammy', NULL, NULL, '2026-02-20 12:26:40.201361-05', '2026-03-09 21:00:32.465695-05', 0);
INSERT INTO public.clients (id, name, phone, address, notes, balance, company, identification_number, email, created_at, updated_at, service_lost_trips) VALUES ('16623678-0d23-4637-939e-8858493afca4', 'Maria Santa Cruz', '3103920237', 'Darien', NULL, 0, 'nn', NULL, NULL, '2026-02-20 12:27:15.513953-05', '2026-03-09 21:00:32.465695-05', 0);
INSERT INTO public.clients (id, name, phone, address, notes, balance, company, identification_number, email, created_at, updated_at, service_lost_trips) VALUES ('f72570a2-4393-4acd-a5e6-fe7f65a9f339', 'Jaqueline Ruiz', '3176680827', 'Drop', NULL, 0, 'nn', NULL, NULL, '2026-02-20 12:47:40.046873-05', '2026-03-09 21:00:32.465695-05', 0);
INSERT INTO public.clients (id, name, phone, address, notes, balance, company, identification_number, email, created_at, updated_at, service_lost_trips) VALUES ('8ebe89ec-3139-4cc6-9bc4-22bf33a07f79', 'Sebastian Delgado', '3226590750', NULL, NULL, 0, NULL, NULL, NULL, '2026-02-20 12:48:54.606948-05', '2026-03-09 21:00:32.465695-05', 0);
INSERT INTO public.clients (id, name, phone, address, notes, balance, company, identification_number, email, created_at, updated_at, service_lost_trips) VALUES ('3aff7cf5-c81c-436a-bd48-58e805ee544c', 'Haiber Gomez', '3134566976', 'Terminal', NULL, 0, NULL, NULL, NULL, '2026-02-20 12:49:35.511489-05', '2026-03-09 21:00:32.465695-05', 0);
INSERT INTO public.clients (id, name, phone, address, notes, balance, company, identification_number, email, created_at, updated_at, service_lost_trips) VALUES ('e991550d-3717-46d8-9c4c-2074179aa003', 'Luis Ortiz', '3169072892', 'Galeon', NULL, 0, NULL, NULL, NULL, '2026-02-20 12:51:42.874693-05', '2026-03-09 21:00:32.465695-05', 0);
INSERT INTO public.clients (id, name, phone, address, notes, balance, company, identification_number, email, created_at, updated_at, service_lost_trips) VALUES ('1d74aa34-d542-41df-b8f4-992cee6ac4e2', 'Valeria Shangai', '3127362777', 'Shangai Local 208', NULL, 0, NULL, NULL, NULL, '2026-02-20 12:52:24.972132-05', '2026-03-09 21:00:32.465695-05', 0);
INSERT INTO public.clients (id, name, phone, address, notes, balance, company, identification_number, email, created_at, updated_at, service_lost_trips) VALUES ('cb718ab3-9aec-4299-a17d-0f9505ad00c7', 'Nn', '3205981811', 'Caleño Plaza 304', NULL, 0, 'Nitrox', NULL, NULL, '2026-02-20 12:53:30.206473-05', '2026-03-09 21:00:32.465695-05', 0);
INSERT INTO public.clients (id, name, phone, address, notes, balance, company, identification_number, email, created_at, updated_at, service_lost_trips) VALUES ('15d9ba7a-484d-4128-a6eb-2c8cedd45f36', 'Test 2 ', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-02-21 17:06:10.569088-05', '2026-03-09 21:00:32.465695-05', 0);
INSERT INTO public.clients (id, name, phone, address, notes, balance, company, identification_number, email, created_at, updated_at, service_lost_trips) VALUES ('b8d1d0c3-facc-4304-9b51-01de53041d7f', 'Cliente Test 1', '3146098819', 'carrera 23 #97-86', NULL, 20000, 'Empresa Test', '000000000', NULL, '2026-02-21 17:40:26.021508-05', '2026-03-09 21:07:56.334312-05', 10000);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users (id, email, password_hash, full_name, phone, created_at, updated_at) VALUES ('29277125-869c-41ea-8089-a1f7b3eebf5b', 'admin@cargoguardian.com', '$2a$10$XA7Pznm9lkx9hX22YlgoIutpc8722bJSGXmfnCs5ZkYjUcPrMr02m', 'Administrador', NULL, '2026-02-13 10:31:14.772317-05', '2026-02-13 10:31:14.772317-05');
INSERT INTO public.users (id, email, password_hash, full_name, phone, created_at, updated_at) VALUES ('4036f33c-1b0a-4e1d-bef7-ca54094a97b3', 'murillo@correo.com', '$2a$10$RUDGaG0aPL27/.s61isBV.06DqXFVkeZlhAv0AW/05cDCz38UOuYG', 'Murillo', '3028522482', '2026-02-20 12:14:23.647199-05', '2026-02-20 12:14:23.647199-05');
INSERT INTO public.users (id, email, password_hash, full_name, phone, created_at, updated_at) VALUES ('f9caa736-ac7f-4229-84df-83a35d5ea52c', 'brandon@correo.com', '$2a$10$sEqkXyH/S2j7b3AgFBu.7eq5AOY/KfZo3NyMzoIJwlNtZTgqKp3.m', 'Brandon', '3152819545', '2026-02-20 12:14:52.219974-05', '2026-02-20 12:14:52.219974-05');
INSERT INTO public.users (id, email, password_hash, full_name, phone, created_at, updated_at) VALUES ('46c124dc-3b4c-4a3f-8bc2-187ce159670e', 'delio@correo.com', '$2a$10$iCHYR049uBUYXiVWKBNiaeSvZvHNreHGkFqELLd61Wm/QrorTtDIO', 'Delio', '3127499415', '2026-02-20 12:15:28.514437-05', '2026-02-20 12:15:28.514437-05');
INSERT INTO public.users (id, email, password_hash, full_name, phone, created_at, updated_at) VALUES ('f16f7d08-6c43-4bd4-99a1-bf13aacc27d4', 'jhon@correo.com', '$2a$10$qdmruZ3pamdLjxsGQqtddOpZqbE40S41A8/i0KP8NPtt5s3pPc3iC', 'Jhon', '3103516512', '2026-02-20 12:15:53.039528-05', '2026-02-20 12:15:53.039528-05');
INSERT INTO public.users (id, email, password_hash, full_name, phone, created_at, updated_at) VALUES ('f9269792-7983-4b3c-8854-9f4e99b820c4', 'santi@correo.com', '$2a$10$ckTfxLBPX30eU.SXUvqPWOPoZSUDnW0Ub4gF.fodDtB.Wd/UAUneS', 'Santi', '3177308341', '2026-02-20 12:16:16.651045-05', '2026-02-20 12:16:16.651045-05');
INSERT INTO public.users (id, email, password_hash, full_name, phone, created_at, updated_at) VALUES ('a2e17dc6-4d7e-4b41-986f-4a6aa4e4def3', 'jose@correo.com', '$2a$10$yuafJcVOSuV2UITgOFOFVee3aiJAxKDTgzuYA3MxXgI.4Wp0cTGPm', 'Jose', '3225393435', '2026-02-20 12:17:07.1702-05', '2026-02-20 12:17:07.1702-05');


--
-- Data for Name: company_money_movements; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.company_money_movements (id, account, type, amount, created_by, date, notes, created_at) VALUES ('367a2d63-93ee-4ba7-be51-c54baa53a12c', 'cash', 'opening_balance', 100000, '29277125-869c-41ea-8089-a1f7b3eebf5b', '2026-03-09', NULL, '2026-03-09 21:00:31.808148-05');
INSERT INTO public.company_money_movements (id, account, type, amount, created_by, date, notes, created_at) VALUES ('034c0448-e8c8-4001-98cc-fccb0c0743cf', 'bancolombia', 'opening_balance', 100000, '29277125-869c-41ea-8089-a1f7b3eebf5b', '2026-03-09', NULL, '2026-03-09 21:00:31.808148-05');
INSERT INTO public.company_money_movements (id, account, type, amount, created_by, date, notes, created_at) VALUES ('e54c6ceb-77ab-4034-8eb8-5332de883a5b', 'nequi', 'opening_balance', 100000, '29277125-869c-41ea-8089-a1f7b3eebf5b', '2026-03-09', NULL, '2026-03-09 21:00:31.808148-05');
INSERT INTO public.company_money_movements (id, account, type, amount, created_by, date, notes, created_at) VALUES ('8fe34833-dc99-40b6-9ab8-56ab7f176176', 'cash', 'income', 100000, '29277125-869c-41ea-8089-a1f7b3eebf5b', '2026-03-09', 'Cliente paga', '2026-03-09 21:02:33.835134-05');
INSERT INTO public.company_money_movements (id, account, type, amount, created_by, date, notes, created_at) VALUES ('da2ad493-ef73-4c3f-a76b-f7c521fbad12', 'bancolombia', 'income', 20000, '29277125-869c-41ea-8089-a1f7b3eebf5b', '2026-03-09', 'Devolucion', '2026-03-09 21:02:48.564595-05');
INSERT INTO public.company_money_movements (id, account, type, amount, created_by, date, notes, created_at) VALUES ('b5054916-6370-468c-803e-84c40e7b00bf', 'bancolombia', 'expense', 40000, '29277125-869c-41ea-8089-a1f7b3eebf5b', '2026-03-09', 'Prestamo registrado para el pedido 7D643A84', '2026-03-09 21:03:34.009604-05');
INSERT INTO public.company_money_movements (id, account, type, amount, created_by, date, notes, created_at) VALUES ('2f4a61f4-157b-4fd3-bd73-0cab4749b9a2', 'bancolombia', 'expense', 30000, '29277125-869c-41ea-8089-a1f7b3eebf5b', '2026-03-09', 'Pago almuerzos', '2026-03-09 21:04:33.514185-05');


--
-- Data for Name: daily_base_money; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: daily_settlements; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: deliveries; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.deliveries (id, client_id, courier_id, created_by, amount, service_value, total_to_collect, received_amount, recipient_name, payment_method, status, delivery_date, week_start, week_end, notes, receipt_photo_url, created_at, updated_at, loan, lost_trips) VALUES ('7d643a84-dcdf-4e8e-b2f2-5161f5b91e61', 'b8d1d0c3-facc-4304-9b51-01de53041d7f', 'f9caa736-ac7f-4229-84df-83a35d5ea52c', '29277125-869c-41ea-8089-a1f7b3eebf5b', 80000, 10000, 80000, 80000, 'Julio', 'cash', 'completed', '2026-03-10', '2026-03-07', '2026-03-13', NULL, NULL, '2026-03-09 21:03:33.992411-05', '2026-03-09 21:07:56.309428-05', 40000, 1);


--
-- Data for Name: delivery_audit_log; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.delivery_audit_log (id, delivery_id, action, changed_by, old_values, new_values, reason, created_at) VALUES ('ce78dbe4-20b7-4127-9d06-c5bd2b05463d', '7d643a84-dcdf-4e8e-b2f2-5161f5b91e61', 'created', '29277125-869c-41ea-8089-a1f7b3eebf5b', NULL, '{"id": "7d643a84-dcdf-4e8e-b2f2-5161f5b91e61", "loan": "40000", "notes": null, "amount": "80000", "status": "pending", "week_end": "2026-03-13T05:00:00.000Z", "client_id": "b8d1d0c3-facc-4304-9b51-01de53041d7f", "courier_id": "f9caa736-ac7f-4229-84df-83a35d5ea52c", "created_at": "2026-03-10T02:03:33.992Z", "created_by": "29277125-869c-41ea-8089-a1f7b3eebf5b", "lost_trips": "0", "updated_at": "2026-03-10T02:03:33.992Z", "week_start": "2026-03-07T05:00:00.000Z", "delivery_date": "2026-03-10T05:00:00.000Z", "service_value": "10000", "payment_method": "cash", "recipient_name": "Julio", "received_amount": null, "total_to_collect": "80000", "receipt_photo_url": null}', NULL, '2026-03-09 21:03:34.000437-05');
INSERT INTO public.delivery_audit_log (id, delivery_id, action, changed_by, old_values, new_values, reason, created_at) VALUES ('79881f54-785c-445d-87a7-5cbddfc5a13a', '7d643a84-dcdf-4e8e-b2f2-5161f5b91e61', 'updated', '29277125-869c-41ea-8089-a1f7b3eebf5b', '{"id": "7d643a84-dcdf-4e8e-b2f2-5161f5b91e61", "loan": "40000", "notes": null, "amount": "80000", "status": "pending", "week_end": "2026-03-13T05:00:00.000Z", "client_id": "b8d1d0c3-facc-4304-9b51-01de53041d7f", "courier_id": "f9caa736-ac7f-4229-84df-83a35d5ea52c", "created_at": "2026-03-10T02:03:33.992Z", "created_by": "29277125-869c-41ea-8089-a1f7b3eebf5b", "lost_trips": "0", "updated_at": "2026-03-10T02:03:33.992Z", "week_start": "2026-03-07T05:00:00.000Z", "delivery_date": "2026-03-10T05:00:00.000Z", "service_value": "10000", "payment_method": "cash", "recipient_name": "Julio", "received_amount": null, "total_to_collect": "80000", "receipt_photo_url": null}', '{"id": "7d643a84-dcdf-4e8e-b2f2-5161f5b91e61", "loan": "40000", "notes": null, "amount": "80000", "status": "not_delivered_collected", "week_end": "2026-03-13T05:00:00.000Z", "client_id": "b8d1d0c3-facc-4304-9b51-01de53041d7f", "courier_id": "f9caa736-ac7f-4229-84df-83a35d5ea52c", "created_at": "2026-03-10T02:03:33.992Z", "created_by": "29277125-869c-41ea-8089-a1f7b3eebf5b", "lost_trips": "1", "updated_at": "2026-03-10T02:06:27.350Z", "week_start": "2026-03-07T05:00:00.000Z", "delivery_date": "2026-03-10T05:00:00.000Z", "service_value": "10000", "payment_method": "cash", "recipient_name": "Julio", "received_amount": "0", "total_to_collect": "80000", "receipt_photo_url": null}', NULL, '2026-03-09 21:06:27.466225-05');
INSERT INTO public.delivery_audit_log (id, delivery_id, action, changed_by, old_values, new_values, reason, created_at) VALUES ('b183d9ff-56f0-4e6a-891d-d60a9229822c', '7d643a84-dcdf-4e8e-b2f2-5161f5b91e61', 'updated', '29277125-869c-41ea-8089-a1f7b3eebf5b', '{"id": "7d643a84-dcdf-4e8e-b2f2-5161f5b91e61", "loan": "40000", "notes": null, "amount": "80000", "status": "not_delivered_collected", "week_end": "2026-03-13T05:00:00.000Z", "client_id": "b8d1d0c3-facc-4304-9b51-01de53041d7f", "courier_id": "f9caa736-ac7f-4229-84df-83a35d5ea52c", "created_at": "2026-03-10T02:03:33.992Z", "created_by": "29277125-869c-41ea-8089-a1f7b3eebf5b", "lost_trips": "1", "updated_at": "2026-03-10T02:06:27.350Z", "week_start": "2026-03-07T05:00:00.000Z", "delivery_date": "2026-03-10T05:00:00.000Z", "service_value": "10000", "payment_method": "cash", "recipient_name": "Julio", "received_amount": "0", "total_to_collect": "80000", "receipt_photo_url": null}', '{"id": "7d643a84-dcdf-4e8e-b2f2-5161f5b91e61", "loan": "40000", "notes": null, "amount": "80000", "status": "pending", "week_end": "2026-03-13T05:00:00.000Z", "client_id": "b8d1d0c3-facc-4304-9b51-01de53041d7f", "courier_id": "f9caa736-ac7f-4229-84df-83a35d5ea52c", "created_at": "2026-03-10T02:03:33.992Z", "created_by": "29277125-869c-41ea-8089-a1f7b3eebf5b", "lost_trips": "1", "updated_at": "2026-03-10T02:07:03.524Z", "week_start": "2026-03-07T05:00:00.000Z", "delivery_date": "2026-03-10T05:00:00.000Z", "service_value": "10000", "payment_method": "cash", "recipient_name": "Julio", "received_amount": null, "total_to_collect": "80000", "receipt_photo_url": null}', NULL, '2026-03-09 21:07:03.52641-05');
INSERT INTO public.delivery_audit_log (id, delivery_id, action, changed_by, old_values, new_values, reason, created_at) VALUES ('be520e2c-3728-475e-b944-b6ab1bf93045', '7d643a84-dcdf-4e8e-b2f2-5161f5b91e61', 'updated', '29277125-869c-41ea-8089-a1f7b3eebf5b', '{"id": "7d643a84-dcdf-4e8e-b2f2-5161f5b91e61", "loan": "40000", "notes": null, "amount": "80000", "status": "pending", "week_end": "2026-03-13T05:00:00.000Z", "client_id": "b8d1d0c3-facc-4304-9b51-01de53041d7f", "courier_id": "f9caa736-ac7f-4229-84df-83a35d5ea52c", "created_at": "2026-03-10T02:03:33.992Z", "created_by": "29277125-869c-41ea-8089-a1f7b3eebf5b", "lost_trips": "1", "updated_at": "2026-03-10T02:07:03.524Z", "week_start": "2026-03-07T05:00:00.000Z", "delivery_date": "2026-03-10T05:00:00.000Z", "service_value": "10000", "payment_method": "cash", "recipient_name": "Julio", "received_amount": null, "total_to_collect": "80000", "receipt_photo_url": null}', '{"id": "7d643a84-dcdf-4e8e-b2f2-5161f5b91e61", "loan": "40000", "notes": null, "amount": "80000", "status": "completed", "week_end": "2026-03-13T05:00:00.000Z", "client_id": "b8d1d0c3-facc-4304-9b51-01de53041d7f", "courier_id": "f9caa736-ac7f-4229-84df-83a35d5ea52c", "created_at": "2026-03-10T02:03:33.992Z", "created_by": "29277125-869c-41ea-8089-a1f7b3eebf5b", "lost_trips": "1", "updated_at": "2026-03-10T02:07:56.309Z", "week_start": "2026-03-07T05:00:00.000Z", "delivery_date": "2026-03-10T05:00:00.000Z", "service_value": "10000", "payment_method": "cash", "recipient_name": "Julio", "received_amount": "80000", "total_to_collect": "80000", "receipt_photo_url": null}', NULL, '2026-03-09 21:07:56.318294-05');


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.migrations (id, name, run_on) VALUES (1, '001_initial_schema.sql', '2026-03-01 18:38:07.67243-05');
INSERT INTO public.migrations (id, name, run_on) VALUES (7, '002_add_loan_losttrips_to_deliveries.sql', '2026-03-02 10:45:07.895404-05');
INSERT INTO public.migrations (id, name, run_on) VALUES (9, '003_cash_accounts_daily_settlements.sql', '2026-03-05 18:04:52.068641-05');


--
-- Data for Name: operational_charges; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: partial_deliveries; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.profiles (id, user_id, full_name, phone, created_at, updated_at) VALUES ('1cb81730-5ff6-40a5-8c7b-e1442a4015e0', '29277125-869c-41ea-8089-a1f7b3eebf5b', 'Administrador', NULL, '2026-02-13 10:31:14.778825-05', '2026-02-13 10:31:14.778825-05');
INSERT INTO public.profiles (id, user_id, full_name, phone, created_at, updated_at) VALUES ('e2b1a3c1-8f80-44ca-bbd9-c650346eedf8', '4036f33c-1b0a-4e1d-bef7-ca54094a97b3', 'Murillo', '3028522482', '2026-02-20 12:14:23.656977-05', '2026-02-20 12:14:23.656977-05');
INSERT INTO public.profiles (id, user_id, full_name, phone, created_at, updated_at) VALUES ('d90888e2-e487-4a6f-a51d-57f78b9ab604', 'f9caa736-ac7f-4229-84df-83a35d5ea52c', 'Brandon', '3152819545', '2026-02-20 12:14:52.22303-05', '2026-02-20 12:14:52.22303-05');
INSERT INTO public.profiles (id, user_id, full_name, phone, created_at, updated_at) VALUES ('b4f39acb-36de-4065-aeca-8d022bc42157', '46c124dc-3b4c-4a3f-8bc2-187ce159670e', 'Delio', '3127499415', '2026-02-20 12:15:28.517007-05', '2026-02-20 12:15:28.517007-05');
INSERT INTO public.profiles (id, user_id, full_name, phone, created_at, updated_at) VALUES ('bb320868-c7f3-42d4-b827-bf2e1b18c445', 'f16f7d08-6c43-4bd4-99a1-bf13aacc27d4', 'Jhon', '3103516512', '2026-02-20 12:15:53.041123-05', '2026-02-20 12:15:53.041123-05');
INSERT INTO public.profiles (id, user_id, full_name, phone, created_at, updated_at) VALUES ('de5f96a9-30e0-48fb-ae22-8669716f2f09', 'f9269792-7983-4b3c-8854-9f4e99b820c4', 'Santi', '3177308341', '2026-02-20 12:16:16.653013-05', '2026-02-20 12:16:16.653013-05');
INSERT INTO public.profiles (id, user_id, full_name, phone, created_at, updated_at) VALUES ('b29a70b2-6d70-4878-a146-2385944abc59', 'a2e17dc6-4d7e-4b41-986f-4a6aa4e4def3', 'Jose', '3225393435', '2026-02-20 12:17:07.172515-05', '2026-02-20 12:17:07.172515-05');


--
-- Data for Name: salary_advances; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.user_roles (id, user_id, role) VALUES ('3c0e898b-6a81-4541-b7c9-45abf0ba9df8', '29277125-869c-41ea-8089-a1f7b3eebf5b', 'admin');
INSERT INTO public.user_roles (id, user_id, role) VALUES ('157cb231-5089-46cb-82e8-2267f6ab6820', '4036f33c-1b0a-4e1d-bef7-ca54094a97b3', 'courier');
INSERT INTO public.user_roles (id, user_id, role) VALUES ('663a2798-41a2-4de3-9302-233db2289c80', 'f9caa736-ac7f-4229-84df-83a35d5ea52c', 'courier');
INSERT INTO public.user_roles (id, user_id, role) VALUES ('b6ffc982-2428-47b0-b49c-02a34e99e55e', '46c124dc-3b4c-4a3f-8bc2-187ce159670e', 'courier');
INSERT INTO public.user_roles (id, user_id, role) VALUES ('91d4f9a7-e002-434b-8efc-a1c343d8293c', 'f16f7d08-6c43-4bd4-99a1-bf13aacc27d4', 'courier');
INSERT INTO public.user_roles (id, user_id, role) VALUES ('c42ee6e7-3ee6-4ebf-b414-0af0dbacb8d8', 'f9269792-7983-4b3c-8854-9f4e99b820c4', 'courier');
INSERT INTO public.user_roles (id, user_id, role) VALUES ('a57b0977-a0b8-4db3-97ea-999cce751396', 'a2e17dc6-4d7e-4b41-986f-4a6aa4e4def3', 'courier');


--
-- Data for Name: weekly_settlements; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.migrations_id_seq', 10, true);


--
-- PostgreSQL database dump complete
--

\unrestrict vFleVFPoq4sYqzZd8xg3UMX0lJhUcbNgcv56jouLx4HusWNUNli9g37Z2N0Hm8D

