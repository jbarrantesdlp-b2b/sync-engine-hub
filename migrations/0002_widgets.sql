create table if not exists saved_widgets (
  id text primary key,
  user_id text not null,
  name text not null,
  mode text not null,
  accent text not null,
  font text not null,
  size text not null,
  effect text not null,
  created_at timestamptz not null default now()
);

create index if not exists saved_widgets_user_idx on saved_widgets (user_id);
