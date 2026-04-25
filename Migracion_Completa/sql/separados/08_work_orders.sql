
-- ============================================================================
-- 1. PROFILES
-- ============================================================================

INSERT INTO public.profiles (id, full_name, role, created_at) VALUES
('00000000-0000-4000-a000-000000000000', 'Administrador Sistema', 'admin', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. ASSETS - Árbol de Equipos
-- ============================================================================

INSERT INTO public.assets (id, name, code, asset_type, status, created_at) VALUES
('00000000-0000-4000-b000-000000000001', 'Planta Industrial Central', 'PLANT-01', 'plant', 'active', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.assets (id, name, code, asset_type, status, parent_id, created_at) VALUES
('00000000-0000-4000-b000-000000000002', 'PTAR1', 'PTAR1', 'area', 'active', '00000000-0000-4000-b000-000000000001', NOW()),
('00000000-0000-4000-b000-000000000003', 'PTAR2', 'PTAR2', 'area', 'active', '00000000-0000-4000-b000-000000000001', NOW()),
('00000000-0000-4000-b000-000000000004', 'Planta Ozono', 'PLANTAOZON', 'area', 'active', '00000000-0000-4000-b000-000000000001', NOW()),
('00000000-0000-4000-b000-000000000005', 'Suavizadores Y Pozos', 'SUAVIZADOR', 'area', 'active', '00000000-0000-4000-b000-000000000001', NOW()),
('00000000-0000-4000-b000-000000000006', 'Calderas', 'CALDERAS', 'area', 'active', '00000000-0000-4000-b000-000000000001', NOW()),
('00000000-0000-4000-b000-000000000007', 'Sistema Contraincendios', 'SISTEMACON', 'area', 'active', '00000000-0000-4000-b000-000000000001', NOW()),
('00000000-0000-4000-b000-000000000008', 'Subestaciones', 'SUBESTACIO', 'area', 'active', '00000000-0000-4000-b000-000000000001', NOW()),
('00000000-0000-4000-b000-000000000009', 'Infraestructura', 'INFRAESTRU', 'area', 'active', '00000000-0000-4000-b000-000000000001', NOW()) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.assets (id, name, code, asset_type, status, parent_id, created_at) VALUES
('00000000-0000-4000-b000-000000001000', 'Bombas sumergible para retorno de lodo', 'PTAR1.RL.RASP-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000002', NOW()),
('00000000-0000-4000-b000-000000001001', 'Bombas sumergible para retorno de lodo', 'PTAR1.RL.RASP-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000002', NOW()),
('00000000-0000-4000-b000-000000001002', 'Bombas sumergible para retorno de lodo', 'PTAR1.RL.RASP-03', 'equipment', 'active', '00000000-0000-4000-b000-000000000002', NOW()),
('00000000-0000-4000-b000-000000001003', 'Bombas sumergible para residuo de lodo', 'PTAR1.RL.WASP-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000002', NOW()),
('00000000-0000-4000-b000-000000001004', 'Mixer de lodo de 3 HP', 'PTAR1.RL.MIL-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000002', NOW()),
('00000000-0000-4000-b000-000000001005', 'Aireador de 20 HP', 'PTAR1.AA.AE-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000002', NOW()),
('00000000-0000-4000-b000-000000001006', 'Aireador de 20 HP', 'PTAR1.AA.AE-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000002', NOW()),
('00000000-0000-4000-b000-000000001007', 'Aireador de 20 HP', 'PTAR1.AA.AE-03', 'equipment', 'active', '00000000-0000-4000-b000-000000000002', NOW()),
('00000000-0000-4000-b000-000000001008', 'Aireador de 20 HP', 'PTAR1.AA.AE-04', 'equipment', 'active', '00000000-0000-4000-b000-000000000002', NOW()),
('00000000-0000-4000-b000-000000001009', 'Aireador de 20 HP', 'PTAR1.AA.AE-05', 'equipment', 'active', '00000000-0000-4000-b000-000000000002', NOW()),
('00000000-0000-4000-b000-000000001010', 'Aireador de 20 HP', 'PTAR1.AA.AE-06', 'equipment', 'active', '00000000-0000-4000-b000-000000000002', NOW()),
('00000000-0000-4000-b000-000000001011', 'Aireador de 20 HP', 'PTAR1.AA.AE-07', 'equipment', 'active', '00000000-0000-4000-b000-000000000002', NOW()),
('00000000-0000-4000-b000-000000001012', 'Aireador de 20 HP', 'PTAR1.AA.AE-08', 'equipment', 'active', '00000000-0000-4000-b000-000000000002', NOW()),
('00000000-0000-4000-b000-000000001013', 'Aireador de 20 HP', 'PTAR1.AA.AE-09', 'equipment', 'active', '00000000-0000-4000-b000-000000000002', NOW()),
('00000000-0000-4000-b000-000000001014', 'Aireador de 20 HP', 'PTAR1.AA.AE-10', 'equipment', 'active', '00000000-0000-4000-b000-000000000002', NOW()),
('00000000-0000-4000-b000-000000001015', 'Aireador de 20 HP', 'PTAR1.AA.AE-11', 'equipment', 'active', '00000000-0000-4000-b000-000000000002', NOW()),
('00000000-0000-4000-b000-000000001016', 'Aireador de 20 HP', 'PTAR1.AA.AE-12', 'equipment', 'active', '00000000-0000-4000-b000-000000000002', NOW()),
('00000000-0000-4000-b000-000000001017', 'Aireador de 20 HP', 'PTAR1.AA.AE-13', 'equipment', 'active', '00000000-0000-4000-b000-000000000002', NOW()),
('00000000-0000-4000-b000-000000001018', 'Aireador de 20 HP', 'PTAR1.AA.AE-14', 'equipment', 'active', '00000000-0000-4000-b000-000000000002', NOW()),
('00000000-0000-4000-b000-000000001019', 'Mixer Dirrecional', 'PTAR1.AA.MI-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000002', NOW()),
('00000000-0000-4000-b000-000000001020', 'Mixer Dirrecional', 'PTAR1.AA.MI-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000002', NOW()),
('00000000-0000-4000-b000-000000001021', 'Mixer Dirrecional', 'PTAR1.AA.MI-03', 'equipment', 'active', '00000000-0000-4000-b000-000000000002', NOW()),
('00000000-0000-4000-b000-000000001022', 'Mixer Dirrecional', 'PTAR1.AA.MI-04', 'equipment', 'active', '00000000-0000-4000-b000-000000000002', NOW()),
('00000000-0000-4000-b000-000000001023', 'Mixer Dirrecional', 'PTAR1.AA.MI-05', 'equipment', 'active', '00000000-0000-4000-b000-000000000002', NOW()),
('00000000-0000-4000-b000-000000001024', 'Mixer Dirrecional', 'PTAR1.AA.MI-06', 'equipment', 'active', '00000000-0000-4000-b000-000000000002', NOW()),
('00000000-0000-4000-b000-000000001025', 'Mixer Dirrecional', 'PTAR1.AA.MI-07', 'equipment', 'active', '00000000-0000-4000-b000-000000000002', NOW()),
('00000000-0000-4000-b000-000000001026', 'Mixer Dirrecional', 'PTAR1.AA.MI-08', 'equipment', 'active', '00000000-0000-4000-b000-000000000002', NOW()),
('00000000-0000-4000-b000-000000001027', 'Mixer Dirrecional', 'PTAR1.AA.MI-09', 'equipment', 'active', '00000000-0000-4000-b000-000000000002', NOW()),
('00000000-0000-4000-b000-000000001028', 'Mixer Dirrecional', 'PTAR1.AA.MI-10', 'equipment', 'active', '00000000-0000-4000-b000-000000000002', NOW()),
('00000000-0000-4000-b000-000000001029', 'Mixer Dirrecional', 'PTAR1.AA.MI-11', 'equipment', 'active', '00000000-0000-4000-b000-000000000002', NOW()),
('00000000-0000-4000-b000-000000001030', 'Mixer Dirrecional', 'PTAR1.AA.MI-12', 'equipment', 'active', '00000000-0000-4000-b000-000000000002', NOW()),
('00000000-0000-4000-b000-000000001031', 'Clarificador Tratamiento 1', 'PTAR1.DOC.CLR-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000002', NOW()),
('00000000-0000-4000-b000-000000001032', 'Bomba de envio de lodo', 'PTAR2.RL.TSP-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001033', 'Bomba centrifuga retorno de lodo RAS', 'PTAR2.RL.RASP-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001034', 'Bomba centrifuga retorno de lodo RAS', 'PTAR2.RL.RASP-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001035', 'Filtro Prensa', 'PTAR2.RL.FP-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001036', 'Filtro Prensa', 'PTAR2.RL.FP-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001037', 'Combinador de quimicos', 'PTAR2.AA.CMQ-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001038', 'Mixer', 'PTAR2.AA.MI-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001039', 'Mixer', 'PTAR2.AA.MI-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001040', 'Mixer', 'PTAR2.AA.MI-03', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001041', 'Mixer', 'PTAR2.AA.MI-04', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001042', 'Aireador de 50 HP', 'PTAR2.AA.AE-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001043', 'Aireador de 50 HP', 'PTAR2.AA.AE-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001044', 'Aireador de 50 HP', 'PTAR2.AA.AE-03', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001045', 'Aireador de 50 HP', 'PTAR2.AA.AE-04', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001046', 'Aireador de 50 HP', 'PTAR2.AA.AE-05', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001047', 'Aireador de 50 HP', 'PTAR2.AA.AE-06', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001048', 'Aireador de 50 HP', 'PTAR2.AA.AE-07', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001049', 'Aireador de 50 HP', 'PTAR2.AA.AE-08', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.assets (id, name, code, asset_type, status, parent_id, created_at) VALUES
('00000000-0000-4000-b000-000000001050', 'Aireador de 50 HP', 'PTAR2.AA.AE-09', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001051', 'Aireador de 50 HP', 'PTAR2.AA.AE-10', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001052', 'Aireador de 50 HP', 'PTAR2.AA.AE-11', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001053', 'Aireador de 50 HP', 'PTAR2.AA.AE-12', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001054', 'Aireador de 50 HP', 'PTAR2.AA.AE-13', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001055', 'Aireador de 50 HP', 'PTAR2.AA.AE-14', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001056', 'Secador frigorífico', 'PTAR2.DOC.SCF-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001057', 'Compresor de tornillo', 'PTAR2.DOC.CTR-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001058', 'Bomba Dosificadoras Tratamiento de quimicos', 'PTAR2.DOC.BDT-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001059', 'Bomba Dosificadoras Tratamiento de quimicos', 'PTAR2.DOC.BDT-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001060', 'Bomba Dosificadoras Tratamiento de quimicos', 'PTAR2.DOC.BDT-03', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001061', 'Bomba Dosificadoras Tratamiento de quimicos', 'PTAR2.DOC.BDT-04', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001062', 'Bomba Dosificadoras Tratamiento de quimicos', 'PTAR2.DOC.BDT-05', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001063', 'Bomba Dosificadoras Tratamiento de quimicos', 'PTAR2.DOC.BDT-06', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001064', 'Clarificador Tratamiento', 'PTAR2.DOC.CLR-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001065', 'Espesador de lodo', 'PTAR2.DOC.ESL-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001066', 'Mixer tanque de lodo', 'PTAR2.DOC.MTL-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001067', 'Bomba Dosificadora', 'PTAR2.DOC.BBD-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001068', 'Bomba Dosificadora', 'PTAR2.DOC.BBD-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001069', 'Compresor de tornillo', 'PDO.AEC.CTR-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000004', NOW()),
('00000000-0000-4000-b000-000000001070', 'Compresor de tornillo', 'PDO.AEC.CTR-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000004', NOW()),
('00000000-0000-4000-b000-000000001071', 'Secador frigorífico', 'PDO.AEC.SCF-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000004', NOW()),
('00000000-0000-4000-b000-000000001072', 'Secador frigorífico', 'PDO.AEC.SCF-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000004', NOW()),
('00000000-0000-4000-b000-000000001073', 'Generador de Oxigeno', 'PDO.GDO.GO2-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000004', NOW()),
('00000000-0000-4000-b000-000000001074', 'Generador de Oxigeno', 'PDO.GDO.GO2-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000004', NOW()),
('00000000-0000-4000-b000-000000001075', 'Generador de OZONO', 'PDO.GDO.GOZ-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000004', NOW()),
('00000000-0000-4000-b000-000000001076', 'CHILLER', 'PDO.GDO.CHR-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000004', NOW()),
('00000000-0000-4000-b000-000000001077', 'Monitoreo y control de fluido de ozono', 'PDO.ADO.MC-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000004', NOW()),
('00000000-0000-4000-b000-000000001078', 'Bombas de inyeccion de ozono', 'PDO.ADO.BBI-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000004', NOW()),
('00000000-0000-4000-b000-000000001079', 'Bombas de inyeccion de ozono', 'PDO.ADO.BBI-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000004', NOW()),
('00000000-0000-4000-b000-000000001080', 'Bombas de inyeccion de ozono', 'PDO.ADO.BBI-03', 'equipment', 'active', '00000000-0000-4000-b000-000000000004', NOW()),
('00000000-0000-4000-b000-000000001081', 'Destructor de Ozono', 'PDO.ADO.DT-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000004', NOW()),
('00000000-0000-4000-b000-000000001082', 'Muestreador de efluentes', 'PDO.ADO.MDE-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000004', NOW()),
('00000000-0000-4000-b000-000000001083', 'Muestreador de efluentes', 'PDO.ADO.MDE-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000004', NOW()),
('00000000-0000-4000-b000-000000001084', 'Bomba Suavizados de 125 HP', 'PSVZ.CTN.BBS-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000005', NOW()),
('00000000-0000-4000-b000-000000001085', 'Bomba Suavizados de 125 HP', 'PSVZ.CTN.BBS-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000005', NOW()),
('00000000-0000-4000-b000-000000001086', 'Bomba Suavizados de 125 HP', 'PSVZ.CTN.BBS-03', 'equipment', 'active', '00000000-0000-4000-b000-000000000005', NOW()),
('00000000-0000-4000-b000-000000001087', 'Bomba Tanques de Suavizadores', 'PSVZ.SVDR.BTS-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000005', NOW()),
('00000000-0000-4000-b000-000000001088', 'Bomba Tanques de Suavizadores', 'PSVZ.SVDR.BTS-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000005', NOW()),
('00000000-0000-4000-b000-000000001089', 'Bomba Tanques de Suavizadores', 'PSVZ.SVDR.BTS-03', 'equipment', 'active', '00000000-0000-4000-b000-000000000005', NOW()),
('00000000-0000-4000-b000-000000001090', 'Bomba Tanques de Suavizadores', 'PSVZ.SVDR.BTS-04', 'equipment', 'active', '00000000-0000-4000-b000-000000000005', NOW()),
('00000000-0000-4000-b000-000000001091', 'Bomba Tanques de Suavizadores', 'PSVZ.SVDR.BTS-05', 'equipment', 'active', '00000000-0000-4000-b000-000000000005', NOW()),
('00000000-0000-4000-b000-000000001092', 'Bomba Tanques de Suavizadores', 'PSVZ.SVDR.BTS-06', 'equipment', 'active', '00000000-0000-4000-b000-000000000005', NOW()),
('00000000-0000-4000-b000-000000001093', 'Bomba Tanques de Suavizadores', 'PSVZ.SVDR.BTS-07', 'equipment', 'active', '00000000-0000-4000-b000-000000000005', NOW()),
('00000000-0000-4000-b000-000000001094', 'Bomba Tanques de Suavizadores', 'PSVZ.SVDR.BTS-08', 'equipment', 'active', '00000000-0000-4000-b000-000000000005', NOW()),
('00000000-0000-4000-b000-000000001095', 'Bomba Tanques de Suavizadores', 'PSVZ.SVDR.BTS-09', 'equipment', 'active', '00000000-0000-4000-b000-000000000005', NOW()),
('00000000-0000-4000-b000-000000001096', 'Suavizadores', 'PSVZ.SVDR.TSVD-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000005', NOW()),
('00000000-0000-4000-b000-000000001097', 'Suavizadores', 'PSVZ.SVDR.TSVD-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000005', NOW()),
('00000000-0000-4000-b000-000000001098', 'Suavizadores', 'PSVZ.SVDR.TSVD-03', 'equipment', 'active', '00000000-0000-4000-b000-000000000005', NOW()),
('00000000-0000-4000-b000-000000001099', 'Suavizadores', 'PSVZ.SVDR.TSVD-04', 'equipment', 'active', '00000000-0000-4000-b000-000000000005', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.assets (id, name, code, asset_type, status, parent_id, created_at) VALUES
('00000000-0000-4000-b000-000000001100', 'Suavizadores', 'PSVZ.SVDR.TSVD-05', 'equipment', 'active', '00000000-0000-4000-b000-000000000005', NOW()),
('00000000-0000-4000-b000-000000001101', 'Bomba Concentrador de sal', 'PSVZ.MZS.BCS-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000005', NOW()),
('00000000-0000-4000-b000-000000001102', 'Bomba Concentrador de sal', 'PSVZ.MZS.BCS-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000005', NOW()),
('00000000-0000-4000-b000-000000001103', 'Bomba Concentrador de sal', 'PSVZ.MZS.BCS-03', 'equipment', 'active', '00000000-0000-4000-b000-000000000005', NOW()),
('00000000-0000-4000-b000-000000001104', 'Bomba Concentrador de sal', 'PSVZ.MZS.BCS-04', 'equipment', 'active', '00000000-0000-4000-b000-000000000005', NOW()),
('00000000-0000-4000-b000-000000001105', 'Bomba Concentrador de sal', 'PSVZ.MZS.BCS-05', 'equipment', 'active', '00000000-0000-4000-b000-000000000005', NOW()),
('00000000-0000-4000-b000-000000001106', 'Mixer de sal', 'PSVZ.MZS.MIS-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000005', NOW()),
('00000000-0000-4000-b000-000000001107', 'Mixer de sal', 'PSVZ.MZS.MIS-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000005', NOW()),
('00000000-0000-4000-b000-000000001108', 'Osmosis inversa', 'PCLD.GDV.OSI-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000006', NOW()),
('00000000-0000-4000-b000-000000001109', 'Bomba para envio de agua', 'PCLD.GDV.BEA-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000006', NOW()),
('00000000-0000-4000-b000-000000001110', 'Bomba para envio de agua', 'PCLD.GDV.BEA-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000006', NOW()),
('00000000-0000-4000-b000-000000001111', 'Bomba para envio de agua', 'PCLD.GDV.BEA-03', 'equipment', 'active', '00000000-0000-4000-b000-000000000006', NOW()),
('00000000-0000-4000-b000-000000001112', 'Bomba para envio de agua', 'PCLD.GDV.BEA-04', 'equipment', 'active', '00000000-0000-4000-b000-000000000006', NOW()),
('00000000-0000-4000-b000-000000001113', 'Bomba para envio de agua', 'PCLD.GDV.BEA-05', 'equipment', 'active', '00000000-0000-4000-b000-000000000006', NOW()),
('00000000-0000-4000-b000-000000001114', 'Bomba para envio de agua', 'PCLD.GDV.BEA-06', 'equipment', 'active', '00000000-0000-4000-b000-000000000006', NOW()),
('00000000-0000-4000-b000-000000001115', 'Bomba para envio de agua', 'PCLD.GDV.BEA-07', 'equipment', 'active', '00000000-0000-4000-b000-000000000006', NOW()),
('00000000-0000-4000-b000-000000001116', 'Bomba para envio de agua', 'PCLD.GDV.BEA-08', 'equipment', 'active', '00000000-0000-4000-b000-000000000006', NOW()),
('00000000-0000-4000-b000-000000001117', 'Bomba para envio de agua', 'PCLD.GDV.BEA-09', 'equipment', 'active', '00000000-0000-4000-b000-000000000006', NOW()),
('00000000-0000-4000-b000-000000001118', 'Bomba para envio de agua', 'PCLD.GDV.BEA-10', 'equipment', 'active', '00000000-0000-4000-b000-000000000006', NOW()),
('00000000-0000-4000-b000-000000001119', 'Bomba para envio de agua', 'PCLD.GDV.BEA-11', 'equipment', 'active', '00000000-0000-4000-b000-000000000006', NOW()),
('00000000-0000-4000-b000-000000001120', 'Bomba para envio de agua', 'PCLD.GDV.BEA-12', 'equipment', 'active', '00000000-0000-4000-b000-000000000006', NOW()),
('00000000-0000-4000-b000-000000001121', 'Calderas', 'PCLD.GDV.TCDL-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000006', NOW()),
('00000000-0000-4000-b000-000000001122', 'Calderas', 'PCLD.GDV.TCDL-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000006', NOW()),
('00000000-0000-4000-b000-000000001123', 'Calderas', 'PCLD.GDV.TCDL-03', 'equipment', 'active', '00000000-0000-4000-b000-000000000006', NOW()),
('00000000-0000-4000-b000-000000001124', 'Calderas', 'PCLD.GDV.TCDL-04', 'equipment', 'active', '00000000-0000-4000-b000-000000000006', NOW()),
('00000000-0000-4000-b000-000000001125', 'Bombas contra incendio de 200 HP', 'SCI.CBCI.BCI-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000007', NOW()),
('00000000-0000-4000-b000-000000001126', 'Bombas contra incendio de 200 HP', 'SCI.CBCI.BCI-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000007', NOW()),
('00000000-0000-4000-b000-000000001127', 'Transformador 46/23KV', 'SB.46kV.TX-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000008', NOW()),
('00000000-0000-4000-b000-000000001128', 'Transformador 46/23KV', 'SB.46kV.TX-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000008', NOW()),
('00000000-0000-4000-b000-000000001129', 'Interruptor de potencia 46kV', 'SB.46kV.INT-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000008', NOW()),
('00000000-0000-4000-b000-000000001130', 'Interruptor de potencia 46kV', 'SB.46kV.INT-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000008', NOW()),
('00000000-0000-4000-b000-000000001131', 'Transformador de corriente', 'SB.46kV.TC-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000008', NOW()),
('00000000-0000-4000-b000-000000001132', 'Transformador de corriente', 'SB.46kV.TC-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000008', NOW()),
('00000000-0000-4000-b000-000000001133', 'Transformador de corriente', 'SB.46kV.TC-03', 'equipment', 'active', '00000000-0000-4000-b000-000000000008', NOW()),
('00000000-0000-4000-b000-000000001134', 'Transformador de corriente', 'SB.46kV.TC-04', 'equipment', 'active', '00000000-0000-4000-b000-000000000008', NOW()),
('00000000-0000-4000-b000-000000001135', 'Transformador de corriente', 'SB.46kV.TC-05', 'equipment', 'active', '00000000-0000-4000-b000-000000000008', NOW()),
('00000000-0000-4000-b000-000000001136', 'Transformador de corriente', 'SB.46kV.TC-06', 'equipment', 'active', '00000000-0000-4000-b000-000000000008', NOW()),
('00000000-0000-4000-b000-000000001137', 'Vaporizadores', 'PCLD.GLP.VAP-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000006', NOW()),
('00000000-0000-4000-b000-000000001138', 'Vaporizadores', 'PCLD.GLP.VAP-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000006', NOW()),
('00000000-0000-4000-b000-000000001139', 'Vaporizadores', 'PCLD.GLP.VAP-03', 'equipment', 'active', '00000000-0000-4000-b000-000000000006', NOW()),
('00000000-0000-4000-b000-000000001140', 'Vaporizadores', 'PCLD.GLP.VAP-04', 'equipment', 'active', '00000000-0000-4000-b000-000000000006', NOW()),
('00000000-0000-4000-b000-000000001141', 'Vaporizadores', 'PCLD.GLP.VAP-05', 'equipment', 'active', '00000000-0000-4000-b000-000000000006', NOW()),
('00000000-0000-4000-b000-000000001142', 'Vaporizadores', 'PCLD.GLP.VAP-06', 'equipment', 'active', '00000000-0000-4000-b000-000000000006', NOW()),
('00000000-0000-4000-b000-000000001143', 'Vaporizadores', 'PCLD.GLP.VAP-07', 'equipment', 'active', '00000000-0000-4000-b000-000000000006', NOW()),
('00000000-0000-4000-b000-000000001144', 'Vaporizadores', 'PCLD.GLP.VAP-08', 'equipment', 'active', '00000000-0000-4000-b000-000000000006', NOW()),
('00000000-0000-4000-b000-000000001145', 'Vaporizadores', 'PCLD.GLP.VAP-09', 'equipment', 'active', '00000000-0000-4000-b000-000000000006', NOW()),
('00000000-0000-4000-b000-000000001146', 'Vaporizadores', 'PCLD.GLP.VAP-10', 'equipment', 'active', '00000000-0000-4000-b000-000000000006', NOW()),
('00000000-0000-4000-b000-000000001147', 'Tanques de GLP', 'PCLD.GLP.TAN-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000006', NOW()),
('00000000-0000-4000-b000-000000001148', 'Tanques de GLP', 'PCLD.GLP.TAN-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000006', NOW()),
('00000000-0000-4000-b000-000000001149', 'Aireadores de 10 HP', 'SCI.CBCI.AE-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000007', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.assets (id, name, code, asset_type, status, parent_id, created_at) VALUES
('00000000-0000-4000-b000-000000001150', 'Aireadores de 10 HP', 'SCI.CBCI.AE-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000007', NOW()),
('00000000-0000-4000-b000-000000001151', 'Aireadores de 10 HP', 'SCI.CBCI.AE-03', 'equipment', 'active', '00000000-0000-4000-b000-000000000007', NOW()),
('00000000-0000-4000-b000-000000001152', 'Aireadores de 10 HP', 'SCI.CBCI.AE-04', 'equipment', 'active', '00000000-0000-4000-b000-000000000007', NOW()),
('00000000-0000-4000-b000-000000001153', 'Bombas de riego de 20 HP socks', 'INF.JAR.BRS-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000009', NOW()),
('00000000-0000-4000-b000-000000001154', 'Bombas de riego de 20 HP socks', 'INF.JAR.BRS-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000009', NOW()),
('00000000-0000-4000-b000-000000001155', 'Bombas de riego de 30 HP Textiles', 'INF.JAR.BRT-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000009', NOW()),
('00000000-0000-4000-b000-000000001156', 'Bombas de riego de 30 HP Textiles', 'INF.JAR.BRT-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000009', NOW()),
('00000000-0000-4000-b000-000000001157', 'Bombas DP', 'PTAR2.RL.DP-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001158', 'Bombas DP', 'PTAR2.RL.DP-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001159', 'Mixers de agua sanitaria', 'PTAR2.AA.MIXS-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001160', 'Mixers de agua sanitaria', 'PTAR2.AA.MIXS-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001161', 'Mixers de agua sanitaria', 'PTAR2.AA.MIXS-03', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001162', 'Interruptor de Potencia 23KV', 'SB.23KV.INT-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000008', NOW()),
('00000000-0000-4000-b000-000000001163', 'Interruptor de Potencia 23KV', 'SB.23KV.INT-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000008', NOW()),
('00000000-0000-4000-b000-000000001164', 'Muro perimetral', 'INF.CIV.MUR-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000009', NOW()),
('00000000-0000-4000-b000-000000001165', 'Linea de 46kV (Tendido)', 'SB.46kV.LIN-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000008', NOW()),
('00000000-0000-4000-b000-000000001166', 'Linea de 23kV (Tendido)', 'SB.23KV.LIN-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000008', NOW()),
('00000000-0000-4000-b000-000000001167', 'Pozo', 'PSVZ.EXT.POZ-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000005', NOW()),
('00000000-0000-4000-b000-000000001168', 'Pozo', 'PSVZ.EXT.POZ-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000005', NOW()),
('00000000-0000-4000-b000-000000001169', 'Pozo', 'PSVZ.EXT.POZ-03', 'equipment', 'active', '00000000-0000-4000-b000-000000000005', NOW()),
('00000000-0000-4000-b000-000000001170', 'Pozo', 'PSVZ.EXT.POZ-04', 'equipment', 'active', '00000000-0000-4000-b000-000000000005', NOW()),
('00000000-0000-4000-b000-000000001171', 'Pozo', 'PSVZ.EXT.POZ-05', 'equipment', 'active', '00000000-0000-4000-b000-000000000005', NOW()),
('00000000-0000-4000-b000-000000001172', 'Motor', 'PSVZ.EXT.BOM-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000005', NOW()),
('00000000-0000-4000-b000-000000001173', 'Transformador de potencial 23kV', 'SB.23KV.TP-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000008', NOW()),
('00000000-0000-4000-b000-000000001174', 'Transformador de potencial 23kV', 'SB.23KV.TP-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000008', NOW()),
('00000000-0000-4000-b000-000000001175', 'Transformador de potencial 23kV', 'SB.23KV.TP-03', 'equipment', 'active', '00000000-0000-4000-b000-000000000008', NOW()),
('00000000-0000-4000-b000-000000001176', 'Transformador de potencial 46kV', 'SB.46kV.TP-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000008', NOW()),
('00000000-0000-4000-b000-000000001177', 'Transformador de potencial 46kV', 'SB.46kV.TP-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000008', NOW()),
('00000000-0000-4000-b000-000000001178', 'Transformador de potencial 46kV', 'SB.46kV.TP-03', 'equipment', 'active', '00000000-0000-4000-b000-000000000008', NOW()),
('00000000-0000-4000-b000-000000001179', 'Cribas', 'PTAR2.ENT.CRI-01', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()),
('00000000-0000-4000-b000-000000001180', 'Cribas', 'PTAR2.ENT.CRI-02', 'equipment', 'active', '00000000-0000-4000-b000-000000000003', NOW()) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 3. VENDORS - Talleres Externos
-- ============================================================================

INSERT INTO public.vendors (id, name, category, contact_name, email, phone, tax_id, is_active, created_at) VALUES
('00000000-0000-4000-b000-000000010000', 'SIMD', 'service', NULL, NULL, NULL, NULL, true, NOW()),
('00000000-0000-4000-b000-000000010001', 'Taller Hernandez', 'service', NULL, NULL, NULL, NULL, true, NOW()),
('00000000-0000-4000-b000-000000010002', 'JV Sistemas', 'service', NULL, NULL, NULL, NULL, true, NOW()),
('00000000-0000-4000-b000-000000010003', 'Energy', 'service', NULL, NULL, NULL, NULL, true, NOW()),
('00000000-0000-4000-b000-000000010004', 'Cideca', 'service', NULL, NULL, NULL, NULL, true, NOW()),
('00000000-0000-4000-b000-000000010005', 'Kaeser', 'service', NULL, NULL, NULL, NULL, true, NOW()),
('00000000-0000-4000-b000-000000010006', 'MAPOSA', 'service', NULL, NULL, NULL, NULL, true, NOW()),
('00000000-0000-4000-b000-000000010007', 'IMR', 'service', NULL, NULL, NULL, NULL, true, NOW()),
('00000000-0000-4000-b000-000000010008', 'Energetica', 'service', NULL, NULL, NULL, NULL, true, NOW()) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 4. PM PLANS y PM TASKS
-- ============================================================================

-- Plan: CDL.GDV.OSI (CDL.GDV.OSI)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033000', 'CDL.GDV.OSI (CDL.GDV.OSI)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044000', '00000000-0000-4000-b000-000000033000', 'Partes: Labor de Mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044001', '00000000-0000-4000-b000-000000033000', 'Basel: Inspecciones del Basel (Verificar niveles de quimicos)', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044002', '00000000-0000-4000-b000-000000033000', 'Basel: Lavado de Basel', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044003', '00000000-0000-4000-b000-000000033000', 'Basel: Cambio de membrana', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044004', '00000000-0000-4000-b000-000000033000', 'FILTRO MS40: Cambio de filtros', 4, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044005', '00000000-0000-4000-b000-000000033000', 'Panel de control: Inspección visual y limpieza a los ventiladores de refrigeración y a los componentes eléctricos', 5, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044006', '00000000-0000-4000-b000-000000033000', 'Sistema de tuberias, válvulas y actuadores neumaticos: Comprobar el estado y la seguridad de las tuberías.', 6, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044007', '00000000-0000-4000-b000-000000033000', 'Sistema de tuberias, válvulas y actuadores neumaticos: Comprobar el estado y la seguridad de las conexiones de las válvulas', 7, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044008', '00000000-0000-4000-b000-000000033000', 'Sistema de tuberias, válvulas y actuadores neumaticos: Comprobar el estado y funcionamiento de los actuadores automáticos.', 8, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044009', '00000000-0000-4000-b000-000000033000', 'Panel de control: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas en el hardware(Medir tensión, corriente y medir aislamiento)', 9, 12)
ON CONFLICT (id) DO NOTHING;
-- Plan: CDL..BEA (CDL..BEA)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033001', 'CDL..BEA (CDL..BEA)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044010', '00000000-0000-4000-b000-000000033001', 'Partes: Labor de Mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044011', '00000000-0000-4000-b000-000000033001', 'BOMBA: Revisar acople y Alineamiento', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044012', '00000000-0000-4000-b000-000000033001', 'MOTOR: Inspecciones generales del Motor (Verificar temperatura y parámetros eléctricos)', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044013', '00000000-0000-4000-b000-000000033001', 'Panel de control: Inspección visual y limpieza a los ventiladores de refrigeración y a los componentes eléctricos', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044014', '00000000-0000-4000-b000-000000033001', 'BOMBA: Inspecciones generales de la Bomba (Verificar temperatura y verficiar desgaste en Sellos mecanicos)', 4, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044015', '00000000-0000-4000-b000-000000033001', 'BOMBA: Verificar funcionamiento y limpiar impulsor de la bomba y cambiar si es necesario', 5, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044016', '00000000-0000-4000-b000-000000033001', 'MOTOR: Mantenimiento de los rodamientos y sellos del motor (Verificar temperatura, Lubricación y si es necesario cambio de rodamientos, sellos, retenedores, O-rings)', 6, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044017', '00000000-0000-4000-b000-000000033001', 'MOTOR: Limpiar el motor y mantener las aberturas de ventilación despejadas', 7, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044018', '00000000-0000-4000-b000-000000033001', 'Estructura: Comprobar la integridad de todos los pernos, y alineamiento de la Bomba.', 8, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044019', '00000000-0000-4000-b000-000000033001', 'Sistema de tuberias y válvulas: Comprobar el estado y la seguridad de las tuberías.', 9, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044020', '00000000-0000-4000-b000-000000033001', 'Sistema de tuberias y válvulas: Comprobar el estado y la seguridad de las conexiones de las válvulas', 10, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044021', '00000000-0000-4000-b000-000000033001', 'Sistema de tuberias y válvulas: Comprobar funcionamiento de la válvula de Pie', 11, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044022', '00000000-0000-4000-b000-000000033001', 'Panel de control: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas en el hardware(Medir tensión, corriente y medir aislamiento)', 12, 12)
ON CONFLICT (id) DO NOTHING;
-- Plan: CDL..TCDL (CDL..TCDL)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033002', 'CDL..TCDL (CDL..TCDL)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044023', '00000000-0000-4000-b000-000000033002', 'Partes: Labor de Mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044024', '00000000-0000-4000-b000-000000033002', 'QUEMADOR: Cambio de boquillas', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044025', '00000000-0000-4000-b000-000000033002', 'QUEMADOR: Revisar el quemador (Verificar funcionamiento)', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044026', '00000000-0000-4000-b000-000000033002', 'QUEMADOR: Verificar que exista buena Combustión (Observando la temperatura de la chimenea)', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044027', '00000000-0000-4000-b000-000000033002', 'QUEMADOR: Limpiar electrodos', 4, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044028', '00000000-0000-4000-b000-000000033002', 'QUEMADOR: Revisar cables de ignición y aisladores de ignición', 5, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044029', '00000000-0000-4000-b000-000000033002', 'QUEMADOR: Limpiar Fotocelda', 6, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044030', '00000000-0000-4000-b000-000000033002', 'Estructura de Caldera: Inspeccionar funcionamiento válvula de seguridad', 7, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044031', '00000000-0000-4000-b000-000000033002', 'Estructura de Caldera: Inspeciona válvula dosificadora de fuel-oil (Buscar fugas y reemplazar si es necesario)', 8, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044032', '00000000-0000-4000-b000-000000033002', 'Estructura de Caldera: Inspección visual en busca de daños o fugas y limpieza de la tuberia de agua, vapor, gases de combustión.', 9, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044033', '00000000-0000-4000-b000-000000033002', 'Estructura de Caldera: Inspeccionar funcionamiento la trampa de vapor del precalentador de combustible bunker', 10, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044034', '00000000-0000-4000-b000-000000033002', 'Estructura de Caldera: Cambio de empaque', 11, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044035', '00000000-0000-4000-b000-000000033002', 'Estructura de Caldera: Revision de pernos y tuercas de puertas', 12, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044036', '00000000-0000-4000-b000-000000033002', 'Estructura de Caldera: Revisión de material refractario', 13, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044037', '00000000-0000-4000-b000-000000033002', 'Estructura de Caldera: Limpieza general y repintar', 14, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044038', '00000000-0000-4000-b000-000000033002', 'Sistema de Combustible: Verificar funcionamiento del calentador', 15, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044039', '00000000-0000-4000-b000-000000033002', 'Sistema de Combustible: Revisar la linea de alimentación.', 16, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044040', '00000000-0000-4000-b000-000000033002', 'Sistema de Combustible: Limpiar filtro de canasta, y filtro de peineta', 17, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044041', '00000000-0000-4000-b000-000000033002', 'Sistema de Combustible: Inspeccionar el funcionamiento de válvulas solenoides', 18, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044042', '00000000-0000-4000-b000-000000033002', 'Sistema de Combustible: Limpiar calentador', 19, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044043', '00000000-0000-4000-b000-000000033002', 'Panel de control: Inspección visual y limpieza a los ventiladores de refrigeración y componentes eléctricos', 20, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044044', '00000000-0000-4000-b000-000000033002', 'Panel de control: Limpiar el presurestol', 21, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044045', '00000000-0000-4000-b000-000000033002', 'Panel de control: Revisar cápsulas de mercurio, fusibles y terminales', 22, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044046', '00000000-0000-4000-b000-000000033002', 'Panel de control: Revisar termoestatos y contactores', 23, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044047', '00000000-0000-4000-b000-000000033002', 'Sistema de aire secundario: Limpieza de malla de ventilador', 24, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044048', '00000000-0000-4000-b000-000000033002', 'Sistema de aire secundario: Inspecciones generales de los motores (Verificar temperatura y parámetros eléctricos)', 25, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044049', '00000000-0000-4000-b000-000000033002', 'Sistema de aire secundario: Mantenimiento de los rodamientos (Lubricación y si es necesario cambio de rodamientos, sellos, retenedores, O-rings)', 26, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044050', '00000000-0000-4000-b000-000000033002', 'Control de nivel de agua: Purgar el nivel de carga de vapor con la Válvula de purga de nivel', 27, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044051', '00000000-0000-4000-b000-000000033002', 'Control de nivel de agua: Inspeccion de condición tubo de nivel', 28, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044052', '00000000-0000-4000-b000-000000033002', 'Control de nivel de agua: Limpieza del flotador y Revisar diafragma de flotador', 29, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044053', '00000000-0000-4000-b000-000000033002', 'Bomba de aire y sistema de lubricación: Inspecciones generales de la bomba y verificar acople de transmisión con el motor  (Verificar temperatura y parámetros eléctricos)', 30, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044054', '00000000-0000-4000-b000-000000033002', 'Bomba de aire y sistema de lubricación: Mantenimiento de los rodamientos (Lubricación y si es necesario cambio de rodamientos, sellos, retenedores, O-rings)', 31, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044055', '00000000-0000-4000-b000-000000033002', 'Bomba de aire y sistema de lubricación: Remplazar filtro de aceite lubricante y serpentín de refrigeración', 32, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044056', '00000000-0000-4000-b000-000000033002', 'QUEMADOR: Revisar aisladores de ignición', 33, 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044057', '00000000-0000-4000-b000-000000033002', 'QUEMADOR: Revision de Piloto de Gas( fugas y limpiar la salida de conducción)', 34, 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044058', '00000000-0000-4000-b000-000000033002', 'QUEMADOR: Limpiar el quemador', 35, 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044059', '00000000-0000-4000-b000-000000033002', 'Bomba de aire y sistema de lubricación: Limpieza de Enfriador de aceite lubricante', 36, 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044060', '00000000-0000-4000-b000-000000033002', 'Estructura de Caldera: Limpieza de chimenea', 37, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044061', '00000000-0000-4000-b000-000000033002', 'Sistema de Combustible: Inspecionar la fajas de transmisión, y revisar la alineacion de bomba a motor', 38, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044062', '00000000-0000-4000-b000-000000033002', 'Sistema de Combustible: Inspecciones generales de las bombas de tanque principal a tanque diario (Verificar temperatura y parámetros eléctricos)', 39, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044063', '00000000-0000-4000-b000-000000033002', 'Panel de control: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas en el hardware(Medir tensión, corriente y medir aislamiento)', 40, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044064', '00000000-0000-4000-b000-000000033002', 'Control de nivel de agua: Desmontar y limpiar columna de Mcdonell', 41, 12)
ON CONFLICT (id) DO NOTHING;
-- Plan: PDO.ADO.DTO (PDO.ADO.DTO)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033003', 'PDO.ADO.DTO (PDO.ADO.DTO)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044065', '00000000-0000-4000-b000-000000033003', 'Partes: Labor de mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044066', '00000000-0000-4000-b000-000000033003', 'Soplador: Inspecciones generales del soplador (Verificar temperatura y parametros eléctricos)', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044067', '00000000-0000-4000-b000-000000033003', 'Panel de control: Revisar datos y sus parámetros de los Sensores de presión', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044068', '00000000-0000-4000-b000-000000033003', 'Panel de control: Inspección visual y limpieza a los ventiladores de refrigeración y a los componentes eléctricos', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044069', '00000000-0000-4000-b000-000000033003', 'Panel de control: Revisar el monitor de OZONO', 4, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044070', '00000000-0000-4000-b000-000000033003', 'Ensamble del Destructor de Ozono: Vaciar y limpiar el WATER TRAP', 5, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044071', '00000000-0000-4000-b000-000000033003', 'Ensamble del Destructor de Ozono: Comprobar el estado y la seguridad de la caja de policarbonato', 6, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044072', '00000000-0000-4000-b000-000000033003', 'Soplador: Mantenimiento de los rodamientos del soplador (Verificar temperatura, Lubricación y si es necesario cambio de rodamientos, empaques, retenedores, O-rings)', 7, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044073', '00000000-0000-4000-b000-000000033003', 'Panel de control: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas en el hardware(Medir tensión, corriente y medir aislamiento)', 8, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044074', '00000000-0000-4000-b000-000000033003', 'Sistema de Válvulas y Tuberias: Comprobar el estado y la seguridad de las conexiones de las tuberías.', 9, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044075', '00000000-0000-4000-b000-000000033003', 'Sistema de Válvulas y Tuberias: Comprobar el estado y la seguridad de las conexiones de las mangueras.', 10, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044076', '00000000-0000-4000-b000-000000033003', 'Sistema de Válvulas y Tuberias: Comprobar el estado y funcionamiento de los actuadores automáticos.', 11, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044077', '00000000-0000-4000-b000-000000033003', 'Ensamble del Destructor de Ozono: Comprobar el estado de las mallas térmicas y de las Tiras de tela de silicia', 12, 12)
ON CONFLICT (id) DO NOTHING;
-- Plan: PDO.ADO.INO (PDO.ADO.INO)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033004', 'PDO.ADO.INO (PDO.ADO.INO)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044078', '00000000-0000-4000-b000-000000033004', 'Partes: Labor de mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044079', '00000000-0000-4000-b000-000000033004', 'Bombas: Inspecciones generales de las bombas(Verificar temperatura)', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044080', '00000000-0000-4000-b000-000000033004', 'Motores: Inspecciones generales de los motores(Verificar temperatura y parametros eléctricos)', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044081', '00000000-0000-4000-b000-000000033004', 'Motores: Limpiar el motor y mantener las aberturas de ventilación despejadas', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044082', '00000000-0000-4000-b000-000000033004', 'Panel de control: Revisar datos y parámetros en los Sensores y verificar alarmas', 4, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044083', '00000000-0000-4000-b000-000000033004', 'Panel de control: Inspección visual y limpieza a los ventiladores de refrigeración y a los componentes eléctricos', 5, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044084', '00000000-0000-4000-b000-000000033004', 'Panel de control: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas  en el hardware(Medir tensión, corriente y medir aislamiento), y de igual manera revisar los circuitos', 6, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044085', '00000000-0000-4000-b000-000000033004', 'Analizador de Ozono: Revisar los datos y resultados del analizador de Ozono de Higiene Industrial', 7, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044086', '00000000-0000-4000-b000-000000033004', 'Analizador de Ozono: Sustituir el filtro de partículas', 8, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044087', '00000000-0000-4000-b000-000000033004', 'Analizador de Ozono: Sustituir la bomba de muestreo', 9, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044088', '00000000-0000-4000-b000-000000033004', 'Analizador de Ozono: Sustituir módulo sensor de la Válvula', 10, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044089', '00000000-0000-4000-b000-000000033004', 'Sistema de Válvulas y Tuberias: Comprobar el estado y la seguridad de las conexiones de las tuberías.', 11, 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044090', '00000000-0000-4000-b000-000000033004', 'Sistema de Válvulas y Tuberias: Comprobar el estado y la seguridad de las conexiones de las mangueras.', 12, 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044091', '00000000-0000-4000-b000-000000033004', 'Sistema de Válvulas y Tuberias: Comprobar el estado y la seguridad de las conexiones de las válvulas', 13, 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044092', '00000000-0000-4000-b000-000000033004', 'Bomba: Verificar funcionamiento y limpiar impulsor de la bomba y cambiar si es necesario', 14, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044093', '00000000-0000-4000-b000-000000033004', 'Bombas: Mantenimiento de los rodamientos de los bombas(Verificar temperatura, Lubricación y si es necesario cambio de rodamientos, empaques, retenedores, O-rings)', 15, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044094', '00000000-0000-4000-b000-000000033004', 'Bombas: Revisar los acoples y Fajas, cambiar si es nesecario', 16, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044095', '00000000-0000-4000-b000-000000033004', 'Motores: Mantenimiento de los rodamientos de los motores(Verificar temperatura, Lubricación y si es necesario cambio de rodamientos, empaques, retenedores, O-rings)', 17, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044096', '00000000-0000-4000-b000-000000033004', 'Panel de control: Comprobar el funcionamiento de los IGBT y Capacitores en el Bus de CC (Realizar pruebas de medición, verificar temperaturas y cambiar si es necesario)', 18, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044097', '00000000-0000-4000-b000-000000033004', 'Actuadores Neumáticos.: Comprobar el estado y funcionamiento de los actuadores Neumáticos.', 19, 12)
ON CONFLICT (id) DO NOTHING;
-- Plan: PDO.ADO.MCO (PDO.ADO.MCO)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033005', 'PDO.ADO.MCO (PDO.ADO.MCO)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044098', '00000000-0000-4000-b000-000000033005', 'Partes: Labor de mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044099', '00000000-0000-4000-b000-000000033005', 'Medidor: Revisar datos y parámetros en el Medidor de control de fluidos y Controlador de Fluidos Masico', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044100', '00000000-0000-4000-b000-000000033005', 'Medidor: Revissar y Calibrar el Controlador de Fluidos Masico', 2, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044101', '00000000-0000-4000-b000-000000033005', 'Panel de control : Comprobar el estado y la seguridad de las conexiones de las mangueras.', 3, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044102', '00000000-0000-4000-b000-000000033005', 'Panel de control : Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas en el hardware(Medir tensión, corriente y medir aislamiento)', 4, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044103', '00000000-0000-4000-b000-000000033005', 'Panel de control : Verificar funcionamiento de las Electro válvulas', 5, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044104', '00000000-0000-4000-b000-000000033005', 'Panel de control : Inspección visual y limpieza a los componentes eléctricos', 6, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044105', '00000000-0000-4000-b000-000000033005', 'Valvulas y Tuberias: Comprobar el estado y la seguridad de las conexiones de las tuberías.', 7, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044106', '00000000-0000-4000-b000-000000033005', 'Valvulas y Tuberias: Comprobar el estado y la seguridad de las conexiones de los actuadores automáticos', 8, 12)
ON CONFLICT (id) DO NOTHING;
-- Plan: Muestreador de efluentes (PDO.ADO.MDE)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033006', 'Muestreador de efluentes (PDO.ADO.MDE)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044107', '00000000-0000-4000-b000-000000033006', 'Partes: Labor de mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044108', '00000000-0000-4000-b000-000000033006', 'Bomba Peristáltica: Inspeccionar funcionamiento de la Bomba(Revisar si el muestreador no bombea líquido, la bomba se atasca )', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044109', '00000000-0000-4000-b000-000000033006', 'Panel de control: Inspección visual y limpieza a los ventiladores de refrigeración y a los componentes eléctricos', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044110', '00000000-0000-4000-b000-000000033006', 'Bomba Peristáltica: Inspeccionar integridad y estado de las carcasa y rodillos de la bomba', 3, 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044111', '00000000-0000-4000-b000-000000033006', 'Bomba Peristáltica: Limpiar o reemplazar las piezas húmedas (botellas, tubo de aspiración colador, tubo de la bomba y tubo de descarga)', 4, 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044112', '00000000-0000-4000-b000-000000033006', 'Panel de Control: Realizar pruebas de diagnosticos para verificar parámetros (Revisar Detección defectuosa de líquidos y Volúmenes de muestra inexacto)', 5, 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044113', '00000000-0000-4000-b000-000000033006', 'Panel de Control: Realizar pruebas de temperatura para verificar que se encuentra en los parámetros adecuados', 6, 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044114', '00000000-0000-4000-b000-000000033006', 'Estructura: Limpieza de Manguera de succión', 7, 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044115', '00000000-0000-4000-b000-000000033006', 'Panel de control: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas en el hardware(Medir tensión, corriente y medir aislamiento)', 8, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044116', '00000000-0000-4000-b000-000000033006', 'Estructura: Limpieza del exterior y interior del muestreador', 9, 12)
ON CONFLICT (id) DO NOTHING;
-- Plan: Compresor de tornillo (PDO.AEC.CTR)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033007', 'Compresor de tornillo (PDO.AEC.CTR)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044117', '00000000-0000-4000-b000-000000033007', 'Partes: Labor de mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044118', '00000000-0000-4000-b000-000000033007', 'Filtros de aire y Mantos de los refirgerantes: Verificar el nivel de aceite del refrigerante', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044119', '00000000-0000-4000-b000-000000033007', 'Filtros de aire y Mantos de los refirgerantes: Tablero eléctrico: revisar el manto filtrante', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044120', '00000000-0000-4000-b000-000000033007', 'Filtros de aire y Mantos de los refirgerantes: Limpiar el enfriador', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044121', '00000000-0000-4000-b000-000000033007', 'Filtros de aire y Mantos de los refirgerantes: Revisar el manto filtrante del aire refrigerante', 4, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044122', '00000000-0000-4000-b000-000000033007', 'Filtros de aire y Mantos de los refirgerantes: Cambiar el manto filtrante de aire refrigerante', 5, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044123', '00000000-0000-4000-b000-000000033007', 'Filtros de aire y Mantos de los refirgerantes: Tablero eléctrico: cambiar el manto filtrante', 6, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044124', '00000000-0000-4000-b000-000000033007', 'Aceite: Cambio del Cartucho Separador de Aceite', 7, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044125', '00000000-0000-4000-b000-000000033007', 'Aceite: Cambiar el aceite refrigerante', 8, 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044126', '00000000-0000-4000-b000-000000033007', 'Filtros de aire y Mantos de los refirgerantes: Cambiar el elemento filtrante de aire', 9, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044127', '00000000-0000-4000-b000-000000033007', 'Motores: Mantenimiento de los rodamientos de los motores(Verificar temperatura, Lubricación y si es necesario cambio de rodamientos, empaques, retenedores, O-rings)', 10, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044128', '00000000-0000-4000-b000-000000033007', 'Motores: Revisar el acople', 11, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044129', '00000000-0000-4000-b000-000000033007', 'Motores: Inspecciones generales de los motores (Verificar parametros eléctricos y temperatura)', 12, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044130', '00000000-0000-4000-b000-000000033007', 'Aceite: Cambiar el filtro de aceite', 13, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044131', '00000000-0000-4000-b000-000000033007', 'Valvulas: Revisar funcionamiento de las válvula de alivio de presión, Válvula de entrada, termostática, de control de ventilación, de ventilación, y  neumática (Asegurarse que todas las puertas de acc', 14, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044132', '00000000-0000-4000-b000-000000033007', 'Enfriador: Limpiar y Verificar que en las mallas del enfriador no presente fugas', 15, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044133', '00000000-0000-4000-b000-000000033007', 'Sistema  Eléctrico: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas en el hardware(Medir tensión, corriente y medir aislamiento)', 16, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044134', '00000000-0000-4000-b000-000000033007', 'Sistema de tuberias: Comprobar el estado y la seguridad de las tuberías, mangueras y accesorios.', 17, 12)
ON CONFLICT (id) DO NOTHING;
-- Plan: PDO.GDO.CHR - copia (PDO.GDO.CHR - copia)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033008', 'PDO.GDO.CHR - copia (PDO.GDO.CHR - copia)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044135', '00000000-0000-4000-b000-000000033008', 'Partes: Labor de mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044136', '00000000-0000-4000-b000-000000033008', 'Generadores de Ozono : Inspeccionar tarjetas electronicas y remover polvillo residual', 1, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044137', '00000000-0000-4000-b000-000000033008', 'Generadores de Ozono : Inspeccionar y limpiar conexiones de gas y agua', 2, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044138', '00000000-0000-4000-b000-000000033008', 'Distribucion de fluidos: Reemplazar aislamiento dañado', 3, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044139', '00000000-0000-4000-b000-000000033008', 'Distribucion de fluidos: Verificacion de valvulas actuadas', 4, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044140', '00000000-0000-4000-b000-000000033008', 'Distribucion de fluidos: Busqueda y reparacion de fugas de gases y refrigerante', 5, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044141', '00000000-0000-4000-b000-000000033008', 'Intercambiadores: Reemplazar aislamiento', 6, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044142', '00000000-0000-4000-b000-000000033008', 'Intercambiadores: Verificar integridad de intercambiadores', 7, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044143', '00000000-0000-4000-b000-000000033008', 'Electronica : Drive AC/DC, medicion de puente rectificador y etapa de capacitores', 8, 12)
ON CONFLICT (id) DO NOTHING;
-- Plan: CHILLER  (PDO.GDO.CHR)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033009', 'CHILLER  (PDO.GDO.CHR)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044144', '00000000-0000-4000-b000-000000033009', 'Partes: Labor de mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044145', '00000000-0000-4000-b000-000000033009', 'Bombas: Inspección general de las bombas centrifugadoras(Verificar temperatura y parametros eléctricos)', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044146', '00000000-0000-4000-b000-000000033009', 'Depósito de expansión cerrado y kit de llenado: Verificar el estado y seguridad del tanque', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044147', '00000000-0000-4000-b000-000000033009', 'Sistema de Valvulas y Tuberias: Comprobar el estado y la seguridad de las conexiones de las tuberías(Verificar que no hay fugas de refrigerante).', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044148', '00000000-0000-4000-b000-000000033009', 'Sistema de Valvulas y Tuberias: Comprobar el estado y la seguridad de las conexiones de las Válvulas.', 4, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044149', '00000000-0000-4000-b000-000000033009', 'Ventiladores: Verificar que los ventiladores funcionen adecuadamente', 5, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044150', '00000000-0000-4000-b000-000000033009', 'Ventiladores: Limpiar las aletas del condensador', 6, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044151', '00000000-0000-4000-b000-000000033009', 'Panel de control: Verificar que no hay mensajes de error y Verificar funcionamiento de manometros y termometros', 7, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044152', '00000000-0000-4000-b000-000000033009', 'Panel de control: Verificar  niveles de Temperaturas en la salida de agua evaporada', 8, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044153', '00000000-0000-4000-b000-000000033009', 'Panel de Control: Inspección visual y limpieza de los componentes eléctricos', 9, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044154', '00000000-0000-4000-b000-000000033009', 'Ventiladores: Comprobar que las rejillas de la secadora están libres de suciedad y de cualquier otra obstrucción.', 10, 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044155', '00000000-0000-4000-b000-000000033009', 'Bombas: Mantenimiento de los rodamientos de la bomba (Verificar temperatura, Lubricación y si es necesario cambio de rodamientos, empaques, retenedores, O-rings)', 11, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044156', '00000000-0000-4000-b000-000000033009', 'Panel de Control: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas en el hardware(Medir tensión, corriente y medir aislamiento)', 12, 12)
ON CONFLICT (id) DO NOTHING;
-- Plan: Generador de Oxigeno (PDO.GDO.GO2)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033010', 'Generador de Oxigeno (PDO.GDO.GO2)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044157', '00000000-0000-4000-b000-000000033010', 'Partes: Labor de mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044158', '00000000-0000-4000-b000-000000033010', 'Filtros y cubetas: Inspeccionar los filtros y las cubetas', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044159', '00000000-0000-4000-b000-000000033010', 'Filtros y cubetas: Limpiar las cubetas', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044160', '00000000-0000-4000-b000-000000033010', 'Filtros y cubetas: Sustituir el elemento filtrante de partículas.', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044161', '00000000-0000-4000-b000-000000033010', 'Sistema de Válvulas y Actuadores: Asegurarse de que el drenaje automático funciona correctamente.', 4, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044162', '00000000-0000-4000-b000-000000033010', 'Sistema de Válvulas y Actuadores: Revision de fugas y oxigeno', 5, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044163', '00000000-0000-4000-b000-000000033010', 'Panel de Control: Revisar datos y parámetros de Sensor de oxigeno', 6, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044164', '00000000-0000-4000-b000-000000033010', 'Panel de Control: Inspección visual y limpieza de los componentes eléctricos', 7, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044165', '00000000-0000-4000-b000-000000033010', 'Panel de Control: Limpiar y Calibrar los sensores', 8, 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044166', '00000000-0000-4000-b000-000000033010', 'Filtros y cubetas: Sustituir el elemento filtrante coalescente.', 9, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044167', '00000000-0000-4000-b000-000000033010', 'Sistema de Válvulas y Actuadores: Comprobar el estado y funcionamiento de las válvulas: Solenoide, Bola, De Piston(Flujo de Aire).', 10, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044168', '00000000-0000-4000-b000-000000033010', 'Sistema de Válvulas y Actuadores: Comprobar el estado y funcionamiento de los actuadores automáticos.', 11, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044169', '00000000-0000-4000-b000-000000033010', 'Regulador de aire y swicth de presión: Limpiar y calibrar el regulador de aire y switch de presión', 12, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044170', '00000000-0000-4000-b000-000000033010', 'Panel de Control: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas en el hardware(Medir tensión, corriente y medir aislamiento)', 13, 12)
ON CONFLICT (id) DO NOTHING;
-- Plan: PSVZ.CTN.BB (PSVZ.CTN.BB)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033011', 'PSVZ.CTN.BB (PSVZ.CTN.BB)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044171', '00000000-0000-4000-b000-000000033011', 'Partes: Labor de Mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044172', '00000000-0000-4000-b000-000000033011', 'MOTOR  444TTFS6536EV: Inspecciones generales del Motor (Verificar temperatura y parámetros eléctricos)', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044173', '00000000-0000-4000-b000-000000033011', 'MOTOR  444TTFS6536EV: Revisar acople y Alineamiento', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044174', '00000000-0000-4000-b000-000000033011', 'MOTOR  444TTFS6536EV: Mantenimiento de los rodamientos y sellos del motor (Verificar temperatura, Lubricación y si es necesario cambio de rodamientos, sellos, retenedores, O-rings)', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044175', '00000000-0000-4000-b000-000000033011', 'BOMBA 3196: Mantenimiento de los Rodamientos de la bomba (Lubricación y si es necesario cambio de rodamientos, retenedores, O-rings)', 4, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044176', '00000000-0000-4000-b000-000000033011', 'BOMBA 3197: Drenar y sustituir el aceite', 5, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044177', '00000000-0000-4000-b000-000000033011', 'Variador de Frecuencia: Inspecciones generales del Variador de Frecuencia (Verificar temperatura que estas no sean mayores a 50°C, limpieza total en disipador y circuitos internos, quitar polvo y corr', 6, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044178', '00000000-0000-4000-b000-000000033011', 'Variador de Frecuencia: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas (Medir tensión, corriente y medir aislamiento), y circuitos internos del módulo (ZINT, ZGAB, ZGAD', 7, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044179', '00000000-0000-4000-b000-000000033011', 'Variador de Frecuencia: Sustitución de los circuitos internos del módulo (ZINT, ZGAB, ZGAD, ZCON, ZMU y Unidad de control ZCU)', 8, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044180', '00000000-0000-4000-b000-000000033011', 'Variador de Frecuencia: Sustitución del ventilador de refrigeración', 9, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044181', '00000000-0000-4000-b000-000000033011', 'MOTOR  444TTFS6536EV: Limpiar el motor y mantener las aberturas de ventilación despejadas', 10, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044182', '00000000-0000-4000-b000-000000033011', 'BOMBA 3196: Inspecciones generales de la Bomba (Verificar temperatura y verficiar desgaste en Sello dinámico, Sello mecanicos, Sello de laberinto de aceite y caja de empaquetadura)', 11, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044183', '00000000-0000-4000-b000-000000033011', 'BOMBA 3196: Verificar funcionamiento y limpiar impulsor de la bomba y cambiar si es necesario', 12, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044184', '00000000-0000-4000-b000-000000033011', 'Variador de Frecuencia: Inspección visual y limpieza del ventilador de refrigeración', 13, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044185', '00000000-0000-4000-b000-000000033011', 'Variador de Frecuencia: Comprobar el funcionamiento de los IGBT y Capacitores en el Bus de CC (Realizar pruebas de medición, verificar temperaturas y cambiar si es necesario)', 14, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044186', '00000000-0000-4000-b000-000000033011', 'Estructura: Comprobar la integridad de todos los pernos, y alineamiento entre Bomba y motor', 15, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044187', '00000000-0000-4000-b000-000000033011', 'Sistema de tuberias y válvulas: Comprobar el estado y la seguridad de las conexiones de las tuberías.', 16, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044188', '00000000-0000-4000-b000-000000033011', 'Sistema de tuberias y válvulas: Comprobar el estado y la seguridad de las conexiones de las válvulas', 17, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044189', '00000000-0000-4000-b000-000000033011', 'Sistema de tuberias y válvulas: Comprobar  funcionamiento de la válvula de Pie', 18, 12)
ON CONFLICT (id) DO NOTHING;
-- Plan: PSVZ.MZS.COS (PSVZ.MZS.COS)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033012', 'PSVZ.MZS.COS (PSVZ.MZS.COS)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044190', '00000000-0000-4000-b000-000000033012', 'Partes: Labor de Mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044191', '00000000-0000-4000-b000-000000033012', 'Bombas: Mantenimiento de los Rodamientos (Verificar temperatura, Lubricación y si es necesario cambio de rodamientos, sellos, retenedores, O-rings)', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044192', '00000000-0000-4000-b000-000000033012', 'Panel de control: Inspección visual y limpieza a los ventiladores de refrigeración y a los componentes eléctricos', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044193', '00000000-0000-4000-b000-000000033012', 'Sensores: Revisar datos y parámetros de Medidor de fluidos', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044194', '00000000-0000-4000-b000-000000033012', 'Bombas: Inspecciones generales de las bombas (Verificar temperatura y parámetros eléctricos)', 4, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044195', '00000000-0000-4000-b000-000000033012', 'Sistema de Válvulas y Tuberias: Comprobar el estado y la seguridad de las conexiones de las tuberías.', 5, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044196', '00000000-0000-4000-b000-000000033012', 'Sistema de Válvulas y Tuberias: Comprobar el estado y la seguridad de las conexiones de las válvulas', 6, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044197', '00000000-0000-4000-b000-000000033012', 'Sistema de tuberias y válvulas: Comprobar  funcionamiento de la válvula de Pie', 7, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044198', '00000000-0000-4000-b000-000000033012', 'Panel de control: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas en el hardware(Medir tensión, corriente y medir aislamiento)', 8, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044199', '00000000-0000-4000-b000-000000033012', 'Estructura: Comprobar la integridad de todos los pernos', 9, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044200', '00000000-0000-4000-b000-000000033012', 'Estructura: Limpiar y Repintar', 10, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044201', '00000000-0000-4000-b000-000000033012', 'Sensores: Verificacion de funcionamiento de medidores de flujo (Medir Temperatura, Tension, Corriente y Aislamiento)', 11, 12)
ON CONFLICT (id) DO NOTHING;
-- Plan: PSVZ.MZS.MIS3 (PSVZ.MZS.MIS3)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033013', 'PSVZ.MZS.MIS3 (PSVZ.MZS.MIS3)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044202', '00000000-0000-4000-b000-000000033013', 'Partes: Labor de Mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044203', '00000000-0000-4000-b000-000000033013', 'Motor: Inspecciones generales de los motores  (Verificar temperatura y parámetros eléctricos)', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044204', '00000000-0000-4000-b000-000000033013', 'Reductor: Comprobar nivel de aceite y verificar que no hay agua en el interior', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044205', '00000000-0000-4000-b000-000000033013', 'Reductor: Limpiar el reductor', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044206', '00000000-0000-4000-b000-000000033013', 'Reductor: Drenar y sustituir el aceite', 4, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044207', '00000000-0000-4000-b000-000000033013', 'Panel de control: Inspección visual y limpieza a los ventiladores de refrigeración y a los componentes eléctricos', 5, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044208', '00000000-0000-4000-b000-000000033013', 'Estructura: Comprobar la integridad de todos los pernos y vigas de soporte', 6, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044209', '00000000-0000-4000-b000-000000033013', 'Motor: Mantenimiento de los rodamientos (Lubricación y si es necesario cambio de rodamientos, sellos, retenedores, O-rings)', 7, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044210', '00000000-0000-4000-b000-000000033013', 'Reductor: Mantenimiento del Reductor (Verificar temperatura, Lubricación y si es necesario cambio de rodamientos, empaques, retenedores, O-rings)', 8, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044211', '00000000-0000-4000-b000-000000033013', 'Panel de control: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas (Medir tensión, corriente y medir aislamiento)', 9, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044212', '00000000-0000-4000-b000-000000033013', 'Estructura: Limpiar y Repintar', 10, 12)
ON CONFLICT (id) DO NOTHING;
-- Plan: PSVZ.SVZR.TSVZ (PSVZ.SVZR.TSVZ)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033014', 'PSVZ.SVZR.TSVZ (PSVZ.SVZR.TSVZ)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044213', '00000000-0000-4000-b000-000000033014', 'Partes: Labor de Mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044214', '00000000-0000-4000-b000-000000033014', 'Tanque Suavizador: Comprobar el estado de los tanques de suavizado interno', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044215', '00000000-0000-4000-b000-000000033014', 'Tanque Suavizador: Revisar Difusores en el Nivel Superior y Nivel Inferior (Cambiar si es necesario)', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044216', '00000000-0000-4000-b000-000000033014', 'Panel de control : Inspeccionar unidad de mantenimiento y cambiar envases, si es necesario.', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044217', '00000000-0000-4000-b000-000000033014', 'Sensores: Revisar datos y parámetros de Sensor de fluidos', 4, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044218', '00000000-0000-4000-b000-000000033014', 'Tanque Suavizador: Revisar nivel de resina', 5, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044219', '00000000-0000-4000-b000-000000033014', 'Sistema de tuberias, válvulas y actuadores neumaticos: Comprobar el estado y la seguridad de las conexiones de las tuberías.', 6, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044220', '00000000-0000-4000-b000-000000033014', 'Sistema de tuberias, válvulas y actuadores neumaticos: Comprobar el estado y la seguridad de las conexiones de las válvulas (Revisar Sellos y Empaques)', 7, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044221', '00000000-0000-4000-b000-000000033014', 'Sistema de tuberias, válvulas y actuadores neumaticos: Comprobar el estado y funcionamiento de los actuadores automáticos.', 8, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044222', '00000000-0000-4000-b000-000000033014', 'Panel de control : Comprobar el estado y la seguridad de las conexiones de las mangueras.', 9, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044223', '00000000-0000-4000-b000-000000033014', 'Panel de control : Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas en el hardware(Medir tensión, corriente y medir aislamiento)', 10, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044224', '00000000-0000-4000-b000-000000033014', 'Panel de control : Verificar funcionamiento de las Electro válvulas', 11, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044225', '00000000-0000-4000-b000-000000033014', 'Panel de control : Inspección visual y limpieza a los componentes eléctricos', 12, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044226', '00000000-0000-4000-b000-000000033014', 'Sensores: Verificacion de funcionamiento de medidores de flujo (Medir Temperatura, Tension, Corriente y Aislamiento)', 13, 12)
ON CONFLICT (id) DO NOTHING;
-- Plan: PSVZ.SVZ.BTS (PSVZ.SVZ.BTS)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033015', 'PSVZ.SVZ.BTS (PSVZ.SVZ.BTS)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044227', '00000000-0000-4000-b000-000000033015', 'Partes: Labor de Mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044228', '00000000-0000-4000-b000-000000033015', 'MOTOR: Revisar acople', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044229', '00000000-0000-4000-b000-000000033015', 'BOMBA: Inspecciones generales de las Bomba (Verificar temperatura)', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044230', '00000000-0000-4000-b000-000000033015', 'Panel de control: Inspección visual y limpieza a los ventiladores de refrigeración y a los componentes eléctricos', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044231', '00000000-0000-4000-b000-000000033015', 'MOTOR: Inspecciones generales del Motor (Verificar temperatura y parámetros eléctricos)', 4, 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044232', '00000000-0000-4000-b000-000000033015', 'MOTOR: Mantenimiento de los rodamientos y sellos del motor (Verificar temperatura, Lubricación y si es necesario cambio de rodamientos, sellos, retenedores, O-rings)', 5, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044233', '00000000-0000-4000-b000-000000033015', 'MOTOR: Limpiar el motor y mantener las aberturas de ventilación despejadas', 6, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044234', '00000000-0000-4000-b000-000000033015', 'BOMBA: Verificar funcionamiento y limpiar impulsor de la bomba', 7, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044235', '00000000-0000-4000-b000-000000033015', 'BOMBA: Mantenimiento de los Sellos de labio, Sellos mecanicos y Rodamientos de la bomba (Verificar temperatura, Lubricación y si es necesario cambio de rodamientos, sellos, retenedores, O-rings)', 8, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044236', '00000000-0000-4000-b000-000000033015', 'Sistema de tuberias y válvulas: Comprobar el estado y la seguridad de las conexiones de las tuberías.', 9, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044237', '00000000-0000-4000-b000-000000033015', 'Sistema de tuberias y válvulas: Comprobar el estado y la seguridad de las conexiones de las válvulas', 10, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044238', '00000000-0000-4000-b000-000000033015', 'Sistema de tuberias y válvulas: Comprobar  funcionamiento de la válvula de Pie', 11, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044239', '00000000-0000-4000-b000-000000033015', 'Panel de control: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas en el hardware(Medir tensión, corriente y medir aislamiento)', 12, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044240', '00000000-0000-4000-b000-000000033015', 'Panel de control: Comprobar el estado y la seguridad del cableado en los variadores de frecuencia(Medir tensión, corriente y medir aislamiento)', 13, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044241', '00000000-0000-4000-b000-000000033015', 'Panel de control: Comprobar el funcionamiento de los IGBT y Capacitores en el Bus de CC (Realizar pruebas de medición, verificar temperaturas y cambiar si es necesario)', 14, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044242', '00000000-0000-4000-b000-000000033015', 'Estructura: Comprobar la integridad de todos los pernos, y Alineamiento entre Bomba y Motor', 15, 12)
ON CONFLICT (id) DO NOTHING;
-- Plan: PTAR1.AA.AE20 (PTAR1.AA.AE20)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033016', 'PTAR1.AA.AE20 (PTAR1.AA.AE20)', 'Plan de mantenimiento preventivo migrado', 'calendar', 15, 'days', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044243', '00000000-0000-4000-b000-000000033016', 'Reductor: Comprobar niveles de aceite', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044244', '00000000-0000-4000-b000-000000033016', 'Partes: Labor de Mantenimiento', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044245', '00000000-0000-4000-b000-000000033016', 'Flange y rotor: Comprobación la integridad de todas las fijaciones*', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044246', '00000000-0000-4000-b000-000000033016', 'Estructura: Inspeccionar visualmente el aireador en busca de basura o residuos acumulados.*', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044247', '00000000-0000-4000-b000-000000033016', 'Estructura: Comprobar la integridad del sistema de anclaje de los flotadores y flotadores.*', 4, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044248', '00000000-0000-4000-b000-000000033016', 'Estructura: Comprobar la integridad de la soldadura de las aspas y marcos de la estructura.', 5, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044249', '00000000-0000-4000-b000-000000033016', 'Estructura: Comprobar la integridad de todos los pernos.', 6, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044250', '00000000-0000-4000-b000-000000033016', 'Motor: Inspección general de los motores (verificar parametros eléctricos y temperatura)', 7, 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044251', '00000000-0000-4000-b000-000000033016', 'Reductor: Revisar la integridad de las Fajas y poleas (Medir su tensión, Cambiar si es nesecario)', 8, 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044252', '00000000-0000-4000-b000-000000033016', 'Motor: Limpiar el motor y mantener las aberturas de ventilación despejadas*', 9, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044253', '00000000-0000-4000-b000-000000033016', 'Motor: Mantenimiento de los rodamientos de los motores(Cambio de empaques, retenedores, O-rings, lubricación y verificar temperatura)*', 10, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044254', '00000000-0000-4000-b000-000000033016', 'Reductor: Drenar y sustituir el aceite*', 11, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044255', '00000000-0000-4000-b000-000000033016', 'Reductor: Sustituir el filtro de aire (Breather) *', 12, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044256', '00000000-0000-4000-b000-000000033016', 'Reductor: Inspeccionar y comprobar el funcionamiento del reductor de engranajes(Cambio de empaques, retenedores, O-rings, si es necesario, y Verificar temperatura)*', 13, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044257', '00000000-0000-4000-b000-000000033016', 'Reductor: Limpiar el reductor*', 14, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044258', '00000000-0000-4000-b000-000000033016', 'Chumaceras UHMW                      : Comprobar la integridad de la chumacera y collar de cierre', 15, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044259', '00000000-0000-4000-b000-000000033016', 'Chumaseras UHMW                      : Inspeccionar el desgaste del buje de bronce en el extremo del eje', 16, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044260', '00000000-0000-4000-b000-000000033016', 'Sistema eléctrico: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas (Medir tensión, corriente y medir aislamiento)', 17, 12)
ON CONFLICT (id) DO NOTHING;
-- Plan: Mixer Dirrecional (PTAR1.AA.MI)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033017', 'Mixer Dirrecional (PTAR1.AA.MI)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044261', '00000000-0000-4000-b000-000000033017', 'Partes: Labor de Mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044262', '00000000-0000-4000-b000-000000033017', 'Motores: Cambio de los rodamientos(Cambio de empaques, retenedores, O-rings)', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044263', '00000000-0000-4000-b000-000000033017', 'Motores: Verifique que los drenajes de condensado del motor estén limpios.', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044264', '00000000-0000-4000-b000-000000033017', 'Motores: Inspección general de los motores(Verificar parametros eléctricos y temperatura)', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044265', '00000000-0000-4000-b000-000000033017', 'Estructura: Verificar y ajustar todas las líneas de amarre a la tensión adecuada', 4, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044266', '00000000-0000-4000-b000-000000033017', 'Estructura: Inspeccionar visualmente el mixer en busca de basura o residuos acumulados', 5, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044267', '00000000-0000-4000-b000-000000033017', 'Estructura: Inspeccionar Codo direccional (Reapriete de pernos y cambio de ser necesario)', 6, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044268', '00000000-0000-4000-b000-000000033017', 'Estructura: Inspeccionar Placa de sellado (arandela de retención de grasa) o cambiar si es necesario', 7, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044269', '00000000-0000-4000-b000-000000033017', 'Estructura: Inspeccionar Retenedor (Sellador de grasa) o cambiar si es necesario', 8, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044270', '00000000-0000-4000-b000-000000033017', 'Estructura: Inspeccionar Inserto antirreflejos o cambiar si es necesario', 9, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044271', '00000000-0000-4000-b000-000000033017', 'Estructura: Inspeccionar Rotating Slinger (Deflector de fluidos) o cambiar si es necesario', 10, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044272', '00000000-0000-4000-b000-000000033017', 'Estructura: Inspeccionar Juntas de la base del motor o cambiar si es necesario', 11, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044273', '00000000-0000-4000-b000-000000033017', 'Estructura: Inspeccionar la Hélice o cambiar si es necesario', 12, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044274', '00000000-0000-4000-b000-000000033017', 'Sistema eléctrico: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas (Medir tensión, corriente y medir aislamiento)', 13, 1)
ON CONFLICT (id) DO NOTHING;
-- Plan: PTAR1.AA.MI15 (PTAR1.AA.MI15)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033018', 'PTAR1.AA.MI15 (PTAR1.AA.MI15)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044275', '00000000-0000-4000-b000-000000033018', 'Partes: Labor de Mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044276', '00000000-0000-4000-b000-000000033018', 'Motores: Cambio de los rodamientos(Cambio de empaques, retenedores, O-rings)', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044277', '00000000-0000-4000-b000-000000033018', 'Motores: Verifique que los drenajes de condensado del motor estén limpios.', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044278', '00000000-0000-4000-b000-000000033018', 'Motores: Inspección general de los motores(Verificar parametros eléctricos y temperatura)', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044279', '00000000-0000-4000-b000-000000033018', 'Estructura: Verificar y ajustar todas las líneas de amarre a la tensión adecuada', 4, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044280', '00000000-0000-4000-b000-000000033018', 'Estructura: Inspeccionar visualmente el mixer en busca de basura o residuos acumulados', 5, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044281', '00000000-0000-4000-b000-000000033018', 'Estructura: Inspeccionar Codo direccional (Reapriete de pernos y cambio de ser necesario)', 6, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044282', '00000000-0000-4000-b000-000000033018', 'Estructura: Inspeccionar Placa de sellado (arandela de retención de grasa) o cambiar si es necesario', 7, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044283', '00000000-0000-4000-b000-000000033018', 'Estructura: Inspeccionar Retenedor (Sellador de grasa) o cambiar si es necesario', 8, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044284', '00000000-0000-4000-b000-000000033018', 'Estructura: Inspeccionar Inserto antirreflejos o cambiar si es necesario', 9, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044285', '00000000-0000-4000-b000-000000033018', 'Estructura: Inspeccionar Rotating Slinger (Deflector de fluidos) o cambiar si es necesario', 10, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044286', '00000000-0000-4000-b000-000000033018', 'Estructura: Inspeccionar Juntas de la base del motor o cambiar si es necesario', 11, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044287', '00000000-0000-4000-b000-000000033018', 'Estructura: Inspeccionar la Hélice o cambiar si es necesario', 12, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044288', '00000000-0000-4000-b000-000000033018', 'Sistema eléctrico: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas (Medir tensión, corriente y medir aislamiento)', 13, 1)
ON CONFLICT (id) DO NOTHING;
-- Plan: PTAR1.AA.MI20 (PTAR1.AA.MI20)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033019', 'PTAR1.AA.MI20 (PTAR1.AA.MI20)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044289', '00000000-0000-4000-b000-000000033019', 'Partes: Labor de Mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044290', '00000000-0000-4000-b000-000000033019', 'Motores: Cambio de los rodamientos(Cambio de empaques, retenedores, O-rings)', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044291', '00000000-0000-4000-b000-000000033019', 'Motores: Verifique que los drenajes de condensado del motor estén limpios.', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044292', '00000000-0000-4000-b000-000000033019', 'Motores: Inspección general de los motores (Verificar parametros eléctricos y temperatura)', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044293', '00000000-0000-4000-b000-000000033019', 'Estructura: Inspeccionar visualmente el mixer en busca de basura o residuos acumulados', 4, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044294', '00000000-0000-4000-b000-000000033019', 'Estructura: Verificar y ajustar todas las líneas de amarre a la tensión adecuada', 5, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044295', '00000000-0000-4000-b000-000000033019', 'Estructura: Inspeccionar Codo direccional (Reapriete de pernos y cambio de ser necesario)', 6, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044296', '00000000-0000-4000-b000-000000033019', 'Estructura: Inspeccionar Placa de sellado (arandela de retención de grasa) o cambiar si es necesario', 7, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044297', '00000000-0000-4000-b000-000000033019', 'Estructura: Inspeccionar Retenedor (Sellador de grasa) o cambiar si es necesario', 8, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044298', '00000000-0000-4000-b000-000000033019', 'Estructura: Inspeccionar Inserto antirreflejos o cambiar si es necesario', 9, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044299', '00000000-0000-4000-b000-000000033019', 'Estructura: Inspeccionar Rotating Slinger (Deflector de fluidos) o cambiar si es necesario', 10, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044300', '00000000-0000-4000-b000-000000033019', 'Estructura: Inspeccionar Juntas de la base del motor o cambiar si es necesario', 11, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044301', '00000000-0000-4000-b000-000000033019', 'Estructura: Inspeccionar la Hélice o cambiar si es necesario', 12, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044302', '00000000-0000-4000-b000-000000033019', 'Sistema electrico: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas (Medir tensión, corriente y medir aislamiento)', 13, 1)
ON CONFLICT (id) DO NOTHING;
-- Plan: Clarificador Tratamiento 1 (PTAR1.DOC.CLR)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033020', 'Clarificador Tratamiento 1 (PTAR1.DOC.CLR)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044303', '00000000-0000-4000-b000-000000033020', 'Partes: Labor de Mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044304', '00000000-0000-4000-b000-000000033020', 'Ensamble del Sistema de engranajes: Reengrasar rodamientos y piñones motrices (Lubricación y si es necesario cambio de rodamientos, piñones, empaques, retenedores, O-rings)', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044305', '00000000-0000-4000-b000-000000033020', 'Motor Reductor: Inspección general del reductor (Verificar temperatura)', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044306', '00000000-0000-4000-b000-000000033020', 'Motor Reductor: Inspección general del motor (Verificar temperatura y parametros elélctricos)', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044307', '00000000-0000-4000-b000-000000033020', 'Motor Reductor: Lubricación de las chumaceras (si es necesario cambio de rodamientos)', 4, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044308', '00000000-0000-4000-b000-000000033020', 'Motor Reductor: Inspeccion de llantas', 5, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044309', '00000000-0000-4000-b000-000000033020', 'Estructura: Limpiar óxido en la estructura mecánica', 6, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044310', '00000000-0000-4000-b000-000000033020', 'Estructura: Limpiar y Repintar', 7, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044311', '00000000-0000-4000-b000-000000033020', 'Estructura: Comprobar la integridad de todas las fijaciones', 8, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044312', '00000000-0000-4000-b000-000000033020', 'Sistema Elélectrico: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas (Medir tensión, corriente y medir aislamiento)', 9, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044313', '00000000-0000-4000-b000-000000033020', 'Ensamble del Sistema de engranajes: Drenar, descargar y reemplazar aceite del engranje planetario', 10, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044314', '00000000-0000-4000-b000-000000033020', 'Motor Reductor: Drenar, descargar y reemplazar aceite del reductor', 11, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044315', '00000000-0000-4000-b000-000000033020', 'Motor Reductor: Mantenimiento general de los rodamientos del motor y reductor (Verificar temperatura, Lubricación y si es necesario cambio de rodamientos, empaques, retenedores, O-rings)', 12, 12)
ON CONFLICT (id) DO NOTHING;
-- Plan: PTAR1.RL.MIL3 (PTAR1.RL.MIL3)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033021', 'PTAR1.RL.MIL3 (PTAR1.RL.MIL3)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044316', '00000000-0000-4000-b000-000000033021', 'Partes: Labor de Mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044317', '00000000-0000-4000-b000-000000033021', 'Motor: Inspecciones generales de los motores (Verificar parametros eléctricos y temperatura)', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044318', '00000000-0000-4000-b000-000000033021', 'Reductor: Comprobar nivel de aceite y verificar que no hay agua en el interior', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044319', '00000000-0000-4000-b000-000000033021', 'Reductor: Limpiar el reductor', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044320', '00000000-0000-4000-b000-000000033021', 'Reductor: Drenar y sustituir el aceite', 4, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044321', '00000000-0000-4000-b000-000000033021', 'Panel de control: Inspección visual y limpieza a los ventiladores de refrigeración y a los componentes eléctricos', 5, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044322', '00000000-0000-4000-b000-000000033021', 'Estructura: Comprobar la integridad de todos los pernos y vigas de soporte', 6, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044323', '00000000-0000-4000-b000-000000033021', 'Motor: Mantenimiento de los rodamientos (Lubricación y si es necesario cambio de rodamientos, empaques, retenedores, O-rings)', 7, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044324', '00000000-0000-4000-b000-000000033021', 'Reductor: Mantenimiento del Reductor (Verificar temperatura, Lubricación y si es necesario cambio de rodamientos, empaques, retenedores, O-rings)', 8, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044325', '00000000-0000-4000-b000-000000033021', 'Panel de control: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas (Medir tensión, corriente y medir aislamiento)', 9, 12)
ON CONFLICT (id) DO NOTHING;
-- Plan: Bombas sumergible para retorno de lodo (PTAR1.RL.RASP)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033022', 'Bombas sumergible para retorno de lodo (PTAR1.RL.RASP)', 'Plan de mantenimiento preventivo migrado', 'calendar', 1, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044326', '00000000-0000-4000-b000-000000033022', 'Partes: Labor de Mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044327', '00000000-0000-4000-b000-000000033022', 'Bomba: Limpiar la bomba', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044328', '00000000-0000-4000-b000-000000033022', 'Bomba: Inspeccionar correcto funcionamiento del Impulsor', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044329', '00000000-0000-4000-b000-000000033022', 'Bomba: Mantenimiento interno de la bomba (Cambio de los rodamientos, de empaques, retenedores y O-rings)', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044330', '00000000-0000-4000-b000-000000033022', 'Bomba: Cambio de Aceite', 4, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044331', '00000000-0000-4000-b000-000000033022', 'Sistema  Eléctrico: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas (Medir tensión, corriente y medir aislamiento)', 5, 1)
ON CONFLICT (id) DO NOTHING;
-- Plan: Bombas sumergible para residuo de lodo (PTAR1.RL.WASP)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033023', 'Bombas sumergible para residuo de lodo (PTAR1.RL.WASP)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044332', '00000000-0000-4000-b000-000000033023', 'Partes: Labor de Mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044333', '00000000-0000-4000-b000-000000033023', 'Bomba: Limpiar la bomba', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044334', '00000000-0000-4000-b000-000000033023', 'Bomba: Inspeccionar correcto funcionamiento del Impulsor', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044335', '00000000-0000-4000-b000-000000033023', 'Bomba: Mantenimiento interno de la bomba (Cambio de los rodamientos, de empaques, retenedores y O-rings)', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044336', '00000000-0000-4000-b000-000000033023', 'Bomba: Cambio de Aceite', 4, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044337', '00000000-0000-4000-b000-000000033023', 'Panel de control: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas en el hardware(Medir tensión, corriente y medir aislamiento)', 5, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044338', '00000000-0000-4000-b000-000000033023', 'Panel de control: Inspección visual y limpieza a los ventiladores de refrigeración y a los componentes eléctricos', 6, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044339', '00000000-0000-4000-b000-000000033023', 'Sensores: Revisar datos y parámetros de Sensor de fluidos', 7, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044340', '00000000-0000-4000-b000-000000033023', 'Panel de control: Comprobar el estado y la seguridad del cableado en los variadores de frecuencia(Medir tensión, corriente y medir aislamiento)', 8, 12)
ON CONFLICT (id) DO NOTHING;
-- Plan: PTAR2.AA.AE50 (PTAR2.AA.AE50)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033024', 'PTAR2.AA.AE50 (PTAR2.AA.AE50)', 'Plan de mantenimiento preventivo migrado', 'calendar', 15, 'days', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044341', '00000000-0000-4000-b000-000000033024', 'Estructura: Verificar y ajustar todas las líneas de amarre a la tensión adecuada', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044342', '00000000-0000-4000-b000-000000033024', 'Partes: Labor de Mantenimiento', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044343', '00000000-0000-4000-b000-000000033024', 'Motor: Cambio de los rodamientos (Cambio de  empaques, retenedores, O-rings)', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044344', '00000000-0000-4000-b000-000000033024', 'Motor: Verifique que los drenajes de condensado del motor estén limpios.', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044345', '00000000-0000-4000-b000-000000033024', 'Motor: Inspección general de los motores (Verificar temperatura y parametros elélctricos)', 4, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044346', '00000000-0000-4000-b000-000000033024', 'Estructura: Inspeccionar visualmente el aireador en busca de basura o residuos acumulados', 5, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044347', '00000000-0000-4000-b000-000000033024', 'Estructura: Comprobar la integridad del sistema de fijaccion en el aireador', 6, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044348', '00000000-0000-4000-b000-000000033024', 'Estructura: Inspección de Sello de junta laberínto o cambiar en caso de ser necesario', 7, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044349', '00000000-0000-4000-b000-000000033024', 'Estructura: Inspección Inserto antirreflejos o cambiar en caso de ser necesario', 8, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044350', '00000000-0000-4000-b000-000000033024', 'Estructura: Inspección Arandela de empuje o cambiar en caso de ser necesario', 9, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044351', '00000000-0000-4000-b000-000000033024', 'Estructura: Inspección Deflector de fluidos o cambiar en caso de ser necesario', 10, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044352', '00000000-0000-4000-b000-000000033024', 'Estructura: Inspección  de la Hélice o cambiar en caso de ser necesario', 11, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044353', '00000000-0000-4000-b000-000000033024', 'Sistema electrico: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas (Medir tensión, corriente y medir aislamiento)', 12, 12)
ON CONFLICT (id) DO NOTHING;
-- Plan: Combinador de quimicos (PTAR2.AA.CMQ)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033025', 'Combinador de quimicos (PTAR2.AA.CMQ)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044354', '00000000-0000-4000-b000-000000033025', 'Partes: Labor de Mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044355', '00000000-0000-4000-b000-000000033025', 'Motor: Inspecciones generales del motor (Verificar parametros eléctricos y temperatura)', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044356', '00000000-0000-4000-b000-000000033025', 'Reductor: Comprobar nivel de aceite y verificar que no hay agua en el interior', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044357', '00000000-0000-4000-b000-000000033025', 'Reductor: Limpiar el reductor', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044358', '00000000-0000-4000-b000-000000033025', 'Reductor: Drenar y sustituir el aceite', 4, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044359', '00000000-0000-4000-b000-000000033025', 'Sensores: Revisar datos y parámetros de Sensor de temperatura y oxigeno', 5, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044360', '00000000-0000-4000-b000-000000033025', 'Sensores: Cambiar la cápsula del sensor', 6, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044361', '00000000-0000-4000-b000-000000033025', 'Panel de control: Inspección visual y limpieza a los componentes eléctricos', 7, 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044362', '00000000-0000-4000-b000-000000033025', 'Sensores: Limpiar el sensor', 8, 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044363', '00000000-0000-4000-b000-000000033025', 'Sensores: Calibrar el sensor', 9, 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044364', '00000000-0000-4000-b000-000000033025', 'Motor: Mantenimiento de los rodamientos(Verificar temperatura, Lubricación y si es necesario cambio de rodamientos, empaques, retenedores, O-rings)', 10, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044365', '00000000-0000-4000-b000-000000033025', 'Reductor: Mantenimiento del Reductor (Verificar temperatura, Lubricación y si es necesario cambio de rodamientos, empaques, retenedores, O-rings)', 11, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044366', '00000000-0000-4000-b000-000000033025', 'Panel de control: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas en el hardware(Medir tensión, corriente y medir aislamiento)', 12, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044367', '00000000-0000-4000-b000-000000033025', 'Estructura: Comprobar la integridad de todos los pernos y vigas de soporte', 13, 12)
ON CONFLICT (id) DO NOTHING;
-- Plan: PTAR2.AA.MI7 (PTAR2.AA.MI7)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033026', 'PTAR2.AA.MI7 (PTAR2.AA.MI7)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044368', '00000000-0000-4000-b000-000000033026', ': Intervalo', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044369', '00000000-0000-4000-b000-000000033026', ': Semestral', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044370', '00000000-0000-4000-b000-000000033026', ': Semestral', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044371', '00000000-0000-4000-b000-000000033026', ': Cada 2 años', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044372', '00000000-0000-4000-b000-000000033026', ': Bimensual', 4, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044373', '00000000-0000-4000-b000-000000033026', ': Mensual', 5, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044374', '00000000-0000-4000-b000-000000033026', ': Cada 2 años', 6, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044375', '00000000-0000-4000-b000-000000033026', ': Cada 2 años', 7, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044376', '00000000-0000-4000-b000-000000033026', ': Cada 2 años', 8, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044377', '00000000-0000-4000-b000-000000033026', ': Cada 2 años', 9, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044378', '00000000-0000-4000-b000-000000033026', ': Cada 2 años', 10, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044379', '00000000-0000-4000-b000-000000033026', ': Cada 2 años', 11, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044380', '00000000-0000-4000-b000-000000033026', ': Semestral', 12, 1)
ON CONFLICT (id) DO NOTHING;
-- Plan: Bomba Dosificadora (PTAR2.DOC.BBD)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033027', 'Bomba Dosificadora (PTAR2.DOC.BBD)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044381', '00000000-0000-4000-b000-000000033027', 'Partes: Labor de Mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044382', '00000000-0000-4000-b000-000000033027', 'Motor: Inspecciones generales de los motores (Verificar parametros eléctricos y temperatura)', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044383', '00000000-0000-4000-b000-000000033027', 'Motor: Cambio de los rodamientos, empaques, retenedores y O-rings', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044384', '00000000-0000-4000-b000-000000033027', 'Medidor de Caudal: Limpiar el medidor de Caudal', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044385', '00000000-0000-4000-b000-000000033027', 'Sistema Mezcladora: Limpiar el sistema completo', 4, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044386', '00000000-0000-4000-b000-000000033027', 'Sistema Mezcladora: Verificar el correcto funcionamiento de la válvula solenoide y del Switch diferencial de presión', 5, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044387', '00000000-0000-4000-b000-000000033027', 'Panel de control: Revisar datos y parámetros', 6, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044388', '00000000-0000-4000-b000-000000033027', 'Panel de control: Inspección visual y limpieza a los componentes eléctricos', 7, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044389', '00000000-0000-4000-b000-000000033027', 'Motor: Revisar la integridad de las Fajas y poleas con el sistema mezcladora (Medir su tensión, Cambiar si es nesecario)', 8, 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044390', '00000000-0000-4000-b000-000000033027', 'Bomba: Calibrar el controlador de presión', 9, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044391', '00000000-0000-4000-b000-000000033027', 'Bomba: Reemplazar la membrana', 10, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044392', '00000000-0000-4000-b000-000000033027', 'Bomba: Comprobar el funcionamiento de las Válvulas de cartucho, válvula de bola y resorte de la válvula check de inyección, y si es necesario realizar cambio', 11, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044393', '00000000-0000-4000-b000-000000033027', 'Sistema Mezcladora: Verificar la integridad y estado del rodamiento y sellos', 12, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044394', '00000000-0000-4000-b000-000000033027', 'Panel de control: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas (Medir tensión, corriente y medir aislamiento)', 13, 12)
ON CONFLICT (id) DO NOTHING;
-- Plan: Clarificador Tratamiento (PTAR2.DOC.CLR)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033028', 'Clarificador Tratamiento (PTAR2.DOC.CLR)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044395', '00000000-0000-4000-b000-000000033028', 'Partes: Labor de Mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044396', '00000000-0000-4000-b000-000000033028', 'Ensamble del Sistema de engranajes: Drenar condensado del engranje recto', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044397', '00000000-0000-4000-b000-000000033028', 'Ensamble del Sistema de engranajes: Drenar condensado del engranje Helicoidal', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044398', '00000000-0000-4000-b000-000000033028', 'Ensamble del Sistema de engranajes: Revisar Tension, Alineamiento  y Reengrasar cadena de trasmisión (Lubricación y si es necesario cambio de cadena de transmisión)', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044399', '00000000-0000-4000-b000-000000033028', 'Ensamble del Sistema de engranajes: Reengrasar rodamientos y piñones motrices (Lubricación y si es necesario cambio de rodamientos, piñones, empaques, retenedores, O-rings)', 4, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044400', '00000000-0000-4000-b000-000000033028', 'Ensamble del Sistema de engranajes: Drenar, descargar y reemplazar aceite del engranje recto', 5, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044401', '00000000-0000-4000-b000-000000033028', 'Ensamble del Sistema de engranajes: Drenar, descargar y reemplazar aceite del engranje Helicoidal', 6, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044402', '00000000-0000-4000-b000-000000033028', 'Colector : Inspección general de la caja de engranaje (Verificar temperatura, si es necesario cambio de rodamientos, retenedores y Verificar temperatura)', 7, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044403', '00000000-0000-4000-b000-000000033028', 'Colector : Inspección general del motor (Verificar temperatura y parametros elélctricos)', 8, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044404', '00000000-0000-4000-b000-000000033028', 'Colector: Limpiar óxido en todo  el colector', 9, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044405', '00000000-0000-4000-b000-000000033028', 'Colector : Mantenimiento general de los rodamientos del motor y caja de engranaje(Verificar temperatura, Lubricación y si es necesario cambio de rodamientos, empaques, retenedores, O-rings)', 10, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044406', '00000000-0000-4000-b000-000000033028', 'Colector : Drenar, descargar y reemplazar aceite de la caja de engranaje', 11, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044407', '00000000-0000-4000-b000-000000033028', 'Estructura: Limpiar y Repintar', 12, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044408', '00000000-0000-4000-b000-000000033028', 'Estructura: Comprobar la integridad de todas las fijaciones', 13, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044409', '00000000-0000-4000-b000-000000033028', 'Estructura: Comprobar la integridad y seguridad del brazo guia', 14, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044410', '00000000-0000-4000-b000-000000033028', 'Indicador de Torque: Realizar prueba manual de las alarmas', 15, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044411', '00000000-0000-4000-b000-000000033028', 'Indicador de Torque: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas en el hardware(Medir tensión, corriente y medir aislamiento)', 16, 1)
ON CONFLICT (id) DO NOTHING;
-- Plan: Espesador de lodo (PTAR2.DOC.ESL)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033029', 'Espesador de lodo (PTAR2.DOC.ESL)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044412', '00000000-0000-4000-b000-000000033029', 'Partes: Labor de Mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044413', '00000000-0000-4000-b000-000000033029', 'Ensamble del Sistema de engranajes: Drenar condensado del engranje Helicoidal', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044414', '00000000-0000-4000-b000-000000033029', 'Ensamble del Sistema de engranajes: Revisar Tension, Alineamiento  y Reengrasar cadena de trasmisión (Lubricación y si es necesario cambio de cadena de transmisión)', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044415', '00000000-0000-4000-b000-000000033029', 'Ensamble del Sistema de engranajes: Reengrasar rodamientos y piñones motrices (Lubricación y si es necesario cambio de rodamientos, piñones, empaques, retenedores, O-rings)', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044416', '00000000-0000-4000-b000-000000033029', 'Ensamble del Sistema de engranajes: Drenar, descargar y reemplazar aceite del engranje Helicoidal', 4, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044417', '00000000-0000-4000-b000-000000033029', 'Colector : Inspección general de las cajas de engranajes(Verificar temperatura, si es necesario cambio de rodamientos, retenedores y lubricar)', 5, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044418', '00000000-0000-4000-b000-000000033029', 'Colector : Inspección general de los motores (Verificar temperatura y parametros elélctricos)', 6, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044419', '00000000-0000-4000-b000-000000033029', 'Colector : Drenar, descargar y reemplazar aceite de las cajas de engranajes', 7, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044420', '00000000-0000-4000-b000-000000033029', 'Colector : Mantenimiento general de los rodamientos del motor y cajas de engranajes (Verificar temperatura, Lubricación y si es necesario cambio de rodamientos, empaques, retenedores, O-rings)', 8, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044421', '00000000-0000-4000-b000-000000033029', 'Colector : Limpiar óxido en todo  el colector', 9, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044422', '00000000-0000-4000-b000-000000033029', 'Estructura: Limpiar y Repintar', 10, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044423', '00000000-0000-4000-b000-000000033029', 'Estructura: Comprobar la integridad de todas las fijaciones', 11, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044424', '00000000-0000-4000-b000-000000033029', 'Estructura: Comprobar la integridad y seguridad del brazo guia', 12, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044425', '00000000-0000-4000-b000-000000033029', 'Indicador de Torque: Realizar prueba manual de las alarmas', 13, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044426', '00000000-0000-4000-b000-000000033029', 'Indicador de Torque: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas en el hardware(Medir tensión, corriente y medir aislamiento)', 14, 1)
ON CONFLICT (id) DO NOTHING;
-- Plan: Mixer tanque de lodo (PTAR2.DOC.MTL)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033030', 'Mixer tanque de lodo (PTAR2.DOC.MTL)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044427', '00000000-0000-4000-b000-000000033030', 'Partes: Labor de Mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044428', '00000000-0000-4000-b000-000000033030', 'Motor: Inspecciones generales de los motores (Verificar parametros eléctricos y temperatura)', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044429', '00000000-0000-4000-b000-000000033030', 'Reductor: Comprobar nivel de aceite y verificar que no hay agua en el interior', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044430', '00000000-0000-4000-b000-000000033030', 'Reductor: Limpiar el reductor', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044431', '00000000-0000-4000-b000-000000033030', 'Reductor: Drenar y sustituir el aceite', 4, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044432', '00000000-0000-4000-b000-000000033030', 'Estructura: Comprobar la integridad de todos los pernos', 5, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044433', '00000000-0000-4000-b000-000000033030', 'Aspas: Inspección visual para correcto funcionamiento', 6, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044434', '00000000-0000-4000-b000-000000033030', 'Motor: Mantenimiento de los rodamientos(Lubricación y si es necesario cambio de rodamientos, empaques, retenedores, O-rings)', 7, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044435', '00000000-0000-4000-b000-000000033030', 'Reductor: Mantenimiento del Reductor (Verificar temperatura, Lubricación y si es necesario cambio de rodamientos, empaques, retenedores, O-rings)', 8, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044436', '00000000-0000-4000-b000-000000033030', 'Panel de control: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas (Medir tensión, corriente y medir aislamiento)', 9, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044437', '00000000-0000-4000-b000-000000033030', 'Aspas: Comprobar la integridad de todos los pernos', 10, 12)
ON CONFLICT (id) DO NOTHING;
-- Plan: PTAR2.RL.BDT (PTAR2.RL.BDT)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033031', 'PTAR2.RL.BDT (PTAR2.RL.BDT)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044438', '00000000-0000-4000-b000-000000033031', 'Partes: Labor de Mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044439', '00000000-0000-4000-b000-000000033031', 'Motor(Si aplica): Inspecciones generales de los motores (Verificar parametros eléctricos y temperatura)', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044440', '00000000-0000-4000-b000-000000033031', 'Sistema de Válvulas y Tuberias: Inspeccion de condición de tubo de nivel y limpiar, si es necesario reemplazar', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044441', '00000000-0000-4000-b000-000000033031', 'Panel de control: Revisar datos y parámetros', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044442', '00000000-0000-4000-b000-000000033031', 'Panel de control: Inspección visual y limpieza a los componentes eléctricos', 4, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044443', '00000000-0000-4000-b000-000000033031', 'Bomba: Comprobar el nivel de aceite.', 5, 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044444', '00000000-0000-4000-b000-000000033031', 'Bomba: Comprobarque los tubos de dosificación estén bien sujetos a la unidad de transporte.', 6, 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044445', '00000000-0000-4000-b000-000000033031', 'Bomba: Comprobar que los tornillos del cabezal dosificador estén bien ajustados.', 7, 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044446', '00000000-0000-4000-b000-000000033031', 'Bomba: Comprobar el estado de la membrana de dosificación y si es necesario cambiarla', 8, 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044447', '00000000-0000-4000-b000-000000033031', 'Bomba: Comprobar que el bombeo se realiza correctamente: Dejar que la bomba succione brevemente.', 9, 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044448', '00000000-0000-4000-b000-000000033031', 'Bomba: Comprobar el funcionamiento y comprobar que esten bien apretadas la válvula de purga de aire y la válvula de rebose.', 10, 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044449', '00000000-0000-4000-b000-000000033031', 'Motor(Si aplica): Mantenimiento de los rodamientos (Lubricación y si es necesario cambio de rodamientos, empaques, retenedores, O-rings)', 11, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044450', '00000000-0000-4000-b000-000000033031', 'Sistema de Válvulas y Tuberias: Comprobar el estado y la seguridad de las conexiones de las tuberías.', 12, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044451', '00000000-0000-4000-b000-000000033031', 'Sistema de Válvulas y Tuberias: Inspeccionar el estado y la seguridad de la válvula de alivio de presión', 13, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044452', '00000000-0000-4000-b000-000000033031', 'Panel de control: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas (Medir tensión, corriente y medir aislamiento)', 14, 12)
ON CONFLICT (id) DO NOTHING;
-- Plan: PTAR2.RL.CTR (PTAR2.RL.CTR)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033032', 'PTAR2.RL.CTR (PTAR2.RL.CTR)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044453', '00000000-0000-4000-b000-000000033032', 'Partes: Labor de mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044454', '00000000-0000-4000-b000-000000033032', 'Filtros de aire y Mantos de los refirgerantes: Verificar el nivel de aceite del refrigerante', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044455', '00000000-0000-4000-b000-000000033032', 'Filtros de aire y Mantos de los refirgerantes: Tablero eléctrico: revisar el manto filtrante', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044456', '00000000-0000-4000-b000-000000033032', 'Filtros de aire y Mantos de los refirgerantes: Limpiar el enfriador', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044457', '00000000-0000-4000-b000-000000033032', 'Filtros de aire y Mantos de los refirgerantes: Revisar el manto filtrante del aire refrigerante', 4, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044458', '00000000-0000-4000-b000-000000033032', 'Filtros de aire y Mantos de los refirgerantes: Cambiar el manto filtrante de aire refrigerante', 5, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044459', '00000000-0000-4000-b000-000000033032', 'Filtros de aire y Mantos de los refirgerantes: Tablero eléctrico: cambiar el manto filtrante', 6, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044460', '00000000-0000-4000-b000-000000033032', 'Aceite: Cambio del Cartucho Separador de Aceite', 7, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044461', '00000000-0000-4000-b000-000000033032', 'Aceite: Cambiar el aceite refrigerante', 8, 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044462', '00000000-0000-4000-b000-000000033032', 'Filtros de aire y Mantos de los refirgerantes: Cambiar el elemento filtrante de aire', 9, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044463', '00000000-0000-4000-b000-000000033032', 'Motores: Mantenimiento de los rodamientos de los motores(Verificar temperatura, Lubricación y si es necesario cambio de rodamientos, empaques, retenedores, O-rings)', 10, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044464', '00000000-0000-4000-b000-000000033032', 'Motores: Revisar el acople(En del Tornillo, el de Ventilación no aplica)', 11, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044465', '00000000-0000-4000-b000-000000033032', 'Motores: Inspecciones generales de los motores (Verificar parametros eléctricos y temperatura)', 12, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044466', '00000000-0000-4000-b000-000000033032', 'Aceite: Cambiar el filtro de aceite', 13, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044467', '00000000-0000-4000-b000-000000033032', 'Valvulas: Revisar funcionamiento de las válvula de alivio de presión, Válvula de entrada, termostática, de control de ventilación, de ventilación, y  neumática (Asegurarse que todas las puertas de acc', 14, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044468', '00000000-0000-4000-b000-000000033032', 'Enfriador: Limpiar y Verificar que en las mallas del enfriador no presente fugas', 15, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044469', '00000000-0000-4000-b000-000000033032', 'Sistema  Eléctrico: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas en el hardware(Medir tensión, corriente y medir aislamiento)', 16, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044470', '00000000-0000-4000-b000-000000033032', 'Sistema de tuberias: Comprobar el estado y la seguridad de las tuberías, mangueras y accesorios.', 17, 12)
ON CONFLICT (id) DO NOTHING;
-- Plan: Filtro Prensa (PTAR2.RL.FP)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033033', 'Filtro Prensa (PTAR2.RL.FP)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044471', '00000000-0000-4000-b000-000000033033', 'Partes: Labor de Mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044472', '00000000-0000-4000-b000-000000033033', 'Filtro de Placas y Membrana: Limpiar y lavar superficial de las membranas filtrantes (Reemplazar las membranas filtrantes y las juntas de los filtro si es necesario)', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044473', '00000000-0000-4000-b000-000000033033', 'Unidad de potencia hidráulica Mark V: Desechar el aceite de escape del vaso del filtro.', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044474', '00000000-0000-4000-b000-000000033033', 'Unidad de potencia hidráulica Mark V: Inspeccionar integridad y funcionamiento del filtro de aire si hay roturas o agujeros. Reparar/sustituir si es necesario', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044475', '00000000-0000-4000-b000-000000033033', 'Unidad de potencia hidráulica Mark V: Inspeccionar integridad y funcionamiento del filtro de aceite hidráulico si hay roturas o agujeros. Reparar/sustituir si es necesario', 4, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044476', '00000000-0000-4000-b000-000000033033', 'Unidad de potencia hidráulica Mark V: Inspeccionar integridad y funcionamiento del Manifold de ensamble Aire/Hidráulico', 5, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044477', '00000000-0000-4000-b000-000000033033', 'Unidad de potencia hidráulica Mark V: Inspeccionar integridad y funcionamiento de la bomba hidráulica y regulador', 6, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044478', '00000000-0000-4000-b000-000000033033', 'Unidad de potencia hidráulica Mark V: Comprobar niveles de aceite', 7, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044479', '00000000-0000-4000-b000-000000033033', 'Unidad de potencia hidráulica Mark V: Comprobar que la presión de apriete es correcta', 8, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044480', '00000000-0000-4000-b000-000000033033', 'Desplazador de platos semiautomático: Limpiar las varillas guía del cilindro de empuje', 9, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044481', '00000000-0000-4000-b000-000000033033', 'Desplazador de platos semiautomático: Operar el cilindro de elevación sin placas. Las placas de empuje deben subir y bajar suavemente.', 10, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044482', '00000000-0000-4000-b000-000000033033', 'Desplazador de platos semiautomático: Operar el cilindro de empuje sin placas. Las placas de empuje deben subir y bajar suavemente.', 11, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044483', '00000000-0000-4000-b000-000000033033', 'Desplazador de platos semiautomático: Limpiar las barras guía del cilindro elevador', 12, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044484', '00000000-0000-4000-b000-000000033033', 'Bombas diafragma: Inspecionar integridad y funcionamiento de la bombas de diafragma', 13, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044485', '00000000-0000-4000-b000-000000033033', 'APCS: Comprobar que los parámetros y configuraciones sean las correctos', 14, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044486', '00000000-0000-4000-b000-000000033033', 'APCS: Inspeccionar unidad de mantenimiento y cambiar envases, si es necesario.', 15, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044487', '00000000-0000-4000-b000-000000033033', 'Unidad de potencia hidráulica Mark V: Comprobar que la válvula de alivio este ajustada correctamente', 16, 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044488', '00000000-0000-4000-b000-000000033033', 'Filtro de Placas y Membrana: Limpieza y lavado exhaustivo en cada uno de las membranas filtrantes (Reemplazar las membranas filtrantes y las juntas de los filtro si es necesario)', 17, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044489', '00000000-0000-4000-b000-000000033033', 'Unidad de potencia hidráulica Mark V: Reemplazar Aceite hidráulico y Filtros', 18, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044490', '00000000-0000-4000-b000-000000033033', 'Unidad de potencia hidráulica Mark V: Comprobar integridad y funcionamiento de la válvula check, válvula de alivio y válvula de liberación/compresión', 19, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044491', '00000000-0000-4000-b000-000000033033', 'Unidad de potencia hidráulica Mark V: Comprobar el estado y la seguridad de las conexiones de las mangueras y tubos.', 20, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044492', '00000000-0000-4000-b000-000000033033', 'Sistema de Válvulas y Tuberias: Comprobar el estado y la seguridad de las conexiones de las tuberías.', 21, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044493', '00000000-0000-4000-b000-000000033033', 'Sistema de Válvulas y Tuberias: Comprobar el estado y la seguridad de las conexiones de las válvulas', 22, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044494', '00000000-0000-4000-b000-000000033033', 'Bombas diafragma: Mantenimiento de la bomba (Cambio de empaques, retenedores, O-rings, Copas "U", Kit de Muffler)', 23, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044495', '00000000-0000-4000-b000-000000033033', 'APCS: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas', 24, 12)
ON CONFLICT (id) DO NOTHING;
-- Plan: Bomba centrifuga retorno de lodo RAS  (PTAR2.RL.RASP)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033034', 'Bomba centrifuga retorno de lodo RAS  (PTAR2.RL.RASP)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044496', '00000000-0000-4000-b000-000000033034', 'Partes: Labor de mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044497', '00000000-0000-4000-b000-000000033034', 'Bomba: Cambio de los rodamientos(Lubricación y cambio de empaques, retenedores, O-rings)', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044498', '00000000-0000-4000-b000-000000033034', 'Bomba: Revisar las Poleas y Fajas, cambiar si es nesecario', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044499', '00000000-0000-4000-b000-000000033034', 'Motor: Revisar datos de contra entrega de lodo', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044500', '00000000-0000-4000-b000-000000033034', 'Motor: Inspecciones generales de los motores(Verificar temperatura, parametros eléctricos)', 4, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044501', '00000000-0000-4000-b000-000000033034', 'Motor: Limpiar el motor y mantener las aberturas de ventilación despejadas', 5, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044502', '00000000-0000-4000-b000-000000033034', 'Motor: Cambio de los rodamientos(Lubricación y cambio empaques, retenedores, O-rings)', 6, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044503', '00000000-0000-4000-b000-000000033034', 'Panel de control: Inspección visual y limpieza a los ventiladores de refrigeración y a los componentes eléctricos', 7, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044504', '00000000-0000-4000-b000-000000033034', 'Sistema de Válvulas y Tuberias: Comprobar el estado y la seguridad de las conexiones de las tuberías.', 8, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044505', '00000000-0000-4000-b000-000000033034', 'Sistema de Válvulas y Tuberias: Inspeccionar el estado y la seguridad de la válvula de alivio de presión y válvula check', 9, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044506', '00000000-0000-4000-b000-000000033034', 'Bomba: Verificar funcionamiento y limpiar impulsor de la bomba y cambiar si es necesario', 10, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044507', '00000000-0000-4000-b000-000000033034', 'Panel de control: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas en el hardware(Medir tensión, corriente y medir aislamiento)', 11, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044508', '00000000-0000-4000-b000-000000033034', 'Panel de control: Comprobar el estado y la seguridad del cableado en los variadores de frecuencia(Medir tensión, corriente y medir aislamiento)', 12, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044509', '00000000-0000-4000-b000-000000033034', 'Panel de control: Comprobar el funcionamiento de los IGBT y Capacitores en el Bus de CC (Realizar pruebas de medición, verificar temperaturas y cambiar si es necesario)', 13, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044510', '00000000-0000-4000-b000-000000033034', 'Sistema de Válvulas y Tuberias: Comprobar el estado y la seguridad de las conexiones de las válvulas', 14, 12)
ON CONFLICT (id) DO NOTHING;
-- Plan: PTAR2.RL.SCF (PTAR2.RL.SCF)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033035', 'PTAR2.RL.SCF (PTAR2.RL.SCF)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044511', '00000000-0000-4000-b000-000000033035', 'Partes: Labor de mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044512', '00000000-0000-4000-b000-000000033035', 'Purgador de condensados ECO-DRAIN 30: Comprobar el correcto funcionamiento del purgador de condensados.', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044513', '00000000-0000-4000-b000-000000033035', 'Purgador de condensados ECO-DRAIN 30: Cambiar la unidad de mantenimiento del purgador de condensados.', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044514', '00000000-0000-4000-b000-000000033035', 'Purgador de condensados ECO-DRAIN 12: Comprobar el correcto funcionamiento del purgador de condensados.', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044515', '00000000-0000-4000-b000-000000033035', 'Purgador de condensados ECO-DRAIN 12: Cambiar la unidad de mantenimiento del purgador de condensados.', 4, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044516', '00000000-0000-4000-b000-000000033035', 'Refrigerante: Limpiar el condensador del refrigerante.', 5, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044517', '00000000-0000-4000-b000-000000033035', 'Filtro F83KE: Comprobación de funcionamiento condensados en el filtro de aire comprimido', 6, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044518', '00000000-0000-4000-b000-000000033035', 'Filtro F83KE: Cambiar filtros de aire comprimido', 7, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044519', '00000000-0000-4000-b000-000000033035', 'Tanque : Comprobar el estado del tanque, si encuentra fugas soldar', 8, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044520', '00000000-0000-4000-b000-000000033035', 'Sistema  Eléctrico: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas en el hardware(Medir tensión, corriente y medir aislamiento)', 9, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044521', '00000000-0000-4000-b000-000000033035', 'Sistema de tuberias: Comprobar el estado y la seguridad de las conexiones de las tuberías, mangueras y accesorios.', 10, 12)
ON CONFLICT (id) DO NOTHING;
-- Plan: Bomba de envio de lodo  (PTAR2.RL.TSP)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033036', 'Bomba de envio de lodo  (PTAR2.RL.TSP)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044522', '00000000-0000-4000-b000-000000033036', 'Partes: Labor de mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044523', '00000000-0000-4000-b000-000000033036', 'Bomba: Inspecciones generales de las bombas(Verificar temperatura)', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044524', '00000000-0000-4000-b000-000000033036', 'Bomba: Verificar funcionamiento y limpiar impulsor de la bomba y cambiar si es necesario', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044525', '00000000-0000-4000-b000-000000033036', 'Bomba: Inspeccionar el acople, cambiar si es nesecario', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044526', '00000000-0000-4000-b000-000000033036', 'Motor: Inspecciones generales de los motores(Verificar parametros eléctricos y temperatura)', 4, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044527', '00000000-0000-4000-b000-000000033036', 'Motor: Limpiar el motor y mantener las aberturas de ventilación despejadas', 5, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044528', '00000000-0000-4000-b000-000000033036', 'Panel de control: Inspección visual y limpieza a los ventiladores de refrigeración y a los componentes eléctricos', 6, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044529', '00000000-0000-4000-b000-000000033036', 'Bomba: Mantenimiento de los rodamientos(Verificar temperatura, Lubricación y si es necesario cambio de rodamientos, empaques, retenedores, O-rings)', 7, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044530', '00000000-0000-4000-b000-000000033036', 'Motor: Mantenimiento de los rodamientos(Verificar temperatura, Lubricación y si es necesario cambio de rodamientos, empaques, retenedores, O-rings)', 8, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044531', '00000000-0000-4000-b000-000000033036', 'Sistema de Válvulas y Tuberias: Comprobar el estado y la seguridad de las conexiones de las tuberías.', 9, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044532', '00000000-0000-4000-b000-000000033036', 'Sistema de Válvulas y Tuberias: Inspeccionar el estado y la seguridad de la válvula de alivio de presión y válvula check', 10, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044533', '00000000-0000-4000-b000-000000033036', 'Sistema de Válvulas y Tuberias: Comprobar el estado y la seguridad de las conexiones de las válvulas', 11, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044534', '00000000-0000-4000-b000-000000033036', 'Panel de Control: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas en el hardware(Medir tensión, corriente y medir aislamiento)', 12, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044535', '00000000-0000-4000-b000-000000033036', 'Panel de control: Comprobar el estado y la seguridad del cableado en los variadores de frecuencia(Medir tensión, corriente y medir aislamiento)', 13, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044536', '00000000-0000-4000-b000-000000033036', 'Panel de control: Comprobar el funcionamiento de los IGBT y Capacitores en el Bus de CC (Realizar pruebas de medición, verificar temperaturas y cambiar si es necesario)', 14, 12)
ON CONFLICT (id) DO NOTHING;
-- Plan: Interruptor de potencia 46kV (SB.46kV.INT)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033037', 'Interruptor de potencia 46kV (SB.46kV.INT)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044537', '00000000-0000-4000-b000-000000033037', 'Partes: Labor de mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044538', '00000000-0000-4000-b000-000000033037', 'Polos: Verificacion de resistencia de contacto en los polos, desarmado y limpieza de carbon o demas residuos', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044539', '00000000-0000-4000-b000-000000033037', 'Mecanismo: Verificacion de tiempo de apertura y cierre, revision de mecanismo de carga de resorte', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044540', '00000000-0000-4000-b000-000000033037', 'Camara de Gas: Medicion de parametros a gas SF6: Pureza, humedad, contenido de SO2', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044541', '00000000-0000-4000-b000-000000033037', 'Camara de Gas: Reemplazo de gas SF6, limpieza de particulado.', 4, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044542', '00000000-0000-4000-b000-000000033037', 'Bushings : Medicion de parametros electricos', 5, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044543', '00000000-0000-4000-b000-000000033037', 'Control: Pruebas de disparo locales, remotas y por protecciones relé de linea y relé patron', 6, 1)
ON CONFLICT (id) DO NOTHING;
-- Plan: Transformador 46/23KV  (SB.46kV.TX)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033038', 'Transformador 46/23KV  (SB.46kV.TX)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044544', '00000000-0000-4000-b000-000000033038', 'Partes: Labor de mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044545', '00000000-0000-4000-b000-000000033038', 'Transformador: Desgasificado y extraccion de humedad en aceite', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044546', '00000000-0000-4000-b000-000000033038', 'Cambiador de Taps: Mantenimiento Mayor de 7 años según manual', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044547', '00000000-0000-4000-b000-000000033038', 'Transformador: Pruebas electricas (Aislamiento y relacion de transformacion)', 3, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044548', '00000000-0000-4000-b000-000000033038', 'Transformador: Cromatografia de gases disueltos en aceite (Incluyendo furanos)', 4, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044549', '00000000-0000-4000-b000-000000033038', 'Transformador: Prueba de rigidez dielectrica', 5, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044550', '00000000-0000-4000-b000-000000033038', 'Cambiador de Taps: Cromatografia de gases disueltos en aceite (Incluyendo furanos)', 6, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044551', '00000000-0000-4000-b000-000000033038', 'Cambiador de Taps: Prueba de rigidez dielectrica', 7, 12)
ON CONFLICT (id) DO NOTHING;
-- Plan: Bombas contra incendio de 200 HP (SCI.CBCI.BCI)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033039', 'Bombas contra incendio de 200 HP (SCI.CBCI.BCI)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044552', '00000000-0000-4000-b000-000000033039', 'Partes: Labor de Mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044553', '00000000-0000-4000-b000-000000033039', 'Sistema de motor diésel: Inspeccionar que el tanque de combustible está lleno en al menos dos tercios', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044554', '00000000-0000-4000-b000-000000033039', 'Sistema de motor diésel: Inspeccionar que el interruptor del selector del controlador está en posición automática.', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044555', '00000000-0000-4000-b000-000000033039', 'Sistema de motor diésel: Inspeccionar que las lecturas del voltaje de las baterías es dentro del rango aceptable.', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044556', '00000000-0000-4000-b000-000000033039', 'Sistema de motor diésel: Inspeccionar que las lecturas de la corriente de carga de las baterías están dentro del rango aceptable.', 4, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044557', '00000000-0000-4000-b000-000000033039', 'Sistema de motor diésel: Inspeccionar que las luces del piloto de las baterías están encendidas o las luces del piloto de falla de la batería están apagada.', 5, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044558', '00000000-0000-4000-b000-000000033039', 'Sistema de motor diésel: Revisar q todas las luces del piloto de la alarma están apagadas.', 6, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044559', '00000000-0000-4000-b000-000000033039', 'Sistema de motor diésel: Inspeccionar que el medidor de tiempo de funcionamiento del motor toma la correspondiente lectura.', 7, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044560', '00000000-0000-4000-b000-000000033039', 'Sistema de motor diésel: Inspeccionar que el nivel de aceite en el impulsor de los engranajes de ángulo recto está dentro del rango aceptable.', 8, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044561', '00000000-0000-4000-b000-000000033039', 'Sistema de motor diésel: Inspeccionar que el nivel de aceite del cárter está dentro del rango aceptable.', 9, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044562', '00000000-0000-4000-b000-000000033039', 'Sistema de motor diésel: Inspeccionar que el nivel del agua de refrigeración esta en el rango aceptable.', 10, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044563', '00000000-0000-4000-b000-000000033039', 'Sistema de motor diésel: Inspeccionar que el nivel de electrolitos de las baterías esta dentro del rango aceptable.', 11, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044564', '00000000-0000-4000-b000-000000033039', 'Sistema de motor diésel: Inspeccionar que los terminales de las baterías no presentan corrosión.', 12, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044565', '00000000-0000-4000-b000-000000033039', 'Sistema de motor diésel: Inspeccionar que el calentador de camisa de agua está funcionando.', 13, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044566', '00000000-0000-4000-b000-000000033039', 'Sistema de motor diésel: Realizar prueba para verificar el funcionamiento de los interruptores de transferencia automática y generadores de emergencia/reserva', 14, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044567', '00000000-0000-4000-b000-000000033039', 'Sistema de motor diésel: Realizar prueba de degradación al combustible diésel, si es necesario cambiarlo.', 15, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044568', '00000000-0000-4000-b000-000000033039', 'Sistema de motor diésel: Revisar la integridad de las Fajas y poleas (Medir su tensión, Cambiar si es nesecario)', 16, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044569', '00000000-0000-4000-b000-000000033039', 'Caseta/cuarto de bomba: Inspeccionar que el calor es adecuado, no menor de 4°C para el cuarto de bombas con bombas accionadas por motor diésel con calentadores de motor.', 17, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044570', '00000000-0000-4000-b000-000000033039', 'Caseta/cuarto de bomba: Inspeccionar y limpiar excesos de agua en el piso.', 18, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044571', '00000000-0000-4000-b000-000000033039', 'Caseta/cuarto de bomba: Revisar que la protección de acoplamientos sea la adecuada.', 19, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044572', '00000000-0000-4000-b000-000000033039', 'Sistema de bombas contra incendio: Inspeccionar que las válvulas de succión, de descarga y derivación de la bomba están totalmente abiertas.', 20, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044573', '00000000-0000-4000-b000-000000033039', 'Sistema de bombas contra incendio: Inspeccionar que  la lectura del manómetro de la línea de succión está dentro del rango aceptable.', 21, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044574', '00000000-0000-4000-b000-000000033039', 'Sistema de bombas contra incendio: Inspeccionar que  la lectura del manómetro de la línea del sistema está dentro del rango aceptable.', 22, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044575', '00000000-0000-4000-b000-000000033039', 'Sistema de bombas contra incendio: Inspeccionar que el reservorio de succión tiene el nivel de agua requerido', 23, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044576', '00000000-0000-4000-b000-000000033039', 'Sistema de bombas contra incendio: Reemplazar los componenetes de transmisión de energia que se usan en el impulsor de la bombas, tales como acoples de torsión, Jockey, Válvula de alivio de circulació', 24, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044577', '00000000-0000-4000-b000-000000033039', 'Sistema eléctrico/ Controlador: Inspeccionar que la luz del piloto del controlador (encendido) está iluminada.', 25, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044578', '00000000-0000-4000-b000-000000033039', 'Sistema eléctrico/ Controlador: Inspeccionar que la luz normal del piloto del interruptor de transferencia está iluminada.', 26, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044579', '00000000-0000-4000-b000-000000033039', 'Sistema eléctrico/ Controlador: Inspeccionar que el interruptor de aislamiento está cerrado — fuente de reserva (de emergencia).', 27, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044580', '00000000-0000-4000-b000-000000033039', 'Sistema eléctrico/ Controlador: Inspeccionar que la luz del piloto de la alarma de fase inversa está apagada o la luz del piloto de rotación de fase normal está apagada.', 28, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044581', '00000000-0000-4000-b000-000000033039', 'Sistema eléctrico/ Controlador: Inspeccionar que el nivel de aceite del visor de vidrio del motor vertical está dentro del rango aceptable.', 29, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044582', '00000000-0000-4000-b000-000000033039', 'Sistema eléctrico/ Controlador: Inspeccionar que se abastece de energía a la bomba de mantenimiento de presión (jockey).', 30, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044583', '00000000-0000-4000-b000-000000033039', 'Sistema de tuberias, válvulas y mangueras: Inspeccionar que las válvulas de las pruebas de flujo de agua están en la posición de cerradas', 31, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044584', '00000000-0000-4000-b000-000000033039', 'Sistema de tuberias, válvulas y mangueras: Inspeccionar que la válvula de la conexión de la manguera está cerrada y la linea hacia las válvulas de prueba no contenga agua', 32, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044585', '00000000-0000-4000-b000-000000033039', 'Sistema de tuberias, válvulas y mangueras: Revisar que las tuberías no presenten fugas.', 33, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044586', '00000000-0000-4000-b000-000000033039', 'Sistema de Vapor: Inspeccionar que  la lectura del manómetro del vapor está dentro del rango aceptable.', 34, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044587', '00000000-0000-4000-b000-000000033039', 'Sistema de motor diésel: Inspeccionar funcionamiento de los sistemas de escape, trampas de drenaje de condensado y silenciadores', 35, 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044588', '00000000-0000-4000-b000-000000033039', 'Sistema de motor diésel: Realizar prueba en el Tanque de combustible, interruptor de flotador y señal de supervisión para espacio intersticial y asi detectar intrusión de liquidos', 36, 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044589', '00000000-0000-4000-b000-000000033039', 'Sistema de motor diésel: Medir contrapresión en turbo de motor', 37, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044590', '00000000-0000-4000-b000-000000033039', 'Sistema de motor diésel: Inspeccionar funcionamiento del respidadero del cárter del motor', 38, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044591', '00000000-0000-4000-b000-000000033039', 'Sistema de motor diésel: Realizar prueba para verificar el funcionamiento del interruptor de transferencia automática (Verificar que que este tranfiera energía a la fuente de energía alternativa)', 39, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044592', '00000000-0000-4000-b000-000000033039', 'Sistema de motor diésel: Dar mantenimiento a las baterias (Eliminar corrosión, Garantizar el voltaje, Garantizar que se use agua destiladas, Probar estado de carga y tasa de carga)', 40, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044593', '00000000-0000-4000-b000-000000033039', 'Sistema de motor diésel: Reemplazar los filtros de agua, de aceite, de combustible', 41, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044594', '00000000-0000-4000-b000-000000033039', 'Sistema de motor diésel: Inspección visual en el Tanque de Combustible para detectar si hay presencia de agua y materiales extraños', 42, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044595', '00000000-0000-4000-b000-000000033039', 'Sistema de motor diésel: Dar mantenimiento al impulsor del motor (Verificar y lubricar rodamientos del motor, revisar sistema de engranajes de ángulo recto y los acoplamientos de transmisión)', 43, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044596', '00000000-0000-4000-b000-000000033039', 'Sistema de bombas contra incendio: Inspeccionar que las rejillas de succión de pozo húmedo no presente obtrucciones y estan debidamente colocadas', 44, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044597', '00000000-0000-4000-b000-000000033039', 'Sistema de bombas contra incendio: Verificar alineación paralela y angular de la bomba y del impulsor', 45, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044598', '00000000-0000-4000-b000-000000033039', 'Sistema de bombas contra incendio: Inspeccionar el movimiento u holgura longitudinal de los ejes durante el funcionamiento', 46, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044599', '00000000-0000-4000-b000-000000033039', 'Sistema de bombas contra incendio: Realizar pruebas de desempeño para verificar el funcionamiento de las bombas con 0% flujo, 100% del flujo nominal y el 150% de flujo', 47, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044600', '00000000-0000-4000-b000-000000033039', 'Sistema de bombas contra incendio: Calibrar Manómetros para tener una un presicion del +/- 1% y medidores de flujo para tener una un presicion del +/- 3%, verificar funcionamiento del transductores y', 48, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044601', '00000000-0000-4000-b000-000000033039', 'Sistema de bombas contra incendio: Dar mantenimiento al impulsor de la bomba (Verificar y lubricar rodamientos del motor, revisar sistema de engranajes de ángulo recto y los acoplamientos de transmisi', 49, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044602', '00000000-0000-4000-b000-000000033039', 'Sistema eléctrico/ Controlador: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas (Medir tensión, corriente y medir aislamiento)', 50, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044603', '00000000-0000-4000-b000-000000033039', 'Sistema eléctrico/ Controlador: Inspeccionar que las placas de circuitos (PCB) no preseten corrosión', 51, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044604', '00000000-0000-4000-b000-000000033039', 'Sistema eléctrico/ Controlador: Verificar funcionamiento del controlador electrónico del manejo de combustible, el modulo de control electrónico de respaldo y los sensores principales y redundantes de', 52, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044605', '00000000-0000-4000-b000-000000033039', 'Sistema eléctrico/ Controlador: Verificar estado y condición de los ánodos de sacrificio y reemplazar si es necesario', 53, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044606', '00000000-0000-4000-b000-000000033039', 'Sistema de tuberias, válvulas y mangueras: Realizar pruebas para verificar funcionamiento de la Válvula de alivio de presión principal', 54, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044607', '00000000-0000-4000-b000-000000033039', 'Sistema de tuberias, válvulas y mangueras: Comprobar el estado y la seguridad de las conexiones de las mangueras.', 55, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044608', '00000000-0000-4000-b000-000000033039', 'Sistema de tuberias, válvulas y mangueras: Comprobar el estado y la seguridad de las conexiones de las tuberías y tuberías de rebose.', 56, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044609', '00000000-0000-4000-b000-000000033039', 'Sistema de Vapor: Realizar mantenimiento a la Turbina de vapor para verificar que funcione correctamente', 57, 12)
ON CONFLICT (id) DO NOTHING;
-- Plan: .PDO.AEC.SCF (.PDO.AEC.SCF)
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('00000000-0000-4000-b000-000000033040', '.PDO.AEC.SCF (.PDO.AEC.SCF)', 'Plan de mantenimiento preventivo migrado', 'calendar', 12, 'months', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044610', '00000000-0000-4000-b000-000000033040', 'Partes: Labor de mantenimiento', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044611', '00000000-0000-4000-b000-000000033040', 'Purgador de condensados ECO-DRAIN 30: Comprobar el correcto funcionamiento del purgador de condensados.', 1, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044612', '00000000-0000-4000-b000-000000033040', 'Purgador de condensados ECO-DRAIN 30: Cambiar la unidad de mantenimiento del purgador de condensados.', 2, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044613', '00000000-0000-4000-b000-000000033040', 'Refrigerante: Limpiar el condensador del refrigerante.', 3, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044614', '00000000-0000-4000-b000-000000033040', 'Filtro F110KB: Cambiar filtros del aire comprimido', 4, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044615', '00000000-0000-4000-b000-000000033040', 'Filtro F110KE: Comprobación de funcionamiento condensados en el filtro de aire comprimido', 5, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044616', '00000000-0000-4000-b000-000000033040', 'Filtro F110KE: Cambiar filtros de aire comprimido', 6, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044617', '00000000-0000-4000-b000-000000033040', 'Sistema  Eléctrico: Comprobar el estado y la seguridad del cableado y de las conexiones eléctricas en el hardware(Medir tensión, corriente y medir aislamiento)', 7, 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('00000000-0000-4000-b000-000000044618', '00000000-0000-4000-b000-000000033040', 'Sistema de tuberias: Comprobar el estado y la seguridad de las conexiones de las tuberías, mangueras y accesorios.', 8, 12)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 5. ASSET PLANS - Vinculación equipos a planes
-- ============================================================================

INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055000', '00000000-0000-4000-b000-000000001000', '00000000-0000-4000-b000-000000033022', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055001', '00000000-0000-4000-b000-000000001001', '00000000-0000-4000-b000-000000033022', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055002', '00000000-0000-4000-b000-000000001002', '00000000-0000-4000-b000-000000033022', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055003', '00000000-0000-4000-b000-000000001003', '00000000-0000-4000-b000-000000033023', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055004', '00000000-0000-4000-b000-000000001019', '00000000-0000-4000-b000-000000033017', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055005', '00000000-0000-4000-b000-000000001020', '00000000-0000-4000-b000-000000033017', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055006', '00000000-0000-4000-b000-000000001021', '00000000-0000-4000-b000-000000033017', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055007', '00000000-0000-4000-b000-000000001022', '00000000-0000-4000-b000-000000033017', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055008', '00000000-0000-4000-b000-000000001023', '00000000-0000-4000-b000-000000033017', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055009', '00000000-0000-4000-b000-000000001024', '00000000-0000-4000-b000-000000033017', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055010', '00000000-0000-4000-b000-000000001025', '00000000-0000-4000-b000-000000033017', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055011', '00000000-0000-4000-b000-000000001026', '00000000-0000-4000-b000-000000033017', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055012', '00000000-0000-4000-b000-000000001027', '00000000-0000-4000-b000-000000033017', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055013', '00000000-0000-4000-b000-000000001028', '00000000-0000-4000-b000-000000033017', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055014', '00000000-0000-4000-b000-000000001029', '00000000-0000-4000-b000-000000033017', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055015', '00000000-0000-4000-b000-000000001030', '00000000-0000-4000-b000-000000033017', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055016', '00000000-0000-4000-b000-000000001031', '00000000-0000-4000-b000-000000033020', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055017', '00000000-0000-4000-b000-000000001032', '00000000-0000-4000-b000-000000033036', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055018', '00000000-0000-4000-b000-000000001033', '00000000-0000-4000-b000-000000033034', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055019', '00000000-0000-4000-b000-000000001034', '00000000-0000-4000-b000-000000033034', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055020', '00000000-0000-4000-b000-000000001035', '00000000-0000-4000-b000-000000033033', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055021', '00000000-0000-4000-b000-000000001036', '00000000-0000-4000-b000-000000033033', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055022', '00000000-0000-4000-b000-000000001037', '00000000-0000-4000-b000-000000033025', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055023', '00000000-0000-4000-b000-000000001064', '00000000-0000-4000-b000-000000033028', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055024', '00000000-0000-4000-b000-000000001065', '00000000-0000-4000-b000-000000033029', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055025', '00000000-0000-4000-b000-000000001066', '00000000-0000-4000-b000-000000033030', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055026', '00000000-0000-4000-b000-000000001067', '00000000-0000-4000-b000-000000033027', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055027', '00000000-0000-4000-b000-000000001068', '00000000-0000-4000-b000-000000033027', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055028', '00000000-0000-4000-b000-000000001069', '00000000-0000-4000-b000-000000033007', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055029', '00000000-0000-4000-b000-000000001070', '00000000-0000-4000-b000-000000033007', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055030', '00000000-0000-4000-b000-000000001073', '00000000-0000-4000-b000-000000033010', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055031', '00000000-0000-4000-b000-000000001074', '00000000-0000-4000-b000-000000033010', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055032', '00000000-0000-4000-b000-000000001076', '00000000-0000-4000-b000-000000033009', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055033', '00000000-0000-4000-b000-000000001082', '00000000-0000-4000-b000-000000033006', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055034', '00000000-0000-4000-b000-000000001083', '00000000-0000-4000-b000-000000033006', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055035', '00000000-0000-4000-b000-000000001125', '00000000-0000-4000-b000-000000033039', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055036', '00000000-0000-4000-b000-000000001126', '00000000-0000-4000-b000-000000033039', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055037', '00000000-0000-4000-b000-000000001127', '00000000-0000-4000-b000-000000033038', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055038', '00000000-0000-4000-b000-000000001128', '00000000-0000-4000-b000-000000033038', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055039', '00000000-0000-4000-b000-000000001129', '00000000-0000-4000-b000-000000033037', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('00000000-0000-4000-b000-000000055040', '00000000-0000-4000-b000-000000001130', '00000000-0000-4000-b000-000000033037', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 6. WORK ORDERS - Histórico de Mantenimiento
-- ============================================================================

-- ============================================================================
-- BYPASS: Deshabilitar triggers de usuario para carga masiva de Work Orders
-- Nota: Los triggers de sistema no se pueden deshabilitar en Supabase
-- ============================================================================

ALTER TABLE public.work_orders DISABLE TRIGGER USER;

-- WO-23-09-00001: PTAR1.AA.AE-01 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022000', '00000000-0000-4000-b000-000000001005', NULL, 'WO-23-09-00001', 'Mantenimiento correctivo por temperatura', 'ID: 1', 'ID: 1',
    'corrective', 'completed', 'medium',
    '2023-09-21',
    '2023-09-23',
    0, NULL,
    'PTAR1.AA.AE-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-22-11-00001: PTAR1.AA.AE-02 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022001', '00000000-0000-4000-b000-000000001006', NULL, 'WO-22-11-00001', 'Temperatura normal al 5 Sep de 2024 Pogramar pronto', 'ID: 17', 'ID: 17',
    'corrective', 'completed', 'medium',
    '2022-11-13',
    '2022-11-15',
    0, '00000000-0000-4000-b000-000000010000',
    'PTAR1.AA.AE-02', 'SIMD',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-22-07-00001: PTAR1.AA.AE-03 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022002', '00000000-0000-4000-b000-000000001007', NULL, 'WO-22-07-00001', 'Correctivo, Temperatura 84 y punta 77 programar pronto', 'ID: 18', 'ID: 18',
    'corrective', 'completed', 'medium',
    '2022-07-05',
    '2022-07-07',
    0, NULL,
    'PTAR1.AA.AE-03', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-23-09-00002: PTAR1.AA.AE-04 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022003', '00000000-0000-4000-b000-000000001008', NULL, 'WO-23-09-00002', 'Temperatura normal programar pronto', 'ID: 19', 'ID: 19',
    'corrective', 'completed', 'medium',
    '2023-09-17',
    '2023-09-19',
    0, NULL,
    'PTAR1.AA.AE-04', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-22-07-00002: PTAR1.AA.AE-05 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022004', '00000000-0000-4000-b000-000000001009', NULL, 'WO-22-07-00002', 'Temperatura noraml caja a 78C Sep 2024', 'ID: 20', 'ID: 20',
    'corrective', 'completed', 'medium',
    '2022-07-05',
    '2022-07-07',
    0, NULL,
    'PTAR1.AA.AE-05', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-07-00001: PTAR1.AA.AE-06 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022005', '00000000-0000-4000-b000-000000001010', NULL, 'WO-24-07-00001', 'Mantenimiento preventivo de aerador  6. incluye  motor, caja reductora', 'ID: 21', 'ID: 21',
    'preventive', 'completed', 'medium',
    '2024-06-25',
    '2024-07-02',
    6995.0, '00000000-0000-4000-b000-000000010000',
    'PTAR1.AA.AE-06', 'SIMD',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-23-05-00001: PTAR1.AA.AE-07 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022006', '00000000-0000-4000-b000-000000001011', NULL, 'WO-23-05-00001', 'Caliente programar pronto temperatura de 90C en punta y 85C en Motor Agosto 2024', 'ID: 22', 'ID: 22',
    'corrective', 'completed', 'medium',
    '2023-05-07',
    '2023-05-09',
    0, NULL,
    'PTAR1.AA.AE-07', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-23-07-00001: PTAR1.AA.AE-08 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022007', '00000000-0000-4000-b000-000000001012', NULL, 'WO-23-07-00001', 'TEmperatura normal sep 2024', 'ID: 23', 'ID: 23',
    'corrective', 'completed', 'medium',
    '2023-07-24',
    '2023-07-26',
    0, NULL,
    'PTAR1.AA.AE-08', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-22-12-00001: PTAR1.DOC.CLR-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022008', '00000000-0000-4000-b000-000000001031', '00000000-0000-4000-b000-000000055016', 'WO-22-12-00001', 'Repello y nivelacion de pista, cambio de baleros en y rodos, revision de ambas cajas reductoras', 'ID: 24', 'ID: 24',
    'preventive', 'completed', 'medium',
    '2022-12-18',
    '2022-12-25',
    22500.0, NULL,
    'PTAR1.DOC.CLR-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-21-12-00001: PTAR2.DOC.CLR-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022009', '00000000-0000-4000-b000-000000001064', '00000000-0000-4000-b000-000000055023', 'WO-21-12-00001', 'SIMD  Mantener en observacion Tornillo por evidente desgaste de corona, se hizo junto con el espezador de lodos', 'ID: 25', 'ID: 25',
    'preventive', 'completed', 'medium',
    '2021-12-22',
    '2021-12-29',
    24200.0, '00000000-0000-4000-b000-000000010000',
    'PTAR2.DOC.CLR-01', 'SIMD',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-05-00001: SB.46kV.TX-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022010', '00000000-0000-4000-b000-000000001127', '00000000-0000-4000-b000-000000055037', 'WO-24-05-00001', 'Se hizo solo muestreo en busca de furanos o humedad y el resultado fue "Fuera de peligro" SOLELECTRIC', 'ID: 26', 'ID: 26',
    'preventive', 'completed', 'medium',
    '2024-05-01',
    '2024-05-08',
    500.0, NULL,
    'SB.46kV.TX-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-23-12-00001: SB.46kV.TX-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022011', '00000000-0000-4000-b000-000000001127', '00000000-0000-4000-b000-000000055037', 'WO-23-12-00001', 'Se hizo analisis de gases y pruebas electricas, a mantener en observacion y repetir pruebas de gases debido a probable alta humedad', 'ID: 27', 'ID: 27',
    'preventive', 'completed', 'medium',
    '2023-12-12',
    '2023-12-19',
    3400.0, NULL,
    'SB.46kV.TX-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-23-12-00002: SB.46kV.INT-01 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022012', '00000000-0000-4000-b000-000000001129', '00000000-0000-4000-b000-000000055039', 'WO-23-12-00002', 'Cambio de Gas SF6 debido a baja pureza', 'ID: 28', 'ID: 28',
    'corrective', 'completed', 'medium',
    '2023-12-18',
    '2023-12-20',
    10531.0, NULL,
    'SB.46kV.INT-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-23-12-00003: SB.46kV.TC-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022013', '00000000-0000-4000-b000-000000001131', NULL, 'WO-23-12-00003', 'TCs bien sin embargo los 3 presentan arcoelectrico, se deben cambiar en menos de 24 meses.', 'ID: 29', 'ID: 29',
    'preventive', 'completed', 'medium',
    '2023-12-13',
    '2023-12-20',
    600.0, NULL,
    'SB.46kV.TC-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-23-12-00004: SB.46kV.TC-02 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022014', '00000000-0000-4000-b000-000000001132', NULL, 'WO-23-12-00004', 'TCs bien sin embargo los 3 presentan arcoelectrico, se deben cambiar en menos de 24 meses.', 'ID: 30', 'ID: 30',
    'preventive', 'completed', 'medium',
    '2023-12-13',
    '2023-12-20',
    600.0, NULL,
    'SB.46kV.TC-02', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-23-12-00005: SB.46kV.TC-03 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022015', '00000000-0000-4000-b000-000000001133', NULL, 'WO-23-12-00005', 'TCs bien sin embargo los 3 presentan arcoelectrico, se deben cambiar en menos de 24 meses.', 'ID: 31', 'ID: 31',
    'preventive', 'completed', 'medium',
    '2023-12-13',
    '2023-12-20',
    600.0, NULL,
    'SB.46kV.TC-03', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-23-12-00006: SB.46kV.TC-04 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022016', '00000000-0000-4000-b000-000000001134', NULL, 'WO-23-12-00006', 'TCs de Opico, saturacion, exactitud bien, aptos para medicion Oficial, se enviara reporte a la UT', 'ID: 32', 'ID: 32',
    'preventive', 'completed', 'medium',
    '2023-12-13',
    '2023-12-20',
    600.0, NULL,
    'SB.46kV.TC-04', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-23-12-00007: SB.46kV.TC-05 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022017', '00000000-0000-4000-b000-000000001135', NULL, 'WO-23-12-00007', 'TCs de Opico, saturacion, exactitud bien, aptos para medicion Oficial, se enviara reporte a la UT', 'ID: 33', 'ID: 33',
    'preventive', 'completed', 'medium',
    '2023-12-13',
    '2023-12-20',
    600.0, NULL,
    'SB.46kV.TC-05', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-23-12-00008: SB.46kV.TC-06 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022018', '00000000-0000-4000-b000-000000001136', NULL, 'WO-23-12-00008', 'TCs de Opico, saturacion, exactitud bien, aptos para medicion Oficial, se enviara reporte a la UT', 'ID: 34', 'ID: 34',
    'preventive', 'completed', 'medium',
    '2023-12-13',
    '2023-12-20',
    600.0, NULL,
    'SB.46kV.TC-06', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-09-00001: PTAR1.AA.AE-09 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022019', '00000000-0000-4000-b000-000000001013', NULL, 'WO-24-09-00001', 'Se realizo mtto correctivo debido a falla de piñones en caja reducturoa. ademas de mtto preventivo de motor, que incluye  cambio de rodamientos.', 'ID: 36', 'ID: 36',
    'corrective', 'completed', 'medium',
    '2024-09-04',
    '2024-09-06',
    9215.0, NULL,
    'PTAR1.AA.AE-09', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-09-00002: PTAR1.AA.AE-10 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022020', '00000000-0000-4000-b000-000000001014', NULL, 'WO-24-09-00002', 'Mtto preventivo  que abarca:  Mantenimiento preventivo de Caja Reductora. -Desmontaje de caja reductora del equipo aireador. -Desarmado de caja y revisión. -Lavado de piñones. - cambio de rodamientos -Cambio de retenedores de eje grande principal (4) -Cambio de retenedores de eje principal de polea (2) -Cambio de hule negro cobertor de retenedores. -Verificación de ejes  -Revisión de manguera de nivel de aceite y su cambio. -Sellado de caja reductora con silicón. -Cambio de pernos de armado de c', 'ID: 37', 'ID: 37',
    'corrective', 'completed', 'medium',
    '2024-09-07',
    '2024-09-09',
    6995.0, '00000000-0000-4000-b000-000000010000',
    'PTAR1.AA.AE-10', 'SIMD',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-23-11-00001: PTAR1.AA.AE-11 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022021', '00000000-0000-4000-b000-000000001015', NULL, 'WO-23-11-00001', 'El mtto preventico incluye: Mantenimiento preventivo de Caja Reductora. -Desmontaje de caja reductora del equipo aireador. -Desarmado de caja y revisión. -Lavado de piñones. - cambio de rodamientos -Cambio de retenedores de eje grande principal (4) -Cambio de retenedores de eje principal de polea (2) -Cambio de hule negro cobertor de retenedores. -Verificación de ejes  -Revisión de manguera de nivel de aceite y su cambio. -Sellado de caja reductora con silicón. -Cambio de pernos de armado de caj', 'ID: 38', 'ID: 38',
    'preventive', 'completed', 'medium',
    '2023-10-27',
    '2023-11-03',
    6995.0, '00000000-0000-4000-b000-000000010000',
    'PTAR1.AA.AE-11', 'SIMD',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-22-04-00001: PTAR1.AA.AE-12 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022022', '00000000-0000-4000-b000-000000001016', NULL, 'WO-22-04-00001', 'Ademas del mtto prevetivo se cambio punta grande , esta es la que hace la transmicion entre la caja reductora y las aspas de aereador. el costo solo de la punta esta al rededor de $3550 dolares', 'ID: 39', 'ID: 39',
    'corrective', 'completed', 'medium',
    '2022-03-30',
    '2022-04-01',
    0, NULL,
    'PTAR1.AA.AE-12', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-22-02-00001: PTAR1.AA.AE-13 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022023', '00000000-0000-4000-b000-000000001017', NULL, 'WO-22-02-00001', 'El mtto preventivo abarca:  Mantenimiento preventivo de Caja Reductora. -Desmontaje de caja reductora del equipo aireador. -Desarmado de caja y revisión. -Lavado de piñones. - cambio de rodamientos -Cambio de retenedores de eje grande principal (4) -Cambio de retenedores de eje principal de polea (2) -Cambio de hule negro cobertor de retenedores. -Verificación de ejes  -Revisión de manguera de nivel de aceite y su cambio. -Sellado de caja reductora con silicón. -Cambio de pernos de armado de caj', 'ID: 40', 'ID: 40',
    'preventive', 'completed', 'medium',
    '2022-01-25',
    '2022-02-01',
    6995.0, NULL,
    'PTAR1.AA.AE-13', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-03-00001: PTAR1.AA.AE-14 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022024', '00000000-0000-4000-b000-000000001018', NULL, 'WO-24-03-00001', 'Se realizo mtto preventivo de aerador 14, se fabricaron piñones de caja, flange de punta grande, punta grande. ademas de la sustitucion de rodamientos y mtto preventivo de motor de aerador.', 'ID: 41', 'ID: 41',
    'corrective', 'completed', 'medium',
    '2024-03-04',
    '2024-03-06',
    10705.0, NULL,
    'PTAR1.AA.AE-14', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-05-00002: PTAR1.AA.MI-01 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022025', '00000000-0000-4000-b000-000000001019', '00000000-0000-4000-b000-000000055004', 'WO-24-05-00002', 'Mixer se re embobino, ademas se le dio el mtto preventivo que incluye el cambio de rodamientos. Editado 2025', 'ID: 42', 'ID: 42',
    'corrective', 'completed', 'medium',
    '2024-05-28',
    '2024-05-30',
    2125.0, '00000000-0000-4000-b000-000000010001',
    'PTAR1.AA.MI-01', 'Taller Hernandez',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-22-12-00002: PTAR1.AA.MI-02 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022026', '00000000-0000-4000-b000-000000001020', '00000000-0000-4000-b000-000000055005', 'WO-22-12-00002', 'Mtto preventivo, incluye de cambio de rodamienos.', 'ID: 43', 'ID: 43',
    'preventive', 'completed', 'medium',
    '2022-12-15',
    '2022-12-22',
    1325.0, NULL,
    'PTAR1.AA.MI-02', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-05-00003: PTAR1.AA.MI-03 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022027', '00000000-0000-4000-b000-000000001021', '00000000-0000-4000-b000-000000055006', 'WO-24-05-00003', 'Se envio  mtto por re embobindado, ademas se dio el preventivo que incluye el cambio de rodamientos y pruebas electricas.', 'ID: 44', 'ID: 44',
    'corrective', 'completed', 'medium',
    '2024-05-28',
    '2024-05-30',
    2125.0, NULL,
    'PTAR1.AA.MI-03', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-22-12-00003: PTAR1.AA.MI-04 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022028', '00000000-0000-4000-b000-000000001022', '00000000-0000-4000-b000-000000055007', 'WO-22-12-00003', 'Mtto preventivo, inlcuye cambio de rodamientos.', 'ID: 45', 'ID: 45',
    'preventive', 'completed', 'medium',
    '2022-12-15',
    '2022-12-22',
    1325.0, NULL,
    'PTAR1.AA.MI-04', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-07-00002: PTAR1.AA.MI-05 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022029', '00000000-0000-4000-b000-000000001023', '00000000-0000-4000-b000-000000055008', 'WO-24-07-00002', 're embobinado, ademas de mtto preventivo.', 'ID: 46', 'ID: 46',
    'corrective', 'completed', 'medium',
    '2024-07-14',
    '2024-07-16',
    2125.0, NULL,
    'PTAR1.AA.MI-05', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-07-00003: PTAR1.AA.MI-06 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022030', '00000000-0000-4000-b000-000000001024', '00000000-0000-4000-b000-000000055009', 'WO-24-07-00003', 're embobinado, ademas de cambios de rodamientos.', 'ID: 47', 'ID: 47',
    'corrective', 'completed', 'medium',
    '2024-07-14',
    '2024-07-16',
    2125.0, NULL,
    'PTAR1.AA.MI-06', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-22-12-00004: PTAR1.AA.MI-07 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022031', '00000000-0000-4000-b000-000000001025', '00000000-0000-4000-b000-000000055010', 'WO-22-12-00004', 'mtto preventivo que incluye cambio de reodamientos e inspecciones electricas.', 'ID: 48', 'ID: 48',
    'preventive', 'completed', 'medium',
    '2022-12-15',
    '2022-12-22',
    1325.0, NULL,
    'PTAR1.AA.MI-07', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-22-02-00002: PTAR1.AA.MI-08 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022032', '00000000-0000-4000-b000-000000001026', '00000000-0000-4000-b000-000000055011', 'WO-22-02-00002', 'mtto preventivo incluye cambio de rodamientos.', 'ID: 49', 'ID: 49',
    'preventive', 'completed', 'medium',
    '2022-02-01',
    '2022-02-08',
    1325.0, NULL,
    'PTAR1.AA.MI-08', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-22-12-00005: PTAR1.AA.MI-09 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022033', '00000000-0000-4000-b000-000000001027', '00000000-0000-4000-b000-000000055012', 'WO-22-12-00005', 'mtto preventivo. re embobinado.', 'ID: 50', 'ID: 50',
    'corrective', 'completed', 'medium',
    '2022-12-20',
    '2022-12-22',
    2125.0, NULL,
    'PTAR1.AA.MI-09', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-22-09-00001: PTAR1.AA.MI-10 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022034', '00000000-0000-4000-b000-000000001028', '00000000-0000-4000-b000-000000055013', 'WO-22-09-00001', 'mtto preventivo que incluye cambio de rodamientos.', 'ID: 51', 'ID: 51',
    'preventive', 'completed', 'medium',
    '2022-09-16',
    '2022-09-23',
    1325.0, NULL,
    'PTAR1.AA.MI-10', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-05-00004: PTAR1.AA.MI-11 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022035', '00000000-0000-4000-b000-000000001029', '00000000-0000-4000-b000-000000055014', 'WO-24-05-00004', 'mtto preventivo, inlcuye cambio de rodamientos', 'ID: 52', 'ID: 52',
    'preventive', 'completed', 'medium',
    '2024-05-23',
    '2024-05-30',
    1325.0, NULL,
    'PTAR1.AA.MI-11', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-22-09-00002: PTAR1.AA.MI-12 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022036', '00000000-0000-4000-b000-000000001030', '00000000-0000-4000-b000-000000055015', 'WO-22-09-00002', 'mtto preventido y re embobinado', 'ID: 53', 'ID: 53',
    'corrective', 'completed', 'medium',
    '2022-09-21',
    '2022-09-23',
    2125.0, NULL,
    'PTAR1.AA.MI-12', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-22-02-00003: PTAR2.AA.AE-01 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022037', '00000000-0000-4000-b000-000000001042', NULL, 'WO-22-02-00003', 'mtto preventivo inlcuye cabio de rodamientos, inpesccion de parametros electricos. limpieza y pintura.', 'ID: 54', 'ID: 54',
    'corrective', 'completed', 'medium',
    '2022-01-30',
    '2022-02-01',
    1406.5, NULL,
    'PTAR2.AA.AE-01', 'nan',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-22-11-00002: PTAR2.AA.AE-02 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022038', '00000000-0000-4000-b000-000000001043', NULL, 'WO-22-11-00002', 'mtto preventivo que incluye cambio de rodamientos, pintura, y medicion de parametros electricos.', 'ID: 55', 'ID: 55',
    'preventive', 'completed', 'medium',
    '2022-11-08',
    '2022-11-15',
    1406.0, NULL,
    'PTAR2.AA.AE-02', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-22-11-00003: PTAR2.AA.AE-03 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022039', '00000000-0000-4000-b000-000000001044', NULL, 'WO-22-11-00003', 'mtto preventivo que incluye cambio de rodamientos, pintura, y medicion de parametros electricos.', 'ID: 56', 'ID: 56',
    'preventive', 'completed', 'medium',
    '2022-11-08',
    '2022-11-15',
    1406.5, NULL,
    'PTAR2.AA.AE-03', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-23-01-00001: PTAR2.AA.AE-04 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022040', '00000000-0000-4000-b000-000000001045', NULL, 'WO-23-01-00001', 'mtto preventivo que incluye cambio de rodamientos, pintura, y medicion de parametros electricos.', 'ID: 57', 'ID: 57',
    'preventive', 'completed', 'medium',
    '2023-01-19',
    '2023-01-26',
    1406.5, NULL,
    'PTAR2.AA.AE-04', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-22-07-00003: PTAR2.AA.AE-05 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022041', '00000000-0000-4000-b000-000000001046', NULL, 'WO-22-07-00003', 'mtto preventivo que incluye cambio de rodamientos, pintura, y medicion de parametros electricos.', 'ID: 58', 'ID: 58',
    'preventive', 'completed', 'medium',
    '2022-06-30',
    '2022-07-07',
    1406.5, NULL,
    'PTAR2.AA.AE-05', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-22-07-00004: PTAR2.AA.AE-06 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022042', '00000000-0000-4000-b000-000000001047', NULL, 'WO-22-07-00004', 'mtto preventivo que incluye cambio de rodamientos, pintura, y medicion de parametros electricos.', 'ID: 59', 'ID: 59',
    'preventive', 'completed', 'medium',
    '2022-06-30',
    '2022-07-07',
    1406.5, NULL,
    'PTAR2.AA.AE-06', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-23-12-00009: PTAR2.AA.AE-07 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022043', '00000000-0000-4000-b000-000000001048', NULL, 'WO-23-12-00009', 'mtto preventivo que incluye cambio de rodamientos, pintura, y medicion de parametros electricos.', 'ID: 60', 'ID: 60',
    'preventive', 'completed', 'medium',
    '2023-12-05',
    '2023-12-12',
    1406.0, NULL,
    'PTAR2.AA.AE-07', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-23-05-00002: PTAR2.AA.AE-08 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022044', '00000000-0000-4000-b000-000000001049', NULL, 'WO-23-05-00002', 'mtto preventivo que incluye cambio de rodamientos, pintura, y medicion de parametros electricos.', 'ID: 61', 'ID: 61',
    'preventive', 'completed', 'medium',
    '2023-05-02',
    '2023-05-09',
    1406.0, NULL,
    'PTAR2.AA.AE-08', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-23-08-00001: PTAR2.AA.AE-09 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022045', '00000000-0000-4000-b000-000000001050', NULL, 'WO-23-08-00001', 'mtto correctivo que incluye cambio de rodamientos, pintura, y medicion de parametros electricos. y re embobinado', 'ID: 62', 'ID: 62',
    'corrective', 'completed', 'medium',
    '2023-08-21',
    '2023-08-23',
    2460.0, NULL,
    'PTAR2.AA.AE-09', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-06-00001: PTAR2.AA.AE-10 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022046', '00000000-0000-4000-b000-000000001051', NULL, 'WO-24-06-00001', 'mtto preventivo que incluye cambio de rodamientos, pintura, y medicion de parametros electricos.', 'ID: 63', 'ID: 63',
    'preventive', 'completed', 'medium',
    '2024-06-21',
    '2024-06-28',
    1406.0, NULL,
    'PTAR2.AA.AE-10', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-22-02-00004: PTAR2.AA.AE-11 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022047', '00000000-0000-4000-b000-000000001052', NULL, 'WO-22-02-00004', 'mtto correctivo que incluye cambio de rodamientos, pintura, y medicion de parametros electricos.', 'ID: 64', 'ID: 64',
    'preventive', 'completed', 'medium',
    '2022-01-25',
    '2022-02-01',
    2460.0, NULL,
    'PTAR2.AA.AE-11', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-23-05-00003: PTAR2.AA.AE-12 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022048', '00000000-0000-4000-b000-000000001053', NULL, 'WO-23-05-00003', 'mtto preventivo que incluye cambio de rodamientos, pintura, y medicion de parametros electricos.', 'ID: 65', 'ID: 65',
    'preventive', 'completed', 'medium',
    '2023-05-16',
    '2023-05-23',
    1406.0, NULL,
    'PTAR2.AA.AE-12', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-07-00004: PTAR2.AA.AE-13 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022049', '00000000-0000-4000-b000-000000001054', NULL, 'WO-24-07-00004', 'mtto correctovp que incluye cambio de rodamientos, pintura, y medicion de parametros electricos. y re embobinado', 'ID: 66', 'ID: 66',
    'corrective', 'completed', 'medium',
    '2024-07-24',
    '2024-07-26',
    2460.0, NULL,
    'PTAR2.AA.AE-13', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-09-00003: PTAR2.AA.AE-14 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022050', '00000000-0000-4000-b000-000000001055', NULL, 'WO-24-09-00003', 'mtto preventivo que incluye cambio de rodamientos, pintura, y medicion de parametros electricos.', 'ID: 67', 'ID: 67',
    'preventive', 'completed', 'medium',
    '2024-09-02',
    '2024-09-09',
    1406.0, NULL,
    'PTAR2.AA.AE-14', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-08-00001: PDO.AEC.CTR-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022051', '00000000-0000-4000-b000-000000001069', '00000000-0000-4000-b000-000000055028', 'WO-24-08-00001', 'Mtto preventivo programado tipo B.  datos segun contrato.', 'ID: 68', 'ID: 68',
    'preventive', 'completed', 'medium',
    '2024-08-18',
    '2024-08-25',
    0, NULL,
    'PDO.AEC.CTR-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-09-00004: PDO.AEC.CTR-02 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022052', '00000000-0000-4000-b000-000000001070', '00000000-0000-4000-b000-000000055029', 'WO-24-09-00004', 'Mtto preventivo programado  tipo B. Datos segun contrato.', 'ID: 69', 'ID: 69',
    'preventive', 'completed', 'medium',
    '2024-09-03',
    '2024-09-10',
    0, NULL,
    'PDO.AEC.CTR-02', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-09-00005: PTAR1.RL.RASP-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022053', '00000000-0000-4000-b000-000000001000', '00000000-0000-4000-b000-000000055000', 'WO-24-09-00005', 'No se tiene registro de ultimo mantenimiento preventivo o correctivo de la bomba sumergible. agregar que el costo por mtto y reembobinado si es necesario. es de de aproximadamente $2940 esto incluye:  Rebobinado de motor -Cambio de baleros -Cambio de sellos -Cambio de orings -Pintura dieléctrica -Aceite para bobina -Aceite para sello mecánico', 'ID: 70', 'ID: 70',
    'preventive', 'completed', 'medium',
    '2024-09-04',
    '2024-09-11',
    2.0, NULL,
    'PTAR1.RL.RASP-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-09-00006: PTAR1.RL.RASP-02 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022054', '00000000-0000-4000-b000-000000001001', '00000000-0000-4000-b000-000000055001', 'WO-24-09-00006', 'No se tiene registro de ultimo mantenimiento preventivo o correctivo de la bomba sumergible. agregar que el costo por mtto y reembobinado si es necesario. es de de aproximadamente $2940 esto incluye:  Rebobinado de motor -Cambio de baleros -Cambio de sellos -Cambio de orings -Pintura dieléctrica -Aceite para bobina -Aceite para sello mecánico', 'ID: 71', 'ID: 71',
    'preventive', 'completed', 'medium',
    '2024-09-04',
    '2024-09-11',
    0, NULL,
    'PTAR1.RL.RASP-02', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-09-00007: PTAR1.RL.RASP-03 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022055', '00000000-0000-4000-b000-000000001002', '00000000-0000-4000-b000-000000055002', 'WO-24-09-00007', 'No se tiene registro de ultimo mantenimiento preventivo o correctivo de la bomba sumergible. agregar que el costo por mtto y reembobinado si es necesario. es de de aproximadamente $2940 esto incluye:  Rebobinado de motor -Cambio de baleros -Cambio de sellos -Cambio de orings -Pintura dieléctrica -Aceite para bobina -Aceite para sello mecánico', 'ID: 72', 'ID: 72',
    'preventive', 'completed', 'medium',
    '2024-09-04',
    '2024-09-11',
    0, NULL,
    'PTAR1.RL.RASP-03', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-23-11-00002: PSVZ.MZS.BCS-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022056', '00000000-0000-4000-b000-000000001101', NULL, 'WO-23-11-00002', 'mtto preventivo incluye cambio de sello y rodamientos.', 'ID: 83', 'ID: 83',
    'preventive', 'completed', 'medium',
    '2023-11-17',
    '2023-11-24',
    1115.0, NULL,
    'PSVZ.MZS.BCS-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-06-00002: PSVZ.MZS.BCS-02 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022057', '00000000-0000-4000-b000-000000001102', NULL, 'WO-24-06-00002', 'Mtto preventivo, incluye  cambio de sellos y rodamientos .', 'ID: 84', 'ID: 84',
    'preventive', 'completed', 'medium',
    '2024-06-13',
    '2024-06-20',
    1115.0, NULL,
    'PSVZ.MZS.BCS-02', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-06-00003: PSVZ.MZS.BCS-03 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022058', '00000000-0000-4000-b000-000000001103', NULL, 'WO-24-06-00003', 'Mtto incluye cambio de rodamientos y sello.', 'ID: 85', 'ID: 85',
    'preventive', 'completed', 'medium',
    '2024-06-13',
    '2024-06-20',
    1115.0, NULL,
    'PSVZ.MZS.BCS-03', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-09-00008: PSVZ.MZS.BCS-04 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022059', '00000000-0000-4000-b000-000000001104', NULL, 'WO-24-09-00008', 'Mtto incluye cambio de sello y rodamiento.', 'ID: 86', 'ID: 86',
    'preventive', 'completed', 'medium',
    '2024-09-04',
    '2024-09-11',
    1115.0, NULL,
    'PSVZ.MZS.BCS-04', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-23-11-00003: PSVZ.CTN.BBS-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022060', '00000000-0000-4000-b000-000000001084', NULL, 'WO-23-11-00003', 'mtto preventivo incluye :   -Motor maratón XRL USA -RPM 1780, VOLT 460, 125 HP -Mantenimiento preventivo y correctivo -Lavado de estator, secado y barnizado. -Cambio de baleros -Fabricación de camisa para baleros por vibración de  motor.', 'ID: 87', 'ID: 87',
    'preventive', 'completed', 'medium',
    '2023-11-16',
    '2023-11-23',
    5500.0, '00000000-0000-4000-b000-000000010001',
    'PSVZ.CTN.BBS-01', 'Taller Hernandez',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-23-11-00004: PSVZ.CTN.BBS-02 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022061', '00000000-0000-4000-b000-000000001085', NULL, 'WO-23-11-00004', '-Motor maratón XRL USA -RPM 1780, VOLT 460, 125 HP -Mantenimiento preventivo y correctivo -Lavado de estator, secado y barnizado. -Cambio de baleros -Fabricación de camisa para baleros por vibración de  motor.', 'ID: 88', 'ID: 88',
    'preventive', 'completed', 'medium',
    '2023-11-16',
    '2023-11-23',
    2250.0, NULL,
    'PSVZ.CTN.BBS-02', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-06-00004: PDO.AEC.SCF-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022062', '00000000-0000-4000-b000-000000001071', NULL, 'WO-24-06-00004', 'DATOS SEGUN CONTRATO', 'ID: 89', 'ID: 89',
    'preventive', 'completed', 'medium',
    '2024-06-07',
    '2024-06-14',
    0, NULL,
    'PDO.AEC.SCF-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-06-00005: PDO.AEC.SCF-02 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022063', '00000000-0000-4000-b000-000000001072', NULL, 'WO-24-06-00005', 'DATOS SEGUN CONTRATO', 'ID: 90', 'ID: 90',
    'preventive', 'completed', 'medium',
    '2024-06-07',
    '2024-06-14',
    0, NULL,
    'PDO.AEC.SCF-02', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-06-00006: PTAR2.DOC.CTR-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022064', '00000000-0000-4000-b000-000000001057', NULL, 'WO-24-06-00006', 'mtto preventivo de acuerdo a contrato', 'ID: 91', 'ID: 91',
    'preventive', 'completed', 'medium',
    '2024-06-03',
    '2024-06-10',
    0, NULL,
    'PTAR2.DOC.CTR-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-09-00009: PTAR2.DOC.SCF-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022065', '00000000-0000-4000-b000-000000001056', NULL, 'WO-24-09-00009', 'mtto segun contrato', 'ID: 92', 'ID: 92',
    'preventive', 'completed', 'medium',
    '2024-09-05',
    '2024-09-12',
    0, NULL,
    'PTAR2.DOC.SCF-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-23-09-00003: PTAR2.RL.RASP-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022066', '00000000-0000-4000-b000-000000001033', '00000000-0000-4000-b000-000000055018', 'WO-23-09-00003', 'Mantenimiento de bomba RAS(30HP) -Cambio de baleros  -Rectificado de tapaderas de motor -lavado con solvente y pintura dieléctrica de bobina -Pintura general catalizada', 'ID: 93', 'ID: 93',
    'preventive', 'completed', 'medium',
    '2023-09-20',
    '2023-09-27',
    0, NULL,
    'PTAR2.RL.RASP-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-23-09-00004: PTAR2.RL.RASP-02 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022067', '00000000-0000-4000-b000-000000001034', '00000000-0000-4000-b000-000000055019', 'WO-23-09-00004', 'Mantenimiento de bomba RAS(30HP) -Cambio de baleros  -Rectificado de tapaderas de motor -lavado con solvente y pintura dieléctrica de bobina -Pintura general catalizada', 'ID: 94', 'ID: 94',
    'preventive', 'completed', 'medium',
    '2023-09-20',
    '2023-09-27',
    0, NULL,
    'PTAR2.RL.RASP-02', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-09-00010: PTAR2.DOC.MTL-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022068', '00000000-0000-4000-b000-000000001066', '00000000-0000-4000-b000-000000055025', 'WO-24-09-00010', 'Mantenimiento mixer de tanque de lodos -Cambio de baleros y empaques -Lavado con solvente dieléctrico -Pintura catalizada -Montaje y desmontaje', 'ID: 95', 'ID: 95',
    'preventive', 'completed', 'medium',
    '2024-09-05',
    '2024-09-12',
    1400.0, NULL,
    'PTAR2.DOC.MTL-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-23-12-00010: PCLD.GDV.TCDL-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022069', '00000000-0000-4000-b000-000000001121', NULL, 'WO-23-12-00010', 'Mantenimiento general de Caldera Dual de 500 BHP. #1. NRMT: 0512. Modelo: CB-600-500-150. Serial. L-89643.  Limpieza de lado de fuego Limpieza de lado de agua  Cambio de empaquetadura lado fuego Cambio de empaquetadura lado de aguas. Prueba hidrostaticas a 150 psi. Revicion de sistema de combustible F.O. Revición de ckt y elemetos electricos.  Costo por Servicio bajo convenio con proveedor.', 'ID: 96', 'ID: 96',
    'preventive', 'completed', 'medium',
    '2023-12-11',
    '2023-12-18',
    0, NULL,
    'PCLD.GDV.TCDL-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-23-12-00011: PCLD.GDV.TCDL-02 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022070', '00000000-0000-4000-b000-000000001122', NULL, 'WO-23-12-00011', 'Mantenimiento general de Caldera Dual de 600 BHP. #2. NRMT: 0513. Modelo: WB-A2-3P Serial. 17900P-WB00-01  Limpieza de lado de fuego Limpieza de lado de agua  Cambio de empaquetadura lado fuego Cambio de empaquetadura lado de aguas. Prueba hidrostaticas a 150 psi. Revicion de sistema de combustible F.O. Revición de ckt y elemetos electricos.  Costo por Servicio bajo convenio con proveedor.', 'ID: 97', 'ID: 97',
    'preventive', 'completed', 'medium',
    '2023-12-11',
    '2023-12-18',
    0, NULL,
    'PCLD.GDV.TCDL-02', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-23-12-00012: PCLD.GDV.TCDL-03 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022071', '00000000-0000-4000-b000-000000001123', NULL, 'WO-23-12-00012', 'Mantenimiento general de Caldera Dual de 800 BHP. #3. NRMT: 0702. Modelo: CB-600-800-150. Serial. OL-104266  Limpieza de lado de fuego Limpieza de lado de agua  Cambio de empaquetadura lado fuego Cambio de empaquetadura lado de aguas. Prueba hidrostaticas a 150 psi. Revicion de sistema de combustible F.O. Revición de ckt y elemetos electricos.  Costo por Servicio bajo convenio con proveedor.', 'ID: 98', 'ID: 98',
    'preventive', 'completed', 'medium',
    '2023-12-11',
    '2023-12-18',
    0, NULL,
    'PCLD.GDV.TCDL-03', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-23-12-00013: PCLD.GDV.TCDL-04 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022072', '00000000-0000-4000-b000-000000001124', NULL, 'WO-23-12-00013', 'Mantenimiento general de Caldera de 800 BHP. #4 NRMT: 0729. Modelo: CB-600-800-150. Serial. OL-104265.  Limpieza de lado de fuego Limpieza de lado de agua  Cambio de empaquetadura lado fuego Cambio de empaquetadura lado de aguas. Prueba hidrostaticas a 150 psi. Revicion de sistema de combustible F.O. Revición de ckt y elemetos electricos.  Costo por Servicio bajo convenio con proveedor.', 'ID: 99', 'ID: 99',
    'preventive', 'completed', 'medium',
    '2023-12-11',
    '2023-12-18',
    0, NULL,
    'PCLD.GDV.TCDL-04', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-01-00001: PCLD.GDV.TCDL-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022073', '00000000-0000-4000-b000-000000001121', NULL, 'WO-24-01-00001', 'Peritaje en Frio de Caldera Dual de 500 BHP. #1. NRMT: 0512. Modelo: CB-600-500-150. Serial. L-89643.  Prueba hidrostatica 150 psi. Pruebas de valvulas de seguridad . Incrustacion, Corrosionen el cuerpo. Revicion de columna de agua. Condicion de reguistros (Tortugas etc.). Esatado de tubo de calefaccion. Estado placa cuerpo. Estado de Compuertas. Estados de Refactarios. Estado de limpieza de caldera. Estado de soporteria y Base.  Costo por Servicio bajo convenio con proveedor.', 'ID: 101', 'ID: 101',
    'preventive', 'completed', 'medium',
    '2024-01-01',
    '2024-01-08',
    0, NULL,
    'PCLD.GDV.TCDL-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-01-00002: PCLD.GDV.TCDL-02 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022074', '00000000-0000-4000-b000-000000001122', NULL, 'WO-24-01-00002', 'Peritaje en Frio de Caldera Dual de 600 BHP. #2. NRMT: 0513. Modelo: WB-A2-3P. Serial. 17900P-WB00-01  Prueba hidrostatica 150 psi. Pruebas de valvulas de seguridad . Incrustacion, Corrosionen el cuerpo. Revicion de columna de agua. Condicion de reguistros (Tortugas etc.). Esatado de tubo de calefaccion. Estado placa cuerpo. Estado de Compuertas. Estados de Refactarios. Estado de limpieza de caldera. Estado de soporteria y Base.  Costo por Servicio bajo convenio con proveedor.', 'ID: 102', 'ID: 102',
    'preventive', 'completed', 'medium',
    '2024-01-01',
    '2024-01-08',
    0, NULL,
    'PCLD.GDV.TCDL-02', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-01-00003: PCLD.GDV.TCDL-03 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022075', '00000000-0000-4000-b000-000000001123', NULL, 'WO-24-01-00003', 'Peritaje en Frio de Caldera Dual de 800 BHP. #3. NRMT: 0702. Modelo: CB-600-800-150. Serial. OL-104266  Prueba hidrostatica 150 psi. Pruebas de valvulas de seguridad . Incrustacion, Corrosionen el cuerpo. Revicion de columna de agua. Condicion de reguistros (Tortugas etc.). Esatado de tubo de calefaccion. Estado placa cuerpo. Estado de Compuertas. Estados de Refactarios. Estado de limpieza de caldera. Estado de soporteria y Base.  Costo por Servicio bajo convenio con proveedor.', 'ID: 103', 'ID: 103',
    'preventive', 'completed', 'medium',
    '2024-01-01',
    '2024-01-08',
    0, NULL,
    'PCLD.GDV.TCDL-03', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-01-00004: PCLD.GDV.TCDL-04 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022076', '00000000-0000-4000-b000-000000001124', NULL, 'WO-24-01-00004', 'Peritaje en Frio de Caldera de 800 BHP. #4. NRMT: 0729 Modelo: CB-600-800-150. Serial. L-104265  Prueba hidrostatica 150 psi. Pruebas de valvulas de seguridad . Incrustacion, Corrosionen el cuerpo. Revicion de columna de agua. Condicion de reguistros (Tortugas etc.). Esatado de tubo de calefaccion. Estado placa cuerpo. Estado de Compuertas. Estados de Refactarios. Estado de limpieza de caldera. Estado de soporteria y Base.  Costo por Servicio bajo convenio con proveedor.', 'ID: 104', 'ID: 104',
    'preventive', 'completed', 'medium',
    '2024-01-01',
    '2024-01-08',
    0, NULL,
    'PCLD.GDV.TCDL-04', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-09-00011: SCI.CBCI.BCI-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022077', '00000000-0000-4000-b000-000000001125', '00000000-0000-4000-b000-000000055035', 'WO-24-09-00011', 'Mtto preventivo de motor 1 sistema contra incendios. costo segun cotizacion.', 'ID: 106', 'ID: 106',
    'preventive', 'completed', 'medium',
    '2024-09-12',
    '2024-09-19',
    1300.0, NULL,
    'SCI.CBCI.BCI-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-09-00012: PTAR1.AA.AE-11 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022078', '00000000-0000-4000-b000-000000001015', NULL, 'WO-24-09-00012', 'Aerador 11 regreso de mtto y se monto 24 de septiembre de 2024. el mtto fue unicamente preventivo y esta ubicado en posicion numero 3 fase de aereacion 1 planta 1.  SE DEJO TRABAJANDO CON APROBACIO DE PROVEEDOR YA QUE SE IDENTIFICARON PROBLEMAS EN  EL MOVIMIENTO DE CAJA REDUCTORA. EL PROVEEDOR SE HARA RESPONSABLE POR DAÑOS EN OPERACION', 'ID: 107', 'ID: 107',
    'preventive', 'completed', 'medium',
    '2024-09-23',
    '2024-09-30',
    0, NULL,
    'PTAR1.AA.AE-11', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-09-00013: PTAR1.AA.AE-06 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022079', '00000000-0000-4000-b000-000000001010', NULL, 'WO-24-09-00013', 'AERADOR 6 SE MONTO EL 24 DE SEPTIEMBRE DE 2024. ADEMAS DEL MTTO PREVENTIVO, TAMBIEN SE FABRICO PIÑON DE CAJA REDUCTORA. EQUIPO #6 ESTA MONTADO EN POSICION #6 FASE 2 PLANTA 1', 'ID: 108', 'ID: 108',
    'preventive', 'completed', 'medium',
    '2024-09-23',
    '2024-09-30',
    0, NULL,
    'PTAR1.AA.AE-06', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-22-12-00006: PTAR2.AA.MI-03 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022080', '00000000-0000-4000-b000-000000001040', NULL, 'WO-22-12-00006', 'Mtto preventivo de motor  7hp, incluye combio de rodamientos y revision de parametros electricos de motor.', 'ID: 109', 'ID: 109',
    'preventive', 'completed', 'medium',
    '2022-12-20',
    '2022-12-27',
    0, NULL,
    'PTAR2.AA.MI-03', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-10-00001: PTAR2.AA.MI-03 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022081', '00000000-0000-4000-b000-000000001040', NULL, 'WO-24-10-00001', 'Con personal de planta de tratamiento se le cambio cable alimentador de energia a mixer 3.', 'ID: 110', 'ID: 110',
    'preventive', 'completed', 'medium',
    '2024-09-26',
    '2024-10-03',
    0, NULL,
    'PTAR2.AA.MI-03', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-10-00002: PDO.ADO.BBI-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022082', '00000000-0000-4000-b000-000000001078', NULL, 'WO-24-10-00002', 'Mantenimiento preventivo y correctivo de,Motor y bomba 25 HP de área de ozono Motor de 25 HP Desmontaje y montaje de equipo Cambio de baleros Revisión de ajuste de baleros y rectificado si se necesita Limpieza y pintura catalizada Bomba Gorman Rupp Pumps Serie U Desmontaje y montaje de equipo Cambio de baleros y retenedores Revisión de ajuste de baleros y retenedor y rectificado si se necesita Cambio de aceite en la bomba Revisión de pista de sello mecánico Limpieza y pintura catalizada', 'ID: 111', 'ID: 111',
    'preventive', 'completed', 'medium',
    '2024-10-08',
    '2024-10-15',
    1325.0, NULL,
    'PDO.ADO.BBI-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-10-00003: PDO.ADO.BBI-02 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022083', '00000000-0000-4000-b000-000000001079', NULL, 'WO-24-10-00003', 'Mantenimiento preventivo y correctivo de,Motor y bomba 25 HP de área de ozono Motor de 25 HP Desmontaje y montaje de equipo Cambio de baleros Revisión de ajuste de baleros y rectificado si se necesita Limpieza y pintura catalizada Bomba Gorman Rupp Pumps Serie U Desmontaje y montaje de equipo Cambio de baleros y retenedores Revisión de ajuste de baleros y retenedor y rectificado si se necesita Cambio de aceite en la bomba Revisión de pista de sello mecánico Limpieza y pintura catalizada', 'ID: 112', 'ID: 112',
    'preventive', 'completed', 'medium',
    '2024-10-08',
    '2024-10-15',
    1325.0, NULL,
    'PDO.ADO.BBI-02', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-10-00004: PDO.ADO.BBI-03 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022084', '00000000-0000-4000-b000-000000001080', NULL, 'WO-24-10-00004', 'Mantenimiento preventivo y correctivo de,Motor y bomba 25 HP de área de ozono Motor de 25 HP Desmontaje y montaje de equipo Cambio de baleros Revisión de ajuste de baleros y rectificado si se necesita Limpieza y pintura catalizada Bomba Gorman Rupp Pumps Serie U Desmontaje y montaje de equipo Cambio de baleros y retenedores Revisión de ajuste de baleros y retenedor y rectificado si se necesita Cambio de aceite en la bomba Revisión de pista de sello mecánico Limpieza y pintura catalizada', 'ID: 113', 'ID: 113',
    'preventive', 'completed', 'medium',
    '2024-10-08',
    '2024-10-15',
    1325.0, NULL,
    'PDO.ADO.BBI-03', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-09-00014: PDO.ADO.BBI-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022085', '00000000-0000-4000-b000-000000001078', NULL, 'WO-24-09-00014', 'Se realizo mtto segun cotizado, se monto y la bomba trabajo sin problemas. aclarar que no se cambio sello.', 'ID: 114', 'ID: 114',
    'preventive', 'completed', 'medium',
    '2024-09-06',
    '2024-09-13',
    1325.0, NULL,
    'PDO.ADO.BBI-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-09-00015: PDO.ADO.BBI-02 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022086', '00000000-0000-4000-b000-000000001079', NULL, 'WO-24-09-00015', 'Se realizo mtto preventivo de  acuerdo a lo cotizado.', 'ID: 115', 'ID: 115',
    'preventive', 'completed', 'medium',
    '2024-08-30',
    '2024-09-06',
    1325.0, NULL,
    'PDO.ADO.BBI-02', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-10-00005: PDO.ADO.BBI-02 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022087', '00000000-0000-4000-b000-000000001079', NULL, 'WO-24-10-00005', 'se desmonto bobma por fuga de aceite, se hizo la ejecucion de la garantia ya que habia sido recibida de mtto', 'ID: 116', 'ID: 116',
    'corrective', 'completed', 'medium',
    '2024-09-29',
    '2024-10-01',
    0.0, NULL,
    'PDO.ADO.BBI-02', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-23-12-00014: PTAR2.DOC.ESL-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022088', '00000000-0000-4000-b000-000000001065', '00000000-0000-4000-b000-000000055024', 'WO-23-12-00014', 'Mantenimiento caja reductora, motor, ademas de mantenimiento de piñon o corona de transmision, cambio de rodamiento(tipo esferas) dañados. limpieza  restauracion de puente removedor.', 'ID: 117', 'ID: 117',
    'preventive', 'completed', 'medium',
    '2023-12-20',
    '2023-12-27',
    0, NULL,
    'PTAR2.DOC.ESL-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-10-00006: PTAR1.AA.AE-11 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022089', '00000000-0000-4000-b000-000000001015', NULL, 'WO-24-10-00006', 'Se desmoto aerador el 1 de octubre de 2024 para corregir falla en alineamiento de caja y motor. producido por lo el desajusto en el aprete del flange de punta grande.', 'ID: 118', 'ID: 118',
    'corrective', 'completed', 'medium',
    '2024-09-29',
    '2024-10-01',
    0.0, NULL,
    'PTAR1.AA.AE-11', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-08-00002: PTAR1.AA.AE-14 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022090', '00000000-0000-4000-b000-000000001018', NULL, 'WO-24-08-00002', 'Se monto AE 14 en posicion 1 se monto el 7 de agosto de 2024.', 'ID: 119', 'ID: 119',
    'preventive', 'completed', 'medium',
    '2024-07-31',
    '2024-08-07',
    0.0, NULL,
    'PTAR1.AA.AE-14', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-12-00001: SCI.CBCI.BCI-02 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022091', '00000000-0000-4000-b000-000000001126', '00000000-0000-4000-b000-000000055036', 'WO-24-12-00001', 'Mantenimiento preventivo motor 2, incluye inspeccion de parametros electricos.', 'ID: 120', 'ID: 120',
    'preventive', 'completed', 'medium',
    '2024-11-26',
    '2024-12-03',
    1300.0, NULL,
    'SCI.CBCI.BCI-02', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-01-00001: PTAR1.AA.AE-06 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022092', '00000000-0000-4000-b000-000000001010', NULL, 'WO-25-01-00001', 'Equipo 6 posicion 6 se realizo reclamo por garantia al proveedor debido a fuga de aceite en eje de punta grande. al montento de la inspeccion se destapo la caja reductora y se encontro piñon dañado. este piñon fue el fabricado en el mtto anterior. la fecha anterior de montaje fue el 24 de septiembre. por lo que se hizo el reclamo por garantia.', 'ID: 121', 'ID: 121',
    'corrective', 'completed', 'medium',
    '2025-01-07',
    '2025-01-09',
    10705.0, '00000000-0000-4000-b000-000000010000',
    'PTAR1.AA.AE-06', 'SIMD',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-01-00002: PTAR1.AA.AE-14 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022093', '00000000-0000-4000-b000-000000001018', NULL, 'WO-25-01-00002', 'El dia 6 de enero de 2025 en la inspeccion rutinaria de equipos de planta de tratamiento. se encontro que el buje de bronce se habia aflojado  provcando que la punta grande se saliera de su eje. el proveedor se hara responble por garantia de la reparacion.  el proveedor es taller solme.', 'ID: 122', 'ID: 122',
    'corrective', 'completed', 'medium',
    '2025-01-07',
    '2025-01-09',
    0.0, NULL,
    'PTAR1.AA.AE-14', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-01-00003: PTAR1.AA.AE-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022094', '00000000-0000-4000-b000-000000001005', NULL, 'WO-25-01-00003', 'EDITequipo habia sido montado en diciembre de 2023. se  saco en octubre 2024.  por quebradura de flange de punta grande. el equipo en su momento fue trabajado por simd. se esta a la espera de cotizacion para la reparacion.', 'ID: 123', 'ID: 123',
    'preventive', 'completed', 'medium',
    '2025-01-02',
    '2025-01-09',
    0, NULL,
    'PTAR1.AA.AE-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-01-00004: PTAR1.AA.AE-09 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022095', '00000000-0000-4000-b000-000000001013', NULL, 'WO-25-01-00004', 'equipo se saco noviembre por fallos en buje de bronce desacoplado. sin embargo al momento de sacarlo se encontro flange quebrado. ademas el proveedor se lo llevo para revision en taller.', 'ID: 124', 'ID: 124',
    'corrective', 'completed', 'medium',
    '2025-01-07',
    '2025-01-09',
    6995.0, '00000000-0000-4000-b000-000000010000',
    'PTAR1.AA.AE-09', 'SIMD',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-12-00002: PCLD.GDV.TCDL-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022096', '00000000-0000-4000-b000-000000001121', NULL, 'WO-24-12-00002', 'Mantenimiento General. Caldera Dual de 500 BHP. #1. NRMT: 0512. Modelo: CB-600-500-150. Serial. L-89643.  Mantenimiento anual de caldera: Lavado de lado de fuego. lavado de lado de agua. Cambio de fibre ceramica de compuerta intermedia. Resane de refrectario de compuerta de trasera. Resane de Horno. Limpieza de Caja de viscosidad. Cambio de empaquetadura lado de fuego. Cambio de empaquetadura lado de agua. Limpieza de Calentador combustible lado de Vapor. Limpieza de Calentador combustible lado ', 'ID: 125', 'ID: 125',
    'preventive', 'completed', 'medium',
    '2024-12-10',
    '2024-12-17',
    0, NULL,
    'PCLD.GDV.TCDL-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-12-00003: PCLD.GDV.TCDL-02 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022097', '00000000-0000-4000-b000-000000001122', NULL, 'WO-24-12-00003', 'Mantenimiento General Caldera Dual de 600 BHP. #2. NRMT: 0513. Modelo: WB-A2-3P. Serial. 17900P-WB00-01  Mantenimiento anual de caldera: Lavado de lado de fuego. lavado de lado de agua. Resane de Horno. Cambio de empaquetadura lado de fuego. Cambio de empaquetadura lado de agua. Limpieza de Calentador combustible lado de Vapor. Limpieza de Calentador combustible lado de Electrico. Limpieza de sensor de nivel de operacion de la caldera. Limpieza de electrodo de nivel bajo. Limpieza de quemador de', 'ID: 126', 'ID: 126',
    'preventive', 'completed', 'medium',
    '2024-12-10',
    '2024-12-17',
    0, NULL,
    'PCLD.GDV.TCDL-02', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-12-00004: PCLD.GDV.TCDL-03 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022098', '00000000-0000-4000-b000-000000001123', NULL, 'WO-24-12-00004', 'Mantenimiento General. Caldera Dual de 800 BHP. #3. NRMT: 0702. Modelo: CB-600-800-150. Serial. OL-104266  Mantenimiento anual de caldera: Lavado de lado de fuego. lavado de lado de agua. Cambio de fibre ceramica de compuerta intermedia. Resane de refrectario de compuerta de trasera. Resane de Horno. Limpieza de Caja de viscosidad. Cambio de empaquetadura lado de fuego. Cambio de empaquetadura lado de agua. Limpieza de Calentador combustible lado de Vapor. Limpieza de Calentador combustible lado', 'ID: 127', 'ID: 127',
    'preventive', 'completed', 'medium',
    '2024-12-10',
    '2024-12-17',
    0, NULL,
    'PCLD.GDV.TCDL-03', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-12-00005: PCLD.GDV.TCDL-04 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022099', '00000000-0000-4000-b000-000000001124', NULL, 'WO-24-12-00005', 'Mantenimiento General. Caldera de 800 BHP. #4. NRMT: 0729 Modelo: CB-600-800-150. Serial. L-104265  Mantenimiento anual de caldera: Lavado de lado de fuego. lavado de lado de agua. Cambio de fibre ceramica de compuerta intermedia. Resane de refrectario de compuerta de trasera. Resane de Horno. Limpieza de Caja de viscosidad. Cambio de empaquetadura lado de fuego. Cambio de empaquetadura lado de agua. Limpieza de Calentador combustible lado de Vapor. Limpieza de Calentador combustible lado de Ele', 'ID: 128', 'ID: 128',
    'preventive', 'completed', 'medium',
    '2024-12-10',
    '2024-12-17',
    0, NULL,
    'PCLD.GDV.TCDL-04', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-12-00006: PCLD.GLP.VAP-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022100', '00000000-0000-4000-b000-000000001137', NULL, 'WO-24-12-00006', 'Mantenimiento de Unidades de vaporización de GLP, perteneciente a Tropigas de El Salvador.', 'ID: 130', 'ID: 130',
    'preventive', 'completed', 'medium',
    '2024-12-16',
    '2024-12-23',
    0, NULL,
    'PCLD.GLP.VAP-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-01-00005: PCLD.GLP.VAP-01 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022101', '00000000-0000-4000-b000-000000001137', NULL, 'WO-25-01-00005', 'Corrección de fallas de unidades vaporizadores de GLP, el cual por mala manipulación en el momento de realizar el cambio de uso de tanque LP, se cerró válvula de flujo, el cual produjo que la tubería se congelara así como las unidades vaporadoras.', 'ID: 131', 'ID: 131',
    'corrective', 'completed', 'medium',
    '2025-01-04',
    '2025-01-06',
    0, NULL,
    'PCLD.GLP.VAP-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-12-00007: PCLD.GLP.TAN-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022102', '00000000-0000-4000-b000-000000001147', NULL, 'WO-24-12-00007', 'Mantenimiento e inspección de tanque de LP perteneciente de Tropigas de El Salvador.', 'ID: 132', 'ID: 132',
    'preventive', 'completed', 'medium',
    '2024-12-16',
    '2024-12-23',
    0, NULL,
    'PCLD.GLP.TAN-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-01-00006: PCLD.GDV.TCDL-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022103', '00000000-0000-4000-b000-000000001121', NULL, 'WO-25-01-00006', 'Reporte gases ambientales de caldera 1 Caldera Dual de 500 BHP. #1. NRMT: 0512. Modelo: CB-600-500-150. Serial. L-89643.', 'ID: 133', 'ID: 133',
    'preventive', 'completed', 'medium',
    '2025-01-03',
    '2025-01-10',
    0, NULL,
    'PCLD.GDV.TCDL-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-01-00007: PCLD.GDV.TCDL-03 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022104', '00000000-0000-4000-b000-000000001123', NULL, 'WO-25-01-00007', 'Reporte de Gases Ambientales de #3 Caldera Dual de 800 BHP. #3. NRMT: 0702. Modelo: CB-600-800-150. Serial. OL-104266', 'ID: 134', 'ID: 134',
    'preventive', 'completed', 'medium',
    '2025-01-03',
    '2025-01-10',
    0, NULL,
    'PCLD.GDV.TCDL-03', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-01-00008: PCLD.GDV.TCDL-04 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022105', '00000000-0000-4000-b000-000000001124', NULL, 'WO-25-01-00008', 'Reporte de Gases ambientales  Caldera de 800 BHP. #4. NRMT: 0729 Modelo: CB-600-800-150. Serial. L-104265', 'ID: 135', 'ID: 135',
    'preventive', 'completed', 'medium',
    '2025-01-03',
    '2025-01-10',
    0, NULL,
    'PCLD.GDV.TCDL-04', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-01-00009: PCLD.GDV.TCDL-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022106', '00000000-0000-4000-b000-000000001121', NULL, 'WO-25-01-00009', 'Reporte de Particulas Totales Suspendica (PTS) de caldera 1, 3, 4 .  Enero 2025.  Caldera Dual de 500 BHP. #1. NRMT: 0512. Modelo: CB-600-500-150. Serial. L-89643.  Caldera Dual de 800 BHP. #3. NRMT: 0702. Modelo: CB-600-800-150. Serial. OL-104266  Caldera de 800 BHP. #4. NRMT: 0729 Modelo: CB-600-800-150. Serial. L-104265', 'ID: 136', 'ID: 136',
    'preventive', 'completed', 'medium',
    '2025-01-03',
    '2025-01-10',
    0, NULL,
    'PCLD.GDV.TCDL-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-01-00010: PCLD.GLP.TAN-01 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022107', '00000000-0000-4000-b000-000000001147', NULL, 'WO-25-01-00010', 'Tropiga de El Salvador llevo a cabo la instalación de una barda para delimitacion de taque trampa de liquido, asi como la rotulacion de Valvulas de entrada y salida de tanque de LP 10,500 Galones, 14,000 Galones.', 'ID: 137', 'ID: 137',
    'corrective', 'completed', 'medium',
    '2025-01-27',
    '2025-01-29',
    0, NULL,
    'PCLD.GLP.TAN-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-12-00008: PTAR1.DOC.CLR-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022108', '00000000-0000-4000-b000-000000001031', '00000000-0000-4000-b000-000000055016', 'WO-24-12-00008', 'Mantenimiento preventivo y correctivo de clarificador  1, inlcuye cambio de rodamientos y sellos de caja reductora . ademas de baleros de puente. Tambien se cambiaron las esferas de la caja reductora central. Ademas se realizo la limpieza interior y sustitucion de rodos de puente.', 'ID: 138', 'ID: 138',
    'preventive', 'completed', 'medium',
    '2024-12-23',
    '2024-12-30',
    17790.0, '00000000-0000-4000-b000-000000010000',
    'PTAR1.DOC.CLR-01', 'SIMD',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-01-00011: PCLD.GDV.TCDL-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022109', '00000000-0000-4000-b000-000000001121', NULL, 'WO-25-01-00011', 'Peritaje en Frio de Caldera Dual de 500 BHP. #1. NRMT: 0512. Modelo: CB-600-500-150. Serial. L-89643.  Prueba hidrostatica 150 psi. Pruebas de valvulas de seguridad . Incrustacion, Corrosionen el cuerpo. Revicion de columna de agua. Condicion de reguistros (Tortugas etc.). Esatado de tubo de calefaccion. Estado placa cuerpo. Estado de Compuertas. Estados de Refactarios. Estado de limpieza de caldera. Estado de soporteria y Base.  Costo por Servicio bajo convenio con proveedor.', 'ID: 141', 'ID: 141',
    'preventive', 'completed', 'medium',
    '2024-12-31',
    '2025-01-07',
    0, NULL,
    'PCLD.GDV.TCDL-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-01-00012: PCLD.GDV.TCDL-02 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022110', '00000000-0000-4000-b000-000000001122', NULL, 'WO-25-01-00012', 'Peritaje en Frio de Caldera Dual de 600 BHP. #2. NRMT: 0513. Modelo: WB-A2-3P. Serial. 17900P-WB00-01  Prueba hidrostatica 150 psi. Pruebas de valvulas de seguridad . Incrustacion, Corrosionen el cuerpo. Revicion de columna de agua. Condicion de reguistros (Tortugas etc.). Esatado de tubo de calefaccion. Estado placa cuerpo. Estado de Compuertas. Estados de Refactarios. Estado de limpieza de caldera. Estado de soporteria y Base.  Costo por Servicio bajo convenio con proveedor.', 'ID: 142', 'ID: 142',
    'preventive', 'completed', 'medium',
    '2024-12-31',
    '2025-01-07',
    0, NULL,
    'PCLD.GDV.TCDL-02', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-02-00001: PCLD.GDV.TCDL-03 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022111', '00000000-0000-4000-b000-000000001123', NULL, 'WO-25-02-00001', 'Peritaje en Frio de Caldera Dual de 800 BHP. #3. NRMT: 0702. Modelo: CB-600-800-150. Serial. OL-104266  Prueba hidrostatica 150 psi. Pruebas de valvulas de seguridad . Incrustacion, Corrosionen el cuerpo. Revicion de columna de agua. Condicion de reguistros (Tortugas etc.). Esatado de tubo de calefaccion. Estado placa cuerpo. Estado de Compuertas. Estados de Refactarios. Estado de limpieza de caldera. Estado de soporteria y Base.  Costo por Servicio bajo convenio con proveedor.', 'ID: 143', 'ID: 143',
    'preventive', 'completed', 'medium',
    '2025-02-03',
    '2025-02-10',
    0, NULL,
    'PCLD.GDV.TCDL-03', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-01-00013: PCLD.GDV.TCDL-04 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022112', '00000000-0000-4000-b000-000000001124', NULL, 'WO-25-01-00013', 'Peritaje en Frio de Caldera de 800 BHP. #4. NRMT: 0729 Modelo: CB-600-800-150. Serial. L-104265  Prueba hidrostatica 150 psi. Pruebas de valvulas de seguridad . Incrustacion, Corrosionen el cuerpo. Revicion de columna de agua. Condicion de reguistros (Tortugas etc.). Esatado de tubo de calefaccion. Estado placa cuerpo. Estado de Compuertas. Estados de Refactarios. Estado de limpieza de caldera. Estado de soporteria y Base.  Costo por Servicio bajo convenio con proveedor.', 'ID: 144', 'ID: 144',
    'preventive', 'completed', 'medium',
    '2024-12-31',
    '2025-01-07',
    0, NULL,
    'PCLD.GDV.TCDL-04', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-10-00007: SB.46kV.TX-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022113', '00000000-0000-4000-b000-000000001127', '00000000-0000-4000-b000-000000055037', 'WO-24-10-00007', 'Gases altos pero no peligrosos, desgasificar rotundamente en diciembre de 2025 NOEDIT', 'ID: 151', 'ID: 151',
    'preventive', 'completed', 'medium',
    '2024-10-20',
    '2024-10-27',
    1800.0, NULL,
    'SB.46kV.TX-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-02-00002: INF.CIV.MUR-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022114', '00000000-0000-4000-b000-000000001164', NULL, 'WO-25-02-00002', 'Mantenimiento de cerca eléctrica de Sitio. Mes de Febrero Zonas 1 hasta Zona 8. Limpieza de maleza. Revisión de chispa. Revisión de bateria. Revisión de sirena. Repáracion de lineas.', 'ID: 157', 'ID: 157',
    'preventive', 'completed', 'medium',
    '2025-02-18',
    '2025-02-25',
    325.0, '00000000-0000-4000-b000-000000010002',
    'INF.CIV.MUR-01', 'JV Sistemas',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-04-00001: SB.46kV.LIN-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022115', '00000000-0000-4000-b000-000000001165', NULL, 'WO-25-04-00001', 'Auditoria Anual SIMEC. 2025 HanesBrands Etesal Opico. INT. 38-4-83. Plano esquemático. Plano unifilar. configuración de medidores. Pruebas de los TP. Pruebas de los Tc. Prueba de potencia. Prueba de Comunicacion.', 'ID: 158', 'ID: 158',
    'preventive', 'completed', 'medium',
    '2025-04-04',
    '2025-04-11',
    1300.0, NULL,
    'SB.46kV.LIN-01', 'nan',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-04-00002: SB.46kV.TC-04 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022116', '00000000-0000-4000-b000-000000001134', NULL, 'WO-25-04-00002', 'TCs. de San Juan Opico. Informe de pruebas electricas a Tranformadores de Corriente. Sadtem. Serie 678017, Face A. Serie 678018, Face B. Serie 678019, Face C. Costo por prueba y montage.', 'ID: 159', 'ID: 159',
    'preventive', 'completed', 'medium',
    '2025-04-01',
    '2025-04-08',
    2200.0, '00000000-0000-4000-b000-000000010003',
    'SB.46kV.TC-04', 'Energy',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-04-00003: SB.46kV.TC-04 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022117', '00000000-0000-4000-b000-000000001134', NULL, 'WO-25-04-00003', 'Auditoria Anual SIMEC_11_ABRIL_2025. INT. 38-4-83. Plano Esquemático. Plano Unifilar. Configuración de Medidores. Pruebas de TC. Pruebas de TP. Prueba de potencia. Pruebas de comunicaciones.', 'ID: 161', 'ID: 161',
    'preventive', 'completed', 'medium',
    '2025-04-04',
    '2025-04-11',
    1300.0, NULL,
    'SB.46kV.TC-04', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-23-12-00015: SB.46kV.TX-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022118', '00000000-0000-4000-b000-000000001127', '00000000-0000-4000-b000-000000055037', 'WO-23-12-00015', 'DIAGNOSTICO Y MONITOREO DE ACEITE DIELÉCTRICO. a) Número de neutralización ó acidez ASTM D974b.  b) ITF o Tensión Interfacial ASTM D971c.  c) Rigidez dieléctrica ASTM D877d.  d) Color ASTM D1500e.  e) Examen Visual ASTM DT154f.  f) Gravedad Específica ASTM D1298h.  g) Humedad (KF) ASTM D 1533I.  h) DGA Cromatografía Gases Disueltos (ASTM D 3612)j.  i) Contenido de furanos (ASTM D5837)k.  j) RIGIDEZ DIELECTRICA ASTM D1816', 'ID: 162', 'ID: 162',
    'preventive', 'completed', 'medium',
    '2023-12-12',
    '2023-12-19',
    0, '00000000-0000-4000-b000-000000010004',
    'SB.46kV.TX-01', 'Cideca',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-10-00008: SB.23KV.INT-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022119', '00000000-0000-4000-b000-000000001162', NULL, 'WO-24-10-00008', 'Mantenimiento de Celdas MT, ABB, con interruptor en vacío Extraíbles Prueba de resistencia de aislamiento. prueba de resistencia de Óhmica de Bobinas. Pruebas de apertura y Cierre. Limpieza lubricación y apreté conexiones', 'ID: 163', 'ID: 163',
    'preventive', 'completed', 'medium',
    '2024-10-20',
    '2024-10-27',
    1800.0, NULL,
    'SB.23KV.INT-01', 'nan',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-10-00009: SB.46kV.TX-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022120', '00000000-0000-4000-b000-000000001127', '00000000-0000-4000-b000-000000055037', 'WO-24-10-00009', 'Servicio de Mantenimiento preventivo a celda de media tención. Marca ABB. Pruebas de resistencia de aislamiento Pruebas de Resistencia Óhmica de contactos Pruebas de Apertura y cierre Limpieza y lubricación', 'ID: 169', 'ID: 169',
    'preventive', 'completed', 'medium',
    '2024-10-20',
    '2024-10-27',
    0, NULL,
    'SB.46kV.TX-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-10-00010: SB.46kV.INT-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022121', '00000000-0000-4000-b000-000000001129', '00000000-0000-4000-b000-000000055039', 'WO-24-10-00010', 'Recarga de gas SF6 a Interruptor de potencia. Subestación principal. Detención de fuga de gas SF6.', 'ID: 170', 'ID: 170',
    'preventive', 'completed', 'medium',
    '2024-10-20',
    '2024-10-27',
    1275.0, NULL,
    'SB.46kV.INT-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-03-00001: PTAR2.AA.AE-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022122', '00000000-0000-4000-b000-000000001042', NULL, 'WO-25-03-00001', 'Mantenimiento preventivo aereador 1 planta 1.  inlcuye mantenminento de caja reductora y motor .  agergar caja reductora presento problemas -.', 'ID: 171', 'ID: 171',
    'preventive', 'completed', 'medium',
    '2025-03-14',
    '2025-03-21',
    0, '00000000-0000-4000-b000-000000010001',
    'PTAR2.AA.AE-01', 'Taller Hernandez',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-03-00002: PTAR1.AA.AE-01 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022123', '00000000-0000-4000-b000-000000001005', NULL, 'WO-25-03-00002', 'Mantemiento correctivo inlcuye soldadora de punta de eje, motor, cambio de chumaceras y piñon de caja .', 'ID: 172', 'ID: 172',
    'corrective', 'completed', 'medium',
    '2025-03-23',
    '2025-03-25',
    7000.0, '00000000-0000-4000-b000-000000010001',
    'PTAR1.AA.AE-01', 'Taller Hernandez',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-05-00001: PDO.ADO.BBI-03 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022124', '00000000-0000-4000-b000-000000001080', NULL, 'WO-25-05-00001', 'Se hizo reclamo por fuga de aciete debido a falla de retenedor. se solvento , bomba actualmente trabajando con normalidad.', 'ID: 174', 'ID: 174',
    'preventive', 'completed', 'medium',
    '2025-05-02',
    '2025-05-09',
    0, NULL,
    'PDO.ADO.BBI-03', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-05-00002: PDO.AEC.CTR-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022125', '00000000-0000-4000-b000-000000001069', '00000000-0000-4000-b000-000000055028', 'WO-25-05-00002', 'Se realizo mtto preventivo programado para  compresores de area de ozono', 'ID: 175', 'ID: 175',
    'preventive', 'completed', 'medium',
    '2025-05-16',
    '2025-05-23',
    0, '00000000-0000-4000-b000-000000010005',
    'PDO.AEC.CTR-01', 'Kaeser',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-05-00003: PDO.AEC.CTR-02 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022126', '00000000-0000-4000-b000-000000001070', '00000000-0000-4000-b000-000000055029', 'WO-25-05-00003', 'Mtto preventivo programado', 'ID: 176', 'ID: 176',
    'preventive', 'completed', 'medium',
    '2025-05-16',
    '2025-05-23',
    0, '00000000-0000-4000-b000-000000010005',
    'PDO.AEC.CTR-02', 'Kaeser',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-22-12-00007: PSVZ.EXT.POZ-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022127', '00000000-0000-4000-b000-000000001167', NULL, 'WO-22-12-00007', 'mantenimiento preventivo pozo 1, se econtro roturas  en columna de succion , se trabaja en menos revoluciones.', 'ID: 177', 'ID: 177',
    'preventive', 'completed', 'medium',
    '2022-12-12',
    '2022-12-19',
    3700.0, '00000000-0000-4000-b000-000000010006',
    'PSVZ.EXT.POZ-01', 'MAPOSA',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-23-03-00001: PSVZ.EXT.POZ-02 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022128', '00000000-0000-4000-b000-000000001168', NULL, 'WO-23-03-00001', 'se cambio a bomba de 50 hp con la empresa hidrotec por un monto de 1500, un año antes se le dio mtto preventivo completo con maposa.', 'ID: 178', 'ID: 178',
    'preventive', 'completed', 'medium',
    '2023-03-07',
    '2023-03-14',
    4900.0, '00000000-0000-4000-b000-000000010006',
    'PSVZ.EXT.POZ-02', 'MAPOSA',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-12-00009: PSVZ.EXT.POZ-03 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022129', '00000000-0000-4000-b000-000000001169', NULL, 'WO-24-12-00009', 'mtto preventivo pozo 3', 'ID: 179', 'ID: 179',
    'preventive', 'completed', 'medium',
    '2024-12-16',
    '2024-12-23',
    3000.0, '00000000-0000-4000-b000-000000010006',
    'PSVZ.EXT.POZ-03', 'MAPOSA',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-12-00010: PSVZ.EXT.POZ-04 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022130', '00000000-0000-4000-b000-000000001170', NULL, 'WO-24-12-00010', 'Se dio mtto  preventivo a pozo 4', 'ID: 180', 'ID: 180',
    'preventive', 'completed', 'medium',
    '2024-12-12',
    '2024-12-19',
    4800.0, '00000000-0000-4000-b000-000000010006',
    'PSVZ.EXT.POZ-04', 'MAPOSA',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-06-00001: PSVZ.EXT.POZ-05 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022131', '00000000-0000-4000-b000-000000001171', NULL, 'WO-25-06-00001', 'Mantenimiento preventivo de pozo', 'ID: 181', 'ID: 181',
    'preventive', 'completed', 'medium',
    '2025-05-27',
    '2025-06-03',
    3700.0, '00000000-0000-4000-b000-000000010006',
    'PSVZ.EXT.POZ-05', 'MAPOSA',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-12-00011: PTAR1.AA.MI-02 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022132', '00000000-0000-4000-b000-000000001020', '00000000-0000-4000-b000-000000055005', 'WO-24-12-00011', 'Rebobinado de mixer 20  hp.', 'ID: 182', 'ID: 182',
    'corrective', 'completed', 'medium',
    '2024-12-18',
    '2024-12-20',
    1080.0, '00000000-0000-4000-b000-000000010001',
    'PTAR1.AA.MI-02', 'Taller Hernandez',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-22-12-00008: PSVZ.EXT.POZ-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022133', '00000000-0000-4000-b000-000000001167', NULL, 'WO-22-12-00008', 'Mantenimiento preventivo pozos de explotacion,', 'ID: 185', 'ID: 185',
    'preventive', 'completed', 'medium',
    '2022-12-09',
    '2022-12-16',
    3700.0, '00000000-0000-4000-b000-000000010006',
    'PSVZ.EXT.POZ-01', 'MAPOSA',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-09-00016: PTAR1.AA.MI-08 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022134', '00000000-0000-4000-b000-000000001026', '00000000-0000-4000-b000-000000055011', 'WO-24-09-00016', 'Se dio mtto preventivo ademas se cambio plato fijador.', 'ID: 186', 'ID: 186',
    'preventive', 'completed', 'medium',
    '2024-09-20',
    '2024-09-27',
    1695.0, '00000000-0000-4000-b000-000000010001',
    'PTAR1.AA.MI-08', 'Taller Hernandez',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-12-00012: PTAR1.AA.MI-09 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022135', '00000000-0000-4000-b000-000000001027', '00000000-0000-4000-b000-000000055012', 'WO-24-12-00012', 'Se dio mantenimiento preventivo que incluye cambio de rodamientos y reparación de cuerpo de flotador, además se rebobino', 'ID: 187', 'ID: 187',
    'corrective', 'completed', 'medium',
    '2024-12-10',
    '2024-12-12',
    2425.0, '00000000-0000-4000-b000-000000010001',
    'PTAR1.AA.MI-09', 'Taller Hernandez',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-02-00003: PSVZ.EXT.POZ-03 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022136', '00000000-0000-4000-b000-000000001169', NULL, 'WO-25-02-00003', 'Sustitucion de cable de alimentacion electrica y cambio de bomba.', 'ID: 188', 'ID: 188',
    'preventive', 'completed', 'medium',
    '2025-02-10',
    '2025-02-17',
    1500.0, '00000000-0000-4000-b000-000000010006',
    'PSVZ.EXT.POZ-03', 'MAPOSA',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-03-00003: PSVZ.CTN.BBS-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022137', '00000000-0000-4000-b000-000000001084', NULL, 'WO-25-03-00003', 'Fabriacacion de masas y cambio de acople de bomba 1.', 'ID: 191', 'ID: 191',
    'preventive', 'completed', 'medium',
    '2025-03-10',
    '2025-03-17',
    1405.0, '00000000-0000-4000-b000-000000010001',
    'PSVZ.CTN.BBS-01', 'Taller Hernandez',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-03-00004: PSVZ.CTN.BBS-02 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022138', '00000000-0000-4000-b000-000000001085', NULL, 'WO-25-03-00004', 'Fabriacion y cambio de acople bomba 125 #2', 'ID: 192', 'ID: 192',
    'preventive', 'completed', 'medium',
    '2025-03-11',
    '2025-03-18',
    1405.0, '00000000-0000-4000-b000-000000010001',
    'PSVZ.CTN.BBS-02', 'Taller Hernandez',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-01-00014: PSVZ.SVDR.BTS-03 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022139', '00000000-0000-4000-b000-000000001089', NULL, 'WO-25-01-00014', 'se dio mtto preventivo motor y bomba    3', 'ID: 193', 'ID: 193',
    'preventive', 'completed', 'medium',
    '2025-01-06',
    '2025-01-13',
    2250.0, '00000000-0000-4000-b000-000000010001',
    'PSVZ.SVDR.BTS-03', 'Taller Hernandez',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-06-00002: PSVZ.CTN.BBS-03 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022140', '00000000-0000-4000-b000-000000001086', NULL, 'WO-25-06-00002', 'MTTO PREVENTIVO BOMBA 3', 'ID: 195', 'ID: 195',
    'preventive', 'completed', 'medium',
    '2025-06-03',
    '2025-06-10',
    2250.0, '00000000-0000-4000-b000-000000010001',
    'PSVZ.CTN.BBS-03', 'Taller Hernandez',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-01-00015: PTAR2.DOC.CLR-01 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022141', '00000000-0000-4000-b000-000000001064', '00000000-0000-4000-b000-000000055023', 'WO-25-01-00015', 'Rebobinado y cambio de baleros de emergencia.', 'ID: 196', 'ID: 196',
    'corrective', 'completed', 'medium',
    '2025-01-28',
    '2025-01-30',
    825.0, '00000000-0000-4000-b000-000000010001',
    'PTAR2.DOC.CLR-01', 'Taller Hernandez',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-10-00011: SB.23KV.INT-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022142', '00000000-0000-4000-b000-000000001162', NULL, 'WO-24-10-00011', 'Mantenimiento de Celdas V/P 24.12.20 Marca ABB. • Prueba de resistencia de aislamiento • Prueba de resistencia óhmica de contactos principales • Pruebas de apertura y cierre de los equipos • Limpieza lubricación y apreté conexiones', 'ID: 197', 'ID: 197',
    'preventive', 'completed', 'medium',
    '2024-10-20',
    '2024-10-27',
    1800.0, NULL,
    'SB.23KV.INT-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-03-00005: SCI.CBCI.BCI-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022143', '00000000-0000-4000-b000-000000001125', '00000000-0000-4000-b000-000000055035', 'WO-25-03-00005', 'Se cambiaron baleros de driver  motor contra incendios 1.', 'ID: 198', 'ID: 198',
    'preventive', 'completed', 'medium',
    '2025-03-08',
    '2025-03-15',
    2225.0, '00000000-0000-4000-b000-000000010001',
    'SCI.CBCI.BCI-01', 'Taller Hernandez',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-03-00006: PTAR2.AA.AE-08 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022144', '00000000-0000-4000-b000-000000001049', NULL, 'WO-25-03-00006', 'mtto preventivo que incluye cambio de rodamientos, pintura, y medicion de parametros electricos.', 'ID: 199', 'ID: 199',
    'preventive', 'completed', 'medium',
    '2025-02-24',
    '2025-03-03',
    1406.0, '00000000-0000-4000-b000-000000010001',
    'PTAR2.AA.AE-08', 'Taller Hernandez',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-03-00007: PTAR2.AA.AE-09 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022145', '00000000-0000-4000-b000-000000001050', NULL, 'WO-25-03-00007', 'mtto preventivo que incluye cambio de rodamientos, pintura, y medicion de parametros electricos.', 'ID: 200', 'ID: 200',
    'preventive', 'completed', 'medium',
    '2025-02-26',
    '2025-03-05',
    1408.0, '00000000-0000-4000-b000-000000010001',
    'PTAR2.AA.AE-09', 'Taller Hernandez',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-05-00004: SB.23KV.LIN-01 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022146', '00000000-0000-4000-b000-000000001166', NULL, 'WO-25-05-00004', 'Reporte de actividades CIDECA 01 al 15 de Mayo -Inspección y poda de línea de distribución de 23 kV -Actividades de mantenimiento en acometidas primarias de 23 kV', 'ID: 201', 'ID: 201',
    'corrective', 'completed', 'medium',
    '2025-05-14',
    '2025-05-16',
    0, NULL,
    'SB.23KV.LIN-01', 'nan',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-05-00005: SB.23KV.LIN-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022147', '00000000-0000-4000-b000-000000001166', NULL, 'WO-25-05-00005', 'Reporte de actividades CIDECA 16 al 31 de Abril -Inspección y poda de línea de distribución de 23 kV -Actividades de mantenimiento en acometidas primarias de 23 kV', 'ID: 202', 'ID: 202',
    'preventive', 'completed', 'medium',
    '2025-04-24',
    '2025-05-01',
    0, '00000000-0000-4000-b000-000000010004',
    'SB.23KV.LIN-01', 'Cideca',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-06-00003: SB.23KV.LIN-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022148', '00000000-0000-4000-b000-000000001166', NULL, 'WO-25-06-00003', 'Reporte de actividades CIDECA 16 al 31 de Mayo -Inspección y poda de línea de distribución de 23 kV -Actividades de mantenimiento en acometidas primarias de 23 kV', 'ID: 203', 'ID: 203',
    'preventive', 'completed', 'medium',
    '2025-05-25',
    '2025-06-01',
    0, '00000000-0000-4000-b000-000000010004',
    'SB.23KV.LIN-01', 'Cideca',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-04-00004: SB.23KV.LIN-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022149', '00000000-0000-4000-b000-000000001166', NULL, 'WO-25-04-00004', 'Reporte de actividades CIDECA 01 al 15 de Abril -Inspección y poda de línea de distribución de 23 kV -Actividades de mantenimiento en acometidas primarias de 23 kV', 'ID: 204', 'ID: 204',
    'preventive', 'completed', 'medium',
    '2025-04-09',
    '2025-04-16',
    0, '00000000-0000-4000-b000-000000010004',
    'SB.23KV.LIN-01', 'Cideca',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-04-00005: SB.23KV.LIN-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022150', '00000000-0000-4000-b000-000000001166', NULL, 'WO-25-04-00005', 'Reporte de actividades CIDECA 16 al 31 de Marzo -Inspección y poda de línea de distribución de 23 kV -Actividades de mantenimiento en acometidas primarias de 23 kV', 'ID: 205', 'ID: 205',
    'preventive', 'completed', 'medium',
    '2025-03-25',
    '2025-04-01',
    0, '00000000-0000-4000-b000-000000010004',
    'SB.23KV.LIN-01', 'Cideca',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-04-00006: SB.23KV.LIN-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022151', '00000000-0000-4000-b000-000000001166', NULL, 'WO-25-04-00006', 'Reporte de actividades CIDECA 16 al 31 de Marzo -Inspección y poda de línea de distribución de 23 kV -Actividades de mantenimiento en acometidas primarias de 23 kV', 'ID: 206', 'ID: 206',
    'preventive', 'completed', 'medium',
    '2025-03-25',
    '2025-04-01',
    0, '00000000-0000-4000-b000-000000010004',
    'SB.23KV.LIN-01', 'Cideca',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-03-00008: SB.23KV.LIN-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022152', '00000000-0000-4000-b000-000000001166', NULL, 'WO-25-03-00008', 'Reporte de actividades CIDECA 01 al 15 de Marzo -Inspección y poda de línea de distribución de 23 kV -Actividades de mantenimiento en acometidas primarias de 23 kV', 'ID: 207', 'ID: 207',
    'preventive', 'completed', 'medium',
    '2025-03-09',
    '2025-03-16',
    0, '00000000-0000-4000-b000-000000010004',
    'SB.23KV.LIN-01', 'Cideca',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-03-00009: SB.23KV.LIN-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022153', '00000000-0000-4000-b000-000000001166', NULL, 'WO-25-03-00009', 'Reporte de actividades CIDECA 16 al 28 de Febrero -Inspección y poda de línea de distribución de 23 kV -Actividades de mantenimiento en acometidas primarias de 23 kV', 'ID: 208', 'ID: 208',
    'preventive', 'completed', 'medium',
    '2025-02-22',
    '2025-03-01',
    0, '00000000-0000-4000-b000-000000010004',
    'SB.23KV.LIN-01', 'Cideca',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-02-00004: SB.23KV.LIN-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022154', '00000000-0000-4000-b000-000000001166', NULL, 'WO-25-02-00004', 'Reporte de actividades CIDECA 01 al 15 de Febrero -Inspección y poda de línea de distribución de 23 kV -Actividades de mantenimiento en acometidas primarias de 23 kV', 'ID: 209', 'ID: 209',
    'preventive', 'completed', 'medium',
    '2025-02-09',
    '2025-02-16',
    0, '00000000-0000-4000-b000-000000010004',
    'SB.23KV.LIN-01', 'Cideca',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-02-00005: SB.23KV.LIN-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022155', '00000000-0000-4000-b000-000000001166', NULL, 'WO-25-02-00005', 'Reporte de actividades CIDECA 16 al 31 de Enero -Inspección y poda de línea de distribución de 23 kV -Actividades de mantenimiento en acometidas primarias de 23 kV', 'ID: 210', 'ID: 210',
    'preventive', 'completed', 'medium',
    '2025-01-25',
    '2025-02-01',
    0, '00000000-0000-4000-b000-000000010004',
    'SB.23KV.LIN-01', 'Cideca',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-01-00016: SB.23KV.LIN-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022156', '00000000-0000-4000-b000-000000001166', NULL, 'WO-25-01-00016', 'Reporte de actividades CIDECA 01 al 15 de Enero -Inspección y poda de línea de distribución de 23 kV -Actividades de mantenimiento en acometidas primarias de 23 kV', 'ID: 211', 'ID: 211',
    'preventive', 'completed', 'medium',
    '2025-01-09',
    '2025-01-16',
    0, '00000000-0000-4000-b000-000000010004',
    'SB.23KV.LIN-01', 'Cideca',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-01-00017: SB.23KV.LIN-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022157', '00000000-0000-4000-b000-000000001166', NULL, 'WO-25-01-00017', 'Reporte de actividades CIDECA 16 al 31 de Diciembre -Mantenimiento programado de Linea Sustitución de elementos  Limpieza de Elementos. -Inspección y poda de línea de distribución de 23 kV -Actividades de mantenimiento en acometidas primarias de 23 kV', 'ID: 212', 'ID: 212',
    'preventive', 'completed', 'medium',
    '2024-12-25',
    '2025-01-01',
    0, '00000000-0000-4000-b000-000000010004',
    'SB.23KV.LIN-01', 'Cideca',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-12-00013: SB.46kV.TC-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022158', '00000000-0000-4000-b000-000000001131', NULL, 'WO-24-12-00013', 'Pruebas de TCs san Juan Opico Relacion de espira de polaridad Resistencia de devanado Curva de Saturación. Determinación de Error: Magnitud y Fase – Método Indirecto.', 'ID: 213', 'ID: 213',
    'preventive', 'completed', 'medium',
    '2024-12-11',
    '2024-12-18',
    0, NULL,
    'SB.46kV.TC-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-24-12-00014: SB.46kV.TC-04 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022159', '00000000-0000-4000-b000-000000001134', NULL, 'WO-24-12-00014', 'Pruebas Ejecutadas. -Relación de espiras y polaridad. -Resistencia de Devanados. -Curva de saturación. -Determinación de Error: Magnitud y Fase – Método Indirecto.', 'ID: 214', 'ID: 214',
    'preventive', 'completed', 'medium',
    '2024-12-11',
    '2024-12-18',
    0, NULL,
    'SB.46kV.TC-04', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-06-00004: SB.46kV.LIN-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022160', '00000000-0000-4000-b000-000000001165', NULL, 'WO-25-06-00004', 'Informe de actividades del 16 al 31 de mayo 2025. -inspección de línea. -poda de ramas de arboles.', 'ID: 215', 'ID: 215',
    'preventive', 'completed', 'medium',
    '2025-05-25',
    '2025-06-01',
    0, '00000000-0000-4000-b000-000000010004',
    'SB.46kV.LIN-01', 'Cideca',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-03-00010: INF.CIV.MUR-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022161', '00000000-0000-4000-b000-000000001164', NULL, 'WO-25-03-00010', 'Mantenimiento de cerca eléctrica de Sitio. Mes de Marzo Zonas 1 hasta Zona 8. Limpieza de maleza. Revisión de chispa. Revisión de batería. Revisión de sirena. Repáracion de lineas.', 'ID: 216', 'ID: 216',
    'preventive', 'completed', 'medium',
    '2025-03-24',
    '2025-03-31',
    325.0, '00000000-0000-4000-b000-000000010002',
    'INF.CIV.MUR-01', 'JV Sistemas',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-04-00007: INF.CIV.MUR-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022162', '00000000-0000-4000-b000-000000001164', NULL, 'WO-25-04-00007', 'Mantenimiento de cerca eléctrica de Sitio. Mes de Abril Zonas 1 hasta Zona 8. Limpieza de maleza. Revisión de chispa. Revisión de bateria. Revisión de sirena. Repáracion de lineas.', 'ID: 217', 'ID: 217',
    'preventive', 'completed', 'medium',
    '2025-04-23',
    '2025-04-30',
    325.0, '00000000-0000-4000-b000-000000010002',
    'INF.CIV.MUR-01', 'JV Sistemas',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-05-00006: INF.CIV.MUR-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022163', '00000000-0000-4000-b000-000000001164', NULL, 'WO-25-05-00006', 'Mantenimiento de cerca eléctrica de Sitio. Mes de Mayo Zonas 1 hasta Zona 8. Limpieza de maleza. Revisión de chispa. Revisión de batería. Revisión de sirena. Reparación de lineas.', 'ID: 218', 'ID: 218',
    'preventive', 'completed', 'medium',
    '2025-05-24',
    '2025-05-31',
    325.0, '00000000-0000-4000-b000-000000010002',
    'INF.CIV.MUR-01', 'JV Sistemas',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-06-00005: SCI.CBCI.BCI-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022164', '00000000-0000-4000-b000-000000001125', '00000000-0000-4000-b000-000000055035', 'WO-25-06-00005', 'Mtto preventivo de sistema contra incendios.', 'ID: 219', 'ID: 219',
    'preventive', 'completed', 'medium',
    '2025-06-03',
    '2025-06-10',
    1300.0, NULL,
    'SCI.CBCI.BCI-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-08-00001: PSVZ.EXT.POZ-04 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022165', '00000000-0000-4000-b000-000000001170', NULL, 'WO-25-08-00001', 'Se realizo la sustitución de bomba y motor de 100hp en pozo 4. agregar que se colocó motor de 100hp que estaba de media vida.  además, se hizo cambio de variador por un arrancador suave. se está cotizando la reposición de variador .', 'ID: 220', 'ID: 220',
    'corrective', 'completed', 'medium',
    '2025-08-07',
    '2025-08-09',
    1500.0, '00000000-0000-4000-b000-000000010006',
    'PSVZ.EXT.POZ-04', 'MAPOSA',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-08-00002: PSVZ.EXT.POZ-02 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022166', '00000000-0000-4000-b000-000000001168', NULL, 'WO-25-08-00002', 'Mantenimiento preventivo de pozo 2. se identifico que motor de 50 hp esta quemado.', 'ID: 221', 'ID: 221',
    'preventive', 'completed', 'medium',
    '2025-08-04',
    '2025-08-11',
    2950.0, '00000000-0000-4000-b000-000000010006',
    'PSVZ.EXT.POZ-02', 'MAPOSA',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-01-00018: PSVZ.SVDR.BTS-04 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022167', '00000000-0000-4000-b000-000000001090', NULL, 'WO-25-01-00018', 'Matenimiento preventivo bombas de suavizador5 4 y 5.', 'ID: 222', 'ID: 222',
    'preventive', 'completed', 'medium',
    '2025-01-06',
    '2025-01-13',
    2250.0, '00000000-0000-4000-b000-000000010001',
    'PSVZ.SVDR.BTS-04', 'Taller Hernandez',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-08-00003: SB.46kV.TX-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022168', '00000000-0000-4000-b000-000000001127', '00000000-0000-4000-b000-000000055037', 'WO-25-08-00003', 'Informe de servicio de termovacío - Trafo 20MVA SE HBI El documento incluye la siguiente información: •	Descripción detallada del servicio ejecutado •	Protocolo de intervención •	Registro fotográfico del proceso y resultados •	Conclusiones técnicas •	Recomendaciones operativas y de mantenimiento', 'ID: 224', 'ID: 224',
    'preventive', 'completed', 'medium',
    '2025-07-30',
    '2025-08-06',
    0, '00000000-0000-4000-b000-000000010004',
    'SB.46kV.TX-01', 'Cideca',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-09-00001: SB.23KV.LIN-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022169', '00000000-0000-4000-b000-000000001166', NULL, 'WO-25-09-00001', 'Reporte de actividades CIDECA 01 al 15 de Septiembre -Inspección y poda de línea de distribución de 23 kV -Actividades de mantenimiento en acometidas primarias de 23 kV', 'ID: 225', 'ID: 225',
    'preventive', 'completed', 'medium',
    '2025-08-25',
    '2025-09-01',
    0, '00000000-0000-4000-b000-000000010004',
    'SB.23KV.LIN-01', 'Cideca',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-09-00002: SB.46kV.LIN-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022170', '00000000-0000-4000-b000-000000001165', NULL, 'WO-25-09-00002', 'Informe de actividades del 01 al 15 de Septiembre 2025. -inspección de línea. -poda de ramas de arboles.', 'ID: 226', 'ID: 226',
    'preventive', 'completed', 'medium',
    '2025-08-25',
    '2025-09-01',
    0, '00000000-0000-4000-b000-000000010004',
    'SB.46kV.LIN-01', 'Cideca',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-09-00003: PSVZ.EXT.POZ-04 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022171', '00000000-0000-4000-b000-000000001170', NULL, 'WO-25-09-00003', 'Se hizo cambio de motor de bomba. el motor es completamente nuevo, marca franklin electric de 100hp, además se cambió cable de alimentación eléctrica.', 'ID: 227', 'ID: 227',
    'corrective', 'completed', 'medium',
    '2025-09-24',
    '2025-09-26',
    1500.0, '00000000-0000-4000-b000-000000010006',
    'PSVZ.EXT.POZ-04', 'MAPOSA',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-09-00004: PCLD.GDV.TCDL-03 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022172', '00000000-0000-4000-b000-000000001123', NULL, 'WO-25-09-00004', 'Caldera #3 Reparación de tubo central Cambio de 1 tubo de fuego pulmón derecho prueba hidrostáticas 150 PSI.', 'ID: 228', 'ID: 228',
    'corrective', 'completed', 'medium',
    '2025-09-03',
    '2025-09-05',
    900.0, '00000000-0000-4000-b000-000000010007',
    'PCLD.GDV.TCDL-03', 'IMR',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-09-00005: SB.46kV.LIN-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022173', '00000000-0000-4000-b000-000000001165', NULL, 'WO-25-09-00005', 'Informe de actividades del 16 al 30 de Septiembre 2025. -inspección de línea. -poda de ramas de arboles.', 'ID: 229', 'ID: 229',
    'preventive', 'completed', 'medium',
    '2025-09-09',
    '2025-09-16',
    0, '00000000-0000-4000-b000-000000010004',
    'SB.46kV.LIN-01', 'Cideca',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-09-00006: SB.23KV.LIN-01 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022174', '00000000-0000-4000-b000-000000001166', NULL, 'WO-25-09-00006', 'Informe de actividades del 16 al 30 de Septiembre 2025. -inspección de línea. -poda de ramas de arboles.', 'ID: 230', 'ID: 230',
    'corrective', 'completed', 'medium',
    '2025-09-14',
    '2025-09-16',
    0, NULL,
    'SB.23KV.LIN-01', 'nan',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-06-00006: INF.CIV.MUR-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022175', '00000000-0000-4000-b000-000000001164', NULL, 'WO-25-06-00006', 'Mantenimiento de cerca eléctrica de Sitio. Mes de Mayo Zonas 1 hasta Zona 8. Limpieza de maleza. Revisión de chispa. Revisión de batería. Revisión de sirena. Reparación de lineas.', 'ID: 231', 'ID: 231',
    'preventive', 'completed', 'medium',
    '2025-06-23',
    '2025-06-30',
    325.0, '00000000-0000-4000-b000-000000010002',
    'INF.CIV.MUR-01', 'JV Sistemas',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-06-00007: INF.CIV.MUR-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022176', '00000000-0000-4000-b000-000000001164', NULL, 'WO-25-06-00007', 'Mantenimiento de cerca eléctrica de Sitio. Mes de Junio Zonas 1 hasta Zona 8. Limpieza de maleza. Revisión de chispa. Revisión de bateria. Revisión de sirena. Repáracion de lineas.', 'ID: 232', 'ID: 232',
    'preventive', 'completed', 'medium',
    '2025-06-23',
    '2025-06-30',
    325.0, '00000000-0000-4000-b000-000000010002',
    'INF.CIV.MUR-01', 'JV Sistemas',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-07-00001: INF.CIV.MUR-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022177', '00000000-0000-4000-b000-000000001164', NULL, 'WO-25-07-00001', 'Mantenimiento de cerca eléctrica de Sitio. Mes de Julio Zonas 1 hasta Zona 8. Limpieza de maleza. Revisión de chispa. Revisión de bateria. Revisión de sirena. Repáracion de lineas.', 'ID: 233', 'ID: 233',
    'preventive', 'completed', 'medium',
    '2025-07-24',
    '2025-07-31',
    325.0, '00000000-0000-4000-b000-000000010002',
    'INF.CIV.MUR-01', 'JV Sistemas',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-08-00004: INF.CIV.MUR-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022178', '00000000-0000-4000-b000-000000001164', NULL, 'WO-25-08-00004', 'Mantenimiento de cerca eléctrica de Sitio. Mes de Agosto Zonas 1 hasta Zona 8. Limpieza de maleza. Revisión de chispa. Revisión de bateria. Revisión de sirena. Repáracion de lineas.', 'ID: 234', 'ID: 234',
    'preventive', 'completed', 'medium',
    '2025-08-22',
    '2025-08-29',
    325.0, '00000000-0000-4000-b000-000000010002',
    'INF.CIV.MUR-01', 'JV Sistemas',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-LEGACY-02179: PTAR2.DOC.CLR-01 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022179', '00000000-0000-4000-b000-000000001064', '00000000-0000-4000-b000-000000055023', 'WO-LEGACY-02179', 'Mantenimiento Historico', 'ID: 242 | Mantenimiento clarificador frencuencia 2 años, Cambiar corona de bronce', 'ID: 242 | Mantenimiento clarificador frencuencia 2 años, Cambiar corona de bronce',
    'corrective', 'completed', 'medium',
    NULL,
    NULL,
    0, NULL,
    'PTAR2.DOC.CLR-01', 'nan',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-09-00007: INF.CIV.MUR-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022180', '00000000-0000-4000-b000-000000001164', NULL, 'WO-25-09-00007', 'Mantenimiento de cerca eléctrica de Sitio. Mes de Septiembre Zonas 1 hasta Zona 8. Limpieza de maleza. Revisión de chispa. Revisión de bateria. Revisión de sirena. Repáracion de lineas.', 'ID: 243', 'ID: 243',
    'preventive', 'completed', 'medium',
    '2025-09-22',
    '2025-09-29',
    325.0, '00000000-0000-4000-b000-000000010002',
    'INF.CIV.MUR-01', 'JV Sistemas',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-08-00005: SB.23KV.LIN-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022181', '00000000-0000-4000-b000-000000001166', NULL, 'WO-25-08-00005', 'Informe termográfico Linea de distribución de 23 KV Agosto 2025. Elementos a inspeccionar  Estudio termográfico.', 'ID: 244', 'ID: 244',
    'preventive', 'completed', 'medium',
    '2025-08-23',
    '2025-08-30',
    0, '00000000-0000-4000-b000-000000010004',
    'SB.23KV.LIN-01', 'Cideca',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-LEGACY-02182: SB.46kV.INT-01 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022182', '00000000-0000-4000-b000-000000001129', '00000000-0000-4000-b000-000000055039', 'WO-LEGACY-02182', 'Mantenimiento Historico', 'ID: 245 | Pruebas de pureza de Gas', 'ID: 245 | Pruebas de pureza de Gas',
    'corrective', 'completed', 'medium',
    NULL,
    NULL,
    0, NULL,
    'SB.46kV.INT-01', 'nan',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-LEGACY-02183: PTAR1.AA.AE-14 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022183', '00000000-0000-4000-b000-000000001018', NULL, 'WO-LEGACY-02183', 'Mantenimiento Historico', 'ID: 246 | Enviar a reparacion de caja (Programar hasta indicacion gerencial)', 'ID: 246 | Enviar a reparacion de caja (Programar hasta indicacion gerencial)',
    'corrective', 'completed', 'medium',
    NULL,
    NULL,
    0, NULL,
    'PTAR1.AA.AE-14', 'nan',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-LEGACY-02184: PTAR1.AA.AE-02 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022184', '00000000-0000-4000-b000-000000001006', NULL, 'WO-LEGACY-02184', 'Mantenimiento Historico', 'ID: 247 | Programar hasta indicacion gerencial el reemplazo de sellos y sacado de planta', 'ID: 247 | Programar hasta indicacion gerencial el reemplazo de sellos y sacado de planta',
    'corrective', 'completed', 'medium',
    NULL,
    NULL,
    0, NULL,
    'PTAR1.AA.AE-02', 'nan',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-LEGACY-02185: PTAR1.AA.AE-10 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022185', '00000000-0000-4000-b000-000000001014', NULL, 'WO-LEGACY-02185', 'Mantenimiento Historico', 'ID: 248 | enviar a fabricacion o rectificado de aspas (Hasta recibir indicacion gerencial)', 'ID: 248 | enviar a fabricacion o rectificado de aspas (Hasta recibir indicacion gerencial)',
    'corrective', 'completed', 'medium',
    NULL,
    NULL,
    0, NULL,
    'PTAR1.AA.AE-10', 'nan',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-LEGACY-02186: PSVZ.EXT.POZ-01 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022186', '00000000-0000-4000-b000-000000001167', NULL, 'WO-LEGACY-02186', 'Mantenimiento Historico', 'ID: 249 | Extracción de pozo y revision de motor,floculacion y soplado de pozo y video de estado, reemplazar Cable', 'ID: 249 | Extracción de pozo y revision de motor,floculacion y soplado de pozo y video de estado, reemplazar Cable',
    'corrective', 'completed', 'medium',
    NULL,
    NULL,
    0, NULL,
    'PSVZ.EXT.POZ-01', 'nan',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-LEGACY-02187: PSVZ.EXT.POZ-03 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022187', '00000000-0000-4000-b000-000000001169', NULL, 'WO-LEGACY-02187', 'Mantenimiento Historico', 'ID: 250 | Mantenimiento Anual de pozo', 'ID: 250 | Mantenimiento Anual de pozo',
    'corrective', 'completed', 'medium',
    NULL,
    NULL,
    0, NULL,
    'PSVZ.EXT.POZ-03', 'nan',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-LEGACY-02188: SB.46kV.TP-01 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022188', '00000000-0000-4000-b000-000000001176', NULL, 'WO-LEGACY-02188', 'Mantenimiento Historico', 'ID: 251 | Pruebas Anuales segun plan', 'ID: 251 | Pruebas Anuales segun plan',
    'corrective', 'completed', 'medium',
    NULL,
    NULL,
    0, NULL,
    'SB.46kV.TP-01', 'nan',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-LEGACY-02189: PCLD.GDV.TCDL-01 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022189', '00000000-0000-4000-b000-000000001121', NULL, 'WO-LEGACY-02189', 'Mantenimiento Historico', 'ID: 252 | Programar 5 calderas para peritajes en frio', 'ID: 252 | Programar 5 calderas para peritajes en frio',
    'corrective', 'completed', 'medium',
    NULL,
    NULL,
    0, NULL,
    'PCLD.GDV.TCDL-01', 'nan',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-LEGACY-02190: SCI.CBCI.BCI-02 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022190', '00000000-0000-4000-b000-000000001126', '00000000-0000-4000-b000-000000055036', 'WO-LEGACY-02190', 'Mantenimiento Historico', 'ID: 253 | Mantenimiento anual segun programa, cambio de aceite, filtros, verificacion de caudal etc.', 'ID: 253 | Mantenimiento anual segun programa, cambio de aceite, filtros, verificacion de caudal etc.',
    'corrective', 'completed', 'medium',
    NULL,
    NULL,
    0, NULL,
    'SCI.CBCI.BCI-02', 'nan',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-10-00001: PDO.GDO.CHR-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022191', '00000000-0000-4000-b000-000000001076', '00000000-0000-4000-b000-000000055032', 'WO-25-10-00001', 'Mantenimiento preventivo chiller,  inlcuye cambio de aceite , cambio de filtros y cambio de refrigerante. además se hizo el cambio de rubatex.', 'ID: 254', 'ID: 254',
    'preventive', 'completed', 'medium',
    '2025-10-07',
    '2025-10-14',
    1425.0, NULL,
    'PDO.GDO.CHR-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-07-00002: PDO.GDO.GOZ-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022192', '00000000-0000-4000-b000-000000001075', NULL, 'WO-25-07-00002', 'En el archivo de Excel se muestra toda la información del estado actual de los generadores de ozono.', 'ID: 258', 'ID: 258',
    'preventive', 'completed', 'medium',
    '2025-07-07',
    '2025-07-14',
    0, NULL,
    'PDO.GDO.GOZ-01', NULL,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-10-00002: SB.23KV.LIN-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022193', '00000000-0000-4000-b000-000000001166', NULL, 'WO-25-10-00002', 'Informe de termografía en línea de distribución de 23 Kv Se reporta punto de monitores en poste N° 25 Se intervendrá en paro de planta de Diciembre.', 'ID: 259', 'ID: 259',
    'preventive', 'completed', 'medium',
    '2025-10-23',
    '2025-10-30',
    0, '00000000-0000-4000-b000-000000010004',
    'SB.23KV.LIN-01', 'Cideca',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-11-00001: SB.46kV.INT-01 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022194', '00000000-0000-4000-b000-000000001129', '00000000-0000-4000-b000-000000055039', 'WO-25-11-00001', 'Cambio de gas SF6, Interruptor en San Juan Opico. se realizo cambio de gas por alta contaminación de SO2.', 'ID: 260', 'ID: 260',
    'corrective', 'completed', 'medium',
    '2025-11-02',
    '2025-11-04',
    0, NULL,
    'SB.46kV.INT-01', 'nan',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-12-00001: PTAR1.AA.AE-06 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022195', '00000000-0000-4000-b000-000000001010', NULL, 'WO-25-12-00001', 'Se rehubico aerador 6 montado en fase 2 u se coloco en posicion 2 fase 1 planta 1. aclarar que son equipos que ya han estado trabajando.', 'ID: 261', 'ID: 261',
    'preventive', 'completed', 'medium',
    '2025-11-25',
    '2025-12-02',
    0, NULL,
    'PTAR1.AA.AE-06', 'nan',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-12-00002: PTAR1.AA.AE-07 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022196', '00000000-0000-4000-b000-000000001011', NULL, 'WO-25-12-00002', 'Se reubico aerador 7 posicion 7 fase 2, en posicion 1 fase 1 . aclarar que son aeradores que han estado trabajando. el costo fue unicamente de servicio de grua.', 'ID: 262', 'ID: 262',
    'preventive', 'completed', 'medium',
    '2025-11-25',
    '2025-12-02',
    0, NULL,
    'PTAR1.AA.AE-07', 'nan',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-12-00003: PTAR1.AA.AE-02 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022197', '00000000-0000-4000-b000-000000001006', NULL, 'WO-25-12-00003', 'Aerador 2 se saco para mtto preventivo y reparacion de caja reductorar por desacople de eje.', 'ID: 263', 'ID: 263',
    'preventive', 'completed', 'medium',
    '2025-11-25',
    '2025-12-02',
    0, '00000000-0000-4000-b000-000000010001',
    'PTAR1.AA.AE-02', 'Taller Hernandez',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-12-00004: PTAR1.AA.AE-14 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022198', '00000000-0000-4000-b000-000000001018', NULL, 'WO-25-12-00004', 'Aerador 14 se saco para el mantenimiento preventivo.', 'ID: 264', 'ID: 264',
    'preventive', 'completed', 'medium',
    '2025-11-25',
    '2025-12-02',
    0, '00000000-0000-4000-b000-000000010001',
    'PTAR1.AA.AE-14', 'Taller Hernandez',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-26-01-00001: PTAR2.DOC.CLR-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022199', '00000000-0000-4000-b000-000000001064', '00000000-0000-4000-b000-000000055023', 'WO-26-01-00001', 'Pulido y limpieza de estructura Mtto de caja reductora  Inspeccion de corona y tornillo Medicion de motores', 'ID: 265', 'ID: 265',
    'preventive', 'completed', 'medium',
    '2025-12-29',
    '2026-01-05',
    19500.0, '00000000-0000-4000-b000-000000010000',
    'PTAR2.DOC.CLR-01', 'SIMD',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-26-01-00002: PTAR2.DOC.MTL-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022200', '00000000-0000-4000-b000-000000001066', '00000000-0000-4000-b000-000000055025', 'WO-26-01-00002', 'Remosion de pintura  Sustitucion de laminas oxidadas  Remosion de oxido  Pintura general  Cambio de baleros, retenedores y aceite de caja', 'ID: 266', 'ID: 266',
    'preventive', 'completed', 'medium',
    '2025-12-30',
    '2026-01-06',
    4200.0, '00000000-0000-4000-b000-000000010001',
    'PTAR2.DOC.MTL-01', 'Taller Hernandez',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-12-00005: PCLD.GDV.TCDL-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022201', '00000000-0000-4000-b000-000000001121', NULL, 'WO-25-12-00005', 'Reporte de Gases  Peritaje  Mantenimiento anual.  Limpieza lado fuego lado agua Cambio de empaques lado fuego y lado agua Resane de refractarios Cambio de fibra ceramica  Revision electrica  Comprobacion de paros por falla o seguridad', 'ID: 267', 'ID: 267',
    'preventive', 'completed', 'medium',
    '2025-12-21',
    '2025-12-28',
    5280.0, '00000000-0000-4000-b000-000000010007',
    'PCLD.GDV.TCDL-01', 'IMR',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-12-00006: PCLD.GDV.TCDL-02 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022202', '00000000-0000-4000-b000-000000001122', NULL, 'WO-25-12-00006', 'Reporte de Gases  Peritaje  Mantenimiento anual.  Limpieza lado fuego lado agua Cambio de empaques lado fuego y lado agua Resane de refractarios Cambio de fibra ceramica  Revision electrica  Comprobacion de paros por falla o seguridad', 'ID: 268', 'ID: 268',
    'preventive', 'completed', 'medium',
    '2025-12-21',
    '2025-12-28',
    5280.0, '00000000-0000-4000-b000-000000010007',
    'PCLD.GDV.TCDL-02', 'IMR',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-12-00007: PCLD.GDV.TCDL-03 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022203', '00000000-0000-4000-b000-000000001123', NULL, 'WO-25-12-00007', 'Reporte de Gases  Peritaje  Mantenimiento anual.  Limpieza lado fuego lado agua Cambio de empaques lado fuego y lado agua Resane de refractarios Cambio de fibra ceramica  Revision electrica  Comprobacion de paros por falla o seguridad', 'ID: 269', 'ID: 269',
    'preventive', 'completed', 'medium',
    '2025-12-21',
    '2025-12-28',
    5280.0, '00000000-0000-4000-b000-000000010007',
    'PCLD.GDV.TCDL-03', 'IMR',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-12-00008: PCLD.GDV.TCDL-04 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022204', '00000000-0000-4000-b000-000000001124', NULL, 'WO-25-12-00008', 'Reporte de Gases  Peritaje  Mantenimiento anual.  Limpieza lado fuego lado agua Cambio de empaques lado fuego y lado agua Resane de refractarios Cambio de fibra ceramica  Revision electrica  Comprobacion de paros por falla o seguridad', 'ID: 270', 'ID: 270',
    'preventive', 'completed', 'medium',
    '2025-12-21',
    '2025-12-28',
    5280.0, '00000000-0000-4000-b000-000000010007',
    'PCLD.GDV.TCDL-04', 'IMR',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-12-00009: PCLD.GLP.VAP-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022205', '00000000-0000-4000-b000-000000001137', NULL, 'WO-25-12-00009', 'Mantenimiento de Unidades de vaporización de GLP, perteneciente a Tropigas de El Salvador.', 'ID: 272', 'ID: 272',
    'preventive', 'completed', 'medium',
    '2025-12-22',
    '2025-12-29',
    0.0, NULL,
    'PCLD.GLP.VAP-01', 'nan',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-26-01-00003: PCLD.GLP.VAP-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022206', '00000000-0000-4000-b000-000000001137', NULL, 'WO-26-01-00003', 'Prueba de elementos de seguridad Anual', 'ID: 273', 'ID: 273',
    'preventive', 'completed', 'medium',
    '2026-01-15',
    '2026-01-22',
    0.0, NULL,
    'PCLD.GLP.VAP-01', 'nan',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-26-02-00001: PCLD.GLP.TAN-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022207', '00000000-0000-4000-b000-000000001147', NULL, 'WO-26-02-00001', 'Prueba de fugas de tanques y revision general de tanques de GLP de tropigas', 'ID: 274', 'ID: 274',
    'preventive', 'completed', 'medium',
    '2026-02-15',
    '2026-02-22',
    0.0, NULL,
    'PCLD.GLP.TAN-01', 'nan',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-11-00002: PSVZ.EXT.POZ-01 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022208', '00000000-0000-4000-b000-000000001167', NULL, 'WO-25-11-00002', 'Mantenimiento correctivo de pozo por bomba y motor fallados debido a oxido/corrocion.  Se reemplazo bomba y motor, se hizo empalme de cable', 'ID: 275', 'ID: 275',
    'corrective', 'completed', 'medium',
    '2025-11-07',
    '2025-11-09',
    5000.0, '00000000-0000-4000-b000-000000010006',
    'PSVZ.EXT.POZ-01', 'MAPOSA',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-26-01-00004: SB.46kV.TX-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022209', '00000000-0000-4000-b000-000000001127', '00000000-0000-4000-b000-000000055037', 'WO-26-01-00004', 'Informe de pruebas electricas y Gases Anual (Luego de termovacio)', 'ID: 276', 'ID: 276',
    'preventive', 'completed', 'medium',
    '2025-12-25',
    '2026-01-01',
    2800.0, '00000000-0000-4000-b000-000000010008',
    'SB.46kV.TX-01', 'Energetica',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-26-02-00002: SB.46kV.LIN-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022210', '00000000-0000-4000-b000-000000001165', NULL, 'WO-26-02-00002', 'Termografia de Rutina Febrero 2026 Bahias 46kV', 'ID: 277', 'ID: 277',
    'preventive', 'completed', 'medium',
    '2026-02-10',
    '2026-02-17',
    0.0, '00000000-0000-4000-b000-000000010008',
    'SB.46kV.LIN-01', 'Energetica',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-04-00008: PTAR2.DOC.CTR-01 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022211', '00000000-0000-4000-b000-000000001057', NULL, 'WO-25-04-00008', 'Por falla electrica en contactor, se cambio contactor y se verifico circuito de control', 'ID: 278', 'ID: 278',
    'corrective', 'completed', 'medium',
    '2025-04-19',
    '2025-04-21',
    0, '00000000-0000-4000-b000-000000010005',
    'PTAR2.DOC.CTR-01', 'Kaeser',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-25-10-00003: PTAR2.DOC.CTR-01 (preventive)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022212', '00000000-0000-4000-b000-000000001057', NULL, 'WO-25-10-00003', 'Mantenimiento regular ASD40', 'ID: 279', 'ID: 279',
    'preventive', 'completed', 'medium',
    '2025-10-10',
    '2025-10-17',
    0, '00000000-0000-4000-b000-000000010005',
    'PTAR2.DOC.CTR-01', 'Kaeser',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-LEGACY-02213: PTAR1.AA.MI-01 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022213', '00000000-0000-4000-b000-000000001019', '00000000-0000-4000-b000-000000055004', 'WO-LEGACY-02213', 'Mantenimiento Historico', 'ID: 280 | Necesita embobinado y cambio de rodamientos', 'ID: 280 | Necesita embobinado y cambio de rodamientos',
    'corrective', 'completed', 'medium',
    NULL,
    NULL,
    0, NULL,
    'PTAR1.AA.MI-01', 'nan',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-LEGACY-02214: PTAR2.AA.AE-11 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022214', '00000000-0000-4000-b000-000000001052', NULL, 'WO-LEGACY-02214', 'Mantenimiento Historico', 'ID: 281 | Mantenimiento de 2 años ultima fecha 2022', 'ID: 281 | Mantenimiento de 2 años ultima fecha 2022',
    'corrective', 'completed', 'medium',
    NULL,
    NULL,
    0, NULL,
    'PTAR2.AA.AE-11', 'nan',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-LEGACY-02215: PTAR2.RL.RASP-02 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022215', '00000000-0000-4000-b000-000000001034', '00000000-0000-4000-b000-000000055019', 'WO-LEGACY-02215', 'Mantenimiento Historico', 'ID: 282 | Se necesita embobinar y sustitucion de sello.', 'ID: 282 | Se necesita embobinar y sustitucion de sello.',
    'corrective', 'completed', 'medium',
    NULL,
    NULL,
    0, NULL,
    'PTAR2.RL.RASP-02', 'nan',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- WO-LEGACY-02216: PTAR2.RL.TSP-01 (corrective)
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '00000000-0000-4000-b000-000000022216', '00000000-0000-4000-b000-000000001032', '00000000-0000-4000-b000-000000055017', 'WO-LEGACY-02216', 'Mantenimiento Historico', 'ID: 283 | Disponible pero con fuga de aceite, enviar a mtto regular y rebobinado de motor', 'ID: 283 | Disponible pero con fuga de aceite, enviar a mtto regular y rebobinado de motor',
    'corrective', 'completed', 'medium',
    NULL,
    NULL,
    0, NULL,
    'PTAR2.RL.TSP-01', 'nan',
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- REHABILITAR triggers de usuario después de carga masiva
-- ============================================================================

ALTER TABLE public.work_orders ENABLE TRIGGER USER;