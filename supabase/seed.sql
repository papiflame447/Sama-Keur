-- Run after creating auth users and replacing UUIDs
insert into public.profiles (id, role, full_name, phone)
values
  ('00000000-0000-0000-0000-000000000001', 'owner', 'Owner Demo', '+221700000001'),
  ('00000000-0000-0000-0000-000000000002', 'worker', 'Worker Demo', '+221700000002')
on conflict (id) do nothing;

insert into public.properties (id, owner_id, address, rent_amount, house_rules, ai_knowledge)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Almadies, Dakar', 350000, 'No smoking. Quiet hours after 22:00.', 'Wi-Fi: SK-Guest / password placeholder')
on conflict (id) do nothing;

insert into public.worker_access (owner_id, worker_id)
values ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002')
on conflict do nothing;
