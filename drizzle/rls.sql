-- Row Level Security: isola os dados de cada marca (tenant).
-- Rodar depois das migrations do Drizzle (Supabase > SQL Editor ou psql).
--
-- Regra: um usuário só enxerga linhas dos tenants em que tem membership.
-- A equipe da TuManera (tenant principal) enxerga também os tenants filhos (collabs).
-- O servidor do hub usa a service role para webhooks (WhatsApp, pagamentos), que ignora RLS.

create or replace function public.user_tenant_ids() returns setof uuid
language sql stable security definer set search_path = public as $$
  select m.tenant_id from memberships m where m.user_id = auth.uid()
  union
  select t.id from tenants t
  join memberships m on m.tenant_id = t.parent_id
  where m.user_id = auth.uid() and m.role in ('owner', 'admin', 'atendimento', 'producao');
$$;

do $$
declare tbl text;
begin
  foreach tbl in array array[
    'products', 'product_variants', 'print_areas', 'artworks', 'customization_requests',
    'proposals', 'contacts', 'conversations', 'messages', 'deals', 'orders', 'order_items',
    'fiscal_documents'
  ] loop
    execute format('alter table %I enable row level security', tbl);
    execute format('drop policy if exists tenant_isolation on %I', tbl);
    execute format(
      'create policy tenant_isolation on %I for all using (tenant_id in (select public.user_tenant_ids())) with check (tenant_id in (select public.user_tenant_ids()))',
      tbl
    );
  end loop;
end $$;

alter table tenants enable row level security;
drop policy if exists tenant_read on tenants;
create policy tenant_read on tenants for select using (id in (select public.user_tenant_ids()));

alter table memberships enable row level security;
drop policy if exists membership_read on memberships;
create policy membership_read on memberships for select using (tenant_id in (select public.user_tenant_ids()));

-- Catálogo público das lojas: produtos ativos podem ser lidos por visitantes anônimos.
drop policy if exists public_catalog on products;
create policy public_catalog on products for select to anon using (active);
drop policy if exists public_variants on product_variants;
create policy public_variants on product_variants for select to anon using (true);
drop policy if exists public_print_areas on print_areas;
create policy public_print_areas on print_areas for select to anon using (true);
