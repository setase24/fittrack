-- ============================================
-- FITTRACK — Schema completo para Supabase
-- Ejecutar en: Supabase > SQL Editor
-- ============================================

-- Perfil de usuario
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  nombre text not null,
  edad integer,
  altura_cm integer,
  peso_inicial_kg decimal(5,2),
  meta_peso_kg decimal(5,2),
  meta_calorias integer default 1600,
  nivel_actividad text default 'moderado',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Registros de peso
create table peso_registros (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  peso_kg decimal(5,2) not null,
  porcentaje_grasa decimal(4,2),
  masa_muscular_kg decimal(5,2),
  cintura_cm decimal(5,2),
  cadera_cm decimal(5,2),
  fecha date default current_date,
  notas text,
  created_at timestamp with time zone default now()
);

-- Comidas
create table comidas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  tipo_comida text not null check (tipo_comida in ('desayuno','almuerzo','cena','snack','otro')),
  nombre_plato text not null,
  ingredientes text,
  calorias integer not null,
  proteina_g decimal(6,2),
  carbos_g decimal(6,2),
  grasas_g decimal(6,2),
  analizado_por_ia boolean default false,
  fecha date default current_date,
  hora time default current_time,
  created_at timestamp with time zone default now()
);

-- Entrenamientos
create table entrenamientos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  tipo text not null check (tipo in ('gym','caminadora','futbol','baile','spinning','otro')),
  subtipo text,
  hora_inicio time,
  hora_fin time,
  duracion_min integer,
  calorias_quemadas integer,
  notas text,
  fecha date default current_date,
  created_at timestamp with time zone default now()
);

-- Ejercicios dentro de un entreno de gym
create table ejercicios (
  id uuid default gen_random_uuid() primary key,
  entrenamiento_id uuid references entrenamientos(id) on delete cascade,
  nombre text not null,
  series integer,
  repeticiones integer,
  peso_kg decimal(5,2),
  orden integer default 1
);

-- Intervalos de caminadora
create table intervalos_caminadora (
  id uuid default gen_random_uuid() primary key,
  entrenamiento_id uuid references entrenamientos(id) on delete cascade,
  orden integer not null,
  duracion_min integer not null,
  velocidad_kmh decimal(4,2),
  tipo text check (tipo in ('correr','caminar','descanso')),
  created_at timestamp with time zone default now()
);

-- Registro de agua
create table agua_registros (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  ml integer not null default 250,
  fecha date default current_date,
  hora time default current_time,
  created_at timestamp with time zone default now()
);

-- Pasos diarios (del podómetro pasivo)
create table pasos_diarios (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  pasos integer not null default 0,
  fecha date default current_date,
  unique(user_id, fecha)
);

-- ============================================
-- ROW LEVEL SECURITY — solo tú ves tus datos
-- ============================================
alter table profiles enable row level security;
alter table peso_registros enable row level security;
alter table comidas enable row level security;
alter table entrenamientos enable row level security;
alter table ejercicios enable row level security;
alter table intervalos_caminadora enable row level security;
alter table agua_registros enable row level security;
alter table pasos_diarios enable row level security;

-- Policies: usuario solo accede a sus propios datos
create policy "usuario ve su perfil" on profiles for all using (auth.uid() = id);
create policy "usuario ve su peso" on peso_registros for all using (auth.uid() = user_id);
create policy "usuario ve sus comidas" on comidas for all using (auth.uid() = user_id);
create policy "usuario ve sus entrenamientos" on entrenamientos for all using (auth.uid() = user_id);
create policy "usuario ve sus ejercicios" on ejercicios for all using (
  auth.uid() = (select user_id from entrenamientos where id = entrenamiento_id)
);
create policy "usuario ve sus intervalos" on intervalos_caminadora for all using (
  auth.uid() = (select user_id from entrenamientos where id = entrenamiento_id)
);
create policy "usuario ve su agua" on agua_registros for all using (auth.uid() = user_id);
create policy "usuario ve sus pasos" on pasos_diarios for all using (auth.uid() = user_id);

-- Trigger: actualizar updated_at en profiles
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();
